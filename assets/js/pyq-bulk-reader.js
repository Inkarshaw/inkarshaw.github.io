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
const validURL=x=>{try{const u=new URL(x);return u.protocol==='https:'&&/^(?:www\.)?(?:tnpsc\.gov\.in|tnusrb\.tn\.gov\.in|upsc\.gov\.in)$/i.test(u.hostname)?u.href:null}catch{return null}};
function say(message,error=false){$('status').textContent=message;$('status').style.color=error?'#a23b38':'#425e75'}
function key(id){return 'ce-pyq-bulk-answers-v1:'+id}
function normalize(raw){
 if(!raw||raw.schemaVersion!==1||!Array.isArray(raw.questionCandidates)||!Array.isArray(raw.pages))throw Error('Not a ClearExams PDF-extraction draft');
 const candidate=raw.questionCandidates;
 if(candidate.length>400||raw.pages.length>500)throw Error('Unusually large paper structure');
 const seen=new Set();
 const questions=candidate.filter(q=>{
  if(!q||!Number.isInteger(q.number)||q.number<1||q.number>400||seen.has(q.number))return false;
  seen.add(q.number);return true;
 }).map(q=>({
  number:q.number,text:asText(q.text),options:Object.fromEntries(letters.map(a=>[a,asText(q.options?.[a])])),
  sourcePdfPage:Number.isInteger(q.sourcePdfPage)?q.sourcePdfPage:null,
  complete:q.fourOptionsDetected===true,
  sourceStatus:'unverified-machine-extracted',rawBlock:asText(q.rawBlock)
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
  pages:raw.pages.map(p=>({pdfPage:p.pdfPage,text:asText(p.text),method:asText(p.method)})),
  stats:raw.stats||{}, fileStatus:raw.sourceTextKind||'unverified',pageOnly};
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
 $('save').disabled=!active;$('clear').disabled=!active;
 if(!active)return;
 $('paperHeading').textContent=active.name;
 const counts=active.questions.reduce((o,q)=>(o.complete+=q.complete?1:0,o),{complete:0});
 $('paperStats').textContent=active.pageOnly?
  active.pages.length+' extracted source pages (question numbers could not be parsed) · no answer scoring':
  active.questions.length+' numbered candidates · '+counts.complete+
   ' apparently complete A–D alternatives · '+(active.questions.length-counts.complete)+
   ' incomplete · '+active.pages.length+' PDF source pages · no final-key scoring';
 loadLocal();current=0;$('search').value='';$('filter').value='all';filterQuestions();
 say('Opened '+active.name+'. Text is unverified. Responses are saved only in this browser.');
}
function filterQuestions(){
 if(!active)return;
 const query=$('search').value.trim().toLocaleLowerCase(),f=$('filter').value;
 shown=active.questions.map((q,i)=>({q,i})).filter(({q})=>{
  if(f==='complete'&&!q.complete)return false;
  if(f==='incomplete'&&q.complete)return false;
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
 $('sourceMeta').textContent=q.sourcePdfPage?'Source PDF page '+q.sourcePdfPage:'Source page unknown';
 $('stem').textContent=q.text||'[Question text unreadable — use original source]';
 const opt=$('options');opt.replaceChildren();
 for(const l of letters){
  const val=q.options[l];
  if(!clean(val))continue;
  const b=textNode('button','option','');
  b.type='button';b.setAttribute('aria-pressed',String(responses[q.number]===l));
  b.append(textNode('b','',l),textNode('span','',val));
  b.addEventListener('click',()=>choice(q,l));
  opt.append(b);
 }
 const missing=letters.slice(0,4).filter(l=>!clean(q.options[l]));
 $('questionCaution').textContent=active.pageOnly?
  'This is raw extracted PDF-page text, not a detected or numbered MCQ. No options or answers were invented.':
  q.complete&&missing.length===0?
  'Ungraded question: original scan, mathematical notation, option ordering and figures require review.':
  'Incomplete machine text. Missing options: '+(missing.length?missing.join(', '):'unreliable OCR block')+'. You may inspect the original PDF; no answers are inferred.';
 const page=active.pages.find(p=>p.pdfPage===q.sourcePdfPage);
 $('sourcePage').textContent=page?.text||q.rawBlock||'No source text extracted for this question';
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
  row.append(textNode('strong','',entry.exam+' · '+entry.year));
  row.append(textNode('span','muted',entry.paperName+' · '+entry.textPages+' readable PDF pages'));
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
  const valid=index.entries.filter(e=>e&&typeof e.id==='string'&&/^[a-z0-9-]{6,120}$/.test(e.id)&&
    typeof e.file==='string'&&e.file===e.id+'.json'&&Number.isInteger(e.textPages)&&e.textPages>0).slice(0,30);
  const files=await Promise.allSettled(valid.map(async entry=>{
   const r=await fetch('data/quizzes/pyq-reader-drafts/'+entry.file,{cache:'no-store'});
   if(!r.ok)throw Error('Missing text source '+entry.file);
   const raw=await r.json();
   if(raw.id!==entry.id||raw.draftOnly!==true||raw.grading!=='disabled'||raw.officialFinalKeyMapped!==false)
    throw Error('Unverified source metadata mismatch');
   return {entry,paper:normalize(raw)};
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
$('save').addEventListener('click',exportSession);
$('clear').addEventListener('click',()=>{
 if(!active||!confirm('Clear locally saved responses for this paper?'))return;
 responses={};saveLocal();filterQuestions();
});
loadSiteDrafts();
})();
