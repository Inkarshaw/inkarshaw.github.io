// TNPSC Group I 2015: every original question position has a truthful coverage status.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const manifest=read('data/quizzes/tnpsc-group1-2015-coverage-audit.json');
const typed=read('data/quizzes/tnpsc-group1-multiyear-typed-draft.json').papers.find(x=>x.year===2015);
const key=read('data/quizzes/original-final-keys.json').papers.find(x=>x.id===typed.paperId);
assert.equal(manifest.schemaVersion,1);
assert.equal(manifest.paperId,typed.paperId);
assert.equal(manifest.officialPaperUrl,typed.officialPdf);
assert.equal(manifest.officialFinalKeyUrl,key.sourceUrl);
assert.equal(manifest.records.length,200);
assert.deepEqual(manifest.records.map(x=>x.number),Array.from({length:200},(_,i)=>i+1));
const byNumber=new Map(typed.questions.map(x=>[x.number,x]));
for(const item of manifest.records){
 const q=byNumber.get(item.number);
 assert.equal(item.typed,!!q,'No manufactured typed text for Q'+item.number);
 assert.equal(item.officialKeyToken,key.answers[item.number-1],'Same-series official key token Q'+item.number);
 assert.equal(item.sourceImageReviewed,!!q&&Number.isInteger(q.sourcePdfPage),'Exact scanned page known only where reviewed Q'+item.number);
 assert.equal(item.sourcePdfPage,q?.sourcePdfPage??null,'No guessed source page Q'+item.number);
 assert.equal(item.pdfCompanionIndicativelyScorable,item.officialKeyToken!=='ALL','ALL entries excluded from original companion');
 assert.equal(item.typedStudyScoreEligible,!!q&&q.accepted.length>0,'Only approved typed-source items graded');
 if(!q)assert.equal(item.typedStatus,'missing-typed-question');
 if(q?.accepted.length)assert.deepEqual(q.accepted,item.officialKeyToken.split('/'),'Typed source options match official key Q'+item.number);
 if(q&&!q.accepted.length)assert.ok(item.resolution&&item.resolution.length>15,'Unresolved reason required Q'+item.number);
}
const counts={
 totalOriginal:manifest.records.length,
 typed:manifest.records.filter(x=>x.typed).length,
 missingTyped:manifest.records.filter(x=>!x.typed).length,
 sourceImageReviewed:manifest.records.filter(x=>x.sourceImageReviewed).length,
 typedScorable:manifest.records.filter(x=>x.typedStudyScoreEligible).length,
 typedUngraded:manifest.records.filter(x=>x.typed&&!x.typedStudyScoreEligible).length,
 secondaryPending:manifest.records.filter(x=>x.typedStatus==='original-image-review-pending-ungraded').length,
 historicalDisputes:manifest.records.filter(x=>x.typedStatus==='historical-source-dispute-ungraded').length,
 allKeyUngraded:manifest.records.filter(x=>x.typedStatus==='official-ALL-key-ungraded').length,
 pdfCompanionScorable:manifest.records.filter(x=>x.pdfCompanionIndicativelyScorable).length
};
assert.deepEqual(counts,manifest.summary,'Manifest must match current question-level data');
assert.deepEqual(counts,{totalOriginal:200,typed:87,missingTyped:113,sourceImageReviewed:81,typedScorable:75,typedUngraded:12,secondaryPending:6,historicalDisputes:4,allKeyUngraded:2,pdfCompanionScorable:197});
assert.deepEqual(manifest.records.filter(x=>!x.typed).map(x=>x.number),[...Array.from({length:6},(_,i)=>i+74),...Array.from({length:3},(_,i)=>i+85),...Array.from({length:104},(_,i)=>i+97)]);
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='original-image-review-pending-ungraded').map(x=>x.number),[38,39,40,41,42,43]);
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='historical-source-dispute-ungraded').map(x=>x.number),[21,22,26,84]);
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='official-ALL-key-ungraded').map(x=>x.number),[59,92]);
assert.deepEqual(manifest.records.filter(x=>x.officialKeyToken==='ALL').map(x=>x.number),[59,92,189]);
assert.deepEqual(manifest.unresolvedNumbers,manifest.records.filter(x=>!x.typedStudyScoreEligible).map(x=>x.number));
assert.equal(manifest.unresolvedNumbers.length,125);
console.log('2015 Group I 200-position audit: 87 typed, 81 original images checked, 75 scored, 12 typed ungraded, 113 missing text; no synthetic questions.');
