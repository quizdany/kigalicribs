import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { canContactListing, isEntitlementActive, isListingAvailable } from '@/lib/marketplace-policy'

/**
 * Public listing discovery stays open. Contact information is released only
 * to an authenticated renter with an existing unlock, an active plan, or one
 * of the three included contact unlocks.
 */
export async function GET(
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

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id, owner_email, owner_phone, title, status, listing_expires_at')
      .eq('id', propertyId)
      .maybeSingle()

    if (propertyError || !property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }
    if (!isListingAvailable({ status: property.status, expiresAt: property.listing_expires_at })) {
      return NextResponse.json({ success: false, error: 'This property is no longer available.' }, { status: 409 })
    }
    if (property.owner_id === user.id) {
      return NextResponse.json({ success: false, error: 'You already have access to your own listing.' }, { status: 403 })
    }

    // Check if user already unlocked this property. Repeated views do not
    // consume another allowance.
    const { data: existingUnlock, error: existingError } = await supabase
      .from('contact_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .maybeSingle()

    if (existingError) {
      return NextResponse.json({ success: false, error: 'Unable to check your contact access.' }, { status: 503 })
    }

    const { count: unlockCount, error: countError } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (countError) {
      return NextResponse.json({ success: false, error: 'Unable to check your contact allowance.' }, { status: 503 })
    }

    const usedFreeUnlocks = unlockCount || 0

    const { data: premiumUser, error: premiumError } = await supabase
      .from('premium_users')
      .select('is_active, expires_at')
      .eq('user_id', user.id)
      .eq('subscription_type', 'unlimited_contact_access')
      .eq('is_active', true)
      .maybeSingle()

    if (premiumError) {
      return NextResponse.json({ success: false, error: 'Unable to check your contact plan.' }, { status: 503 })
    }

    const hasUnlimitedAccess = !!premiumUser && isEntitlementActive({
      isActive: premiumUser.is_active,
      expiresAt: premiumUser.expires_at,
    })
    const decision = canContactListing({
      available: true,
      isOwner: false,
      alreadyUnlocked: !!existingUnlock,
      hasActiveUnlimitedAccess: hasUnlimitedAccess,
      usedFreeUnlocks,
    })

    if (!decision.allowed) {
      return NextResponse.json({
        success: false,
        error: 'Contact unlock limit reached',
        requiresPayment: true,
        usedFreeUnlocks,
        freeUnlocksLimit: 3,
        unlimitedAccessPrice: 10000 // RWF
      }, { status: 403 })
    }

    // Persist each contact unlock once. A concurrent repeat request is safe:
    // if the database's user/property unique constraint wins the race, return
    // the already-authorized property contact instead of charging twice.
    if (!existingUnlock && !hasUnlimitedAccess) {
      const { error: unlockError } = await supabase.from('contact_unlocks').insert({
        user_id: user.id,
        property_id: propertyId,
      })
      if (unlockError && unlockError.code !== '23505') {
        return NextResponse.json({ success: false, error: 'Failed to unlock contact information' }, { status: 500 })
      }
    }

    return NextResponse.json({ 
      success: true, 
      data: { owner_id: property.owner_id, owner_email: property.owner_email, owner_phone: property.owner_phone, title: property.title },
      alreadyUnlocked: decision.reason === 'already_unlocked',
      usedFreeUnlocks: usedFreeUnlocks + (!existingUnlock && !hasUnlimitedAccess ? 1 : 0),
      freeUnlocksLimit: 3,
      hasUnlimitedAccess
    })
  } catch (err) {
    console.error('Contact unlock error:', err)
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 })
  }
}
