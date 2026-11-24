// Recover Q139's missing symbol series and Q141's missing printed number grid safely.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const json=path=>JSON.parse(read(path));
const ctx={};
vm.runInNewContext(read('assets/js/pyq-source-text-splitter.js'),ctx,{timeout:3000});
vm.runInNewContext(read('assets/js/pyq-source-visual-recovery.js'),ctx,{timeout:3000});
const split=ctx.ClearExamsPYQSourceSplitter.parse;
const apply=ctx.ClearExamsPYQVisualRecovery.apply;
const old=json('data/quizzes/pyq-reader-drafts/visual-study-recovery-2026-11-23.json');
const latest=json('data/quizzes/pyq-reader-drafts/visual-study-recovery-2026-11-24.json');
assert.equal(latest.schemaVersion,1);
assert.equal(latest.reviewedOn,'2026-11-24');
assert.equal(latest.gradingEnabled,false);
assert.equal(latest.officialFinalKeyMapped,false);
assert.equal(latest.verifiedOriginalWording,false);
assert.deepEqual(latest.papers.map(p=>p.questions.map(q=>q.number)),[[139,141]]);
const index=json('data/quizzes/pyq-reader-drafts/index.json');
let beforeStems=0,beforeSets=0,afterOldStems=0,afterOldSets=0,afterStems=0,afterSets=0,latestCount=0;
for(const entry of index.entries){
 const raw=json('data/quizzes/pyq-reader-drafts/'+entry.file);
 const parsed=split(raw);
 const paper={
  id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:raw.pages,
  questions:parsed.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,
   textRecovered:q.textRecovered,complete:q.fourOptionsDetected,
   sourcePdfPage:q.sourcePdfPage,sourceStatus:q.textStatus,
   scoreEligible:false,correctAnswer:null,issues:q.issues
  }))
 };
 assert.equal(paper.questions.length,100);
 beforeStems+=paper.questions.filter(q=>q.textRecovered).length;
 beforeSets+=paper.questions.filter(q=>q.complete).length;
 apply(paper,old);
 afterOldStems+=paper.questions.filter(q=>q.textRecovered).length;
 afterOldSets+=paper.questions.filter(q=>q.complete).length;
 const isGS=entry.id===latest.papers[0].paperId;
 if(isGS){
  const q139=paper.questions.find(q=>q.number===139);
  const q141=paper.questions.find(q=>q.number===141);
  assert.equal(q139.textRecovered,false,'Q139 should be genuinely missing before this dated recovery');
  assert.equal(q139.complete,false);
  assert.equal(q141.textRecovered,true,'Q141 already has a text stem');
  assert.equal(q141.complete,false,'Q141 printed options/diagram are not yet complete');
  assert.match(q141.text,/t\.he following numbers/,'Do not overwrite a different source wording');
  assert.equal(q141.sourcePdfPage,29);
 }
 const r=apply(paper,latest);
 latestCount+=r.added;
 assert.equal(r.added,isGS?2:0,'No other paper may be altered by the dated source overlay');
 if(isGS){
  const q139=paper.questions.find(q=>q.number===139);
  const q141=paper.questions.find(q=>q.number===141);
  assert.equal(q139.sourcePdfPage,28);
  assert.match(q139.text,/Unicode reading/);
  assert.match(q139.text,/P @ L/);
  assert.equal(q139.options.C,'F • 3');
  assert.equal(q139.options.E,'Answer not known');
  assert.equal(q141.sourcePdfPage,29);
  assert.match(q141.text,/2\s+7\s+17/);
  assert.match(q141.text,/3\s+11\s+19/);
  assert.match(q141.text,/5\s+13\s+\?/);
  assert.deepEqual(['A','B','C','D'].map(l=>q141.options[l]),['21','23','25','27']);
  for(const q of [q139,q141]){
   assert.equal(q.textRecovered,true);
   assert.equal(q.complete,true);
   assert.equal(q.scoreEligible,false);
   assert.equal(q.correctAnswer,null);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.match(q.issues.join(' '),/NOT verbatim/);
  }
  assert.equal(paper.visualStudyRecoveries,8,'Six old GS retypes plus two new');
  assert.equal(apply(paper,latest).added,0,'Repeated application must be idempotent');
  assert.equal(paper.visualStudyRecoveries,8,'Repeated application must not inflate the total');
 }
 afterStems+=paper.questions.filter(q=>q.textRecovered).length;
 afterSets+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.some(q=>q.scoreEligible===true),false);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
}
assert.equal(beforeStems,272);
assert.equal(beforeSets,86);
assert.equal(afterOldStems,279);
assert.equal(afterOldSets,94);
assert.equal(latestCount,2);
assert.equal(afterStems,280);
assert.equal(afterSets,96);
const bad=JSON.parse(JSON.stringify(latest));
bad.gradingEnabled=true;
const raw=json('data/quizzes/pyq-reader-drafts/tnpsc-group-ii-iia-2022-general-studies-ccs2e-2022-answer-key-opt-5aaa9a34.json');
const parsed=split(raw);
const original={id:raw.id,source:raw.sourcePdf,pageOnly:false,
 questions:parsed.questions.map(q=>({number:q.number,text:q.text,options:q.options,
 textRecovered:q.textRecovered,complete:q.fourOptionsDetected,sourcePdfPage:q.sourcePdfPage}))};
assert.equal(apply(original,bad).added,0,'Do not accept any scoring-enabled overlay');
const badSource=structuredClone(original);
badSource.source='https://example.invalid/not-the-original.pdf';
assert.equal(apply(badSource,latest).added,0,'The exact original official PDF is required');
const lib=read('pyq-typed-library.html');
assert.match(lib,/All 300 original-numbered positions now have readable English study stems/);
assert.match(lib,/116 A–D option sets/);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/visual-study-recovery-2026-11-24\.json/);
assert.match(reader,/for\(const review of studyReviews\)/);
assert.ok(!reader.includes('innerHTML'));
console.log('PASS: 280\/300 text stems, 96\/300 readable A–D sets, 2 extra source-reviewed editorial study retypes, zero verified marks.');
