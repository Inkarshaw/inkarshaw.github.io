/* Public, read-only exam overview for directory entries without dedicated resources.
   Never claim a verified exam bank on the basis of shared study material. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const status=$('loadStatus');
const id=new URLSearchParams(location.search).get('exam');
const support={
 foundation:'Shared foundation resources only',
 guide:'Exam guide available',
 practice:'Exam practice available',
 pyq:'Provisional previous-year practice'
};
function node(parent,tag,text,cls){
 const e=document.createElement(tag);
 if(cls)e.className=cls;
 e.textContent=text;
 parent.append(e);return e;
}
function localHref(href){
 if(typeof href!=='string')return null;
 try{
  const url=new URL(href,location.href);
  if(url.origin!==location.origin||!['http:','https:'].includes(url.protocol))return null;
  return href;
 }catch{return null}
}
function officialHref(href){
 if(typeof href!=='string')return null;
 try{const u=new URL(href);return u.protocol==='https:'?href:null}catch{return null}
}
const resourceOptions={
 'defence':[
  ['NCERT basics','Shared geography, science and history foundations.','ncert-school-book-quiz.html'],
  ['Current affairs','Shared daily competitive-exam current affairs, not a dedicated defence mock.','current-affairs/text/']
 ],
 'teaching':[
  ['NCERT school chapters','School-level concepts and related subject quizzes; not a TET/NET paper.','ncert-school-book-quiz.html'],
  ['General syllabus directory','Browse only the examination syllabi presently covered on ClearExams.','syllabus.html']
 ],
 'entrance':[
  ['NCERT foundations','School-level science and mathematics preparation; not a dedicated entrance mock.','ncert-school-book-quiz.html'],
  ['Tamil Nadu school textbooks','Supplementary chapter quizzes, not an original entrance paper.','textbook-quiz.html']
 ],
 'insurance':[
  ['General practice','Shared questions only; section coverage varies by available bank.','practice.html'],
  ['Current affairs','Daily competitive-exam current affairs text.','current-affairs/text/']
 ],
 'state-psc':[
  ['Tamil Nadu school books','Tamil Nadu curriculum foundation. Not a substitute for your state syllabus.','textbook-quiz.html'],
  ['NCERT foundations','General Indian history, geography and science foundations.','ncert-school-book-quiz.html']
 ],
 'other-central':[
  ['General practice','Practice published shared questions only.','practice.html'],
  ['Current affairs','Daily competitive-exam current affairs text.','current-affairs/text/']
 ]
};
function showError(message){
 status.setAttribute('role','alert');status.textContent=message;
 const p=node(status,'p','Browse the exam directory to choose another examination.');
 const a=node(p,'a','Open all exams');a.href='start.html#exam-directory';
}
if(!id||!/^[a-z0-9-]{2,72}$/.test(id)){
 showError('Select an examination from the ClearExams directory.');
 return;
}
fetch('data/exams/all-exams-directory.json',{cache:'no-store'}).then(r=>{
 if(!r.ok)throw Error('Exam directory unavailable');
 return r.json();
}).then(data=>{
 if(!data||data.schemaVersion!==1||!Array.isArray(data.categories))throw Error('Unexpected exam directory');
 let exam=null,category=null;
 for(const group of data.categories){
  const match=(group.exams||[]).find(e=>e.id===id);
  if(match){exam=match;category=group;break}
 }
 if(!exam||!category){showError('This examination is not in the current directory.');return}
 const href=localHref(exam.href);
 if(!href)throw Error('The linked study resource is not a valid ClearExams page');
 document.title=exam.name+' Resources | ClearExams';
 $('breadExam').textContent=exam.name;
 $('examCategory').textContent=category.title;
 $('examName').textContent=exam.name;
 $('examCoverage').textContent=support[exam.level]||'Resource coverage under review';
 $('examSummary').textContent=exam.note||'Shared material available. Dedicated exam-specific material is not published.';
 $('availableIntro').textContent=exam.level==='foundation'
  ?'The available links support general preparation. They are not official '+exam.name+' questions or a complete syllabus.'
  :'ClearExams publishes the linked resource. Check its source labels and scoring limitations.';
 const main=$('mainResource');main.href=href;
 main.textContent=exam.level==='foundation'?'Open shared study resource':'Open published exam resource';
 const cards=$('resourceCards');
 for(const [title,description,url] of resourceOptions[category.id]||[
  ['General practice','Questions shared across available competitive exams.','practice.html'],
  ['NCERT foundations','Foundation chapters, not dedicated exam questions.','ncert-school-book-quiz.html']
 ]){
  const div=node(cards,'article','','resource');
  node(div,'h3',title);node(div,'p',description);
  const a=node(div,'a',url.startsWith('https:')?'Open official paper archive':'Open shared resource');
  a.href=url;
  if(url.startsWith('https:')){a.target='_blank';a.rel='noopener noreferrer'}
 }
 const missing=$('missingItems');
 const absent=[
  'A fully source-verified original '+exam.name+' question bank',
  'Official answer-key matched scoring and detailed solutions',
  'A dedicated full-length '+exam.name+' mock test',
  'An independently verified, up-to-date '+exam.name+' syllabus and recruitment notice'
 ];
 if(exam.level==='practice')absent.splice(2,1);
 if(exam.level==='guide')absent.splice(3,1);
 if(exam.level==='pyq')absent.splice(0,1);
 for(const item of absent)node(missing,'li',item);
 const official=officialHref(exam.officialUrl);
 if(official){
  const a=node($('officialArea'),'a',exam.officialLabel||'Official examination portal');
  a.href=official;a.target='_blank';a.rel='noopener noreferrer';
 }else{
  node($('officialArea'),'p','An exam-specific authority link has not yet been independently added. Please consult the current notification from the responsible commission or recruiter.','note');
 }
 $('examBody').hidden=false;status.textContent='';
}).catch(()=>{
 showError('Unable to load the selected examination right now.');
});
})();
