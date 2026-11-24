// Q161–180 official PDF scan review, including the printed logistic-equation sign.
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
 'visual-study-recovery-2026-11-24-gs-161-180.json'];
const reviews=names.map(n=>json(dir+n)),latest=reviews.at(-1),src=latest.papers[0];
assert.equal(latest.schemaVersion,1);
assert.equal(latest.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(latest.gradingEnabled,false);
assert.equal(latest.officialFinalKeyMapped,false);
assert.equal(latest.verifiedOriginalWording,false);
assert.deepEqual(src.questions.map(q=>q.number),Array.from({length:20},(_,i)=>161+i));
const pages=[43,44,45,46,47,48,48,49,50,51,51,52,52,53,53,54,55,55,56,56];
const falseComplete=[162,168,176,178,180];
for(const q of src.questions){
 assert.equal(q.sourcePdfPage,pages[q.number-161]);
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.scoreEligible,false);
 assert.ok(q.expectedBrokenStart.length>=20);
 assert.ok(q.note.includes('official TNPSC'));
 assert.equal(q.replaceMachineComplete===true,falseComplete.includes(q.number));
 assert.equal(q.replaceDamagedText===true,!falseComplete.includes(q.number));
 if(q.replaceMachineComplete)assert.ok(q.expectedExistingOptionAPrefix.length>=8);
 assert.ok('ABCD'.split('').every(l=>q.options[l].length>0));
 assert.equal(q.options.E,'Answer not known');
}
const q=n=>src.questions.find(x=>x.number===n);
assert.match(q(164).text,/rN\(N − K\)\/K/);
assert.match(q(164).note,/usual logistic/);
assert.equal(q(163).options.D,'H₂O, NH₄⁺, H₂S, OH⁻');
assert.match(q(169).text,/Passage \(study paraphrase\)/);
assert.equal(q(174).options.A,'IV, I, III, II');
assert.match(q(180).note,/Wellington/);
const make=(raw,combined)=>{
 const parsed=split(combined);
 return {id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:combined.pages,
 questions:parsed.questions.map(q=>({
 number:q.number,text:q.text,options:q.options,sourcePdfPage:q.sourcePdfPage,
 textRecovered:q.textRecovered,complete:q.fourOptionsDetected,sourceStatus:q.textStatus,
 scoreEligible:false,correctAnswer:null,issues:q.issues}))};
};
let stemsBefore=0,stemsAfter=0,optionsBefore=0,optionsAfter=0,count=0;
for(const entry of json(dir+'index.json').entries){
 const raw=json(dir+entry.file),combined=merge(raw,json(dir+'ocr-recovery/'+entry.file)),paper=make(raw,combined);
 for(const prior of reviews.slice(0,-1))apply(paper,prior);
 const previous=new Map(paper.questions.map(x=>[x.number,{complete:x.complete,status:x.sourceStatus,optionA:x.options.A}]));
 stemsBefore+=paper.questions.filter(q=>q.textRecovered).length;
 optionsBefore+=paper.questions.filter(q=>q.complete).length;
 const r=apply(paper,latest);count+=r.added;
 if(raw.id===src.paperId){
  assert.equal(r.added,20);
  for(const spec of src.questions){
   const actual=paper.questions.find(q=>q.number===spec.number);
   assert.equal(actual.text,spec.text);
   assert.equal(actual.sourcePdfPage,spec.sourcePdfPage);
   assert.equal(actual.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.equal(actual.complete,true);
   assert.equal(actual.correctAnswer,null);
   assert.equal(actual.scoreEligible,false);
   assert.equal(previous.get(spec.number).complete,spec.replaceMachineComplete===true);
   for(const l of 'ABCDE')assert.equal(actual.options[l],spec.options[l]);
  }
  assert.equal(apply(paper,latest).added,0);
  const invalid=make(raw,combined);invalid.source='https://example.invalid/other.pdf';
  assert.equal(apply(invalid,latest).added,0);
  const bad=structuredClone(latest);bad.officialFinalKeyMapped=true;
  assert.equal(apply(make(raw,combined),bad).added,0);
 }else assert.equal(r.added,0);
 stemsAfter+=paper.questions.filter(q=>q.textRecovered).length;
 optionsAfter+=paper.questions.filter(q=>q.complete).length;
 assert.equal(paper.questions.length,100);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
 assert.ok(paper.questions.every(q=>q.scoreEligible!==true));
}
assert.equal(stemsBefore,300);
assert.equal(stemsAfter,300);
assert.equal(optionsBefore,152);
assert.equal(optionsAfter,167);
assert.equal(count,20);
const html=read('pyq-typed-library.html');
assert.match(html,/183 of 300 A–D option sets/);
assert.match(html,/remaining 117 option sets still need source cleanup/);
assert.match(read('assets/js/pyq-bulk-reader.js'),/visual-study-recovery-2026-11-24-gs-161-180\.json/);
console.log('PASS: Q161–180, 15 additional A–D sets, five misleading complete groups corrected, no grading; 167/300 provisional sets.');
