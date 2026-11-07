// Class 10 Social Science History Unit 4: second bilingual postwar-history quiz.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-10/social-science/';
const index=JSON.parse(read(root+'index.json'));
const doc=JSON.parse(read(root+'unit-4.json'));
assert.equal(index.meta.published_unit_count,27);
assert.equal(index.meta.total_questions,660);
assert.equal(index.meta.total_quiz_sets,33);
assert.equal(index.units.filter(u=>u.ready).length,27);
assert.equal(index.units.reduce((n,u)=>n+u.total,0),660);
assert.equal(index.units.reduce((n,u)=>n+u.quiz_count,0),33);
assert.equal(index.units[3].id,4);
assert.equal(index.units[3].total,40);
assert.equal(index.units[3].quiz_count,2);
assert.equal(doc.meta.unit,4);
assert.equal(doc.meta.edition,2022);
assert.equal(doc.meta.total_questions,40);
assert.equal(doc.meta.quiz_sets.length,2);
assert.equal(doc.questions.length,40);
assert.match(doc.meta.source_review,/SCERT original English Social Science 2020 Unit 4/);
assert.match(doc.meta.source_review,/pages 41–49/);
assert.match(doc.meta.source_review,/screenshot/i);
assert.match(doc.meta.editorial_status,/2026–27/);
const expected=[
 'Sun Yat-sen',"Nationalism, democracy and people's livelihood",
 'The Kuomintang was strongly established in the towns',
 'Landlords and capitalists','United States','George C. Marshall',
 'Greece and Turkey','Manila Pact',
 'SEATO had no joint command with standing forces','1991','Bandung',
 "Do not permit a superpower's military base on national territory",
 'Baghdad Pact','Kim Il-sung','Jawaharlal Nehru','Yasser Arafat',
 'Egypt and Syria','Temporary division into northern and southern zones',
 '1987','1961'
];
const old=doc.questions.slice(0,20),news=doc.questions.slice(20);
assert.ok(old.every(q=>q.quiz===1));
assert.ok(news.every(q=>q.quiz===2));
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const keys=[0,0,0,0],concepts=new Set(),oldStems=new Set(old.map(q=>q.q_en.toLowerCase()));
for(const [i,q] of news.entries()){
 assert.equal(q.id,'C10SSU4-Q'+String(i+21).padStart(3,'0'));
 assert.equal(q.quiz,2);
 assert.ok(q.q_en.length>=32&&q.q_en.endsWith('?'),'English question '+q.id);
 assert.ok(q.q_ta.length>=20&&q.q_ta.endsWith('?'),'Tamil question '+q.id);
 assert.match(q.q_ta,/[\u0B80-\u0BFF]/);
 assert.ok(!oldStems.has(q.q_en.toLowerCase()));
 assert.ok(!concepts.has(q.type));concepts.add(q.type);
 assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
 assert.equal(new Set(q.opts_en.map(x=>x.trim().toLowerCase())).size,4);
 assert.equal(new Set(q.opts_ta.map(x=>x.trim())).size,4);
 assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<=3);
 assert.equal(q.opts_en[q.correct],expected[i],'Wrong keyed answer '+q.id);
 keys[q.correct]++;
 assert.ok(q.exp_en.length>=50&&q.exp_ta.length>=25,'Missing explanation '+q.id);
 assert.ok(Number.isInteger(q.page_en)&&q.page_en>=40&&q.page_en<=52,'Source chapter range '+q.id);
 assert.ok(quality.valid(q),'Question rejected by player '+q.id);
 assert.ok(!quality.isBoilerplate(q.q_en),'Generic question '+q.id);
}
assert.deepEqual(keys,[5,5,5,5]);
const curated=quality.curate(doc.questions).questions;
assert.equal(curated.length,40);
assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
console.log('Class 10 postwar History Unit 4 Quiz 2: 20 bilingual source-reviewed questions; 660 total MCQs in 33 sets.');
