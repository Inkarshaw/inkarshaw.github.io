// TN SCERT 2020 English Class 9 Science Unit 14 — Acids, Bases and Salts.
// Validate 20 original English–Tamil starter MCQs, actual keys, source caveats and catalogue honesty.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-9/science/';
const catalog=JSON.parse(read(root+'index.json'));
assert.equal(catalog.units.length,25);
assert.equal(catalog.meta.published_unit_count,25);
assert.equal(catalog.meta.total_questions,2340);
assert.equal(catalog.meta.total_quiz_sets,117);
assert.deepEqual(catalog.units.filter(u=>u.ready).map(u=>u.id),Array.from({length:25},(_,i)=>i+1));
assert.equal(catalog.units.reduce((n,u)=>n+u.total,0),2340);
assert.equal(catalog.units.reduce((n,u)=>n+u.quiz_count,0),117);
for(const u of catalog.units.slice(25)){
 assert.equal(u.ready,false,'Pending unit '+u.id);
 assert.equal(u.total,0);
 assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
 assert.equal(existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),false);
}
const entry=catalog.units[13];
assert.equal(entry.path,'unit-14.json');
assert.equal(entry.total,20);
assert.equal(entry.quiz_count,1);
const doc=JSON.parse(read(root+entry.path));
assert.equal(doc.meta.class,9);
assert.equal(doc.meta.unit,14);
assert.equal(doc.meta.edition,2020);
assert.equal(doc.meta.total_questions,20);
assert.equal(doc.meta.quiz_sets.length,1);
assert.equal(doc.questions.length,20);
assert.ok(doc.meta.source_en_url.endsWith('/Junior-Secondary-Science-Chapter14-Acid-Base-Salt.pdf'));
assert.ok(doc.meta.source_ta_url.endsWith('/science-tm.pdf'));
assert.match(doc.meta.source_review,/2022/);
assert.match(doc.meta.source_review,/2026/);
assert.match(doc.meta.source_review,/NOT verified/);
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
// Independent answer expectations, not derived from question.correct.
const expectedKeys=[
  "It produces hydronium ions in water",
  "Citric acid",
  "Only one of its hydrogen atoms is replaceable as H⁺",
  "Strength refers to extent of ionisation; concentration refers to amount dissolved",
  "Hydrogen",
  "Carbon dioxide",
  "It acts as a basic oxide and forms salt and water",
  "3 : 1",
  "Hydroxide, OH⁻",
  "It is a base that dissolves in water",
  "Diacidic base",
  "Blue to red",
  "Pink",
  "Basic",
  "Acidic",
  "Sodium chloride and water",
  "Acid salt",
  "Double salt",
  "They lose water of crystallisation",
  "Sodium hydrogen carbonate, NaHCO₃"
];
const ids=new Set(),concepts=new Set(),englishStems=new Set(),tamilStems=new Set(),positionCounts=[0,0,0,0];
for(const [i,q] of doc.questions.entries()){
 assert.equal(q.id,'C09SCI-U14-Q'+String(i+1).padStart(4,'0'));
 assert.equal(q.quiz,1);
 assert.ok(!ids.has(q.id));ids.add(q.id);
 assert.ok(!concepts.has(q.type));concepts.add(q.type);
 assert.ok(!englishStems.has(q.q_en));englishStems.add(q.q_en);
 assert.ok(!tamilStems.has(q.q_ta));tamilStems.add(q.q_ta);
 assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'));
 assert.ok(q.q_en.length>=27&&q.q_ta.length>=15);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(x=>x.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.equal(q.opts_en[q.correct],expectedKeys[i],'Incorrect answer key for '+q.id);
 positionCounts[q.correct]++;
 assert.ok(q.exp_en.length>=35&&q.exp_ta.length>=25);
 assert.ok(Number(q.page)>=162&&Number(q.page)<=171,'Out of chapter print page '+q.id);
 assert.ok(quality.valid(q),'Quiz-player invalid '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(positionCounts,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,20);
assert.equal(JSON.stringify(Array.from(curated,q=>q.id).sort()),JSON.stringify(doc.questions.map(q=>q.id).sort()));
console.log('Class 9 Science Unit 14: 20 original bilingual questions; 25/25 playable, 2,340 MCQs and 117 sets.');
