/* Syllabus-indexed 2026 Group I practice. Original text is user OCR, deliberately ungraded. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const KEY='clearexams:tnpsc:group1:topic-practice:v1';
const REVISION='clearexams:tnpsc:group1:syllabus:revision:v1';
const letters=['A','B','C','D','E'];
let index=null,bank=null,topic=null,unit=null,page=0,unansweredOnly=false;
let state={version:1,answers:{},flags:{}};
function node(tag,cls,value){
 const n=document.createElement(tag);if(cls)n.className=cls;
 if(value!==undefined)n.textContent=value;
 return n;
}
try{
 const saved=JSON.parse(localStorage.getItem(KEY)||'null');
 if(saved&&saved.version===1&&saved.answers&&typeof saved.answers==='object'&&
    saved.flags&&typeof saved.flags==='object'){
  for(const [k,v] of Object.entries(saved.answers)){
   if(/^(?:[1-9]|[1-9]\d|1\d\d|200)$/.test(k)&&letters.includes(v))state.answers[k]=v;
  }
  for(const [k,v] of Object.entries(saved.flags)){
   if(/^(?:[1-9]|[1-9]\d|1\d\d|200)$/.test(k)&&v===true)state.flags[k]=true;
  }
 }
}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function remember(id){
 try{const v=JSON.parse(localStorage.getItem(REVISION)||'{}');
 const obj={version:1,revised:Array.isArray(v.revised)?v.revised:[],lastTopic:id};
 localStorage.setItem(REVISION,JSON.stringify(obj))}catch{}
}
const allTopics=()=>index.units.flatMap(u=>u.topics);
function validate(idx,qbank){
 if(!idx||idx.schemaVersion!==1||idx.units?.length!==8||idx.topicCount!==42||
    qbank?.year!==2026||qbank.originalQuestionCount!==200||qbank.questions?.length!==200||
    qbank.keyedAnswerCount!==0)throw Error('Source questions or syllabus mapping unavailable');
 for(const u of idx.units)for(const t of u.topics){
   if(!t.id||!Array.isArray(t.questionNumbers))throw Error('Invalid topic');
   for(const n of t.questionNumbers)
      if(!Number.isInteger(n)||n<1||n>200||qbank.questions[n-1]?.number!==n)
        throw Error('Original-number source link mismatch');
 }
}
function allQs(){return topic?topic.questionNumbers.map(n=>bank.questions[n-1]):[]}
function visibleQs(){
 const q=allQs();
 return unansweredOnly?q.filter(x=>!state.answers[x.number]):q;
}
function updateProgress(){
 if(!topic)return;
 const questions=allQs(),done=questions.filter(q=>Boolean(state.answers[q.number])).length,percent=questions.length?Math.round(done*100/questions.length):0;
 $('progressSummary').textContent=done+' of '+questions.length+' topic questions answered';
 $('progressFill').style.width=percent+'%';
 $('topicStats').textContent=questions.length+' mapped 2026 questions · '+questions.filter(q=>q.sourceStatus==='needs_source_review').length+' source review notes';
}
function setTopic(id){
 const found=index.units.flatMap(u=>u.topics.map(t=>({u,t}))).find(x=>x.t.id===id&&x.t.questionNumbers.length);
 if(!found)throw Error('No mapped question set for selected topic');
 unit=found.u;topic=found.t;page=0;
 $('topicHeading').textContent=topic.title;
 $('topicDescription').textContent=unit.label+' · Practise '+topic.questionNumbers.length+' original-numbered 2026 PYQs. Ten questions are shown per page.';
 $('unitHeading').textContent=unit.label;
 $('currentTopic').textContent=topic.title;
 $('topicSelect').value=topic.id;
 remember(topic.id);
 const url=new URL(location.href);url.searchParams.set('topic',topic.id);
 history.replaceState(null,'',url.pathname+url.search);
 updateProgress();render();
}
function updateOptionState(box,number){
 for(const btn of box.querySelectorAll('button.option')){
 const selected=state.answers[number]===btn.dataset.letter;
 btn.setAttribute('aria-pressed',String(selected));
 }
}
function card(q){
 const art=node('article','question');art.dataset.question=String(q.number);
 const header=node('div','question-head');
 header.append(node('strong','', 'Original 2026 · Question '+q.number));
 const mark=node('button','btn',state.flags[q.number]?'⚑ Flagged':'⚐ Flag');
 mark.type='button';mark.setAttribute('aria-pressed',String(Boolean(state.flags[q.number])));
 mark.addEventListener('click',()=>{
  if(state.flags[q.number])delete state.flags[q.number];else state.flags[q.number]=true;
  mark.textContent=state.flags[q.number]?'⚑ Flagged':'⚐ Flag';
  mark.setAttribute('aria-pressed',String(Boolean(state.flags[q.number])));save();
 });
 header.append(mark);art.append(header);
 if(q.sourceStatus==='needs_source_review'){
  const warning=node('div','warning','Source review needed: '+q.sourceIssue+' Use the official specimen PDF to check the original before answering.');
  art.append(warning);
 }
 art.append(node('p','stem',q.question));
 const options=node('div','options');options.setAttribute('role','group');options.setAttribute('aria-label','Answers for original question '+q.number);
 for(const letter of letters){
  const button=node('button','option');button.type='button';button.dataset.letter=letter;
  button.setAttribute('aria-pressed',String(state.answers[q.number]===letter));
  button.append(node('span','letter',letter),node('span','body',q.options[letter]));
  button.addEventListener('click',()=>{
   state.answers[q.number]=letter;save();
   updateOptionState(options,q.number);updateProgress();
   if(unansweredOnly){render();}
  });
  options.append(button);
 }
 art.append(options);
 const foot=node('div','foot');
 const status=node('span','',state.answers[q.number]?'Response '+state.answers[q.number]+' saved on this device':'Not answered yet');
 const clear=node('button','btn','Clear response');clear.type='button';
 clear.disabled=!state.answers[q.number];
 clear.addEventListener('click',()=>{
  delete state.answers[q.number];save();status.textContent='Not answered yet';clear.disabled=true;
  updateOptionState(options,q.number);updateProgress();if(unansweredOnly)render();
 });
 options.addEventListener('click',()=>{
  status.textContent=state.answers[q.number]?'Response '+state.answers[q.number]+' saved on this device':'Not answered yet';
  clear.disabled=!state.answers[q.number];
 });
 foot.append(status,clear);
 art.append(foot);
 return art;
}
function render(){
 if(!topic)return;
 updateProgress();
 const list=$('questionList');list.replaceChildren();
 const filtered=visibleQs();
 const pages=Math.max(1,Math.ceil(filtered.length/10));
 if(page>=pages)page=pages-1;
 const slice=filtered.slice(page*10,(page+1)*10);
 for(const q of slice)list.append(card(q));
 $('empty').hidden=filtered.length!==0;
 $('prevPage').disabled=page<=0;
 $('nextPage').disabled=page>=pages-1;
 $('pageStatus').textContent=filtered.length?('Showing '+(page*10+1)+'–'+Math.min(filtered.length,(page+1)*10)+' of '+filtered.length+' · page '+(page+1)+' / '+pages):'No unanswered questions';
 $('unansweredOnly').setAttribute('aria-pressed',String(unansweredOnly));
 $('unansweredOnly').textContent=unansweredOnly?'Show all questions':'Show unanswered only';
 $('loadStatus').textContent=topic.questionNumbers.length+' questions loaded from the 2026 user-transcribed paper · no verified answer key mapped.';
}
function fillTopics(){
 const select=$('topicSelect');select.replaceChildren();
 for(const u of index.units){
  const group=node('optgroup');group.label=u.label;
  for(const t of u.topics){
   if(!t.questionNumbers.length)continue;
   const option=node('option','',t.title+' ('+t.questionNumbers.length+')');option.value=t.id;
   group.append(option);
  }
  if(group.childElementCount)select.append(group);
 }
}
$('topicSelect').addEventListener('change',()=>{unansweredOnly=false;setTopic($('topicSelect').value)});
$('prevPage').addEventListener('click',()=>{if(page>0){page--;render();document.getElementById('questionList').scrollIntoView({block:'start'})}});
$('nextPage').addEventListener('click',()=>{if(page<Math.ceil(visibleQs().length/10)-1){page++;render();document.getElementById('questionList').scrollIntoView({block:'start'})}});
$('unansweredOnly').addEventListener('click',()=>{unansweredOnly=!unansweredOnly;page=0;render()});
$('resetTopic').addEventListener('click',()=>{
 if(!topic||!window.confirm('Clear saved answers and flags for '+topic.title+'?'))return;
 for(const q of allQs()){delete state.answers[q.number];delete state.flags[q.number]}
 save();page=0;render();
});
Promise.all([
 fetch('data/tnpsc/group1-prelims-topics.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Syllabus index unavailable');return r.json()}),
 fetch('data/quizzes/tnpsc-group-i-2026-prelims-text.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('2026 source text unavailable');return r.json()})
]).then(([a,b])=>{
 validate(a,b);index=a;bank=b;fillTopics();
 const requested=new URLSearchParams(location.search).get('topic');
 const entry=allTopics().find(t=>t.id===requested&&t.questionNumbers.length)||allTopics().find(t=>t.questionNumbers.length);
 if(!entry)throw Error('No topic practice question sets available');
 setTopic(entry.id);
}).catch(err=>{$('loadStatus').textContent='Topic practice cannot load: '+err.message});
})();