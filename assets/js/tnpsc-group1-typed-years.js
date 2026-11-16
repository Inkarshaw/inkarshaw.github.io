/* Group I multi-year typed draft quiz. Only source-numbered items, never auto-grade unmapped keys. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const STORAGE='clearexams:tnpsc:g1:multi-year-typed:v1:';
const ALLOWED=['A','B','C','D','E'];
const safeTnpsc=url=>{try{const u=new URL(url);return u.protocol==='https:'&&/^(?:www\.)?tnpsc\.gov\.in$/.test(u.hostname)?u.href:null}catch{return null}};
const safeMirrorPdf=url=>{try{const u=new URL(url);return u.protocol==='https:'&&((u.hostname==='previousyearquestions.app'&&u.pathname==='/papers/tnpsc-group-1/2022/prelims-general-studies.pdf')||(u.hostname==='cdn.govtjobsnet.com'&&u.pathname==='/previous-papers/tnpsc-group-1-prelims-2019-question-paper-with-answers.pdf')||(u.hostname==='winmeen.com'&&u.pathname==='/wp-content/uploads/2021/01/TNPSC-GROUP-I-PRELIMINARY-EXAM-2020-TENTATIVE-ANSWER-KEYS.pdf'&&!u.search))?u.href:null}catch{return null}};
const safeReader=url=>{try{const u=new URL(url);return u.protocol==='https:'&&(['arivark.com','superprep.io','appolosupport.com','tamiltest.in'].includes(u.hostname)||(['www.unlockias.in','unlockias.in'].includes(u.hostname)&&['/pdfs/state-pcs/tnpsc-2024-prelims-question-paper.pdf','/tnpsc-previous-year-questions/prelims/2019','/tnpsc-previous-year-questions/prelims/2017'].includes(u.pathname))||(u.hostname==='civilserviceaspirants.in'&&/^\/Tnpsc\/Question-Paper-with-Answer\/Group-1\/Group-1-prelims-2021-january-[1-5]\.php$/.test(u.pathname)&&!u.search))?u.href:null}catch{return null}};
let bank=[],paper=null,index=0,responses={},savedAt=0;
function stored(year){try{
 const d=JSON.parse(localStorage.getItem(STORAGE+year)||'null');
 if(!d||d.version!==1||typeof d.answers!=='object'||Array.isArray(d.answers))return {};
 const items={};
 for(const q of paper.questions){const letter=d.answers[String(q.number)];if(paper.optionLetters.includes(letter))items[String(q.number)]=letter}
 return items;
}catch{return {}}}
function save(){if(!paper)return;try{localStorage.setItem(STORAGE+paper.year,JSON.stringify({version:1,year:paper.year,answers:responses,updatedAt:Date.now()}))}catch{}}
function showReview(yes){$('quizArea').hidden=yes;$('reviewPane').hidden=!yes}
function status(){if(!paper)return;const count=paper.questions.length;
 const done=paper.questions.filter(q=>!!responses[String(q.number)]).length;
 $('coverage').textContent=paper.year+' · '+count+' / 200 typed · '+(200-count)+' not yet transcribed · 0 verified keys';
 $('progressText').textContent=done+' of '+count+' available text questions answered; locally saved.';
 $('bar').style.width=String(Math.round(100*done/count))+'%';
}
function palette(){
 $('palette').replaceChildren();
 for(let i=0;i<paper.questions.length;i++){
  const q=paper.questions[i];const b=document.createElement('button');b.type='button';
  b.textContent=String(q.number);b.className=(responses[String(q.number)]?'answered ':'')+(i===index?'current':'');
  b.setAttribute('aria-label','Original question '+q.number+(responses[String(q.number)]?', answered':''));
  b.setAttribute('aria-current',i===index?'true':'false');
  b.addEventListener('click',()=>{index=i;render()});$('palette').append(b);
 }
}
function render(){
 if(!paper)return;
 showReview(false);const q=paper.questions[index];const count=paper.questions.length;
 $('paperLabel').textContent='TNPSC Group I · '+paper.year+' · adapted English text';
 $('questionNumber').textContent='Original Q'+q.number;
 $('position').textContent='Typed item '+(index+1)+' of '+count+' · source-option ordering retained · no automatic grading'+(q.editorialFigureText?' · Editorial text description of original diagram: check source PDF':q.editorialPassageSummary?' · Passage condensed for study: compare original PDF':q.specialFinalKeyReview?' · Final key marks this position as a special case (ALL): no grading':q.multipleAnswerFinalKeyReview?' · Final key has multiple accepted choices: no grading':q.officialFinalKeyExceptionReview?' · Official final key has a special ALL decision; not graded':q.sourceOptionDispute?' · A–D wording conflicts between readers; cross-checked compressed paper, ungraded':q.secondaryReaderOfficialKeyDiscrepancy?' · Secondary answer label conflicts with official final key; not graded':q.secondaryKeyConflict?' · Coaching answer disagrees with TNPSC final key; not graded':q.historicClassificationCaution?' · Historical outdated classification term; not current scientific guidance':'')+(paper.finalKeyVersionCrosswalk&&paper.finalKeyVersionCrosswalk.verified===false?' · Final-key version crosswalk pending: do not infer scores':'');
 $('questionText').textContent=q.text;
 const caution=$('sourceCaution');if(caution){caution.hidden=!q.sourceCaution;caution.textContent=q.sourceCaution?'Source review note: '+q.sourceCaution:'';}
 $('choices').replaceChildren();
 const legend=document.createElement('legend');legend.textContent='Choose an option from the original question-number series';$('choices').append(legend);
 paper.optionLetters.forEach((letter,i)=>{
  const field=document.createElement('label');field.className='option';
  const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=letter;
  radio.checked=responses[String(q.number)]===letter;radio.setAttribute('aria-label','Choice '+letter);
  radio.addEventListener('change',()=>{responses[String(q.number)]=letter;save();status();palette()});
  const badge=document.createElement('span');badge.className='letter';badge.textContent=letter;
  const body=document.createElement('span');body.className='labeltext';
  body.textContent=letter==='E'?'Answer not known / விடை தெரியவில்லை':q.options[i];
  field.append(radio,badge,body);$('choices').append(field);
 });
 $('previous').disabled=index===0;$('next').disabled=index===count-1;
 $('clearAnswer').disabled=!responses[String(q.number)];
 const original=safeTnpsc(paper.officialPdf);if(original){$('pdfLink').href=original+(Number.isInteger(q.sourcePdfPage)?'#page='+q.sourcePdfPage:'');$('pdfLink').textContent=Number.isInteger(q.sourcePdfPage)?'TNPSC original booklet · PDF page '+q.sourcePdfPage:'Official TNPSC paper (PDF)';$('pdfLink').hidden=false}else $('pdfLink').hidden=true;
 const finalKey=safeTnpsc(paper.finalKeyUrl);if(finalKey){$('finalKeyLink').href=finalKey;$('finalKeyLink').hidden=false}else $('finalKeyLink').hidden=true;
 const mirror=safeMirrorPdf(paper.mirroredSourceUrl);
 const mirrorPage=paper.year===2021?q.secondaryPdfPage:q.sourcePdfPage;
 if(mirror){$('mirrorPdfLink').href=mirror+(Number.isInteger(mirrorPage)?'#page='+mirrorPage:'');$('mirrorPdfLink').textContent=(paper.year===2019?'Scanned 2019 GR1P booklet (hand-marked; not final key) · PDF page ':paper.year===2021?'2021 secondary bilingual PDF (tentative, not official key) · page ':'Readable original booklet mirror · PDF page ')+(Number.isInteger(mirrorPage)?mirrorPage:'source pages');$('mirrorPdfLink').hidden=false}else $('mirrorPdfLink').hidden=true;
 const reader=safeReader(q.sourceReaderUrl)||safeReader(paper.secondaryReader);if(reader){$('compareLink').href=reader;$('compareLink').hidden=false}else $('compareLink').hidden=true;
 status();palette();
}
function setYear(year){
 const found=bank.find(p=>p.year===year);if(!found)return;
 paper=found;index=0;responses=stored(found.year);$('yearPicker').value=String(year);render();
 try{history.replaceState(null,'','?year='+year)}catch{}
}
function review(){
 if(!paper)return;
 showReview(true);
 const n=paper.questions.filter(q=>responses[String(q.number)]).length;
 $('reviewSummary').textContent='Year '+paper.year+': '+n+' of '+paper.questions.length+
   ' typed study items attempted. There are 200 numbered positions in the original paper. No marks or correct-answer judgments are issued for these unmapped study drafts.';
 const out=$('reviewList');out.replaceChildren();
 paper.questions.forEach(q=>{const span=document.createElement('span');span.textContent='Q'+q.number+': '+(responses[String(q.number)]||'not answered');out.append(span)});
}
function validate(d){
 if(!d||d.schemaVersion!==1||!Array.isArray(d.papers)||!d.papers.length)throw Error('Typed source index is invalid');
 const years=new Set();
 for(const p of d.papers){
  if(!Number.isInteger(p.year)||years.has(p.year)||p.year<2011||p.year>2026)throw Error('Duplicate or invalid exam year');
  years.add(p.year);
  if(p.originalQuestionCount!==200||p.grading!=='not-graded'||p.keyedAnswerCount!==0||
   !['ABCD','ABCDE'].includes(p.optionLetters.join(''))||!safeTnpsc(p.officialPdf)||
   (p.secondaryReader!==null&&!safeReader(p.secondaryReader))||(p.mirroredSourceUrl!==undefined&&!safeMirrorPdf(p.mirroredSourceUrl))||(p.finalKeyUrl!==undefined&&!safeTnpsc(p.finalKeyUrl))||!Array.isArray(p.questions)||p.questions.length<1||p.questions.length>200)throw Error('Incomplete source metadata');
  const ids=new Set();
  for(const q of p.questions){
   if(!Number.isInteger(q.number)||q.number<1||q.number>200||ids.has(q.number)||
      !q.text||q.text.length<18||!Array.isArray(q.options)||q.options.length!==4||
      q.options.some(o=>typeof o!=='string'||!o.trim())||(q.sourceReaderUrl!==undefined&&!safeReader(q.sourceReaderUrl))||q.keyStatus!=='unmapped'||
      (Array.isArray(q.accepted)&&q.accepted.length))throw Error('Bad typed item in '+p.year);
   ids.add(q.number);
  }
 }
 return d.papers.sort((a,b)=>b.year-a.year)
}
$('yearPicker').addEventListener('change',e=>setYear(Number(e.target.value)));
$('previous').addEventListener('click',()=>{index=Math.max(0,index-1);render()});
$('next').addEventListener('click',()=>{index=Math.min(paper.questions.length-1,index+1);render()});
$('clearAnswer').addEventListener('click',()=>{delete responses[String(paper.questions[index].number)];save();render()});
$('finish').addEventListener('click',review);
$('backToQuiz').addEventListener('click',()=>{render()});
$('reset').addEventListener('click',()=>{
 if(!paper||!confirm('Clear saved answers for '+paper.year+'?'))return;
 responses={};index=0;save();render()
});
document.addEventListener('keydown',event=>{
 if(!paper||$('quizArea').hidden||event.altKey||event.ctrlKey||event.metaKey)return;
 if(['INPUT','SELECT','TEXTAREA','BUTTON'].includes(event.target?.tagName))return;
 if(event.key==='ArrowRight'&&index<paper.questions.length-1){index++;render()}
 if(event.key==='ArrowLeft'&&index>0){index--;render()}
});
fetch('data/quizzes/tnpsc-group1-multiyear-typed-draft.json',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Could not load typed question bank');return r.json()})
 .then(data=>{
 bank=validate(data);
 const picker=$('yearPicker');picker.replaceChildren();
 bank.forEach(p=>{const opt=document.createElement('option');opt.value=String(p.year);
  opt.textContent=p.year+' · '+p.questions.length+' typed questions';picker.append(opt)});
 const requested=Number(new URLSearchParams(location.search).get('year'));
 const initial=bank.find(p=>p.year===requested)?.year||bank[0].year;
 $('quizArea').hidden=false;setYear(initial)
 }).catch(err=>{$('coverage').textContent='Typed quiz could not be loaded: '+err.message;$('quizArea').hidden=true});
})();