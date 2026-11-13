/* TNPSC 2026 editorial key-mapping desk.
   Local reviewer attestations are NOT official key certification or quiz scoring.
   No remote writes and no answer-key guesses. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const STORAGE='clearexams:editorial:tnpsc:g1:2026:specimen-mapping:v1';
const BANK_ID='tnpsc-group-i-2026-prelims-gs-aptitude-user-text';
const OFFICIAL='https://tnpsc.gov.in/Tentative/Document/05_2026_CCSEI-GS.pdf';
const FIELDS=['specimenNumber','pdfPage','officialTick','typedChoice','printedChoice','stemChecked','choicesChecked','tickChecked','figureChecked','reviewNotes'];
const CHECKS=['stemChecked','choicesChecked','tickChecked','figureChecked'];
const LETTERS=['A','B','C','D','ALL'];
let questions=[],records={},current=1,dirty=false;
const int=n=>Number.isInteger(n)&&n>=1;
const empty=()=>({specimenNumber:null,pdfPage:null,officialTick:'',typedChoice:'',
 printedChoice:'',stemChecked:false,choicesChecked:false,tickChecked:false,
 figureChecked:false,reviewNotes:''});
const validRow=r=>r&&typeof r==='object'&&!Array.isArray(r)&&
 (r.specimenNumber===null||(int(r.specimenNumber)&&r.specimenNumber<=200))&&
 (r.pdfPage===null||(int(r.pdfPage)&&r.pdfPage<=300))&&
 ['',...LETTERS].includes(r.officialTick)&&['',...LETTERS].includes(r.typedChoice)&&
 typeof r.printedChoice==='string'&&r.printedChoice.length<=2000&&
 typeof r.reviewNotes==='string'&&r.reviewNotes.length<=2500&&
 CHECKS.every(k=>typeof r[k]==='boolean');
function normalize(obj){
 if(!obj||typeof obj!=='object'||Array.isArray(obj))throw Error('Missing review records');
 const next={};
 for(const [number,row] of Object.entries(obj)){
  if(!/^(?:[1-9]|[1-9][0-9]|1[0-9][0-9]|200)$/.test(number)||!validRow(row))
   throw Error('Invalid review at transcription position '+number);
  next[number]={...empty(),...row};
 }
 return next;
}
function restore(){
 try{const x=JSON.parse(localStorage.getItem(STORAGE)||'null');
  return x?.schemaVersion===1&&x?.bankId===BANK_ID?normalize(x.records):{};
 }catch{return {};}
}
function saveLocal(){
 try{localStorage.setItem(STORAGE,JSON.stringify({schemaVersion:1,bankId:BANK_ID,records}))}
 catch{throw Error('Local storage is unavailable; export your review JSON before closing this page')}
}
function readForm(){
 const n=id=>{const v=$(id).value.trim();return v===''?null:Number(v)};
 return {specimenNumber:n('specimenNumber'),pdfPage:n('pdfPage'),
  officialTick:$('officialTick').value,typedChoice:$('typedChoice').value,
  printedChoice:$('printedChoice').value.slice(0,2000),reviewNotes:$('reviewNotes').value.slice(0,2500),
  stemChecked:$('stemChecked').checked,choicesChecked:$('choicesChecked').checked,
  tickChecked:$('tickChecked').checked,figureChecked:$('figureChecked').checked};
}
function setForm(row){
 $('specimenNumber').value=row.specimenNumber??'';
 $('pdfPage').value=row.pdfPage??'';
 for(const k of ['officialTick','typedChoice','printedChoice','reviewNotes'])$(k).value=row[k];
 for(const k of CHECKS)$(k).checked=row[k];
}
function hasData(r){return Boolean(r.specimenNumber||r.pdfPage||r.officialTick||r.typedChoice||
 r.printedChoice.trim()||r.reviewNotes.trim()||CHECKS.some(k=>r[k]));}
function duplicateSpecimen(r,number){
 return r.specimenNumber!==null&&Object.entries(records).some(([n,x])=>Number(n)!==number&&
  x.specimenNumber===r.specimenNumber);
}
function localCheck(r,number){
 return validRow(r)&&int(r.specimenNumber)&&r.specimenNumber<=200&&
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
  'Original figure still missing: '+q.sourceIssue:
  q.sourceStatus==='secondary_source_text_cross_checked'?
  'Editorial study text repaired from unofficial guide Q'+q.sourceComparison.guideQuestionNumber+
  ' (page '+q.sourceComparison.pdfPage+'); original TNPSC wording not certified.':
  'User-supplied transcription; original TNPSC question wording still requires comparison.';
 setForm(records[current]||empty());
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
 dirty=false;status();$('transferStatus').textContent='Saved local review for Q'+current;
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
   sourceStatus:q.sourceStatus,...r};
 });
 return {schemaVersion:1,bankId:BANK_ID,exam:'TNPSC Group I Services Prelims 2026',
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
 if(x.schemaVersion!==1||x.bankId!==BANK_ID||x.officialTentativeSource!==OFFICIAL||
    !Array.isArray(x.rows)||x.rows.length!==200)throw Error('Wrong or incomplete 2026 Group I review file');
 const fresh={};
 x.rows.forEach((row,i)=>{
  if(row.transcriptionNumber!==i+1||row.sourceStatus!==questions[i].sourceStatus)
   throw Error('Mismatched question order/source status at slot '+(i+1));
  const raw={};for(const k of FIELDS)raw[k]=row[k];
  if(!validRow(raw))throw Error('Invalid review row '+(i+1));
  if(hasData(raw))fresh[i+1]=raw;
 });
 if(!window.confirm('Replace all browser-local reviews with this imported 200-position snapshot?'))return;
 records=normalize(fresh);saveLocal();view();
 $('transferStatus').textContent='Imported '+Object.keys(records).length+' locally saved reviews; no scores or questions were published.';
}
FIELDS.forEach(id=>$(id).addEventListener(id.endsWith('Checked')?'change':'input',()=>{
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
