import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { checkPaymentStatus } from '@/lib/payments'

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const supabase = createClient()
    
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
    const { user_id, purpose } = payment

    // Handle premium subscriptions
    if (purpose === 'premium_monthly' || purpose === 'premium_yearly') {
      const duration = purpose === 'premium_monthly' ? 30 : 365
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + duration)

      // Check if user already has active premium
      const { data: existing } = await supabase
        .from('premium_users')
        .select('*')
        .eq('user_id', user_id)
        .eq('is_active', true)
        .single()

      if (existing) {
        // Extend existing subscription
        const currentExpiry = new Date(existing.expires_at)
        const newExpiry = new Date(currentExpiry.getTime())
        newExpiry.setDate(newExpiry.getDate() + duration)

        await supabase
          .from('premium_users')
          .update({
            expires_at: newExpiry.toISOString(),
            subscription_type: purpose === 'premium_yearly' ? 'yearly' : 'monthly',
            payment_id: payment.id
          })
          .eq('id', existing.id)
      } else {
        // Create new premium subscription
        await supabase.from('premium_users').insert({
          user_id,
          subscription_type: purpose === 'premium_yearly' ? 'yearly' : 'monthly',
          starts_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString(),
          is_active: true,
          payment_id: payment.id
        })
      }
    }

    // Handle contact unlocks - could track in separate table if needed
    // Handle featured listings - could update properties table

    console.log(`Payment ${payment.id} completed successfully for user ${user_id}`)
  } catch (error) {
    console.error('Error handling completed payment:', error)
  }
}
