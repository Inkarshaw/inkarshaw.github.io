/* Full-paper machine-text drafts: local study reader. No scoring or source-certification. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const MAX_FILE=45*1024*1024;
const letters=['A','B','C','D','E'];
const bank=new Map();
const published=new Map();
let selectedPublished='';
let active=null,current=0,shown=[],responses={};
const asText=x=>typeof x==='string'?x:'';
const clean=x=>asText(x).trim();
const validURL=x=>{try{const u=new URL(x);if(["https://athiyamanteam.com/wp-content/uploads/2019/06/TNPSC-Group-4-Tamil-2013-question-paper-athiyamanteam-coaching.pdf","https://cbsetamil.com/wp-content/uploads/2025/04/TNPSC-Group-4-General-Studies-Paper-2013.pdf","https://maruthusaroeducationacademy.weebly.com/uploads/1/2/4/9/124995440/21_12_2014_general_tamil_tnpscguru.in.pdf","https://maruthusaroeducationacademy.weebly.com/uploads/1/2/4/9/124995440/21_12_2014_general_studies_www.tnpscguru.in.pdf"].includes(u.href))return u.href;return u.protocol==='https:'&&/^(?:www\.)?(?:tnpsc\.gov\.in|tnusrb\.tn\.gov\.in|upsc\.gov\.in|tamilnaducareerservices\.tn\.gov\.in)$/i.test(u.hostname)?u.href:null}catch{return null}};
function say(message,error=false){$('status').textContent=message;$('status').style.color=error?'#a23b38':'#425e75'}
function key(id){return 'ce-pyq-bulk-answers-v1:'+id}
function normalize(raw){
 if(!raw||raw.schemaVersion!==1||!Array.isArray(raw.questionCandidates)||!Array.isArray(raw.pages))throw Error('Not a ClearExams PDF-extraction draft');
 const segmented=raw.questionCandidates.length?null:window.ClearExamsPYQSourceSplitter?.parse(raw);
 const candidate=raw.questionCandidates.length?raw.questionCandidates:(segmented?.questions||[]);
 if(candidate.length>400||raw.pages.length>500)throw Error('Unusually large paper structure');
 const seen=new Set();
 const questions=candidate.filter(q=>{
  if(!q||!Number.isInteger(q.number)||q.number<1||q.number>400||seen.has(q.number))return false;
  seen.add(q.number);return true;
 }).map(q=>({
  number:q.number,text:asText(q.text),options:Object.fromEntries(letters.map(a=>[a,asText(q.options?.[a])])),
  sourcePdfPage:Number.isInteger(q.sourcePdfPage)?q.sourcePdfPage:null,
  complete:q.fourOptionsDetected===true,
  sourceStatus:asText(q.textStatus)||'unverified-machine-extracted',rawBlock:asText(q.rawBlock),
  textRecovered:q.textRecovered!==false,issues:Array.isArray(q.issues)?q.issues.slice(0,5):[]
 })).sort((a,b)=>a.number-b.number);
 const pageOnly=!questions.length;
 if(pageOnly&&(!raw.pages.length||!raw.pages.some(p=>clean(p.text))))throw Error('This PDF has no readable text. Re-run extraction with Tamil/English OCR.');
 if(pageOnly){
  for(const p of raw.pages){
   questions.push({number:p.pdfPage,text:asText(p.text)||'[Unrecognized image-only page]',options:Object.fromEntries(letters.map(l=>[l,''])),
    sourcePdfPage:p.pdfPage,complete:false,sourceStatus:'unverified-pdf-page-text',rawBlock:asText(p.text),recordType:'page-text'});
  }
 }
 const name=[clean(raw.exam)||'Unknown exam',raw.year||'Unknown year',clean(raw.sourceFilename)||clean(raw.id)].join(' · ');
 const source=validURL(raw.sourcePdf);
 return {id:clean(raw.id)||name,name,year:raw.year,source,questions,
  pages:raw.pages.map(p=>({pdfPage:p.pdfPage,text:asText(p.text),method:asText(p.method),
   ocrAlternateText:asText(p.ocrAlternateText),machineOcrUnverified:p.machineOcrUnverified===true})),
  stats:raw.stats||{}, fileStatus:raw.sourceTextKind||'unverified',
  ocrRecovery:raw.ocrRecovery||null,pageOnly};
}
function saveLocal(){
 if(!active)return;
 try{localStorage.setItem(key(active.id),JSON.stringify(responses))}catch{}
}
function loadLocal(){
 try{const d=JSON.parse(localStorage.getItem(key(active.id))||'{}');
  responses=Object.fromEntries(Object.entries(d).filter(([n,l])=>active.questions.some(q=>String(q.number)===n)&&letters.includes(l)));
 }catch{responses={}}
}
function setPaper(id){
 active=bank.get(id)||null;
 $('paperPanel').hidden=!active;$('reader').hidden=!active;
 $('save').disabled=!active;$('clear').disabled=!active;$('exportQuestions').disabled=!active;
 if(!active)return;
 $('paperHeading').textContent=active.name;
 $('originalPdfLink').href=active.source||'pyq-hub.html';
 $('originalPdfLink').textContent=active.source?'Open original official paper PDF':'See source-paper archive';
 const counts=active.questions.reduce((o,q)=>(o.complete+=q.complete?1:0,o.recovered+=q.textRecovered?1:0,o),{complete:0,recovered:0});
 $('paperStats').textContent=active.pageOnly?
  active.pages.length+' extracted source pages (question numbers could not be parsed) · no answer scoring':
  active.questions.length+' original-numbered question positions · '+counts.recovered+
   ' stems available for study · '+counts.complete+' provisional A–D text sets · '+
   (active.questions.length-counts.complete)+' need source corrections · all ungraded'+
   (active.visualStudyRecoveries?' · '+active.visualStudyRecoveries+' official-PDF-page editorial study retypes (not verbatim)':'')+
   (active.textStudyRecoveries?' · '+active.textStudyRecoveries+' stored-text-only study retypes (scan review pending)':'')+
   (active.ocrRecovery?' · '+active.ocrRecovery.added+' OCR page additions, '+active.ocrRecovery.alternative+' alternate OCR pages (unverified)':'');
 loadLocal();current=0;$('search').value='';$('filter').value='all';filterQuestions();
 say('Opened '+active.name+'. Text is unverified. Responses are saved only in this browser.');
}
function filterQuestions(){
 if(!active)return;
 const query=$('search').value.trim().toLocaleLowerCase(),f=$('filter').value;
 shown=active.questions.map((q,i)=>({q,i})).filter(({q})=>{
  if(f==='complete'&&!q.complete)return false;
  if(f==='incomplete'&&q.complete)return false;
  if(f==='missing-stem'&&q.textRecovered)return false;
  if(f==='unanswered'&&responses[q.number])return false;
  return !query||String(q.number)===query||[q.text,...letters.map(l=>q.options[l])].join(' ').toLocaleLowerCase().includes(query);
 }).map(x=>x.i);
 $('filtered').textContent=shown.length+(active.pageOnly?' extracted source pages':' detected question candidates')+' match this view; missing question numbers are not invented';
 if(shown.length&&!shown.includes(current))current=shown[0];
 render();
}
function choice(q,l){
 responses[q.number]=l;saveLocal();filterQuestions();
}
function textNode(tag,cl,text){
 const e=document.createElement(tag);if(cl)e.className=cl;e.textContent=text;return e;
}
function render(){
 if(!active)return;
 const q=active.questions[current];
 if(!q||!shown.length){
  $('reader').hidden=true;$('answerProgress').textContent='';
  $('meter').style.width='0%';return;
 }
 $('reader').hidden=false;
 $('position').textContent=(active.pageOnly?'PDF page ':'Question ')+q.number+' · '+(current+1)+' of '+active.questions.length;
 const selectedPage=active.pages.find(p=>p.pdfPage===q.sourcePdfPage);
 $('sourceMeta').textContent=q.sourcePdfPage?'Source PDF page '+q.sourcePdfPage+(selectedPage?.machineOcrUnverified?' · machine OCR, unverified':''):'Source page unknown';
 $('questionPdfLink').href=active.source&&q.sourcePdfPage?active.source+'#page='+q.sourcePdfPage:active.source||'pyq-hub.html';
 $('questionPdfLink').textContent=q.sourcePdfPage?'View source PDF page '+q.sourcePdfPage:'View source PDF';
 $('stem').textContent=q.text||(/^(?:2012|2013|2016|2018)-original-page-linked$/.test(q.sourceStatus)?'Read original question '+q.number+' using the PDF page link above.':'[Question text unreadable — use original source]');
 const opt=$('options');opt.replaceChildren();
 const paperLetters=/group-iv-(?:2012|2013|2014|2016|2018|2019)/.test(active.id)?letters.slice(0,4):letters;
 for(const l of paperLetters){
  const val=q.options[l],readable=!!clean(val);
  const pageLinked=/^(?:2012|2013|2016|2018)-original-page-linked$/.test(q.sourceStatus);
  // Allow exam-style selection even if one printed alternative was lost in
  // extraction. The button says so: it never invents its missing wording.
  const b=textNode('button','option'+(readable?'':' missing-option'),'');
  b.type='button';if(/^tnpsc-group-iv-(?:2012|2013|2014|2016|2018|2019)-/.test(active.id)&&!readable&&!pageLinked)b.disabled=true;b.setAttribute('aria-pressed',String(responses[q.number]===l));
  b.append(textNode('b','',l),textNode('span','',
   readable?val:pageLinked?'Choose printed option '+l+' (see original PDF)':'[Printed option text not recovered — check official PDF]'));
  b.addEventListener('click',()=>choice(q,l));
  opt.append(b);
 }
 const missing=letters.slice(0,4).filter(l=>!clean(q.options[l]));
 const details=q.issues?.slice(0,2).join(' ')||'';
 $('questionCaution').textContent=active.pageOnly?
  'This is raw extracted PDF-page text, not a detected or numbered MCQ. No options or answers were invented.':
  /^(?:2012|2013|2016|2018)-original-page-linked$/.test(q.sourceStatus)?
  'Original PDF page located; text not transcribed. Read printed alternatives in the source and select a letter below. No scoring. '+details:
  !q.textRecovered?
  'Original question number '+q.number+' is indexed but its wording was not reliably recovered. Consult the original booklet; no text or options have been fabricated.':
  /^(?:2012|2013|2014|2016|2018|2019)-secondary-index-editorial-study$/.test(q.sourceStatus)?
  'Secondary indexed paper text used; original scan and option order await verification. Editorial study adaptation; no scoring. '+details:
  /^(?:2012|2013|2014|2016|2018|2019)-government-scan-editorial-study$/.test(q.sourceStatus)?
  'Government-hosted original scan inspected; study adaptation, not certified verbatim. No scoring. '+details:
  /^(?:2013|2014)-mirror-scan-editorial-study$/.test(q.sourceStatus)?
  'Third-party mirror of original exam booklet inspected; editorial study adaptation, not certified verbatim. No scoring. '+details:
  q.sourceStatus==='visual-source-editorial-study-not-verbatim'?
  'Official PDF page visually inspected; this is an EDITORIAL '+(active.id==='tnpsc-group-ii-iia-2024-general-tamil-ccse2t-reviewed'?'TAMIL':'ENGLISH')+' STUDY ADAPTATION, not certified verbatim original wording. Scoring remains disabled. '+details:
  q.sourceStatus==='text-source-editorial-study-not-verbatim'?
  'Stored official-paper text extraction reviewed; scan review pending. EDITORIAL ENGLISH STUDY ADAPTATION. Option wording and order provisional; no verified key or scoring. '+details:
  q.complete&&missing.length===0?
  'Machine-separated question and A–D alternatives. Text is unverified and ungraded. '+details:
  'Partial question from scanned PDF. Missing labelled options: '+(missing.length?missing.join(', '):'uncertain split')+'. Source inspection is needed; no answers are inferred. '+details;
 const page=active.pages.find(p=>p.pdfPage===q.sourcePdfPage);
 $('sourcePage').textContent=(page?.text||q.rawBlock||'No source text extracted for this question')+
   (page?.ocrAlternateText?'\n\n--- UNVERIFIED ALTERNATE OCR OF SAME SOURCE PAGE ---\n'+page.ocrAlternateText:'');
 const total=active.questions.length;
 const answered=active.questions.filter(x=>!!responses[x.number]).length;
 $('meter').style.width=(100*answered/total).toFixed(1)+'%';
 $('answerProgress').textContent=active.pageOnly?total+' source pages available · no question scoring':answered+' of '+total+' detected questions answered · ungraded';
 $('prev').disabled=shown.indexOf(current)<=0;
 $('next').disabled=shown.indexOf(current)>=shown.length-1;
 const nav=$('palette');nav.replaceChildren();const frag=document.createDocumentFragment();
 for(const i of shown){
  const item=active.questions[i],b=textNode('button',(item.complete?'':'incomplete')+
    (responses[item.number]?' answered':'')+(i===current?' active':''),String(item.number));
  b.type='button';b.title=(active.pageOnly?'PDF page ':'Question ')+item.number+(item.complete?'':' · source incomplete');
  b.addEventListener('click',()=>{current=i;render()});frag.append(b);
 }
 nav.append(frag);
}
function move(steps){
 const pos=shown.indexOf(current),newPos=Math.min(shown.length-1,Math.max(0,pos+steps));
 if(newPos>=0&&shown[newPos]!==undefined){current=shown[newPos];render()}
}
function exportQuestionDraft(){
 if(!active)return;
 const payload={schemaVersion:1,kind:'clearexams-numbered-machine-text-questions',
  paperId:active.id,exam:active.name,year:active.year,officialPaperUrl:active.source,
  verifiedOriginalText:false,officialFinalKeyMapped:false,grading:'disabled',
  questionCount:active.questions.length,
  questionTextRecovered:active.questions.filter(q=>q.textRecovered).length,
  questions:active.questions.map(q=>({
   number:q.number,question:q.text,options:q.options,sourcePdfPage:q.sourcePdfPage,
   fourOptionsDetected:q.complete,textStatus:q.sourceStatus,
   sourceReviewRequired:true,scoreEligible:false,correctAnswer:null,issues:q.issues||[]
  }))};
 const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='clearexams-ungraded-numbered-'+active.id.replace(/[^a-z0-9-]/gi,'-')+'.json';
 document.body.append(link);link.click();link.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function exportSession(){
 if(!active)return;
 const payload={schemaVersion:1,kind:'clearexams-local-bulk-pyq-responses',
  paperId:active.id,year:active.year,sourcePdf:active.source,
  score:null,grading:'disabled',questionCandidates:active.questions.length,
  answers:Object.keys(responses).sort((a,b)=>Number(a)-Number(b)).map(n=>({number:Number(n),selected:responses[n]}))};
 const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json'});
 const u=URL.createObjectURL(blob),a=document.createElement('a');a.href=u;
 a.download='pyq-ungraded-responses-'+active.id.replace(/[^a-z0-9-]/gi,'-')+'.json';
 document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);
}

function populateSelect(preferred=''){
 const sel=$('paper');sel.replaceChildren();
 if(!bank.size){const opt=document.createElement('option');opt.value='';opt.textContent='No papers loaded';sel.append(opt);return}
 for(const p of bank.values()){
  const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.name;sel.append(opt);
 }
 if(preferred&&bank.has(preferred))sel.value=preferred;
}
function buildPublishedCards(entries){
 const box=$('publishedPapers');box.replaceChildren();
 if(!entries.length){box.append(textNode('p','muted','No preloaded text papers are available. You can import a JSON file.'));return}
 for(const entry of entries){
  const row=textNode('article','published-card','');
  row.append(textNode('strong','',entry.exam+' · '+entry.year+(/^tnpsc-group-iv-(?:2012|2013|2014|2016|2018|2019)-/.test(entry.id)?' · '+entry.paperName.replace('.pdf','').replace('_',' '):'')));
  const source=bank.get(entry.id);
  const recovered=source?.questions?.filter(q=>q.textRecovered).length||0;
  const complete=source?.questions?.filter(q=>q.complete).length||0;
  row.append(textNode('span','muted',
    recovered+' / '+(source?.questions?.length||100)+' question stems recovered · '+
    complete+' provisional A–D text sets · '+(source?.visualStudyRecoveries||0)+' visually reviewed editorial retypes · '+(source?.textStudyRecoveries||0)+' stored-text-only retypes (scan review pending) · '+entry.textPages+' PDF text pages · ungraded'));
  const a=textNode('a','published-link','Read typewritten page text');
  a.href='pyq-bulk-reader.html?paper='+encodeURIComponent(entry.id);
  a.addEventListener('click',event=>{
   if(!bank.has(entry.id))return;
   event.preventDefault();$('paper').value=entry.id;setPaper(entry.id);
   history.replaceState(null,'','?paper='+encodeURIComponent(entry.id));
  });
  row.append(a);box.append(row);
 }
}
async function loadSiteDrafts(){
 try{
  const response=await fetch('data/quizzes/pyq-reader-drafts/index.json',{cache:'no-store'});
  if(!response.ok)throw Error('Published source-text drafts not uploaded yet');
  const index=await response.json();
  if(index?.schemaVersion!==1||index.draftOnly!==true||index.gradingEnabled!==false||!Array.isArray(index.entries))
   throw Error('Published source index has incorrect provenance');
  // Load only repository-controlled, date-stamped study-review files.
  // Missing/rejected review overlays never block the original PDF text reader.
  const studyReviewPaths=[
   'visual-study-recovery-2026-11-23.json',
   'visual-study-recovery-2026-11-24.json',
   'visual-study-recovery-2026-11-24-general-english.json',
   'visual-study-recovery-2026-11-24-gs-101-122.json',
   'visual-study-recovery-2026-11-24-gs-123-137.json',
   'visual-study-recovery-2026-11-24-gs-142-160.json',
   'visual-study-recovery-2026-11-24-gs-161-180.json',
   'visual-study-recovery-2026-11-24-gs-final.json',
   'text-study-recovery-2026-11-24-ge-a.json',
   'text-study-recovery-2026-11-24-ge-b.json',
   'text-study-recovery-2026-11-25-g4-a.json',
   'text-study-recovery-2026-11-25-g4-b.json',
   'text-study-recovery-2026-11-25-ge-a.json',
   'text-study-recovery-2026-11-25-ge-b.json',
   'text-study-recovery-2026-11-25-ge-final.json',
   'visual-study-recovery-2026-11-25-g4-math.json'
  ];
  const studyReviews=[];
  for(const name of studyReviewPaths){
   try{
    const visual=await fetch('data/quizzes/pyq-reader-drafts/'+name,{cache:'no-store'});
    if(visual.ok)studyReviews.push(await visual.json());
   }catch{ /* Optional study review unavailable; original page source is retained */ }
  }
  const supplemental=[];
  const supplementalFolders=new Map();
  for(const year of [2019,2018,2016,2014,2013,2012]){
  try{
   const response=await fetch('data/quizzes/pyq-reader-drafts/'+year+'/index.json',{cache:'no-store'});
   if(response.ok){const d=await response.json();if(d.schemaVersion===1&&d.draftOnly===true&&d.gradingEnabled===false&&Array.isArray(d.entries))for(const e of d.entries){if(e&&e.year===year&&['tamil','studies'].some(s=>e.id==='tnpsc-group-iv-'+year+'-general-'+s+'-reviewed')){supplemental.push(e);supplementalFolders.set(e,year+'/');}}}
  }catch{ /* Optional year sections do not block existing papers */ }
  }
  supplemental.push({"id":"tnpsc-group-ii-iia-2024-general-studies-ccse2t-reviewed","exam":"TNPSC Group II / IIA · General Studies","year":2024,"category":"TNPSC","paperName":"CCSE2T/2024 General Studies","file":"tnpsc-group-ii-iia-2024-general-studies-ccse2t-reviewed.json","textPages":62,"totalPdfPages":96,"status":"official-scan-editorial-study-not-verbatim","ungraded":true});
  supplemental.push({"id":"tnpsc-group-ii-iia-2024-general-tamil-ccse2t-reviewed","exam":"TNPSC Group II / IIA · General Tamil","year":2024,"category":"TNPSC","paperName":"CCSE2T/2024 General Tamil","file":"tnpsc-group-ii-iia-2024-general-tamil-ccse2t-reviewed.json","textPages":27,"totalPdfPages":96,"status":"official-scan-editorial-tamil-study-not-verbatim","ungraded":true});
  supplemental.push({"id":"tnpsc-group-ii-iia-2024-general-english-ccse2e-reviewed","exam":"TNPSC Group II / IIA · General English","year":2024,"category":"TNPSC","paperName":"CCSE2E/2024 General English","file":"tnpsc-group-ii-iia-2024-general-english-ccse2e-reviewed.json","textPages":14,"totalPdfPages":96,"status":"official-scan-editorial-study-not-verbatim","ungraded":true});
  const valid=index.entries.concat(supplemental).filter(e=>e&&typeof e.id==='string'&&/^[a-z0-9-]{6,120}$/.test(e.id)&&
    typeof e.file==='string'&&e.file===e.id+'.json'&&Number.isInteger(e.textPages)&&e.textPages>0).slice(0,30);
  const files=await Promise.allSettled(valid.map(async entry=>{
   const folder=supplementalFolders.get(entry)||'';
   const r=await fetch('data/quizzes/pyq-reader-drafts/'+folder+entry.file,{cache:'no-store'});
   if(!r.ok)throw Error('Missing text source '+entry.file);
   const raw=await r.json();
   if(raw.id!==entry.id||raw.draftOnly!==true||raw.grading!=='disabled'||raw.officialFinalKeyMapped!==false)
    throw Error('Unverified source metadata mismatch');
   let recovered=raw;
   try{
    const extra=await fetch('data/quizzes/pyq-reader-drafts/ocr-recovery/'+entry.file,{cache:'no-store'});
    if(extra.ok){const overlay=await extra.json();recovered=window.ClearExamsPYQOcrOverlay?.merge(raw,overlay)||raw}
   }catch{ /* Missing or unreadable OCR is never grounds to suppress the original paper */ }
   const paper=normalize(recovered);
   for(const review of studyReviews)window.ClearExamsPYQVisualRecovery?.apply(paper,review);
   return {entry,paper};
  }));
  const loaded=[];
  for(const file of files){
   if(file.status!=='fulfilled')continue;
   bank.set(file.value.paper.id,file.value.paper);
   published.set(file.value.paper.id,file.value.entry);
   loaded.push(file.value.entry);
  }
  buildPublishedCards(loaded);
  const requested=new URLSearchParams(location.search).get('paper')||'';
  const keep=bank.has(requested)?requested:bank.keys().next().value;
  populateSelect(keep);
  if(keep)setPaper(keep);
  say(loaded.length+' ungraded typewritten paper drafts loaded directly from ClearExams. No file upload is required.');
 }catch(error){
  buildPublishedCards([]);
  say('Published paper text is not available yet. Use the JSON file importer or an existing playable PYQ quiz. '+error.message,true);
 }
}

