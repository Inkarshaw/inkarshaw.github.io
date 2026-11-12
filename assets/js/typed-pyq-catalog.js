/* Typed PYQ coverage catalogue: source-controlled counts; never infer verified text from number coverage. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const expectedLink=/^(?:tnpsc|tnusrb|pyq)-[a-z0-9-]+\.html(?:\?year=20(?:24|25))?$/;
let entries=[];

let adapted=[], archive=[]; let archiveVisible=16;
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

function archiveKey(e){return e.category+'|'+e.exam+'|'+e.year}
function coveredByTyped(e){
return entries.some(x=>x.exam===e.category&&x.year===e.year&&
 ((e.category==='TNPSC'&&e.exam==='Group IV'&&/^Group IV\b/.test(x.paper))||
 (e.category==='TNPSC'&&e.exam==='Group I'&&/^Group I\b/.test(x.paper))));
}
function coveredByAdapted(e){
const name=e.category==='TNPSC'&&e.exam==='Group IV'?'TNPSC Group IV':
e.category==='TNPSC'&&e.exam==='Group II / IIA'?'TNPSC Group II/IIA':
e.category==='UPSC'&&e.exam==='Civil Services Prelims'?'UPSC Civil Services Prelims':'';
return name&&adapted.some(x=>x.paper===name&&x.year===e.year);
}
function hasTextFor(e){return coveredByTyped(e)||coveredByAdapted(e)}
function officialLink(value){return /^https:\/\/(?:www\.)?(?:tnpsc\.gov\.in|tnusrb\.tn\.gov\.in|upsc\.gov\.in|ssc\.gov\.in|rrbcdg\.gov\.in)\//i.test(String(value||''))}
function external(card,url,label,css){
if(!officialLink(url))return;
const a=element('a',css||'official-link',label);
a.href=url;a.target='_blank';a.rel='noopener noreferrer';card.append(a);
}
function refreshYears(){
const selector=$('yearFilter'),old=selector.value,years=[...new Set([...entries.map(x=>x.year),...adapted.map(x=>x.year),...archive.map(x=>x.year)])].sort((a,b)=>b-a);
selector.replaceChildren();const empty=element('option','','All years');empty.value='all';selector.append(empty);
for(const y of years){const option=element('option','',String(y));option.value=String(y);selector.append(option)}
selector.value=years.includes(Number(old))?old:'all';
}
function makeArchiveCard(e){
const card=element('article','card');
card.append(element('div','cat',e.category+' · '+e.year+' · Original source index'));
card.append(element('h2','',e.exam));
card.append(element('p','',e.paper));
card.append(element('div','status','Question-text quiz not yet available'));
card.append(element('p','','No source-checked question text has been published for this examination year. Do not mistake a paper listing for a typed quiz.'));
if(e.access==='login-or-limited')card.append(element('p','','Candidate login or a limited access period may be required.'));
const sources=element('div','archive-links');
for(const d of e.documents||[]){if(['paper','key'].includes(d.type))external(sources,d.url,d.label,'source-action')}
external(sources,e.url,e.access==='login-or-limited'?'Official candidate-access notices':'Official paper archive','source-action');
card.append(sources);return card;
}

function refreshStats(){
const total=entries.reduce((n,e)=>n+e.typed,0),full=entries.filter(e=>e.typed===e.total).length;
const sourceCount=adapted.reduce((n,e)=>n+e.count,0);
const missing=archive.filter(e=>!hasTextFor(e)).length;
$('stats').replaceChildren();
for(const label of [full+' complete numbered text quizzes · '+total+' / '+total+' playable positions',archive.length+' indexed exam-year sources',adapted.length+' adapted sets · '+sourceCount+' questions',missing+' archived years without local text'])$('stats').append(element('span','',label));
}

function element(tag,className,txt){const el=document.createElement(tag);if(className)el.className=className;if(txt!==undefined)el.textContent=txt;return el}
function render(){
const q=$('search').value.trim().toLowerCase(),board=$('examFilter').value,coverage=$('coverageFilter').value,year=$('yearFilter').value;
const yearOK=e=>year==='all'||String(e.year)===year;
const selected=entries.filter(e=>(board==='all'||board===e.exam)&&yearOK(e)&&(coverage==='all'||coverage===e.type||coverage==='text')&&(!q||[e.exam,e.paper,String(e.year),e.level].join(' ').toLowerCase().includes(q)));
const selectedAdapted=adapted.filter(e=>(board==='all'||board===e.exam)&&yearOK(e)&&(coverage==='all'||coverage==='adapted'||coverage==='text')&&(!q||[e.exam,e.paper,String(e.year),'adapted'].join(' ').toLowerCase().includes(q)));
const selectedArchive=archive.filter(e=>!hasTextFor(e)&&(board==='all'||board===e.category)&&yearOK(e)&&(coverage==='all'||coverage==='source-only')&&(!q||[e.category,e.exam,e.paper,String(e.year)].join(' ').toLowerCase().includes(q)));
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
if(expectedLink.test(e.link)){const a=element('a','play',e.typed===e.total?'Start full text quiz':'Open available text');a.href=e.link;card.append(a)}
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
for(const e of selectedArchive.slice(0,archiveVisible))cards.append(makeArchiveCard(e));
$('showing').textContent='Showing '+selected.length+' numbered text sets, '+selectedAdapted.length+' adapted quiz sets and '+Math.min(selectedArchive.length,archiveVisible)+' of '+selectedArchive.length+' source-only years';
$('empty').hidden=selected.length+selectedAdapted.length+selectedArchive.length>0;
$('showMore').hidden=selectedArchive.length<=archiveVisible;
$('showMore').textContent='Show more source-only exam years ('+(selectedArchive.length-archiveVisible)+' remaining)';
}

for(const name of ['search','examFilter','coverageFilter','yearFilter'])
 $(name).addEventListener(name==='search'?'input':'change',()=>{archiveVisible=16;render()});
$('showMore').addEventListener('click',()=>{archiveVisible+=16;render()});
const fetchJSON=url=>fetch(url,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()});
Promise.allSettled([
 fetchJSON('data/quizzes/typed-pyq-catalog.json'),
 fetchJSON('data/quizzes/verified-pyqs.json'),
 fetchJSON('data/quizzes/pyq-yearwise-catalog.json')
]).then(results=>{
 if(results[0].status==='fulfilled'){
 const d=results[0].value;
 if(d.schemaVersion===1&&Array.isArray(d.entries)&&!d.entries.some(e=>
 !Number.isInteger(e.total)||!Number.isInteger(e.typed)||e.typed<0||e.typed>e.total||
 !Number.isInteger(e.scorable)||e.scorable<0||e.scorable>e.typed||!expectedLink.test(e.link)))
 entries=d.entries;
 }
 if(results[1].status==='fulfilled'){
 try{adapted=collectAdapted(results[1].value)}catch{}
 }
 if(results[2].status==='fulfilled'){
 const source=results[2].value;
 if(source?.schemaVersion===1&&Array.isArray(source.entries)){
 const seen=new Set();
 archive=source.entries.filter(e=>{
 const k=archiveKey(e);
 if(!e.category||!e.exam||!Number.isInteger(e.year)||!officialLink(e.url)||seen.has(k))return false;
 seen.add(k);return true;
 });
 }
 }
 if(!entries.length&&!adapted.length&&!archive.length)throw Error('All PYQ indexes unavailable');
 refreshYears();refreshStats();render();
 const failed=results.filter(x=>x.status==='rejected').length;
 $('dataNotice').textContent=failed?'Some PYQ feeds could not be loaded; available records are still shown.':'All indexed examination years loaded.';
}).catch(e=>{$('showing').textContent='Could not load PYQ library: '+e.message});
})();
