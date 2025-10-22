import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase'
import { checkPremiumStatus } from '@/lib/premium'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    // Get property details
    const { data: property, error } = await supabase
      .from('properties')
      .select('owner_id, owner_email, owner_phone, title')
      .eq('id', id)
      .single()

    if (error || !property) {
      return NextResponse.json({ success: false, error: 'Property not found' }, { status: 404 })
    }

    // If user is the owner, allow free access
    if (property.owner_id === user.id) {
      return NextResponse.json({
        success: true,
        contact: {
          owner_id: property.owner_id,
          owner_email: property.owner_email,
          owner_phone: property.owner_phone,
          title: property.title
        },
        isPremium: false,
        requiresPayment: false
      })
    }

    // Check if user has premium subscription
    const isPremium = await checkPremiumStatus(user.id)

    if (isPremium) {
      // Premium users get unlimited contact views
      return NextResponse.json({
        success: true,
        contact: {
          owner_id: property.owner_id,
          owner_email: property.owner_email,
          owner_phone: property.owner_phone,
          title: property.title
        },
        isPremium: true,
        requiresPayment: false
      })
    }

    // Non-premium users: Check if they've already unlocked this contact
    const { data: unlocked } = await supabase
      .from('payments')
      .select('*')
      .eq('user_id', user.id)
      .eq('purpose', 'contact_unlock')
      .eq('status', 'completed')
      .eq('metadata->>property_id', id)
      .single()

    if (unlocked) {
      // Already paid for this contact
      return NextResponse.json({
        success: true,
        contact: {
          owner_id: property.owner_id,
          owner_email: property.owner_email,
          owner_phone: property.owner_phone,
          title: property.title
        },
        isPremium: false,
        requiresPayment: false,
        alreadyUnlocked: true
      })
    }

    // Requires payment
    return NextResponse.json({
      success: false,
      requiresPayment: true,
      isPremium: false,
      message: 'Premium subscription or one-time payment required to view contact',
      pricing: {
        contact_unlock: 500, // RWF
        premium_monthly: 5000, // RWF
        premium_yearly: 50000 // RWF
      }
    }, { status: 402 }) // 402 Payment Required

  } catch (error: any) {
    console.error('Contact fetch error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
