import { env } from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(request:Request){if(!request.headers.get('oai-authenticated-user-id'))return Response.json({configured:false,error:'Sign in with ChatGPT to check transcription status.'},{status:401,headers:{'Cache-Control':'no-store'}});return Response.json({configured:Boolean((env as unknown as Record<string,string>).ELEVENLABS_API_KEY),model:'scribe_v2',romanization:'not_connected',mp4:'not_implemented'},{headers:{'Cache-Control':'no-store'}});}
