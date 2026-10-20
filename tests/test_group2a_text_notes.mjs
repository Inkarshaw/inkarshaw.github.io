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
assert.ok(notes.length>=59,'Social-reform and state-government school-book coverage');
for(const n of notes){
  assert.ok(n.title&&n.chapter&&Array.isArray(n.points)&&n.points.length>=3);
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
assert.ok(links>=108,'Additional reform and polity topic links');
assert.ok(notes.some(n=>n.id==='sangam')&&notes.some(n=>n.id==='gandhi-mass')&&notes.some(n=>n.id==='state-government')&&notes.some(n=>n.id==='biotech'),'History, polity and science chapter links present');
const socialReforms=['brahmo-samaj','arya-samaj','ramakrishna-mission','theosophical-society','prarthana-samaj','satyashodhak','narayana-guru','pandita-ramabai','aligarh-movement','vaikunda-swami','vallalar','iyothee-thass','christian-missions'];
for(const id of socialReforms){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing social reform note: '+id);assert.match(note.chapter,/Class 11 History · Unit 19: Towards Modernity/);assert.equal(new URL(note.href,'https://clearexams.ink/').searchParams.get('unit'),'19');assert.ok(links>0);}
for(const id of ['governor','chief-minister','legislative-assembly']){const note=notes.find(n=>n.id===id);assert.ok(note,'Missing state polity note: '+id);assert.match(note.chapter,/Class 7 Social Science · Term II · Civics: State Government/);const u=new URL(note.href,'https://clearexams.ink/').searchParams;assert.equal(u.get('class'),'7');assert.equal(u.get('term'),'2');assert.equal(u.get('unit'),'6');}
const taggedIds=new Set(blocks.flatMap(b=>b.units.flatMap(u=>u.topics.filter(t=>Array.isArray(t)&&t[1]).map(t=>t[1]))));
for(const id of [...socialReforms,'governor','chief-minister','legislative-assembly'])assert.ok(taggedIds.has(id),'Note not linked from syllabus: '+id);
assert.equal(find('main-gs').units.reduce((n,u)=>n+u.count,0),150,'Question distribution was not altered');

assert.match(notePage,/id="noteSearch"/,'Notes have topic search');
assert.match(notePage,/id="noteMatches"/,'Topic search has accessible results');
const scripts=[...notePage.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map(m=>m[1]).filter(s=>s.trim());
assert.ok(scripts.length);for(const script of scripts)new vm.Script(script,{filename:'tn-school-notes.html'});
console.log('Group IIA syllabus valid: '+blocks.length+' subjects, '+notes.length+' notes, '+links+' note-linked topics.');
