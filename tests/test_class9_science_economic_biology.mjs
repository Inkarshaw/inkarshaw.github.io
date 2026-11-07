// Tamil Nadu SCERT 2020 Class 9 Science Unit 23 Economic Biology.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,23);
assert.equal(index.meta.total_questions,2300);
assert.equal(index.meta.total_quiz_sets,115);
assert.deepEqual(index.units.filter(x=>x.ready).map(x=>x.id),Array.from({length:23},(_,i)=>i+1));
assert.equal(index.units.reduce((n,x)=>n+x.total,0),2300);
assert.equal(index.units.reduce((n,x)=>n+x.quiz_count,0),115);
for(const u of index.units.slice(23)){
  assert.equal(u.ready,false,'Pending Unit '+u.id);
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=index.units[22];
assert.equal(entry.id,23);assert.equal(entry.path,'unit-23.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,23);assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Tamil-Nadu-State-Board-Textbooks_Samacheer-Kalvi-Books_Class-9th_Science-chapter-23_-English-Medium.pdf'));
assert.match(doc.meta.source_review,/PDF screenshots independently inspected/);
assert.match(doc.meta.source_review,/2022/);assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/have not been independently compared/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const answers=[
  'Pomology','Olericulture','Floriculture','Vegetable forcing',
  'Green manuring','Rhizobium','Mycorrhiza','Azolla with Anabaena',
  'Cinchona','Spawn','Hydroponics','Aeroponics','Aquaponics','Sahiwal',
  'Kangayam','Polyculture','Pokkali culture','Vermicompost','Queen bee','Worker bee'
];
const idSet=new Set(),types=new Set(),english=new Set(),tamil=new Set(),pages=new Set(),keys=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U23-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!idSet.has(q.id));idSet.add(q.id);
  assert.ok(!types.has(q.type));types.add(q.type);
  assert.ok(!english.has(q.q_en));english.add(q.q_en);
  assert.ok(!tamil.has(q.q_ta));tamil.add(q.q_ta);
  assert.ok(q.q_en.length>=35&&q.q_en.endsWith('?'),'English stem '+q.id);
  assert.ok(q.q_ta.length>=22&&q.q_ta.endsWith('?'),'Tamil stem '+q.id);
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],answers[i],'Key mismatch '+q.id);
  assert.match(q.opts_ta[q.correct],/[\u0B80-\u0BFF]/);
  keys[q.correct]++;
  assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=30,'Short explanation '+q.id);
  const page=Number(q.page);
  assert.ok(page>=273&&page<=285,'Unreviewed page '+q.id);pages.add(page);
  assert.ok(quality.valid(q),'Player invalid '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
assert.ok(pages.size>=10,'Too few original topic references');
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Economic Biology: 20 original bilingual MCQs; 23/25 playable chapters, 2,300 questions, 115 quiz sets.');
