// Tamil Nadu SCERT 2020 Class 9 Science, Unit 20 Organ Systems in Animals.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const idx=JSON.parse(read(root+'index.json'));
assert.equal(idx.units.length,25);
assert.equal(idx.meta.published_unit_count,20);
assert.equal(idx.meta.total_questions,2240);
assert.equal(idx.meta.total_quiz_sets,112);
assert.deepEqual(idx.units.filter(x=>x.ready).map(x=>x.id),Array.from({length:20},(_,i)=>i+1));
assert.equal(idx.units.reduce((n,x)=>n+x.total,0),2240);
assert.equal(idx.units.reduce((n,x)=>n+x.quiz_count,0),112);
for(const u of idx.units.slice(20)){
  assert.equal(u.ready,false,'Pending Unit '+u.id);
  assert.equal(u.total,0);assert.equal(u.quiz_count,0);assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=idx.units[19];
assert.equal(entry.id,20);assert.equal(entry.path,'unit-20.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,20);assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.section,'Biology');assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);assert.equal(doc.questions.length,20);
assert.match(doc.meta.source_en_url,/Science-Chapter20-Plant-Physiology-human-digestive-system\.pdf$/);
assert.match(doc.meta.source_review,/source screenshots/);
assert.match(doc.meta.source_review,/2022/);assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently certified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const answers=[
  'An organ system','Ingestion','Ptyalin (salivary amylase)','Epiglottis',
  'Peristalsis','Pepsin','Gallbladder',
  'They break large fat droplets into smaller droplets',
  'Villi','Both exocrine and endocrine','Urinary bladder','Nephron',
  "Glomerulus inside Bowman's capsule",'Tubular reabsorption','Tubular secretion',
  'Skin','Sperm cells and testosterone',
  'To maintain a slightly lower temperature favourable for sperm production',
  'Ovary','Uterus'
];
assert.equal(answers.length,20);
const ids=new Set(),concepts=new Set(),stems=new Set(),tamilStems=new Set(),pages=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U20-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!concepts.has(q.type));concepts.add(q.type);
  assert.ok(!stems.has(q.q_en));stems.add(q.q_en);
  assert.ok(!tamilStems.has(q.q_ta));tamilStems.add(q.q_ta);
  assert.ok(q.q_en.length>=36&&q.q_en.endsWith('?'));
  assert.ok(q.q_ta.length>=20&&q.q_ta.endsWith('?'));
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.toLowerCase().trim())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
  assert.equal(q.opts_en[q.correct],answers[i],'Wrong keyed answer '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=55&&q.exp_ta.length>=30,'Short explanation '+q.id);
  assert.ok(Number(q.page)>=233&&Number(q.page)<=243,'Invalid textbook page '+q.id);
  pages.add(Number(q.page));
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate stem '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.ok(pages.size>=8);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Animal Organ Systems: 20 original bilingual MCQs, 20/25 playable units, 2,240 questions and 112 sets.');
