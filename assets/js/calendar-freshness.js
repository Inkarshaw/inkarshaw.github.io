/* Board-specific freshness indicators for static ClearExams calendars.
   Display review status; never imply that a scheduled scan verified official data. */
(function(root,factory){const api=factory();if(root)root.ClearExamsCalendarFreshness=api;
if(typeof module==='object'&&module.exports)module.exports=api;})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const day=stamp=>/^\d{4}-\d{2}-\d{2}$/.test(String(stamp||''))?Date.parse(stamp+'T00:00:00Z'):NaN;
 function evaluate(board,policy,nowDate){
  const config=policy?.boards?.[board]||{},days=Number(policy?.cadenceDays?.[board]||7);
  const checked=day(config.lastReviewed),today=day(nowDate);
  const age=Number.isFinite(checked)&&Number.isFinite(today)?Math.max(0,Math.floor((today-checked)/86400000)):Infinity;
  return {board,name:config.name||board.toUpperCase(),source:config.source||'',lastReviewed:config.lastReviewed||'unknown',age,due:!Number.isFinite(age)||age>days,days};
 }
 function indiaToday(now=new Date()){const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);const p=k=>parts.find(x=>x.type===k)?.value;return [p('year'),p('month'),p('day')].join('-')}
 function all(policy,date){return Object.keys(policy?.boards||{}).map(k=>evaluate(k,policy,date||indiaToday()));}
 return {evaluate,indiaToday,all};
});
