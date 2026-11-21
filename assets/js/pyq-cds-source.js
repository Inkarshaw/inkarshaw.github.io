/* PDF-backed CDS GK response sheet; official question PDF is not a typed or scored quiz. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const CHOICES=['A','B','C','D'];
let paper=null,position=1,responses={};
const el=(tag,content)=>{const node=document.createElement(tag);if(content!==undefined)node.textContent=content;return node;};
function status(message,error=false){$('status').textContent=message;$('status').setAttribute('role',error?'alert':'status');}
const key=()=>paper?'clearexams:cds:original-response:'+paper.sourcePaperId:'';
function restore(){
 responses={};
 try{
  const saved=JSON.parse(localStorage.getItem(key())||'{}');
  if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
   for(const [n,a] of Object.entries(saved)){if(Number.isInteger(+n)&&+n>=1&&+n<=120&&CHOICES.includes(a))responses[n]=a;}
  }
 }catch{}
}
function save(){try{localStorage.setItem(key(),JSON.stringify(responses));}catch{}}
function draw(){
 if(!paper)return;
 $('currentQuestion').textContent='Question '+position+' of 120';
 $('attemptCount').textContent=Object.keys(responses).length+' / 120 responses recorded · ungraded';
 const group=$('choices');group.replaceChildren();
 for(const answer of CHOICES){
  const b=el('button',answer);b.type='button';b.setAttribute('aria-label','Question '+position+', choose '+answer);
  b.setAttribute('aria-pressed',String(responses[position]===answer));
  b.addEventListener('click',()=>{if(responses[position]===answer)delete responses[position];else responses[position]=answer;save();draw();});
  group.append(b);
 }
 $('previous').disabled=position===1;$('next').disabled=position===120;
 const palette=$('palette'),frag=document.createDocumentFragment();palette.replaceChildren();
 for(let n=1;n<=120;n++){
  const button=el('button',String(n));button.type='button';button.className=(responses[n]?'done ':'')+(n===position?'current':'');
  button.setAttribute('aria-label','Question '+n+(responses[n]?', selected '+responses[n]:''));
  button.addEventListener('click',()=>{position=n;draw();});
  frag.append(button);
 }
 palette.append(frag);
}
function go(n){if(Number.isInteger(n)&&n>=1&&n<=120){position=n;draw();}else status('Choose a question number from 1 to 120.',true);}
function exportAnswers(){
 if(!paper)return;
 const data={schemaVersion:1,kind:'cds-gk-source-pdf-ungraded-responses',paperId:paper.sourcePaperId,originalPdf:paper.officialSourcePdf,graded:false,score:null,officialKeyMapped:false,questionTextIncluded:false,responses:Object.entries(responses).sort((a,b)=>Number(a[0])-Number(b[0])).map(([n,a])=>({number:Number(n),selected:a}))};
 const blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=paper.sourcePaperId+'-ungraded-responses.json';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function init(){
 try{
  const wanted=new URLSearchParams(location.search).get('paper')||'cds-ii-2020-gk';
  if(!/^cds-(?:i|ii)-20\d{2}-gk$/.test(wanted))throw Error('Invalid CDS paper ID');
  const r=await fetch('data/quizzes/cds-gk/coverage-gaps-2008-2020.json',{cache:'no-store'});
  if(!r.ok)throw Error('Coverage catalog could not load');
  const data=await r.json();
  if(data.schemaVersion!==1||!Array.isArray(data.slots))throw Error('Unexpected coverage data');
  paper=data.slots.find(p=>p.sourcePaperId===wanted);
  if(!paper||paper.status!=='no-local-text-paper'||paper.paperId!==null||paper.questionPositions!==0||paper.responseSheetPositions!==120||paper.officialFinalAnswerKeyVerified!==false||paper.scoringEnabled!==false||paper.officialSourceInspected!==true||!/^https:\/\/(?:www\.)?upsc\.gov\.in\/sites\/default\/files\/[A-Za-z0-9._-]+\.pdf$/.test(paper.officialSourcePdf))throw Error('This original paper is not available for PDF-backed practice');
  $('paperTitle').textContent='CDS '+paper.session+' '+paper.year+' · General Knowledge';
  $('paperMeta').textContent='Original UPSC Series '+paper.officialBookletSeries+' PDF · 120 response positions · source-only ungraded practice';
  $('officialPdf').href=paper.officialSourcePdf;
  $('pdfFrame').src=paper.officialSourcePdf;
  $('practice').hidden=false;
  restore();draw();status('Official-source practice opened. Read each question in the PDF before selecting A–D.');
 }catch(err){$('practice').hidden=true;status('Unable to open this paper: '+err.message,true);}
}
$('previous').addEventListener('click',()=>go(position-1));
$('next').addEventListener('click',()=>go(position+1));
$('jumpButton').addEventListener('click',()=>go(Number($('jump').value)));
$('jump').addEventListener('keydown',e=>{if(e.key==='Enter')go(Number($('jump').value));});
$('exportAnswers').addEventListener('click',exportAnswers);
$('clearAnswers').addEventListener('click',()=>{if(!paper||!window.confirm('Clear all locally saved responses for this source paper?'))return;responses={};save();draw();status('Saved choices cleared; no other paper was changed.');});
init();
})();