import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { isEntitlementActive } from '@/lib/marketplace-policy'

/**
 * Get user's contact unlock status
 * Returns: free unlocks used, remaining, and unlimited access status
 */
export async function GET(req: Request) {
  try {
    // Get auth token from header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with user's token
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    })

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Count how many properties user has unlocked
    const { count: unlockCount, error: unlockError } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (unlockError) return NextResponse.json({ success: false, error: 'Unable to check contact access.' }, { status: 503 })

    const usedFreeUnlocks = unlockCount || 0
    const freeUnlocksLimit = 3
    const remainingFreeUnlocks = Math.max(0, freeUnlocksLimit - usedFreeUnlocks)

    // Check if user has unlimited access
    const { data: premiumUser, error: premiumError } = await supabase
      .from('premium_users')
      .select('is_active, expires_at')
      .eq('user_id', user.id)
      .eq('subscription_type', 'unlimited_contact_access')
      .eq('is_active', true)
      .maybeSingle()

    if (premiumError) return NextResponse.json({ success: false, error: 'Unable to check contact plan.' }, { status: 503 })

    const hasUnlimitedAccess = !!premiumUser && isEntitlementActive({ isActive: premiumUser.is_active, expiresAt: premiumUser.expires_at })

    return NextResponse.json({
      success: true,
      data: {
        usedFreeUnlocks,
        freeUnlocksLimit,
        remainingFreeUnlocks,
        hasUnlimitedAccess,
        unlimitedAccessPrice: 10000, // Current configured plan price in RWF.
        canUnlock: hasUnlimitedAccess || remainingFreeUnlocks > 0
      }
    })
  } catch (err) {
    console.error('Contact unlock status error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
