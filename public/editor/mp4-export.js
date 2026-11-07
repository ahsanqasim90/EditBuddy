const FORMATS=['video/mp4;codecs=avc1.420034,mp4a.40.2','video/mp4'];

export function mp4MimeType(){
 return FORMATS.find(type=>globalThis.MediaRecorder?.isTypeSupported(type));
}

export function exportDimensions(ratio,quality){
 const short=quality==='4K'?2160:1080;
 const long=short*16/9;
 return ratio==='9:16'?[short,long]:ratio==='16:9'?[long,short]:[short,short];
}

function loadMedia(element,url,signal){
 return new Promise((resolve,reject)=>{
  const events=new AbortController();
  const finish=error=>{
   clearTimeout(timer);
   signal.removeEventListener('abort',cancel);
   events.abort();
   error?reject(error):resolve();
  };
  const cancel=()=>finish(signal.reason);
  const timer=setTimeout(()=>finish(Error('Media took too long to open.')),15000);
  const options={once:true,signal:events.signal};
  element.addEventListener('loadeddata',()=>finish(),options);
  element.addEventListener('error',()=>finish(Error('Could not decode the export media.')),options);
  signal.addEventListener('abort',cancel,{once:true});
  element.src=url;
 });
}

export async function exportMp4({file,video,background,duration,ratio,quality,paint,signal,onProgress}){
 const mimeType=mp4MimeType();
 const canvas=document.createElement('canvas');
 if(!mimeType||!canvas.captureStream)throw Error('MP4 encoding is unavailable here. Open the editor in a recent desktop Chrome or Edge browser.');
 if(document.hidden)throw Error('Keep this tab visible while exporting.');
 [canvas.width,canvas.height]=exportDimensions(ratio,quality);
 const ctx=canvas.getContext('2d');
 const source=document.createElement(video?'video':'audio');
 const backdrop=background?document.createElement('video'):null;
 source.playsInline=true;
 if(backdrop){backdrop.playsInline=true;backdrop.muted=true;backdrop.loop=true;}
 const url=URL.createObjectURL(file);
 const backgroundUrl=background?URL.createObjectURL(background):null;
 const audio=new AudioContext();
 const stream=canvas.captureStream(30);
 let recorder,frame,watchdog;
 try{
  await Promise.all([audio.resume(),loadMedia(source,url,signal),document.fonts.ready,
   backdrop?loadMedia(backdrop,backgroundUrl,signal):null]);
  signal.throwIfAborted();
  if(document.hidden)throw Error('Keep this tab visible while exporting.');
  const destination=audio.createMediaStreamDestination();
  audio.createMediaElementSource(source).connect(destination);
  for(const track of destination.stream.getAudioTracks())stream.addTrack(track);
  recorder=new MediaRecorder(stream,{mimeType,videoBitsPerSecond:quality==='4K'?26000000:9000000});
  paint(ctx,0,source,backdrop);
  return await new Promise((resolve,reject)=>{
   const events=new AbortController();
   const chunks=[];
   const stop=error=>{
    events.abort();
    cancelAnimationFrame(frame);
    clearTimeout(watchdog);
    source.pause();
    backdrop?.pause();
    if(recorder.state!=='inactive')recorder.stop();
    if(error)reject(error);
   };
   const options={signal:events.signal};
   signal.addEventListener('abort',()=>stop(signal.reason),options);
   document.addEventListener('visibilitychange',()=>{
    if(document.hidden)stop(Error('Export stopped because the tab was hidden. Keep it visible and retry.'));
   },options);
   recorder.ondataavailable=event=>{if(event.data.size)chunks.push(event.data);};
   recorder.onerror=()=>stop(Error('The MP4 encoder failed. Try 1080p or another browser.'));
   recorder.onstop=()=>{
    if(!chunks.length){reject(Error('The encoder did not produce an MP4.'));return;}
    resolve(new Blob(chunks,{type:recorder.mimeType}));
   };
   const tick=()=>{
    try{
     const time=source.currentTime;
     if(source.ended){stop();return;}
     if(backdrop&&Math.abs(backdrop.currentTime-time%backdrop.duration)>.2)backdrop.currentTime=time%backdrop.duration;
     paint(ctx,Math.min(time,duration),source,backdrop);
     onProgress(Math.min(time/duration,1));
     frame=requestAnimationFrame(tick);
    }catch(error){stop(error);}
   };
   try{
    recorder.start(1000);
    watchdog=setTimeout(()=>stop(Error('Export timed out. Try 1080p or a shorter clip.')),(duration+20)*1000);
    Promise.all([source.play(),backdrop?.play()]).then(tick,error=>stop(error));
   }catch(error){stop(error);}
  });
 }finally{
  cancelAnimationFrame(frame);
  clearTimeout(watchdog);
  for(const element of [source,backdrop].filter(Boolean)){
   element.pause();element.removeAttribute('src');element.load();
  }
  stream.getTracks().forEach(track=>track.stop());
  URL.revokeObjectURL(url);
  if(backgroundUrl)URL.revokeObjectURL(backgroundUrl);
  await audio.close();
 }
}
