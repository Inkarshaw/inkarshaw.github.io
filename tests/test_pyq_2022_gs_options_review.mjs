// Regression: the *browser* combines OCR for every paper before applying
// source-image-reviewed editorial overlays. A source-complete flag alone
// cannot certify English A-D choices or any official final-key mapping.
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const ctx={};
for(const file of ['assets/js/pyq-source-text-splitter.js',
 'assets/js/pyq-source-ocr-overlay.js','assets/js/pyq-source-visual-recovery.js'])
 vm.runInNewContext(read(file),ctx,{filename:file,timeout:5000});
const parse=ctx.ClearExamsPYQSourceSplitter.parse;
const merge=ctx.ClearExamsPYQOcrOverlay.merge;
const apply=ctx.ClearExamsPYQVisualRecovery.apply;
const base='data/quizzes/pyq-reader-drafts/';
const overlays=[
 json(base+'visual-study-recovery-2026-11-23.json'),
 json(base+'visual-study-recovery-2026-11-24.json'),
 json(base+'visual-study-recovery-2026-11-24-general-english.json')
];
const reviewed=json(base+'visual-study-recovery-2026-11-24-gs-101-122.json');
assert.equal(reviewed.schemaVersion,1);
assert.equal(reviewed.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(reviewed.gradingEnabled,false);
assert.equal(reviewed.officialFinalKeyMapped,false);
assert.equal(reviewed.verifiedOriginalWording,false);
assert.equal(reviewed.papers.length,1);
const items=reviewed.papers[0].questions;
assert.equal(items.length,22);
assert.deepEqual(items.map(x=>x.number),Array.from({length:22},(_,i)=>101+i));
const mislabelled=[102,114,116,117,118,120];
for(const q of items){
 assert.ok(q.text.length>=20&&q.text.length<=750);
 assert.ok(q.expectedBrokenStart?.length>=20);
 assert.equal(q.sourcePdfPage,q.number===101?2:q.sourcePdfPage);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.scoreEligible,false);
 assert.equal(q.options.E,'Answer not known');
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length>1));
 assert.ok(q.note.includes('official TNPSC'));
 assert.equal(q.replaceMachineComplete===true,mislabelled.includes(q.number));
 assert.equal(q.replaceDamagedText===true,!mislabelled.includes(q.number));
 if(q.replaceMachineComplete)assert.ok(q.expectedExistingOptionAPrefix?.length>=8);
}
const toPaper=(raw,combined)=>{
 const split=parse(combined);
 assert.equal(split.questions.length,100);
 return {id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:combined.pages,
  questions:split.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,sourcePdfPage:q.sourcePdfPage,
   textRecovered:q.textRecovered,complete:q.fourOptionsDetected,sourceStatus:q.textStatus,
   issues:q.issues,correctAnswer:null,scoreEligible:false
  }))};
};
let stemsBefore=0,completeBefore=0,stemsAfter=0,completeAfter=0,changed=0;
let targetPaper=null;
for(const entry of json(base+'index.json').entries){
 const raw=json(base+entry.file);
 const sourceOCR=json(base+'ocr-recovery/'+entry.file);
 const combined=merge(raw,sourceOCR);
 const paper=toPaper(raw,combined);
 for(const prev of overlays)apply(paper,prev);
 stemsBefore+=paper.questions.filter(q=>q.textRecovered).length;
 completeBefore+=paper.questions.filter(q=>q.complete).length;
 const before=paper.questions.map(q=>({number:q.number,complete:q.complete,text:q.text,optionA:q.options.A}));
 const r=apply(paper,reviewed);
 changed+=r.added;
 if(raw.id===reviewed.papers[0].paperId){
  targetPaper=paper;
  assert.equal(raw.sourcePdf,reviewed.papers[0].sourcePdf);
  assert.equal(r.added,22);
  let repairedPartial=0,correctedFalseComplete=0;
  for(const source of items){
   const q=paper.questions.find(q=>q.number===source.number);
   const prior=before.find(q=>q.number===source.number);
   assert.equal(q.text,source.text);
   assert.equal(q.sourcePdfPage,source.sourcePdfPage);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.ok('ABCDE'.split('').every(l=>q.options[l]===source.options[l]));
   assert.equal(q.complete,true);
   assert.equal(q.textRecovered,true);
   assert.equal(q.scoreEligible,false);
   assert.equal(q.correctAnswer,null);
   assert.match(q.issues.join(' '),/NOT verbatim/);
   if(source.replaceMachineComplete){
    correctedFalseComplete++;
    assert.equal(prior.complete,true,'This source entry was falsely flagged complete by OCR');
    assert.notEqual(prior.optionA,source.options.A,
     'The reviewed English option must fix a genuine original OCR mismatch');
   }else{
    repairedPartial++;
    assert.equal(prior.complete,false);
   }
  }
  assert.equal(repairedPartial,16);
  assert.equal(correctedFalseComplete,6);
  assert.equal(apply(paper,reviewed).added,0,'Idempotent review must not overwrite a corrected question');
  assert.equal(paper.questions.length,100);
 }else{
  assert.equal(r.added,0,'No cross-paper contamination');
 }
 stemsAfter+=paper.questions.filter(q=>q.textRecovered).length;
 completeAfter+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.filter(q=>q.scoreEligible).length,0);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
}
assert.ok(targetPaper,'GS draft should exist');
assert.equal(stemsBefore,300);
assert.equal(stemsAfter,300);
assert.equal(completeBefore,114,'Browser must merge alternate OCR in all three papers');
assert.equal(completeAfter,130,'16 damaged option sets recovered, six OCR false-completes repaired');
assert.equal(changed,22);
const wrongSource={...targetPaper,source:'https://example.invalid/not-original.pdf'};
assert.equal(apply(wrongSource,reviewed).added,0);
const wrongFlags=structuredClone(reviewed);
wrongFlags.officialFinalKeyMapped=true;
assert.equal(apply(targetPaper,wrongFlags).added,0);
const changedStem=structuredClone(targetPaper);
changedStem.questions.find(q=>q.number===101).text='different source text unexpectedly substituted';
changedStem.questions.find(q=>q.number===101).sourceStatus='machine-split-partial-unverified';
assert.equal(apply(changedStem,reviewed).added,0,
 'A reviewed overlay must never overwrite arbitrary nonmatching text');
const lib=read('pyq-typed-library.html');
assert.match(lib,/167 of 300 A–D option sets/);
assert.match(lib,/remaining 133 option sets still need source cleanup/);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/visual-study-recovery-2026-11-24-gs-101-122\.json/);
assert.ok(!reader.includes('innerHTML'),'Source text must never be HTML-injected');
console.log('PASS: official-page-reviewed GS Q101–122 fixes 16 missing A–D choices and 6 misclassified OCR option groups; actual live coverage 130/300, 170 outstanding; no scoring.');
