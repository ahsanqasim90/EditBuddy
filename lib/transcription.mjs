export const MODEL='scribe_v2';
export function wavDuration(buffer){
 const b=new DataView(buffer); const str=(p,n)=>Array.from({length:n},(_,i)=>String.fromCharCode(b.getUint8(p+i))).join('');
 if(b.byteLength<44||str(0,4)!=='RIFF'||str(8,4)!=='WAVE')throw new Error('Expected PCM WAV audio.');
 let format=null,data=0;
 for(let p=12;p+8<=b.byteLength;){const id=str(p,4),n=b.getUint32(p+4,true);if(p+8+n>b.byteLength)throw new Error('Incomplete WAV data.');if(id==='fmt '&&n>=16)format={codec:b.getUint16(p+8,true),channels:b.getUint16(p+10,true),rate:b.getUint32(p+12,true),byteRate:b.getUint32(p+16,true),align:b.getUint16(p+20,true),bits:b.getUint16(p+22,true)};if(id==='data')data+=n;p+=8+n+(n%2);}
 if(!format||format.codec!==1||format.bits!==16||format.channels!==1||format.rate!==16000||format.byteRate!==32000||format.align!==2||!data||data%2)throw new Error('Expected mono 16 kHz, 16-bit PCM WAV.');
 return data/format.byteRate;
}
export function normalizeWords(payload,duration){
 if(!Array.isArray(payload.words))throw new Error('The provider did not return word timestamps.');
 const words=payload.words.filter(w=>w.type==='word'&&String(w.text||'').trim()).map(w=>{
  if(w.start==null||w.end==null)throw new Error('The provider returned missing word timestamps.');
  const start=Number(w.start),end=Number(w.end);
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<-.05||end<start-.05||start>duration+.5||end>duration+.5)throw new Error('The provider returned invalid word timestamps.');
  return {text:String(w.text).trim(),start:Math.max(0,Math.min(start,duration)),end:Math.max(0,Math.min(end,duration)),rawStart:start,rawEnd:end};
 });
 // Keep transcript order. Correct only small backwards rounding; never sort text.
 for(let i=1;i<words.length;i++){if(words[i].start<words[i-1].start){if(words[i-1].start-words[i].start>.05)throw new Error('The provider returned unordered word timestamps.');words[i].start=words[i-1].start;}}
 // Shared start times need separate display intervals, including a zero-length tail.
 for(let i=0;i<words.length;){let j=i+1;while(j<words.length&&words[j].start===words[i].start)j++;const count=j-i,anchor=words[i].start;
  if(count>1||anchor===duration){const begin=Math.min(anchor,duration-.002*count),limit=j<words.length?words[j].start:duration;const stop=Math.min(limit,Math.max(...words.slice(i,j).map(w=>w.end),begin+.02*count));if(begin<0||stop<=begin)throw new Error('The provider returned unresolvable word timestamps.');for(let k=i;k<j;k++)words[k].start=begin+(stop-begin)*(k-i)/count;}
  i=j;
 }
 return words.map((w,i)=>{const limit=words[i+1]?.start??duration;let end=Math.min(w.end,limit);if(end<=w.start)end=Math.min(limit,w.start+.02);if(end<=w.start)throw new Error('The provider returned unresolvable word timestamps.');const adjusted=w.start!==w.rawStart||end!==w.rawEnd;return {text:w.text,start:w.start,end,...(adjusted?{timingAdjusted:true}: {})};});
}
export function groupWords(words){let out=[],group=[];const flush=()=>{if(group.length){out.push({text:group.map(w=>w.text).join(' '),start:group[0].start,end:group[group.length-1].end,words:group.map(w=>({...w})),timingSource:group.some(w=>w.timingAdjusted)?'normalized_provider':'provider'});group=[];}};for(const w of words){if(group.length&&(group.length>=6||w.start-group.at(-1).end>.65||w.end-group[0].start>3.5))flush();group.push(w);if(/[.!?۔؟।]$/.test(w.text))flush();}flush();return out;}
export async function transcribeAudio(buffer,key,language,fetcher=fetch){
 const duration=wavDuration(buffer);if(duration<.1||duration>60)throw new Error('Audio must be between 0.1 and 60 seconds.');
 const form=new FormData();form.set('file',new Blob([buffer],{type:'audio/wav'}),'speech.wav');form.set('model_id',MODEL);form.set('timestamps_granularity','word');form.set('tag_audio_events','false');form.set('diarize','false');form.set('no_verbatim','false');if(language!=='auto')form.set('language_code',language);
 const res=await fetcher('https://api.elevenlabs.io/v1/speech-to-text',{method:'POST',headers:{'xi-api-key':key},body:form,signal:AbortSignal.timeout(90000)});
 if(!res.ok){const e=new Error(res.status===401?'ElevenLabs rejected the API key. Check its Speech to Text permission.':res.status===402?'ElevenLabs reports insufficient allowance. Check your balance before purchasing.':res.status===429?'ElevenLabs rate or quota limit reached. Please check your allowance and retry later.':'ElevenLabs could not complete transcription. Check account allowance and try again.');e.status= res.status===401||res.status===402||res.status===429?res.status:502;throw e;}
 const payload=await res.json(),words=normalizeWords(payload,duration);return {source:'elevenlabs',model:MODEL,language:payload.language_code||null,duration,words,captions:groupWords(words),romanization:'not_connected'};
}
