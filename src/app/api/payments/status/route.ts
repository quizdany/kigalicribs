import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { checkPaymentStatus } from '@/lib/payments'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Create Supabase client with user's token
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
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const transactionId = searchParams.get('transactionId')

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Missing transactionId parameter' },
        { status: 400 }
      )
    }

    // Get payment from database
    const { data: payment, error: dbError } = await supabase
      .from('payments')
      .select('*')
      .eq('transaction_id', transactionId)
      .eq('user_id', user.id)
      .single()

    if (dbError || !payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      )
    }

    // If already completed or failed, return cached status
    if (payment.status === 'completed' || payment.status === 'failed') {
      return NextResponse.json({
        success: true,
        payment: {
          id: payment.id,
          status: payment.status,
          amount: payment.amount,
          provider: payment.provider,
          updatedAt: payment.updated_at
        }
      })
    }

    // Check status with provider
    const currentStatus = await checkPaymentStatus(transactionId, payment.provider)

    // Update database if status changed
    if (currentStatus !== payment.status) {
      const { error: updateError } = await supabase
        .from('payments')
        .update({
          status: currentStatus,
          metadata: {
            ...payment.metadata,
            status_checked_at: new Date().toISOString(),
            status_history: [
              ...(payment.metadata?.status_history || []),
              { from: payment.status, to: currentStatus, at: new Date().toISOString() }
            ]
          }
        })
        .eq('id', payment.id)

      if (updateError) {
        console.error('Failed to update payment status:', updateError)
      }

      // If payment completed, handle post-payment actions
      if (currentStatus === 'completed') {
        await handleCompletedPayment(payment, supabase)
      }
    }

    return NextResponse.json({
      success: true,
      payment: {
        id: payment.id,
        status: currentStatus,
        amount: payment.amount,
        provider: payment.provider,
        purpose: payment.purpose,
        updatedAt: new Date().toISOString()
      }
    })
  } catch (error: any) {
    console.error('Payment status check error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle post-payment actions
async function handleCompletedPayment(payment: any, supabase: any) {
  try {
    const { user_id, purpose, property_id } = payment

    switch (purpose) {
      case 'unlimited_contact_access':
        // Create unlimited contact access subscription
        await supabase.from('premium_users').insert({
          user_id,
          subscription_type: 'unlimited_contact_access',
          starts_at: new Date().toISOString(),
          expires_at: null, // No expiry - lifetime access
          is_active: true,
          payment_id: payment.id
        })
        console.log(`Unlimited contact access granted to user ${user_id}`)
        break

      case 'verified_listing':
      case 'premium_verified_listing':
        if (!property_id) {
          console.error('Property ID missing for listing payment')
          break
        }

        // Create verification request
        await supabase.from('property_verifications').insert({
          property_id,
          landlord_id: user_id,
          payment_id: payment.id,
          verification_type: purpose === 'verified_listing' ? 'verified' : 'premium_verified',
          status: 'pending',
          requested_at: new Date().toISOString()
        })

        // Update property status to pending verification (listing_type stays 'basic' until admin approves)
        await supabase
          .from('properties')
          .update({
            verification_status: 'pending'
          })
          .eq('id', property_id)

        console.log(`Verification request created for property ${property_id}`)
        break

      case 'listing_refresh':
        if (!property_id) {
          console.error('Property ID missing for refresh payment')
          break
        }

        // Bump to top for 7 days
        const { data: property } = await supabase
          .from('properties')
          .select('refresh_count')
          .eq('id', property_id)
          .single()

        await supabase
          .from('properties')
          .update({
            refresh_count: (property?.refresh_count || 0) + 1,
            updated_at: new Date().toISOString() // This bumps it to top
          })
          .eq('id', property_id)

        console.log(`Property ${property_id} refreshed`)
        break

      case 'listing_extension':
        if (!property_id) {
          console.error('Property ID missing for extension payment')
          break
        }

        // Extend validity by 3 months
        const { data: currentProperty } = await supabase
          .from('properties')
          .select('listing_expires_at')
          .eq('id', property_id)
          .single()

        const currentExpiry = currentProperty?.listing_expires_at 
          ? new Date(currentProperty.listing_expires_at)
          : new Date()
        
        const newExpiry = new Date(currentExpiry.getTime())
        newExpiry.setMonth(newExpiry.getMonth() + 3)

        await supabase
          .from('properties')
          .update({
            listing_expires_at: newExpiry.toISOString()
          })
          .eq('id', property_id)

        console.log(`Property ${property_id} validity extended to ${newExpiry.toISOString()}`)
        break

      case 'contact_unlock':
        // Legacy - now handled by free limits + unlimited access
        // Could create unlock record if property_id provided
        if (property_id) {
          await supabase.from('contact_unlocks').insert({
            user_id,
            property_id,
            payment_id: payment.id
          })
        }
        break

      default:
        console.log(`Unknown payment purpose: ${purpose}`)
    }

    console.log(`Payment ${payment.id} completed successfully for user ${user_id}`)
  } catch (error) {
    console.error('Error handling completed payment:', error)
  }
}
