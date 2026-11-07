import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {transcribeAudio,normalizeWords,wavDuration,groupWords} from '../lib/transcription.mjs';
import {makeSrt,srtTime,encodeWav} from '../public/editor/transcript-utils.js';
const pcm=()=>encodeWav(new Float32Array(16000));
const fixture={language_code:'eng',words:[{type:'word',text:'Hello',start:.1,end:.4},{type:'spacing',text:' ',start:.4,end:.4},{type:'word',text:'world!',start:.5,end:.9}]};
test('PCM audio duration is checked from bytes, not user metadata',()=>{assert.equal(wavDuration(pcm()),1);assert.throws(()=>wavDuration(new ArrayBuffer(50)));});
test('WAV audio payloads reach adapter and retain mocked provider word timing',async()=>{for(const seconds of [1,3]){const buffer=encodeWav(new Float32Array(16000*seconds));let called=false;const result=await transcribeAudio(buffer,'TEST_ONLY_NOT_A_REAL_KEY','auto',async(url,options)=>{called=true;assert.equal(url,'https://api.elevenlabs.io/v1/speech-to-text');assert.equal(options.body.get('model_id'),'scribe_v2');assert.equal(options.body.get('timestamps_granularity'),'word');assert.equal(options.body.get('no_verbatim'),'false');assert.equal(options.body.get('language_code'),null);assert.equal(options.headers['xi-api-key'],'TEST_ONLY_NOT_A_REAL_KEY');assert.ok(options.body.get('file').size>44);return Response.json(fixture);});assert.ok(called);assert.equal(result.words.length,2);assert.deepEqual(result.captions[0].words,fixture.words.filter(w=>w.type==='word').map(({text,start,end})=>({text,start,end})));assert.match(makeSrt(result.captions,result.duration),/00:00:00,100 --> 00:00:00,900\nHello world!/);}});
test('overlong WAV never calls provider',async()=>{let called=false;await assert.rejects(()=>transcribeAudio(encodeWav(new Float32Array(16000*61)),'test','auto',async()=>{called=true;}),/60 seconds/);assert.equal(called,false);});
test('quota and key errors are actionable and do not echo provider response or key',async()=>{for(const status of [401,402,429])await assert.rejects(()=>transcribeAudio(pcm(),'secret','auto',async()=>new Response('sensitive provider details',{status})),e=>e.status===status&&!e.message.includes('secret')&&!e.message.includes('sensitive'));});
test('no speech produces no fake captions',()=>{assert.deepEqual(groupWords(normalizeWords({words:[]},1)),[]);});
test('invalid provider word times fail safely',()=>{assert.throws(()=>normalizeWords({words:[{type:'word',text:'x',start:0,end:NaN}]},1));});
test('SRT preserves Unicode, timing edits and multiline text',()=>{assert.equal(srtTime(59.9996),'00:01:00,000');assert.match(makeSrt([{text:'اردو\nবাংলা',start:.125,end:1.9}],2),/00:00:00,125 --> 00:00:01,900\nاردو\nবাংলা/);assert.throws(()=>makeSrt([{text:'one',start:1,end:.5}],2));assert.throws(()=>makeSrt([{text:'',start:0,end:1}],2));});
test('zero-duration words no longer reject an otherwise valid transcript',()=>{const raw={words:[{type:'word',text:'one',start:0,end:.2},{type:'word',text:'two',start:.3,end:.3},{type:'word',text:'three',start:.5,end:.8}]};const words=normalizeWords(raw,1);assert.equal(words[1].text,'two');assert.equal(words[1].start,.3);assert.ok(words[1].end>.3&&words[1].end<=.5);assert.equal(words[1].timingAdjusted,true);assert.equal(groupWords(words)[0].timingSource,'normalized_provider');assert.doesNotThrow(()=>makeSrt(groupWords(words),1));assert.equal(raw.words[1].end,.3);});
test('shared word starts, overlap and clip-end rounding preserve every word and produce valid SRT',()=>{for(const raw of [
 [{text:'a',start:.1,end:.4},{text:'b',start:.1,end:.4},{text:'c',start:.5,end:.8}],
 [{text:'a.',start:.1,end:.6},{text:'b',start:.5,end:.8}],
 [{text:'a',start:.1,end:.98},{text:'b',start:1,end:1}],
 [{text:'a',start:.1,end:.4},{text:'b',start:.39,end:.7}]
]){const words=normalizeWords({words:raw.map(w=>({...w,type:'word'}))},1);assert.equal(words.length,raw.length);words.forEach((w,i)=>{assert.ok(w.end>w.start);assert.ok(w.start>=0&&w.end<=1);if(i)assert.ok(w.start>=words[i-1].end);});assert.doesNotThrow(()=>makeSrt(groupWords(words),1));}});
test('missing and seriously malformed timings still fail rather than inventing alignment',()=>{for(const w of [{start:null,end:.4},{start:0,end:NaN},{start:.6,end:.1},{start:12,end:13}])assert.throws(()=>normalizeWords({words:[{type:'word',text:'word',...w}]},1));});
