// The 2020 English Tamil Nadu SCERT Class 9 Science contents lists 25 units.
// This test enforces honest pending status and quality of the original Unit 9 starter.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
const starts=[1,14,26,39,52,66,80,91,102,113,125,138,148,162,172,185,199,210,226,233,247,258,273,290,302];
assert.equal(index.meta.unit_count,25);
assert.equal(index.units.length,25);
assert.deepEqual(index.units.map(u=>u.id),Array.from({length:25},(_,i)=>i+1));
assert.deepEqual(index.units.slice(8).map(u=>u.chapter_page_en),starts.slice(8));
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:10},(_,i)=>i+1));
assert.equal(index.meta.published_unit_count,10);
assert.equal(index.meta.total_questions,2040);
assert.equal(index.meta.total_quiz_sets,102);
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2040);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),102);
assert.ok(/2020/.test(index.meta.source_edition_note));
assert.ok(/2026/.test(index.meta.source_edition_note));
assert.ok(/Tamil/.test(index.meta.editorial_status));
for(const u of index.units.slice(10)){
  assert.equal(u.ready,false,'Do not falsely publish unit '+u.id);
  assert.equal(u.total,0);
  assert.equal(u.quiz_count,0);
  assert.ok(!u.path,'Pending units must have no playable path');
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=index.units[8];
assert.equal(entry.path,'unit-9.json');
assert.equal(entry.total,20);
assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.unit,9);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.questions.length,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.ok(/2026/.test(doc.meta.editorial_status));
const qualityCtx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),qualityCtx);
const quality=qualityCtx.window.TextbookQuality;
const ids=new Set(),types=new Set(),en=new Set(),ta=new Set(),counts=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U09-Q'+String(i+1).padStart(4,'0'));
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!types.has(q.type));types.add(q.type);
  assert.equal(q.quiz,1);
  assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en).size,4);assert.equal(new Set(q.opts_ta).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
  counts[q.correct]++;
  assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
  assert.ok(+q.page>=102&&+q.page<=112);
  assert.ok(quality.valid(q),'Player validation '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical stem '+q.id);
  assert.ok(!en.has(q.q_en));en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
}
assert.deepEqual(counts,[5,5,5,5]);
assert.equal(quality.curate(doc.questions).questions.length,20);
console.log('Class 9 Science: 25 indexed, 10 playable, 15 explicitly pending; Unit 9 Universe and Unit 10 Matter Around Us starters.');
