// Keep the standalone ClearExams 2015 PYQ export and unresolved report synchronized.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const all=read('data/quizzes/tnpsc-group1-multiyear-typed-draft.json');
const exported=read('data/quizzes/tnpsc-group1-2015-typed-playable.json');
const unresolved=read('data/quizzes/tnpsc-group1-2015-unresolved.json');
const report=read('data/quizzes/tnpsc-group1-2015-coverage-audit.json');
const keys=read('data/quizzes/original-final-keys.json');
const original=all.papers.find(p=>p.year===2015);
assert.equal(exported.schemaVersion,1);
assert.equal(exported.papers.length,1);
assert.deepEqual(exported.papers[0],original,'The downloadable standalone quiz must stay byte-equivalent as JSON to the live ClearExams year bank');
assert.equal(original.questions.length,200);
assert.deepEqual(original.questions.map(q=>q.number),Array.from({length:200},(_,i)=>i+1));
assert.equal(original.keyedAnswerCount,186);
assert.equal(original.verifiedSourceCount,194);
assert.equal(original.secondaryNumberedStudyCount,6);
const key=keys.papers.find(k=>k.id===original.paperId);
assert.ok(key);
assert.equal(key.answers.length,200);
let graded=0;
for(const q of original.questions){
 assert.ok(q.text.length>=18 && q.options.length===4);
 assert.ok(q.options.every(o=>typeof o==='string'&&o.trim()));
 if(q.accepted.length){
  graded++;
  assert.equal(q.keyStatus,'official-final-GS0811-omega-verified','Never score unchecked source study text');
  assert.deepEqual(q.accepted,key.answers[q.number-1].split('/'),'Same-series final key per original numbered question');
 }else{
  assert.ok(['source-dispute-ungraded','official-ALL-ungraded','official-final-key-awaiting-original-image-review'].includes(q.keyStatus),'Explicit reason for ungraded');
 }
}
assert.equal(graded,186);
assert.deepEqual(original.questions.filter(q=>q.accepted.length===0).map(q=>q.number),[21,22,26,38,39,40,41,42,43,59,84,92,119,189]);
assert.deepEqual(original.questions.filter(q=>q.sourcePdfPage===undefined).map(q=>q.number),[38,39,40,41,42,43]);
assert.equal(report.summary.typed,200);
assert.equal(report.summary.typedScorable,186);
assert.equal(report.summary.sourceImageReviewed,194);
assert.equal(report.summary.missingTyped,0);
assert.deepEqual(unresolved.unresolvedQuestionNumbers,report.unresolvedNumbers);
assert.deepEqual(unresolved.unresolved.map(u=>u.number),report.unresolvedNumbers);
for(const u of unresolved.unresolved){
 const item=report.records[u.number-1];
 assert.equal(u.status,item.typedStatus);
 assert.equal(u.officialFinalKey,item.officialKeyToken);
 assert.equal(u.reason,item.resolution);
}
assert.equal(unresolved.typedQuestionsComplete,true);
assert.equal(unresolved.sourceReviewComplete,false,'Never certify a 100% original-bilingual transcript');
assert.equal(unresolved.studyOnly,14);
console.log('2015 Group I standalone JSON export and 14 unresolved entries match the live 200-question typed study player.');
