// Regression: scanned source-image adaptations for TNPSC 2022 GS Q142–160.
// This ungraded exercise must not infer a correct answer from tentative key ticks.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const root={};
for(const file of [
 'assets/js/pyq-source-text-splitter.js',
 'assets/js/pyq-source-ocr-overlay.js',
 'assets/js/pyq-source-visual-recovery.js'
])vm.runInNewContext(read(file),root,{filename:file,timeout:5000});
const split=root.ClearExamsPYQSourceSplitter.parse;
const merge=root.ClearExamsPYQOcrOverlay.merge;
const apply=root.ClearExamsPYQVisualRecovery.apply;
const dir='data/quizzes/pyq-reader-drafts/';
const names=[
 'visual-study-recovery-2026-11-23.json',
 'visual-study-recovery-2026-11-24.json',
 'visual-study-recovery-2026-11-24-general-english.json',
 'visual-study-recovery-2026-11-24-gs-101-122.json',
 'visual-study-recovery-2026-11-24-gs-123-137.json',
 'visual-study-recovery-2026-11-24-gs-142-160.json'
];
const overlays=names.map(name=>json(dir+name));
const reviewed=overlays.at(-1);
assert.equal(reviewed.schemaVersion,1);
assert.equal(reviewed.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(reviewed.reviewedOn,'2026-11-24');
assert.equal(reviewed.gradingEnabled,false);
assert.equal(reviewed.officialFinalKeyMapped,false);
assert.equal(reviewed.verifiedOriginalWording,false);
assert.equal(reviewed.papers.length,1);
const source=reviewed.papers[0];
assert.equal(source.totalPdfPages,71);
assert.match(source.sourcePdf,/www\.tnpsc\.gov\.in/);
const items=source.questions;
const expected=[142,143,145,147,148,149,150,151,152,154,155,156,157,159,160];
assert.deepEqual(items.map(q=>q.number),expected);
const beforeComplete=[152,154];
const sourcePage={142:30,143:30,145:31,147:32,148:33,149:33,150:33,
 151:34,152:35,154:37,155:37,156:38,157:39,159:41,160:42};
for(const q of items){
 assert.equal(q.sourcePdfPage,sourcePage[q.number]);
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.scoreEligible,false);
 assert.ok(q.note.includes('original scan'));
 assert.ok(q.text.length>=20&&q.text.length<750);
 assert.ok(q.expectedBrokenStart.length>=20);
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length>0));
 assert.equal(q.options.E,'Answer not known');
 assert.equal(q.replaceMachineComplete===true,beforeComplete.includes(q.number));
 assert.equal(q.replaceDamagedText===true,!beforeComplete.includes(q.number));
 if(q.replaceMachineComplete)assert.ok(q.expectedExistingOptionAPrefix.length>=8);
}
const find=n=>items.find(q=>q.number===n);
assert.equal(find(142).options.D,'75000 litre');
assert.equal(find(143).options.C,'36 cm');
assert.equal(find(145).options.B,'₹(100/x)');
assert.equal(find(145).options.D,'₹(100/x²)');
assert.equal(find(149).options.B,'(a − 3x)²');
assert.equal(find(149).options.D,'(a − 3x)');
assert.match(find(151).text,/Commission of Inquiry Act/);
assert.deepEqual('ABCD'.split('').map(l=>find(151).options[l]),
 ['1, 2, 3, 4','4, 3, 2, 1','4, 2, 1, 3','3, 1, 2, 4']);
assert.equal(find(152).options.C,'(i) and (iii) are correct');
assert.equal(find(154).options.C,'Right to Exploitation');
assert.equal(find(156).options.D,'(i), (iii) and (iv) only');
assert.deepEqual('ABCD'.split('').map(l=>find(157).options[l]),
 ['2, 3, 4, 1','3, 2, 1, 4','3, 2, 4, 1','4, 3, 2, 1']);
assert.deepEqual('ABCD'.split('').map(l=>find(160).options[l]),
 ['3, 4, 1, 2','4, 3, 2, 1','2, 1, 3, 4','4, 2, 3, 1']);
