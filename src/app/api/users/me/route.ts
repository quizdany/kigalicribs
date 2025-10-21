import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'

const supabase: any = supabaseClient

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 })
    const token = authHeader.split(' ')[1]

    const { data: userData, error } = await supabase.auth.getUser(token)
    if (error || !userData?.user) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })

    // fetch additional profile from users table
    const { data: profile, error: profileError } = await supabase.from('users').select('*').eq('id', userData.user.id).maybeSingle()
    if (profileError) return NextResponse.json({ success: false, error: profileError.message }, { status: 500 })

    return NextResponse.json({ success: true, user: userData.user, profile: profile })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
