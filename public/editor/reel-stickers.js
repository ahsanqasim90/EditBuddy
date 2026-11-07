const stickers=[
 {match:/^(idea|ideas|soch|creative|creativity)$/i,art:'<path fill="#ffd579" d="M28 78a31 31 0 1 1 44 0l-8 12H36z"/><path stroke="#584039" d="M40 91h20M43 98h14"/><circle cx="42" cy="57" r="3"/><circle cx="58" cy="57" r="3"/><path d="M46 65q4 5 8 0" fill="none" stroke="#584039"/>'},
 {match:/^(cat|cats|billi|funny|haha|mazak|mazaak)$/i,art:'<path fill="#f4ad9e" d="M13 59 17 18l28 18h10l28-18 4 41q0 31-37 31T13 59"/><path fill="none" stroke="#5d3542" d="M25 57q7-10 14 0m22 0q7-10 14 0M43 69q7 8 14 0"/><circle fill="#e47d82" cx="29" cy="68" r="5"/><circle fill="#e47d82" cx="71" cy="68" r="5"/>'},
 {match:/^(edit|editing|cut|trim|kaat)$/i,side:true,art:'<path fill="#f7ebd1" d="m14 15 75 5-7 69-68-8z"/><path stroke="#624364" stroke-width="6" d="M33 67 73 32M61 71 27 30"/><circle fill="#b594c9" cx="30" cy="71" r="10"/><circle fill="#b594c9" cx="65" cy="74" r="10"/>'},
 {match:/^(anime|magic|wow|spark|amazing|zabardast)$/i,art:'<path fill="#dbb0f6" d="M50 5 62 36 94 50 62 61 50 94 37 61 5 50 37 36z"/><path fill="#ffce80" d="m81 7 4 10 10 4-10 4-4 10-4-10-10-4 10-4z"/>'},
 {match:/^(retro|vintage|old|purana|camera|photo)$/i,side:true,art:'<rect x="10" y="26" width="80" height="54" rx="9" fill="#af725a"/><path fill="#f4d8a1" d="M11 38h78v14H11zM27 17h22v10H27z"/><circle cx="54" cy="54" r="19" fill="#503a41"/><circle cx="54" cy="54" r="11" fill="#a6bcc5"/>'},
 {match:/^(growth|grow|increase|increase[d]?|barhao|upward|graph)$/i,side:true,art:'<path fill="#e6d5a1" d="M10 12h80v76H10z"/><path fill="#547b69" d="M22 62h12v14H22zm22-15h12v29H44zm22-18h12v47H66z"/><path stroke="#343d36" stroke-width="3" fill="none" d="m20 55 25-18 26-18h-9m9 0v9"/>'},
 {match:/^(tip|tips|remember|note|yaad)$/i,art:'<rect x="4" y="28" width="92" height="44" rx="7" fill="#f9ce83"/><text x="50" y="56" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="15" fill="#472d40">TAKE NOTE</text>'}
];
const tokens=value=>value.toLowerCase().normalize('NFC').match(/[\p{L}\p{M}]+/gu)??[];

export async function loadReelSticker(file,keywords){
 const url=URL.createObjectURL(file);
 try{
  const image=new Image();
  image.src=url;
  await image.decode();
  return {image,keywords:tokens(keywords),side:image.naturalHeight>image.naturalWidth};
 }catch{throw Error('Could not open sticker '+file.name);}
 finally{URL.revokeObjectURL(url);}
}

export function matchReelSticker(caption,library=[]){
 const words=caption.words?.length?caption.words:caption.text.split(/\s+/).map(text=>({text,start:caption.start}));
 for(const word of words){
  const keys=tokens(word.text);
  const custom=library.find(sticker=>keys.some(key=>sticker.keywords.includes(key)));
  if(custom)return {...custom,start:word.start??caption.start};
 }
 for(const word of words){
  const sticker=stickers.find(item=>tokens(word.text).some(key=>item.match.test(key)));
  if(!sticker)continue;
  if(!sticker.image){
   sticker.image=new Image();
   sticker.image.src='data:image/svg+xml,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">'+sticker.art+'</svg>');
  }
  return {...sticker,start:word.start??caption.start};
 }
}

export function paintReelSticker(ctx,width,height,time,sticker){
 if(!sticker?.image.naturalWidth||time<sticker.start)return;
 const progress=Math.min(1,(time-sticker.start)/.28);
 const ease=1-(1-progress)**3;
 const side=sticker.side&&width>=height;
 const size=Math.min(width*.20,height*.19)*(.78+.22*ease);
 const x=width*(side?.86:.5)+(side?(1-ease)*size*.25:0);
 const y=height*(side?.31:.24)+(1-ease)*size*.22;
 ctx.save();
 ctx.globalAlpha=ease;
 const scale=size/Math.max(sticker.image.naturalWidth,sticker.image.naturalHeight);
 const w=sticker.image.naturalWidth*scale,h=sticker.image.naturalHeight*scale;
 ctx.drawImage(sticker.image,x-w/2,y-h/2,w,h);
 ctx.restore();
}
