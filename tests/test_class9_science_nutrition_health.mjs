// Original Tamil Nadu SCERT English Class 9 Science Unit 21, Nutrition and Health.
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
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:25},(_,i)=>i+1));
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2340);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),117);
for(const u of index.units.slice(25)){
  assert.equal(u.ready,false,'Unit '+u.id+' should remain pending');
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);
  assert.ok(!u.path,'Pending unit must have no player path');
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=index.units[20];
assert.equal(entry.id,21);
assert.equal(entry.path,'unit-21.json');
assert.equal(entry.total,20);
assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,21);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter21-Nutrition-Health.pdf'));
assert.match(doc.meta.source_review,/original|Original/);
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently matched/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expected=[
  'Carbohydrates',
  'The human body cannot synthesise them in sufficient amounts',
  'Vitamin D',
  'A, D, E and K',
  'Vitamin A deficiency',
  'Vitamin D',
  'Scurvy',
  'Vitamin K',
  'Beriberi',
  'Pellagra',
  'Iron',
  'Iodine',
  'Kwashiorkor',
  'Marasmus',
  'It removes moisture needed by many microorganisms',
  'Pasteurisation',
  'It draws water away by osmosis and restricts microbial growth',
  'Intentional food adulteration',
  'AGMARK',
  'Food Safety and Standards Authority of India (FSSAI)'
];
assert.equal(expected.length,20);
const ids=new Set(),concepts=new Set(),en=new Set(),ta=new Set(),pages=new Set(),keys=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U21-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!concepts.has(q.type));concepts.add(q.type);
  assert.ok(!en.has(q.q_en));en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
  assert.ok(q.q_en.length>=38 && q.q_en.endsWith('?'),'English stem '+q.id);
  assert.ok(q.q_ta.length>=25 && q.q_ta.endsWith('?'),'Tamil stem '+q.id);
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(v=>v.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(v=>v.trim())).size,4);
  assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<4);
  assert.equal(q.opts_en[q.correct],expected[i],'Wrong answer '+q.id);
  keys[q.correct]++;
  assert.ok(q.exp_en.length>=55 && q.exp_ta.length>=35,'Explanation length '+q.id);
  const page=Number(q.page);
  assert.ok(page>=247 && page<=253,'Unreviewed topic page '+q.id);
  pages.add(page);
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
assert.deepEqual(Array.from(pages).sort(),[247,248,249,250,251,252,253]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Nutrition and Health: 20 bilingual keyed MCQs; 25/25 playable, 2,340 questions and 117 sets.');
