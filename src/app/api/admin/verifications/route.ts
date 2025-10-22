import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

/**
 * Admin API to list pending verification requests
 * GET /api/admin/verifications - List all pending verifications
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 })
    }

    // Get URL params for filtering
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'pending'

    // Fetch verification requests
    const { data: verifications, error } = await supabase
      .from('property_verifications')
      .select(`
        *,
        properties:property_id (
          id,
          title,
          description,
          location,
          district,
          price,
          property_type,
          images,
          photo_count
        )
      `)
      .eq('status', status)
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('Error fetching verifications:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: verifications
    })
  } catch (err) {
    console.error('Verification list error:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 })
  }
}
