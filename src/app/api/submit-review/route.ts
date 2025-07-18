import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'tenant') {
    return NextResponse.json({ error: 'Only tenants can post reviews.' }, { status: 403 });
  }

  const { propertyId, rating, comment } = await req.json();
  const tenantName = session.user.name;

  const { error } = await supabase.from('reviews').insert({
    property_id: propertyId,
    tenant_name: tenantName,
    rating,
    comment,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
} 