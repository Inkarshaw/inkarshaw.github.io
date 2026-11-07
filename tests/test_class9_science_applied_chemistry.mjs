// Tamil Nadu SCERT 2020 Class 9 Science Unit 16, original Applied Chemistry.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalog=JSON.parse(read(root+'index.json'));
assert.equal(catalog.units.length,25);
assert.equal(catalog.meta.published_unit_count,24);
assert.equal(catalog.meta.total_questions,2320);
assert.equal(catalog.meta.total_quiz_sets,116);
assert.deepEqual(catalog.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:24},(_,i)=>i+1));
assert.equal(catalog.units.reduce((n,u)=>n+u.total,0),2320);
assert.equal(catalog.units.reduce((n,u)=>n+u.quiz_count,0),116);
for(const u of catalog.units.slice(24)){
  assert.equal(u.ready,false,'Pending chapter must not be playable: '+u.id);
  assert.equal(u.total,0);
  assert.equal(u.quiz_count,0);
  assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=catalog.units[15];
assert.equal(entry.path,'unit-16.json');
assert.equal(entry.total,20);
assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,16);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.questions.length,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter16-Applied-Chemistry.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently certified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expected=[
  "10⁻⁹ metre",
  "They provide a much larger surface area relative to their volume",
  "Catalysing chemical reactions",
  "Microorganisms",
  "Analgesic",
  "Reducing an elevated body temperature during fever",
  "Local anaesthesia",
  "Neutralising some excess stomach acid",
  "Chemical energy into electrical energy",
  "Electrical energy into chemical change",
  "Anode",
  "To allow ion movement and maintain charge balance",
  "Carbon-14",
  "Radioactive decay",
  "Mordant",
  "Vat dye",
  "How acidic or alkaline the soil is",
  "Nitrogen, phosphorus and potassium",
  "Preservative",
  "Amino acids from perspiration"
];
assert.equal(expected.length,20);
const ids=new Set(),topics=new Set(),en=new Set(),ta=new Set(),positions=[0,0,0,0];
const branches=new Set();
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U16-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id)); ids.add(q.id);
  assert.ok(!topics.has(q.type)); topics.add(q.type);
  assert.ok(!en.has(q.q_en)); en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta)); ta.add(q.q_ta);
  assert.ok(q.q_en.trim().endsWith('?')&&q.q_ta.trim().endsWith('?'));
  assert.ok(q.q_en.length>=32 && q.q_ta.length>=22);
  assert.equal(q.opts_en.length,4);
  assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(x=>x.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
  assert.equal(q.opts_en[q.correct],expected[i],'Wrong answer index '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=45 && q.exp_ta.length>=30,'Bilingual explanation too short');
  assert.ok(Number(q.page)>=185&&Number(q.page)<=195,'Chapter printed page out of bounds: '+q.id);
  branches.add(Number(q.page));
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.ok(branches.size>=9,'Cover multiple Applied Chemistry source sections');
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()),'Curation must preserve all original questions');
console.log('Class 9 Science Unit 16 Applied Chemistry: 20 keyed bilingual questions; 24/25 units and 2,320 questions.');
