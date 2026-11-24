// Original PDF-image review of TNPSC Group II/IIA 2022 General Studies Q123–137.
// The reader's real order is original text, OCR overlay, then dated editorial
// study retypes. No question may be marked as certified verbatim or scored.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const root={};
for(const p of ['assets/js/pyq-source-text-splitter.js','assets/js/pyq-source-ocr-overlay.js',
 'assets/js/pyq-source-visual-recovery.js'])
 vm.runInNewContext(read(p),root,{filename:p,timeout:4000});
const split=root.ClearExamsPYQSourceSplitter.parse;
const merge=root.ClearExamsPYQOcrOverlay.merge;
const apply=root.ClearExamsPYQVisualRecovery.apply;
const base='data/quizzes/pyq-reader-drafts/';
const names=[
 'visual-study-recovery-2026-11-23.json',
 'visual-study-recovery-2026-11-24.json',
 'visual-study-recovery-2026-11-24-general-english.json',
 'visual-study-recovery-2026-11-24-gs-101-122.json',
 'visual-study-recovery-2026-11-24-gs-123-137.json'
];
const reviews=names.map(n=>json(base+n));
const current=reviews.at(-1);
assert.equal(current.schemaVersion,1);
assert.equal(current.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(current.reviewedOn,'2026-11-24');
assert.equal(current.gradingEnabled,false);
assert.equal(current.verifiedOriginalWording,false);
assert.equal(current.officialFinalKeyMapped,false);
assert.equal(current.papers.length,1);
const source=current.papers[0];
assert.equal(source.questions.length,15);
assert.deepEqual(source.questions.map(q=>q.number),Array.from({length:15},(_,i)=>123+i));
assert.ok(source.sourcePdf.includes('General%20Studies%20-%20CCS2E'));
const falseCompletes=[123,125,129,131,133,136];
for(const q of source.questions){
 assert.ok(Number.isInteger(q.number)&&q.sourcePdfPage>=19&&q.sourcePdfPage<=26);
 assert.equal(q.scoreEligible,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.replaceMachineComplete===true,falseCompletes.includes(q.number));
 assert.equal(q.replaceDamagedText===true,!falseCompletes.includes(q.number));
 assert.ok(q.expectedBrokenStart.length>=20);
 if(q.replaceMachineComplete)assert.ok(q.expectedExistingOptionAPrefix.length>=8);
 assert.ok(q.note.includes('visually checked'));
 assert.ok(q.text.length>=20&&q.text.length<750);
 assert.ok('ABCD'.split('').every(l=>q.options[l].length>1));
 assert.equal(q.options.E,'Answer not known');
}
const q133=source.questions.find(q=>q.number===133);
assert.match(q133.text,/Swatantra Party/);
assert.match(q133.text,/Sohan Singh Bhakna/);
assert.deepEqual('ABCD'.split('').map(l=>q133.options[l]),
 ['1, 2, 3, 4','2, 1, 4, 3','1, 3, 4, 2','3, 1, 2, 4']);
const q137=source.questions.find(q=>q.number===137);
assert.equal(q137.options.B,'(i), (ii) and (iii)');
const q124=source.questions.find(q=>q.number===124);
assert.deepEqual('ABCD'.split('').map(l=>q124.options[l]),
 ['July 1956','October 1956','July 1965','October 1965']);
let stemsBefore=0,completeBefore=0,stemsAfter=0,completeAfter=0,totalChanged=0;
for(const entry of json(base+'index.json').entries){
 const raw=json(base+entry.file),ocr=json(base+'ocr-recovery/'+entry.file);
 const combined=merge(raw,ocr);
 const p=split(combined);
 assert.equal(p.questions.length,100);
 const paper={id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:combined.pages,
  questions:p.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,
   textRecovered:q.textRecovered,complete:q.fourOptionsDetected,
   sourcePdfPage:q.sourcePdfPage,sourceStatus:q.textStatus,
   scoreEligible:false,correctAnswer:null,issues:q.issues
  }))};
 for(const previous of reviews.slice(0,-1))apply(paper,previous);
 stemsBefore+=paper.questions.filter(q=>q.textRecovered).length;
 completeBefore+=paper.questions.filter(q=>q.complete).length;
 const prior=Object.fromEntries(paper.questions.map(q=>[q.number,{
  complete:q.complete,stem:q.text,optionA:q.options.A,sourceStatus:q.sourceStatus
 }]));
 const result=apply(paper,current);
 totalChanged+=result.added;
 if(entry.id===source.paperId){
  assert.equal(raw.sourcePdf,source.sourcePdf);
  assert.equal(result.added,15);
  let fixedIncomplete=0,fixedMisclassified=0;
  for(const correction of source.questions){
   const q=paper.questions.find(q=>q.number===correction.number);
   assert.equal(q.text,correction.text);
   assert.equal(q.sourcePdfPage,correction.sourcePdfPage);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.equal(q.scoreEligible,false);
   assert.equal(q.correctAnswer,null);
   assert.equal(q.complete,true);
   assert.equal(q.textRecovered,true);
   assert.match(q.issues.join(' '),/NOT verbatim/);
   for(const l of 'ABCDE')assert.equal(q.options[l],correction.options[l]);
   const before=prior[q.number];
   if(correction.replaceMachineComplete){
    fixedMisclassified++;
    assert.equal(before.complete,true,'Misclassified OCR was initially flagged as complete');
    assert.equal(before.sourceStatus,'machine-split-complete-unverified');
    assert.notEqual(before.optionA,correction.options.A);
   }else{
    fixedIncomplete++;
    assert.equal(before.complete,false);
   }
  }
  assert.equal(fixedIncomplete,9);
  assert.equal(fixedMisclassified,6);
  assert.equal(apply(paper,current).added,0,'Review application must be idempotent');
 }else{
  assert.equal(result.added,0,'Only the original GS 2022 booklet is eligible');
 }
 stemsAfter+=paper.questions.filter(q=>q.textRecovered).length;
 completeAfter+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.filter(q=>q.scoreEligible===true).length,0);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
}
assert.equal(stemsBefore,300);
assert.equal(stemsAfter,300);
assert.equal(completeBefore,130);
assert.equal(completeAfter,139);
assert.equal(totalChanged,15);
const wrong=structuredClone(current);
wrong.gradingEnabled=true;
assert.equal(apply({questions:[],id:source.paperId,source:source.sourcePdf},wrong).added,0);
const raw=json(base+source.paperId+'.json');
const splitRaw=split(raw);
const mismatched={
 id:raw.id,source:'https://example.invalid/wrong.pdf',pageOnly:false,
 questions:splitRaw.questions.map(q=>({
  number:q.number,text:q.text,options:q.options,textRecovered:q.textRecovered,
  complete:q.fourOptionsDetected,sourcePdfPage:q.sourcePdfPage,sourceStatus:q.textStatus
 }))
};
assert.equal(apply(mismatched,current).added,0,'Exact source PDF link required');
const lib=read('pyq-typed-library.html');
assert.match(lib,/152 of 300 A–D option sets/);
assert.match(lib,/remaining 148 option sets still need source cleanup/);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/visual-study-recovery-2026-11-24-gs-123-137\.json/);
assert.ok(!reader.includes('innerHTML'),'Source text must be inserted as text, never injected as HTML');
console.log('PASS TNPSC 2022 Q123–137 source image review: 9 partial choices recovered, 6 false-complete OCR groups repaired, 139/300 readable A-D study sets, 161 remain ungraded.');
