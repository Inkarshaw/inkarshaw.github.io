/* Typed PYQ coverage catalogue: source-controlled counts; never infer verified text from number coverage. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const expectedLink=/^(?:tnpsc|tnusrb|pyq)-[a-z0-9-]+\.html(?:\?year=20(?:24|25))?$/;
let entries=[];
function element(tag,className,txt){const el=document.createElement(tag);if(className)el.className=className;if(txt!==undefined)el.textContent=txt;return el}
function render(){
const q=$('search').value.trim().toLowerCase(),board=$('examFilter').value,coverage=$('coverageFilter').value;
const selected=entries.filter(e=>(board==='all'||board===e.exam)&&(coverage==='all'||coverage===e.type)&&(!q||[e.exam,e.paper,String(e.year),e.level].join(' ').toLowerCase().includes(q)));
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
$('showing').textContent='Showing '+selected.length+' of '+entries.length+' exam-year quizzes';
$('empty').hidden=selected.length>0;
}
for(const name of ['search','examFilter','coverageFilter'])$(name).addEventListener(name==='search'?'input':'change',render);
fetch('data/quizzes/typed-pyq-catalog.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.json()}).then(d=>{
if(d.schemaVersion!==1||!Array.isArray(d.entries)||d.entries.some(e=>!Number.isInteger(e.total)||!Number.isInteger(e.typed)||e.typed<0||e.typed>e.total||!Number.isInteger(e.scorable)||e.scorable<0||e.scorable>e.typed||!expectedLink.test(e.link)))throw Error('Coverage catalogue failed validation.');
entries=d.entries;
const total=entries.reduce((a,e)=>a+e.typed,0),full=entries.filter(e=>e.typed===e.total).length;
$('stats').replaceChildren();for(const label of [entries.length+' exam-year quizzes',total+' typed question positions',full+' full-numbered drafts','Source gaps visible'])$('stats').append(element('span','',label));
render();
}).catch(e=>{$('showing').textContent='Typed quiz library could not load: '+e.message});
})();