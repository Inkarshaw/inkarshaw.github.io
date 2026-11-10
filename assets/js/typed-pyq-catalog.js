/* Typed PYQ coverage catalogue: source-controlled counts; never infer verified text from number coverage. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const expectedLink=/^(?:tnpsc|tnusrb|pyq)-[a-z0-9-]+\.html(?:\?year=20(?:24|25))?$/;
let entries=[];

let adapted=[];
function isReadyAdapted(q){
return q&&q.ID&&q.Question&&q.SourceType==='Adapted PYQ'&&String(q.Active||'').toUpperCase()!=='FALSE'&&
  /^(?:TNPSC|UPSC) /.test(q.SourceExam||'')&&/^20\d{2}$/.test(String(q.SourceYear))&&
  ['A','B','C','D'].includes(q.CorrectAnswer)&&
  ['A','B','C','D'].every(a=>String(q['Option'+a]||'').trim())&&
  new Set(['A','B','C','D'].map(a=>String(q['Option'+a]).trim().toLowerCase())).size===4&&
  /^https:\/\/(?:www\.)?(?:tnpsc\.gov\.in|upsc\.gov\.in)\//i.test(String(q.SourceURL||''));
}
function collectAdapted(rows){
if(!Array.isArray(rows))throw Error('Adapted bank is not an array');
const map=new Map(),ids=new Set();
for(const q of rows){
  if(!isReadyAdapted(q)||ids.has(q.ID))continue;
  ids.add(q.ID);
  const key=q.SourceExam+'|'+q.SourceYear;
  if(!map.has(key))map.set(key,{exam:q.SourceExam.startsWith('TNPSC ')?'TNPSC':'UPSC',paper:q.SourceExam,year:Number(q.SourceYear),count:0});
  map.get(key).count++;
}
return [...map.values()].sort((a,b)=>a.exam.localeCompare(b.exam)||b.year-a.year||a.paper.localeCompare(b.paper));
}
function refreshStats(){
const total=entries.reduce((n,e)=>n+e.typed,0),full=entries.filter(e=>e.typed===e.total).length;
const sourceCount=adapted.reduce((n,e)=>n+e.count,0);
$('stats').replaceChildren();
for(const label of [entries.length+' original-numbered sets',total+' numbered text positions',sourceCount+' adapted PYQ questions',full+' full-number drafts'])$('stats').append(element('span','',label));
}

function element(tag,className,txt){const el=document.createElement(tag);if(className)el.className=className;if(txt!==undefined)el.textContent=txt;return el}
function render(){
const q=$('search').value.trim().toLowerCase(),board=$('examFilter').value,coverage=$('coverageFilter').value;
const selected=entries.filter(e=>(board==='all'||board===e.exam)&&(coverage==='all'||coverage===e.type)&&(!q||[e.exam,e.paper,String(e.year),e.level].join(' ').toLowerCase().includes(q)));
const selectedAdapted=adapted.filter(e=>(board==='all'||board===e.exam)&&(coverage==='all'||coverage==='adapted')&&(!q||[e.exam,e.paper,String(e.year),'adapted'].join(' ').toLowerCase().includes(q)));
const cards=$('cards');cards.replaceChildren();
for(const e of selected){
const card=element('article','card');
const tag=element('div','cat',e.exam+' · '+e.year);card.append(tag);
const title=element('h2','',e.paper);card.append(title);
const metrics=element('div','metrics');const large=element('strong','',String(e.typed));const small=element('span','', 'of '+e.total+' original question positions available as text');metrics.append(large,small);card.append(metrics);
const track=element('div','track');track.setAttribute('aria-label',e.typed+' of '+e.total+' positions typed');
const fill=element('span');fill.style.width=(100*e.typed/e.total).toFixed(1)+'%';track.append(fill);card.append(track);
card.append(element('div','status',e.level+' · '+e.scorable+' question positions with provisional key scoring'));
card.append(element('p','',e.sourceStatus));
if(expectedLink.test(e.link)){const a=element('a','play',e.typed===e.total?'Open typed quiz':'Open available text');a.href=e.link;card.append(a)}
cards.append(card);
}
for(const e of selectedAdapted){
const card=element('article','card');
card.append(element('div','cat',e.exam+' · '+e.year+' · Adapted source-attributed PYQs'));
card.append(element('h2','',e.paper));
const metrics=element('div','metrics');
metrics.append(element('strong','',String(e.count)),element('span','','adapted text questions available'));
card.append(metrics);
card.append(element('div','status','Question text · Four options · Answer review'));
card.append(element('p','','Adapted wording only. Not a full or verbatim original paper; consult the official question paper for exact wording.'));
const a=element('a','play','Practise '+e.count+' adapted PYQs');
a.href='pyq-full-quiz.html?'+new URLSearchParams({exam:e.paper,year:String(e.year),count:'all'}).toString();
card.append(a);cards.append(card);
}
$('showing').textContent='Showing '+selected.length+' original-numbered text sets and '+selectedAdapted.length+' adapted exam-year practice sets';
$('empty').hidden=selected.length+selectedAdapted.length>0;
}
for(const name of ['search','examFilter','coverageFilter'])$(name).addEventListener(name==='search'?'input':'change',render);
fetch('data/quizzes/typed-pyq-catalog.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{
if(d.schemaVersion!==1||!Array.isArray(d.entries)||d.entries.some(e=>!Number.isInteger(e.total)||!Number.isInteger(e.typed)||e.typed<0||e.typed>e.total||!Number.isInteger(e.scorable)||e.scorable<0||e.scorable>e.typed||!expectedLink.test(e.link)))throw Error('Coverage catalogue failed validation.');
entries=d.entries;
refreshStats();
render();
}).catch(e=>{$('showing').textContent='Typed quiz library could not load: '+e.message});
/* This separate question bank supplies previously hidden, already-curated exam/year sets.
   Adaptations never contribute to original numbered transcription counts. */
fetch('data/quizzes/verified-pyqs.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()})
.then(rows=>{adapted=collectAdapted(rows);refreshStats();render()})
.catch(()=>{if(entries.length)$('showing').textContent+=' · Adapted question bank temporarily unavailable.'});
})();
