import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { initiatePayment, getPricing, PaymentPurpose, PaymentProvider } from '@/lib/payments'

export async function POST(req: NextRequest) {
  console.log('Payment API called')
  
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('Authorization header missing or invalid')
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with user's token for server-side operations
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    )
    
    // Verify the user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      console.log('User authentication failed:', authError?.message)
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    console.log('User authenticated:', user.id)

    const body = await req.json()
    const { phoneNumber, purpose, provider } = body

    console.log('Payment request data:', { phoneNumber, purpose, provider })

    // Validate input
    if (!phoneNumber || !purpose || !provider) {
      console.log('Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phoneNumber, purpose, provider' },
        { status: 400 }
      )
    }

    if (!['momo', 'airtel'].includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider. Must be "momo" or "airtel"' },
        { status: 400 }
      )
    }

    const validPurposes: PaymentPurpose[] = [
      'verified_listing',
      'premium_verified_listing',
      'listing_refresh',
      'listing_extension',
      'unlimited_contact_access'
    ]
    if (!validPurposes.includes(purpose as PaymentPurpose)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment purpose' },
        { status: 400 }
      )
    }

    // Get pricing
    const amount = getPricing(purpose as PaymentPurpose)
    if (!amount) {
      console.log('Invalid pricing configuration for purpose:', purpose)
      return NextResponse.json(
        { success: false, error: 'Invalid pricing configuration' },
        { status: 500 }
      )
    }

    console.log('Initiating payment with amount:', amount)

    // Initiate payment with provider
    const paymentResponse = await initiatePayment({
      amount,
      phoneNumber,
      purpose: purpose as PaymentPurpose,
      provider: provider as PaymentProvider
    })

    console.log('Payment provider response:', paymentResponse)

    if (!paymentResponse.success) {
      console.log('Payment initiation failed:', paymentResponse.error)
      return NextResponse.json(
        { success: false, error: paymentResponse.error || 'Payment initiation failed' },
        { status: 400 }
      )
    }

    // Save payment record to database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

    console.log('Saving payment to database...')

    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount,
        currency: 'RWF',
        provider,
        phone_number: phoneNumber,
        status: paymentResponse.status,
        transaction_id: paymentResponse.transactionId,
        external_reference: paymentResponse.externalReference,
        purpose,
        expires_at: expiresAt.toISOString(),
        metadata: {
          initiated_at: new Date().toISOString(),
          provider_response: paymentResponse.message
        }
      } as any)
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save payment record. The payments table may not exist.' },
        { status: 500 }
      )
    }

    console.log('Payment saved successfully:', payment)

    return NextResponse.json({
      success: true,
      payment: {
        id: (payment as any).id,
        transactionId: (payment as any).transaction_id,
        amount: (payment as any).amount,
        status: (payment as any).status,
        provider: (payment as any).provider,
        message: 'Payment initiated. Please check your phone to complete the transaction.'
      }
    })
  } catch (error: any) {
    console.error('Payment initiation error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      error: error
    })
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}