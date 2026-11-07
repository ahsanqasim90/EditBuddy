const tokens=text=>text.trim().split(/\s+/u).filter(Boolean);
const key=text=>text.normalize('NFC').toLowerCase();
const wordParts=/^([^\p{L}\p{M}\p{N}]*)(.*?)([^\p{L}\p{M}\p{N}]*)$/u;

export function correctionRule(find,replacement,script){
 const from=tokens(find),to=tokens(replacement);
 if(!from.length||from.length!==to.length)throw Error('Use the same number of words in Find and Replace to preserve caption timing.');
 return {from,to,script};
}

export function applyCorrection(captions,rule,roman){
 let count=0;
 for(const caption of captions){
  const words=caption.words?.length?caption.words:null;
  const values=words?words.map(word=>word.text):tokens(caption.text);
  let changed=false;
  for(let i=0;i<=values.length-rule.from.length;){
   const parts=values.slice(i,i+rule.from.length).map(value=>value.match(wordParts));
   if(!parts.every((part,index)=>part&&key(part[2])===key(rule.from[index]))){i++;continue;}
   parts.forEach((part,index)=>{
    const position=i+index,value=part[1]+rule.to[index]+part[3];
    values[position]=value;
    if(words){
     const word=words[position];
     if(roman){word.nativeText??=word.text;word.romanText=value;}
     else{word.nativeText=value;delete word.romanText;}
     word.text=value;
    }
   });
   i+=parts.length;
   count++;
   changed=true;
  }
  if(changed){
   if(roman)caption.nativeText??=caption.text;
   caption.text=values.join(' ');
   if(roman)caption.romanText=caption.text;
   else{caption.nativeText=caption.text;delete caption.romanText;}
  }
 }
 return count;
}
