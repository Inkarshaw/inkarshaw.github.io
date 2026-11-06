// TN SCERT Class 9 Science Unit 13: Chemical Bonding, original English 2020 chapter.
// Verify all twenty bilingual items, keyed answers, honest source notes, and player.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalog=JSON.parse(read(root+'index.json'));
assert.equal(catalog.units.length,25);
assert.equal(catalog.meta.published_unit_count,14);
assert.equal(catalog.meta.total_questions,2120);
assert.equal(catalog.meta.total_quiz_sets,106);
assert.deepEqual(catalog.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:14},(_,i)=>i+1));
assert.equal(catalog.units.reduce((n,u)=>n+u.total,0),2120);
assert.equal(catalog.units.reduce((n,u)=>n+u.quiz_count,0),106);
for(const u of catalog.units.slice(14)){
 assert.equal(u.ready,false,'Unpublished Class 9 Science unit '+u.id);
 assert.equal(u.total,0);assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
 assert.ok(!existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)));
}
const entry=catalog.units[12];
assert.equal(entry.path,'unit-13.json');assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);assert.equal(doc.meta.unit,13);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter13-Chemical-Bonding.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/Tamil/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
// Explicit independent answer-key expectations prevent the test from only
// verifying that a question points to one of its four options.
const expectedKeys=[
 'It attains a stable outer shell like neon',
 'Its first and only shell is completely filled',
 'Six',
 'Chloride anion, Cl⁻',
 'Electrostatic attraction between Na⁺ and Cl⁻',
 "Two chloride ions balance one magnesium ion's +2 charge",
 'Its ions can move freely only when molten',
 'Strong electrostatic forces hold its ionic lattice together',
 'Two electrons',
 'They share one pair of electrons',
 'Two shared pairs',
 'N≡N',
 'Four',
 'Both electrons in the shared pair originate from one donor atom',
 'NH₃ (ammonia)',
 'Oxidation by loss of an electron',
 'Reduction',
 'Zinc loses electrons and acts as the reducing agent',
 '+6',
 '+6'
];
const ids=new Set(),topics=new Set(),en=new Set(),ta=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
 assert.equal(q.id,'C09SCI-U13-Q'+String(i+1).padStart(4,'0'));
 assert.equal(q.quiz,1);
 assert.ok(!ids.has(q.id));ids.add(q.id);
 assert.ok(!topics.has(q.type));topics.add(q.type);
 assert.ok(!en.has(q.q_en));en.add(q.q_en);
 assert.ok(!ta.has(q.q_ta));ta.add(q.q_ta);
 assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
 assert.ok(q.q_en.length>=28&&q.q_ta.length>=18);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(v=>v.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(v=>v.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.equal(q.opts_en[q.correct],expectedKeys[i],'Incorrect key for '+q.id);
 positions[q.correct]++;
 assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
 assert.ok(Number(q.page)>=148&&Number(q.page)<=161);
 assert.ok(quality.valid(q),'Player rejected '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical stem '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()));
console.log('Class 9 Science Chemical Bonding: all 20 bilingual MCQs playable and keyed; 14/25 units, 2,120 questions.');
