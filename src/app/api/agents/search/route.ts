import { searchProperties } from '@/lib/agent-tools';
export async function POST(req:Request) {
 try {const raw=await req.text();if(raw.length>2000)return Response.json({error:'Request too large'},{status:413});return Response.json({properties:await searchProperties(JSON.parse(raw))},{headers:{'Cache-Control':'no-store'}});}
 catch(e){return Response.json({error:e instanceof Error&&e.message.includes('temporarily')?e.message:'Please check your search filters.'},{status:400});}
}
