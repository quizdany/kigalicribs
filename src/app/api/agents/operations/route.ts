import { z } from 'zod';
import { requestUser,sameOrigin } from '@/lib/agent-tools';
import { isAdmin,serviceClient } from '@/lib/agent-store';
async function admin(req:Request){const user=await requestUser(req);return user&&await isAdmin(user.client,user.id)?user:null;}
export async function GET(req:Request){
 if(!await admin(req))return Response.json({error:'Admin sign-in required.'},{status:403});
 try{
 const {data,error}=await serviceClient().from('agent_requests').select('id,kind,property_id,message,status,created_at,reply,replied_at').order('created_at',{ascending:false}).limit(100);
 if(error)throw error;
 const rows=data||[];
 const summary={total:rows.length,pending:rows.filter(r=>r.status==='pending').length,viewings:rows.filter(r=>r.kind==='viewing').length,pendingReports:rows.filter(r=>r.kind==='listing_report'&&r.status==='pending').length,pendingSupport:rows.filter(r=>r.kind==='support'&&r.status==='pending').length};
 return Response.json({requests:rows,summary},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return Response.json({error:'Unable to load operations. Please try again.'},{status:503});}
}
export async function PATCH(req:Request){
 if(!sameOrigin(req)||!await admin(req))return Response.json({error:'Forbidden'},{status:403});
 try{
 const raw=await req.text();if(raw.length>8000)return Response.json({error:'Reply too long'},{status:413});
 const b=z.object({id:z.string().uuid(),status:z.enum(['pending','reviewed','closed']),reply:z.string().trim().max(3000).optional()}).strict().parse(JSON.parse(raw));
 const changes=b.reply!==undefined?{status:b.status,reply:b.reply,replied_at:b.reply?new Date().toISOString():null}:{status:b.status};
 const {data,error}=await serviceClient().from('agent_requests').update(changes).eq('id',b.id).neq('status','cancelled').select('id');
 if(error)throw error;
 if(!data?.length)return Response.json({error:'Request not found or already cancelled.'},{status:409});
 return Response.json({success:true});
 }catch{return Response.json({error:'Invalid update'},{status:400});}
}
