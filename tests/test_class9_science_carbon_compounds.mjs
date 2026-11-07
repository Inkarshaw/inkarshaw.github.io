// Original Class 9 TN SCERT Science (2020 English), Unit 15 Carbon and its Compounds.
// Enforce bilingual quiz quality, answer keys, source notes and pending-chapter honesty.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const index=JSON.parse(read(root+'index.json'));
assert.equal(index.units.length,25);
assert.equal(index.meta.published_unit_count,22);
assert.equal(index.meta.total_questions,2280);
assert.equal(index.meta.total_quiz_sets,114);
assert.deepEqual(index.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:22},(_,i)=>i+1));
assert.equal(index.units.reduce((n,u)=>n+u.total,0),2280);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),114);
for(const u of index.units.slice(22)){
 assert.equal(u.ready,false,'Pending chapter '+u.id);
 assert.equal(u.total,0);
 assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
 assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const chapter=index.units[14];
assert.equal(chapter.path,'unit-15.json');
assert.equal(chapter.total,20);assert.equal(chapter.quiz_count,1);
const doc=JSON.parse(read(root+chapter.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,15);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter15-Carbon.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/not independently certified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const expectedKeys=[
  "Diamond is a form of the element carbon",
  "Four",
  "Catenation",
  "Straight chains, branched chains and rings",
  "Alkanes",
  "Alkene",
  "Alkyne",
  "Structural isomers",
  "Allotropy",
  "Each carbon bonds covalently to four neighbouring carbon atoms in a three-dimensional network",
  "Three",
  "Graphite has mobile delocalised electrons within its carbon layers",
  "60",
  "A single-atom-thick sheet of carbon atoms in a hexagonal lattice",
  "Carbon monoxide, CO",
  "Carbon dioxide, CO₂",
  "Carbon monoxide and hydrogen",
  "Carbon dioxide, CO₂",
  "Polypropylene (PP)",
  "The code identifies the polymer, while actual recycling depends on facilities and collection"
];
const ids=new Set(),types=new Set(),en=new Set(),ta=new Set(),keys=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
 assert.equal(q.id,'C09SCI-U15-Q'+String(i+1).padStart(4,'0'));
 assert.equal(q.quiz,1);
 assert.ok(!ids.has(q.id));ids.add(q.id);
 assert.ok(!types.has(q.type));types.add(q.type);
 assert.ok(!en.has(q.q_en));en.add(q.q_en);
 assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
 assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
 assert.ok(q.q_en.length>=25&&q.q_ta.length>=15);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.equal(q.opts_en[q.correct],expectedKeys[i],'Wrong answer key '+q.id);
 keys[q.correct]++;
 assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
 assert.ok(Number(q.page)>=172&&Number(q.page)<=184);
 assert.ok(quality.valid(q),'Quiz player rejected '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()));
console.log('Class 9 Carbon and its Compounds: 20 original bilingual MCQs, 22/25 playable, 2,280 questions and 114 sets.');
