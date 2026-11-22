/* Group IV 25-question mocks: reliable resume on refresh / Android browser reopen.
   Local-only answer storage; the absolute UTC deadline never restarts on reload. */
(function(){
'use strict';
const number='full-1';
const URL_DATA='../../data/quizzes/tnpsc-group4-full-mock-1.json';
const STORE='clearexamsTNPSCGroup4FullMockSessionV1';
const RESULT_STORE=STORE+':completedV1';
const HISTORY='clearexamsTNPSCGroup4FullMockHistoryV1';
const $=id=>document.getElementById(id);
const byId=id=>document.querySelectorAll('#'+id);
let bank=[],questions=[],indices=[],answers=[],marked=[],current=0,deadline=0,timer=null,active=false,retry=false,submitted=false,signature='',storageWorking=true;
const track=(event,detail)=>{try{window.gtag?.('event',event,Object.assign({exam:'TNPSC Group IV',mock:'Full Mock 1',practice_source:'unverified_2022_draft'},detail||{}))}catch{}};
const isCorrect=(q,response)=>Number.isInteger(response)&&q.acceptedAnswers.includes(response);
const validQuestions=qs=>Array.isArray(qs)&&qs.length===200&&qs.every(q=>
 q&&typeof q.section==='string'&&typeof q.question==='string'&&q.question.trim()&&
 Array.isArray(q.options)&&q.options.length>=4&&q.options.length<=5&&
 q.options.every(o=>typeof o==='string'&&o.trim())&&
 Array.isArray(q.acceptedAnswers)&&q.acceptedAnswers.length>=1&&
 q.acceptedAnswers.every(a=>Number.isInteger(a)&&a>=0&&a<4));

const read=()=>{try{return JSON.parse(localStorage.getItem(STORE)||'null')}catch{return null}};
const indicator=(message,bad)=>{
  const el=$('saveProgress');if(!el)return;
  el.textContent=message;el.style.color=bad?'#9f2d39':'#266548';
};
function save(){
  if(!active||submitted)return;
  try{
    localStorage.setItem(STORE,JSON.stringify({
      version:2,signature,indices,answers,marked,current,deadline,retry,savedAt:Date.now()
    }));
    storageWorking=true;indicator('Saved on this device · Browser reopen will resume this attempt.',false);
  }catch{
    storageWorking=false;indicator('This browser is blocking storage. Answers will be lost if you close or refresh it.',true);
  }
}
function readResult(){try{return JSON.parse(localStorage.getItem(RESULT_STORE)||'null')}catch{return null}}
function saveResult(){
  try{
    localStorage.setItem(RESULT_STORE,JSON.stringify({
      version:2,signature,indices,answers,marked,current,deadline,retry,
      submitted:true,completedAt:Date.now()
    }));
  }catch{
    const status=$('saveStatus');
    if(status)status.textContent+=' Result details could not be stored on this device.';
  }
}
function restoreResult(s){
  if(!s||s.submitted!==true||!validateSession(s))return false;
  indices=s.indices;questions=indices.map(i=>bank[i]);answers=s.answers;marked=s.marked;
  current=s.current;deadline=s.deadline;retry=!!s.retry;active=true;submitted=false;
  finish(true,true);
  $('saveStatus').textContent='Completed attempt restored from this browser. Start a new attempt to reset.';
  return true;
}
function history(score,wrong,unanswered,tamilMarks,tamilQualified){
  if(retry){$('saveStatus').textContent='Retry finished; original full-mock score unchanged.';return}
  try{
    let rows=[];try{const v=JSON.parse(localStorage.getItem(HISTORY)||'[]');if(Array.isArray(v))rows=v}catch{}
    rows.push({mock:number,score,tamilMarks,tamilQualified,evaluatedMarks:tamilQualified?score*1.5:null,total:questions.length,accuracy:Math.round(score/questions.length*100),wrong,unanswered,date:new Date().toISOString()});
    localStorage.setItem(HISTORY,JSON.stringify(rows.slice(-80)));
    $('saveStatus').textContent='Score saved on this device.';
  }catch{$('saveStatus').textContent='Score shown, but this browser could not save history.'}
}
function showTest(){
  $('instructions').classList.add('hidden');$('result').classList.add('hidden');$('test').classList.remove('hidden');
}
function pauseClock(){if(timer!==null){clearInterval(timer);timer=null}}
function clock(){
  if(!active||submitted)return;
  const remain=Math.max(0,Math.ceil((deadline-Date.now())/1000));
  const m=Math.floor(remain/60),s=remain%60;
  $('timer').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  $('timer').classList.toggle('low',remain<=300);
  if(remain===0)finish(true);
}
function startClock(){pauseClock();clock();if(!submitted&&active)timer=setInterval(clock,1000)}
function validateSession(s){
  if(!s||s.version!==2||s.signature!==signature||!Number.isFinite(s.deadline)||s.deadline<=0||
     !Array.isArray(s.indices)||s.indices.length<1||s.indices.length>bank.length)return false;
  const seen=new Set(s.indices);
  if(seen.size!==s.indices.length||s.indices.some(i=>!Number.isInteger(i)||i<0||i>=bank.length))return false;
  if(!Array.isArray(s.answers)||s.answers.length!==s.indices.length||
     s.answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>=5)))return false;
  if(!Array.isArray(s.marked)||s.marked.length!==s.indices.length||
     s.marked.some(v=>typeof v!=='boolean'))return false;
  if(!Number.isInteger(s.current)||s.current<0||s.current>=s.indices.length)return false;
  if(!s.retry&&s.indices.length!==bank.length)return false;
  return true;
}
function restore(s){
  if(!validateSession(s))return false;
  indices=s.indices;questions=indices.map(i=>bank[i]);answers=s.answers;marked=s.marked;
  current=s.current;deadline=s.deadline;retry=!!s.retry;active=true;submitted=false;
  showTest();render();startClock();
  indicator('Restored from this browser · Timer continues from your original start time.',false);
  return true;
}
function newAttempt(chosen=null,retryMode=false){
  try{localStorage.removeItem(RESULT_STORE)}catch{}
  indices=chosen||bank.map((_,i)=>i);
  questions=indices.map(i=>bank[i]);
  answers=Array(questions.length).fill(null);marked=Array(questions.length).fill(false);
  current=0;retry=retryMode;active=true;submitted=false;
  const duration=retry?Math.max(300,questions.length*60):10800;
  deadline=Date.now()+duration*1000;
  showTest();save();render();startClock();
  track(retry?'mock_retry_started':'mock_test_started',{count:questions.length,resumed:false});
}
function option(button,label,position){
  button.type='button';button.className='option'+(answers[current]===position?' selected':'');
  const strong=document.createElement('strong');strong.textContent=String.fromCharCode(65+position)+'.';
  button.append(strong,document.createTextNode(' '+label));
  button.addEventListener('click',()=>{answers[current]=position;save();render()});
}
function render(){
  if(!active||submitted||!questions.length)return;
  const q=questions[current];
  $('subject').textContent=q.subject;$('qnum').textContent='Question '+(current+1)+' of '+questions.length;
  $('question').textContent=q.question;
  const choices=$('options');choices.replaceChildren();
  q.options.forEach((o,i)=>{const button=document.createElement('button');option(button,o,i);choices.append(button)});
  $('clearBtn').disabled=answers[current]===null;
  $('prevBtn').disabled=current===0;
  $('nextBtn').textContent=current===questions.length-1?'Review':'Next';
  $('markBtn').textContent=marked[current]?'Unmark review':'Mark for review';
  const answered=answers.filter(a=>a!==null).length;
  $('answeredCount').textContent=answered;
  $('unansweredCount').textContent=questions.length-answered;
  $('markedCount').textContent=marked.filter(Boolean).length;
  const palette=$('palette');palette.replaceChildren();
  for(let i=0;i<questions.length;i++){
    const b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.dataset.i=String(i);
    b.className=(i===current?'current ':'')+(answers[i]!==null?'answered ':'')+(marked[i]?'marked':'');
    b.addEventListener('click',()=>{current=i;save();render()});
    palette.append(b);
  }
}
function review(){
  const filter=$('reviewFilter').value,root=$('review');root.replaceChildren();
  const rows=questions.map((q,i)=>({q,i})).filter(({q,i})=>{
    if(filter==='wrong')return answers[i]!==null&&!isCorrect(q,answers[i]);
    if(filter==='unanswered')return answers[i]===null;
    if(filter==='correct')return isCorrect(q,answers[i]);
    return true;
  });
  $('reviewCount').textContent='Showing '+rows.length+' of '+questions.length+' questions.';
  if(!rows.length){const p=document.createElement('p');p.textContent='No questions match this filter.';root.append(p);return}
  for(const {q,i} of rows){
    const article=document.createElement('article');article.className='review-item';
    const h=document.createElement('h3');h.textContent=(i+1)+'. '+q.question;
    const ans=document.createElement('p');const correct=document.createElement('p'),explain=document.createElement('p');
    ans.textContent='Your answer: '+(answers[i]===null?'Not answered':q.options[answers[i]]);
    correct.textContent='Accepted answer'+(q.acceptedAnswers.length>1?'s':'')+': '+q.acceptedAnswers.map(j=>String.fromCharCode(65+j)+'. '+q.options[j]).join(' / ');
    explain.className='explanation';explain.textContent=q.explanation||'';
    article.append(h,ans,correct,explain);root.append(article);
  }
}
function finish(automatic,restoring=false){
  if(submitted||!active)return;
  const left=answers.filter(a=>a===null).length;
  if(!automatic&&!confirm((questions.length-left)+' of '+questions.length+' answered; '+left+' unanswered. Submit this attempt?'))return;
  submitted=true;active=false;pauseClock();
  try{localStorage.removeItem(STORE)}catch{}
  $('test').classList.add('hidden');$('result').classList.remove('hidden');
  if(!restoring)saveResult();
  const correct=(q,i)=>isCorrect(q,answers[i]);
  const sum=(from,to)=>questions.slice(from,to).reduce((v,q,j)=>v+(correct(q,from+j)?1:0),0);
  const tamilCorrect=retry?0:sum(0,100);
  const tamilMarks=tamilCorrect*1.5;
  const tamilEligible=tamilMarks>=60;
  const correctCount=sum(0,questions.length);
  const wrongCount=questions.reduce((v,q,i)=>v+(answers[i]!==null&&!correct(q,i)?1:0),0);
  const mark=correctCount*1.5,percent=Math.round(correctCount/questions.length*100);
  if(retry){
    $('subjectResults').replaceChildren();
    $('gateOutcome').textContent='Focused retry practice · Tamil eligibility is assessed only on a complete 200-question attempt.';
    $('score').textContent=correctCount+' / '+questions.length;
    $('correct').textContent=correctCount;
    $('wrong').textContent=wrongCount;
    $('accuracy').textContent=percent+'%';
    $('scoringPolicy').textContent='Retry-only result; it does not replace your full-length attempt.';
  }else{
    const box=$('subjectResults');box.replaceChildren();
    const heading=document.createElement('h3');heading.textContent='Part-by-part performance';box.append(heading);
    const sections=[['Tamil Eligibility-cum-Scoring',0,100],['General Studies',100,175],['Aptitude & Mental Ability',175,200]];
    sections.forEach(([label,from,to],index)=>{
      const p=document.createElement('p'),value=sum(from,to);
      p.textContent=label+': '+(index>0&&!tamilEligible?'not evaluated because Tamil eligibility was not met':(value*1.5).toFixed(1)+' / '+((to-from)*1.5).toFixed(1)+' marks ('+value+'/'+(to-from)+' correct)');
      box.append(p);
    });
    const overallEligible=tamilEligible&&mark>=90;
    $('gateOutcome').textContent=tamilEligible?
      'Tamil qualifying rule satisfied: '+tamilMarks.toFixed(1)+'/150 (minimum 60). '+(overallEligible?'Indicative total reaches the 90/300 minimum.':'Indicative total is below the 90/300 minimum.'):
      'Tamil qualifying rule NOT satisfied: '+tamilMarks.toFixed(1)+'/150 (minimum 60). General Studies and Aptitude scores have not been evaluated.';
    $('score').textContent=tamilEligible?mark.toFixed(1)+' / 300':tamilMarks.toFixed(1)+' / 150 (Tamil only)';
    $('correct').textContent=tamilEligible?correctCount:tamilCorrect;
    $('wrong').textContent=tamilEligible?wrongCount:answers.slice(0,100).filter((v,i)=>v!==null&&!correct(questions[i],i)).length;
    $('accuracy').textContent=tamilEligible?percent+'%':Math.round(tamilCorrect)+'% Tamil';
    $('scoringPolicy').textContent='Practice-only indicative scoring. Part A gate: 60/150. Total minimum: 90/300 (only after Part A passes). All answers use 1.5 marks per correct answer; an unverified editorial 2022 transcription is used for 193 questions. OMR blank-response penalties and official ranking rules are NOT simulated.';
  }
  $('unanswered').textContent=left;
  if(!restoring&&!retry)history(correctCount,wrongCount,left,tamilMarks,tamilEligible);
  if(retry&&!restoring)$('saveStatus').textContent='Retry completed; your full-length history was not replaced.';
  $('reviewFilter').value='all';review();
  if(!restoring)track('mock_test_completed',{score:correctCount,total:questions.length,accuracy:percent,auto_submit:automatic,retry,tamil_marks:tamilMarks,tamil_qualified:tamilEligible});

  window.scrollTo?.({top:0,behavior:'smooth'});
}

