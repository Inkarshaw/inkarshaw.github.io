// Tamil Nadu SCERT 2020 Class 9 Science Unit 18 Organisation of Tissues.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,21);
assert.equal(index.meta.total_questions,2260);
assert.equal(index.meta.total_quiz_sets,113);
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:21},(_,i)=>i+1));
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2260);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),113);
for(const u of index.units.slice(21)){
  assert.equal(u.ready,false,'Unpublished Unit '+u.id);
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);
  assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const unit=index.units[17];
assert.equal(unit.id,18);assert.equal(unit.path,'unit-18.json');
assert.equal(unit.total,20);assert.equal(unit.quiz_count,1);
const doc=JSON.parse(read(root+unit.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,18);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.match(doc.meta.source_en_url,/Science-chapter-18_-English-Medium\.pdf$/);
assert.match(doc.meta.source_review,/original SCERT English chapter/);
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently certified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expected=[
  'A group of similar cells performing a particular function',
  'Meristematic tissue','Apical meristem','Lateral meristem','Aerenchyma',
  'Collenchyma','Sclerenchyma',
  'Conduct water and dissolved minerals from roots to upper parts',
  'Phloem','Xylem parenchyma','Simple squamous epithelium',
  'They sweep mucus and trapped particles along the passage',
  'Areolar tissue','Adipose tissue','Chondrocytes',
  'Tendon connecting muscle to bone','Ligament',
  'Cardiac muscle','Neuron','Meiosis'
];
const ids=new Set(),types=new Set(),english=new Set(),tamil=new Set(),pages=new Set(),keys=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U18-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!types.has(q.type));types.add(q.type);
  assert.ok(!english.has(q.q_en));english.add(q.q_en);
  assert.ok(!tamil.has(q.q_ta));tamil.add(q.q_ta);
  assert.ok(q.q_en.length>=35&&q.q_en.endsWith('?'));
  assert.ok(q.q_ta.length>=20&&q.q_ta.endsWith('?'));
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],expected[i],'Wrong answer '+q.id);
  keys[q.correct]++;
  assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=30,'Short explanation '+q.id);
  const page=Number(q.page);
  assert.ok(page>=210&&page<=220,'Printed page outside reviewed range '+q.id);
  pages.add(page);
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
assert.ok(pages.size>=10,'Insufficient range of source topic pages');
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Organisation of Tissues: 20 original bilingual MCQs; 21/25 units, 2,260 questions, 113 sets.');
