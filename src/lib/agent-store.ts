import { createClient } from '@supabase/supabase-js';

// Server-only access to agent_requests / agent_limits (see supabase-agent-requests.sql).
// Callers must authenticate the user and check ownership before using it.
export function serviceClient() {
 const key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!key)throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
 return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,key,{auth:{persistSession:false,autoRefreshToken:false}});
}

// Returns false once the daily limit for this key has been reached.
export async function takeDailyLimit(scope:string,userId:string,max:number){
 const {data,error}=await serviceClient().rpc('increment_agent_limit',{limit_key:`${scope}:${userId}:${new Date().toISOString().slice(0,10)}`,max_count:max});
 if(error)throw error;
 return data!==null;
}

export async function isAdmin(client:{from:(t:string)=>any},userId:string){
 const {data}=await client.from('users').select('role').eq('id',userId).maybeSingle();
 return data?.role==='admin';
}
