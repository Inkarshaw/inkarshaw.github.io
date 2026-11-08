/* ClearExams original-PYQ intake: local editor, never an automated public publisher.
   Source text is written by the editor from a source they have the right to use.
   Do not relabel partial records, OCR guesses or adapted questions as original. */
(() => {
'use strict';
const api=window.ClearExamsPYQIntake;
const $=id=>document.getElementById(id);
const letters=api.letters,langs=api.langs;
const STORE='clearexamsOriginalTranscriptionDraftV1:';
const official=url=>{
  try{const u=new URL(url);return u.protocol==='https:'&&/^(?:www\.)?tnpsc\.gov\.in$/i.test(u.hostname)&&/\.pdf$/i.test(u.pathname)?u.href:null}
  catch{return null}
};
let papers=[],keys=[],paper=null,records={},current=1,localPDF=null,originalPDF='',validKey=null;
function notice(msg,error=false){
  $('messages').textContent=msg;
  $('messages').style.color=error?'#a5383c':'#126a49';
}
function keyFor(number){return validKey?.answers?.[number-1]||''}
function currentRecord(){return records[String(current)]}
function initialize(p){
  const store=STORE+p.id;
  let saved=null;
  try{saved=JSON.parse(localStorage.getItem(store)||'null')}catch{}
  records={};
  const indexed=saved?.schemaVersion===1&&saved.paperId===p.id&&saved.questionCount===p.questionCount?
    saved.records||{}:{};
  for(let i=1;i<=p.questionCount;i++)records[String(i)]=api.normalize(indexed[String(i)],i,keyFor(i));
  current=Number.isInteger(saved?.currentQuestion)?Math.max(1,Math.min(saved.currentQuestion,p.questionCount)):1;
}
function persist(){
  if(!paper)return;
  try{localStorage.setItem(STORE+paper.id,JSON.stringify({
    schemaVersion:1,paperId:paper.id,questionCount:paper.questionCount,
    currentQuestion:current,records
  }));}catch{notice('Storage is full or unavailable. Export your JSON draft now.',true)}
}
function progress(){
  if(!paper)return;
  const tally=api.tally(records);
  $('totalCount').textContent=String(paper.questionCount);
  $('capturedCount').textContent=String(tally.captured);
  $('reviewedCount').textContent=String(tally.reviewed);
  $('coverageFill').style.width=(100*tally.captured/paper.questionCount).toFixed(1)+'%';
  const r=api.examine(currentRecord());
  $('recordStatus').textContent=r.reviewed?'Reviewed locally':r.captured?'Text captured · review pending':'Incomplete transcription';
  $('recordStatus').style.color=r.reviewed?'#126a49':r.captured?'#1457b1':'#925d11';
  const box=$('recordIssues');box.replaceChildren();
  r.errors.slice(0,7).forEach(m=>{const li=document.createElement('li');li.textContent=m;box.append(li)});
  $('issuesTitle').textContent=r.errors.length?r.errors.length+' remaining checks for Q'+current:'All local content checks complete for Q'+current;
}
function paintPalette(){
  if(!paper)return;
  const panel=$('questionPalette');panel.replaceChildren();
  const frag=document.createDocumentFragment();
  for(let i=1;i<=paper.questionCount;i++){
    const state=api.examine(records[String(i)]);
    const b=document.createElement('button');b.type='button';b.textContent=i;
    b.className=(state.reviewed?'reviewed':state.captured?'captured':'')+(i===current?' current':'');
    b.title='Original question '+i+(state.reviewed?' · reviewed':state.captured?' · captured':' · missing');
    b.addEventListener('click',()=>goQuestion(i));frag.append(b);
  }
  panel.append(frag);
}
function updateCurrentPalette(){
  const buttons=$('questionPalette').children;
  for(let i=0;i<buttons.length;i++){
    const state=api.examine(records[String(i+1)]),b=buttons[i];
    b.className=(state.reviewed?'reviewed':state.captured?'captured':'')+(i+1===current?' current':'');
  }
}
function emitChange(resetChecks=[]){
  const q=currentRecord();
  resetChecks.forEach(k=>{q.review[k]=false;const box=$('review'+k[0].toUpperCase()+k.slice(1));if(box)box.checked=false});
  q.updatedAt=new Date().toISOString();
  persist();progress();updateCurrentPalette();
  $('previewArea').hidden=true;
}
function makeField(label,value,onInput,multiline=false,extraClass=''){
  const outer=document.createElement('div');outer.className='field';
  const text=document.createElement('label');text.textContent=label;
  const control=document.createElement(multiline?'textarea':'input');
  if(!multiline)control.type='text';
  control.value=value||'';
  if(multiline)control.className=extraClass;
  control.addEventListener('input',()=>onInput(control.value));
  outer.append(text,control);return outer;
}
function drawOriginalFields(){
  const q=currentRecord(),container=$('originalFields');container.replaceChildren();
  for(const lang of q.originalLanguages){
    const section=document.createElement('section');section.className='lang-group';
    const title=document.createElement('h3');title.textContent=lang==='ta'?'Printed Tamil / அச்சிடப்பட்ட தமிழ்':'Printed English';
    section.append(title);
    section.append(makeField('Exact question stem — preserve punctuation, maths and spelling',
      q.text[lang],value=>{q.text[lang]=value;emitChange(['text'])},true,'question-text'));
    const options=document.createElement('div');options.className='choice-grid';
    for(const letter of letters){
      options.append(makeField('Printed choice '+letter,
        q.options[lang][letter],value=>{q.options[lang][letter]=value;emitChange(['options'])},true));
    }
    section.append(options);container.append(section);
  }
}
function showQuestion(){
  if(!paper)return;
  const q=currentRecord();
  $('questionIndex').textContent=String(current);
  $('jumpQuestion').value=String(current);
  $('jumpQuestion').max=String(paper.questionCount);
  $('sourcePage').value=q.sourcePdfPage||'';
  $('hasTamil').checked=q.originalLanguages.includes('ta');
  $('hasEnglish').checked=q.originalLanguages.includes('en');
  $('keyAnswer').value=q.correctKey?(q.correctKey==='ALL'?'ALL (special final-key entry)':q.correctKey):'Official final key not indexed';
  $('visualType').value=q.originalHasVisuals;
  $('visualPath').value=q.visualPath;
  $('visualAlt').value=q.visualAlt;
  $('editorNotes').value=q.notes;
  const checks={Text:'text',Options:'options',Source:'source',Key:'key',Visuals:'visuals'};
  for(const [cap,key] of Object.entries(checks))$('review'+cap).checked=q.review[key];
  $('previousQuestion').disabled=current===1;
  $('nextQuestion').disabled=current===paper.questionCount;
  $('previewArea').hidden=true;
  drawOriginalFields();progress();updateCurrentPalette();
}
function goQuestion(n){
  if(!paper||!Number.isInteger(n)||n<1||n>paper.questionCount)return;
  current=n;persist();showQuestion();
}
function paperChanged(){
  const p=papers.find(x=>x.id===$('paperSelect').value);
  if(!p)return;
  paper=p;validKey=keys.find(k=>k.id===p.id&&k.paperVersion===p.paperVersion&&
    Array.isArray(k.answers)&&k.answers.length===p.questionCount)||null;
  if(localPDF){URL.revokeObjectURL(localPDF);localPDF=null}
  $('localPdf').value='';
  originalPDF=official(p.paperUrl)||'';
  $('paperDescription').textContent=p.board+' '+p.exam+' · '+p.year+' · '+p.paperVersion+
    ' · '+p.questionCount+' original numbered positions'+(validKey?' · official key mapped':' · key not indexed');
  $('sourceLink').href=originalPDF||'https://www.tnpsc.gov.in/';
  $('paperFrame').src=originalPDF||'about:blank';
  $('exportJson').disabled=false;
  initialize(p);paintPalette();showQuestion();notice('Local draft loaded. Exact text is not prefilled from adapted questions.');
}
function jumpPDF(){
  const page=Number($('pdfPage').value);
  if(!Number.isInteger(page)||page<1||page>500){notice('PDF page must be between 1 and 500.',true);return}
  const base=localPDF||originalPDF;
  if(base)$('paperFrame').src=base+'#page='+page;
}
function attachLanguage(lang,enabled){
  const q=currentRecord();
  const set=new Set(q.originalLanguages);
  if(enabled)set.add(lang);else set.delete(lang);
  if(!set.size){
    notice('At least one language must be selected.',true);
    $('hasTamil').checked=q.originalLanguages.includes('ta');
    $('hasEnglish').checked=q.originalLanguages.includes('en');return;
  }
  q.originalLanguages=langs.filter(x=>set.has(x));
  emitChange(['text','options']);drawOriginalFields();progress();
}
function splitBlock(){
  const lang=$('pasteLang').value,q=currentRecord(),raw=$('rawBlock').value;
  if(!q.originalLanguages.includes(lang)){notice('Select '+(lang==='ta'?'Tamil':'English')+' in the printed languages first.',true);return}
  const lines=raw.replace(/\r\n?/g,'\n').split('\n');
  const stem=[],parts={A:[],B:[],C:[],D:[],E:[]};let active=null;
  for(const line of lines){
    const match=line.match(/^\s*(?:\(([A-E])\)|([A-E])[\).:])\s*(.*)$/i);
    if(match){active=(match[1]||match[2]).toUpperCase();parts[active].push(match[3]);continue}
    if(active)parts[active].push(line);else stem.push(line);
  }
  const missing=letters.filter(l=>!parts[l].join('\n').trim());
  if(!stem.join('\n').trim()||missing.length){
    notice('Could not reliably detect a stem and A–E option lines. Enter them manually; no text was overwritten.',true);return;
  }
  const hasExisting=q.text[lang].trim()||letters.some(l=>q.options[lang][l].trim());
  if(hasExisting&&!confirm('Replace the current '+lang+' draft with the split text?'))return;
  q.text[lang]=stem.join('\n').trim();
  for(const l of letters)q.options[lang][l]=parts[l].join('\n').trim();
  emitChange(['text','options']);drawOriginalFields();
  notice('A–E labels were split into draft fields. Compare every line and symbol with the printed source.');
}
function preview(){
  const q=currentRecord(),view=$('previewArea');view.replaceChildren();
  const title=document.createElement('h3');title.textContent='Local text preview · Original question '+q.number;view.append(title);
  for(const lang of q.originalLanguages){
    const header=document.createElement('b');header.textContent=lang==='ta'?'தமிழ்':'English';view.append(header);
    const p=document.createElement('p');p.textContent=q.text[lang]||'[Question text missing]';view.append(p);
    for(const l of letters){
      const c=document.createElement('div');c.className='answer';
      c.textContent='('+l+') '+(q.options[lang][l]||'[Missing]');view.append(c);
    }
  }
  const key=document.createElement('p');key.className='key';key.textContent='Official final-key mapping: '+(q.correctKey||'not yet indexed');view.append(key);
  const r=api.examine(q),status=document.createElement('p');status.textContent=r.reviewed?
    'Local review checks complete. Publication not approved by this tool.':
    'This remains an incomplete or unchecked private draft.';view.append(status);
  view.hidden=false;
}
function exportDraft(){
  if(!paper)return;
  const payload={schemaVersion:1,kind:'clearexams-local-original-transcription',
    paperId:paper.id,exam:paper.board+' '+paper.exam,year:paper.year,
    paperVersion:paper.paperVersion,languagePolicy:'Original printed languages only',
    officialPaperUrl:paper.paperUrl,officialFinalKeyUrl:paper.answerKeyUrl,
    questionCount:paper.questionCount,currentQuestion:current,exportedAt:new Date().toISOString(),
    publicationStatus:'LOCAL DRAFT — NOT APPROVED FOR PUBLICATION',
    records:Object.keys(records).sort((a,b)=>Number(a)-Number(b)).map(k=>records[k])};
  const blob=new Blob([JSON.stringify(payload,null,2)+'\n'],{type:'application/json;charset=utf-8'});
  const href=URL.createObjectURL(blob),a=document.createElement('a');a.href=href;
  a.download='clearexams-original-pyq-draft-'+paper.id+'.json';
  document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(href),5000);
  notice('JSON draft exported to this device. No text was published to the website.');
}
async function importDraft(file){
  if(!paper||!file)return;
  if(file.size>12000000){notice('JSON draft exceeds the 12 MB safety limit.',true);return}
  try{
    const incoming=JSON.parse(await file.text());
    if(incoming.schemaVersion!==1||incoming.paperId!==paper.id||
       incoming.questionCount!==paper.questionCount||!Array.isArray(incoming.records)||
       incoming.records.length!==paper.questionCount)throw Error('Draft must match this source paper and all numbered slots');
    if(!confirm('Replace the locally saved draft for '+paper.year+' with the imported JSON?'))return;
    const merged={};
    for(let n=1;n<=paper.questionCount;n++){
      const raw=incoming.records[n-1];
      if(!raw||raw.number!==n)throw Error('Original question order mismatch at '+n);
      merged[String(n)]=api.normalize(raw,n,keyFor(n));
    }
    records=merged;current=1;persist();paintPalette();showQuestion();
    notice('Local draft imported. All official key values were reloaded from the paper-specific key file.');
  }catch(err){notice('Could not import: '+err.message,true)}
}
$('paperSelect').addEventListener('change',paperChanged);
$('showPage').addEventListener('click',jumpPDF);
$('pdfPage').addEventListener('keydown',e=>{if(e.key==='Enter')jumpPDF()});
$('localPdf').addEventListener('change',e=>{
  const file=e.target.files?.[0];if(!file)return;
  if(file.type!=='application/pdf'&&!/\.pdf$/i.test(file.name)){notice('Choose a PDF file.',true);return}
  if(localPDF)URL.revokeObjectURL(localPDF);
  localPDF=URL.createObjectURL(file);$('paperFrame').src=localPDF;
  notice('The PDF is open locally on your device. Its file bytes are not uploaded.');
});
$('previousQuestion').addEventListener('click',()=>goQuestion(current-1));
$('nextQuestion').addEventListener('click',()=>goQuestion(current+1));
$('jumpToQuestion').addEventListener('click',()=>goQuestion(Number($('jumpQuestion').value)));
$('nextIncomplete').addEventListener('click',()=>{
  if(!paper)return;
  for(let step=1;step<=paper.questionCount;step++){
    const n=((current-1+step)%paper.questionCount)+1;
    if(!api.examine(records[String(n)]).captured){goQuestion(n);return}
  }
  notice('All numbered questions have draft text; independent reviews may still be incomplete.');
});
$('sourcePage').addEventListener('input',e=>{
  const n=Number(e.target.value);currentRecord().sourcePdfPage=Number.isInteger(n)&&n>0&&n<=500?n:null;
  emitChange(['source']);
});
$('hasTamil').addEventListener('change',e=>attachLanguage('ta',e.target.checked));
$('hasEnglish').addEventListener('change',e=>attachLanguage('en',e.target.checked));
$('splitBlock').addEventListener('click',splitBlock);
$('visualType').addEventListener('change',e=>{
  currentRecord().originalHasVisuals=e.target.value;emitChange(['visuals']);
});
for(const [id,key] of [['visualPath','visualPath'],['visualAlt','visualAlt']]){
  $(id).addEventListener('input',e=>{currentRecord()[key]=e.target.value;emitChange(['visuals'])});
}
$('editorNotes').addEventListener('input',e=>{currentRecord().notes=e.target.value;emitChange()});
for(const [name,field] of [['Text','text'],['Options','options'],['Source','source'],['Key','key'],['Visuals','visuals']]){
  $('review'+name).addEventListener('change',e=>{
    currentRecord().review[field]=e.target.checked;
    emitChange();notice('Review choice saved locally. It is not an editorial publication approval.');
  });
}
$('previewQuestion').addEventListener('click',preview);
$('exportJson').addEventListener('click',exportDraft);
$('importJson').addEventListener('change',e=>{importDraft(e.target.files?.[0]);e.target.value=''});
Promise.all([
  fetch('data/quizzes/original-paper-practice.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Source paper catalogue unavailable');return r.json()}),
  fetch('data/quizzes/original-final-keys.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([catalog,keyCatalog])=>{
  papers=(Array.isArray(catalog?.papers)?catalog.papers:[]).filter(p=>
    Number.isInteger(p.questionCount)&&p.questionCount>0&&p.questionCount<=400&&official(p.paperUrl)&&
    // This A–E-only editor must not silently corrupt the four-option Group I 2011 booklet.
    Array.isArray(p.optionLetters)&&p.optionLetters.join(',')==='A,B,C,D,E');
  keys=Array.isArray(keyCatalog?.papers)?keyCatalog.papers:[];
  const select=$('paperSelect');select.replaceChildren();
  for(const p of papers){
    const opt=document.createElement('option');opt.value=p.id;opt.textContent=p.board+' '+p.exam+' '+p.year+' · '+p.questionCount+' questions';select.append(opt);
  }
  if(!papers.length)throw Error('No supported source papers found');
  const requested=new URLSearchParams(location.search).get('paper');
  select.value=papers.some(p=>p.id===requested)?requested:
    papers.some(p=>p.year===2024)?papers.find(p=>p.year===2024).id:papers[0].id;
  paperChanged();
}).catch(err=>notice('Workbench cannot load source metadata: '+err.message,true));
})();