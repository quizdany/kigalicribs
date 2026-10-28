import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Cron Job API to handle listing expiry and downgrades
 * This should be called periodically (e.g., daily) by a cron service
 * POST /api/cron/expire-listings
 * Requires: CRON_SECRET environment variable for security
 */
export async function POST(req: Request) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase admin client (service role)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey)

    const now = new Date().toISOString()
    const results = {
      expiredListings: 0,
      expiredFeatured: 0,
      expiredPriority: 0,
      deactivatedPremiumUsers: 0
    }

    // 1. Downgrade expired listings to basic
    const { data: expiredListings } = await supabase
      .from('properties')
      .select('id, listing_type, verification_status')
      .lt('listing_expires_at', now)
      .in('verification_status', ['verified'])

    if (expiredListings && expiredListings.length > 0) {
      const { error } = await supabase
        .from('properties')
        .update({
          listing_type: 'basic',
          verification_status: 'none',
          verified_at: null
        })
        .lt('listing_expires_at', now)
        .in('verification_status', ['verified'])

      if (!error) {
        results.expiredListings = expiredListings.length
      }
    }

    // 2. Remove featured status from expired featured listings
    const { data: expiredFeatured } = await supabase
      .from('properties')
      .select('id')
      .lt('featured_until', now)
      .eq('featured', true)

    if (expiredFeatured && expiredFeatured.length > 0) {
      const { error } = await supabase
        .from('properties')
        .update({
          featured: false,
          featured_until: null
        })
        .lt('featured_until', now)
        .eq('featured', true)

      if (!error) {
        results.expiredFeatured = expiredFeatured.length
      }
    }

    // 3. Remove priority status from expired priority listings
    const { data: expiredPriority } = await supabase
      .from('properties')
      .select('id')
      .lt('priority_until', now)
      .not('priority_until', 'is', null)

    if (expiredPriority && expiredPriority.length > 0) {
      const { error } = await supabase
        .from('properties')
        .update({
          priority_until: null
        })
        .lt('priority_until', now)
        .not('priority_until', 'is', null)

      if (!error) {
        results.expiredPriority = expiredPriority.length
      }
    }

    // 4. Deactivate expired premium users (if we add expiry in future)
    const { data: expiredPremium } = await supabase
      .from('premium_users')
      .select('id')
      .lt('expires_at', now)
      .eq('is_active', true)
      .not('expires_at', 'is', null)

    if (expiredPremium && expiredPremium.length > 0) {
      const { error } = await supabase
        .from('premium_users')
        .update({
          is_active: false
        })
        .lt('expires_at', now)
        .eq('is_active', true)
        .not('expires_at', 'is', null)

      if (!error) {
        results.deactivatedPremiumUsers = expiredPremium.length
      }
    }

    console.log('Expiry cron completed:', results)

    return NextResponse.json({
      success: true,
      message: 'Expiry processing completed',
      results
    })
  } catch (err) {
    console.error('Expiry cron error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
