// Original SCERT English (2020), Class 9 Science, Unit 19 Plant Physiology.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalogue=JSON.parse(read(root+'index.json'));
assert.equal(catalogue.units.length,25);
assert.equal(catalogue.meta.published_unit_count,19);
assert.equal(catalogue.meta.total_questions,2220);
assert.equal(catalogue.meta.total_quiz_sets,111);
assert.deepEqual(catalogue.units.filter(x=>x.ready).map(x=>x.id),Array.from({length:19},(_,i)=>i+1));
assert.equal(catalogue.units.reduce((n,x)=>n+x.total,0),2220);
assert.equal(catalogue.units.reduce((n,x)=>n+x.quiz_count,0),111);
for(const u of catalogue.units.slice(19)){
  assert.equal(u.ready,false,'Pending Unit '+u.id);
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=catalogue.units[18];
assert.equal(entry.id,19);assert.equal(entry.path,'unit-19.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,19);assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('Junior-Secondary-Science-Chapter19-Plant-Physiology.pdf'));
assert.match(doc.meta.source_review,/source-page screenshots/);
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently certified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expected=[
  'Positive phototropism','Gravity','Hydrotropism','Thigmotropism',
  'Chemotropism','Negative phototropism',
  'The response is not determined by the direction of the stimulus',
  'Thigmonasty','Photonasty','Thermonasty',
  'Tropic response is directional, whereas nastic response is non-directional',
  'Light energy to chemical energy','Chlorophyll',
  'The tested area turns blue-black',
  'Light cannot reach that patch to support photosynthesis',
  'Chlorophyll, water, carbon dioxide and sunlight',
  'Transpiration','Guard cells','Cuticular transpiration','Lenticels'
];
assert.equal(expected.length,20);
const ids=new Set(),topics=new Set(),en=new Set(),ta=new Set(),pages=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U19-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!topics.has(q.type));topics.add(q.type);
  assert.ok(!en.has(q.q_en));en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
  assert.ok(q.q_en.length>=36&&q.q_en.endsWith('?'));
  assert.ok(q.q_ta.length>=22&&q.q_ta.endsWith('?'));
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.toLowerCase().trim())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],expected[i],'Wrong answer for '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=60&&q.exp_ta.length>=30,'Explanation insufficient '+q.id);
  assert.ok(Number(q.page)>=226&&Number(q.page)<=229);
  pages.add(Number(q.page));
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.deepEqual(Array.from(pages).sort(),[226,227,228,229]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Plant Physiology: 20 original bilingual MCQs; 19/25 playable units, 2,220 questions in 111 sets.');
