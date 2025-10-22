import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { initiatePayment, getPricing, PaymentPurpose, PaymentProvider } from '@/lib/payments'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient()
    
    // Set the session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const body = await req.json()
    const { phoneNumber, purpose, provider } = body

    // Validate input
    if (!phoneNumber || !purpose || !provider) {
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
      'premium_monthly',
      'premium_yearly',
      'contact_unlock',
      'featured_listing'
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
      return NextResponse.json(
        { success: false, error: 'Invalid pricing configuration' },
        { status: 500 }
      )
    }

    // Initiate payment with provider
    const paymentResponse = await initiatePayment({
      amount,
      phoneNumber,
      purpose: purpose as PaymentPurpose,
      provider: provider as PaymentProvider
    })

    if (!paymentResponse.success) {
      return NextResponse.json(
        { success: false, error: paymentResponse.error || 'Payment initiation failed' },
        { status: 400 }
      )
    }

    // Save payment record to database
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry

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
      })
      .select()
      .single()

    if (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { success: false, error: 'Failed to save payment record' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        transactionId: payment.transaction_id,
        amount: payment.amount,
        status: payment.status,
        provider: payment.provider,
        message: 'Payment initiated. Please check your phone to complete the transaction.'
      }
    })
  } catch (error: any) {
    console.error('Payment initiation error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
