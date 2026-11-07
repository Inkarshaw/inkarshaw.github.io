// Class 10 Social Science: 2022 SCERT source-aware catalogue and bilingual starter QA.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const root='data/textbook/class-10/social-science/';
const index=JSON.parse(read(root+'index.json'));
const starts=[1,16,27,40,53,63,75,89,105,115,129,144,154,170,186,200,219,239,248,259,269,278,292,303,311,321,328];
const source='https://www.srivenkateshwaraopenschool.com/wp-content/uploads/2023/11/10th_Social-Science-EM-www.tntextbooks.in_compressed.pdf';
const expectedReady=Array.from({length:27},(_,i)=>i+1);
const ranges={1:[1,15],2:[16,26],3:[27,39],4:[40,52],5:[53,62],6:[63,74],7:[75,88],8:[89,104],9:[105,114],10:[115,128],11:[129,143],12:[144,153],13:[154,169],14:[170,185],15:[186,199],16:[200,218],17:[219,238],18:[239,247],19:[248,258],20:[259,268],21:[269,277],22:[278,291],23:[292,302],24:[303,310],25:[311,320],26:[321,327],27:[328,338]};
assert.equal(index.meta.class,10);
assert.equal(index.meta.subject,'Social Science');
assert.equal(index.meta.edition,2022);
assert.equal(index.meta.unit_count,27);
assert.equal(index.units.length,27);
assert.equal(index.meta.source_en_url,source);
assert.deepEqual(index.units.map(u=>u.id),Array.from({length:27},(_,i)=>i+1));
assert.deepEqual(index.units.map(u=>u.chapter_page_en),starts);
assert.deepEqual(['History','Geography','Civics','Economics'].map(s=>index.units.filter(u=>u.section_en===s).length),[10,7,5,5]);
assert.equal(index.meta.published_unit_count,27);
assert.ok(index.meta.total_questions>=640,'Retain all 640 reviewed starter and expanded MCQs');
assert.ok(index.meta.total_quiz_sets>=32,'Retain all 32 reviewed chapter quiz sets');
assert.equal(index.meta.total_questions,index.units.reduce((n,u)=>n+u.total,0),'Catalogue question totals must match units');
assert.equal(index.meta.total_quiz_sets,index.units.reduce((n,u)=>n+u.quiz_count,0),'Catalogue quiz totals must match units');
assert.ok(/2026|prescribed|current/i.test(index.meta.editorial_status));
const ready=index.units.filter(u=>u.ready);
const pending=index.units.filter(u=>!u.ready);
assert.deepEqual(ready.map(u=>u.id),expectedReady);
assert.equal(pending.length,0);
for(const u of pending){
 assert.equal(u.total,0,'pending unit '+u.id+' total');
 assert.equal(u.quiz_count,0,'pending unit '+u.id+' quiz_count');
 assert.ok(!u.path,'pending chapter must not have fake quiz path '+u.id);
 assert.ok(!existsSync(new URL('../'+root+'unit-'+u.id+'.json',import.meta.url)),'Unexpected unreviewed bank '+u.id);
}
const ctx=vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'),ctx);
const quality=ctx.window.TextbookQuality;
const allIds=new Set();
const normalizedEnglishStems=new Map();
const normalizedTamilStems=new Map();
for(const u of ready){
 assert.ok(u.total>=20&&u.total%20===0,'Every published chapter must have complete 20-question sets');
 assert.equal(u.quiz_count,u.total/20,'Quiz count must reflect actual chapter size');
 if([2,3,18,19,20].includes(u.id))assert.ok(u.quiz_count>=2,'Retain reviewed second quiz for chapter '+u.id);
 assert.equal(u.path,'unit-'+u.id+'.json');
 const doc=JSON.parse(read(root+u.path));
 assert.equal(doc.meta.class,10);
 assert.equal(doc.meta.unit,u.id);
 assert.equal(doc.meta.edition,2022);
 assert.equal(doc.meta.subject,'Social Science');
 assert.equal(doc.meta.source_en_url,source);
 assert.equal(doc.meta.total_questions,u.total);
 assert.equal(doc.meta.quiz_sets.length,u.quiz_count);
 assert.equal(doc.questions.length,u.total);
 assert.ok(/2026|prescribed|current/i.test(doc.meta.editorial_status));
 const positions=new Set();
 for(const [i,q] of doc.questions.entries()){
  assert.equal(q.id,'C10SSU'+u.id+'-Q'+String(i+1).padStart(3,'0'));
  assert.ok(!allIds.has(q.id),'Duplicate ID '+q.id);
  allIds.add(q.id);
  // Catch copy-pasted questions across separate chapter banks; punctuation and whitespace
  // differences should not conceal the same stem. This checks text identity, not facts.
  for(const [label,stem,seen] of [
   ['English',q.q_en,normalizedEnglishStems],
   ['Tamil',q.q_ta,normalizedTamilStems],
  ]){
   const normalized=stem.normalize('NFKC').toLowerCase().replace(/[\p{P}\p{S}\s]+/gu,' ').trim();
   assert.ok(normalized.length>=8,q.id+' '+label+' normalized stem too short');
   assert.ok(!seen.has(normalized),q.id+' duplicates '+label+' stem from '+seen.get(normalized));
   seen.set(normalized,q.id);
  }
  assert.equal(q.quiz,Math.floor(i/20)+1);
  assert.ok(q.q_en.endsWith('?')&&q.q_ta.endsWith('?'),q.id+' bilingual question');
  assert.ok(q.q_en.trim().length>=22&&q.q_ta.trim().length>=10,q.id+' meaningful stems');
  assert.equal(q.opts_en.length,4);assert.equal(q.opts_ta.length,4);
  assert.equal(new Set(q.opts_en.map(s=>s.trim().toLowerCase())).size,4,q.id+' English choices');
  assert.equal(new Set(q.opts_ta.map(s=>s.trim().toLowerCase())).size,4,q.id+' Tamil choices');
  assert.ok(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,q.id+' answer key');
  positions.add(q.correct);
  assert.ok(q.exp_en.length>=30&&q.exp_ta.length>=15,q.id+' bilingual explanation');
  assert.ok(q.page_en>=ranges[u.id][0]&&q.page_en<=ranges[u.id][1],q.id+' printed English page range');
  assert.ok(quality.valid(q),'Player invalid '+q.id);
  assert.ok(!quality.isBoilerplate(q.q_en),'Mechanical stem '+q.id);
 }
 assert.ok(positions.size>=3,'Answer distribution in unit '+u.id);
 for(let quiz=1;quiz<=u.quiz_count;quiz++){
  const group=doc.questions.filter(q=>q.quiz===quiz);
  assert.equal(group.length,20,'Each published quiz must contain 20 questions: chapter '+u.id+', quiz '+quiz);
  assert.ok(new Set(group.map(q=>q.correct)).size>=3,'Balance keyed answers per quiz: '+u.id+'/'+quiz);
 }
 const curated=quality.curate(doc.questions).questions;
 assert.equal(curated.length,u.total,'Player should retain all questions in unit '+u.id);
 assert.deepEqual(Array.from(curated,q=>q.id).sort(),doc.questions.map(q=>q.id).sort());
}
assert.equal(allIds.size,index.meta.total_questions);
const catalog=read('textbook-quiz.html');
const player=read('textbook-play.html');
assert.ok(catalog.includes("'data/textbook/class-'+cls+'/'+subject+termSegment+'/index.json'"));
assert.ok(catalog.includes('if(!u.ready)'));
assert.ok(catalog.includes('All 27 Class 10 Social Science chapters are indexed and have playable English–Tamil'));
assert.ok(catalog.includes('No chapters remain without a playable starter quiz'));
assert.ok(player.includes("'data/textbook/class-'+classNo+'/'+subject+'/term-'+term+'/unit-'+unit+'.json'")||player.includes("'data/textbook/class-'+classNo+'/'+subject+'/unit-'+unit+'.json'"));
console.log('Class 10 Social Science: 27 indexed chapters, '+index.meta.total_questions+' bilingual MCQs in '+index.meta.total_quiz_sets+' playable quiz sets, 0 pending.');
