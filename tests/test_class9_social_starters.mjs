// Class 9 Social Science: source-aware catalogue and bilingual starter QA.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p, import.meta.url),'utf8');
const root='data/textbook/class-9/social-science/';
const index=JSON.parse(read(root+'index.json'));
const starts=[1,16,33,53,66,77,88,101,113,130,142,157,167,180,192,202,210,220,230,238,246,253,265,271,279,284,293,300,307,313];
const source='https://cdn1.byjus.com/wp-content/uploads/2020/01/Samacheer-Kalvi-Class-9-Social-Science-Book-EM.pdf';
assert.equal(index.meta.class,9);
assert.equal(index.meta.edition,2019);
assert.equal(index.meta.subject,'Social Science');
assert.equal(index.meta.unit_count,30);
assert.equal(index.units.length,30);
assert.deepEqual(index.units.map(u=>u.id),Array.from({length:30},(_,i)=>i+1));
assert.deepEqual(index.units.map(u=>u.chapter_page_en),starts);
assert.deepEqual([
  index.units.filter(u=>u.section_en==='History').length,
  index.units.filter(u=>u.section_en==='Geography').length,
  index.units.filter(u=>u.section_en==='Civics').length,
  index.units.filter(u=>u.section_en==='Economics').length
],[11,8,6,5]);
assert.equal(index.meta.total_questions,80);
assert.equal(index.meta.total_quiz_sets,4);
assert.equal(index.meta.published_unit_count,4);
assert.equal(index.meta.source_en_url,source);
const ready=index.units.filter(u=>u.ready);
const pending=index.units.filter(u=>!u.ready);
assert.deepEqual(ready.map(u=>u.id),[1,12,20,26]);
assert.equal(pending.length,26);
for(const u of pending){
 assert.equal(u.total,0);
 assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
 assert.ok(!existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),'No empty bank file for pending unit '+u.id);
}
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const ranges={1:[1,15],12:[157,166],20:[238,245],26:[284,292]};
const allIds=new Set();
for(const u of ready){
 assert.equal(u.total,20);assert.equal(u.quiz_count,1);
 assert.equal(u.path,'unit-'+u.id+'.json');
 const doc=JSON.parse(read(root+u.path));
 assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,u.id);
 assert.equal(doc.meta.edition,2019);assert.equal(doc.meta.source_en_url,source);
 assert.equal(doc.meta.total_questions,20);
 assert.equal(doc.meta.quiz_sets.length,1);
 assert.equal(doc.questions.length,20);
 assert.ok(/2026|current|prescribed/i.test(doc.meta.editorial_status));
 const positions=new Set();
 for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C9SSU'+u.id+'-Q'+String(i+1).padStart(3,'0'));
  assert.ok(!allIds.has(q.id),'Duplicate ID '+q.id);
  allIds.add(q.id);
  assert.equal(q.quiz,1);
  assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' bilingual question');
  assert.ok(q.q_en.trim().length>=22&&q.q_ta.trim().length>=10,q.id+' meaningful stems');
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4,q.id+' English options');
  assert.equal(new Set(q.opts_ta.map(s=>s.trim().toLowerCase())).size,4,q.id+' Tamil options');
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
  positions.add(q.correct);
  assert.ok(q.exp_en.length>=30&&q.exp_ta.length>=15,q.id+' explanations');
  assert.ok(q.page_en>=ranges[u.id][0]&&q.page_en<=ranges[u.id][1],q.id+' source-page range');
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical stem '+q.id);
 }
 assert.ok(positions.size>=3,'Answers need variation in unit '+u.id);
 const curated=quality.curate(doc.questions).questions;
 assert.equal(curated.length,20,'Player should retain all 20 MCQs in unit '+u.id);
 assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
}
assert.equal(allIds.size,80);
const catalog=read('textbook-quiz.html');
const player=read('textbook-play.html');
assert.ok(catalog.includes("'data/textbook/class-'+cls+'/'+subject+termSegment+'/index.json'"));
assert.ok(catalog.includes('if(!u.ready)'));
assert.ok(catalog.includes('All 30 Class 9 Social Science chapters are listed, but only four chapters'));
assert.ok(player.includes("'data/textbook/class-'+classNo+'/'+subject+'/term-'+term+'/unit-'+unit+'.json'")||player.includes("'data/textbook/class-'+classNo+'/'+subject+'/unit-'+unit+'.json'"));
console.log('Class 9 Social Science: 30 indexed chapters, 80 bilingual MCQs in 4 ready units, 26 honestly pending.');
