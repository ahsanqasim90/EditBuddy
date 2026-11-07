import test from 'node:test';import assert from 'node:assert/strict';
import {captionLayers,activeWordIndex,wordTransition,captionColours,supportOffset} from '../public/editor/caption-playback.js';
import {makeSrt} from '../public/editor/transcript-utils.js';
const captions=[{text:'pehla lafz',start:1,end:2},{text:'agla lafz',start:4,end:5}];
test('a phrase remains visible through silence until the next phrase starts without changing speech/SRT timings',()=>{const before=JSON.stringify(captions);for(const time of [2,2.8,3.999]){const layers=captionLayers(captions,time,7);assert.equal(layers.length,1);assert.equal(layers[0].caption.text,'pehla lafz');assert.equal(layers[0].opacity,1);}assert.equal(JSON.stringify(captions),before);assert.match(makeSrt(captions,7),/00:00:01,000 --> 00:00:02,000/);});
test('there is no blank frame at a phrase boundary and fade is continuous',()=>{for(const t of [4,4.001,4.04,4.08,4.159,4.16]){const layers=captionLayers(captions,t,7);assert.ok(Math.abs(layers.reduce((s,v)=>s+v.opacity,0)-1)<1e-8);}const mid=captionLayers(captions,4.08,7);assert.equal(mid.length,2);assert.ok(mid[0].opacity>0&&mid[1].opacity>0);assert.equal(captionLayers(captions,4.17,7).length,1);});
test('the last caption holds after speech then fades smoothly at media end',()=>{assert.equal(captionLayers(captions,6,7)[0].opacity,1);const a=captionLayers(captions,6.9,7)[0].opacity,b=captionLayers(captions,6.99,7)[0].opacity;assert.ok(a<1&&a>b&&b>0);assert.deepEqual(captionLayers(captions,7,7),[]);assert.deepEqual(captionLayers(captions,.5,7),[]);});
test('word hold uses the next spoken start rather than the previous end',()=>{const words=[{text:'stay',start:0,end:.3},{text:'next',start:1.5,end:2}];assert.equal(activeWordIndex(words,1.49),0);assert.equal(activeWordIndex(words,1.5),1);assert.equal(wordTransition(words,1.49).progress,1);const v=wordTransition(words,1.52);assert.equal(v.previous,0);assert.ok(v.progress>0&&v.progress<1);});
test('manual colours override automatic colours while preserving the selected design',()=>{const design={kind:'orbit',text:'#ffffff',accent:'#e0ff58'};assert.deepEqual(captionColours(design,true,'#aa22bb','#3366ff'),{text:'#aa22bb',accent:'#3366ff'});assert.equal(design.kind,'orbit');assert.equal(captionColours(design,false,'#aa22bb','#3366ff').text,'#ffffff');});

test('fast word changes spend most of their slot fully visible',()=>{const w=[{start:0,end:.02},{start:.04,end:.08},{start:.12,end:.3}];assert.equal(wordTransition(w,.02).progress,1);assert.equal(wordTransition(w,.06).progress,1);assert.equal(wordTransition(w,.1).index,1);});
test('single word phrase changes avoid the long double fade',()=>{const layers=captionLayers(captions,4.05,7,()=>true);assert.equal(layers.length,1);assert.equal(layers[0].opacity,1);});
test('supporting lines move in opposite directions with bounded continuous drift',()=>{const left=supportOffset(.5,0,100,-1),right=supportOffset(.5,0,100,1);assert.ok(left<0&&right>0);assert.equal(left,-right);assert.ok(Math.abs(right)<=4.5);assert.ok(Math.abs(supportOffset(.501,0,100,1)-right)<.02);});

test('short spoken slots finish the reveal within the first half of the slot',async()=>{
 const {wordRevealDuration}=await import('../public/editor/caption-playback.js');
 const words=[{start:0,end:.04},{start:.04,end:.15},{start:.15,end:.6}];
 assert.ok(wordRevealDuration(words,0,.26)<.02);
 assert.ok(wordRevealDuration(words,1,.26)<.055);
 assert.ok(wordRevealDuration(words,2,.16,.6)>.15);
});
