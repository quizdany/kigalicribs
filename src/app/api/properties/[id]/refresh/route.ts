import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Refresh Listing API (bump to top for 7 days)
 * POST /api/properties/[id]/refresh
 * Requires: 10,000 RWF payment
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Missing property id' }, { status: 400 })
    }

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

    // Verify property ownership
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('owner_id', user.id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ success: false, error: 'Property not found or not owned by user' }, { status: 404 })
    }

    // Check if listing is verified (only verified listings can be refreshed)
    if (property.listing_type === 'basic') {
      return NextResponse.json({
        success: false,
        error: 'Only verified listings can be refreshed. Please upgrade to verified listing first.'
      }, { status: 403 })
    }

    // Check if already refreshed recently (prevent spam)
    const lastRefresh = new Date(property.updated_at)
    const hoursSinceRefresh = (Date.now() - lastRefresh.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceRefresh < 24) {
      return NextResponse.json({
        success: false,
        error: 'Listing can only be refreshed once every 24 hours',
        hoursUntilNextRefresh: Math.ceil(24 - hoursSinceRefresh)
      }, { status: 429 })
    }

    return NextResponse.json({
      success: true,
      requiresPayment: true,
      amount: 10000,
      currency: 'RWF',
      purpose: 'listing_refresh',
      propertyId,
      message: 'Payment required to refresh listing'
    })
  } catch (err) {
    console.error('Refresh listing error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
