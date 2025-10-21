import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'

const supabase: any = supabaseClient

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing property id' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('properties')
      .select('owner_id, owner_email, owner_phone, title')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    // If no explicit owner_email stored yet, return owner_id so UI can show fallback
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
