export function srtTime(seconds){const ms=Math.round(seconds*1000);const h=Math.floor(ms/3600000),m=Math.floor(ms/60000)%60,s=Math.floor(ms/1000)%60;return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')},${String(ms%1000).padStart(3,'0')}`;}
export function makeSrt(captions,duration){let previous=0;return captions.map((c,i)=>{if(!c.text.trim()||!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<previous||c.end<=c.start||c.end>duration+.001||Math.round(c.end*1000)<=Math.round(c.start*1000))throw Error('Fix empty text or invalid / overlapping caption timings before downloading.');previous=c.end;return `${i+1}\n${srtTime(c.start)} --> ${srtTime(c.end)}\n${c.text.replace(/\r/g,'').replace(/\n\s*\n/g,'\n').trim()}\n`;}).join('\n');}
export function approximateWords(c){const words=c.text.trim().split(/\s+/).filter(Boolean);return words.map((text,i)=>({text,start:c.start+(c.end-c.start)*i/words.length,end:c.start+(c.end-c.start)*(i+1)/words.length}));}
export function encodeWav(samples,rate=16000){const buffer=new ArrayBuffer(44+samples.length*2),v=new DataView(buffer);const str=(p,s)=>[...s].forEach((c,i)=>v.setUint8(p+i,c.charCodeAt(0)));str(0,'RIFF');v.setUint32(4,36+samples.length*2,true);str(8,'WAVE');str(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);str(36,'data');v.setUint32(40,samples.length*2,true);samples.forEach((s,i)=>v.setInt16(44+i*2,Math.round(Math.max(-1,Math.min(1,s))*(s<0?32768:32767)),true));return buffer;}

export function splitCaption(caption, value, caret){
 const before=value.slice(0,caret), after=value.slice(caret);
 if(!before.trim()||!after.trim()||(/\S$/.test(before)&&/^\S/.test(after)))return null;
 const index=before.trim().split(/\s+/).length;
 const labels=value.trim().split(/\s+/);
 const timed=caption.words?.length===labels.length&&caption.words.every((word,i)=>word.text===labels[i]);
 const words=timed?caption.words:approximateWords({...caption,text:value});
 const boundary=words[index]?.start;
 if(!(boundary>caption.start&&boundary<caption.end))return null;
 return [[0,index,caption.start,boundary],[index,words.length,boundary,caption.end]].map(([from,to,start,end])=>{
  const subset=words.slice(from,to);
  const result={...caption,start,end,text:labels.slice(from,to).join(' '),words:subset,manualSplit:true};
  result.nativeText=subset.map(word=>word.nativeText??word.text).join(' ');
  result.romanText=subset.map(word=>word.romanText??word.text).join(' ');
  if(!timed)result.timingSource='estimated_after_edit';
  if(caption.focalIndex>=from&&caption.focalIndex<to)result.focalIndex=caption.focalIndex-from;
  else delete result.focalIndex;
  return result;
 });
}

export function captionChunkLimit(kind){
 return {orbit:4,'editorial-rail':4,'phrase-focus':4,'minimal-four':4,'pop-trio':3,'blur-reveal':3,'urdu-focus':3}[kind];
}

export function shortCaptionChunks(caption,maxWords=4){
 const words=caption.words?.length?caption.words:approximateWords(caption);
 if(words.length<=maxWords)return [caption];
 const count=Math.ceil(words.length/maxWords);
 return Array.from({length:count},(_,index)=>{
  const first=Math.ceil(index*words.length/count);
  const next=Math.ceil((index+1)*words.length/count);
  const group=words.slice(first,next);
  return {...caption,words:group,text:group.map(word=>word.text).join(' '),
   start:index?group[0].start:caption.start,end:words[next]?.start??caption.end,
   focalIndex:caption.focalIndex>=first&&caption.focalIndex<next?caption.focalIndex-first:undefined};
 });
}
