import {urduHero} from './urdu-focus.js';
import {romanize} from './romanize.js';
import {wordTransition,wordRevealDuration} from './caption-playback.js';
export const palettes={
 electric:{name:'Electric lime',text:'#ffffff',accent:'#e0ff58',dark:'#10120b'},
 scarlet:{name:'Signal red',text:'#fff6e9',accent:'#ff5146',dark:'#271411'},
 violet:{name:'Studio violet',text:'#ffffff',accent:'#b696ff',dark:'#271845'},
 butter:{name:'Butter & ink',text:'#fff3c4',accent:'#ffd45a',dark:'#252219'},
 blush:{name:'Rose editorial',text:'#fff0ed',accent:'#eea3a6',dark:'#502c37'},
 ice:{name:'Ice blue',text:'#f2fbff',accent:'#82d9ff',dark:'#142a38'},
 mono:{name:'Pure monochrome',text:'#ffffff',accent:'#ffffff',dark:'#111111'},
 apricot:{name:'Apricot',text:'#fff4e9',accent:'#ffaf72',dark:'#3b251d'}
};
export const stylePresets=[
 {name:'Solo Beat',kind:'solo',desc:'Spring pop • one word',font:94,y:65,text:'#ffffff',hi:'#ffd45a',face:'StudioGrotesk',palette:'butter',ref:'1102 (1)(1).mp4 · 3.44 / 6.88 / 10.32 / 13.76 / 17.21s',note:'Centered single-word typography; added spring entry and alternating emphasis.'},
 {name:'Cinematic Rise',kind:'rise',desc:'Vertical reveal • soft serif',font:82,y:65,text:'#fff0ed',hi:'#eea3a6',face:'StudioSerif',palette:'blush',ref:'1102(1).mp4 · 0.55 / 1.09 / 1.64 / 2.19 / 2.73s',note:'Minimal single-word layouts observed. Vertical reveal motion is our interpretation.'},
 {name:'Property Bold',kind:'property',desc:'Bold focal word · tailored support',font:86,y:65,text:'#ffffff',hi:'#ffffff',face:'Inter',palette:'mono',ref:'anasshaikhonwork_ssspin.io_1793604477(1).mp4 · 3.99 / 7.98 / 11.96 / 15.95 / 19.94s',note:'Reworked into a restrained bold keyword with closely aligned supporting phrases. Original typography inspired by the inspected hierarchy; no subject masking.'},
 {name:'Highlight Strip',kind:'strip',desc:'Precise tracking • single-word accent',font:57,y:76,text:'#ffffff',hi:'#8750de',face:'StudioGrotesk',palette:'violet',ref:'mosaics(1).mp4 · 8.97 / 17.94 / 26.92 / 35.89 / 44.86s',note:'Purple caption strips. Added per-word active pill motion.'},
 {name:'Clean Talk',kind:'clean',desc:'Quiet captions • precise rhythm',font:52,y:78,text:'#ffffff',hi:'#82d9ff',face:'StudioGrotesk',palette:'ice',ref:'video 10.mp4 · previously inspected 6.82 / 20.47 / 34.12s',note:'Small white talking-head captions; added active-word colour.'},
 {name:'Editorial Stack',kind:'editorial',desc:'Serif details • bold focal word',font:100,y:61,text:'#fff0ed',hi:'#eea3a6',face:'StudioGrotesk',palette:'blush',ref:'typography videos(2)(1).mp4 · 0.37–1.86s; typography videos(3)(1).mp4 · 0.45–2.26s',note:'Small supporting text with a large focal phrase. Character art not copied.'},
 {name:'Soft Flow',kind:'flow',desc:'Italic phrases • staggered entry',font:66,y:65,text:'#fff3c4',hi:'#ffaf72',face:'StudioSerif',palette:'apricot',ref:'typography videos(4)(1).mp4 · 0.23 / 0.47 / 0.70 / 0.93 / 1.17s',note:'Light italic phrase build. Added individual fade and rise.'},
 {name:'Negative Cut',kind:'negative',desc:'Inverted text • scene interaction',font:112,y:65,text:'#ffffff',hi:'#ffffff',face:'StudioGrotesk',palette:'mono',ref:'Original template requested as negative text; no supplied negative-text example confirmed.',note:'Difference compositing inverts the video beneath each glyph. It is not subject masking.'},
 {name:'Condensed Impact',kind:'condensed',desc:'Tall headlines • punchy emphasis',font:132,y:65,text:'#fff6e9',hi:'#ff5146',face:'StudioCondensed',palette:'scarlet',ref:'condesed.mp4 · 8.05 / 16.11 / 24.16 / 32.21 / 40.26s',note:'Tall condensed type observed. Added kinetic headline builds; art and cutouts not copied.'},
 {name:'Type Studio',kind:'orbit',desc:'Tight headline • clean supporting lines',font:82,y:60,text:'#fffaf2',hi:'#dbc69c',face:'StudioCondensed',palette:'blush',ref:'typography videos(5).mp4 · 5s / 9s / 51s / 57s / 59s',note:'Inspected compact lead-in / condensed headline / resolution layouts. Rebuilt as original reusable typography; character art not copied.'},
 {name:'Property Negative',kind:'property-negative',desc:'Coloured inverse keyword · clean support',font:86,y:65,text:'#ffffff',hi:'#be87ed',face:'Inter',palette:'violet',ref:'Original coloured-negative variation of Property Bold; not a confirmed effect in the supplied references.',note:'Only the focal keyword uses coloured difference compositing against the footage. Supporting text stays solid. Highlight colour controls the inverse tint; no subject masking.'},
 {name:'Minimal Four',kind:'minimal-four',desc:'Four words · one plain line',font:60,y:76,text:'#ffffff',hi:'#ffffff',face:'Inter',palette:'mono',ref:'Original template',note:'Up to four spoken words in a single line.'},
 {name:'Soft Gloss',kind:'shine',desc:'Condensed hero word · metallic shine',font:86,y:56,text:'#ffffff',hi:'#b696ff',face:'StudioCondensed',palette:'violet',ref:'Attached video · bold white stacks with coloured emphasis',note:'A softly feathered diagonal highlight sweeps once over the condensed hero word.'},
 {name:'Pop Trio',kind:'pop-trio',desc:'Three small caps · blur to pop',font:80,y:64,text:'#ffffff',hi:'#ffffff',face:'Inter',palette:'mono',ref:'Original template',note:'Three equally sized words reveal one at a time and settle into a single line.'},
 {name:'Blur Reveal',kind:'blur-reveal',desc:'Three small caps · soft focus reveal',font:80,y:64,text:'#ffffff',hi:'#ffffff',face:'Inter',palette:'mono',ref:'Original template',note:'Words sharpen in place and settle into a single line.'},
 {name:'Phrase Focus',kind:'phrase-focus',desc:'Four words · blur together',font:76,y:64,text:'#ffffff',hi:'#ffffff',face:'Inter',palette:'mono',ref:'Original template',note:'The full phrase sharpens in place as one group.'},
 {name:'Urdu Focus',kind:'urdu-focus',desc:'Urdu focal word • Roman Hindi support',font:78,y:60,text:'#fffaf2',hi:'#ead3a8',face:'StudioGrotesk',palette:'butter',ref:'Original bilingual template',note:'Soft reveal with one Urdu focal word and Roman Hindi supporting lines.'},
 {name:'Editorial Rail',kind:'editorial-rail',desc:'Short left-aligned phrases • progress rail',font:56,y:68,text:'#ffffff',hi:'#8faf8a',face:'Inter',palette:'mono',ref:'Original template',note:'A fixed text block with a slim rail that fills as each phrase plays.'}
];
const stop=new Set('a an the is are to of for in on and or but with it this that my your you we i hai hain ho ka ki ke ko se aur mein main kar karo ye woh ek aik apne apni apna rakhein rakhe rakhna karein karna karen bas baat yaad'.split(' '));
const focalTerms=new Set('home homes shade shampoo hair color colour story captions caption website brand serum result results property apartment villa bedroom bedrooms garden terrace investment location spacious luxury offer sale free lichen professional'.split(' '));
export function focalWord(words){let best=0,score=-1;words.forEach((w,i)=>{const clean=w.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu,'');const value=(stop.has(clean)?-5:clean.length)+(focalTerms.has(clean)?8:0)+(/\d/.test(clean)?7:0);if(value>score){score=value;best=i;}});return best;}
export function luminance(rgb){return rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);}
export function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
const rgb=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
export function themeForPixels(data,palette='electric'){
 let sum=[0,0,0],n=0,lum=[];for(let i=0;i<data.length;i+=4){if(data[i+3]<128)continue;const p=[data[i],data[i+1],data[i+2]];p.forEach((v,j)=>sum[j]+=v);lum.push(luminance(p));n++;}if(!n)return {text:'#ffffff',accent:palettes[palette].accent,plate:true,variance:0,contrast:1};const mean=sum.map(v=>v/n),dark='#171a18',light='#ffffff';const text=contrast(rgb(light),mean)>=contrast(rgb(dark),mean)?light:dark;const key=Object.keys(palettes).includes(palette)?palette:'electric';let accent=palettes[key].accent;for(let i=0;i<8&&contrast(rgb(accent),mean)<4.5;i++){const target=text==='#171a18'?[23,26,24]:[255,255,255];accent='#'+rgb(accent).map((v,j)=>Math.round(v*.78+target[j]*.22).toString(16).padStart(2,'0')).join('');}const ratio=contrast(rgb(text),mean);const avg=lum.reduce((a,b)=>a+b,0)/n,variance=lum.reduce((s,v)=>s+(v-avg)**2,0)/n;const plate=variance>.035||ratio<5;return {text,accent,plate,variance,contrast:ratio};
}
export function chooseDesign(words,index,goal='mix'){
 if(goal==='premium')return index%3===1?'editorial':'orbit';if(goal==='property-bold')return 'property';if(goal==='property-negative')return 'property-negative';if(goal==='property')return index%2?'property-negative':'property';if(goal==='cinematic')return index%3===1?'negative':'rise';if(goal==='editorial')return index%2?'flow':'editorial';
 if(words.length<=2)return index%3===0?'negative':'solo';if(words.some(w=>/\d|free|sale|save|offer|price/i.test(w.text)))return 'condensed';return ['property','editorial','strip','condensed'][index%4];
}
export function clusterLayout(words,focal,base,maxWidth,measure,supportSize,supportScale=1){
 // Three connected lines preserve sentence order: lead-in / hero / resolution.
 const fit=(value,size,main)=>{while(size>10&&measure(value,size,main)>maxWidth)size*=.95;return size;};
 const main=words[focal],before=words.slice(0,focal),after=words.slice(focal+1);
 const mainSize=fit(main.text,base*1.45,true),heroWidth=measure(main.text,mainSize,true);
 const nodes=[{main:true,words:[main],x:0,y:0,size:mainSize,maxWidth}];
 for(const [group,side] of [[before,-1],[after,1]]){if(!group.length)continue;const value=group.map(w=>w.text).join(' '),size=fit(value,supportSize??base*.43*supportScale,false),width=measure(value,size,false);const edge=Math.max(heroWidth,width)/2;const x=supportSize!=null?0:side<0?-edge+width/2:edge-width/2;nodes.push({main:false,words:group,x,y:side*(mainSize*.47+size*.58),size,maxWidth});}
 return nodes;
}
export function propertyLayout(words,focal,base,maxWidth,measure,_supportSize,supportScale=1){
 const width=maxWidth*.86,fit=(text,size,main)=>{while(size>12&&measure(text,size,main)>width)size*=.96;return size;};
 const main=words[focal],size=fit(main.text,base*1.1,true),heroWidth=measure(main.text,size,true),nodes=[{main:true,words:[main],x:0,y:0,size,maxWidth:width}];
 for(const [group,side]of [[words.slice(0,focal),-1],[words.slice(focal+1),1]]){if(!group.length)continue;const text=group.map(w=>w.text).join(' '),s=fit(text,base*.4*supportScale,false),w=measure(text,s,false),blockWidth=Math.max(heroWidth,w);nodes.push({main:false,words:group,x:side<0?(-blockWidth+w)/2:(blockWidth-w)/2,y:side*(size*.48+s*.57),size:s,maxWidth:width});}return nodes;
}
function ease(t){return 1-(1-Math.max(0,Math.min(1,t)))**3;}
export function renderCaption(ctx,c,t,options){
 const {width:W,height:H,kind,face='StudioGrotesk',size=88,text='#ffffff',accent='#e0ff58',x=50,y=65,stroke=0,motion=1,plate=false,reveal='phrase',customFace=false,opacity=1,invert=true,formatting={},supportFontSize=52}=options;
 let words=c.words?.length?c.words:c.text.trim().split(/\s+/).map((text,i,a)=>({text,start:c.start+(c.end-c.start)*i/a.length,end:c.start+(c.end-c.start)*(i+1)/a.length}));if(!words.length)return;
 const {letterCase}=formatting;
 let {bold,italic:forceItalic,underline}=formatting;
 if(letterCase==='upper'||letterCase==='small'){
  const changeCase=value=>letterCase==='upper'?value.toUpperCase():value.toLowerCase();
  c={...c,text:changeCase(c.text)};
  words=words.map(word=>({...word,text:changeCase(word.text)}));
 }
 const current=words.findIndex(w=>t>=w.start&&t<w.end),active=current>=0?current:Math.max(0,words.findLastIndex(w=>w.start<=t));const local=t-words[active].start,enter=ease(local/(.16/Math.max(.25,motion))),base=size*W/720;
 const ox=W*x/100,oy=H*y/100,maxW=W*.84,rtl=/[\u0600-\u06ff]/.test(c.text),defaultFocal=Number.isInteger(c.focalIndex)&&c.focalIndex>=0&&c.focalIndex<words.length?c.focalIndex:focalWord(words);
 const mixed=kind==='urdu-focus';
 const meaningful=mixed?words.map((word,index)=>({word,index})).filter(({word})=>{
  const key=romanize(word.text).toLowerCase().replace(/[^a-z]/g,'');
  return !stop.has(key)&&!/^(is|us|iss|uss|yeh|woh|vo|hum|ham|tum|aap|tu|mujhe|mujh|tujhe|tujh|use|usse|ise|isse|unhe|unhein|inhe|inhein|unko|inko|mera|meri|mere|hamara|hamari|humara|tumhara|tumhari|aapka|aapki|apka|apki|apna|apni|apne|un|in|tab|jab|ya|bahut|bohat|karo|karein)$/.test(key);
 }):[];
 const known=meaningful.filter(({word})=>urduHero(word));
 const candidates=known.length?known:meaningful;
 const override=mixed?words.findIndex(word=>word.urduFocusOverride):-1;
 const focal=override>=0?override:mixed&&candidates.length&&!candidates.some(({index})=>index===defaultFocal)
  ?candidates[focalWord(candidates.map(({word})=>word))].index
  :defaultFocal;
 const mixedHero=mixed&&(override>=0||meaningful.some(({index})=>index===focal))?urduHero(words[focal]):undefined;
 ctx.save();ctx.globalAlpha*=opacity;ctx.textAlign='center';ctx.textBaseline='middle';ctx.direction=rtl?'rtl':'ltr';ctx.lineJoin='round';
 function font(s,weight=700,italic=false,family=face,smallCaps=false){
  ctx.font=`${italic||forceItalic?'italic ':''}${smallCaps&&letterCase!=='small'&&letterCase!=='upper'?'small-caps ':''}${bold?900:weight} ${s}px "${family}", Arial, sans-serif`;
 }
 let part;
 function fill(value,px,py,s){
  ctx.fillText(value,px,py);
  if(options.onBounds&&ctx.globalAlpha>.08&&value.trim()){
   const metrics=ctx.measureText(value),matrix=ctx.getTransform();
   options.onBounds(
    matrix.a*(px-metrics.width/2)+matrix.e,
    matrix.d*(py-s*.6)+matrix.f,
    matrix.a*(px+metrics.width/2)+matrix.e,
    matrix.d*(py+s*.6)+matrix.f,part
   );
  }
  if(underline){
   const metrics=ctx.measureText(value);
   const lineY=py+Math.max(s*.37,(metrics.actualBoundingBoxDescent||0)+s*.065);
   ctx.fillRect(px-metrics.width/2,lineY,metrics.width,Math.max(1,s*.055));
  }
 }
 function safeSize(value,s,width=maxW){font(s);while(ctx.measureText(value).width>width&&s>12){s*=.93;font(s);}return s;}
 function write(value,px,py,s,color=text,opts={}){if(!value)return;font(s,opts.weight||700,opts.italic,opts.family||face);ctx.save();if(opts.alpha!=null)ctx.globalAlpha*=opts.alpha;if(opts.negative){ctx.globalCompositeOperation='difference';ctx.fillStyle=color;}else{ctx.fillStyle=color;if(stroke>0){ctx.strokeStyle=color==='#171a18'?'#ffffff':'#171a18';ctx.lineWidth=stroke*W/720;ctx.strokeText(value,px,py);}ctx.shadowColor='#171a18';ctx.shadowBlur=(plate||kind==='clean')?s*.09:0;ctx.shadowOffsetY=kind==='clean'?2:0;}fill(value,px,py,s);ctx.restore();}
 function lines(list,s,width=maxW,weight=700,italic=false){font(s,weight,italic);let rows=[],line=[],used=0;for(let i=0;i<list.length;i++){const w=list[i],wi=words.indexOf(w),wordWidth=ctx.measureText(w.text).width,space=ctx.measureText(' ').width;if(line.length&&used+wordWidth+space>width){rows.push(line);line=[];used=0;}line.push({w,index:wi,width:wordWidth,space});used+=wordWidth+(line.length>1?space:0);}if(line.length)rows.push(line);return rows;}
 function pill(px,py,width,height,color){ctx.fillStyle=color;ctx.beginPath();ctx.roundRect(px-width/2,py-height/2,width,height,Math.min(10*W/720,height*.15));ctx.fill();}
 if(plate&&!['negative','orbit','editorial','property','property-negative'].includes(kind)){pill(ox,oy,maxW+base*.25,Math.min(H*.42,base*(['property','property-negative','editorial','orbit','shine'].includes(kind)?3.4:2.5)),text==='#171a18'?'#ffffffd9':'#171a18d9');}
 if(kind==='editorial-rail'){
  const value=words.slice(0,4).map(word=>word.text).join(' ');
  const weight=600,maxWidth=W*.59;
  let size=safeSize(value,base,maxWidth);
  font(size,weight);
  const railX=ox-W*.32,railHeight=base*1.13,railY=oy-railHeight/2,railWidth=Math.max(4,W*.012);
  const progress=Math.max(0,Math.min(1,(t-c.start)/Math.max(.01,c.end-c.start)));
  ctx.save();
  ctx.shadowColor="#171a18";
  ctx.shadowBlur=Math.max(2,W*.006);
  ctx.globalAlpha*=.8;
  ctx.fillStyle=text;
  ctx.fillRect(railX,railY,railWidth,railHeight);
  ctx.restore();
  ctx.fillStyle=accent;
  ctx.fillRect(railX,railY,railWidth,railHeight*progress);
  const width=ctx.measureText(value).width;
  write(value,railX+W*.023+width/2,oy,size,text,{weight});
 }else if(kind==='phrase-focus'){
  const value=words.slice(0,4).map(word=>word.text).join(' ');
  const size=safeSize(value,base);
  const clarity=ease((t-c.start)*Math.max(.25,motion)/.34);
  ctx.save();
  ctx.filter=`blur(${(1-clarity)*size*.13}px)`;
  write(value,ox,oy,size,text,{alpha:.35+.65*clarity});
  ctx.restore();
 }else if(kind==='pop-trio'||kind==='blur-reveal'){
  const trio=words.slice(0,3);
  const labels=trio.map(word=>letterCase==='upper'?word.text:word.text.toLowerCase());
  font(base,700,false,face,letterCase!=='upper');
  const size=Math.min(base,base*maxW/Math.max(1,ctx.measureText(labels.join(' ')).width*1.12));
  font(size,700,false,face,letterCase!=='upper');
  const order=rtl?[...trio.keys()].reverse():[...trio.keys()];
  let cursor=ox-ctx.measureText(labels.join(' ')).width/2;
  const gap=ctx.measureText(' ').width;
  for(const index of order){
   const label=labels[index];
   const width=ctx.measureText(label).width;
   const elapsed=t-trio[index].start;
   if(elapsed>=0){
    const progress=Math.min(1,elapsed/wordRevealDuration(trio,index,.26/Math.max(.25,motion),c.end));
    const clarity=ease(progress);
    const scale=1-.38*(1-clarity)+.22*Math.sin(Math.PI*progress)**2*clarity;
    ctx.save();
    ctx.translate(cursor+width/2,oy);
    if(kind==='pop-trio')ctx.scale(scale,scale);
    ctx.globalAlpha*=.25+.75*clarity;
    ctx.filter=`blur(${(1-clarity)*size*.11}px)`;
    ctx.fillStyle=text;
    fill(label,0,0,size);
    ctx.restore();
   }
   cursor+=width+gap;
  }
 }else if(kind==='minimal-four'){
  write(c.text,ox,oy,safeSize(c.text,base),text);
 }else if(kind==='solo'||kind==='rise'||kind==='negative'){
  const transition=wordTransition(words,t,motion);if(transition.index<0){ctx.restore();return;}
  ctx.translate(ox,oy);
  const paintWord=(index,alpha,outgoing=false)=>{const w=words[index],s=safeSize(w.text,base*(kind==='negative'?1.25:1)),p=outgoing?1:transition.progress;
   ctx.save();if(kind==='solo'){const scale=outgoing?1:.97+.03*p;ctx.scale(scale,scale);}
   if(kind==='rise'){ctx.beginPath();ctx.rect(-maxW/2,-s*.75,maxW,s*1.5);ctx.clip();}
   const rise=ease((t-w.start)/wordRevealDuration(words,index,.16/Math.max(.25,motion),c.end));
   const dy=kind==='rise'&&!outgoing?(1-rise)*s*.7:0;
   write(w.text,0,dy,s,index%3===1?accent:text,{alpha,negative:kind==='negative'&&invert,family:kind==='rise'&&!customFace?'StudioSerif':face,italic:kind==='rise'&&!customFace});ctx.restore();
  };
  if(transition.previous>=0&&transition.progress<1)paintWord(transition.previous,1-transition.progress,true);
  paintWord(transition.index,transition.progress);
 }else if(['property','property-negative','editorial','orbit','shine','urdu-focus'].includes(kind)){
  const main=words[focal],clusterStart=ease((t-c.start)*6*motion);const mainFace=mixed?'Noto Nastaliq Urdu':customFace?face:kind==='orbit'?'StudioCondensed':kind.startsWith('property')?'Inter':face;
  const supportFace=customFace?face:kind.startsWith('property')?'Inter':kind==='editorial'?'StudioSerif':'StudioText';
  const displayWords=words.map((w,i)=>mixed?{...w,text:i===focal?(mixedHero??romanize(w.text)):romanize(w.text)}:letterCase!=='small'&&i===focal&&(kind==='orbit'||kind==='shine')?{...w,text:w.text.toUpperCase()}:w);
  const nodes=(kind.startsWith('property')?propertyLayout:clusterLayout)(displayWords,focal,base,kind==='orbit'?W*.66:maxW,(value,s,isMain)=>{font(s,isMain?700:400,false,isMain?mainFace:supportFace);return ctx.measureText(value).width;},(kind==='orbit'||mixed)?supportFontSize*W/720:undefined,supportFontSize/52);
  if(mixed){
   const hero=nodes[0];
   const supporting=nodes.slice(1).flatMap(node=>{
    const count=Math.ceil(node.words.length/3);
    const perLine=Math.ceil(node.words.length/count);
    const side=Math.sign(node.y);
    return Array.from({length:count},(_,index)=>({
     ...node,words:node.words.slice(index*perLine,(index+1)*perLine),
     y:side*(hero.size*.53+node.size*.56)+node.size*1.16*(side<0?index-count+1:index)
    }));
   });
   nodes.splice(1,nodes.length-1,...supporting);
   const widths=nodes.map(node=>{
    font(node.size,node.main?700:400,false,node.main?mainFace:supportFace);
    return ctx.measureText(node.words.map(word=>word.text).join(' ')).width;
   });
   const blockWidth=Math.max(...widths);
   supporting.forEach((node,index)=>{
    node.x=Math.sign(node.y)*(blockWidth-widths[index+1])/2;
   });
  }
  const showAll=reveal==='phrase';
  for(const n of nodes){const visible=showAll?n.words:n.words.filter(w=>w.start<=t);if(!visible.length)continue;const value=visible.map(w=>w.text).join(' ');const isMain=n.main,p=ease((t-n.words[0].start)*7*motion),arrival=ease((t-c.start-(isMain?.055:n.y>0?.12:0))*7*motion);ctx.save();if(showAll||isMain)ctx.globalAlpha*=showAll?arrival:p;
   part=isMain?'main':n.y<0?'lead':'tail';
   ({bold,italic:forceItalic,underline}={...formatting,...options.partFormatting?.[part]});
   const offset=options.partPositions?.[part];
   if(offset)ctx.translate(offset.x*W/100,offset.y*H/100);
   let py=oy+n.y+(showAll?(1-clusterStart)*base*.12:(1-p)*base*.18);
   if(isMain){if(showAll&&!mixed){ctx.beginPath();ctx.rect(ox-maxW/2,py-n.size*.62,maxW,n.size*1.3);ctx.clip();py+=(1-arrival)*n.size*.45;}if(mixed)py+=(1-arrival)*n.size*.12;ctx.translate(ox,py);let fill=mixed&&!mixedHero?text:accent;
    if(kind==='shine'){
     font(n.size,700,false,mainFace);
     const width=ctx.measureText(value).width;
     const tilt=.26;
     const travel=n.size*.42+width*tilt*.28;
     const center=(ease((t-c.start)*Math.max(.25,motion)/1.1)-.5)*travel;
     const feather=n.size*.56;
     const gloss=ctx.createLinearGradient(tilt*(center-feather),center-feather,tilt*(center+feather),center+feather);
     const baseColor=rgb(accent);
     for(let i=0;i<=8;i++){
      const stop=i/8;
      const light=.38*Math.sin(Math.PI*stop)**2;
      const shade=baseColor.map(channel=>Math.round(channel+(255-channel)*light));
      gloss.addColorStop(stop,`rgb(${shade.join(',')})`);
     }
     fill=gloss;
    }
    write(value,0,0,n.size,fill,{family:mainFace,weight:700,negative:kind==='property-negative'});}
   else {
    const style={family:supportFace,weight:400,italic:kind==='editorial'};
    if(showAll){
     write(value,ox+n.x,oy+n.y,n.size,text,style);
    }else{
     font(n.size,400,style.italic,supportFace);
     const ordered=rtl?[...n.words].reverse():n.words;
     const widths=ordered.map(w=>ctx.measureText(w.text).width);
     const space=ctx.measureText(' ').width;
     let left=ox+n.x-(widths.reduce((sum,width)=>sum+width,0)+space*(ordered.length-1))/2;
     ordered.forEach((w,i)=>{
      const alpha=ease((t-w.start)/wordRevealDuration(displayWords,displayWords.indexOf(w),1/(7*motion),c.end));
      if(alpha>0)write(w.text,left+widths[i]/2,oy+n.y,n.size,text,{...style,alpha});
      left+=widths[i]+space;
     });
    }
   }
   ctx.restore();
  }
 }else if(kind==='condensed'){
  const visible=words.slice(0,active+1),full=words.map(w=>({...w,text:letterCase==='small'?w.text:w.text.toUpperCase()}));let s=base;let rows=lines(full,s,maxW,900);while((rows.length>3||rows.some(row=>row.some(word=>word.width>maxW)))&&s>1){s*=.88;rows=lines(full,s,maxW,900);}rows.forEach((row,ri)=>{const shown=row.filter(v=>full.indexOf(v.w)<=active),line=shown.map(v=>v.w.text).join(' ');if(!line)return;const py=oy+(ri-(rows.length-1)/2)*s*.95;const keyword=row.some(v=>full.indexOf(v.w)===focal);write(line,ox+(ri%2?W*.012:-W*.012),py,s,keyword?accent:text,{weight:900});});
 }else{
  const weight=kind==='flow'?400:kind==='strip'?800:700;
  let s=base,rows=lines(words,s,maxW,weight,kind==='flow');while((rows.length>3||rows.some(row=>row.some(word=>word.width>maxW)))&&s>1){s*=.9;rows=lines(words,s,maxW,weight,kind==='flow');}rows.forEach((row,ri)=>{const total=row.reduce((a,v)=>a+v.width+v.space,0)-(row.at(-1)?.space||0);let cursor=ox-total/2;for(const v of (rtl?[...row].reverse():row)){const {w,index,width,space}=v,px=cursor+width/2,py=oy+(ri-(rows.length-1)/2)*s*1.32;cursor+=width+space;if(kind==='flow'&&t<w.start)continue;const p=ease((t-w.start)/wordRevealDuration(words,index,1/(7*motion),c.end)),isActive=index===active;
    if(kind==='strip'&&isActive){pill(px,py,width+s*.26,s*1.2,accent);write(w.text,px,py-(1-enter)*s*.12,s,contrast([255,255,255],rgb(accent))>contrast([23,26,24],rgb(accent))?'#ffffff':'#171a18',{weight:800});}
    else write(w.text,px,py,s,kind==='clean'&&isActive?accent:text,{weight:kind==='flow'?400:700,italic:kind==='flow',alpha:p});
   }});
 }
 ctx.restore();
}
