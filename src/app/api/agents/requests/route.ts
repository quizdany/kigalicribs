import { z } from 'zod';
import { requestUser,sameOrigin } from '@/lib/agent-tools';
import { serviceClient,takeDailyLimit } from '@/lib/agent-store';
import { isListingAvailable, marketplaceRequestSchema } from '@/lib/marketplace-policy';
const columns='id,kind,property_id,message,status,created_at,reply,replied_at';
export async function POST(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Forbidden'},{status:403});
 const user=await requestUser(req);if(!user)return Response.json({error:'Sign in to send a request.'},{status:401});
 let b;
 try{const raw=await req.text();if(raw.length>5000)return Response.json({error:'Request too large'},{status:413});b=marketplaceRequestSchema.parse(JSON.parse(raw));}
 catch{return Response.json({error:'Unable to save. Check your details and try again.'},{status:400});}
 try{
 let message='';
 if(b.kind==='listing_report'){
   const {data,error}=await user.client.from('properties').select('id,status,owner_id,title').eq('id',b.propertyId).maybeSingle();
   if(error||!data)return Response.json({error:'Property not found.'},{status:404});
   if(data.owner_id===user.id)return Response.json({error:'You cannot report your own listing.'},{status:403});
   const reasons={broker_or_agent:'Possible broker or agent listing',already_rented:'Already rented or unavailable',incorrect_details:'Inaccurate property details',suspected_scam:'Possible scam or unsafe listing',duplicate:'Duplicate listing'};
   message=`LISTING REPORT — ${reasons[b.reason]}\n${data.title}\n${b.details||'No additional details supplied.'}`;
 }
 if(b.kind==='viewing'||b.kind==='content_draft'){
 if(!b.propertyId)return Response.json({error:'Choose a property first.'},{status:400});
 const {data,error}=await user.client.from('properties').select('id,status,owner_id,title,price,location,listing_expires_at').eq('id',b.propertyId).maybeSingle();
 if(error||!data)return Response.json({error:'Property not found.'},{status:404});
 if(b.kind==='viewing'&&!isListingAvailable({status:data.status,expiresAt:data.listing_expires_at}))return Response.json({error:'This property is no longer listed as available.'},{status:409});
 if(b.kind==='viewing'&&data.owner_id===user.id)return Response.json({error:'You cannot request a viewing for your own property.'},{status:403});
 if(b.kind==='content_draft'){
 if(data.owner_id!==user.id)return Response.json({error:'Only the listing owner can create its draft.'},{status:403});
 message=`DRAFT — owner review required\n${data.title}\n${data.location} · RWF ${Number(data.price).toLocaleString('en-US')}/month\nConnect directly with the owner on TuraKGL.\n/properties/${data.id}\n\nOwner notes: ${b.message}`;
 }
 if(b.kind==='viewing')message=`VIEWING REQUEST\n${data.title}\n${data.location} · RWF ${Number(data.price).toLocaleString('en-US')}/month\n${b.message}`;
 }
 if(b.kind==='support')message=b.message;
 if(!await takeDailyLimit('request',user.id,20))return Response.json({error:'Daily request limit reached.'},{status:429});
 const {data,error}=await serviceClient().from('agent_requests').insert({user_id:user.id,kind:b.kind,property_id:b.propertyId||null,message,status:'pending'}).select('id').single();
 if(error)throw error;
 return Response.json({id:data.id,message:b.kind==='viewing'?'Viewing request sent to the owner inbox. The appointment is not confirmed until the owner confirms a time.':b.kind==='listing_report'?'Report sent to the TuraKGL review queue.':b.kind==='content_draft'?'Draft saved for review. It has not been published.':'Support request recorded for review.'},{status:201});
 }catch(e){console.error('Request save failed',e);return Response.json({error:'Unable to save your request right now. Please try again.'},{status:503});}
}

// The authenticated user ID is derived from Supabase, never from a query parameter.
export async function GET(req:Request){
 const user=await requestUser(req);
 if(!user)return Response.json({error:'Sign in to see your requests.'},{status:401});
 try{
 const {data,error}=await serviceClient().from('agent_requests').select(columns).eq('user_id',user.id).order('created_at',{ascending:false}).limit(100);
 if(error)throw error;
 return Response.json({requests:data||[]},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'Unable to load requests. Please try again.'},{status:503});}
}

export async function PATCH(req:Request){
 if(!sameOrigin(req))return Response.json({error:'Forbidden'},{status:403});
 const user=await requestUser(req);
 if(!user)return Response.json({error:'Sign in to cancel a request.'},{status:401});
 try{
 const body=await req.text();if(body.length>300)return Response.json({error:'Request too large'},{status:413});
 const {id}=z.object({id:z.string().uuid()}).strict().parse(JSON.parse(body));
 const {data,error}=await serviceClient().from('agent_requests').update({status:'cancelled'}).eq('id',id).eq('user_id',user.id).eq('status','pending').select('id');
 if(error)throw error;
 if(!data?.length)return Response.json({error:'This request cannot be cancelled. It may already have been reviewed or cancelled.'},{status:409});
 return Response.json({success:true},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'Unable to cancel. Please check the request and try again.'},{status:400});}
}
