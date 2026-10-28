import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
export const searchSchema = z.object({location:z.string().trim().max(80).regex(/^[\p{L}\p{N} .'-]*$/u).default(''), maxPrice:z.number().int().min(0).max(100000000).optional(), bedrooms:z.number().int().min(0).max(30).optional(), propertyType:z.enum(['apartment','house','studio','room']).optional()}).strict();
export function publicClient(token?:string) {
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{auth:{persistSession:false,autoRefreshToken:false},...(token?{global:{headers:{Authorization:`Bearer ${token}`}}}:{})});
}
export async function searchProperties(input:unknown) {
 const f=searchSchema.parse(input);
 let q=publicClient().from('properties').select('id,title,price,location,district,bedrooms,bathrooms,property_type,verification_status,updated_at').eq('status','available');
 const active=`or(listing_expires_at.is.null,listing_expires_at.gte.${new Date().toISOString()})`;
 q=f.location?q.or(`and(${active},or(location.ilike.%${f.location}%,district.ilike.%${f.location}%))`):q.or(active);
 if(f.maxPrice!==undefined) q=q.lte('price',f.maxPrice);
 if(f.bedrooms!==undefined) q=q.eq('bedrooms',f.bedrooms);
 if(f.propertyType) q=q.eq('property_type',f.propertyType);
 const {data,error}=await q.order('updated_at',{ascending:false}).limit(6);
 if(error) throw new Error('Property search is temporarily unavailable. Please try again.');
 return data||[];
}
export async function requestUser(req:Request) {
 const token=req.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
 if(!token) return null;
 const client=publicClient(token);const {data,error}=await client.auth.getUser();
 return error||!data.user?null:{id:data.user.id,client};
}
export function sameOrigin(req:Request) {const origin=req.headers.get('origin');return !origin||origin===new URL(req.url).origin;}
