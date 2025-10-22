import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Contact Unlock API with limits:
 * - First 3 properties: Free unlocks
 * - After 3: Must have unlimited_contact_access subscription (10,000 RWF)
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

    // Check if user already unlocked this property
    const { data: existingUnlock } = await supabase
      .from('contact_unlocks')
      .select('*')
      .eq('user_id', user.id)
      .eq('property_id', propertyId)
      .single()

    if (existingUnlock) {
      // Already unlocked, return contact info
      const { data: property } = await supabase
        .from('properties')
        .select('owner_id, owner_email, owner_phone, title')
        .eq('id', propertyId)
        .single()

      return NextResponse.json({ 
        success: true, 
        data: property,
        alreadyUnlocked: true
      })
    }

    // Count how many properties user has unlocked
    const { count: unlockCount } = await supabase
      .from('contact_unlocks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const usedFreeUnlocks = unlockCount || 0

    // Check if user has unlimited access
    const { data: premiumUser } = await supabase
      .from('premium_users')
      .select('*')
      .eq('user_id', user.id)
      .eq('subscription_type', 'unlimited_contact_access')
      .eq('is_active', true)
      .single()

    // Determine if user can unlock
    const hasFreeUnlocksLeft = usedFreeUnlocks < 3
    const hasUnlimitedAccess = premiumUser !== null

    if (!hasFreeUnlocksLeft && !hasUnlimitedAccess) {
      return NextResponse.json({
        success: false,
        error: 'Contact unlock limit reached',
        requiresPayment: true,
        usedFreeUnlocks,
        freeUnlocksLimit: 3,
        unlimitedAccessPrice: 10000 // RWF
      }, { status: 403 })
    }

    // Create unlock record
    const { error: unlockError } = await supabase
      .from('contact_unlocks')
      .insert({
        user_id: user.id,
        property_id: propertyId
      })

    if (unlockError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to unlock contact information' 
      }, { status: 500 })
    }

    // Get and return contact info
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('owner_id, owner_email, owner_phone, title')
      .eq('id', propertyId)
      .single()

    if (propertyError) {
      return NextResponse.json({ 
        success: false, 
        error: 'Property not found' 
      }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      data: property,
      usedFreeUnlocks: usedFreeUnlocks + 1,
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
