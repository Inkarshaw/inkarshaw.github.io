/* TNPSC Group I 2026: user-transcribed study positions, NOT certified original TNPSC specimen numbers; no guessed keys.
   This app intentionally never computes "correct" / "wrong" from the unverified OCR. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const LETTERS=['A','B','C','D','E'];
const STORAGE='clearexams:tnpsc:g1:2026:prelims:text:v1';
let bank=null,questions=[],attempt=null,timerHandle=null;
const display=(id,show)=>{$(id).hidden=!show};
const answered=()=>attempt?attempt.answers.filter(Boolean).length:0;
const flagged=()=>attempt?attempt.flagged.filter(Boolean).length:0;

function validate(data){
 if(!data||data.schemaVersion!==1||data.year!==2026||data.originalQuestionCount!==200||
    data.suppliedQuestionCount!==200||data.keyedAnswerCount!==0||
    data.textReadyCount!==198||data.needsReviewCount!==2||data.secondaryTextReviewCount!==5||
    data.diagramStudyReconstructionCount!==2||data.diagramStudyReconstructionQuestionNumbers?.join(',')!=='98,200'||
    !Array.isArray(data.questions)||data.questions.length!==200||
    !Array.isArray(data.sourceReviewQuestionNumbers)||data.sourceReviewQuestionNumbers.length!==2||
    !Array.isArray(data.secondaryTextReviewQuestionNumbers)||data.secondaryTextReviewQuestionNumbers.length!==5||
    !Array.isArray(data.optionLetters)||data.optionLetters.join(',')!=='A,B,C,D,E')
   throw Error('The source question bank does not match the required 200-question 2026 edition');
 const idSet=new Set();
 for(let i=0;i<200;i++){
  const q=data.questions[i];
  if(!q||q.number!==i+1||idSet.has(q.id)||!q.question||!q.question.trim()||
     !q.options||LETTERS.some(x=>typeof q.options[x]!=='string'||!q.options[x].trim())||
     q.options.E!=='Answer not known'||q.answer!==null||
     !['needs_source_review','user_transcription_unverified','secondary_source_text_cross_checked'].includes(q.sourceStatus))
   throw Error('Original source question '+(i+1)+' is missing, invalid or misleadingly keyed');
  if((q.sourceStatus==='needs_source_review')!==data.sourceReviewQuestionNumbers.includes(i+1))
   throw Error('Source issue not disclosed for question '+(i+1));
  if(q.sourceStatus==='secondary_source_text_cross_checked'){
   const ref=q.sourceComparison;
   if(!data.secondaryTextReviewQuestionNumbers.includes(i+1)||!ref||
      ref.kind!=='unofficial_2026_study_guide'||ref.originalTNPSCSpecimenVerified!==false||
      !Number.isInteger(ref.pdfPage)||!Number.isInteger(ref.guideQuestionNumber)||
      !ref.sourceUrl.startsWith('https://tnpscfactory.com/blog/tnpsc-factory-group-1-2026-answer-key.pdf'))
     throw Error('Secondary source reconstruction needs specific provenance and a non-official status Q'+(i+1));
  }else if(data.secondaryTextReviewQuestionNumbers.includes(i+1))
   throw Error('Secondary source provenance missing Q'+(i+1));
  if(i+1===98||i+1===200){
   const visual=q.visual;
   if(!visual||visual.kind!=='editorial_visual_reconstruction'||
      visual.originalTNPSCSpecimenVerified!==false||
      visual.src!=='assets/pyq-original/tnpsc-g1-2026-q'+String(i+1).padStart(3,'0')+'-editorial.svg'||
      visual.sourceUrl!=='https://arivark.com/assets/img/pyq/g1-2026-q'+(i+1===98?'98-dice.png':'200-dice-nets.png')||
      !visual.alt||!visual.caption)
     throw Error('Missing attributed editorial diagram / original verification warning for Q'+(i+1));
  }else if(q.visual)throw Error('Unapproved source illustration attached to Q'+(i+1));
  if(i+1===98&&q.options.B!=='4')throw Error('Corrected 2026 Q98 printed option B must be four');
  if(i+1===200&&LETTERS.slice(0,4).some(k=>!q.options[k].startsWith('Figure ('+k+')')))
   throw Error('Q200 must have readable A–D figure labels');
  idSet.add(q.id);
 }
 return data.questions;
}
function read(){
 try{
  const saved=JSON.parse(localStorage.getItem(STORAGE)||'null');
  if(!saved||saved.version!==1||!Array.isArray(saved.answers)||saved.answers.length!==200||
     !saved.answers.every(x=>x===null||LETTERS.includes(x))||
     !Array.isArray(saved.flagged)||saved.flagged.length!==200||
     !saved.flagged.every(x=>typeof x==='boolean')||
     !['practice','exam'].includes(saved.mode)||!Number.isInteger(saved.index)||
     saved.index<0||saved.index>=200)return null;
  return saved;
 }catch{return null}
}
function write(){
 if(!attempt)return;
 attempt.updatedAt=new Date().toISOString();
 try{localStorage.setItem(STORAGE,JSON.stringify(attempt))}catch{}
}
function fresh(){
 return {version:1,mode:$('mode').value,timed:$('timerChoice').value==='180',
  deadline:$('timerChoice').value==='180'?Date.now()+180*60*1000:0,
  answers:Array(200).fill(null),flagged:Array(200).fill(false),index:0,finished:false,
  createdAt:new Date().toISOString()};
}
function updateTimer(){
 if(!attempt||!attempt.timed){$('timer').textContent='Untimed';return}
 const left=Math.max(0,Math.ceil((attempt.deadline-Date.now())/1000));
 $('timer').textContent='Time left: '+Math.floor(left/3600)+':'+String(Math.floor(left/60)%60).padStart(2,'0')+':'+String(left%60).padStart(2,'0');
 if(!left&&!attempt.finished)finish(true);
}
function stopTimer(){if(timerHandle!==null){clearInterval(timerHandle);timerHandle=null}}
function startTimer(){stopTimer();updateTimer();if(attempt?.timed&&!attempt.finished)timerHandle=setInterval(updateTimer,1000)}
function setModeControls(){const frozen=Boolean(attempt&&!attempt.finished);
 $('mode').disabled=frozen;$('timerChoice').disabled=frozen;
}
function jump(i){
 if(!attempt||i<0||i>=200)return;
 attempt.index=i;write();render();
}
function drawPalette(){
 const holder=$('palette');holder.replaceChildren();
 for(let i=0;i<200;i++){
  const b=document.createElement('button');b.type='button';
  b.className='palette-btn'+(attempt.answers[i]?' done':'')+(attempt.flagged[i]?' flagged':'')+(attempt.index===i?' active':'');
  b.textContent=String(i+1);b.title='Transcription Q'+(i+1)+(attempt.answers[i]?' · answered':'')+(attempt.flagged[i]?' · flagged':'');
  b.setAttribute('aria-label',b.title);
  b.addEventListener('click',()=>jump(i));
  holder.append(b);
 }
}
function render(){
 if(!attempt)return;
 const i=attempt.index,q=questions[i];
 $('position').textContent='Transcription Question '+q.number+' of 200 · '+(attempt.mode==='exam'?'Exam mode':'Practice mode');
 $('status').textContent=answered()+' of 200 answered · '+flagged()+' flagged · saved in this browser';
 $('progressBar').style.width=String(Math.round(100*answered()/200))+'%';
 $('questionText').textContent=q.question;
 const illustration=$('questionFigure'), source=$('figureSourceLink');
 illustration.replaceChildren();
 $('figureSource').hidden=!q.visual;
 if(q.visual){
  const img=document.createElement('img');
  img.src=q.visual.src;img.alt=q.visual.alt;img.loading='lazy';
  img.decoding='async';
  illustration.append(img);
  const description=document.createElement('p');description.className='small';
  description.textContent=q.visual.caption;
  illustration.append(description);
  source.href=q.visual.sourceUrl;
 }
 const repair=q.sourceStatus==='secondary_source_text_cross_checked'?q.sourceComparison:null;
 $('secondarySourceNote').hidden=!repair;
 $('secondarySourceLink').hidden=!repair;
 if(repair){
  $('secondarySourceNote').textContent='Q'+q.number+' notation/table restored for study from '+repair.sourceTitle+', its Q'+repair.guideQuestionNumber+' (PDF page '+repair.pdfPage+'). This is NOT verified TNPSC original-booklet wording or an official answer key.';
  $('secondarySourceLink').href='https://tnpscfactory.com/blog/tnpsc-factory-group-1-2026-answer-key.pdf#page='+repair.pdfPage;
 }
 $('sourceWarning').hidden=q.sourceStatus!=='needs_source_review';
 $('sourceWarning').textContent=q.sourceStatus==='needs_source_review'?
   'Source review needed for transcription Q'+q.number+': '+q.sourceIssue+' Consult the linked TNPSC specimen PDF before selecting an answer.':'';
 const options=$('options');options.replaceChildren();
 for(const letter of LETTERS){
  const b=document.createElement('button');b.type='button';
  b.className='answer'+(attempt.answers[i]===letter?' selected':'');
  b.setAttribute('aria-pressed',String(attempt.answers[i]===letter));
  const symbol=document.createElement('span');symbol.className='letter';symbol.textContent=letter;
  const body=document.createElement('span');body.textContent=q.options[letter];
  b.append(symbol,body);
  b.addEventListener('click',()=>{
    attempt.answers[i]=letter;write();render();
  });
  options.append(b);
 }
 $('selectedFeedback').textContent=attempt.answers[i]?
    'Response '+attempt.answers[i]+' recorded. No correct answer is shown until the source key is reliably mapped.':
    'Select one answer, or leave this question blank.';
 $('previous').disabled=i===0;$('next').disabled=i===199;
 $('clear').disabled=!attempt.answers[i];$('flag').textContent=attempt.flagged[i]?'⚑ Flagged · remove flag':'⚐ Flag for review';
 drawPalette();updateTimer();
}
function showQuiz(){
 display('setup',false);display('result',false);display('quiz',true);
 setModeControls();startTimer();render();
}
function showSetup(){
 display('setup',true);display('quiz',false);display('result',false);
 setModeControls();
}
function finish(expired=false){
 if(!attempt||attempt.finished)return;
 const blank=200-answered();
 if(!expired&&blank&&!window.confirm(blank+' questions remain unanswered. Finish and review your recorded responses?'))return;
 attempt.finished=true;attempt.deadline=0;write();stopTimer();
 $('resultHeading').textContent=expired?'Time expired · recorded answer review':'Your 2026 Group I answer review';
 showResults();
}
function showResults(){
 if(!attempt)return;
 display('setup',false);display('quiz',false);display('result',true);
 $('answeredTotal').textContent=String(answered());
 $('blankTotal').textContent=String(200-answered());
 $('flagTotal').textContent=String(flagged());
 renderReview();
}
function renderReview(){
 const filter=$('reviewFilter').value,holder=$('reviewList');holder.replaceChildren();
 let shown=0;
 for(let i=0;i<200;i++){
  const q=questions[i],answer=attempt.answers[i],mark=attempt.flagged[i];
  if(filter==='answered'&&!answer||filter==='blank'&&answer||
     filter==='flagged'&&!mark||filter==='source'&&q.sourceStatus!=='needs_source_review')continue;
  shown++;
  const details=document.createElement('details');details.className='review-row';
  const summary=document.createElement('summary');
  summary.textContent='Q'+q.number+' · '+(answer?'Your answer: '+answer:'Unanswered')+(mark?' · flagged':'')+
    (q.sourceStatus==='needs_source_review'?' · original figure required':'')+
    (q.sourceStatus==='secondary_source_text_cross_checked'?' · secondary text repaired':'');
  details.append(summary);
  const stem=document.createElement('p');stem.textContent=q.question;details.append(stem);
  const options=document.createElement('p');options.className='options';
  options.textContent=LETTERS.map(a=>a+') '+q.options[a]).join('\n');details.append(options);
  if(q.sourceIssue){const issue=document.createElement('p');issue.textContent='Source issue: '+q.sourceIssue;details.append(issue)}
  if(q.visual){
   const imageNote=document.createElement('p');
   imageNote.textContent='A separately referenced editorial study illustration is available when you reopen Q'+q.number+'. Official original specimen illustration not independently verified. No official key or marks supplied.';
   details.append(imageNote);
  }
  if(q.sourceComparison){const note=document.createElement('p');note.textContent='Study-text recovery: Q'+q.sourceComparison.guideQuestionNumber+' on PDF page '+q.sourceComparison.pdfPage+' in a third-party 2026 guide. Original TNPSC specimen not verified; answers remain ungraded.';details.append(note)}
  holder.append(details);
 }
 if(!shown)holder.textContent='No questions match this filter.';
}
function exportResponses(){
 const data={schemaVersion:1,exam:bank.exam,year:2026,questionBankId:bank.id,questionCount:200,
  scoringStatus:'not-available-tentative-key-unmapped',mode:attempt.mode,exportedAt:new Date().toISOString(),
  answers:questions.map((q,i)=>({number:q.number,choice:attempt.answers[i],flagged:attempt.flagged[i],
    sourceStatus:q.sourceStatus}))};
 const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
 const uri=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=uri;a.download='tnpsc-g1-2026-my-200-responses.json';a.click();setTimeout(()=>URL.revokeObjectURL(uri),1000);
}
$('start').addEventListener('click',()=>{
 if(!questions.length)return;
 const saved=read();attempt=saved||fresh();
 if(attempt.finished){showResults();return}
 showQuiz();
});
$('newAttempt').addEventListener('click',()=>{
 if(!window.confirm('Clear all stored responses for the 2026 Group I paper?'))return;
 try{localStorage.removeItem(STORAGE)}catch{}
 attempt=null;$('mode').disabled=false;$('timerChoice').disabled=false;
 $('start').textContent='Start all 200 questions';
 $('newAttempt').disabled=true;
 showSetup();
});
$('previous').addEventListener('click',()=>jump(attempt.index-1));
$('next').addEventListener('click',()=>jump(attempt.index+1));
$('clear').addEventListener('click',()=>{attempt.answers[attempt.index]=null;write();render()});
$('flag').addEventListener('click',()=>{attempt.flagged[attempt.index]=!attempt.flagged[attempt.index];write();render()});
$('finish').addEventListener('click',()=>finish(false));
$('returnToQuiz').addEventListener('click',()=>{
 if(attempt?.finished){attempt.finished=false;write()}
 showQuiz();
});
$('reviewFilter').addEventListener('change',renderReview);
$('exportResponses').addEventListener('click',exportResponses);
document.addEventListener('keydown',e=>{
 if(!attempt||$('quiz').hidden)return;
 const tag=document.activeElement?.tagName;
 if(['INPUT','TEXTAREA','SELECT','BUTTON'].includes(tag))return;
 if(e.key==='ArrowRight'&&attempt.index<199)jump(attempt.index+1);
 if(e.key==='ArrowLeft'&&attempt.index>0)jump(attempt.index-1);
});
fetch('data/quizzes/tnpsc-group-i-2026-prelims-text.json',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('2026 question bank unavailable');return r.json()})
 .then(data=>{
  questions=validate(data);bank=data;
  const list=$('sourceIssueList');list.replaceChildren();
  for(const q of questions.filter(x=>x.sourceStatus==='needs_source_review')){
   const li=document.createElement('li');li.textContent='Q'+q.number+' — '+q.sourceIssue;list.append(li);
  }
  const secondary=$('secondaryReviewList');secondary.replaceChildren();
  for(const q of questions.filter(x=>x.sourceStatus==='secondary_source_text_cross_checked')){
   const li=document.createElement('li');li.textContent='Q'+q.number+' — '+q.sourceComparison.note;secondary.append(li);
  }
  const saved=read();
  $('start').disabled=false;$('newAttempt').disabled=!saved;
  $('start').textContent=saved?(saved.finished?'Review saved 200-question attempt':'Resume 200-question attempt'):'Start all 200 questions';
  if(saved){$('mode').value=saved.mode;$('timerChoice').value=saved.timed?'180':'none'}
  $('loadStatus').textContent='All 200 numbered questions loaded · 198 readable text entries + 2 attributed editorial dice study diagrams · TNPSC original figure checks and answer-key mapping still pending; correctness ungraded.';
 }).catch(e=>{$('loadStatus').textContent='Quiz cannot start: '+e.message;$('start').disabled=true});
})();