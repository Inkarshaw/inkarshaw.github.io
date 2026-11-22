/* Group IV 25-question mocks: reliable resume on refresh / Android browser reopen.
   Local-only answer storage; the absolute UTC deadline never restarts on reload. */
(function(){
'use strict';
const number=Number((location.pathname.match(/mock-(\d+)\.html$/)||[])[1]);
if(!Number.isInteger(number)||number<1||number>4)return;
const URL_DATA='../../data/quizzes/tnpsc-group4-mock-'+number+'.json';
const STORE='clearexamsTNPSCGroup4MockSessionV2:'+number;
const HISTORY='clearexamsTNPSCGroup4MockHistoryV1';
const $=id=>document.getElementById(id);
const byId=id=>document.querySelectorAll('#'+id);
let bank=[],questions=[],indices=[],answers=[],marked=[],current=0,deadline=0,timer=null,active=false,retry=false,submitted=false,signature='',storageWorking=true;
const track=(event,detail)=>{try{window.gtag?.('event',event,Object.assign({exam:'TNPSC Group IV',mock:'Mock '+number},detail||{}))}catch{}};
const validQuestions=qs=>Array.isArray(qs)&&qs.length===25&&qs.every(q=>q&&typeof q.subject==='string'&&typeof q.question==='string'&&q.question.trim()&&Array.isArray(q.options)&&q.options.length===4&&q.options.every(o=>typeof o==='string'&&o.trim())&&Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
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
function history(score,wrong,unanswered){
  if(retry){$('saveStatus').textContent='Retry finished; original full-mock score unchanged.';return}
  try{
    let rows=[];try{const v=JSON.parse(localStorage.getItem(HISTORY)||'[]');if(Array.isArray(v))rows=v}catch{}
    rows.push({mock:number,score,total:questions.length,accuracy:Math.round(score/questions.length*100),wrong,unanswered,date:new Date().toISOString()});
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
     s.answers.some(a=>a!==null&&(!Number.isInteger(a)||a<0||a>=4)))return false;
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
  indices=chosen||bank.map((_,i)=>i);
  questions=indices.map(i=>bank[i]);
  answers=Array(questions.length).fill(null);marked=Array(questions.length).fill(false);
  current=0;retry=retryMode;active=true;submitted=false;
  const duration=retry?Math.max(300,questions.length*60):1800;
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
    if(filter==='wrong')return answers[i]!==null&&answers[i]!==q.answer;
    if(filter==='unanswered')return answers[i]===null;
    if(filter==='correct')return answers[i]===q.answer;
    return true;
  });
  $('reviewCount').textContent='Showing '+rows.length+' of '+questions.length+' questions.';
  if(!rows.length){const p=document.createElement('p');p.textContent='No questions match this filter.';root.append(p);return}
  for(const {q,i} of rows){
    const article=document.createElement('article');article.className='review-item';
    const h=document.createElement('h3');h.textContent=(i+1)+'. '+q.question;
    const ans=document.createElement('p');const correct=document.createElement('p'),explain=document.createElement('p');
    ans.textContent='Your answer: '+(answers[i]===null?'Not answered':q.options[answers[i]]);
    correct.textContent='Correct answer: '+q.options[q.answer];
    explain.className='explanation';explain.textContent=q.explanation||'';
    article.append(h,ans,correct,explain);root.append(article);
  }
}
function finish(automatic){
  if(submitted||!active)return;
  const left=answers.filter(a=>a===null).length;
  if(!automatic&&!confirm((questions.length-left)+' of '+questions.length+' answered; '+left+' unanswered. Submit this attempt?'))return;
  submitted=true;active=false;pauseClock();
  try{localStorage.removeItem(STORE)}catch{}
  $('test').classList.add('hidden');$('result').classList.remove('hidden');
  let score=0,wrong=0;
  questions.forEach((q,i)=>{if(answers[i]===q.answer)score++;else if(answers[i]!==null)wrong++});
  const total=questions.length,accuracy=Math.round(score/total*100);
  $('score').textContent=score+' / '+total;
  $('correct').textContent=score;$('wrong').textContent=wrong;
  $('unanswered').textContent=left;$('accuracy').textContent=accuracy+'%';
  history(score,wrong,left);
  if(window.MockSubjectResults?.render)window.MockSubjectResults.render($('subjectResults'),questions,answers,retry);
  $('reviewFilter').value='all';review();
  track('mock_test_completed',{score,total,accuracy,auto_submit:automatic,retry});
  window.scrollTo?.({top:0,behavior:'smooth'});
}
$('startBtn').addEventListener('click',()=>{if(bank.length)newAttempt()});
$('prevBtn').addEventListener('click',()=>{if(current>0){current--;save();render()}});
$('nextBtn').addEventListener('click',()=>{if(current<questions.length-1){current++;save();render()}});
$('clearBtn').addEventListener('click',()=>{answers[current]=null;save();render()});
$('markBtn').addEventListener('click',()=>{marked[current]=!marked[current];save();render()});
$('submitBtn').addEventListener('click',()=>finish(false));
$('reviewFilter').addEventListener('change',review);
$('restart').addEventListener('click',()=>{if(confirm('Start a new mock attempt?'))location.reload()});
$('retryWrong').addEventListener('click',()=>{
  const selected=indices.filter((_,i)=>answers[i]!==questions[i].answer);
  if(!selected.length){alert('No wrong or unanswered questions to retry.');return}
  newAttempt(selected,true);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)clock()});
window.addEventListener('pageshow',clock);
window.addEventListener('pagehide',save);
fetch(URL_DATA,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Mock data unavailable');return r.json()}).then(data=>{
  if(!validQuestions(data.questions))throw Error('Mock content is incomplete');
  bank=data.questions;signature=bank.length+':'+bank[0].question+':'+bank[bank.length-1].question;
  const saved=read();
  if(!restore(saved)){
    indicator('Progress will be saved to this device when you begin.',false);
    if(saved)try{localStorage.removeItem(STORE)}catch{}
  }
}).catch(err=>{
  $('instructions').replaceChildren();
  const title=document.createElement('h2');title.textContent='Mock could not load';
  const p=document.createElement('p');p.textContent=err.message+'. Please retry once you are online.';
  $('instructions').append(title,p);
});
})();
