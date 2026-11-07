import test from 'node:test';import assert from 'node:assert/strict';
import {romanize,applyRoman} from '../public/editor/romanize.js';
import {stylePresets,themeForPixels,chooseDesign,contrast,renderCaption,clusterLayout,focalWord} from '../public/editor/caption-design.js';
test('mixed Devanagari and English becomes Latin without translating English',()=>{assert.equal(romanize('mix करो, लगाओ, wait करो, फिर देखो।'),'mix karo, lagao, wait karo, phir dekho.');assert.equal(romanize('मैं अपने बालों का रंग बदलना चाहती हूँ'),'main apne baalon ka rang badalna chahti hoon');assert.ok(!/[\u0900-\u097f]/.test(romanize('वीडियो में फ़ॉन्ट बदलें १२३')));});
test('Urdu punctuation, common words and mixed English become Roman',()=>{assert.equal(romanize('آپ یہ mix کرو، پھر دیکھو۔'),'aap yeh mix karo, phir dekho.');assert.ok(!/[\u0600-\u06ff]/.test(romanize('خوبصورت captions ہیں')));});
test('romanization preserves word timestamps and can restore provider text',()=>{const source=[{text:'mix करो',start:.1,end:1,words:[{text:'mix',start:.1,end:.4},{text:'करो',start:.5,end:1}]}];const converted=applyRoman(source,true);assert.equal(converted[0].text,'mix karo');assert.equal(converted[0].words[1].start,.5);assert.equal(source[0].words[1].text,'करो');assert.equal(applyRoman(converted,false)[0].text,'mix करो');assert.equal(applyRoman(converted,true)[0].text,'mix karo');});
test('contrast analysis chooses dark ink on bright frames and light ink on dark frames',()=>{assert.equal(themeForPixels(new Uint8ClampedArray([255,255,255,255])).text,'#171a18');assert.equal(themeForPixels(new Uint8ClampedArray([0,0,0,255])).text,'#ffffff');assert.ok(contrast([255,255,255],[0,0,0])>20);const a=themeForPixels(new Uint8ClampedArray([255,255,255,255]),'blush').accent;assert.ok(contrast([1,3,5].map(i=>parseInt(a.slice(i,i+2),16)),[255,255,255])>=4.5);});
test('busy backgrounds request readability backing',()=>{const p=new Uint8ClampedArray([0,0,0,255,255,255,255,255]);assert.equal(themeForPixels(p).plate,true);});
test('all eighteen renderers draw at multiple word times without errors',()=>{let calls=0;const ctx=new Proxy({createLinearGradient:()=>({addColorStop(){}}),measureText:t=>({width:t.length*20}),fillText:()=>calls++,canvas:{width:720,height:1280}}, {get:(o,k)=>k in o?o[k]:()=>{},set:(o,k,v)=>{o[k]=v;return true;}});const c={text:'Sell your home faster today',start:0,end:3,words:['Sell','your','home','faster','today'].map((text,i)=>({text,start:i*.6,end:(i+1)*.6}))};for(const s of stylePresets)for(const t of [.1,1.3,2.7])renderCaption(ctx,c,t,{width:720,height:1280,kind:s.kind,size:s.font,face:s.face});assert.ok(calls>40);assert.equal(stylePresets.length,18);assert.equal(chooseDesign([{text:'50%'}],1,'property'),'property-negative');});

test('headline composition preserves surrounding sentence order in compact nonoverlapping lines',()=>{const w=['your','perfect','shade','starts','here'].map(text=>({text}));const n=clusterLayout(w,2,92,604,(text,size)=>text.length*size*.52);assert.equal(n[0].words[0].text,'shade');assert.equal(n[0].x,0);assert.equal(n.length,3);assert.equal(n[1].words.map(w=>w.text).join(' '),'your perfect');assert.equal(n[2].words.map(w=>w.text).join(' '),'starts here');for(const v of n){assert.ok(v.size>0);assert.ok(Math.abs(v.x)+v.words.map(w=>w.text).join(' ').length*v.size*.52/2<=303);}assert.ok(n[1].y<0&&n[2].y>0);assert.ok(n[2].y-n[2].size/2>n[0].size*.4);});
test('mixed Hindi sentence stays Latin through transcript, word editing and SRT',async()=>{const {makeSrt}=await import('../public/editor/transcript-utils.js');const source=[{text:'और order करें।',start:0,end:2,words:[{text:'और',start:0,end:.5},{text:'order',start:.5,end:1},{text:'करें।',start:1,end:2}]}];const result=applyRoman(source,true);assert.equal(result[0].text,'aur order karein.');assert.ok(!/[\u0900-\u097f]/.test(makeSrt(result,2)));assert.equal(result[0].words[2].end,2);});

test("focal word favours subject over common instruction words",()=>{assert.equal(focalWord("bas ek baat yaad rakhein result".split(" ").map(text=>({text}))),5);});

test('short layouts retain every timed word in the preview and voiceover reel',async()=>{
 const {captionChunkLimit,shortCaptionChunks}=await import('../public/editor/transcript-utils.js');
 const {planReel}=await import('../public/editor/voiceover-reel.js');
 const words='make every single caption clear today'.split(' ').map((text,i)=>({text,start:i*.23,end:i*.23+.18}));
 const cue={text:words.map(w=>w.text).join(' '),start:0,end:1.5,words};
 for(const style of stylePresets.filter(style=>captionChunkLimit(style.kind))){
  const limit=captionChunkLimit(style.kind);
  const chunks=shortCaptionChunks(cue,limit);
  const reel=planReel([cue],[style]).map(scene=>scene.caption);
  for(const list of [chunks,reel]){
   assert.ok(list.every(chunk=>chunk.words.length<=limit),style.kind);
   assert.deepEqual(list.flatMap(chunk=>chunk.words),words,style.kind);
  }
 }
});
