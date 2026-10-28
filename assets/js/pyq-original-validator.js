/* Full-original PYQ publication gate.
   Structural completeness is necessary but NOT independent evidence of legal
   permission, exact transcription, or correct official answer keys. */
(function(root){
'use strict';
const choices=['A','B','C','D'];
const asText=v=>typeof v==='string'?v.trim():'';
const sourceURL=v=>{
  try{
    const u=new URL(v);
    return u.protocol==='https:'&&(
      /^(?:www\.)?tnpsc\.gov\.in$/i.test(u.hostname)||
      /^(?:www\.)?upsc\.gov\.in$/i.test(u.hostname)||
      /^(?:www\.)?tnusrb\.tn\.gov\.in$/i.test(u.hostname)
    )&&u.pathname.toLowerCase().endsWith('.pdf')?u.href:null;
  }catch{return null}
};
function validate(paper){
 const errors=[];
 const add=(message)=>errors.push(message);
 if(!paper||typeof paper!=='object')return {ok:false,errors:['Paper must be an object']};
 if(!/^[a-z0-9-]+$/.test(asText(paper.id)))add('Stable paper id required');
 if(!asText(paper.exam)||!Number.isInteger(paper.year)||paper.year<1950||paper.year>2100)add('Exam and year required');
 if(!asText(paper.paperVersion))add('Specific original paper/booklet version required');
 if(!['ta','en','ta-en'].includes(paper.language))add('Original paper language required');
 if(!sourceURL(paper.officialPaperUrl))add('Official paper PDF URL required');
 if(!sourceURL(paper.finalKeyUrl))add('Official final key PDF URL required');
 if(!Number.isInteger(paper.questionCount)||paper.questionCount<1||paper.questionCount>400)add('Original question count invalid');
 const permission=paper.reproductionPermission||{};
 if(permission.status!=='approved'||!asText(permission.rightsHolder)||!asText(permission.evidence)||!asText(permission.reviewedBy))
   add('Documented permission/public-domain legal determination and reviewer required');
 const review=paper.editorialReview||{};
 if(review.status!=='complete'||!asText(review.reviewedBy)||!/^\d{4}-\d{2}-\d{2}$/.test(asText(review.reviewedOn))||
   asText(review.paperVersion)!==asText(paper.paperVersion)||asText(review.finalKeyVersion)!==asText(paper.paperVersion))
   add('Question and final-key version-matched human editorial sign-off required');
 const questions=paper.questions;
 if(!Array.isArray(questions)||questions.length!==paper.questionCount){
   add('All original numbered questions required');
   return {ok:false,errors};
 }
 const languages=paper.language==='ta-en'?['ta','en']:[paper.language];
 const ids=new Set();
 questions.forEach((q,i)=>{
   if(!q||typeof q!=='object'){add('Missing question '+(i+1));return}
   if(q.number!==i+1)add('Original question sequence mismatch at '+(i+1));
   if(ids.has(q.number))add('Duplicated original question number '+q.number);
   ids.add(q.number);
   for(const l of languages){
     if(!asText(q.text?.[l]))add('Missing original '+l+' question '+q.number);
     if(!q.options||typeof q.options[l]!=='object'||!choices.every(c=>asText(q.options[l]?.[c]))||
       new Set(choices.map(c=>asText(q.options[l]?.[c]))).size!==4)
       add('Missing or repeated original '+l+' options on question '+q.number);
   }
   if(typeof q.originalHasVisuals!=='boolean')add('Explicit visual-content review required for question '+q.number);
   if(q.originalHasVisuals){
     const images=Array.isArray(q.visuals)?q.visuals:[];
     if(!images.length||images.some(v=>v?.verified!==true||!new RegExp('^assets/pyq-original/[a-zA-Z0-9_./-]+[.](?:png|jpg|jpeg|webp|svg)$').test(asText(v?.src))||!asText(v?.alt)||!['stem','A','B','C','D'].includes(v.placement)))
       add('Original diagrams/graphs/tables/option images missing or unverified for question '+q.number);
   }
   if(!choices.includes(q.correct))add('Missing correct official key for question '+q.number);
   if(q.keyQuestionNumber!==q.number)add('Key number differs from original question '+q.number);
   if(q.textVerified!==true||q.optionsVerified!==true||q.finalKeyVerified!==true)
     add('Unverified original text/options/key for question '+q.number);
 });
 return {ok:errors.length===0,errors};
}
root.ClearExamsFullOriginal={validate,sourceURL,choices};
})(window);
