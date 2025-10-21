import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase: any = supabaseClient

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const perPage = parseInt(searchParams.get('perPage') || '20', 10)
    const q = searchParams.get('q') || undefined
    const location = searchParams.get('location') || undefined
    const propertyType = searchParams.get('propertyType') || undefined
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined
    const amenities = searchParams.get('amenities') || undefined

    let query = supabase.from('properties').select('*')

    // Text search across title and description
    if (q) {
      query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`)
    }

    // Location filter (search in address, district, or location fields)
    if (location) {
      query = query.or(`address.ilike.%${location}%,district.ilike.%${location}%,location.ilike.%${location}%`)
    }

    // Property type filter
    if (propertyType && propertyType !== 'all') {
      query = query.eq('property_type', propertyType)
    }

    // Price range filter
    if (minPrice !== undefined) {
      query = query.gte('price', minPrice)
    }
    if (maxPrice !== undefined) {
      query = query.lte('price', maxPrice)
    }

    // Amenities filter (check if property has all requested amenities)
    if (amenities) {
      const amenitiesList = amenities.split(',').map(a => a.trim())
      // For PostgreSQL array contains operation
      amenitiesList.forEach(amenity => {
        query = query.contains('amenities', [amenity])
      })
    }

    const from = (page - 1) * perPage
    const to = from + perPage - 1

    const { data, error } = await query.order('created_at', { ascending: false }).range(from, to)

    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, error: 'Missing authorization token' }, { status: 401 })
    }

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

    // verify user using the authed client
    const { data: userData, error: userError } = await (supabaseAuthed as any).auth.getUser()
    if (userError || !userData?.user) {
      return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()

    // Pick only known/expected columns to avoid PostgREST unknown column errors
    const {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      size,
      address,
      district,
      amenities,
      images,
      type,
      property_type,
      ownerPhone,
    } = body || {}

    // derive required fields for legacy schema compatibility
    const derivedLocation = (body?.location ?? [address, district].filter(Boolean).join(', ')) || 'Unknown'
    const safeAmenities = Array.isArray(amenities) ? amenities : []
    const safeImages = Array.isArray(images) ? images : []
    const finalPropertyType = property_type ?? type ?? 'apartment'

    // Best-effort: ensure a matching owner row exists for common profile table names to satisfy FK
    const possibleProfileTables = ['profiles', 'users', 'user_profiles']
    for (const table of possibleProfileTables) {
      try {
        const { error: upsertErr } = await (supabaseAuthed as any)
          .from(table)
          .upsert({ id: userData.user.id, email: userData.user.email }, { onConflict: 'id' })
        // If upsert succeeds or table doesn't exist, stop trying
        if (!upsertErr || (upsertErr as any)?.code === '42P01') {
          break
        }
      } catch (_) {
        // ignore and try next table name
      }
    }

    // attach owner and ensure non-null fields
    const insert = {
      title,
      description,
      price,
      bedrooms,
      bathrooms,
      size,
      address,
      district,
      amenities: safeAmenities,
      images: safeImages,
      property_type: finalPropertyType,
      location: derivedLocation,
      owner_id: userData.user.id,
      owner_email: userData.user.email ?? null,
      owner_phone: ownerPhone ?? null,
    }

    // Perform insert with authed client so RLS sees auth.uid()
    const { data, error } = await (supabaseAuthed as any)
      .from('properties')
      .insert([insert])
      .select()
      .single()
    if (error) {
      return NextResponse.json({ success: false, error: error.message, details: error }, { status: 500 })
    }

    return NextResponse.json({ success: true, data }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ success: false, error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 })
  }
}
