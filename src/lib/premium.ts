import { createClient } from '@/lib/supabase'

/**
 * Check if a user has an active premium subscription
 */
export async function checkPremiumStatus(userId: string): Promise<boolean> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('premium_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return false
    }

    return true
  } catch (error) {
    console.error('Premium status check error:', error)
    return false
  }
}

/**
 * Get premium subscription details
 */
export async function getPremiumDetails(userId: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('premium_users')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      subscriptionType: data.subscription_type,
      startsAt: data.starts_at,
      expiresAt: data.expires_at,
      isActive: data.is_active,
      daysRemaining: Math.ceil(
        (new Date(data.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    }
  } catch (error) {
    console.error('Premium details fetch error:', error)
    return null
  }
}

/**
 * Get user's payment history
 */
export async function getPaymentHistory(userId: string) {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Payment history error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Payment history fetch error:', error)
    return []
  }
}
