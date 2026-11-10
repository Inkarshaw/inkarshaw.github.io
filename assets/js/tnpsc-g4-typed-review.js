/* Source-aware TNPSC Group IV 2024/2025 typed draft player.
   Public content integrity: only source-isolated typed questions may be chosen.
   Missing scan/OCR positions remain original-numbered PDF links, NEVER generated filler.
   Official key mapping is separate from human certification of question text. */
(()=>{
'use strict';
const $=id=>document.getElementById(id),LETTERS=['A','B','C','D','E'];
const year=new URLSearchParams(location.search).get('year')==='2024'?'2024':'2025';
const file='data/quizzes/tnpsc-g4-'+year+'-typed-review.json';
const storage='clearexams-tnpsc-g4-'+year+'-typed-review-v1';
let paper=null,readers=null,current=1,answers={},onlyTyped=true,allowPdfAnswers=false;
const src=q=>paper.sourcePaperUrl+(q?.sourcePdfPage?'#page='+q.sourcePdfPage:'');
const externalSource=n=>readers?.years?.[year]?.pages?.find(p=>n>=p.start&&n<=p.end)?.url||null;
const available=q=>q.sourceStatus==='typed-review-needed'&&q.textStatus==='editorial-draft-requires-source-proof'&&typeof q.text==='string'&&q.text.trim()&&q.options&&LETTERS.every(c=>typeof q.options[c]==='string'&&q.options[c].trim());
const sourceMissing=q=>q.sourceStatus==='source-pdf-required';
const get=n=>paper.questions[n-1];
const chooseNumber=()=>paper.questions.filter(available).map(q=>q.number);
function loadSaved(){try{const s=JSON.parse(localStorage.getItem(storage)||'null');if(s&&typeof s.answers==='object'){answers=Object.fromEntries(Object.entries(s.answers).filter(([n,v])=>Number.isInteger(+n)&&+n>=1&&+n<=200&&LETTERS.includes(v)));current=Math.min(200,Math.max(1,+s.current||1));onlyTyped=s.onlyTyped!==false;allowPdfAnswers=s.allowPdfAnswers===true;}}catch(_){}}
function save(){try{localStorage.setItem(storage,JSON.stringify({current,answers,onlyTyped,allowPdfAnswers}))}catch(_){}}
function goto(n){current=Math.min(200,Math.max(1,n));save();render();}
function showResult(active){$('results').hidden=!active;$('quiz').hidden=active;if(active)window.scrollTo(0,0);}
function neighbor(dir,typedOnly){if(!typedOnly)return Math.min(200,Math.max(1,current+dir));const nums=chooseNumber();if(!nums.length)return current;const found=dir>0?nums.find(n=>n>current):nums.filter(n=>n<current).at(-1);return found||current;}
function renderPalette(){const el=$('palette');el.replaceChildren();const nums=onlyTyped?chooseNumber():paper.questions.map(q=>q.number);
for(const n of nums){const q=get(n);const b=document.createElement('button');b.type='button';b.textContent=String(n);b.setAttribute('aria-label','Go to original question '+n);b.className='pal '+(available(q)?'available':'unavailable')+(answers[n]?' answered':'')+(n===current?' current':'');b.setAttribute('aria-current',n===current?'true':'false');b.addEventListener('click',()=>goto(n));el.append(b)}
const typed=chooseNumber();$('answered').textContent=typed.filter(n=>LETTERS.includes(answers[n])).length+' / '+typed.length+' typed questions answered. '+(200-typed.length)+' original question texts still unavailable.';
}
function render(){if(!paper)return;const q=get(current),ready=available(q);
$('onlyTyped').checked=onlyTyped;$('allowPdfAnswers').checked=allowPdfAnswers;
$('qMeta').textContent='Original question '+q.number+' / 200 · '+q.section;
$('progress').style.width=(current/200*100)+'%';
$('stem').textContent=ready?q.text:'Question '+q.number+' — text not yet source-verified';
$('stem').lang=ready&&q.language==='ta'?'ta':'en';
$('sourceFlag').textContent=ready?((q.sourceReviewStatus==='source-pdf-visual-proof-pending'?'Editorially adapted Tamil question and choices · not verbatim; exact primary-PDF comparison still pending. ':'English/Tamil OCR or user draft · pending human comparison with original PDF. ')+(q.keyToken==='ALL'?'Official key accepts all options; ungraded.':'Official answer-key option mapping available.')):sourceMissing(q)?'Question '+q.number+' is image-only, incomplete OCR or otherwise not sufficiently reviewed to display as typed MCQ.':'Question '+q.number+' needs editorial source verification before it can be played.';
$('unavailable').hidden=ready;
const external=externalSource(q.number);$('externalTextLink').hidden=!external;if(external){$('externalTextLink').href=external;$('externalTextLink').textContent='Independent typed text · Q'+q.number;}
$('pageLink').href=src(q);$('pageLink').textContent=q.sourcePdfPage?'Official PDF · page '+q.sourcePdfPage:'Read official PDF';
const o=$('options');o.hidden=!(ready||allowPdfAnswers);o.replaceChildren();if(ready||allowPdfAnswers){const legend=document.createElement('legend');legend.textContent=ready?'Select an answer':'Answer letters only — first read this question in the PDF or independent text reference';o.append(legend);
for(const letter of LETTERS){const lbl=document.createElement('label');lbl.className='choice';const radio=document.createElement('input');radio.type='radio';radio.name='answer';radio.value=letter;radio.checked=answers[q.number]===letter;radio.addEventListener('change',()=>{answers[q.number]=letter;save();renderPalette()});const strong=document.createElement('strong');strong.textContent=letter+'.';const txt=document.createElement('span');txt.textContent=ready?q.options[letter]:'Choice '+letter+' (option text only in source)';lbl.append(radio,strong,txt);o.append(lbl)}}
$('prev').disabled=neighbor(-1,onlyTyped)===current;$('next').disabled=neighbor(1,onlyTyped)===current;$('nextTyped').disabled=neighbor(1,true)===current;renderPalette();
}
function review(){
const el=$('answerReview');el.replaceChildren();
const typed=paper.questions.filter(q=>available(q)||allowPdfAnswers);let right=0,wrong=0,blank=0,ungraded=0,graded=0;
for(const q of typed){const a=answers[q.number]||null,score=q.accepted.length>0,correct=score&&q.accepted.includes(a);if(score)graded++;else ungraded++;if(score){if(!a)blank++;else if(correct)right++;else wrong++;}
const d=document.createElement('details');d.className='review';const sum=document.createElement('summary');sum.textContent='Q'+q.number+' · '+(score?(correct?'Correct':a?'Incorrect':'Unanswered'):'Ungraded · ALL accepted');d.append(sum);
const stem=document.createElement('p');stem.textContent=available(q)?q.text:'PDF / external text needed: original question '+q.number;d.append(stem);
const chosen=document.createElement('p');chosen.textContent='Your response: '+(a?a+(available(q)?' — '+q.options[a]:' (PDF-only response)'):'Not selected');d.append(chosen);
const key=document.createElement('p');key.textContent='Official final key ('+year+'): '+(q.keyToken==='ALL'?'ALL':q.keyToken);d.append(key);
const caution=document.createElement('p');caution.className='mini';caution.textContent=available(q)?(q.sourceReviewStatus==='source-pdf-visual-proof-pending'?'This is an editorial Tamil adaptation, not a verbatim scan transcription; the official key is mapped by source position, but original choices must be checked in the PDF.':'The answer letters map to the official key. Question wording remains unverified draft text.'):'The local question wording and options were not verified or displayed. This response was entered against the official PDF / independent typed-text page; source text was not reproduced.';d.append(caution);
const url=document.createElement('a');url.href=src(q);url.textContent='Check this question in the original PDF';url.target='_blank';url.rel='noopener noreferrer';d.append(url);el.append(d)}
$('score').textContent=right+' / '+graded;
$('resultInfo').textContent='Indicative: '+(right*1.5)+' / '+(graded*1.5)+' marks, '+wrong+' incorrect, '+blank+' blank, '+ungraded+' ungraded. '+(allowPdfAnswers?'Includes original-PDF-only A–E answer positions. The source must be read separately.':'Covers only available local typed drafts.')+' These results are provisional; OCR text has not been independently certified.';
showResult(true);
}
$('prev').addEventListener('click',()=>goto(neighbor(-1,onlyTyped)));
$('next').addEventListener('click',()=>goto(neighbor(1,onlyTyped)));
$('nextTyped').addEventListener('click',()=>goto(neighbor(1,true)));
$('onlyTyped').addEventListener('change',e=>{onlyTyped=e.target.checked;save();render()});
$('allowPdfAnswers').addEventListener('change',e=>{allowPdfAnswers=e.target.checked;if(allowPdfAnswers)onlyTyped=false;save();render()});
$('submit').addEventListener('click',()=>{if(confirm('Review your saved typed-draft answers against the mapped official key?'))review()});
$('backToQuiz').addEventListener('click',()=>{showResult(false);render()});
Promise.all([file,'data/quizzes/tnpsc-g4-external-readers.json'].map(url=>fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}))).then(([d,readerData])=>{
const rr=readerData?.years?.[year]?.pages;if(readerData.schemaVersion!==1||!Array.isArray(rr)||rr.flatMap(p=>Array.from({length:p.end-p.start+1},(_,i)=>p.start+i)).some((n,i)=>n!==i+1)||rr.at(-1)?.end!==200)throw Error('Full-number external source index failed review');readers=readerData;
if(d.year!==Number(year)||d.originalQuestionCount!==200||!Array.isArray(d.questions)||d.questions.length!==200||d.questions.some((q,i)=>q.number!==i+1||!Array.isArray(q.accepted)||q.accepted.some(k=>!LETTERS.includes(k))))throw Error('Question bank did not pass source-number checks.');
const typed=d.questions.filter(available);if(typed.length!==d.typedPlayableCount||typed.filter(q=>q.accepted.length).length!==d.gradedQuestionCount)throw Error('Published readable-question counts did not match bank metadata.');
paper=d;loadSaved();const navTyped=chooseNumber();if(onlyTyped&&!available(get(current))&&navTyped.length)current=navTyped[0];
$('title').textContent='Group IV '+year+' · Typed Review';
$('stats').replaceChildren();for(const label of [year+' paper · 200 originals',typed.length+' typed drafts',d.gradedQuestionCount+' keyed draft items',d.verifiedQuestionCount+' fully verified']){const span=document.createElement('span');span.textContent=label;$('stats').append(span)}
$('year'+year).setAttribute('aria-current','page');
$('paperLink').href=d.sourcePaperUrl;$('keyLink').href=d.answerKeyUrl;
const companion='pyq-original-paper.html?paper='+encodeURIComponent(d.paperId);
$('companionLink').href=companion;$('fullPaper').href=companion;
$('loadStatus').textContent=typed.length+' drafted source-numbered questions are playable; '+(200-typed.length)+' require original-paper review. The full-paper PDF companion covers all 200 answer positions.';
$('quiz').hidden=false;render();
}).catch(e=>{$('loadStatus').textContent='Could not load source-checked question data: '+e.message;});
})();
