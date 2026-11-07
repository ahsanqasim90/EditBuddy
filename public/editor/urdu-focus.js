import {romanize} from './romanize.js';

const urduWords=new Map(Object.entries({
 hai:'ہے',hain:'ہیں',ho:'ہو',tha:'تھا',thi:'تھی',aur:'اور',ya:'یا',yeh:'یہ',woh:'وہ',
 ki:'کی',ka:'کا',ke:'کے',ko:'کو',se:'سے',mein:'میں',par:'پر',tak:'تک',is:'اس',us:'اس',
 jab:'جب',tab:'تب',karo:'کرو',karein:'کریں',kar:'کر',bahut:'بہت',bohat:'بہت',
 ek:'ایک',aik:'ایک',apni:'اپنی',apna:'اپنا',apne:'اپنے',liye:'لیے',nahi:'نہیں',
 ilaayachi:'الائچی',ilaaychi:'الائچی',ilaichi:'الائچی',elaichi:'الائچی',elaychi:'الائچی',cardamom:'الائچی',
 khushaboo:'خوشبو',khushboo:'خوشبو',khushbu:'خوشبو',gaarhi:'گاڑھی',garhi:'گاڑھی',patti:'پتی',
 doodh:'دودھ',zaiqa:'ذائقہ',zaiqay:'ذائقے',zaika:'ذائقہ',rawayat:'روایت',riwayat:'روایت',
 rishta:'رشتہ',rishton:'رشتوں',muft:'مفت',qeemat:'قیمت',bharosa:'بھروسا',
 tohfa:'تحفہ',tohfe:'تحفے',pakki:'پکی',garam:'گرم',mithaas:'مٹھاس',
 slider:'سلائیڈر',istemal:'استعمال',istemaal:'استعمال',istimaal:'استعمال',
 kam:'کم',kum:'کم',zyada:'زیادہ',ziyada:'زیادہ',
 kahani:'کہانی',story:'کہانی',ehsaas:'احساس',ehsas:'احساس',feeling:'احساس',
 mohabbat:'محبت',pyaar:'پیار',love:'محبت',dil:'دل',heart:'دل',
 zindagi:'زندگی',life:'زندگی',khwab:'خواب',khwaab:'خواب',dream:'خواب',
 khushi:'خوشی',happiness:'خوشی',dost:'دوست',friend:'دوست',dosti:'دوستی',
 yaad:'یاد',memory:'یاد',andaaz:'انداز',andaz:'انداز',style:'انداز',
 awaaz:'آواز',awaz:'آواز',voice:'آواز',lafz:'لفظ',word:'لفظ',
 waqt:'وقت',time:'وقت',safar:'سفر',journey:'سفر',rang:'رنگ',color:'رنگ',colour:'رنگ',
 roshni:'روشنی',light:'روشنی',umeed:'امید',hope:'امید',sukoon:'سکون',peace:'سکون',
 mehnat:'محنت',kamiyabi:'کامیابی',kamyabi:'کامیابی',success:'کامیابی',
 chai:'چائے',tea:'چائے',mehmaan:'مہمان',mehfil:'محفل',ghar:'گھر',home:'گھر',
 naya:'نیا',new:'نیا',khubsurat:'خوبصورت',khoobsurat:'خوبصورت',beautiful:'خوبصورت',
 tareeqa:'طریقہ',tarika:'طریقہ',idea:'خیال',khayal:'خیال',sach:'سچ',truth:'سچ',
 duniya:'دنیا',world:'دنیا',shuru:'شروع',start:'شروع',aaj:'آج',today:'آج',
 baat:'بات',sawal:'سوال',question:'سوال',jawab:'جواب',answer:'جواب'
}));

export function urduHero(word){
 const native=(word.urduFocusOverride??word.nativeText??word.text).trim();
 if(/^[\p{Script=Arabic}\p{M}\u200c\u200d]+[،۔؟!?.,]*$/u.test(native))return native;
 const roman=romanize(word.text).toLowerCase().replace(/[^a-z]/g,'');
 return urduWords.get(roman);
}