$('files').addEventListener('change',async e=>{
 let loaded=0,failed=0;
 for(const file of [...e.target.files].slice(0,80)){
  if(file.size>MAX_FILE||!/\.json$/i.test(file.name)){failed++;continue}
  try{const d=normalize(JSON.parse(await file.text()));bank.set(d.id,d);loaded++}
  catch{failed++}
 }
 const currentId=active?.id;
 populateSelect(currentId||bank.keys().next().value);
 if(bank.size){setPaper($('paper').value||bank.keys().next().value)}
 say(loaded+' paper text drafts imported locally. '+failed+' files rejected. No questions were uploaded or graded.',failed>0);
 e.target.value='';
});
$('paper').addEventListener('change',e=>setPaper(e.target.value));
$('filter').addEventListener('change',filterQuestions);
$('search').addEventListener('input',filterQuestions);
$('go').addEventListener('click',()=>{
 const n=Number($('jump').value),i=active?.questions.findIndex(q=>q.number===n);
 if(Number.isInteger(n)&&i>=0){current=i;$('filter').value='all';$('search').value='';filterQuestions()}
 else say('That question number was not detected. Missing numbers are not invented.',true);
});
$('prev').addEventListener('click',()=>move(-1));
$('next').addEventListener('click',()=>move(1));
$('skip').addEventListener('click',()=>{
 if(!active)return;
 const i=active.questions.findIndex((q,index)=>index>current&&!q.complete);
 if(i>=0){$('filter').value='all';$('search').value='';current=i;filterQuestions()}
 else say('No later source-incomplete detected question. You can inspect the unparsed PDF pages.',false);
});
$('exportQuestions').addEventListener('click',exportQuestionDraft);
$('save').addEventListener('click',exportSession);
$('clear').addEventListener('click',()=>{
 if(!active||!confirm('Clear locally saved responses for this paper?'))return;
 responses={};saveLocal();filterQuestions();
});
loadSiteDrafts();
})();
