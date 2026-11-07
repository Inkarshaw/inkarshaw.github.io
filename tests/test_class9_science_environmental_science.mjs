// TN SCERT 2020 Class 9 Science Unit 24 Environmental Science.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,25);
assert.equal(index.meta.total_questions,2340);
assert.equal(index.meta.total_quiz_sets,117);
assert.deepEqual(index.units.filter(x=>x.ready).map(x=>x.id),Array.from({length:25},(_,i)=>i+1));
assert.equal(index.units.reduce((n,x)=>n+x.total,0),2340);
assert.equal(index.units.reduce((n,x)=>n+x.quiz_count,0),117);
for(const u of index.units.slice(25)){
  assert.equal(u.id,25);assert.equal(u.ready,false);
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);
  assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=index.units[23];
assert.equal(entry.id,24);assert.equal(entry.path,'unit-24.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,24);assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter24-Environmental-science.pdf'));
assert.match(doc.meta.source_review,/source PDF screenshots checked/);
assert.match(doc.meta.source_review,/2022/);assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not yet independently aligned/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const answers=[
  'Biogeochemical cycles','Infiltration','Condensation','Transpiration',
  'Rhizobium','Ammonification','Nitrification','Denitrification',
  'Photosynthesis','Carbon dioxide','Air chambers in the petiole',
  'Reduced water loss through transpiration','Mesophytes','Echolocation',
  'Hibernation','Setae','Aestivation','Drip irrigation','Primary treatment','IUCN'
];
const ids=new Set(),concepts=new Set(),en=new Set(),ta=new Set(),pages=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U24-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!concepts.has(q.type));concepts.add(q.type);
  assert.ok(!en.has(q.q_en));en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
  assert.ok(q.q_en.length>=35&&q.q_en.endsWith('?'),'English stem '+q.id);
  assert.ok(q.q_ta.length>=20&&q.q_ta.endsWith('?'),'Tamil stem '+q.id);
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(x=>x.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],answers[i],'Incorrect key '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=30,'Weak explanation '+q.id);
  const page=Number(q.page);
  assert.ok(page>=290&&page<=298,'Incorrect source topic page '+q.id);pages.add(page);
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.deepEqual(Array.from(pages).sort(),[290,291,292,293,294,295,296,297,298]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Environmental Science: 20 original bilingual MCQs; 25/25 playable chapters, 2,340 questions, 117 sets.');
