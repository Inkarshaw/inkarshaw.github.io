/* Portable on-device ClearExams study progress backup.
   This is a local file export/import, NOT an online account or cloud sync. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.ClearExamsProgressTransfer=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const KEYS=[
  'clearexamsQuizHistoryV2','clearexamsQuizSessionV1','clearexamsTargetExamV1',
  'clearexamsWrongAnswersV1','clearexamsWrongPracticeQueueV1',
  'clearexamsTextbookProgressV2','clearexamsTextbookBookmarksV1','clearexamsTextbookLang'
 ];
 const MAX_BYTES=2*1024*1024;
 function backup(storage,createdAt=new Date().toISOString()){
  const data={};for(const key of KEYS){const value=storage.getItem(key);if(value!==null)data[key]=value}
  return {format:'clearexams-progress',version:1,createdAt,data};
 }
 function validate(raw){
  if(!raw||raw.format!=='clearexams-progress'||raw.version!==1||!raw.data||
     typeof raw.data!=='object'||Array.isArray(raw.data))throw Error('Unsupported progress backup');
  const rows={};
  for(const key of KEYS)if(Object.prototype.hasOwnProperty.call(raw.data,key)){
   const v=raw.data[key];if(typeof v!=='string'||v.length>MAX_BYTES)throw Error('Invalid backup field: '+key);
   if(!key.endsWith('Lang')&&!key.endsWith('TargetExamV1')){
    try{JSON.parse(v)}catch{throw Error('Invalid saved JSON: '+key)}
   }
   rows[key]=v;
  }
  if(!Object.keys(rows).length)throw Error('Backup contains no recognized study data');
  return rows;
 }
 function restore(storage,raw){const rows=validate(raw);for(const [key,value] of Object.entries(rows))storage.setItem(key,value);return Object.keys(rows).length}
 return {KEYS,MAX_BYTES,backup,validate,restore};
});