$('startBtn').disabled=true;
$('startBtn').addEventListener('click',()=>{if(bank.length)newAttempt()});
$('prevBtn').addEventListener('click',()=>{if(current>0){current--;save();render()}});
$('nextBtn').addEventListener('click',()=>{if(current<questions.length-1){current++;save();render()}});
$('clearBtn').addEventListener('click',()=>{answers[current]=null;save();render()});
$('markBtn').addEventListener('click',()=>{marked[current]=!marked[current];save();render()});
$('submitBtn').addEventListener('click',()=>finish(false));
$('reviewFilter').addEventListener('change',review);
$('restart').addEventListener('click',()=>{if(!confirm('Clear the completed result and begin a new mock attempt?'))return;try{localStorage.removeItem(RESULT_STORE);localStorage.removeItem(STORE)}catch{}location.reload()});
$('retryWrong').addEventListener('click',()=>{
  const selected=indices.filter((_,i)=>!isCorrect(questions[i],answers[i]));
  if(!selected.length){alert('No wrong or unanswered questions to retry.');return}
  newAttempt(selected,true);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)clock()});
window.addEventListener('pageshow',clock);
window.addEventListener('pagehide',save);
fetch(URL_DATA,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Mock data unavailable');return r.json()}).then(data=>{
  if(!data||data.schemaVersion!==1||data.questionCount!==200||data.durationMinutes!==180||JSON.stringify(data.pattern)!==JSON.stringify({Tamil:100,'General Studies':75,Aptitude:25})||!validQuestions(data.questions))throw Error('Full mock content is incomplete');
  bank=data.questions;signature=bank.length+':'+bank[0].question+':'+bank[bank.length-1].question;
  $('startBtn').disabled=false;
  const saved=read();
  if(!restore(saved)){
    if(saved)try{localStorage.removeItem(STORE)}catch{}
    if(!restoreResult(readResult())){
      indicator('Progress will be saved to this device when you begin.',false);
    }
  }
}).catch(err=>{
  $('instructions').replaceChildren();
  const title=document.createElement('h2');title.textContent='Mock could not load';
  const p=document.createElement('p');p.textContent=err.message+'. Please retry once you are online.';
  $('instructions').append(title,p);
});
})();
