/* TNPSC 2026 editorial key-mapping desk.
   Local reviewer attestations are NOT official key certification or quiz scoring.
   No remote writes and no answer-key guesses. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const STORAGE='clearexams:editorial:tnpsc:g1:2026:specimen-mapping:v1';
const BANK_ID='tnpsc-group-i-2026-prelims-gs-aptitude-user-text';
const OFFICIAL='https://tnpsc.gov.in/Tentative/Document/05_2026_CCSEI-GS.pdf';
const FIELDS=['specimenNumber','pdfPage','officialTick','typedChoice','printedChoice','stemChecked','choicesChecked','tickChecked','figureChecked','reviewNotes','sourceSignature'];
const CHECKS=['stemChecked','choicesChecked','tickChecked','figureChecked'];
const LETTERS=['A','B','C','D','ALL'];
// Exact source-text binding, not a security checksum or proof of TNPSC authenticity.
// Any change to the study question, option letters/text or source flag requires manual re-review.
const sourceSignature=q=>JSON.stringify([q.id,q.question,q.options.A,q.options.B,q.options.C,q.options.D,q.options.E,q.sourceStatus]);
const sourceMatches=(r,number)=>Boolean(r&&questions[number-1]&&r.sourceSignature===sourceSignature(questions[number-1]));
let questions=[],records={},current=1,dirty=false,localPdfObjectUrl=null;
const PDF_MAX_BYTES=80*1024*1024;
const PDF_HEADER='%PDF-';
function validPage(n){return Number.isInteger(n)&&n>=1&&n<=300}
function selectedPage(){
 const page=Number($('pdfPage').value);
 return validPage(page)?page:1;
}
function updatePdfPageLink(){
 const page=selectedPage();
 $('specimenJump').textContent='Show PDF page '+page;
 if(localPdfObjectUrl)$('specimenOpen').href=localPdfObjectUrl+'#page='+page;
}
function closeLocalPDF(announce=true){
 $('specimenFrame').src='about:blank';
 $('specimenViewer').hidden=true;
 $('specimenOpen').hidden=true;
 $('specimenOpen').removeAttribute('href');
 $('specimenJump').disabled=true;
 $('specimenClose').disabled=true;
 if(localPdfObjectUrl){URL.revokeObjectURL(localPdfObjectUrl);localPdfObjectUrl=null}
 $('specimenFile').value='';
 if(announce)$('specimenStatus').textContent='Local PDF closed and preview URL released; saved review notes were not changed.';
}
async function loadLocalPDF(file){
 closeLocalPDF(false);
 if(!file){$('specimenStatus').textContent='No local specimen PDF selected.';return}
 if(file.size<100||file.size>PDF_MAX_BYTES){
  $('specimenStatus').textContent='Rejected PDF size: select a 100-byte to 80-MB downloaded specimen file.';
  return;
 }
 let header;
 try{
  const bytes=new Uint8Array(await file.slice(0,5).arrayBuffer());
  header=Array.from(bytes,x=>String.fromCharCode(x)).join('');
 }catch{
  $('specimenStatus').textContent='Unable to read this local file; no PDF loaded.';
  return;
 }
 if(header!==PDF_HEADER){
  $('specimenStatus').textContent='Rejected: this file does not start with the PDF signature %PDF-.';
  return;
 }
 try{
  localPdfObjectUrl=URL.createObjectURL(file);
 }catch{
  $('specimenStatus').textContent='The browser could not open this PDF locally.';
  return;
 }
 $('specimenOpen').hidden=false;
 $('specimenJump').disabled=false;
 $('specimenClose').disabled=false;
 $('specimenStatus').textContent='Local PDF selected ('+(file.size/1024/1024).toFixed(1)+' MB). Only the file signature was checked; its TNPSC authenticity is NOT verified. No upload took place.';
 updatePdfPageLink();
}
function showLocalPDFPage(){
 if(!localPdfObjectUrl)return;
 const page=selectedPage();
 $('specimenFrame').src=localPdfObjectUrl+'#page='+page;
 $('specimenViewer').hidden=false;
 updatePdfPageLink();
 $('specimenStatus').textContent='Displaying PDF page '+page+' from this device. Check TNPSC source identity, printed question number and tick manually. Embedded PDF support varies by browser.';
}
const int=n=>Number.isInteger(n)&&n>=1;
const empty=()=>({specimenNumber:null,pdfPage:null,officialTick:'',typedChoice:'',
 printedChoice:'',stemChecked:false,choicesChecked:false,tickChecked:false,
 figureChecked:false,reviewNotes:'',sourceSignature:''});
const validRow=r=>r&&typeof r==='object'&&!Array.isArray(r)&&
 (r.specimenNumber===null||(int(r.specimenNumber)&&r.specimenNumber<=200))&&
 (r.pdfPage===null||(int(r.pdfPage)&&r.pdfPage<=300))&&
 ['',...LETTERS].includes(r.officialTick)&&['',...LETTERS].includes(r.typedChoice)&&
 typeof r.printedChoice==='string'&&r.printedChoice.length<=2000&&
 typeof r.reviewNotes==='string'&&r.reviewNotes.length<=2500&&
 typeof r.sourceSignature==='string'&&r.sourceSignature.length<=50000&&
 CHECKS.every(k=>typeof r[k]==='boolean');
function normalize(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Missing review records');
 const next={};
 for(const [number,row] of Object.entries(obj)){
  const normalized={...empty(),...row};
  if(!/^(?:[1-9]|[1-9][0-9]|1[0-9][0-9]|200)$/.test(number)||!validRow(normalized))
   throw Error('Invalid review at transcription position '+number);
  next[number]=normalized;
 }
 return next;
}
function restore(){
 try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');
  return [1,2].includes(x?.schemaVersion)&&x?.bankId===BANK_ID?normalize(x.records):{};
 }catch{return {};}
}
function saveLocal(){
 try{localStorage.setItem(STORAGE,JSON.stringify({schemaVersion:2,bankId:BANK_ID,records}))}
 catch{throw Error('Local storage is unavailable; export your review JSON before closing this page')}
}
function readForm(){
 const n=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
 return {specimenNumber:n('specimenNumber'),pdfPage:n('pdfPage'),
  officialTick:$('officialTick').value,typedChoice:$('typedChoice').value,
  printedChoice:$('printedChoice').value.slice(0,2000),reviewNotes:$('reviewNotes').value.slice(0,2500),
  stemChecked:$('stemChecked').checked,choicesChecked:$('choicesChecked').checked,
  tickChecked:$('tickChecked').checked,figureChecked:$('figureChecked').checked,
  sourceSignature:sourceSignature(questions[current-1])};
}
function setForm(row){
 $('specimenNumber').value=row.specimenNumber??'';
 $('pdfPage').value=row.pdfPage??'';
 for(const k of ['officialTick','typedChoice','printedChoice','reviewNotes'])$(k).value=row[k];
 // Preserve old notes, but never carry source attestation checkboxes forward
 // from an older question text or legacy pre-binding review record.
 const matches=sourceMatches(row,current);
 for(const k of CHECKS)$(k).checked=matches&&row[k];
 updatePdfPageLink();
}
function hasData(r){return Boolean(r.specimenNumber||r.pdfPage||r.officialTick||r.typedChoice||
 r.printedChoice.trim()||r.reviewNotes.trim()||CHECKS.some(k=>r[k]));}
function duplicateSpecimen(r,number){
 return r.specimenNumber!==null&&Object.entries(records).some(([n,x])=>Number(n)!==number&&
  x.specimenNumber===r.specimenNumber);
}
function localCheck(r,number){
 return validRow(r)&&sourceMatches(r,number)&&int(r.specimenNumber)&&r.specimenNumber<=200&&
  int(r.pdfPage)&&r.pdfPage<=300&&
  r.printedChoice.trim().length>=2&&
  r.stemChecked&&r.choicesChecked&&r.tickChecked&&
  (number!==98&&number!==200||r.figureChecked)&&
  (!duplicateSpecimen(r,number))&&
  (r.officialTick==='ALL'&&r.typedChoice==='ALL'||
   ['A','B','C','D'].includes(r.officialTick)&&['A','B','C','D'].includes(r.typedChoice));
}
function stateLabel(r,number){
 if(!r||!hasData(r))return 'Not reviewed';
 if(!validRow(r))return 'Invalid or out-of-range field: check the printed number, page and text';
 if(!sourceMatches(r,number))return 'Source version changed / legacy review · recheck every option and original page before marking verified';
 if(duplicateSpecimen(r,number))return 'Draft only · specimen question number is already assigned to another slot';
 return localCheck(r,number)?
  'Locally checked · exported for separate source audit only; student scores remain disabled':
  'Incomplete draft · add source page, unique specimen number, option text and all required checks';
}
function stats(){
 let checked=0,drafts=0;
 for(let i=1;i<=200;i++){
  const r=records[i];if(!r||!hasData(r))continue;
  if(localCheck(r,i))checked++;else drafts++;
 }
 $('reviewedCount').textContent=String(checked);
 $('draftCount').textContent=String(drafts);
 $('pendingCount').textContent=String(200-checked-drafts);
}
function view(){
 const q=questions[current-1];if(!q)return;
 $('slot').value=String(current);
 $('prev').disabled=current===1;$('next').disabled=current===200;
 $('qNumber').textContent='Transcription slot Q'+current;
 $('question').textContent=q.question;
 const choices=$('choices');choices.replaceChildren();
 for(const code of ['A','B','C','D','E']){
  const p=document.createElement('p');p.className='choice';
  const b=document.createElement('b');b.textContent=code;
  const t=document.createElement('span');t.textContent=q.options[code];
  p.append(b,t);choices.append(p);
 }
 $('sourceContext').textContent=q.sourceStatus==='needs_source_review'?
  'Official figure still requires TNPSC specimen comparison: '+q.sourceIssue:
  q.sourceStatus==='secondary_source_text_cross_checked'?
  'Editorial study text repaired from unofficial guide Q'+q.sourceComparison.guideQuestionNumber+
  ' (page '+q.sourceComparison.pdfPage+'); original TNPSC wording not certified.':
  'User-supplied transcription; original TNPSC question wording still requires comparison.';
 const preview=q.visual?.secondaryIllustrationCrossCheck;
 $('editorialFigurePreview').hidden=!preview;
 $('editorialFigureImage').src=preview?q.visual.src:'';
 $('editorialFigureImage').alt=preview?q.visual.alt:'';
 if(preview){
  $('editorialFigureOriginal').href=q.visual.sourceUrl;
  $('editorialFigureSecond').href=preview.comparisonPdf+'#page='+preview.thirdPartyPrintedPdfPages[0];
  $('editorialFigureSecond').textContent='View second independent illustrated booklet (PDF pages '+preview.thirdPartyPrintedPdfPages.join('–')+')';
 }
 const saved=records[current]||empty();
 $('sourceRevisionWarning').hidden=!(hasData(saved)&&!sourceMatches(saved,current));
 setForm(saved);
 dirty=false;status();
}
function status(){
 const r=readForm(),valid=validRow(r);
 $('recordStatus').textContent=(dirty?'Unsaved · ':'')+(valid?stateLabel(r,current):
   'Invalid draft: printed number and PDF page must be whole numbers in range');
 stats();
}
function navigate(to){
 if(to<1||to>200)return;
 if(dirty&&!window.confirm('Leave this question without saving changes?'))return;
 current=to;view();
}
function record(){
 const next=readForm();
 if(!validRow(next)){$('recordStatus').textContent='Cannot save: invalid printed number, page or field';return;}
 if(hasData(next))records[current]=next;else delete records[current];
 try{saveLocal()}catch(e){$('recordStatus').textContent=e.message;return}
 dirty=false;$('sourceRevisionWarning').hidden=true;status();$('transferStatus').textContent='Saved local review for Q'+current;
}
function resetOne(){
 if(!records[current])return;
 if(!window.confirm('Clear the local review for transcription Q'+current+'?'))return;
 delete records[current];try{saveLocal()}catch(e){$('transferStatus').textContent=e.message}
 view();$('transferStatus').textContent='Cleared Q'+current+' (your other reviews remain)';
}
function snapshot(){
 const rows=questions.map(q=>{
  const r=records[q.number]||empty();
  return {transcriptionNumber:q.number,editorialReviewStatus:localCheck(r,q.number)?
    'local_source_attestation_pending_editorial_publication':hasData(r)?'draft':'not_reviewed',
   sourceStatus:q.sourceStatus,questionSignature:sourceSignature(q),...r};
 });
 return {schemaVersion:2,sourceBinding:'exact-question-and-A-to-E-text-v1',bankId:BANK_ID,exam:'TNPSC Group I Services Prelims 2026',
  officialTentativeSource:OFFICIAL,disclaimer:'Reviewer-only local comparison. Not an official answer key. No student scoring is authorized.',
  exportedAt:new Date().toISOString(),rows};
}
function download(){
 const blob=new Blob([JSON.stringify(snapshot(),null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='tnpsc-group1-2026-local-source-key-audit.json';
 a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('transferStatus').textContent='Review snapshot exported. It cannot update the public answer key automatically.';
}
async function importFile(file){
 if(!file||file.size>1250000)throw Error('Use a review JSON file smaller than 1.25 MB');
 const x=JSON.parse(await file.text());
 if(![1,2].includes(x.schemaVersion)||x.bankId!==BANK_ID||x.officialTentativeSource!==OFFICIAL||
    !Array.isArray(x.rows)||x.rows.length!==200)throw Error('Wrong or incomplete 2026 Group I review file');
 if(x.schemaVersion===2&&x.sourceBinding!=='exact-question-and-A-to-E-text-v1')
  throw Error('Unknown source binding version; imported reviews cannot be trusted');
 const fresh={};let older=0;
 x.rows.forEach((row,i)=>{
  if(row.transcriptionNumber!==i+1||row.sourceStatus!==questions[i].sourceStatus)
   throw Error('Mismatched question order/source status at slot '+(i+1));
  const raw={};for(const k of FIELDS)raw[k]=row[k];
  raw.sourceSignature=typeof raw.sourceSignature==='string'?raw.sourceSignature:'';
  if(!validRow(raw))throw Error('Invalid review row '+(i+1));
  const currentSig=sourceSignature(questions[i]);
  if(x.schemaVersion===1||row.questionSignature!==currentSig||raw.sourceSignature!==currentSig){
   // Keep the reviewer notes and printed choice as drafts, but strip prior
   // checkmarks if the source text has changed or an old export lacks binding.
   if(hasData(raw))older++;
   for(const k of CHECKS)raw[k]=false;
   raw.sourceSignature='';
  }
  if(hasData(raw))fresh[i+1]=raw;
 });
 if(!window.confirm('Replace all browser-local reviews with this imported 200-position snapshot?'))return;
 records=normalize(fresh);saveLocal();view();
 $('transferStatus').textContent='Imported '+Object.keys(records).length+
  ' locally saved reviews; '+older+' legacy or source-changed records require fresh manual checks. No scores were published.';
}
$('specimenFile').addEventListener('change',e=>{
 const file=e.target.files?.[0];
 loadLocalPDF(file);
});
$('specimenJump').addEventListener('click',showLocalPDFPage);
$('specimenClose').addEventListener('click',()=>closeLocalPDF());
$('pdfPage').addEventListener('input',updatePdfPageLink);
FIELDS.filter(id=>id!=='sourceSignature').forEach(id=>$(id).addEventListener(id.endsWith('Checked')?'change':'input',()=>{
 if(!questions.length)return;dirty=true;status();
}));
$('officialTick').addEventListener('change',()=>{dirty=true;status()});
$('typedChoice').addEventListener('change',()=>{dirty=true;status()});
$('slot').addEventListener('change',()=>navigate(Number($('slot').value)));
$('prev').addEventListener('click',()=>navigate(current-1));
$('next').addEventListener('click',()=>navigate(current+1));
$('save').addEventListener('click',record);
$('clear').addEventListener('click',resetOne);
$('export').addEventListener('click',download);
$('importJson').addEventListener('change',async e=>{
 try{await importFile(e.target.files?.[0])}
 catch(err){$('transferStatus').textContent='Import rejected: '+err.message}
 e.target.value='';
});
$('erase').addEventListener('click',()=>{
 if(!window.confirm('Permanently delete all 200 local editorial review drafts on this device?'))return;
 records={};try{localStorage.removeItem(STORAGE)}catch{}
 view();$('transferStatus').textContent='Local review cleared; published quiz and answer key unchanged.';
});
fetch('data/quizzes/tnpsc-group-i-2026-prelims-text.json',{cache:'no-store'})
 .then(r=>{if(!r.ok)throw Error('Question bank HTTP '+r.status);return r.json()})
 .then(data=>{
  if(data.id!==BANK_ID||data.questions?.length!==200||data.keyedAnswerCount!==0||
     data.questions.some((q,i)=>q.number!==i+1||q.answer!==null))
    throw Error('Unexpected source-question version; do not run key mappings');
  questions=data.questions;records=restore();
  $('slot').replaceChildren();
  for(const q of questions){
   const opt=document.createElement('option');opt.value=String(q.number);
   opt.textContent='Q'+q.number+' · '+q.question.replace(/\s+/g,' ').slice(0,60);
   $('slot').append(opt);
  }
  for(const id of ['save','clear','export','importJson','erase'])$(id).disabled=false;
  const query=new URLSearchParams(location.search);
  const num=Number(query.get('q'));
  if(Number.isInteger(num)&&num>=1&&num<=200)current=num;
  $('loadStatus').textContent='200 study-text positions loaded; official key mappings remain reviewer-only drafts.';
  view();
 }).catch(e=>{$('loadStatus').textContent='Unable to load review: '+e.message});
})();
