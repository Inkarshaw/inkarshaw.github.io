/* ClearExams: local original-PYQ transcription staging schema.
   A numbered slot and an answer key are NOT digitized question text. */
(function(root){
'use strict';
const letters=['A','B','C','D','E'];
const asText=x=>typeof x==='string'?x:'';
const langs=['ta','en'];
function newRecord(number,keyValue){
  if(!Number.isInteger(number)||number<1||number>400)throw Error('Invalid source question number');
  return {number,originalLanguages:['ta'],sourcePdfPage:null,
    text:{ta:'',en:''},
    options:{ta:{A:'',B:'',C:'',D:'',E:''},en:{A:'',B:'',C:'',D:'',E:''}},
    correctKey:asText(keyValue),originalHasVisuals:'unknown',
    visualPath:'',visualAlt:'',review:{text:false,options:false,source:false,key:false,visuals:false},
    notes:'',updatedAt:null};
}
function examine(q){
  const errors=[];
  if(!q||!Number.isInteger(q.number)||q.number<1||q.number>400)return {captured:false,reviewed:false,errors:['Invalid question number']};
  const languages=Array.isArray(q.originalLanguages)?q.originalLanguages:[];
  if(!languages.length||languages.some(l=>!langs.includes(l))||new Set(languages).size!==languages.length)
    errors.push('Select the language(s) actually printed in the paper');
  for(const lang of languages){
    if(!asText(q.text?.[lang]).trim())errors.push('Missing original '+lang+' question text');
    for(const letter of letters){
      if(!asText(q.options?.[lang]?.[letter]).trim())errors.push('Missing original '+lang+' option '+letter);
    }
  }
  if(!Number.isInteger(q.sourcePdfPage)||q.sourcePdfPage<1||q.sourcePdfPage>500)
    errors.push('Enter the source PDF page number');
  if(!['yes','no'].includes(q.originalHasVisuals))errors.push('Review whether the original question has figures, tables or diagrams');
  if(q.originalHasVisuals==='yes'&&(!asText(q.visualPath).trim()||!asText(q.visualAlt).trim()))
    errors.push('Original visual asset path and description are required');
  const captured=errors.length===0;
  if(!captured)return {captured:false,reviewed:false,errors};
  if(!asText(q.correctKey).trim())errors.push('Official final-key mapping is missing');
  const flags=q.review||{};
  for(const check of ['text','options','source','key','visuals']){
    if(flags[check]!==true)errors.push('Independent '+check+' review incomplete');
  }
  return {captured:true,reviewed:errors.length===0,errors};
}
function normalize(raw,number,keyValue){
  const r=newRecord(number,keyValue);
  if(!raw||typeof raw!=='object')return r;
  r.originalLanguages=(Array.isArray(raw.originalLanguages)&&raw.originalLanguages.length&&
    raw.originalLanguages.every(l=>langs.includes(l)))?[...new Set(raw.originalLanguages)]:['ta'];
  r.sourcePdfPage=Number.isInteger(raw.sourcePdfPage)?raw.sourcePdfPage:null;
  for(const lang of langs){
    r.text[lang]=asText(raw.text?.[lang]);
    for(const letter of letters)r.options[lang][letter]=asText(raw.options?.[lang]?.[letter]);
  }
  r.correctKey=asText(keyValue); // Never trust an imported answer over the official key.
  r.originalHasVisuals=['yes','no'].includes(raw.originalHasVisuals)?raw.originalHasVisuals:'unknown';
  r.visualPath=asText(raw.visualPath);
  r.visualAlt=asText(raw.visualAlt);
  r.notes=asText(raw.notes);
  if(raw.review&&typeof raw.review==='object'){
    for(const k of Object.keys(r.review))r.review[k]=raw.review[k]===true;
  }
  r.updatedAt=asText(raw.updatedAt)||null;
  return r;
}
function tally(records){
  const values=Object.values(records||{});
  let captured=0,reviewed=0;
  for(const q of values){const state=examine(q);if(state.captured)captured++;if(state.reviewed)reviewed++;}
  return {captured,reviewed};
}
root.ClearExamsPYQIntake={letters,langs,newRecord,normalize,examine,tally};
})(window);
