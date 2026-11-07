export async function projectStorage(mode, operation){
 const database=await new Promise((resolve,reject)=>{
  const request=indexedDB.open('edit-buddy-projects',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('projects',{keyPath:'id'});
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('Close other editor tabs and try again.'));
 });
 try{
  return await new Promise((resolve,reject)=>{
   const transaction=database.transaction('projects',mode);
   const request=operation(transaction.objectStore('projects'));
   transaction.oncomplete=()=>resolve(request.result);
   transaction.onabort=()=>reject(transaction.error??Error('Project storage failed.'));
  });
 }finally{database.close();}
}
