/* TNPSC Group I official unit index, curated PYQ links and local-only revision ticks. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const STORAGE='clearexams:tnpsc:group1:syllabus:revision:v1';
let data=null;
const done=new Set();
let lastTopic='';
function safeRead(){
 try{
 const x=JSON.parse(localStorage.getItem(STORAGE)||'{}');
 if(Array.isArray(x.revised))for(const item of x.revised)if(typeof item==='string'&&item.length<100)done.add(item);
 if(typeof x.lastTopic==='string')lastTopic=x.lastTopic;
 }catch{}
}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify({version:1,revised:[...done],lastTopic}))}catch{}}
function node(tag,cl,content){
 const element=document.createElement(tag);
 if(cl)element.className=cl;
 if(content!==undefined)element.textContent=content;
 return element;
}
function allTopics(){return data.units.flatMap(u=>u.topics)}
function updateProgress(){
 if(!data)return;
 const valid=new Set(allTopics().map(t=>t.id));
 for(const id of [...done])if(!valid.has(id))done.delete(id);
 const total=valid.size,count=done.size,percentage=total?Math.round(count*100/total):0;
 $('doneCount').textContent=count+' / '+total;
 $('progressFill').style.width=percentage+'%';
 $('studyProgress').setAttribute('aria-valuenow',String(percentage));
 const last=allTopics().find(t=>t.id===lastTopic&&t.questionNumbers.length);
 if(last){$('resumeTopic').href='tnpsc-group1-topic-practice.html?topic='+encodeURIComponent(last.id);
   $('resumeTopic').textContent='Continue · '+last.title+' →';
 }else{$('resumeTopic').href='#units';$('resumeTopic').textContent='Explore your first topic →'}
}
function topicNode(topic){
 const row=node('div','topic');row.dataset.topicId=topic.id;
 const left=node('div','topic-left');
 const cb=node('input','topic-check');cb.type='checkbox';cb.checked=done.has(topic.id);
 cb.id='revision-'+topic.id;cb.setAttribute('aria-label','Mark '+topic.title+' revised');
 cb.addEventListener('change',()=>{
  if(cb.checked)done.add(topic.id);else done.delete(topic.id);
  save();updateProgress();
 });
 const names=node('div');
 const label=node('label','topic-title',topic.title);label.htmlFor=cb.id;
 const small=node('div','topic-meta',topic.questionNumbers.length?
  topic.questionNumbers.length+' mapped 2026 PYQ'+(topic.questionNumbers.length===1?'':'s')+' · ungraded OCR':'No 2026 PYQ mapped yet');
 names.append(label,small);left.append(cb,names);row.append(left);
 if(topic.questionNumbers.length){
  const a=node('a','topic-link','Practice '+topic.questionNumbers.length+' →');
  a.href='tnpsc-group1-topic-practice.html?topic='+encodeURIComponent(topic.id);
  a.addEventListener('click',()=>{lastTopic=topic.id;save();updateProgress()});
  row.append(a);
 }else row.append(node('span','topic-wait','More practice coming'));
 return row;
}
function render(){
 if(!data)return;
 const term=$('topicSearch').value.trim().toLocaleLowerCase();
 const list=$('unitList');list.replaceChildren();
 let visible=0,topicsCount=0;
 data.units.forEach((u,index)=>{
  const isTitleMatch=u.label.toLocaleLowerCase().includes(term);
  const topics=u.topics.filter(t=>!term||isTitleMatch||t.title.toLocaleLowerCase().includes(term));
  if(!topics.length)return;
  visible++;topicsCount+=topics.length;
  const details=node('details','unit');details.dataset.unitId=u.id;
  if(term||index===0)details.open=true;
  const summary=node('summary');
  const tag=node('span','unit-number',u.part==='General Studies'?'GS '+(index+1):'B '+(index-5));
  const name=node('div','unit-name');
  name.append(node('strong','',u.label),node('small','',u.part+' · '+u.topics.length+' syllabus topics · '+u.mappedDistinctQuestions+' mapped distinct PYQs'));
  const weight=node('span','unit-weight',u.expectedQuestions+' questions');
  summary.append(tag,name,weight);
  details.append(summary);
  const body=node('div','unit-body');
  for(const t of topics)body.append(topicNode(t));
  details.append(body);
  list.append(details);
 });
 $('filterStatus').textContent=visible+' units · '+topicsCount+' topics'+(term?' matching "'+$('topicSearch').value.trim()+'"':'');
 $('emptySearch').hidden=visible>0;
 updateProgress();
}
function validate(d){
 if(!d||d.schemaVersion!==1||d.syllabusCode!=='497'||d.units?.length!==8||
    d.totals?.questions!==200||d.totals.generalStudies!==175||d.totals.aptitudeReasoning!==25||
    !Number.isInteger(d.topicCount)||d.topicCount<30)throw Error('Incomplete Group I syllabus data');
 const ids=new Set(),numbers=new Set();let weight=0;
 for(const u of d.units){
  if(!u.id||!Array.isArray(u.topics)||!u.topics.length)throw Error('Incomplete unit');
  weight+=u.expectedQuestions;
  for(const t of u.topics){
   if(ids.has(t.id)||!t.title||!Array.isArray(t.questionNumbers))throw Error('Invalid topic '+t.id);
   ids.add(t.id);
   for(const num of t.questionNumbers){
    if(!Number.isInteger(num)||num<1||num>200)throw Error('Bad source Q'+num);
    numbers.add(num);
   }
  }
 }
 if(ids.size!==d.topicCount||weight!==200||numbers.size!==d.editorialMappedDistinctQuestions)
  throw Error('Syllabus unit or PYQ mapping integrity failed');
 return d;
}
$('topicSearch').addEventListener('input',render);
$('clearSearch').addEventListener('click',()=>{$('topicSearch').value='';render();$('topicSearch').focus()});
$('expandAll').addEventListener('click',()=>document.querySelectorAll('#unitList details.unit').forEach(d=>d.open=true));
$('collapseAll').addEventListener('click',()=>document.querySelectorAll('#unitList details.unit').forEach(d=>d.open=false));
safeRead();
fetch('data/tnpsc/group1-prelims-topics.json',{cache:'no-store'})
.then(r=>{if(!r.ok)throw Error('Syllabus index unavailable');return r.json()})
.then(d=>{data=validate(d);render()})
.catch(err=>{$('filterStatus').textContent='Unable to load unit index: '+err.message});
})();