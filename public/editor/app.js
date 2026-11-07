import {exportMp4,mp4MimeType} from './mp4-export.js';
import {projectStorage} from './project-storage.js';
import {applyCorrection,correctionRule} from './transcript-dictionary.js';
import {loadReelSticker} from './reel-stickers.js';
import {planReel,paintReel,recordReel,loadReelBackground} from './voiceover-reel.js';
import {setupColourPicker} from './colour-picker.js';
import {captionLayers,captionColours} from './caption-playback.js';
import {romanize,applyRoman} from './romanize.js';
import {stylePresets,palettes,renderCaption,themeForPixels,chooseDesign} from './caption-design.js';
import {makeSrt,approximateWords,encodeWav,splitCaption,captionChunkLimit,shortCaptionChunks} from './transcript-utils.js';
'use strict';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d'),media=$('media'),bgVideo=$('bgVideo');
const colourPicker=setupColourPicker(canvas,pause,draw);
const templates=stylePresets;
const latinOutput=()=>['roman-hi','roman-ur','en'].includes($('language').value);
const sampleKey=()=>({'roman-hi':'Roman Hindi',hi:'Hindi Devanagari',en:'English','roman-ur':'Roman Urdu',ur:'Urdu',bn:'Bangla / Bengali'})[$('language').value]??'English';
let manualColours=false;
let autoDesignEnabled=false,designBusy=false,fontSerial=0;
let preparedAudio=null,uploadedFile=null,transcriptSource='sample',backendConfigured=false,transcribing=false,sourceRevision=0;
let mode='video',ratio='9:16',selected=0,captions=[],time=0,duration=8,playing=false,last=0,hasMedia=false,mediaUrl=null,bgUrl=null,bgImage=null,backgroundKind=null,backgroundFile=null,uploadSequence=0;
const samples={'Hindi Devanagari':['अपनी कहानी को नया अंदाज़ दो','हर शब्द एक कहानी कहता है','आज कुछ नया बनाओ'],English:['Every story starts with a word','Make yours stand out','Create something worth watching'], 'Roman Hindi':['Apni kahani ko naya andaaz do','Har lafz mein ek ehsaas','Ab kuch alag banao'], 'Roman Urdu':['Har kahani aik lafz se shuru hoti hai','Apne alfaaz ko naya andaaz do','Aao kuch naya banate hain'],Urdu:['ہر کہانی ایک لفظ سے شروع ہوتی ہے','اپنے الفاظ کو نیا انداز دو','آؤ کچھ نیا بناتے ہیں'],'Bangla / Bengali':['প্রতিটি গল্প একটি শব্দ দিয়ে শুরু হয়','তোমার কথাকে নতুন রূপ দাও','চলো নতুন কিছু তৈরি করি']};
function setSample(){transcriptSource='sample';updateTranscriptUI();captions=samples[sampleKey()].map((text,i)=>({text,start:i*duration/3,end:(i+1)*duration/3}));renderRows();}
function pause(){playing=false;media.pause();bgVideo.pause();$('play').textContent='▶';}
function seek(t){time=Math.max(0,Math.min(duration,t));if(hasMedia)media.currentTime=time;if(backgroundKind==='video'&&Number.isFinite(bgVideo.duration))bgVideo.currentTime=time%bgVideo.duration;updateClock();draw();}
function updateClock(){const f=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(Math.floor(n%60)).padStart(2,'0')}`;$('clock').textContent=`${f(time)} / ${f(duration)}`;$('scrub').max=duration;$('scrub').value=time;}
function valid(){let prev=0;for(const c of captions){if(!Number.isFinite(c.start)||!Number.isFinite(c.end)||c.start<prev||c.end<=c.start||c.end>duration+.001){$('timingError').textContent='Use ordered, non-overlapping timings within the clip.';return false;}prev=c.end;}$('timingError').textContent='';return true;}
function renderRows(){syncFullTranscript();const root=$('rows');root.replaceChildren();captions.forEach((c,i)=>{const row=document.createElement('div');row.className='caption-row';const text=document.createElement('textarea');text.value=c.text;text.setAttribute('aria-label',`Caption ${i+1}`);text.dir=$('language').value==='ur'?'rtl':'auto';text.oninput=()=>{c.text=latinOutput()?romanize(text.value):text.value;if(latinOutput()){c.romanText=c.text;}else{c.nativeText=c.text;}if(transcriptSource==='elevenlabs'){c.words=approximateWords(c);c.timingSource='estimated_after_edit';}renderWordRows();updateTranscriptUI();draw();};text.onkeydown=event=>{
 if(event.key!=='Enter'||event.shiftKey||event.isComposing)return;
 event.preventDefault();
 const parts=splitCaption(c,text.value,text.selectionStart);
 if(!parts){$('timingError').textContent='Place the cursor between two words to split.';return;}
 captions.splice(i,1,...parts);
 renderRows();
 const next=root.querySelectorAll('.caption-row textarea')[i+1];
 next.focus();
 next.setSelectionRange(0,0);
};text.onblur=()=>{text.value=c.text;};text.onfocus=()=>{pause();seek(c.start);};row.append(text);for(const key of ['start','end']){const input=document.createElement('input');input.type='number';input.min=0;input.max=duration;input.step='.01';input.value=c[key].toFixed(2);input.setAttribute('aria-label',`Caption ${i+1} ${key} seconds`);input.oninput=()=>{c[key]=Number(input.value);if(transcriptSource==='elevenlabs'){c.words=approximateWords(c);c.timingSource='estimated_after_edit';}valid();renderWordRows();updateTranscriptUI();draw();};row.append(input);}const del=document.createElement('button');del.textContent='×';del.setAttribute('aria-label',`Delete caption ${i+1}`);del.onclick=()=>{captions.splice(i,1);renderRows();};row.append(del);root.append(row);const focal=document.createElement('select');focal.className='focal-select';focal.setAttribute('aria-label',`Caption ${i+1} centre word`);focal.append(new Option('Centre word: automatic','auto'));const list=c.words?.length?c.words:c.text.split(/\s+/).map(text=>({text}));list.forEach((w,wi)=>focal.append(new Option(w.text,String(wi))));focal.value=Number.isInteger(c.focalIndex)?String(c.focalIndex):'auto';focal.onchange=()=>{if(focal.value==='auto')delete c.focalIndex;else c.focalIndex=Number(focal.value);draw();};const wrap=document.createElement('div');wrap.className='caption-options';wrap.append(focal);root.append(wrap);});valid();renderWordRows();updateTranscriptUI();draw();}
function applyTemplate(index){partPositions={};selectedPart=null;manualPosition=false;captionSelected=false;$('designAfterTranscript').checked=false;manualColours=false;$('fontFamily').value='template';$('palette').value='template';autoDesignEnabled=false;captions.forEach(c=>delete c.design);$('designStatus').textContent='Template selected. This style stays selected when you upload or transcribe.';selected=index;renderWordRows();const t=templates[index];$('fontSize').value=t.font;$('supportFontSize').value=52;$('posX').value=50;$('posY').value=t.y;$('textColor').value=index===9&&!hasMedia&&mode==='video'?'#66385f':t.text;$('highlight').value=index===9&&!hasMedia&&mode==='video'?'#96367f':t.hi;document.querySelectorAll('.template').forEach((b,i)=>b.classList.toggle('selected',i===index));updateControls();}
function updateControls(){$('positionX').value=$('posX').value;$('positionY').value=$('posY').value;$('supportFontOut').textContent=$('supportFontSize').value;colourPicker.sync();$('strokeOut').textContent=$('strokeWidth').value;$('motionOut').textContent=$('motion').value+'×';$('fontOut').textContent=$('fontSize').value;$('xOut').textContent=$('posX').value+'%';$('yOut').textContent=$('posY').value+'%';draw();}
function setRatio(r){ratio=r;const [w,h]=r.split(':').map(Number);canvas.width=r==='9:16'?720:r==='1:1'?900:1280;canvas.height=canvas.width*h/w;$('ratioLabel').textContent=r+' · Fit, no stretching';document.querySelectorAll('[data-ratio]').forEach(b=>b.classList.toggle('active',b.dataset.ratio===r));draw();}
function fit(source,target=ctx){const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight;if(!sw||!sh)return;const s=Math.min(target.canvas.width/sw,target.canvas.height/sh);target.drawImage(source,(target.canvas.width-sw*s)/2,(target.canvas.height-sh*s)/2,sw*s,sh*s);}
function wrap(text,maxWidth){const words=text.split(/\s+/);let lines=[],line='';for(const word of words){const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
let captionBounds, captionSelected=false, captionDrag, captionResize, manualPosition=false;
const selectionBox=$('captionSelection'), guides=$('positionGuides');
const marquee=$('captionMarquee');
let marqueeDrag;
let partPositions={},partBounds=[],selectedPart=null;
function showPositionGuides(){
 const grid=$('showGrid').checked;
 const safeZone=ratio==='9:16'&&$('showReelsSafeZone').checked;
 $('reelsSafeFrame').toggleAttribute('hidden',!safeZone);
 const snapX=!!captionDrag?.snapX,snapY=!!captionDrag?.snapY;
 guides.hidden=colourPicker.active||!(grid||snapX||snapY||safeZone);
 if(guides.hidden)return;
 const rect=canvas.getBoundingClientRect(),well=canvas.parentElement.getBoundingClientRect();
 guides.style.left=rect.left-well.left+'px';
 guides.style.top=rect.top-well.top+'px';
 guides.style.width=rect.width+'px';
 guides.style.height=rect.height+'px';
 guides.classList.toggle('show-grid',grid);
 guides.classList.toggle('snap-x',snapX);
 guides.classList.toggle('snap-y',snapY);
}
$('centerCaption').onclick=()=>setCaptionPosition(50,50);
$('showGrid').onchange=showPositionGuides;
$('showReelsSafeZone').onchange=showPositionGuides;
function collectCaptionBounds(left,top,right,bottom,part){
 if(part)partBounds.push({part,bounds:[left,top,right,bottom]});
 const b=captionBounds;
 captionBounds=b?[Math.min(left,b[0]),Math.min(top,b[1]),Math.max(right,b[2]),Math.max(bottom,b[3])]:[left,top,right,bottom];
}
function showCaptionSelection(){
 syncFormatButtons();
 selectionBox.hidden=!captionSelected||!captionBounds||colourPicker.active;
 if(selectionBox.hidden)return;
 const rect=canvas.getBoundingClientRect(),well=canvas.parentElement.getBoundingClientRect();
 const boxes=selectedPart?partBounds.filter(item=>item.part===selectedPart).map(item=>item.bounds):[];
 if(selectedPart&&!boxes.length){selectionBox.hidden=true;return;}
 const [left,top,right,bottom]=boxes.length?[
  Math.min(...boxes.map(b=>b[0])),Math.min(...boxes.map(b=>b[1])),
  Math.max(...boxes.map(b=>b[2])),Math.max(...boxes.map(b=>b[3]))
 ]:captionBounds;
 selectionBox.style.left=rect.left-well.left+left*rect.width/canvas.width-6+'px';
 selectionBox.style.top=rect.top-well.top+top*rect.height/canvas.height-6+'px';
 selectionBox.style.width=(right-left)*rect.width/canvas.width+12+'px';
 selectionBox.style.height=(bottom-top)*rect.height/canvas.height+12+'px';
}
function setCaptionPosition(x,y){
 manualPosition=true;
 $('posX').value=Math.round(Math.max(0,Math.min(100,x)));
 $('posY').value=Math.round(Math.max(0,Math.min(100,y)));
 updateControls();
}
for(const [field,axis] of [['positionX','posX'],['positionY','posY']]){
 $(field).addEventListener('change',()=>{
  if($(field).value===''){updateControls();return;}
  setCaptionPosition(Number($(axis==='posX'?field:'posX').value),Number($(axis==='posY'?field:'posY').value));
 });
}
canvas.addEventListener('pointerdown',event=>{
 if(colourPicker.active||event.button!==0||captionDrag||captionResize||marqueeDrag)return;
 const rect=canvas.getBoundingClientRect();
 const groupWasSelected=captionSelected&&selectedPart===null;
 const x=(event.clientX-rect.left)*canvas.width/rect.width;
 const y=(event.clientY-rect.top)*canvas.height/rect.height;
 const padX=6*canvas.width/rect.width,padY=6*canvas.height/rect.height;
 captionSelected=!!captionBounds&&x>=captionBounds[0]-padX&&x<=captionBounds[2]+padX&&y>=captionBounds[1]-padY&&y<=captionBounds[3]+padY;
 const hit=[...partBounds].reverse().find(({bounds:b})=>x>=b[0]&&x<=b[2]&&y>=b[1]&&y<=b[3]);
 const dragGroup=groupWasSelected&&captionSelected;
 if(!dragGroup&&!hit&&(!captionSelected||partBounds.length)){
  marqueeDrag={id:event.pointerId,x,y};
  captionSelected=false;
 }
 selectedPart=dragGroup?null:hit?.part??null;
 showCaptionSelection();
 if(marqueeDrag){canvas.setPointerCapture(event.pointerId);return;}
 if(!captionSelected)return;
 const active=selectedPart?(partPositions[selectedPart]??{x:0,y:0}):lastCaptionPosition;
 captionDrag={id:event.pointerId,left:event.clientX,top:event.clientY,x:active.x,y:active.y,part:selectedPart};
 canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener('pointermove',event=>{
 if(colourPicker.active)return;
 if(marqueeDrag?.id===event.pointerId){
  const rect=canvas.getBoundingClientRect(),well=canvas.parentElement.getBoundingClientRect();
  const x=Math.max(0,Math.min(canvas.width,(event.clientX-rect.left)*canvas.width/rect.width));
  const y=Math.max(0,Math.min(canvas.height,(event.clientY-rect.top)*canvas.height/rect.height));
  const left=Math.min(x,marqueeDrag.x),top=Math.min(y,marqueeDrag.y);
  const right=Math.max(x,marqueeDrag.x),bottom=Math.max(y,marqueeDrag.y);
  if(marquee.hidden&&Math.hypot((right-left)*rect.width/canvas.width,(bottom-top)*rect.height/canvas.height)<3)return;
  marquee.hidden=false;
  marquee.style.left=rect.left-well.left+left*rect.width/canvas.width+'px';
  marquee.style.top=rect.top-well.top+top*rect.height/canvas.height+'px';
  marquee.style.width=(right-left)*rect.width/canvas.width+'px';
  marquee.style.height=(bottom-top)*rect.height/canvas.height+'px';
  marqueeDrag.bounds=[left,top,right,bottom];
  return;
 }
 if(captionDrag?.id!==event.pointerId)return;
 const rect=canvas.getBoundingClientRect(),dx=event.clientX-captionDrag.left,dy=event.clientY-captionDrag.top;
 if(!captionDrag.moved&&Math.hypot(dx,dy)<3)return;
 captionDrag.moved=true;
 const x=captionDrag.x+dx*100/rect.width,y=captionDrag.y+dy*100/rect.height;
 if(captionDrag.part){partPositions[captionDrag.part]={x,y};draw();return;}
 captionDrag.snapX=Math.abs(x-50)*rect.width/100<=8;
 captionDrag.snapY=Math.abs(y-50)*rect.height/100<=8;
 setCaptionPosition(captionDrag.snapX?50:x,captionDrag.snapY?50:y);
});
canvas.addEventListener('pointerup',event=>{
 if(marqueeDrag?.id!==event.pointerId||!marqueeDrag.bounds||!captionBounds)return;
 const [left,top,right,bottom]=marqueeDrag.bounds;
 const [x1,y1,x2,y2]=captionBounds;
 captionSelected=left<=Math.max(0,x1)&&top<=Math.max(0,y1)&&right>=Math.min(canvas.width,x2)&&bottom>=Math.min(canvas.height,y2);
 showCaptionSelection();
});
canvas.addEventListener('lostpointercapture',()=>{
 captionDrag=null;
 marqueeDrag=null;
 marquee.hidden=true;
 showPositionGuides();
});
selectionBox.addEventListener('pointerdown',event=>{
 const corner=event.target.dataset.corner;
 if(!corner||event.button!==0||colourPicker.active||captionDrag||captionResize||marqueeDrag)return;
 event.preventDefault();
 const rect=selectionBox.getBoundingClientRect();
 const x=(corner.endsWith('e')?1:-1)*rect.width/2;
 const y=(corner.startsWith('s')?1:-1)*rect.height/2;
 const inputs=selectedPart&&selectedPart!=='main'?[$('supportFontSize')]:!selectedPart&&['orbit','urdu-focus'].includes(templates[selected].kind)?[$('fontSize'),$('supportFontSize')]:[$('fontSize')];
 const sizes=inputs.map(input=>({input,start:Number(input.value)}));
 captionResize={id:event.pointerId,left:event.clientX,top:event.clientY,x,y,sizes};
 selectionBox.setPointerCapture(event.pointerId);
});
selectionBox.addEventListener('pointermove',event=>{
 if(captionResize?.id!==event.pointerId||colourPicker.active)return;
 const {left,top,x,y,sizes}=captionResize;
 const requestedScale=1+((event.clientX-left)*x+(event.clientY-top)*y)/(x*x+y*y);
 const minScale=Math.max(...sizes.map(({input,start})=>Number(input.min)/start));
 const maxScale=Math.min(...sizes.map(({input,start})=>Number(input.max)/start));
 const scale=Math.max(minScale,Math.min(maxScale,requestedScale));
 for(const {input,start} of sizes)input.value=Math.round(start*scale);
 updateControls();
});
selectionBox.addEventListener('lostpointercapture',()=>{captionResize=null;});
canvas.addEventListener('keydown',event=>{if(event.key==='Escape'){captionSelected=false;showCaptionSelection();}});
let lastCaptionPosition={x:50,y:65};
let reelStyles=null,reelRevision=-1,reelRendering=false;
const reelOptions=templates.map(style=>style.kind);
let reelBackgrounds=[],reelStickers=true,reelStickerLibrary=[];
$('reelStickerFiles').onchange=()=>{
 const labels=[...$('reelStickerFiles').files].map(file=>{
  const label=document.createElement('label'),input=document.createElement('input');
  input.type='text';
  input.value=file.name.replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ');
  label.append(file.name+' keywords ',input);
  return label;
 });
 $('reelStickerTags').replaceChildren(...labels);
};
for(const kind of reelOptions){
 const style=templates.find(item=>item.kind===kind);
 const label=document.createElement('label'),input=document.createElement('input');
 input.type='checkbox';input.value=kind;
 input.onchange=()=>{
  const checked=$('reelStyles').querySelectorAll('input:checked').length;
  for(const item of $('reelStyles').querySelectorAll('input'))item.disabled=checked===4&&!item.checked;
  $('generateReel').disabled=checked!==4;
  $('generateReel').textContent='Review selection · '+checked+'/4';
 };
 label.append(input,' '+style.name);
 $('reelStyles').append(label);
}
function activeReel(){return mode==='audio'&&reelRevision===sourceRevision&&transcriptSource==='elevenlabs'&&reelStyles&&captions.length;}
function reelShots(){return planReel(latinOutput()?applyRoman(captions,true):captions,reelStyles,reelBackgrounds,reelStickers,reelStickerLibrary);}
let reelRequest;
$('generateReel').onclick=()=>{
 const choices=[...$('reelStyles').querySelectorAll('input:checked')];
 if(mode!=='audio'||!hasMedia||transcriptSource!=='elevenlabs'||!captions.length){
  $('reelStatus').textContent='Upload and transcribe a voiceover first.';return;
 }
 if(choices.length!==4)return;
 reelRequest={revision:sourceRevision,styles:choices.map(input=>templates.find(item=>item.kind===input.value)),
  files:[...$('reelBackgrounds').files],stickers:$('reelStickers').checked,
  stickerFiles:[...$('reelStickerFiles').files],
  stickerTags:[...$('reelStickerTags').querySelectorAll('input')].map(input=>input.value)};
 $('reelReview').textContent=reelRequest.styles.map(style=>style.name).join(' · ')+
  (reelRequest.files.length?' — '+reelRequest.files.length+' uploaded background(s)':' — Automatic solid backgrounds');
 $('reelConfirm').showModal();
};
$('cancelReel').onclick=()=>$('reelConfirm').close();
$('confirmReel').onclick=async()=>{
 const request=reelRequest;
 $('reelConfirm').close();
 $('generateReel').disabled=true;
 $('reelStatus').textContent='Preparing reel and checking background contrast…';
 try{
  const [backgrounds,library]=await Promise.all([
   Promise.all(request.files.map(loadReelBackground)),
   Promise.all(request.stickers?request.stickerFiles.map((file,i)=>loadReelSticker(file,request.stickerTags[i])):[])
  ]);
  if(mode!=='audio'||request.revision!==sourceRevision)return;
  pause();
  reelStyles=request.styles;
  reelBackgrounds=backgrounds;
  reelStickers=request.stickers;
  reelStickerLibrary=library;
  reelRevision=request.revision;
  $('downloadReel').disabled=reelRendering;
  $('reelStatus').textContent='Preview ready. '+reelShots().filter(shot=>shot.sticker).length+' scenes have a sticker. Press Play to review.';
  seek(0);
  canvas.scrollIntoView({block:'nearest'});
 }catch(error){$('reelStatus').textContent=error.message;}
 finally{$('generateReel').disabled=$('reelStyles').querySelectorAll('input:checked').length!==4;}
};
$('clearReel').onclick=()=>{
 reelStyles=null;
 $('downloadReel').disabled=true;
 $('reelStatus').textContent='Manual preview restored.';
 draw();
};
$('downloadReel').onclick=async()=>{
 if(!activeReel()||reelRendering)return;
 pause();
 reelRendering=true;
 $('downloadReel').disabled=true;
 $('reelStatus').textContent='Rendering with audio. Keep this tab open and visible.';
 try{
  const blob=await recordReel(uploadedFile,duration,ratio,reelShots());
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=blob.type.startsWith('video/mp4')?'edit-buddy-reel.mp4':'edit-buddy-reel.webm';
  link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
  $('reelStatus').textContent='Downloaded '+link.download;
 }catch(error){$('reelStatus').textContent=error.message;}
 finally{reelRendering=false;$('downloadReel').disabled=!activeReel();}
};
function draw(){
 showPositionGuides();captionBounds=null;partBounds=[];
 if(colourPicker.active){selectionBox.hidden=true;colourPicker.paint();return;}
 paintProject(ctx,time,media,bgVideo,true);
 if(!activeReel())showCaptionSelection();
}
function paintProject(ctx,time,source,backdrop,preview=false,shots){
 const {width:W,height:H}=ctx.canvas;
 if(shots||activeReel()){
  if(preview)selectionBox.hidden=true;
  paintReel(ctx,W,H,time,shots??reelShots());return;
 }
 ctx.clearRect(0,0,W,H);
 ctx.fillStyle=$('background').value;ctx.fillRect(0,0,W,H);
 if(mode==='video'&&hasMedia&&source.readyState>=2)fit(source,ctx);
 if(mode==='audio'){
  if(backgroundKind==='image'&&bgImage)fit(bgImage,ctx);
  if(backgroundKind==='video'&&backdrop?.readyState>=2)fit(backdrop,ctx);
 }

const studioDemo=!hasMedia&&mode==='video'&&selected===9;if(studioDemo){ctx.fillStyle='#fbf5e5';ctx.fillRect(0,0,W,H);}
const groupSize=autoDesignEnabled?0:({'minimal-four':4,'pop-trio':3,'blur-reveal':3,'phrase-focus':4,'urdu-focus':3}[templates[selected].kind]||0);
let layers;
if(groupSize){
 const groups=[];
 let pending=[];
 for(const caption of captions){
  if((caption.manualSplit||templates[selected].kind==='urdu-focus')&&pending.length){groups.push(pending);pending=[];}
  for(const word of (caption.words?.length?caption.words:approximateWords(caption))){
   pending.push(word);
   if(pending.length===groupSize){groups.push(pending);pending=[];}
  }
  if((caption.manualSplit||templates[selected].kind==='urdu-focus')&&pending.length){groups.push(pending);pending=[];}
 }
 if(pending.length)groups.push(pending);
 const phrase=groups.findLast(group=>group[0].start<=time)??[];
 layers=phrase.length&&time<duration?[{caption:{text:phrase.map(w=>w.text).join(' '),words:phrase,start:phrase[0].start,end:phrase.at(-1).end},time,opacity:1}]:[];
}else{
 const playbackCaptions=captions.flatMap(caption=>
  {
   const limit=captionChunkLimit((autoDesignEnabled?caption.design?.kind:null)||templates[selected].kind);
   return limit?shortCaptionChunks(caption,limit):[caption];
  }
 );
 layers=captionLayers(playbackCaptions,time,duration,c=>['solo','rise','negative'].includes((autoDesignEnabled?c.design?.kind:null)||templates[selected].kind));
}
if(templates[selected].kind==='editorial-rail'&&layers.length>1)layers=[{...layers.at(-1),opacity:1}];
const currentCaption=layers.at(-1)?.caption;
 if(preview)formatCue=currentCaption?cueFormatKey(currentCaption):null;
const currentKind=(autoDesignEnabled?currentCaption?.design?.kind:null)||templates[selected].kind;
const hasSupport=['property','property-negative','editorial','orbit','shine','urdu-focus'].includes(currentKind);
if(preview){
 $('supportSizeControl').hidden=!hasSupport;
 $('fontSizeLabel').textContent=hasSupport?'Main word size':'Font size';
}
for(const layer of layers){const styles=cueFormatting.get(cueFormatKey(layer.caption));let c=layer.caption;if(latinOutput())c=applyRoman([c],true)[0];
const template=templates[selected],d=autoDesignEnabled?c.design:null,kind=d?.kind||template.kind;
const colours=captionColours(d,manualColours,$('textColor').value,$('highlight').value);
const position={x:Number($('posX').value),y:(manualPosition?undefined:d?.y)??Number($('posY').value)};
if(preview)lastCaptionPosition=position;
renderCaption(ctx,c,layer.time,{onBounds:preview?collectCaptionBounds:undefined,partPositions,supportFontSize:Number($('supportFontSize').value),formatting:{...formatting,...styles?.whole},partFormatting:styles,width:W,height:H,kind,face:$('fontFamily').value==='template'?(d?.face||template.face):$('fontFamily').value,size:Number($('fontSize').value)*(d?.scale||1),...colours,...position,reveal:$('phraseReveal').value,customFace:$('fontFamily').value!=='template',stroke:Number($('strokeWidth').value),motion:Number($('motion').value),plate:d?.plate||false,opacity:layer.opacity,invert:!manualColours});}}
function modeChange(next){if(designBusy)return;pause();autoDesignEnabled=false;sourceRevision++;uploadedFile=null;preparedAudio=null;transcriptSource='sample';updateTranscriptUI();mode=next;uploadSequence++;if(mediaUrl)URL.revokeObjectURL(mediaUrl);media.removeAttribute('src');media.load();hasMedia=false;duration=8;time=0;$('videoMode').classList.toggle('active',mode==='video');$('audioMode').classList.toggle('active',mode==='audio');$('audioOptions').hidden=mode!=='audio';$('upload').accept=mode==='video'?'video/mp4,.mp4':'audio/mpeg,audio/wav,audio/x-wav,audio/mp4,.mp3,.wav,.m4a';$('upload').value='';$('uploadTitle').textContent=mode==='video'?'Drop your video here':'Drop your voiceover here';$('uploadHint').textContent=mode==='video'?'or click to browse · MP4 · up to 60s':'MP3, WAV or M4A · up to 60s';$('fileInfo').textContent='Your media stays in this browser during this stage.';$('error').textContent='';setSample();if(!manualColours){const t=templates[selected],demo=selected===9&&mode==='video';$('textColor').value=demo?'#66385f':t.text;$('highlight').value=demo?'#96367f':t.hi;}updateClock();}
async function upload(file){if(!file||transcribing||designBusy)return;const sequence=++uploadSequence,extension=file.name.split('.').pop().toLowerCase(),allowed=mode==='video'?['mp4']:['mp3','wav','m4a'];if(!allowed.includes(extension)){$('error').textContent='Please choose '+allowed.join(', ').toUpperCase()+'.';return;}pause();const url=URL.createObjectURL(file),probe=document.createElement(mode==='video'?'video':'audio');probe.preload='metadata';probe.src=url;try{await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(Error('This file took too long to read. Try another file.')),15000);probe.onloadedmetadata=()=>{clearTimeout(timeout);resolve();};probe.onerror=()=>{clearTimeout(timeout);reject(Error('This file could not be decoded. Try another file.'));};});if(sequence!==uploadSequence){URL.revokeObjectURL(url);return;}if(!Number.isFinite(probe.duration)||probe.duration<=0||probe.duration>60)throw Error(`This file is ${probe.duration.toFixed(2)} seconds. Please trim it to 60 seconds or less before uploading.`);if(mediaUrl)URL.revokeObjectURL(mediaUrl);mediaUrl=url;media.src=url;uploadedFile=file;preparedAudio=null;sourceRevision++;duration=probe.duration;hasMedia=true;if(!manualColours){$('textColor').value=templates[selected].text;$('highlight').value=templates[selected].hi;}time=0;$('fileInfo').textContent=`${file.name} · ${duration.toFixed(2)}s · ${(file.size/1048576).toFixed(1)} MB. Loaded locally; transcribe to replace the demo captions.`;$('error').textContent='';setSample();updateClock();}catch(e){URL.revokeObjectURL(url);if(sequence===uploadSequence)$('error').textContent=e.message;}}
$('upload').onchange=e=>upload(e.target.files[0]);$('drop').ondragover=e=>e.preventDefault();$('drop').ondrop=e=>{e.preventDefault();upload(e.dataTransfer.files[0]);};$('videoMode').onclick=()=>modeChange('video');$('audioMode').onclick=()=>modeChange('audio');$('play').onclick=async()=>{if(playing){pause();return;}if(time>=duration)seek(0);try{if(hasMedia){media.currentTime=time;await media.play();}if(mode==='audio'&&backgroundKind==='video')await bgVideo.play();playing=true;last=performance.now();$('play').textContent='Ⅱ';}catch(e){$('error').textContent='Your browser could not play this media. Try another file.';pause();}};$('restart').onclick=()=>{pause();seek(0);};$('scrub').oninput=e=>{pause();seek(Number(e.target.value));};media.onloadeddata=draw;media.onseeked=draw;media.onended=()=>{pause();time=duration;updateClock();draw();};$('language').onchange=()=>{if(designBusy)return;pause();if(transcriptSource==='sample'){setSample();seek(0);}else{captions=applyRoman(captions,latinOutput());renderRows();}updateTranscriptUI();draw();};$('loadDemo').onclick=()=>{if(transcribing)return;if(transcriptSource==='elevenlabs'&&!confirm('Replace your transcript edits with sample captions? Download SRT first to keep your text.'))return;pause();sourceRevision++;setSample();seek(0);};document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>setRatio(b.dataset.ratio));['fontSize','posX','posY','textColor','highlight','background','strokeWidth','motion'].forEach(id=>$(id).oninput=()=>{if(['textColor','highlight'].includes(id)){manualColours=true;$('designStatus').textContent='Your colours apply to every caption; layouts and timing stay in place.';}if(id==='posY'&&autoDesignEnabled){autoDesignEnabled=false;$('designStatus').textContent='Manual colours / positioning selected. Auto design is off.';}updateControls();});$('reset').onclick=()=>applyTemplate(selected);$('addRow').onclick=()=>{const start=captions.length?captions[captions.length-1].end:0;if(start>=duration-.01){$('timingError').textContent='Shorten the final caption first to make room.';return;}captions.push({text:'Your next words',start,end:duration,words:[],timingSource:'manual'});renderRows();};
$('clearBg').onclick=()=>{backgroundFile=null;if(bgUrl)URL.revokeObjectURL(bgUrl);bgUrl=null;bgImage=null;backgroundKind=null;bgVideo.pause();bgVideo.removeAttribute('src');$('bgUpload').value='';draw();};$('bgUpload').onchange=e=>setProjectBackground(e.target.files[0]);
function setProjectBackground(file){if(!file)return;backgroundFile=file;if(bgUrl)URL.revokeObjectURL(bgUrl);bgUrl=URL.createObjectURL(file);bgVideo.pause();if(file.type.startsWith('image/')){backgroundKind='image';bgImage=new Image();bgImage.onload=draw;bgImage.onerror=()=>{$('error').textContent='Background image could not be decoded.';};bgImage.src=bgUrl;}else if(file.name.toLowerCase().endsWith('.mp4')){backgroundKind='video';bgVideo.src=bgUrl;bgVideo.onloadeddata=draw;bgVideo.onerror=()=>{$('error').textContent='Background video could not be decoded.';};if(playing)bgVideo.play().catch(()=>{});}else{$('error').textContent='Choose an image or MP4 background.';backgroundKind=null;}};
const exportButton=$('exportMp4'),exportStatus=$('mp4Status'),exportProgress=$('mp4Progress');
let exportController;
$('resolution').onchange=()=>{
 $('exportNote').textContent=$('resolution').value==='4K'
  ?'4K has four times the pixels of 1080p and takes more device processing and storage. No paid rendering is used.'
  :'Rendering runs in this browser. Keep this tab visible until the download is ready.';
};
if(!mp4MimeType()){
 exportButton.disabled=true;
 exportStatus.textContent='MP4 encoding is unavailable here. Try a recent desktop Chrome or Edge browser.';
}
$('cancelMp4').onclick=()=>exportController?.abort();
exportButton.onclick=async()=>{
 if(exportController||reelRendering||transcribing||designBusy)return;
 if(!uploadedFile||!hasMedia){exportStatus.textContent='Upload a video or voiceover first.';return;}
 if(transcriptSource==='sample'){exportStatus.textContent='Transcribe the clip before exporting captioned MP4.';return;}
 if(!captions.some(c=>c.text.trim())||!valid()){exportStatus.textContent='Check that captions have text and valid timings.';return;}
 const shots=activeReel()?reelShots():undefined;
 const quality=$('resolution').value;
 const file=uploadedFile;
 pause();
 const editor=[...document.querySelectorAll('main > :not(.export-bar)')];
 editor.forEach(element=>element.inert=true);
 exportController=new AbortController();
 exportButton.disabled=$('resolution').disabled=true;
 $('cancelMp4').hidden=exportProgress.hidden=false;
 exportProgress.value=0;
 exportStatus.textContent='Preparing '+quality+' export…';
 try{
  const blob=await exportMp4({
   file,video:mode==='video',background:!shots&&mode==='audio'&&backgroundKind==='video'?backgroundFile:null,
   duration,ratio,quality,signal:exportController.signal,
   paint:(ctx,time,source,backdrop)=>paintProject(ctx,time,source,backdrop,false,shots),
   onProgress:progress=>{
    exportProgress.value=progress;
    exportStatus.textContent='Rendering '+quality+' · '+Math.floor(progress*100)+'%';
   }
  });
  const url=URL.createObjectURL(blob),link=document.createElement('a');
  link.href=url;link.download=file.name.replace(/\.[^.]+$/,'')+'-captions-'+quality+'.mp4';
  link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
  exportStatus.textContent=quality+' MP4 download started.'+(blob.type.includes('vp9')
   ?' This browser uses VP9/Opus in MP4. Some editing apps may require H.264/AAC.' :'');
 }catch(error){
  exportStatus.textContent=error.name==='AbortError'?'Export cancelled. You can start again.':error.message;
 }finally{
  exportController=null;
  editor.forEach(element=>element.inert=false);
  exportButton.disabled=$('resolution').disabled=false;
  $('cancelMp4').hidden=exportProgress.hidden=true;
 }
};
$('help').onclick=()=>{$('status').showModal();checkBackend();};$('closeDialog').onclick=()=>$('status').close();
templates.forEach((t,i)=>{const b=document.createElement('button');b.className='template';b.innerHTML=`<span class="mini">${['word.','rise ↑','BIG<br>WORDS','highlight','say it simply','Aa / Aa','soft flow','INVERT','IMPACT','MAKE<br>STORIES','INVERSE','four words','GLOSS','pop in','soft focus','phrase focus','کہانی','│ editorial'][i]}</span><span><strong>${t.name}</strong><small>${t.desc}</small></span>`;b.onclick=()=>applyTemplate(i);b.querySelector('.mini').style.background='#f5f3ed';b.querySelector('.mini').style.color='#28352f';b.querySelector('.mini').style.textShadow='none';b.querySelector('.mini').style.fontFamily=t.face;b.querySelector('.mini').style.border='1px solid #d9ddd6';$('templates').append(b);});document.fonts.ready.then(()=>{document.querySelectorAll('.template .mini').forEach((el,i)=>{const t=templates[i],thumb=document.createElement('canvas');thumb.width=360;thumb.height=230;thumb.style.cssText='width:100%;height:100%;object-fit:contain';const tc=thumb.getContext('2d');tc.fillStyle='#f5f3ed';tc.fillRect(0,0,360,230);renderCaption(tc,{text:'make every word count',start:0,end:2},1.95,{width:360,height:230,kind:t.kind,face:t.face,size:t.font*.82,y:50,text:'#28352f',accent:'#28352f'});el.replaceChildren(thumb);});});
const table=document.createElement('table');table.innerHTML='<thead><tr><th>Template</th><th>Inspected reference / timestamps</th><th>Design notes</th></tr></thead>';const tbody=document.createElement('tbody');templates.forEach(t=>{const tr=document.createElement('tr');[t.name,t.ref,t.note].forEach(value=>{const td=document.createElement('td');td.textContent=value;tr.append(td);});tbody.append(tr);});table.append(tbody);$('referenceList').append(table);

const dictionaryKey='edit-buddy-transcript-dictionary';
let dictionary=[];
try{
 const saved=JSON.parse(localStorage.getItem(dictionaryKey)??'[]');
 if(Array.isArray(saved))dictionary=saved;
}catch{}
const dictionaryScript=()=>latinOutput()?'roman':$('language').value;
function persistDictionary(){
 try{localStorage.setItem(dictionaryKey,JSON.stringify(dictionary));return true;}
 catch{return false;}
}
function renderDictionary(){
 const list=$('dictionaryEntries');list.replaceChildren();
 dictionary.forEach((rule,index)=>{
  const row=document.createElement('li'),remove=document.createElement('button');
  row.textContent=rule.from.join(' ')+' → '+rule.to.join(' ')+' ('+rule.script+') ';
  remove.type='button';remove.textContent='Remove';
  remove.onclick=()=>{
   dictionary.splice(index,1);
   if(!persistDictionary())$('correctionStatus').textContent='Browser storage unavailable. Removed for this session.';
   renderDictionary();
  };
  row.append(remove);list.append(row);
 });
}
$('transcriptCorrection').onsubmit=event=>{
 event.preventDefault();
 if(transcribing||transcriptSource!=='elevenlabs')return;
 try{
  const roman=latinOutput();
  const replacement=$('correctionReplace').value;
  const rule=correctionRule($('correctionFind').value,roman?romanize(replacement):replacement,dictionaryScript());
  const count=applyCorrection(captions,rule,roman);
  let message=count+' matching occurrence(s) corrected.';
  if($('saveCorrection').checked){
   dictionary=dictionary.filter(item=>item.script!==rule.script||item.from.join(' ').toLowerCase()!==rule.from.join(' ').toLowerCase());
   dictionary.push(rule);
   message+=persistDictionary()?' Saved to My Dictionary.':' Browser storage unavailable. Saved for this session.';
   renderDictionary();
  }
  renderRows();
  $('correctionStatus').textContent=message;
 }catch(error){$('correctionStatus').textContent=error.message;}
};
renderDictionary();
function syncFullTranscript(){
 const content=transcriptSource==='elevenlabs'?captions.map(c=>c.text.trim()).filter(Boolean).join(' '):'';
 $('fullTranscript').hidden=!content;
 if($('transcriptText').value!==content){
  $('transcriptText').value=content;
  $('copyTranscriptStatus').textContent='';
 }
}
$('rows').addEventListener('input',syncFullTranscript);
$('wordRows').addEventListener('input',syncFullTranscript);
$('copyTranscript').onclick=async()=>{
 const field=$('transcriptText');
 try{
  await navigator.clipboard.writeText(field.value);
  $('copyTranscriptStatus').textContent='Transcript copied.';
 }catch{
  field.focus();field.select();
  $('copyTranscriptStatus').textContent='Transcript selected. Press Ctrl+C or Cmd+C to copy.';
 }
};
function updateTranscriptUI(){
 syncFullTranscript();
 const real=transcriptSource==='elevenlabs',roman=latinOutput();
 if(real&&uploadedFile)$('fileInfo').textContent=`${uploadedFile.name} · ${duration.toFixed(2)}s · Real transcript loaded.`;
 $('previewBadge').textContent=real?'REAL TRANSCRIPT':'SAMPLE CAPTIONS';
 $('romanNote').hidden=!roman;$('scriptInfo').textContent=roman?'English letters only. Hindi/Urdu characters are transliterated in preview and SRT; English words are preserved. No translation or extra API fee.':'Native script output. Spoken English words and brand names may remain in English.';
 $('checkAudio').disabled=!uploadedFile||transcribing;
 $('transcribe').disabled=!uploadedFile||!backendConfigured||transcribing;
 $('transcribe').textContent=transcribing?'Transcribing…':'Transcribe with Scribe v2';
 $('autoDesign').disabled=designBusy||!captions.length;
 $('srtDownload').disabled=!real||!captions.length||transcribing;
 $('language').disabled=transcribing;
 $('upload').disabled=transcribing;
 $('videoMode').disabled=transcribing;$('audioMode').disabled=transcribing;
 if(!transcribing){const approximate=captions.some(c=>c.timingSource==='estimated_after_edit'),normalized=captions.some(c=>c.timingSource==='normalized_provider');$('transcriptStatus').textContent=real?`Real Scribe v2 transcript. ${roman?'Latin-letter transliteration applied locally; check spellings. ':''}${approximate?'Some word timings are estimated after phrase edits.':normalized?'Some provider timing boundaries were adjusted; review word timings below.':'Word timestamps are editable below.'}`:'Sample captions. These words are not transcribed from your upload.';}
 $('alignmentNote').textContent=real?'Provider word timings drive the preview. Phrase edits recalculate word spacing and are marked estimated. Individual word edits preserve the other word timestamps.':'Sample word timings are evenly spaced, not speech aligned.';
}
function renderWordRows(){const root=$('wordRows');root.replaceChildren();if(transcriptSource!=='elevenlabs'){root.textContent='Word-level editing appears after real transcription.';return;}captions.forEach((c,ci)=>{const group=document.createElement('div');group.className='word-group';const title=document.createElement('p');title.textContent=`Caption ${ci+1} · ${c.timingSource==='estimated_after_edit'?'estimated after phrase edits':c.timingSource==='normalized_provider'?'provider timing boundaries adjusted':'editable word timing'}`;group.append(title);(c.words||[]).forEach((w,wi)=>{const row=document.createElement('div');row.className='word-row';const input=document.createElement('input');input.value=w.text;
const jumpToWord=()=>{pause();seek(w.start);};
input.onfocus=jumpToWord;
input.onclick=jumpToWord;
input.setAttribute('aria-label',`Caption ${ci+1} word ${wi+1} text`);input.onblur=()=>{input.value=w.text;};input.oninput=()=>{w.text=latinOutput()?romanize(input.value):input.value;if(latinOutput())w.romanText=w.text;else w.nativeText=w.text;c.text=c.words.map(w=>w.text).join(' ');updatePhraseText(ci,c.text);draw();};row.append(input);
if(templates[selected].kind==='urdu-focus'){
 const urdu=document.createElement('input');
 urdu.dir='rtl';urdu.placeholder='Urdu focus spelling';urdu.value=w.urduFocusOverride??'';
 urdu.setAttribute('aria-label',`Caption ${ci+1} word ${wi+1} Urdu focus spelling`);
 urdu.onchange=()=>{
  const spelling=urdu.value.trim();
  if(spelling&&!/^[\p{Script=Arabic}\p{M}\u200c\u200d]+$/u.test(spelling)){
   urdu.setCustomValidity('Enter one word in Urdu script.');urdu.reportValidity();return;
  }
  urdu.setCustomValidity('');
  w.urduFocusOverride=spelling||undefined;
  draw();
 };
 urdu.oninput=()=>urdu.setCustomValidity('');
 urdu.style.gridColumn="1 / -1";row.append(urdu);
}
['start','end'].forEach(key=>{const t=document.createElement('input');t.type='number';t.step='.001';t.min=0;t.max=duration;t.value=w[key];t.setAttribute('aria-label',`Caption ${ci+1} word ${wi+1} ${key}`);t.onchange=()=>{const value=t.value===''?NaN:Number(t.value),before=c.words[wi-1]??captions[ci-1],after=c.words[wi+1]??captions[ci+1];const start=key==='start'?value:w.start,end=key==='end'?value:w.end;if(!Number.isFinite(value)||start<0||end<=start||end>duration||(before&&start<before.end)||(after&&end>after.start)){$('timingError').textContent='Word timings must be ordered, within the clip, and not overlap.';t.value=w[key];return;}w[key]=value;c.start=c.words[0].start;c.end=c.words.at(-1).end;pause();seek(w.start);renderRows();};row.append(t);});group.append(row);});root.append(group);});}
function updatePhraseText(index,text){const row=$('rows').querySelectorAll('.caption-row')[index];if(row)row.querySelector('textarea').value=text;}
async function checkBackend(){try{const response=await fetch('/api/transcription-status',{cache:'no-store'});const state=await response.json();backendConfigured=response.ok&&state.configured;$('connectionStatus').textContent=backendConfigured?'Server key is configured. Upload a clip to transcribe. Balance and key permissions are verified on your first request.':(state.error||'API key not configured. Add ELEVENLABS_API_KEY as a secret in ChatGPT → Sites → Edit Buddy Captions → More actions → Settings, then redeploy.');}catch{$('connectionStatus').textContent='Cannot reach transcription backend. Sample editor remains available.';backendConfigured=false;}updateTranscriptUI();}
async function extractAudio(file){const AudioCtx=window.AudioContext||window.webkitAudioContext;if(!AudioCtx)throw Error('This browser does not support audio extraction. Use a recent Chrome browser.');const audio=new AudioCtx();let decoded;try{decoded=await audio.decodeAudioData(await file.arrayBuffer());}catch{throw Error('Audio could not be decoded. Try exporting the clip as H.264 MP4 with AAC audio, or upload a WAV voiceover.');}finally{await audio.close();}if(decoded.duration<.1||decoded.duration>60.01)throw Error('Decoded audio must be between 0.1 and 60 seconds.');const length=Math.min(960000,Math.round(decoded.duration*16000)),offline=new OfflineAudioContext(1,length,16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();const rendered=await offline.startRendering();return encodeWav(rendered.getChannelData(0));}
$('checkAudio').onclick=async()=>{if(!uploadedFile||transcribing)return;const revision=sourceRevision;const f=uploadedFile;$('checkAudio').disabled=true;$('transcriptStatus').textContent='Checking audio locally…';try{const wav=await extractAudio(f);if(revision!==sourceRevision)return;preparedAudio=wav;$('transcriptStatus').textContent=`Audio compatibility check passed: ${((wav.byteLength-44)/32000).toFixed(2)} seconds, mono 16 kHz. No transcription request was sent.`;}catch(e){$('error').textContent=e.message;}finally{$('checkAudio').disabled=!uploadedFile;}};
$('transcribe').onclick=async()=>{if(transcribing||designBusy||!uploadedFile||!backendConfigured)return;if(transcriptSource==='elevenlabs'&&!confirm('Transcribe again? This uses your ElevenLabs allowance and replaces transcript edits.'))return;pause();transcribing=true;let transcriptionSucceeded=false;const revision=sourceRevision;updateTranscriptUI();$('transcriptStatus').textContent='Preparing audio locally…';try{const wav=preparedAudio||await extractAudio(uploadedFile);if(revision!==sourceRevision)throw Error('Media changed. Please transcribe the current file.');$('transcriptStatus').textContent='Transcribing audio with ElevenLabs Scribe v2…';const requestedLanguage=$('speechLanguage').value;const speechLanguage=templates[selected].kind==='urdu-focus'&&requestedLanguage==='auto'?'urd':requestedLanguage;const response=await fetch('/api/transcribe?language='+encodeURIComponent(speechLanguage),{method:'POST',headers:{'Content-Type':'audio/wav'},body:wav,signal:AbortSignal.timeout(110000)});const data=await response.json();if(!response.ok)throw Error(data.error||'Transcription failed.');if(data.source!=='elevenlabs'||!Array.isArray(data.captions))throw Error('Unexpected transcription response.');if(revision!==sourceRevision)throw Error('Media changed. Previous result discarded.');transcriptionSucceeded=true;captions=applyRoman(data.captions,latinOutput());for(const rule of dictionary)if(rule.script===dictionaryScript())applyCorrection(captions,rule,latinOutput());autoDesignEnabled=false;transcriptSource='elevenlabs';renderRows();seek(0);$('error').textContent='';if(!captions.length)$('error').textContent='No speech was detected. No captions or SRT were created.';}catch(e){$('error').textContent=e.name==='TimeoutError'?'Request timed out. No automatic retry was made. Check your ElevenLabs usage before trying again.':e.message;}finally{transcribing=false;updateTranscriptUI();}if(transcriptionSucceeded&&captions.length&&$('designAfterTranscript').checked)$('autoDesign').click();};
$('srtDownload').onclick=()=>{if(transcriptSource!=='elevenlabs')return;try{if(!valid())return;const text=makeSrt(latinOutput()?applyRoman(captions,true):captions,duration);const url=URL.createObjectURL(new Blob([text],{type:'application/x-subrip;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=(uploadedFile?.name.replace(/\.[^.]+$/,'')||'edit-buddy')+'.srt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}catch(e){$('timingError').textContent=e.message;}};

$('fontFamily').onchange=async()=>{const family=$('fontFamily').value;try{if(family!=='template')await document.fonts.load(`700 48px "${family}"`);$('fontStatus').textContent=family==='template'?'Using each template’s font pairing.':'Selected font applies to every caption, including auto-designed layouts.';draw();}catch{$('fontStatus').textContent='Font could not load. Choose another font or upload your own.';}};$('phraseReveal').onchange=()=>draw();
$('fontUpload').onchange=async(e)=>{const file=e.target.files[0];if(!file)return;if(!/\.(woff2?|ttf|otf)$/i.test(file.name)||file.size>5*1024*1024){$('fontStatus').textContent='Choose WOFF2, WOFF, TTF or OTF up to 5 MB.';return;}try{const family='CustomFont'+(++fontSerial),font=new FontFace(family,await file.arrayBuffer());await font.load();document.fonts.add(font);const option=new Option(file.name,family);$('fontFamily').append(option);$('fontFamily').value=family;$('fontStatus').textContent=file.name+' loaded locally. It will reset when this page closes.';draw();}catch{$('fontStatus').textContent='This font could not be loaded. Try another font file.';}};
$('palette').onchange=()=>{const p=palettes[$('palette').value];if(p){$('textColor').value=p.text;$('highlight').value=p.accent;}else{$('textColor').value=templates[selected].text;$('highlight').value=templates[selected].hi;}manualColours=true;updateControls();};
$('clearAuto').onclick=()=>{autoDesignEnabled=false;captions.forEach(c=>delete c.design);$('designStatus').textContent='Using the selected template and manual styling.';draw();};
async function waitVideo(video,event,trigger){await new Promise((resolve,reject)=>{const timer=setTimeout(()=>{cleanup();reject(Error('The video frame could not be read. Try again after playback loads.'));},8000);const done=()=>{cleanup();resolve();},bad=()=>{cleanup();reject(Error('Cannot decode background video.'));};function cleanup(){clearTimeout(timer);video.removeEventListener(event,done);video.removeEventListener('error',bad);}video.addEventListener(event,done,{once:true});video.addEventListener('error',bad,{once:true});trigger();});}
$('autoDesign').onclick=async()=>{if(designBusy||!captions.length)return;pause();designBusy=true;$('autoDesign').disabled=true;const revision=sourceRevision,clip=captions,goal=$('designGoal').value;let probe=null,source=null;try{const sourceUrl=mode==='video'?mediaUrl:backgroundKind==='video'?bgUrl:null;if(sourceUrl){probe=document.createElement('video');probe.muted=true;probe.playsInline=true;await waitVideo(probe,'loadeddata',()=>{probe.src=sourceUrl;probe.load();});source=probe;}else if(mode==='audio'&&bgImage)source=bgImage;
const thumb=document.createElement('canvas');thumb.width=180;thumb.height=Math.round(180*canvas.height/canvas.width);const tc=thumb.getContext('2d',{willReadFrequently:true});const palette=$('palette').value==='template'?templates[selected].palette:$('palette').value;let position=Number($('posY').value);
for(let i=0;i<clip.length;i++){if(revision!==sourceRevision||clip!==captions)throw Error('Media or captions changed. Run auto design again.');const c=clip[i];const words=c.words?.length?c.words:c.text.split(/\s+/).map(text=>({text}));const kind=chooseDesign(words,i,goal),preset=templates.find(t=>t.kind===kind),phrasePalette=$('palette').value==='template'?preset.palette:palette;$('designStatus').textContent=`Designing phrase ${i+1} of ${clip.length}…`;if(probe){const target=Math.min(probe.duration-.02,Math.max(0,(c.start+c.end)/2));if(Math.abs(probe.currentTime-target)>.01)await waitVideo(probe,'seeked',()=>{probe.currentTime=target;});}
tc.fillStyle=$('background').value;tc.fillRect(0,0,thumb.width,thumb.height);if(source){const sw=source.videoWidth||source.naturalWidth,sh=source.videoHeight||source.naturalHeight,scale=Math.min(thumb.width/sw,thumb.height/sh);tc.drawImage(source,(thumb.width-sw*scale)/2,(thumb.height-sh*scale)/2,sw*scale,sh*scale);}const candidates=$('adaptPosition').checked?[55,72,84]:[position];let best=null;for(const y of candidates){const top=Math.max(0,Math.min(thumb.height-30,Math.round(thumb.height*y/100)-15)),pixels=tc.getImageData(15,top,thumb.width-30,30).data;const theme=themeForPixels(pixels,phrasePalette),score=theme.contrast-theme.variance*40;if(!best||score>best.score)best={...theme,y,score};}
c.design={...best,kind,face:preset.face,scale:kind==='condensed'?1.4:kind.startsWith('property')?.9:kind==='strip'?.7:1};}
manualPosition=false;autoDesignEnabled=true;$('designStatus').textContent=`${clip.length} phrases designed. ${source?'One background frame sampled per phrase':'Solid background analysed'}. Colours, backing and layouts are automatic; keywords use text rules. No vision AI, face detection or extra API charge.`;draw();}catch(e){autoDesignEnabled=false;$('designStatus').textContent=e.message;}finally{designBusy=false;$('autoDesign').disabled=false;if(probe){probe.removeAttribute('src');probe.load();}}};
document.fonts.ready.then(draw);
document.fonts.load('700 80px "Noto Nastaliq Urdu"').then(draw).catch(()=>{});
checkBackend();
$('supportFontSize').oninput=updateControls;
const formatting={letterCase:'template',bold:false,italic:false,underline:false};
$('captionCase').onchange=event=>{formatting.letterCase=event.target.value;draw();};
const cueFormatting=new Map();
let formatCue=null;
const cueFormatKey=caption=>JSON.stringify([sourceRevision,caption.start]);
const formatButtons=[['captionBold','bold'],['captionItalic','italic'],['captionUnderline','underline']];
function syncFormatButtons(){
 const styles=cueFormatting.get(formatCue);
 for(const [id,key] of formatButtons){
  $(id).disabled=!captionSelected||formatCue===null;
  $(id).setAttribute('aria-pressed',String(captionSelected&&!!(styles?.[selectedPart??'whole']?.[key]??styles?.whole?.[key])));
 }
}
for(const [id,key] of formatButtons){
 $(id).onclick=()=>{
  if(!captionSelected||formatCue===null)return;
  const part=selectedPart??'whole';
  const styles=cueFormatting.get(formatCue)??{};
  const value=!(styles[part]?.[key]??styles.whole?.[key]);
  if(part==='whole')for(const name of ['main','lead','tail'])if(styles[name])delete styles[name][key];
  styles[part]={...styles[part],[key]:value};
  cueFormatting.set(formatCue,styles);
  draw();
 };
}
const styleStorageKey='edit-buddy-saved-caption-styles';
const styleControls=['fontFamily','fontSize','supportFontSize','textColor','highlight','posX','posY','strokeWidth','motion','phraseReveal','captionCase'];
let savedCaptionStyles=[];
try{
 const stored=JSON.parse(localStorage.getItem(styleStorageKey)??'[]');
 if(Array.isArray(stored))savedCaptionStyles=stored;
}catch{}
const styleSelect=$('savedCaptionStyles'),styleStatus=$('captionStyleStatus');
function updateSavedStyles(value=''){
 styleSelect.replaceChildren(new Option('Choose a saved style',''),...savedCaptionStyles.map(style=>new Option(style.name,style.name)));
 styleSelect.value=value;
 styleSelect.onchange();
}
styleSelect.onchange=()=>{
 $('applyCaptionStyle').disabled=$('deleteCaptionStyle').disabled=!styleSelect.value;
};
function storeCaptionStyles(next){
 try{localStorage.setItem(styleStorageKey,JSON.stringify(next));}
 catch{styleStatus.textContent='Could not save styles in this browser.';return false;}
 savedCaptionStyles=next;
 return true;
}
$('saveCaptionStyle').onsubmit=event=>{
 event.preventDefault();
 const name=$('captionStyleName').value.trim();
 if(!name||savedCaptionStyles.some(style=>style.name.toLowerCase()===name.toLowerCase())){
  styleStatus.textContent='Enter a unique style name.';return;
 }
 const controls=Object.fromEntries(styleControls.map(id=>[id,$(id).value]));
 const style={name,kind:templates[selected].kind,controls,manualColours,partPositions};
 if(!storeCaptionStyles([...savedCaptionStyles,style]))return;
 updateSavedStyles(name);
 $('captionStyleName').value='';
 styleStatus.textContent='Style saved in this browser.';
};
$('applyCaptionStyle').onclick=()=>{
 const style=savedCaptionStyles.find(item=>item.name===styleSelect.value);
 const index=templates.findIndex(template=>template.kind===style?.kind);
 if(index<0)return;
 applyTemplate(index);
 for(const id of styleControls){
  const control=$(id),value=style.controls[id];
  if(value===undefined)continue;
  if(control.tagName==='SELECT'&&![...control.options].some(option=>option.value===value))continue;
  control.value=value;
 }
 formatting.letterCase=$('captionCase').value;
 manualColours=style.manualColours;
 partPositions={...style.partPositions};
 updateControls();
 styleStatus.textContent=style.controls.fontFamily!==$('fontFamily').value
  ?'Style applied. Upload its custom font again to use that font.'
  :'Style applied.';
};
$('deleteCaptionStyle').onclick=()=>{
 const name=styleSelect.value;
 if(!name||!storeCaptionStyles(savedCaptionStyles.filter(style=>style.name!==name)))return;
 updateSavedStyles();
 styleStatus.textContent='Saved style deleted.';
};
updateSavedStyles();
const projectStatus=$('projectStatus'),projectList=$('projectList');
const projectControls=[...styleControls,'language','speechLanguage','background','palette','designGoal','adaptPosition','designAfterTranscript','showGrid','showReelsSafeZone'];
let projectId=null,projectFile=null,projectBusy=false;
async function refreshProjects(value=''){
 const projects=await projectStorage('readonly',store=>store.getAll());
 projects.sort((a,b)=>b.updated-a.updated);
 projectList.replaceChildren(new Option('Choose a project',''),...projects.map(project=>new Option(project.name,project.id)));
 projectList.value=value;
 $('openProject').disabled=!projectList.value;
}
projectList.onchange=()=>$('openProject').disabled=!projectList.value;
$('saveProject').onclick=async()=>{
 if(projectBusy||transcribing||designBusy||reelRendering)return;
 const name=$('projectName').value.trim();
 if(!uploadedFile||!name){projectStatus.textContent='Upload a clip and enter a project name.';return;}
 const id=projectFile===uploadedFile&&projectId?projectId:crypto.randomUUID();
 const controls=Object.fromEntries(projectControls.map(id=>{
  const control=$(id);return [id,control.type==='checkbox'?control.checked:control.value];
 }));
 const cueStyles=[...cueFormatting].map(([key,value])=>[JSON.parse(key),value])
  .filter(([[revision]])=>revision===sourceRevision).map(([[,start],value])=>[start,value]);
 const project={id,name,updated:Date.now(),file:uploadedFile,backgroundFile,mode,ratio,time,
  captions,transcriptSource,kind:templates[selected].kind,controls,manualColours,
  manualPosition,partPositions,autoDesignEnabled,cueStyles};
 projectBusy=true;
 try{
  await projectStorage('readwrite',store=>store.put(project));
  projectId=id;projectFile=project.file;
  await refreshProjects(id);
  projectStatus.textContent='Project saved in this browser.';
 }catch(error){projectStatus.textContent='Could not save project. '+error.message;}
 finally{projectBusy=false;}
};
$('openProject').onclick=async()=>{
 if(projectBusy||transcribing||designBusy||reelRendering||!projectList.value)return;
 if(uploadedFile&&!confirm('Open this project? Save any current edits first.'))return;
 projectBusy=true;
 try{
  const project=await projectStorage('readonly',store=>store.get(projectList.value));
  if(!project)throw Error('Project could not be found.');
  const index=templates.findIndex(template=>template.kind===project.kind);
  modeChange(project.mode);
  $('clearBg').click();
  $('language').value=project.controls.language;
  await upload(project.file);
  if(uploadedFile!==project.file)throw Error($('error').textContent||'Media could not be opened.');
  if(index>=0)applyTemplate(index);
  for(const [id,value] of Object.entries(project.controls)){
   const control=$(id);
   if(control.type==='checkbox')control.checked=value;
   else if(control.tagName!=='SELECT'||[...control.options].some(option=>option.value===value))control.value=value;
  }
  captions=project.captions;
  transcriptSource=project.transcriptSource;
  manualColours=project.manualColours;
  manualPosition=project.manualPosition;
  partPositions=project.partPositions;
  autoDesignEnabled=project.autoDesignEnabled;
  formatting.letterCase=$('captionCase').value;
  for(const [start,value] of project.cueStyles)cueFormatting.set(cueFormatKey({start}),value);
  if(project.backgroundFile)setProjectBackground(project.backgroundFile);
  setRatio(project.ratio);
  renderRows();updateControls();seek(project.time);
  projectId=project.id;projectFile=project.file;
  $('projectName').value=project.name;
  projectStatus.textContent='Project resumed.';
 }catch(error){projectStatus.textContent='Could not resume project. '+error.message;}
 finally{projectBusy=false;}
};
refreshProjects().catch(()=>{projectStatus.textContent='Project storage is unavailable in this browser.';});
function frame(now){if(playing){time=hasMedia?media.currentTime:Math.min(duration,time+(now-last)/1000);if(time>=duration){pause();time=duration;}updateClock();}last=now;draw();requestAnimationFrame(frame);}setSample();applyTemplate(templates.findIndex(t=>t.kind==='orbit'));updateClock();requestAnimationFrame(frame);
