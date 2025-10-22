import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

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
    const { count: unlockCount } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const usedFreeUnlocks = unlockCount || 0
    const freeUnlocksLimit = 3
    const remainingFreeUnlocks = Math.max(0, freeUnlocksLimit - usedFreeUnlocks)

    // Check if user has unlimited access
    const { data: premiumUser } = await supabase
      .from('premium_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscription_type', 'unlimited_contact_access')
      .eq('is_active', true)
      .single()

    const hasUnlimitedAccess = premiumUser !== null

    return NextResponse.json({
      success: true,
      data: {
        usedFreeUnlocks,
        freeUnlocksLimit,
        remainingFreeUnlocks,
        hasUnlimitedAccess,
        unlimitedAccessPrice: 10000, // RWF
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
