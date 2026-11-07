// Independent regression for Class 10 Social Science History Unit 2 Quiz 2.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-10/social-science/';
const index=JSON.parse(read(root+'index.json'));
const doc=JSON.parse(read(root+'unit-2.json'));
assert.equal(index.meta.unit_count,27);
assert.equal(index.meta.published_unit_count,27);
assert.ok(index.meta.total_questions>=660);
assert.ok(index.meta.total_quiz_sets>=33);
assert.equal(index.units[1].id,2);
assert.equal(index.units[1].total,40);
assert.equal(index.units[1].quiz_count,2);
assert.equal(index.units.reduce((sum,u)=>sum+u.total,0),index.meta.total_questions);
assert.equal(index.units.reduce((sum,u)=>sum+u.quiz_count,0),index.meta.total_quiz_sets);
assert.equal(doc.meta.unit,2);assert.equal(doc.meta.edition,2022);
assert.equal(doc.meta.total_questions,40);
assert.equal(doc.meta.quiz_sets.length,2);
assert.equal(doc.questions.length,40);
assert.match(doc.meta.source_text_review,/2022/);
assert.match(doc.meta.source_text_review,/printed pp.16–26/);
assert.match(doc.meta.editorial_status,/2026–27/);
const expected=[
 'Gold','Protectionism','They contracted international credit','Vatican City',
 'Giacomo Matteotti','Mein Kampf','Joseph Goebbels','Gestapo',
 'Parliamentary democracy','1927','White Terror','Viet Minh',
 'Dutch settlers','1910','Division into European spheres of influence',
 'Hernán Cortés','Francisco Pizarro','Toussaint Louverture',
 'Simón Bolívar','Franklin D. Roosevelt'
];
const original=doc.questions.slice(0,20);
const review=doc.questions.slice(20);
assert.equal(original.length,20);assert.equal(review.length,20);
assert.ok(original.every(q=>q.quiz===1));
assert.ok(review.every(q=>q.quiz===2));
const keys=[0,0,0,0],unique=new Set(),stems=new Set(original.map(q=>q.q_en.toLowerCase()));
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
for(const [i,q] of review.entries()){
  assert.equal(q.id,'C10SSU2-Q'+String(i+21).padStart(3,'0'));
  assert.ok(!unique.has(q.id));unique.add(q.id);
  assert.equal(q.quiz,2);
  assert.ok(q.q_en.endsWith('?')&&q.q_en.length>=30);
  assert.ok(q.q_ta.endsWith('?')&&q.q_ta.length>=20);
  assert.ok(!stems.has(q.q_en.toLowerCase()),'Duplicated first-quiz question');
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(x=>x.toLowerCase().trim())).size,4);
  assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
  assert.equal(q.opts_en[q.correct],expected[i],'Incorrect keyed answer '+q.id);
  assert.ok(q.opts_ta[q.correct].trim().length>=3);
  keys[q.correct]++;
  assert.ok(Number.isInteger(q.page_en)&&q.page_en>=16&&q.page_en<=26);
  assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=28);
  assert.ok(quality.valid(q),'Player rejected '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,40);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 10 History 2 Quiz 2: 20 keyed bilingual MCQs; reconciled catalogue totals and intact player navigation.');
