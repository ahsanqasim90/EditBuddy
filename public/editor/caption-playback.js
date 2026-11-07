// Display holds are independent of editable provider/SRT speech timings.
export const TRANSITION_SECONDS=.16;
const clamp=v=>Math.max(0,Math.min(1,v));
const smooth=v=>{const p=clamp(v);return p*p*(3-2*p);};
export function captionLayers(captions,time,duration,isSingleWord=()=>false){
 if(time<0||time>=duration)return [];
 const list=captions.filter(c=>c.text.trim());
 const index=list.findLastIndex(c=>c.start<=time);
 if(index<0)return [];
 const caption=list[index],next=list[index+1],layers=[];
 // Fade only at the end of the media; pauses between phrases retain the text.
 const tail=next?1:smooth((duration-time)/Math.min(TRANSITION_SECONDS,Math.max(.01,duration-caption.start)));
 if(index>0){const previous=list[index-1],span=Math.min(isSingleWord(caption)||isSingleWord(previous)?.045:TRANSITION_SECONDS,Math.max(.005,((next?.start??duration)-caption.start)*(isSingleWord(caption)?.15:1)));const progress=smooth((time-caption.start)/span);if(progress<1)layers.push({caption:previous,time:Math.max(previous.start,caption.start-.001),opacity:1-progress});layers.push({caption,time,opacity:progress*tail});}
 else layers.push({caption,time,opacity:tail});
 return layers;
}
export function activeWordIndex(words,time){return words.findLastIndex(w=>w.start<=time);}
export function wordTransition(words,time,motion=1){const index=activeWordIndex(words,time);if(index<0)return {index,previous:-1,progress:0};const span=Math.min(.06/Math.max(.5,motion),Math.max(.004,((words[index+1]?.start??Infinity)-words[index].start)*.18));return {index,previous:index-1,progress:smooth((time-words[index].start)/span)};}
export function captionColours(design,manual,text,accent){return {text:manual?text:design?.text||text,accent:manual?accent:design?.accent||accent};}

export function supportOffset(time,start,base,side,motion=1){return (side<0?-1:1)*base*.045*Math.sin(Math.max(0,time-start)*1.8*Math.sqrt(Math.max(.25,motion)));}

// Finish the reveal early enough to leave most of each spoken slot readable.
export function wordRevealDuration(words,index,preferred,end=Infinity){
 const slot=(words[index+1]?.start??end)-words[index].start;
 return Math.min(preferred,Math.max(.008,slot*.35));
}
