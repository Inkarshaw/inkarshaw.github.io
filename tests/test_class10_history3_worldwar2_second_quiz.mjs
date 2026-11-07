// Class 10 Social Science History Unit 3 World War II: original bilingual Quiz 2.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const root='data/textbook/class-10/social-science/';
const idx=JSON.parse(read(root+'index.json')),doc=JSON.parse(read(root+'unit-3.json'));
assert.equal(idx.meta.published_unit_count,27);
assert.ok(idx.meta.total_questions>=660);
assert.ok(idx.meta.total_quiz_sets>=33);
assert.equal(idx.units.filter(u=>u.ready).length,27);
assert.equal(idx.units.reduce((n,u)=>n+u.total,0),idx.meta.total_questions);
assert.equal(idx.units.reduce((n,u)=>n+u.quiz_count,0),idx.meta.total_quiz_sets);
assert.equal(idx.units[2].total,40);assert.equal(idx.units[2].quiz_count,2);
assert.equal(doc.meta.unit,3);assert.equal(doc.meta.edition,2022);
assert.equal(doc.meta.total_questions,40);
assert.equal(doc.meta.quiz_sets.length,2);
assert.equal(doc.questions.length,40);
assert.match(doc.meta.source_text_review,/original English Social Science History Unit 3/);
assert.match(doc.meta.source_text_review,/printed pages 27–35/);
assert.match(doc.meta.source_text_review,/Screenshots were attempted but refused/);
assert.match(doc.meta.editorial_status,/2026–27/);
const expected=[
 'It had to disarm and retain only a restricted armed force',
 'An isolationist approach prevailed in the United States',
 'Haile Selassie','Rhineland','Sudetenland','Soviet Union',
 'Dependence on sea-borne imports of food and materials',
 'Dunkirk','Radar','Volga River','Caucasus oilfields',
 'Supply arms and essential materials to countries resisting Axis aggression',
 'Bernard Montgomery','1943','British and Indian armies','Ghettos',
 '10 December','Atlantic Charter','Five permanent members',
 'Economic and Social Council (ECOSOC)'
];
const base=doc.questions.filter(q=>q.quiz===1),quiz2=doc.questions.filter(q=>q.quiz===2);
assert.equal(base.length,20);
assert.equal(quiz2.length,20);
const answerPositions=[0,0,0,0],types=new Set(),stems=new Set(doc.questions.slice(0,20).map(q=>q.q_en.toLowerCase()));
const context=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),context);
const quality=context.window.TextbookQuality;
for(const [i,q] of quiz2.entries()){
 assert.equal(q.id,'C10SSU3-Q'+String(i+21).padStart(3,'0'));
 assert.ok(q.q_en.endsWith('?')&&q.q_en.length>=35,'English stem '+q.id);
 assert.ok(q.q_ta.endsWith('?')&&q.q_ta.length>=20,'Tamil stem '+q.id);
 assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
 assert.ok(!types.has(q.type),'Repeated concept '+q.type);types.add(q.type);
 assert.ok(!stems.has(q.q_en.toLowerCase()),'Duplicated question '+q.id);stems.add(q.q_en.toLowerCase());
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(x=>x.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
 assert.equal(q.opts_en[q.correct],expected[i],'Answer key error '+q.id);
 answerPositions[q.correct]++;
 assert.ok(q.exp_en.length>=54&&q.exp_ta.length>=30,'Explanation too short '+q.id);
 assert.ok(Number.isInteger(q.page_en)&&q.page_en>=27&&q.page_en<=35,'Original SCERT topic page out of range');
 assert.ok(quality.valid(q),'Player rejects question '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Generic stem '+q.id);
}
assert.deepEqual(answerPositions,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,40);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 10 World War II Quiz 2: 20 keyed bilingual questions, Social Science totals reconcile.');
