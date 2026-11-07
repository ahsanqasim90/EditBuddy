import test from 'node:test';
import assert from 'node:assert/strict';
import {exportDimensions} from '../public/editor/mp4-export.js';

test('MP4 export preserves the canvas ratio at both resolutions',()=>{
 for(const [ratio,hd,uhd] of [
  ['9:16',[1080,1920],[2160,3840]],
  ['1:1',[1080,1080],[2160,2160]],
  ['16:9',[1920,1080],[3840,2160]]
 ]){
  assert.deepEqual(exportDimensions(ratio,'1080p'),hd);
  assert.deepEqual(exportDimensions(ratio,'4K'),uhd);
 }
});
