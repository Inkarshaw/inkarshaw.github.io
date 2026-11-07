// Tamil Nadu SCERT 2020 Class 9 Science Unit 25 LibreOffice Impress.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,25);
assert.equal(index.meta.total_questions,2340);
assert.equal(index.meta.total_quiz_sets,117);
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:25},(_,i)=>i+1));
assert.equal(index.units.filter(u=>!u.ready).length,0);
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2340);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),117);
const entry=index.units[24];
assert.equal(entry.id,25);assert.equal(entry.path,'unit-25.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,25);assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Computer');assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/HM9WO9WNfp8HDzXzHnSF.pdf'));
assert.match(doc.meta.source_review,/PDF screenshots checked/);
assert.match(doc.meta.source_review,/2022/);assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently compared/);
assert.match(doc.meta.source_review,/historic 2020 LibreOffice UI/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expected=[
  'LibreOffice Impress','A presentation',
  'File → New → Presentation → Blank Presentation',
  'Placeholders','One screen or page of the presentation',
  'Click inside the placeholder','Slide → New Slide','A slide layout',
  'Insert → Image','Text Box','Click and drag to draw the text box',
  'Insert → Audio or Video','Slide transition','Object animation',
  'Custom Animation','Slide → Delete Slide','Save','F5','Click the mouse','Open'
];
const ids=new Set(),types=new Set(),en=new Set(),ta=new Set(),pages=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U25-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!types.has(q.type));types.add(q.type);
  assert.ok(!en.has(q.q_en));en.add(q.q_en);
  assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
  assert.ok(q.q_en.length>=35&&q.q_en.endsWith('?'),'Short English stem '+q.id);
  assert.ok(q.q_ta.length>=22&&q.q_ta.endsWith('?'),'Short Tamil stem '+q.id);
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],expected[i],'Answer key mismatch '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=30,'Weak bilingual explanation '+q.id);
  const page=Number(q.page);
  assert.ok(page>=302&&page<=308,'Unreviewed source page '+q.id);
  pages.add(page);
  assert.ok(quality.valid(q),'Quiz player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.deepEqual(Array.from(pages).sort(),[302,303,304,305,306,307,308]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 LibreOffice Impress: 20 original bilingual MCQs; all 25 playable chapters, 2,340 MCQs in 117 sets.');
