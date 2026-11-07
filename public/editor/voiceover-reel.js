import {captionChunkLimit,shortCaptionChunks} from './transcript-utils.js';
import {matchReelSticker,paintReelSticker} from './reel-stickers.js';
import {renderCaption,themeForPixels} from './caption-design.js';

const colours=[
 {background:'#f7f1dc',text:'#562747',accent:'#942e79'},
 {background:'#fbe8e3',text:'#652f42',accent:'#92296b'},
 {background:'#f5f1e5',text:'#473152',accent:'#70408c'}
];

export async function loadReelBackground(file){
 const url=URL.createObjectURL(file),image=new Image();
 try{
  image.src=url;
  await image.decode();
  const sample=document.createElement('canvas');
  sample.width=sample.height=32;
  const ctx=sample.getContext('2d');
  ctx.fillStyle='#f7f1dc';
  ctx.fillRect(0,0,32,32);
  ctx.drawImage(image,image.width*.2,image.height*.25,image.width*.6,image.height*.5,0,0,32,32);
  const theme=themeForPixels(ctx.getImageData(0,0,32,32).data,'violet');
  return {image,palette:{background:'#f7f1dc',text:theme.text,accent:theme.accent,plate:theme.plate}};
 }catch{throw Error('Could not open '+file.name+'. Choose a supported image.');}
 finally{URL.revokeObjectURL(url);}
}

export function planReel(captions,styles,backgrounds=[],autoStickers=false,stickerLibrary=[]){
 const shots=[];
 captions.forEach(caption=>{
  const words=caption.words;
  if(words?.length>1){
   const count=Math.ceil(words.length/6),size=Math.ceil(words.length/count);
   for(let i=0;i<words.length;i+=size){
    const group=words.slice(i,i+size);
    shots.push({...caption,words:group,text:group.map(w=>w.text).join(' '),start:i?group[0].start:caption.start,end:group.at(-1).end,focalIndex:undefined});
   }
  }else shots.push(caption);
 });
 while(shots.length<styles.length){
  const index=shots.findIndex(caption=>caption.words?.length>1);
  if(index<0)break;
  const caption=shots[index],middle=Math.ceil(caption.words.length/2);
  const halves=[caption.words.slice(0,middle),caption.words.slice(middle)];
  shots.splice(index,1,...halves.map((words,i)=>({...caption,words,text:words.map(word=>word.text).join(' '),
   start:i?words[0].start:caption.start,end:words.at(-1).end,focalIndex:undefined})));
 }
 const scenes=shots.flatMap((caption,i)=>{
  const asset=backgrounds[i%backgrounds.length];
  const style=styles[i%styles.length],limit=captionChunkLimit(style.kind);
  const chunks=limit?shortCaptionChunks(caption,limit):[caption];
  return chunks.map(chunk=>({caption:chunk,sticker:autoStickers?matchReelSticker(chunk,stickerLibrary):undefined,
   style,image:asset?.image,palette:asset?.palette??colours[Math.floor(i/2)%colours.length]}));
 });
 if(autoStickers&&scenes.length&&!scenes.some(scene=>scene.sticker)){
  const first=scenes[0];
  first.sticker=matchReelSticker({text:"spark",start:first.caption.start});
 }
 return scenes;
}

export function paintReel(ctx,width,height,time,shots){
 const shot=shots.findLast(({caption})=>caption.start<=time);
 const scene=shot??shots[0];
 const {background,text,accent,plate}=scene.palette;
 ctx.fillStyle=background;
 ctx.fillRect(0,0,width,height);
 if(scene.image){
  const image=scene.image,scale=Math.max(width/image.width,height/image.height);
  const w=image.width*scale,h=image.height*scale;
  ctx.drawImage(image,(width-w)/2,(height-h)/2,w,h);
  if(plate){
   ctx.fillStyle=text==='#ffffff'?'#00000099':'#ffffffb3';
   ctx.fillRect(0,0,width,height);
  }
 }
 if(!shot)return;
 const {caption,style}=shot;
 paintReelSticker(ctx,width,height,time,shot.sticker);
 renderCaption(ctx,caption,time,{width,height,kind:scene.image&&style.kind==='property-negative'?'property':style.kind,face:style.face,size:style.font,
  x:50,y:50,text,accent,reveal:'phrase',supportFontSize:44,invert:!scene.image});
}

export async function recordReel(file,duration,ratio,shots){
 const canvas=document.createElement('canvas');
 [canvas.width,canvas.height]={'9:16':[1080,1920],'1:1':[1080,1080],'16:9':[1920,1080]}[ratio];
 if(!window.MediaRecorder||!canvas.captureStream)throw Error('Video recording requires a recent desktop browser.');
 const mimeType=['video/mp4','video/webm;codecs=vp9,opus','video/webm'].find(type=>MediaRecorder.isTypeSupported(type));
 if(!mimeType)throw Error('This browser has no supported video encoder.');
 const audio=new AudioContext();
 const stream=canvas.captureStream(30);
 let source;
 try{
  await audio.resume();
  await Promise.all(shots.flatMap(shot=>shot.sticker?[shot.sticker.image.decode()]:[]));
  const buffer=await audio.decodeAudioData(await file.arrayBuffer());
  const destination=audio.createMediaStreamDestination();
  source=audio.createBufferSource();
  source.buffer=buffer;
  source.connect(destination);
  for(const track of destination.stream.getTracks())stream.addTrack(track);
  const recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:8000000});
  const chunks=[];
  const output=new Promise((resolve,reject)=>{
   recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
   recorder.onstop=()=>resolve(new Blob(chunks,{type:recorder.mimeType}));
   recorder.onerror=event=>reject(event.error??Error('Video recording failed.'));
  });
  const ctx=canvas.getContext('2d');
  paintReel(ctx,canvas.width,canvas.height,0,shots);
  recorder.start();
  const start=audio.currentTime;
  source.start();
  let timer;
  try{
   timer=setInterval(()=>{
    const elapsed=audio.currentTime-start;
    if(elapsed>=duration){clearInterval(timer);if(recorder.state==='recording')recorder.stop();return;}
    paintReel(ctx,canvas.width,canvas.height,elapsed,shots);
   },1000/30);
   return await output;
  }finally{clearInterval(timer);}
 }finally{
  source?.disconnect();
  stream.getTracks().forEach(track=>track.stop());
  await audio.close();
 }
}
