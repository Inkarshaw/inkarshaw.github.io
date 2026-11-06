// Class 9 TN SCERT (2020) Unit 11 Atomic Structure — bilingual starter checks.
// Guard counts, actual answer keys, player curation and provenance qualifications.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalog=JSON.parse(read(root+'index.json'));
const unit=catalog.units.find(u=>u.id===11);
assert.ok(unit?.ready&&unit.path==='unit-11.json');
assert.equal(unit.total,20);
assert.equal(unit.quiz_count,1);
assert.equal(catalog.meta.unit_count,25);
assert.equal(catalog.meta.published_unit_count,12);
assert.equal(catalog.meta.total_questions,2080);
assert.equal(catalog.meta.total_quiz_sets,104);
assert.equal(catalog.units.filter(u=>!u.ready).length,13);
for(const u of catalog.units.slice(12)){
 assert.equal(u.ready,false);
 assert.equal(u.total,0);
 assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
}
const doc=JSON.parse(read(root+unit.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,11);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.includes('/Junior-Secondary-Science-Chapter11-Atomic-Structure.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/Tamil/);
assert.match(doc.meta.source_review,/2026/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const ids=new Set(),concepts=new Set(),enStems=new Set(),taStems=new Set(),keys=[0,0,0,0];
const expectedKeys=[
 'Most of an atom consists of empty space',
 'An atom has a tiny, dense, positively charged nucleus',
 'Why atoms remain stable instead of electrons spiralling into the nucleus',
 'It does not continuously gain or lose energy while in that shell',
 'James Chadwick',
 'Neutrons have zero net electric charge',
 '17',
 '45',
 '32',
 '2, 8, 1',
 '2, 8, 8, 2',
 '3',
 'Its outer shell is already filled with eight electrons',
 'They are isotopes with different neutron numbers',
 'Isobars',
 'Both nuclei contain six neutrons',
 '1 : 2',
 '2 : 1 : 2',
 'Principal quantum number n',
 'The subshell and the shape of an orbital'
];
for(const [i,q] of doc.questions.entries()){
 assert.equal(q.id,'C09SCI-U11-Q'+String(i+1).padStart(4,'0'));
 assert.equal(q.quiz,1);
 assert.ok(!ids.has(q.id));ids.add(q.id);
 assert.ok(!concepts.has(q.type));concepts.add(q.type);
 assert.ok(!enStems.has(q.q_en));enStems.add(q.q_en);
 assert.ok(!taStems.has(q.q_ta));taStems.add(q.q_ta);
 assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
 assert.ok(q.q_en.trim().length>=28&&q.q_ta.trim().length>=18);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(s=>s.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.equal(q.opts_en[q.correct],expectedKeys[i],'Incorrect answer position '+q.id);
 keys[q.correct]++;
 assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
 assert.ok(+q.page>=125&&+q.page<=134,'Printed English chapter range '+q.id);
 assert.ok(quality.valid(q),'Invalid player question '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical English stem '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()),'Player preserves all question IDs');
console.log('Class 9 Atomic Structure: 20 bilingual original questions, verified answer indices; 12/25 units playable (2,080 MCQs).');
