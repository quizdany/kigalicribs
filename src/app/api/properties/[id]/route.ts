import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase: any = supabaseClient

export async function GET(request: any, context: any) {
  try {
    let id = context?.params?.id
    if (!id && context?.params && typeof context.params.then === 'function') {
      const p = await context.params
      id = p.id
    }
    const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function PATCH(request: any, context: any) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 })
    const token = authHeader.split(' ')[1]

    // Create a per-request authed client so DB calls run with the user's JWT (required for RLS policies)
    const supabaseAuthed = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    ) as typeof supabaseClient

    const { data: userData } = await (supabaseAuthed as any).auth.getUser()
    if (!userData?.user) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })

    let id = context?.params?.id
    if (!id && context?.params && typeof context.params.then === 'function') {
      const p = await context.params
      id = p.id
    }
    const body = await request.json()

    // verify owner
    const existingRes: any = await (supabaseAuthed as any).from('properties').select('owner_id').eq('id', id).maybeSingle()
    const existing = existingRes.data
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (existing.owner_id !== userData.user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { data, error } = await (supabaseAuthed as any).from('properties').update(body).eq('id', id).select().maybeSingle()
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function DELETE(request: any, context: any) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) return NextResponse.json({ success: false, error: 'Missing token' }, { status: 401 })
    const token = authHeader.split(' ')[1]

    // Create a per-request authed client
    const supabaseAuthed = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    ) as typeof supabaseClient

    const { data: userData } = await (supabaseAuthed as any).auth.getUser()
    if (!userData?.user) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })

    let id = context?.params?.id
    if (!id && context?.params && typeof context.params.then === 'function') {
      const p = await context.params
      id = p.id
    }

    const existingRes: any = await (supabaseAuthed as any).from('properties').select('owner_id').eq('id', id).maybeSingle()
    const existing = existingRes.data
    if (!existing) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
    if (existing.owner_id !== userData.user.id) return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })

    const { error } = await (supabaseAuthed as any).from('properties').delete().eq('id', id)
    if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
