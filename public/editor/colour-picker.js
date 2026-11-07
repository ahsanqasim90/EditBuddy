export function normalizeHex(value){const s=value.trim().replace(/^#/,'');return /^[0-9a-f]{6}$/i.test(s)?'#'+s.toLowerCase():null;}
export function pixelHex(data,width,x,y){const i=(Math.floor(y)*width+Math.floor(x))*4;return '#'+[data[i],data[i+1],data[i+2]].map(v=>v.toString(16).padStart(2,'0')).join('');}
export function setupColourPicker(canvas,pause,redraw){
 const $=id=>document.getElementById(id),ctx=canvas.getContext('2d'),status=$('colourPickerStatus');let selection=null;
 const names={textColor:'text',highlight:'highlight'};
 const sync=()=>{for(const id of Object.keys(names)){const input=$(id+'Hex');if(document.activeElement!==input){input.value=$(id).value.toUpperCase();input.removeAttribute('aria-invalid');}}};
 const announce=message=>{status.textContent=message;};
 const apply=(id,value)=>{$(id).value=value;$(id+'Hex').value=value.toUpperCase();$(id+'Hex').removeAttribute('aria-invalid');$(id).dispatchEvent(new Event('input',{bubbles:true}));announce(`${names[id]} colour set to ${value.toUpperCase()}.`);};
 function finish(value){if(!selection)return;const {id,trigger}=selection;selection=null;canvas.classList.remove('picking-colour');$('cancelColourPick').hidden=true;canvas.setAttribute('aria-label','Animated caption preview');if(value)apply(id,value);else announce('Colour selection cancelled. Your colour has not changed.');redraw();(panel.matches(':popover-open')?trigger:shortcut).focus();}
 function sample(){if(!selection)return;const {pixels,x,y}=selection;finish(pixelHex(pixels.data,pixels.width,x,y));}
 function paint(){if(!selection)return;const {pixels,x,y}=selection;ctx.putImageData(pixels,0,0);ctx.save();ctx.strokeStyle='#f5f3ed';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,10,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#171a18';ctx.lineWidth=2;ctx.stroke();ctx.beginPath();ctx.moveTo(x-16,y);ctx.lineTo(x+16,y);ctx.moveTo(x,y-16);ctx.lineTo(x,y+16);ctx.stroke();ctx.restore();}
 for(const id of Object.keys(names)){
  $(id+'Hex').addEventListener('input',e=>{const value=normalizeHex(e.target.value);e.target.setAttribute('aria-invalid',String(!value));if(value)apply(id,value);});
  $(id+'Hex').addEventListener('blur',e=>{if(!normalizeHex(e.target.value))announce('Enter a six-digit HEX colour, for example #8FAF8A.');});
  $(id+'Pick').onclick=e=>{pause();redraw();try{const pixels=ctx.getImageData(0,0,canvas.width,canvas.height);selection={id,pixels,x:Math.floor(canvas.width/2),y:Math.floor(canvas.height/2),trigger:e.currentTarget};canvas.classList.add('picking-colour');$('cancelColourPick').hidden=false;canvas.setAttribute('aria-label',`Pick ${names[id]} colour from preview. Arrow keys move, Shift moves faster, Enter selects, Escape cancels.`);announce(`Pick ${names[id]} colour: click the preview, or use arrow keys then Enter. Escape cancels.`);canvas.focus();paint();}catch{announce('This frame cannot be sampled. Use the colour swatch or enter a HEX code.');}};
  const screen=$(id+'Screen');screen.hidden=!('EyeDropper' in window);screen.onclick=async e=>{const trigger=e.currentTarget;if(selection)finish();try{pause();const result=await new window.EyeDropper().open();apply(id,result.sRGBHex);}catch(error){announce(error.name==='AbortError'?'Screen colour selection cancelled.':'Screen eyedropper unavailable. Use Pick from preview instead.');}finally{trigger.focus();}};
 }
 canvas.addEventListener('pointermove',e=>{if(!selection)return;const r=canvas.getBoundingClientRect();selection.x=Math.max(0,Math.min(canvas.width-1,Math.floor((e.clientX-r.left)*canvas.width/r.width)));selection.y=Math.max(0,Math.min(canvas.height-1,Math.floor((e.clientY-r.top)*canvas.height/r.height)));paint();});
 canvas.addEventListener('click',e=>{if(!selection)return;const r=canvas.getBoundingClientRect();selection.x=Math.max(0,Math.min(canvas.width-1,Math.floor((e.clientX-r.left)*canvas.width/r.width)));selection.y=Math.max(0,Math.min(canvas.height-1,Math.floor((e.clientY-r.top)*canvas.height/r.height)));sample();});
 canvas.addEventListener('keydown',e=>{if(!selection)return;if(e.key==='Escape'){e.preventDefault();finish();return;}if(e.key==='Enter'||e.key===' '){e.preventDefault();sample();return;}if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const step=e.shiftKey?10:1;selection.x=Math.max(0,Math.min(canvas.width-1,selection.x+(e.key==='ArrowRight'?step:e.key==='ArrowLeft'?-step:0)));selection.y=Math.max(0,Math.min(canvas.height-1,selection.y+(e.key==='ArrowDown'?step:e.key==='ArrowUp'?-step:0)));announce(`Preview colour ${pixelHex(selection.pixels.data,canvas.width,selection.x,selection.y).toUpperCase()}, position ${selection.x}, ${selection.y}. Enter to select.`);paint();}});
 const panel=$('colourTools'),shortcut=$('openColourTools');
 panel.addEventListener('beforetoggle',event=>{
  if(event.newState!=='open')return;
  const rect=shortcut.getBoundingClientRect();
  panel.style.left=Math.max(8,Math.min(rect.left,window.innerWidth-328))+'px';
  const top=Math.min(rect.bottom+8,Math.max(8,window.innerHeight-320));
  panel.style.top=top+'px';
  panel.style.maxHeight=Math.min(480,window.innerHeight-top-8)+'px';
 });
 $('cancelColourPick').onclick=()=>finish();sync();return {sync,paint,get active(){return Boolean(selection);}};
}
