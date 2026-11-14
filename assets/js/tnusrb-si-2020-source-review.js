/* TNUSRB SI 2020 Series C: reviewer-only local source comparison.
   No automatic PDF authentication, no answer-key publication or student score changes. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const NUMBERS=[47,84,95,103];
const STORAGE='clearexams:editorial:tnusrb:si:2020:series-c:visual-review:v1';
const BANK='tnusrb-si-2020-series-c';
const ORIGINAL='https://www.tnusrb.tn.gov.in/pdfs/SI_2019_WT_QUESTION.pdf';
const KEY='https://img.freejobalert.com/uploads/2020/03/Final-Answer-Key-TNUSRB-Sub-Inspector-of-Police-Posts.pdf';
const CHECKS=['seriesChecked','stemChecked','optionsChecked','figureChecked','keyChecked'];
const FIELDS=['pdfPage','printedNumber','sourceKind','sourceNote','pdfSHA256',...CHECKS,'signature'];
const empty=()=>({pdfPage:null,printedNumber:null,sourceKind:'',sourceNote:'',
  seriesChecked:false,stemChecked:false,optionsChecked:false,figureChecked:false,keyChecked:false,signature:'',pdfSHA256:''});
const signature=q=>JSON.stringify([q.number,q.question,...['A','B','C','D'].map(k=>q.options[k]),
  q.scoringStatus,q.sourceIssue,q.answerKeyToken,q.figureAsset||'']);
const inRange=(n,max)=>Number.isInteger(n)&&n>=1&&n<=max;
const sourceKinds=['','board_booklet','secondary_scan','series_d_only'];
let bank=null,questions=[],records={},current=0,dirty=false,pdfURL=null,activePDFSHA256='';
function validRow(r){
 return !!r&&typeof r==='object'&&!Array.isArray(r)&&
 (r.pdfPage===null||inRange(r.pdfPage,300))&&
 (r.printedNumber===null||inRange(r.printedNumber,140))&&
 sourceKinds.includes(r.sourceKind)&&
 typeof r.sourceNote==='string'&&r.sourceNote.length<=2200&&
 typeof r.signature==='string'&&r.signature.length<=10000&&
 typeof r.pdfSHA256==='string'&&/^(?:|[a-f0-9]{64})$/.test(r.pdfSHA256)&&
 CHECKS.every(k=>typeof r[k]==='boolean');
}
function hasData(r){return !!r&&Boolean(r.pdfPage||r.printedNumber||r.sourceKind||r.sourceNote.trim()||CHECKS.some(k=>r[k]));}
function matches(r,q){return !!r&&!!q&&r.signature===signature(q)}
function checked(r,q){return validRow(r)&&matches(r,q)&&r.sourceKind==='board_booklet'&&
 activePDFSHA256.length===64&&r.pdfSHA256===activePDFSHA256&&
 r.pdfPage!==null&&r.printedNumber===q.number&&r.sourceNote.trim().length>=10&&CHECKS.every(k=>r[k]);}
function normalize(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Review rows missing');
 const next={};
 for(const [k,row] of Object.entries(obj)){
  const number=Number(k);
  if(!NUMBERS.includes(number)||String(number)!==k)throw Error('Invalid review record '+k);
  const normalized={...empty(),...row};
  // Legacy browser checkboxes were not bound to any file. Preserve notes but invalidate old attestations.
  if(!normalized.pdfSHA256){normalized.signature='';CHECKS.forEach(c=>{normalized[c]=false})}
  if(!validRow(normalized))throw Error('Invalid review record '+k);
  if(hasData(normalized))next[k]=normalized;
 }
 return next;
}
function restore(){
 try{const obj=JSON.parse(localStorage.getItem(STORAGE)||'null');
  return obj&&obj.schemaVersion===1&&obj.bankId===BANK?normalize(obj.records):{};
 }catch{return {}}
}
function persist(){localStorage.setItem(STORAGE,JSON.stringify({schemaVersion:1,bankId:BANK,records}));}
function form(){
 const intField=id=>{const raw=$(id).value.trim();return raw===''?null:Number(raw)};
 const r={pdfPage:intField('pdfPage'),printedNumber:intField('printedNumber'),
  sourceKind:$('sourceKind').value,sourceNote:$('sourceNote').value.slice(0,2200),
  pdfSHA256:activePDFSHA256||records[questions[current].number]?.pdfSHA256||'',
  signature:signature(questions[current])};
 CHECKS.forEach(k=>{r[k]=$(k).checked});return r;
}
function fill(r,q){
 $('pdfPage').value=r.pdfPage??'';$('printedNumber').value=r.printedNumber??'';
 $('sourceKind').value=r.sourceKind;$('sourceNote').value=r.sourceNote;
 const valid=matches(r,q);CHECKS.forEach(k=>{$(k).checked=valid&&r[k]});
 $('staleWarning').hidden=!(hasData(r)&&!valid);
 updatePdfJump();updatePDFBinding(r);
}
function updatePDFBinding(r){
 const hash=activePDFSHA256||r?.pdfSHA256||'';
 $('pdfFingerprint').textContent=hash||'No PDF fingerprint recorded';
 $('pdfBindingNotice').textContent=activePDFSHA256?
  (r?.pdfSHA256&&r.pdfSHA256!==activePDFSHA256?
   'A different PDF is loaded. Repeat all five question checks before saving this source.':
   'SHA-256 identifies local file bytes, NOT TNUSRB authenticity or booklet series.'):
  (r?.pdfSHA256?'Saved review is a draft until the same PDF is reloaded and its hash matches.':
   'Load the exact source PDF before any locally checked review can be counted.');
}
function stats(){
 let done=0,draft=0;
 questions.forEach(q=>{
  const r=records[q.number];if(!hasData(r))return;
  if(checked(r,q))done++;else draft++;
 });
 $('checkedCount').textContent=String(done);
 $('draftCount').textContent=String(draft);
 $('pendingCount').textContent=String(NUMBERS.length-done-draft);
}
function status(){
 const q=questions[current],r=form();
 $('reviewStatus').textContent=(dirty?'Unsaved edits · ':'')+
 (!validRow(r)?'Invalid page, question number or input field':
  checked(r,q)?'Locally checked draft · currently loaded PDF fingerprint bound; not official certification or student scoring':
  CHECKS.every(k=>r[k])&&r.pdfSHA256&&!activePDFSHA256?
   'Saved checklist draft · reopen exact PDF to re-confirm its SHA-256 fingerprint':
  CHECKS.every(k=>r[k])&&activePDFSHA256&&r.pdfSHA256!==activePDFSHA256?
   'Different PDF fingerprint · repeat every source question checkbox':
  r.sourceKind==='secondary_scan'||r.sourceKind==='series_d_only'?
   'Source comparison draft · original Series C certification pending':
  'Incomplete local draft · confirm original Series C, printed number, page, options, figure and key');
 $('clear').disabled=!records[q.number];
 updatePDFBinding(records[q.number]||r);stats();
}
function view(){
 const q=questions[current];if(!q)return;
 $('questionSelect').value=String(q.number);
 $('prev').disabled=current===0;$('next').disabled=current===questions.length-1;
 $('number').textContent=String(q.number);
 $('keyToken').textContent=q.answerKeyToken;
 $('stem').textContent=q.question;
 $('sourceIssue').textContent=q.sourceIssue||'Original source comparison is pending.';
 const mirror=q.sameNamedBookletOCRAudit;
 const scope={
  not_readable_in_public_ocr_index:'No original matrix or option layout can be read from the public OCR index',
  english_stem_and_four_option_values_corroborated_by_ocr:'Printed question number, English stem and all four option values appear in the independent OCR index',
  english_stem_and_numeric_choices_partially_corroborated_by_ocr:'Printed stem and option numerals appear, but some OCR labels are uncertain'
 };
 $('ocrEvidenceLevel').textContent=scope[mirror?.evidenceLevel]||'No independent OCR comparison recorded';
 $('ocrEvidenceDetails').textContent=mirror?.observedDetails||'Original image verification pending.';
 $('ocrEvidenceNext').textContent='Still needed: '+(mirror?.requiredNext||'Original Series C source page.');
 $('ocrEvidenceLink').href=mirror?.sourceURL||'https://www.scribd.com/document/1014181296/SI-2019-WT-QUESTION';
 const choices=$('choices');choices.replaceChildren();
 for(const letter of ['A','B','C','D']){
  const p=document.createElement('div');p.className='choice';
  const b=document.createElement('strong');b.textContent=letter+'.';
  const span=document.createElement('span');span.textContent=q.options[letter];
  p.append(b,span);choices.append(p);
 }
 $('comparison').hidden=!q.figureAsset;
 if(q.figureAsset){
  $('comparisonImage').src=q.figureAsset;
  $('comparisonImage').alt=(q.figureAlt||'Editorial study diagram')+'. Not the verified Series C original.';
  $('comparisonStatus').textContent='Editorial reference only — comparison does not confirm the original Series C drawing.';
 }else{$('comparisonImage').removeAttribute('src');$('comparisonImage').alt='';}
 $('practiceLink').href='tnusrb-si-2020-quiz.html';
 fill(records[q.number]||empty(),q);
 dirty=false;status();
}
function navigate(index){
 if(index<0||index>=questions.length)return;
 if(dirty&&!window.confirm('Leave current unsaved review edits?'))return;
 current=index;view();
}
function save(){
 const q=questions[current],r=form();
 if(!validRow(r)){$('reviewStatus').textContent='Review rejected: check page and printed question number';return}
 const prior=records[q.number];
 if(hasData(r))records[q.number]=r;else delete records[q.number];
 try{persist()}catch(e){
  if(prior)records[q.number]=prior;else delete records[q.number];
  $('transferStatus').textContent='Local storage unavailable. Export an evidence snapshot if possible.';return;
 }
 dirty=false;$('staleWarning').hidden=true;
 $('transferStatus').textContent='Q'+q.number+' saved locally; no answer key or mark was published.';
 status();
}
function clear(){
 const number=questions[current].number;
 if(!records[number]||!window.confirm('Clear local evidence draft Q'+number+'?'))return;
 const prior=records[number];delete records[number];
 try{persist()}catch{records[number]=prior;$('transferStatus').textContent='Unable to clear browser storage';return}
 view();$('transferStatus').textContent='Cleared the Q'+number+' local draft.';
}
function snapshot(){
 return {schemaVersion:1,bankId:BANK,originalBookletURL:ORIGINAL,finalKeyMirrorURL:KEY,
  disclaimer:'Browser-local reviewer assertions only. No authenticated original source, grades or student answer mappings.',
  exportedAt:new Date().toISOString(),
  rows:questions.map(q=>({number:q.number,sourceSignature:signature(q),
   scoringStatus:q.scoringStatus,reviewStatus:checked(records[q.number]||empty(),q)?
    'local_editorial_attestation_only':hasData(records[q.number])?'draft':'not_reviewed',
   ...records[q.number]||empty()}))};
}
function download(){
 const blob=new Blob([JSON.stringify(snapshot(),null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),link=document.createElement('a');
 link.href=url;link.download='tnusrb-si-2020-series-c-visual-source-review.json';link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
 $('transferStatus').textContent='Four source-bound rows exported. Nothing was sent to the site.';
}
async function importFile(file){
 if(!file||file.size>180000)throw Error('Use a local source review JSON file under 180 KB');
 const obj=JSON.parse(await file.text());
 if(obj.schemaVersion!==1||obj.bankId!==BANK||obj.originalBookletURL!==ORIGINAL||
    obj.finalKeyMirrorURL!==KEY||!Array.isArray(obj.rows)||obj.rows.length!==4)
   throw Error('This is not a complete Series C 2020 visual-source audit export');
 const next={};let stale=0;
 obj.rows.forEach((row,i)=>{
  const q=questions[i];
  if(row.number!==q.number||row.scoringStatus!==q.scoringStatus)throw Error('Wrong question slot at row '+i);
  const r={...empty()};
  for(const k of FIELDS){if(Object.prototype.hasOwnProperty.call(row,k))r[k]=row[k]}
  if(!validRow(r))throw Error('Invalid field in Q'+q.number);
  if(!r.pdfSHA256){CHECKS.forEach(k=>r[k]=false);r.signature=''}
  if(row.sourceSignature!==signature(q)||!matches(r,q)){
   if(hasData(r))stale++;
   CHECKS.forEach(k=>r[k]=false);r.signature='';
  }
  if(hasData(r))next[q.number]=r;
 });
 if(!window.confirm('Replace all browser-local visual-source drafts with these imported records?'))return;
 records=normalize(next);persist();view();
 $('transferStatus').textContent='Imported '+Object.keys(records).length+' local drafts; '+stale+
   ' source-changed records require full recheck. Public scoring unchanged.';
}
function updatePdfJump(){
 const page=Number($('pdfPage').value);
 const safePage=inRange(page,300)?page:1;
 $('pdfJump').textContent='Show selected source PDF page '+safePage;
 if(pdfURL){$('pdfExternal').href=pdfURL+'#page='+safePage}
}
function closePdf(announce=true){
 $('pdfFrame').src='about:blank';$('pdfReader').hidden=true;
 $('pdfJump').disabled=true;$('pdfClose').disabled=true;
 $('pdfExternal').hidden=true;$('pdfExternal').removeAttribute('href');
 if(pdfURL){URL.revokeObjectURL(pdfURL);pdfURL=null}
 activePDFSHA256='';
 $('pdfFile').value='';
 if(announce)$('pdfStatus').textContent='Local PDF reference released. Saved notes remain; local source review is suspended until the original PDF is reopened.';
 if(questions.length)status();
}
async function loadPdf(file){
 if(!file){closePdf(false);$('pdfStatus').textContent='No local PDF selected.';return}
 if(file.size<100||file.size>80*1024*1024){
  closePdf(false);$('pdfStatus').textContent='Rejected PDF size; use a file between 100 bytes and 80 MB.';return
 }
 // Read the original selected File before clearing the input; detached browser File handles may fail later.
 let bytes;
 try{bytes=await file.arrayBuffer()}
 catch(error){
  closePdf(false);$('pdfStatus').textContent='Could not read this local file: '+error.message;return
 }
 const header=Array.from(new Uint8Array(bytes.slice(0,5)),v=>String.fromCharCode(v)).join('');
 if(header!=='%PDF-'){
  closePdf(false);$('pdfStatus').textContent='Rejected: selected file lacks the PDF signature %PDF-.';return
 }
 let fingerprint='';
 try{
  if(!crypto?.subtle)throw Error('WebCrypto unavailable');
  const digest=await crypto.subtle.digest('SHA-256',bytes);
  fingerprint=Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
 }catch(error){
  $('transferStatus').textContent='Could not fingerprint PDF: '+error.message+'. This file cannot support a locally checked review.';
 }
 closePdf(false);
 activePDFSHA256=fingerprint;
 try{pdfURL=URL.createObjectURL(file)}catch{
  activePDFSHA256='';
  $('pdfStatus').textContent='Unable to create local preview.';return
 }
 if(questions.length){
  const saved=records[questions[current].number];
  if(saved?.pdfSHA256&&saved.pdfSHA256!==activePDFSHA256){
   CHECKS.forEach(k=>{$(k).checked=false});dirty=true;
   $('transferStatus').textContent='PDF fingerprint changed. Repeat the five source checks; notes are retained.';
  }
  status();
 }
 $('pdfJump').disabled=false;$('pdfClose').disabled=false;$('pdfExternal').hidden=false;
 $('pdfStatus').textContent='PDF opened locally ('+(file.size/1024/1024).toFixed(1)+' MB). '+
 (activePDFSHA256?'SHA-256 '+activePDFSHA256+'. ':'Fingerprint unavailable. ')+
 'A file hash cannot prove TNUSRB authenticity or booklet series. No upload occurred.';
 updatePdfJump();
}
function preview(){
 if(!pdfURL)return;
 const n=Number($('pdfPage').value);const page=inRange(n,300)?n:1;
 $('pdfFrame').src=pdfURL+'#page='+page;
 $('pdfReader').hidden=false;updatePdfJump();
 $('pdfStatus').textContent='Displaying local PDF page '+page+'. The hash identifies only file bytes. Inspect the cover, all options, and original Series C figure or matrix.';
}
$('pdfFile').addEventListener('change',e=>loadPdf(e.target.files?.[0]));
$('pdfJump').addEventListener('click',preview);
$('pdfClose').addEventListener('click',()=>closePdf());
$('pdfPage').addEventListener('input',updatePdfJump);
FIELDS.filter(k=>k!=='signature'&&k!=='pdfSHA256').forEach(k=>$(k).addEventListener(CHECKS.includes(k)||k==='sourceKind'?'change':'input',()=>{
 if(!questions.length)return;dirty=true;status();
}));
$('questionSelect').addEventListener('change',()=>navigate(questions.findIndex(q=>q.number===Number($('questionSelect').value))));
$('prev').addEventListener('click',()=>navigate(current-1));
$('next').addEventListener('click',()=>navigate(current+1));
$('save').addEventListener('click',save);
$('clear').addEventListener('click',clear);
$('export').addEventListener('click',download);
$('importFile').addEventListener('change',async e=>{
 try{await importFile(e.target.files?.[0])}catch(err){$('transferStatus').textContent='Import rejected: '+err.message}
 e.target.value='';
});
$('resetAll').addEventListener('click',()=>{
 if(!window.confirm('Delete all four browser-local Series C figure/matrix reviews?'))return;
 try{localStorage.removeItem(STORAGE)}catch{$('transferStatus').textContent='Could not clear local storage';return}
 records={};view();$('transferStatus').textContent='All local evidence drafts cleared. Public questions unchanged.';
});
window.addEventListener('pagehide',()=>{if(pdfURL)URL.revokeObjectURL(pdfURL)});
fetch('data/quizzes/tnusrb-si-2020-series-c.json',{cache:'no-store'})
.then(r=>{if(!r.ok)throw Error('Question bank HTTP '+r.status);return r.json()})
.then(data=>{
 if(data.year!==2020||data.bookletSeries!=='C'||data.playableQuestionCount!==140||
    data.scoredQuestionCount!==130||data.ungradedSourceDisputeCount!==7||
    data.originalBookletAccess?.url!==ORIGINAL||
    data.originalBookletAccess?.originalBookletVerifiedByClearExams!==false)
  throw Error('Question bank no longer matches the expected unverified Series C source manifest');
 bank=data;
 questions=NUMBERS.map(n=>data.questions.find(q=>q.number===n));
 if(!data.sourceRecoveryAudit?.sameNamedBookletOCRAudit||
    data.sourceRecoveryAudit.sameNamedBookletOCRAudit.allRemainUngraded!==true||
    data.sourceRecoveryAudit.sameNamedBookletOCRAudit.originalFigurePageImagesVerified!==false||
    questions.some(q=>!q?.sameNamedBookletOCRAudit||
      q.sameNamedBookletOCRAudit.visuallyVerifiedOriginalFigureOrMatrix!==false||
      q.sameNamedBookletOCRAudit.originalBoardHostedPDFInspected!==false))
   throw Error('Indexed booklet evidence must not imply any original visual certification');
 if(questions.some(q=>!q||q.scoringStatus!=='ungraded_source_dispute'||q.acceptedAnswers?.length!==0||
   !['A','B','C','D'].every(letter=>q.options?.[letter])))
   throw Error('Source-review question status changed; review cannot be loaded');
 records=restore();
 $('questionSelect').replaceChildren();
 questions.forEach(q=>{
  const o=document.createElement('option');o.value=String(q.number);
  o.textContent='Q'+q.number+' · '+q.question.replace(/\s+/g,' ').slice(0,60);
  $('questionSelect').append(o);
 });
 for(const id of ['questionSelect','save','clear','export','importFile','resetAll'])$(id).disabled=false;
 const initial=Number(new URLSearchParams(location.search).get('q'));
 if(NUMBERS.includes(initial))current=NUMBERS.indexOf(initial);
 $('loadStatus').textContent='Four source-disputed items loaded. Any locally checked draft remains ungraded on the public quiz.';
 view();
})
.catch(err=>{$('loadStatus').textContent='Cannot initialize editorial review: '+err.message});
})();