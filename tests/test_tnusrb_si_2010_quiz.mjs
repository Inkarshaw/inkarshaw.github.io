import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/tnusrb-si-2010-open-type-a.json'));
const html=read('tnusrb-si-2010-quiz.html'),js=read('assets/js/tnusrb-si-2010-quiz.js');
const hub=read('pyq-hub.html'),tnusrb=read('tnusrb.html'),yearwise=read('tnusrb/previous_year_questions.html');
const expectedMissing=[67,68,69,70,71,72,73,74,75,76,77,78,79,80,114,115,116];
assert.equal(data.schemaVersion,1);
assert.equal(data.year,2010);
assert.equal(data.bookletType,'A');
assert.equal(data.originalPaperQuestionCount,140);
assert.equal(data.providedQuestionCount,123);
assert.equal(data.availableForQuizCount,120);
assert.equal(data.scoredQuestionCount,116);
assert.deepEqual(data.missingNumbers,expectedMissing,'Keep unavailable source numbers visible as gaps');
assert.deepEqual(data.blockedNumbers,[64,86,106],'Do not invent maths notation or missing Venn diagram');
assert.equal(data.questions.length,123);
assert.deepEqual(data.questions.map(q=>q.number),[...data.questions.map(q=>q.number)].sort((a,b)=>a-b));
const idSet=new Set();
for(const q of data.questions){
 assert.ok(!idSet.has(q.id),'Unique stable question ID');idSet.add(q.id);
 assert.ok(q.number>=1&&q.number<=140);
 assert.ok(q.question&&q.question.length>3);
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.ok(Object.values(q.options).every(x=>typeof x==='string'&&x.trim().length>0));
 assert.ok(/^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/.test(q.keyToken));
 assert.deepEqual(q.acceptedAnswers,q.keyToken==='ALL'?[]:q.keyToken.split('/'));
 if(q.keyToken==='ALL')assert.equal(q.scoringStatus,'ungraded_all_correct');
 if([64,86,106].includes(q.number))assert.equal(q.scoringStatus,'blocked_source_incomplete');
 assert.ok(q.number<=4 ? /2010 TNUSRB SI Open Candidates/.test(q.source) : q.source==='user-provided TNUSRB SI 2010 Type A transcription','Source and quota provenance preserved');
}
const tokens=Object.fromEntries(data.questions.map(q=>[q.number,q.keyToken]));
assert.deepEqual(data.questions.slice(0,4).map(q=>q.keyToken),['C','C','A','A'],'Source Q1–4 map to open-candidate Type A, not departmental key');
for(const [n,key] of Object.entries({5:'B',6:'C',7:'D',16:'ALL',54:'B/D',63:'C',66:'B',81:'C',91:'B/D',101:'B/C',106:'C',117:'A',129:'ALL',138:'ALL',139:'ALL',140:'A'})){
 assert.equal(tokens[Number(n)],key,'Type A key mirrored entry Q'+n);
}
assert.equal(data.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').length,3);
assert.equal(data.questions.filter(q=>q.scoringStatus==='ungraded_all_correct').length,4);
assert.equal(data.questions.filter(q=>q.scoringStatus==='provisional_mirrored_final_key').length,116);
assert.ok(data.questions.filter(q=>q.passage).map(q=>q.number).join(',')==='117,118,119,120,121,122');
assert.ok(data.questions.filter(q=>q.instruction).map(q=>q.number).join(',')==='101,102,103,104,105');
assert.match(html,/not the full 140-question paper/i);
assert.match(html,/mirrored final-key copy/);
assert.match(html,/id="palette"/);
assert.match(html,/id="score"/);
assert.match(js,/filter\(q=>q\.scoringStatus!=='blocked_source_incomplete'\)/);
assert.match(js,/0\.5/);
assert.match(js,/Array\(questions\.length\)\.fill\(null\)/);
assert.match(js,/localStorage/);
assert.ok(!js.includes('innerHTML'),'Do not render question text as HTML');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'HTML IDs must be unique');
for(const match of js.matchAll(/\$\('([^']+)'\)/g)){
 assert.ok(ids.includes(match[1]),'Missing rendered control: '+match[1]);
}
new vm.Script(js,{filename:'assets/js/tnusrb-si-2010-quiz.js'});
assert.match(hub,/tnusrb-si-2010-quiz\.html/);
assert.match(tnusrb,/tnusrb-si-2010-quiz\.html/);
assert.match(yearwise,/\.\.\/tnusrb-si-2010-quiz\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2010-quiz\.html/);
console.log('PASS TNUSRB SI 2010 Type A: 123 source records, 120 attemptable, 116 scored, 17 missing, 3 blocked, four ALL.');