const makePaper=(raw,sourceDraft)=>{
 const parsed=split(sourceDraft);
 assert.equal(parsed.questions.length,100);
 return {id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:sourceDraft.pages,
  questions:parsed.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,
   sourcePdfPage:q.sourcePdfPage,textRecovered:q.textRecovered,
   complete:q.fourOptionsDetected,sourceStatus:q.textStatus,issues:q.issues,
   correctAnswer:null,scoreEligible:false
  }))};
};
let beforeStems=0,afterStems=0,beforeOptions=0,afterOptions=0,added=0;
let targetRaw=null;
for(const entry of json(dir+'index.json').entries){
 const raw=json(dir+entry.file);
 const originalOCR=json(dir+'ocr-recovery/'+entry.file);
 const combined=merge(raw,originalOCR);
 const paper=makePaper(raw,combined);
 for(const old of overlays.slice(0,-1))apply(paper,old);
 const prior=Object.fromEntries(paper.questions.map(q=>[q.number,{
  text:q.text,complete:q.complete,optionA:q.options.A,sourceStatus:q.sourceStatus
 }]));
 beforeStems+=paper.questions.filter(q=>q.textRecovered).length;
 beforeOptions+=paper.questions.filter(q=>q.complete).length;
 const result=apply(paper,reviewed);
 added+=result.added;
 if(raw.id===source.paperId){
  targetRaw=raw;
  assert.equal(raw.sourcePdf,source.sourcePdf);
  assert.equal(result.added,15);
  let repaired=0,corrected=0;
  for(const spec of items){
   const q=paper.questions.find(q=>q.number===spec.number);
   const prev=prior[spec.number];
   assert.equal(q.text,spec.text);
   assert.equal(q.sourcePdfPage,spec.sourcePdfPage);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.equal(q.textRecovered,true);
   assert.equal(q.complete,true);
   assert.equal(q.correctAnswer,null);
   assert.equal(q.scoreEligible,false);
   assert.match(q.issues.join(' '),/NOT verbatim/);
   for(const l of 'ABCDE')assert.equal(q.options[l],spec.options[l]);
   if(spec.replaceMachineComplete){
    corrected++;
    assert.equal(prev.complete,true);
    assert.equal(prev.sourceStatus,'machine-split-complete-unverified');
    assert.notEqual(prev.optionA,spec.options.A);
   }else{
    repaired++;
    assert.equal(prev.complete,false);
   }
  }
  assert.equal(repaired,13);
  assert.equal(corrected,2);
  assert.equal(apply(paper,reviewed).added,0,'Reapplying must not alter reviewed questions');
 }else{
  assert.equal(result.added,0,'GS source overlay must never alter other papers');
 }
 afterStems+=paper.questions.filter(q=>q.textRecovered).length;
 afterOptions+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.length,100);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
 assert.ok(paper.questions.every(q=>q.scoreEligible!==true));
}
assert.ok(targetRaw);
assert.equal(beforeStems,300);
assert.equal(afterStems,300);
assert.equal(beforeOptions,139);
assert.equal(afterOptions,152);
assert.equal(added,15);
const sample=makePaper(targetRaw,targetRaw);
const wrongSource={...sample,source:'https://example.invalid/fake.pdf'};
assert.equal(apply(wrongSource,reviewed).added,0);
const unsafe=structuredClone(reviewed);
unsafe.officialFinalKeyMapped=true;
assert.equal(apply(sample,unsafe).added,0);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/visual-study-recovery-2026-11-24-gs-142-160\.json/);
assert.ok(!reader.includes('innerHTML'));
const html=read('pyq-typed-library.html');
assert.match(html,/152 of 300 A–D option sets/);
assert.match(html,/remaining 148 option sets still need source cleanup/);
console.log('PASS: TNPSC GS Q142–160: 13 partial option repairs, 2 misleading complete entries fixed, 152/300 readable sets, all 300 stems, zero graded.');
