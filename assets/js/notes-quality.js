/* ClearExams: conservative note completeness gate for the Group IIA study pathway.
   Structural completeness is necessary but never sufficient for an editorial approval. */
(function(root,factory){
 const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.ClearExamsNoteQuality=api;
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const hasTamil=value=>typeof value==='string'&&/[\u0B80-\u0BFF]/u.test(value);
 const meaningful=value=>typeof value==='string'&&value.trim().length>=25;
 const pair=(english,tamil)=>meaningful(english)&&hasTamil(tamil)&&tamil.trim().length>=12;
 function evaluate(note){
  if(!note||!Array.isArray(note.points))return {level:'outline',reasons:['No structured study points']};
  const reasons=[];
  if(note.points.length<7||!note.points.every(meaningful))reasons.push('At least seven substantive English exam facts required');
  if(!Array.isArray(note.points_ta)||note.points_ta.length!==note.points.length||
     !note.points.every((p,i)=>pair(p,note.points_ta?.[i])))
   reasons.push('One reviewed Tamil explanation required for each English point');
  if(!pair(note.exam_focus,note.exam_focus_ta))reasons.push('Bilingual exam relevance missing');
  if(!pair(note.worked_example,note.worked_example_ta))reasons.push('Bilingual worked example missing');
  if(!note.quick_check||!pair(note.quick_check.question,note.quick_check.question_ta)||
     !String(note.quick_check.answer||'').trim()||!hasTamil(note.quick_check.answer_ta))
   reasons.push('Bilingual revision question and answer missing');
  if(!note.href&&!/^https:\/\//.test(String(note.source_url||'')))reasons.push('Textbook or official source link missing');
  const expanded=reasons.length===0;
  // Explicit human verification is required to claim this is a complete bilingual study note.
  const approved=expanded&&note.editorial_review?.status==='approved'&&
   /^\d{4}-\d{2}-\d{2}$/.test(note.editorial_review?.reviewed_on||'')&&
   typeof note.editorial_review?.reviewer==='string'&&note.editorial_review.reviewer.trim().length>=3;
  return {level:approved?'reviewed-bilingual':expanded?'bilingual-review-pending':'outline',
          reasons:approved?[]:expanded?['Human editorial review not recorded']:reasons};
 }
 return {evaluate};
});
