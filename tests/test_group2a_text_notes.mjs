// Run with: node tests/test_group2a_text_notes.mjs
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';

const root=new URL('../',import.meta.url);
const read=path=>readFileSync(new URL(path,root),'utf8');
const page=read('syllabus.html');
const reader=read('assets/js/tnpsc-group2a-reader.js');
const notesSrc=read('assets/js/tn-school-notes-data.js');
const notePage=read('tn-school-notes.html');

new vm.Script(reader,{filename:'tnpsc-group2a-reader.js'});
new vm.Script(notesSrc,{filename:'tn-school-notes-data.js'});
assert.match(page,/if\(exam\.id==='tnpsc-group-2-2a'\)/);
assert.match(page,/window\.mountGroup2ASyllabus/);
assert.match(page,/tnpsc-group2a-reader\.js/);
assert.match(notePage,/tn-school-notes-data\.js/);
assert.doesNotMatch(page,/G2_Revised_Scheme_Syllabus_27012022\.pdf/);

const notesContext={window:{}};vm.runInNewContext(notesSrc,notesContext);
const notes=notesContext.window.ClearExamsTNSchoolNotes;
const ids=new Set(notes.map(n=>n.id));
assert.equal(ids.size,notes.length,'Unique note IDs');
assert.ok(notes.length>=120,'School books plus expanded Secretariat, economy and welfare sources');
for(const n of notes){
  assert.ok(n.title&&n.chapter&&Array.isArray(n.points)&&n.points.length>=3);
  assert.ok(n.href||n.source_url,n.id+': needs a published quiz or actual textbook source');
  if(n.source_url)assert.match(n.source_url,/^https:\/\//,n.id+': secure textbook source required');
  if(!n.href)continue; // The chapter itself exists, but a ClearExams chapter quiz has not been published.
  const params=new URL(n.href,'https://clearexams.ink/').searchParams;
  assert.equal(new URL(n.href,'https://clearexams.ink/').pathname,'/textbook-play.html');
  assert.equal(params.get('quiz'),'1');
  const c=Number(params.get('class')),subject=params.get('subject'),t=params.get('term'),u=params.get('unit');
  const p=(c<=8?'data/textbook/class-'+c+'/'+subject+'/term-'+t+'/unit-'+u+'.json':'data/textbook/class-'+c+'/'+subject+'/unit-'+u+'.json');
  assert.ok(existsSync(new URL(p,root)),n.id+': missing '+p);
}
const match=reader.match(/const blocks=(\[[\s\S]*?\]);\nconst url/);
assert.ok(match,'Structured syllabus data');
const blocks=JSON.parse(match[1]);
const find=id=>blocks.find(b=>b.id===id);
assert.equal(find('pre-gs').units.reduce((n,u)=>n+u.count,0),75);
assert.equal(find('pre-aptitude').units.reduce((n,u)=>n+u.count,0),25);
assert.equal(find('pre-language-tamil').units.reduce((n,u)=>n+u.count,0),100);
assert.equal(find('pre-language-english').units.reduce((n,u)=>n+u.count,0),100);
assert.equal(find('main-gs').units.reduce((n,u)=>n+u.count,0),150);
assert.equal(find('main-reasoning').units[0].count,50);
assert.equal(find('main-reasoning').units[0].topics.length,27);
let links=0;
for(const b of blocks)for(const u of b.units)for(const t of u.topics){
  if(Array.isArray(t)&&t[1]){assert.ok(ids.has(t[1]),'Unresolved school-book note: '+t[1]);links++;}
}
assert.ok(links>=231,'Topic mapping covers State finances, welfare and Secretariat administration');
assert.ok(notes.some(n=>n.id==='sangam')&&notes.some(n=>n.id==='gandhi-mass')&&notes.some(n=>n.id==='state-government')&&notes.some(n=>n.id==='biotech'),'History, polity and science chapter links present');
const socialReforms=['brahmo-samaj','arya-samaj','ramakrishna-mission','theosophical-society','prarthana-samaj','satyashodhak','narayana-guru','pandita-ramabai','aligarh-movement','vaikunda-swami','vallalar','iyothee-thass','christian-missions'];
for(const id of socialReforms){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing social reform note: '+id);assert.match(note.chapter,/Class 11 History · Unit 19: Towards Modernity/);assert.equal(new URL(note.href,'https://clearexams.ink/').searchParams.get('unit'),'19');assert.ok(links>0);}
for(const id of ['governor','chief-minister','legislative-assembly']){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing state polity note: '+id);assert.match(note.chapter,/Class 7 Social Science · Term II · Civics: State Government/);const u=new URL(note.href,'https://clearexams.ink/').searchParams;assert.equal(u.get('class'),'7');assert.equal(u.get('term'),'2');assert.equal(u.get('unit'),'6');}
const taggedIds=new Set(blocks.flatMap(b=>b.units.flatMap(u=>u.topics.filter(t=>Array.isArray(t)&&t[1]).map(t=>t[1]))));
for(const id of [...socialReforms,'governor','chief-minister','legislative-assembly'])assert.ok(taggedIds.has(id),'Note not linked from syllabus: '+id);
assert.equal(find('main-gs').units.reduce((n,u)=>n+u.count,0),150,'Question distribution was not altered');

const newSocialIds=['justice-party','non-brahmin-manifesto','justice-party-reforms','communal-representation','hindu-endowment-1926','self-respect-movement','periyar-journals','self-respect-marriages','dravidar-kazhagam','anti-hindi-agitation','rettamalai-srinivasan','mc-rajah','tamil-renaissance','tani-tamil'];
const localIds=['local-bodies-structure','gram-sabha','village-panchayat','panchayat-union','district-panchayat','urban-local-government','local-body-finance','local-elections'];
for(const id of [...newSocialIds,...localIds]){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing new textbook note: '+id);assert.ok(!note.href,'Do not invent a quiz route for '+id);assert.match(note.source_url,/^https:\/\//);assert.ok(taggedIds.has(id),'New note not linked in the syllabus: '+id);}
for(const id of newSocialIds)assert.match(notes.find(n=>n.id===id).chapter,/Class 10 Social Science/);
for(const id of localIds)assert.match(notes.find(n=>n.id===id).chapter,/Class 6 Social Science/);
const gram=notes.find(n=>n.id==='gram-sabha');assert.ok(gram.update_url&&gram.points.join(' ').includes('six per year'),'Current Tamil Nadu Gram Sabha meeting frequency must be shown');
assert.match(notePage,/data-quiz-pending/,'Unpublished chapter must be explicitly labelled');
assert.match(notePage,/Read source textbook/,'Notes must offer source chapters');

const adminIds=['tn-district-collector','tn-dro','tn-rdo','tn-tahsildar','tn-revenue-inspector','tn-vao','tn-revenue-structure','tn-bdo-roles','tn-district-rural-development','tn-tnega','tn-esevai-certificates','tn-pension-delivery','tn-land-records','tn-2026-integrated-land','tn-patta-transfer-history','tn-cm-helpline','tn-disaster-revenue'];
for(const id of adminIds){
 const note=notes.find(n=>n.id===id);
 assert.ok(note,'Missing official administration note: '+id);
 assert.equal(note.source_kind,'government',id+': incorrect source category');
 assert.ok(!note.href,id+': official-reference notes cannot pretend to have a textbook quiz');
 assert.ok(note.source_url&&note.source_url.startsWith('https://'),id+': missing primary reference');
 const host=new URL(note.source_url).hostname;
 assert.ok(host.endsWith('.tn.gov.in')||host.endsWith('.nic.in')||host==='tn.nic.in'||host==='cmhelpline.tnega.org',id+': not a primary government reference: '+host);
 assert.ok(note.chapter&&note.points.length>=3&&note.ta,id+': incomplete bilingual title or revision summary');
 assert.ok(taggedIds.has(id),id+': missing direct syllabus topic-to-note link');
}
assert.match(notePage,/note.source_kind==='government'/,'Render official sources separately from school-books');
assert.match(notePage,/Read official government source/,'Show a real official source link');
assert.match(notePage,/Official government reference:/,'Identify the source category');
assert.match(notePage,/note.source_kind==='government'\?'':/,'Official notes must not display missing-quiz placeholders');

const nextIds=['tn-secretariat','tn-business-rules','tn-hrm','tn-finance-consultation','tn-budget-process','tn-budget-deficits','tn-gsdp','tn-gva-sectors','tn-state-income-estimates','tn-agri-statistics','tn-industry-sipcot','tn-msme-dic','tn-startup-ecosystem','tn-naan-mudhalvan','tn-pudhumai-penn','tn-tamil-pudhalvan','tn-magalir-urimai','tn-breakfast-scheme','tn-shg-mahalir','tn-rural-welfare','tn-social-pensions','tn-women-commission'];
for(const id of nextIds){
  const note=notes.find(n=>n.id===id);
  assert.ok(note,'Missing development administration note: '+id);
  assert.equal(note.source_kind,'government',id+': not clearly labelled a government source');
  assert.ok(!note.href,id+': do not create a non-existent textbook quiz route');
  assert.match(note.source_url,/^https:\/\/\S+/,id+': no government link');
  const host=new URL(note.source_url).hostname;
  assert.ok(host.endsWith('.tn.gov.in')||host.endsWith('.nic.in')||host==='tn.nic.in',id+': not Tamil Nadu official source: '+host);
  assert.equal(note.points.length,3,id+': needs three useful facts');
  assert.ok(taggedIds.has(id),id+': not linked from the Group IIA syllabus');
}
assert.match(notePage,/id="noteCategory"/,'Filter textbook vs government notes');
assert.match(notePage,/value="government"/,'Government notes filter choice');
assert.match(notePage,/value="textbook"/,'School-book notes filter choice');
assert.match(notePage,/setOptions\(/,'Source filter updates the note selector');
assert.match(notePage,/inCategory\(n\)/,'Search respects selected source category');

assert.match(notePage,/id="noteSearch"/,'Notes have topic search');
assert.match(notePage,/id="noteMatches"/,'Topic search has accessible results');
const scripts=[...notePage.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
assert.ok(scripts.length);for(const script of scripts)new vm.Script(script,{filename:'tn-school-notes.html'});
console.log('Group IIA syllabus valid: '+blocks.length+' subjects, '+notes.length+' notes, '+links+' note-linked topics.');
