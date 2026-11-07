import { env } from 'cloudflare:workers';
import { transcribeAudio } from '../../../lib/transcription.mjs';
export const dynamic='force-dynamic';
const json=(body:object,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!request.headers.get('oai-authenticated-user-id'))return json({error:'Sign in with ChatGPT to transcribe.'},401);
 const origin=request.headers.get('origin');if(!origin||origin!==new URL(request.url).origin)return json({error:'Cross-origin requests are not allowed.'},403);
 const key=(env as unknown as Record<string,string>).ELEVENLABS_API_KEY;
 if(!key)return json({error:'Server secret ELEVENLABS_API_KEY is missing. Add it in ChatGPT Sites → Xenvora Digital by Edit Buddy → More actions → Settings. Never paste it into this editor or chat.',code:'key_missing'},503);
 if(!request.headers.get('content-type')?.includes('audio/wav'))return json({error:'Expected audio/wav.'},415);
 const length=Number(request.headers.get('content-length')||0);if(length>1920100)return json({error:'Audio exceeds the 60-second limit.'},413);
 let total=0;const chunks:Uint8Array[]=[];const reader=request.body?.getReader();if(!reader)return json({error:'No audio provided.'},400);
 try {for(;;){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>1920100){await reader.cancel();return json({error:'Audio exceeds the 60-second limit.'},413);}chunks.push(value);}const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}const language=new URL(request.url).searchParams.get('language')||'auto';if(!['auto','eng','hin','urd','ben','pan','snd','pus','ara','fas','tam','tel','mar','guj','nep','fra','spa','deu','por','tur','jpn','kor','zho'].includes(language))return json({error:'Unsupported speech language.'},400);return json(await transcribeAudio(bytes.buffer,key,language));
 }catch(error){const e=error as Error&{status?:number};return json({error:e.name==='TimeoutError'?'Transcription timed out. No automatic retry was made. Check ElevenLabs usage before retrying.':e.message},e.status||400);}
}
