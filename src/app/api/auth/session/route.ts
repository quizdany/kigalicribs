import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'

const supabase: any = supabaseClient

export async function GET(request: Request) {
  try {
    const { data } = await supabase.auth.getSession()
    const access_token = data?.session?.access_token ?? null
    return NextResponse.json({ success: true, access_token })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
