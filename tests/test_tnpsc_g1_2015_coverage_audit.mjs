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
assert.deepEqual(counts,{totalOriginal:200,typed:200,missingTyped:0,sourceImageReviewed:200,typedScorable:192,typedUngraded:8,secondaryPending:0,historicalDisputes:5,allKeyUngraded:3,pdfCompanionScorable:197});
assert.deepEqual(manifest.records.filter(x=>!x.typed).map(x=>x.number),[],'No original-numbered adapted study position is absent');
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='original-image-review-pending-ungraded').map(x=>x.number),[]);
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='historical-source-dispute-ungraded').map(x=>x.number),[21,22,26,84,119]);
assert.deepEqual(manifest.records.filter(x=>x.typedStatus==='official-ALL-key-ungraded').map(x=>x.number),[59,92,189]);
assert.deepEqual(manifest.records.filter(x=>x.officialKeyToken==='ALL').map(x=>x.number),[59,92,189]);
assert.deepEqual(manifest.unresolvedNumbers,manifest.records.filter(x=>!x.typedStudyScoreEligible).map(x=>x.number));
assert.equal(manifest.unresolvedNumbers.length,8);
assert.deepEqual(manifest.unresolvedNumbers,[21,22,26,59,84,92,119,189]);
console.log('2015 Group I: 200 numbered adapted study texts, 200 source-image checked, 192 scored, 8 study-only, zero missing; not certified verbatim bilingual.');

assert.deepEqual(manifest.records.filter(x=>x.number>=38&&x.number<=43).map(x=>x.sourcePdfPage),Array(6).fill(17));
