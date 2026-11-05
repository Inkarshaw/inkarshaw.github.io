// Class 8 Social Science Term II: source-aware bilingual starter quizzes and honest catalog.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-8/social-science/term-2/';
const index=JSON.parse(read(root+'index.json'));
const expected=[86,98,108,118,129,136,145];
const expectedTamil=[98,112,124,136,148,156,167];
assert.equal(index.meta.class,8);
assert.equal(index.meta.term,2);
assert.equal(index.units.length,7);
assert.deepEqual(index.units.map(u=>u.chapter_page_en),expected);
assert.deepEqual(index.units.map(u=>u.chapter_page_ta),expectedTamil);
assert.equal(index.meta.total_questions,40);
assert.equal(index.meta.total_quiz_sets,2);
const ready=index.units.filter(u=>u.ready);
assert.deepEqual(ready.map(u=>u.id),[1,5]);
const pending=index.units.filter(u=>!u.ready);
assert.equal(pending.length,5);
for(const u of pending){
 assert.equal(u.total,0);
 assert.equal(u.quiz_count,0);
 assert.ok(!u.path);
 assert.ok(!existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)));
}
const qualityContext=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),qualityContext);
const quality=qualityContext.window.TextbookQuality;
const bookEnglish='https://cdn1.byjus.com/wp-content/uploads/2020/01/Samacheer-Kalvi-Class-8-Social-Science_Term_IIEM.pdf';
const bookTamil='https://cdn1.byjus.com/wp-content/uploads/2022/08/TN-Board-Class-8-Social-Science-Textbook-Term-2-Tamil.pdf';
const seenIds=new Set();
for(const u of ready){
 const d=JSON.parse(read(root+u.path));
 assert.equal(d.meta.unit,u.id);
 assert.equal(d.meta.edition,2019);
 assert.equal(d.meta.source_en_url,bookEnglish);
 assert.equal(d.meta.source_ta_url,bookTamil);
 assert.equal(d.meta.quiz_sets.length,1);
 assert.equal(d.meta.total_questions,20);
 assert.equal(d.questions.length,20);
 const answerPositions=new Set();
 for(const [i,q] of d.questions.entries()){
  assert.equal(q.id,'C8SS2U'+u.id+'-Q'+String(i+1).padStart(3,'0'));
  assert.ok(!seenIds.has(q.id),'No duplicate question ID');
  seenIds.add(q.id);
  assert.equal(q.quiz,1);
  assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),'Bilingual question: '+q.id);
  assert.ok(q.q_en.trim().length>18&&q.q_ta.trim().length>10);
  assert.equal(q.opts_en.length,4);
  assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(x=>x.toLowerCase())).size,4);
  assert.equal(new Set(q.opts_ta.map(x=>x.toLowerCase())).size,4);
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4);
  answerPositions.add(q.correct);
  assert.ok(q.exp_en.trim().length>=25&&q.exp_ta.trim().length>=15);
  const lo=u.id===1?86:129,hi=u.id===1?97:135;
  const taLo=u.id===1?98:148,taHi=u.id===1?111:155;
  assert.ok(q.page_en>=lo&&q.page_en<=hi,'English page scope '+q.id);
  assert.ok(q.page_ta>=taLo&&q.page_ta<=taHi,'Tamil page scope '+q.id);
  assert.ok(quality.valid(q),'Player rejects '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Templated stem '+q.id);
 }
 assert.ok(answerPositions.size>=3,'Answer positions should be varied');
 const playable=quality.curate(d.questions).questions;
 assert.equal(playable.length,20,'All 20 questions must survive live curation');
 assert.deepEqual(Array.from(playable,q=>q.id).sort(),d.questions.map(q=>q.id).sort());
}
const catalog=read('textbook-quiz.html');
const player=read('textbook-play.html');
assert.ok(catalog.includes("'data/textbook/class-'+cls+'/'+subject+termSegment+'/index.json'"));
assert.ok(catalog.includes('if(!u.ready)'));
assert.ok(catalog.includes('u.quiz_count'));
assert.ok(player.includes("'data/textbook/class-'+classNo+'/'+subject+'/term-'+term+'/unit-'+unit+'.json'"));
console.log('Class 8 Term II Social Science: seven sourced chapter titles, 40 playable bilingual MCQs, five honest pending chapters.');
