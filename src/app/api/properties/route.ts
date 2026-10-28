import { propertyQuerySchema,propertyEditSchema,redactProperty } from '@/lib/property-policy'
import { NextResponse } from 'next/server'
import { supabase as supabaseClient } from '@/lib/supabase'
import { createClient } from '@supabase/supabase-js'

const supabase: any = supabaseClient

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed=propertyQuerySchema.safeParse(Object.fromEntries(searchParams));
    if(!parsed.success)return NextResponse.json({success:false,error:parsed.error.issues[0]?.message||'Invalid search filters'},{status:400});
    const {page,perPage,q,location,propertyType,minPrice,maxPrice,amenities,bedrooms,bathrooms,minBedrooms,minBathrooms,sort,ids}=parsed.data;
    let query = supabase.from('properties').select('*',{count:'exact'}).eq('status','available');

    if(ids)query=query.in('id',ids.split(','));
    // Apply text and location as separate groups in one PostgREST expression.
    // Calling .or() twice replaces the first group, so queries could silently
    // ignore the user's search text when both filters were supplied.
    const textFields = ['title', 'description'];
    const locationFields = ['address', 'district', 'location'];
    let searchGroup: string | undefined;
    if (q && location) {
      const alternatives = textFields.flatMap(textField => locationFields.map(locationField =>
        `and(${textField}.ilike.%${q}%,${locationField}.ilike.%${location}%)`
      ));
      searchGroup = `or(${alternatives.join(',')})`;
    } else if (q) {
      searchGroup = `or(${textFields.map(field => `${field}.ilike.%${q}%`).join(',')})`;
    } else if (location) {
      searchGroup = `or(${locationFields.map(field => `${field}.ilike.%${location}%`).join(',')})`;
    }
    const activeListingGroup = `or(listing_expires_at.is.null,listing_expires_at.gte.${new Date().toISOString()})`;
    query = query.or(searchGroup ? `and(${activeListingGroup},${searchGroup})` : activeListingGroup);

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

    if(bedrooms!==undefined)query=query.eq('bedrooms',bedrooms);
    if(bathrooms!==undefined)query=query.eq('bathrooms',bathrooms);
    if(minBedrooms!==undefined)query=query.gte('bedrooms',minBedrooms);
    if(minBathrooms!==undefined)query=query.gte('bathrooms',minBathrooms);
    const from=(page-1)*perPage;
    const {data,error,count}=await query.order(sort==='newest'?'created_at':'price',{ascending:sort==='price_asc'}).order('id',{ascending:true}).range(from,from+perPage-1);
    if(error){console.error('Property search failed',{code:error.code,message:error.message});return NextResponse.json({success:false,error:'Unable to load properties. Please try again.'},{status:503});}
    return NextResponse.json({success:true,data:(data||[]).map(redactProperty),pagination:{page,perPage,total:count||0,hasMore:from+(data?.length||0)<(count||0)}},{headers:{'Cache-Control':'no-store'}});
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

    const raw=await request.text();
    if(raw.length>100000)return NextResponse.json({success:false,error:'Listing too large'},{status:413});
    const body=JSON.parse(raw);
    const checked=propertyEditSchema.safeParse({title:body.title,description:body.description,price:body.price,property_type:body.property_type??body.type,bedrooms:body.bedrooms,bathrooms:body.bathrooms,size:body.size,address:body.address,district:body.district,sector:body.sector,cell:body.cell,amenities:body.amenities,images:body.images,owner_phone:body.ownerPhone});
    if(!checked.success||!checked.data?.title||!checked.data?.description||!checked.data?.property_type||!checked.data?.price||!checked.data?.district)return NextResponse.json({success:false,error:checked.success?'Title, description, district, type and positive rent are required.':checked.error.issues[0]?.message},{status:400});

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
