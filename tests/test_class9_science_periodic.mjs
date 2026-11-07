// Tamil Nadu Class 9 Science Unit 12 — Periodic Classification of Elements.
// Chapter-specific source and independently keyed bilingual student-player regression.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalog=JSON.parse(read(root+'index.json'));
const entry=catalog.units.find(u=>u.id===12);
assert.ok(entry?.ready&&entry.path==='unit-12.json');
assert.equal(entry.total,20);assert.equal(entry.quiz_count,1);
assert.equal(catalog.meta.published_unit_count,21);
assert.equal(catalog.meta.total_questions,2260);
assert.equal(catalog.meta.total_quiz_sets,113);
assert.equal(catalog.units.length,25);
assert.equal(catalog.units.filter(u=>!u.ready).length,4);
for(const u of catalog.units.slice(21)){
 assert.equal(u.ready,false,'Unpublished unit '+u.id);
 assert.equal(u.total,0);assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
}
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,12);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.includes('/Junior-Secondary-Science-Chapter12-Classification-elements.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/Tamil/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const answerKey=[
 '23.0',
 'Every eighth element resembled the first in properties',
 'Its pattern did not hold well beyond calcium',
 'Atomic mass',
 'Germanium',
 'Isotopes of the same element have different masses',
 'Henry Moseley',
 'Atomic number',
 '7',
 '18',
 'Third period',
 'Group 17',
 'Their outer electron shells are filled',
 'Groups 1 and 2',
 'Groups 3 to 12 in the central region',
 'Lanthanides and actinides',
 'It shares some properties with alkali metals and with halogens',
 'Boron',
 'Copper and zinc',
 'Amalgam'
];
const ids=new Set(),topics=new Set(),english=new Set(),tamil=new Set(),positions=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
 assert.equal(q.id,'C09SCI-U12-Q'+String(i+1).padStart(4,'0'));
 assert.equal(q.quiz,1);
 assert.ok(!ids.has(q.id));ids.add(q.id);
 assert.ok(!topics.has(q.type));topics.add(q.type);
 assert.ok(!english.has(q.q_en));english.add(q.q_en);
 assert.ok(!tamil.has(q.q_ta));tamil.add(q.q_ta);
 assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
 assert.ok(q.q_en.length>=25&&q.q_ta.length>=18);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(x=>x.toLowerCase().trim())).size,4);
 assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 positions[q.correct]++;
 assert.equal(q.opts_en[q.correct],answerKey[i],'Answer key mismatch for '+q.id);
 assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
 assert.ok(+q.page>=138&&+q.page<=147,'Chapter page outside range: '+q.id);
 assert.ok(quality.valid(q),'Not playable: '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical English question: '+q.id);
}
assert.deepEqual(positions,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()));
console.log('Class 9 Science Unit 12: 20 bilingual SCERT-source-aware starter MCQs valid; 21/25 chapters and 2,260 total questions.');
