// Tamil Nadu SCERT 2020 Class 9 Science Unit 17 Animal Kingdom starter bank.
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import vm from 'node:vm';
const read = p => readFileSync(new URL('../'+p, import.meta.url), 'utf8');
const root = 'data/textbook/class-9/science/';
const index = JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,18);
assert.equal(index.meta.total_questions,2200);
assert.equal(index.meta.total_quiz_sets,110);
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:18},(_,i)=>i+1));
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2200);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),110);
for(const u of index.units.slice(18)){
  assert.equal(u.ready,false,'Unpublished chapter must not have a live quiz: '+u.id);
  assert.equal(u.total,0);
  assert.equal(u.quiz_count,0);
  assert.ok(!u.path);
  assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=index.units[16];
assert.equal(entry.id,17);assert.equal(entry.total,20);
assert.equal(entry.quiz_count,1);assert.equal(entry.path,'unit-17.json');
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,17);
assert.equal(doc.meta.edition,2020);assert.equal(doc.meta.section,'Biology');
assert.equal(doc.meta.total_questions,20);assert.equal(doc.questions.length,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.match(doc.meta.source_en_url,/Science-chapter-17_-English-Medium\.pdf$/);
assert.match(doc.meta.source_review,/original SCERT|English original SCERT/);
assert.match(doc.meta.source_review,/not independently certified/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/2022/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const answers=[
  'Taxonomy','Genus name','Species','Hydra','Ectoderm and endoderm',
  'Pseudocoelom','Invertebrata (non-chordates)','Ostia (body pores)',
  'Cnidoblasts (stinging cells)','Flame cells',
  'Males and females are generally separate individuals','Metameres',
  'Chitin','Mantle','Echinodermata',
  'Hemichordata','Amphioxus','Shark','Aves','Mammary glands'
];
const ids=new Set(),topics=new Set(),stems=new Set(),tamil=new Set(),pages=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C09SCI-U17-Q'+String(i+1).padStart(4,'0'));
  assert.equal(q.quiz,1);
  assert.ok(!ids.has(q.id));ids.add(q.id);
  assert.ok(!topics.has(q.type));topics.add(q.type);
  assert.ok(!stems.has(q.q_en));stems.add(q.q_en);
  assert.ok(!tamil.has(q.q_ta));tamil.add(q.q_ta);
  assert.ok(q.q_en.length>=40 && q.q_en.endsWith('?'));
  assert.ok(q.q_ta.length>=25 && q.q_ta.endsWith('?'));
  assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.toLowerCase().trim())).size,4);
  assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
  assert.ok(Number.isInteger(q.correct) && q.correct>=0 && q.correct<=3);
  assert.equal(q.opts_en[q.correct],answers[i],'Incorrect keyed answer for '+q.id);
  positions[q.correct]++;
  assert.ok(q.exp_en.length>=55 && q.exp_ta.length>=35);
  const page=Number(q.page);
  assert.ok(page>=199 && page<=206,'Page outside reviewed source: '+q.id);
  pages.add(page);
  assert.ok(quality.valid(q),'Player quality rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Boilerplate question '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
assert.ok(pages.size>=8,'All reviewed textbook chapter topic ranges should be represented');
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 9 Animal Kingdom: 20 bilingual keyed MCQs; 18/25 playable units, 2,200 questions and 110 sets.');
