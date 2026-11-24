// Final 2022 GS pass: all 100 source-numbered study positions must have four readable options.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const root={};
for(const p of ['assets/js/pyq-source-text-splitter.js','assets/js/pyq-source-ocr-overlay.js','assets/js/pyq-source-visual-recovery.js'])
 vm.runInNewContext(read(p),root,{filename:p,timeout:5000});
const split=root.ClearExamsPYQSourceSplitter.parse;
const merge=root.ClearExamsPYQOcrOverlay.merge;
const apply=root.ClearExamsPYQVisualRecovery.apply;
const dir='data/quizzes/pyq-reader-drafts/';
const names=['visual-study-recovery-2026-11-23.json','visual-study-recovery-2026-11-24.json',
 'visual-study-recovery-2026-11-24-general-english.json','visual-study-recovery-2026-11-24-gs-101-122.json',
 'visual-study-recovery-2026-11-24-gs-123-137.json','visual-study-recovery-2026-11-24-gs-142-160.json',
 'visual-study-recovery-2026-11-24-gs-161-180.json','visual-study-recovery-2026-11-24-gs-final.json'];
const reviews=names.map(n=>json(dir+n)),latest=reviews.at(-1),src=latest.papers[0];
assert.equal(latest.schemaVersion,1);
assert.equal(latest.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(latest.gradingEnabled,false);
assert.equal(latest.officialFinalKeyMapped,false);
assert.equal(latest.verifiedOriginalWording,false);
const expected=[138,144,146,153,158,181,182,183,184,185,186,187,188,189,190,191,193,194,195,196,197,198];
assert.deepEqual(src.questions.map(q=>q.number),expected);
const oldComplete=[138,144,146,181,182,185];
for(const q of src.questions){
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.scoreEligible,false);
 assert.ok(q.expectedBrokenStart.length>=20);
 assert.equal(q.replaceMachineComplete===true,oldComplete.includes(q.number));
 assert.equal(q.replaceDamagedText===true,!oldComplete.includes(q.number));
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length));
 assert.equal(q.options.E,'Answer not known');
 if(q.replaceMachineComplete)assert.ok(q.expectedExistingOptionAPrefix?.length>=8||q.expectedExistingOptionA?.length>=2);
}
const byNumber=n=>src.questions.find(q=>q.number===n);
assert.equal(byNumber(189).text,'Evaluate the infinite nested radical √(3√(3√(3…))).');
assert.deepEqual(Object.values(byNumber(190).options).slice(0,4),['77.32','79.48','79.84','97.84']);
assert.deepEqual(Object.values(byNumber(191).options).slice(0,4),['5','7','9','11']);
assert.equal(byNumber(153).options.D,'97th, 2011');
assert.equal(byNumber(158).options.D,'Agra');
const make=(raw,combined)=>({id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:combined.pages,
 questions:split(combined).questions.map(q=>({number:q.number,text:q.text,options:q.options,sourcePdfPage:q.sourcePdfPage,
 textRecovered:q.textRecovered,complete:q.fourOptionsDetected,sourceStatus:q.textStatus,scoreEligible:false,correctAnswer:null,issues:q.issues}))});
let beforeStems=0,afterStems=0,beforeSets=0,afterSets=0,total=0;
for(const entry of json(dir+'index.json').entries){
 const raw=json(dir+entry.file),combined=merge(raw,json(dir+'ocr-recovery/'+entry.file)),paper=make(raw,combined);
 for(const old of reviews.slice(0,-1))apply(paper,old);
 beforeStems+=paper.questions.filter(q=>q.textRecovered).length;
 beforeSets+=paper.questions.filter(q=>q.complete).length;
 const prev=new Map(paper.questions.map(q=>[q.number,q.complete]));
 const result=apply(paper,latest);total+=result.added;
 if(raw.id===src.paperId){
  assert.equal(result.added,22);
  for(const spec of src.questions){
   const q=paper.questions.find(q=>q.number===spec.number);
   assert.equal(q.text,spec.text);
   assert.equal(q.sourcePdfPage,spec.sourcePdfPage);
   assert.equal(q.complete,true);
   assert.equal(q.scoreEligible,false);
   assert.equal(q.correctAnswer,null);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.equal(prev.get(spec.number),oldComplete.includes(spec.number));
   for(const l of 'ABCDE')assert.equal(q.options[l],spec.options[l]);
  }
  assert.equal(paper.questions.filter(q=>q.complete).length,100);
  assert.equal(paper.questions.filter(q=>q.textRecovered).length,100);
  assert.equal(apply(paper,latest).added,0);
  const mismatch=make(raw,combined);
  mismatch.questions.find(q=>q.number===144).options.A='€8oo';
  const changed=apply(mismatch,latest);
  assert.equal(changed.added,21,'Short-option exact fingerprints must reject a mismatch');
  assert.notEqual(mismatch.questions.find(q=>q.number===144).text,byNumber(144).text);
  const invalid=make(raw,combined);invalid.source='https://example.invalid/other.pdf';
  assert.equal(apply(invalid,latest).added,0);
  const bad=structuredClone(latest);bad.officialFinalKeyMapped=true;
  assert.equal(apply(make(raw,combined),bad).added,0);
 }else assert.equal(result.added,0);
 afterStems+=paper.questions.filter(q=>q.textRecovered).length;
 afterSets+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.length,100);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
 assert.ok(paper.questions.every(q=>q.scoreEligible!==true));
}
assert.equal(beforeStems,300);
assert.equal(afterStems,300);
assert.equal(beforeSets,167);
assert.equal(afterSets,183);
assert.equal(total,22);
const html=read('pyq-typed-library.html');
assert.match(html,/100 of 100 provisionally readable A–D option sets/);
assert.match(html,/232 of 300 A–D option sets/);
assert.match(html,/remaining 68 option sets still need source cleanup/);
assert.match(read('assets/js/pyq-bulk-reader.js'),/visual-study-recovery-2026-11-24-gs-final\.json/);
console.log('PASS: 2022 GS 100/100 provisional option sets; 16 incomplete and 6 misleading-complete OCR entries repaired; 183/300 across all drafts, no grading.');
