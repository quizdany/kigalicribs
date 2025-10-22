import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Admin API to approve or reject verification requests
 * POST /api/admin/verifications/[id]/review
 * Body: { action: 'approve' | 'reject', notes?: string }
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: verificationId } = await params
    if (!verificationId) {
      return NextResponse.json({ success: false, error: 'Missing verification id' }, { status: 400 })
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get request body
    const body = await req.json()
    const { action, notes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
    }

    // Get verification request
    const { data: verification, error: verifyError } = await supabase
      .from('property_verifications')
      .select('*')
      .eq('id', verificationId)
      .single()

    if (verifyError || !verification) {
      return NextResponse.json({ success: false, error: 'Verification request not found' }, { status: 404 })
    }

    if (verification.status !== 'pending') {
      return NextResponse.json({ success: false, error: 'Verification already reviewed' }, { status: 400 })
    }

    const now = new Date().toISOString()
    const newStatus = action === 'approve' ? 'approved' : 'rejected'

    // Update verification request
    const { error: updateError } = await supabase
      .from('property_verifications')
      .update({
        status: newStatus,
        admin_id: user.id,
        admin_notes: notes || null,
        reviewed_at: now
      })
      .eq('id', verificationId)

    if (updateError) {
      console.error('Error updating verification:', updateError)
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 })
    }

    // If approved, update property listing
    if (action === 'approve') {
      const expiresAt = new Date()
      expiresAt.setMonth(expiresAt.getMonth() + 6) // 6 months validity

      const updates: any = {
        verification_status: 'verified',
        verified_at: now,
        listing_expires_at: expiresAt.toISOString()
      }

      // If premium_verified, add featured and priority dates
      if (verification.verification_type === 'premium_verified') {
        const featuredUntil = new Date()
        featuredUntil.setDate(featuredUntil.getDate() + 30) // Featured for 30 days

        const priorityUntil = new Date()
        priorityUntil.setDate(priorityUntil.getDate() + 90) // Priority for 90 days

        updates.featured_until = featuredUntil.toISOString()
        updates.priority_until = priorityUntil.toISOString()
        updates.featured = true
      }

      const { error: propertyError } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', verification.property_id)

      if (propertyError) {
        console.error('Error updating property:', propertyError)
        return NextResponse.json({ success: false, error: propertyError.message }, { status: 500 })
      }
    } else {
      // If rejected, revert property to basic
      const { error: propertyError } = await supabase
        .from('properties')
        .update({
          listing_type: 'basic',
          verification_status: 'rejected'
        })
        .eq('id', verification.property_id)

      if (propertyError) {
        console.error('Error updating property:', propertyError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Verification ${action}d successfully`,
      data: {
        verificationId,
        propertyId: verification.property_id,
        status: newStatus
      }
    })
  } catch (err) {
    console.error('Verification review error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
