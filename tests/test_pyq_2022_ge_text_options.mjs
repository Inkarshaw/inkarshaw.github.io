// Stored source text review is explicitly distinct from scan verification.
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
const earlier=['visual-study-recovery-2026-11-23.json','visual-study-recovery-2026-11-24.json',
 'visual-study-recovery-2026-11-24-general-english.json','visual-study-recovery-2026-11-24-gs-101-122.json',
 'visual-study-recovery-2026-11-24-gs-123-137.json','visual-study-recovery-2026-11-24-gs-142-160.json',
 'visual-study-recovery-2026-11-24-gs-161-180.json','visual-study-recovery-2026-11-24-gs-final.json'].map(n=>json(dir+n));
const latest=['text-study-recovery-2026-11-24-ge-a.json','text-study-recovery-2026-11-24-ge-b.json'].map(n=>json(dir+n));
const specs=latest.flatMap(x=>x.papers[0].questions);
const id=latest[0].papers[0].paperId;
assert.equal(specs.length,49);
assert.equal(new Set(specs.map(x=>x.number)).size,49);
for(const x of latest){
 assert.equal(x.status,'stored-source-text-editorial-study-adaptations-not-verbatim');
 assert.equal(x.gradingEnabled,false);
 assert.equal(x.officialFinalKeyMapped,false);
 assert.equal(x.verifiedOriginalWording,false);
 assert.equal(x.papers.length,1);
 assert.equal(x.papers[0].paperId,id);
 assert.ok(x.papers[0].questions.length<=25);
}
for(const q of specs){
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.scoreEligible,false);
 assert.equal(q.replaceDamagedText,true);
 assert.ok(q.expectedBrokenStart.length>=20);
 assert.ok(q.note.includes('Scan could not be independently reopened'));
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length));
 assert.equal(q.options.E,'Answer not known');
}
const make=(raw,combined)=>({id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:combined.pages,
 questions:split(combined).questions.map(q=>({number:q.number,text:q.text,options:q.options,sourcePdfPage:q.sourcePdfPage,
 textRecovered:q.textRecovered,complete:q.fourOptionsDetected,sourceStatus:q.textStatus,scoreEligible:false,correctAnswer:null,issues:q.issues}))});
let before=0,after=0,added=0,stems=0;
for(const entry of json(dir+'index.json').entries){
 const raw=json(dir+entry.file),combined=merge(raw,json(dir+'ocr-recovery/'+entry.file)),paper=make(raw,combined);
 for(const old of earlier)apply(paper,old);
 before+=paper.questions.filter(q=>q.complete).length;
 const visualCount=paper.visualStudyRecoveries||0;
 const oldStatuses=new Map(paper.questions.map(q=>[q.number,q.sourceStatus]));
 for(const overlay of latest)added+=apply(paper,overlay).added;
 if(raw.id===id){
  assert.equal(paper.textStudyRecoveries,49);
  assert.equal(paper.questions.filter(q=>q.complete).length,70);
  assert.equal(paper.visualStudyRecoveries,visualCount);
  for(const spec of specs){
   const q=paper.questions.find(q=>q.number===spec.number);
   assert.equal(q.text,spec.text);
   assert.equal(q.sourcePdfPage,spec.sourcePdfPage);
   assert.equal(q.sourceStatus,'text-source-editorial-study-not-verbatim');
   assert.equal(q.complete,true);
   assert.equal(q.scoreEligible,false);
   assert.equal(q.correctAnswer,null);
   assert.match(q.issues.join(' '),/NOT visually verified/);
   assert.notEqual(oldStatuses.get(q.number),'visual-source-editorial-study-not-verbatim');
   for(const l of 'ABCDE')assert.equal(q.options[l],spec.options[l]);
  }
  for(const overlay of latest)assert.equal(apply(paper,overlay).added,0);
  // A stored-text overlay cannot replace a complete machine item or claim an official key.
  const trial=make(raw,combined),target=trial.questions.find(q=>q.number===specs[0].number);
  target.complete=true;
  assert.equal(apply(trial,latest[0]).added,24);
  assert.notEqual(target.sourceStatus,'text-source-editorial-study-not-verbatim');
  const absent=make(raw,combined),missing=absent.questions.find(q=>q.number===specs[0].number);
  missing.textRecovered=false;missing.complete=false;
  assert.equal(apply(absent,latest[0]).added,24);
  assert.notEqual(missing.sourceStatus,'text-source-editorial-study-not-verbatim');
  const unsafe=structuredClone(latest[0]);unsafe.officialFinalKeyMapped=true;
  assert.equal(apply(make(raw,combined),unsafe).added,0);
 }else assert.equal(paper.textStudyRecoveries||0,0);
 after+=paper.questions.filter(q=>q.complete).length;
 stems+=paper.questions.filter(q=>q.textRecovered).length;
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
 assert.ok(paper.questions.every(q=>q.scoreEligible!==true));
}
assert.equal(before,183);
assert.equal(after,232);
assert.equal(added,49);
assert.equal(stems,300);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/text-source-editorial-study-not-verbatim/);
assert.match(reader,/stored-text-only/);
assert.match(reader,/text-study-recovery-2026-11-24-ge-a\.json/);
assert.match(reader,/text-study-recovery-2026-11-24-ge-b\.json/);
const html=read('pyq-typed-library.html');
assert.match(html,/99 of 100 provisionally readable A–D sets/);
assert.match(html,/295 of 300 A–D option sets/);
assert.match(html,/remaining 5 option sets still need source cleanup/);
console.log('PASS: 49 source-text-only English option recoveries, 70/100 GE, 232/300 combined; visually inspected status and grading remain unchanged.');

const g4Entry=json(dir+'index.json').entries.find(e=>e.year===2016);
const g4Raw=json(dir+g4Entry.file);
const g4Paper=make(g4Raw,merge(g4Raw,json(dir+'ocr-recovery/'+g4Entry.file)));
for(const o of earlier)apply(g4Paper,o);
assert.equal(g4Paper.questions.filter(q=>q.complete).length,62);
const g4Overlays=['text-study-recovery-2026-11-25-g4-a.json','text-study-recovery-2026-11-25-g4-b.json'].map(n=>json(dir+n));
let g4Added=0;
for(const o of g4Overlays){
 assert.equal(o.gradingEnabled,false);
 assert.equal(o.officialFinalKeyMapped,false);
 assert.equal(o.verifiedOriginalWording,false);
 g4Added+=apply(g4Paper,o).added;
 for(const spec of o.papers[0].questions){
  const q=g4Paper.questions.find(x=>x.number===spec.number);
  assert.equal(q.sourceStatus,'text-source-editorial-study-not-verbatim');
  assert.equal(q.correctAnswer,null);
  assert.equal(q.scoreEligible,false);
  assert.equal(q.options.E,'');
 }
}
assert.equal(g4Added,34);
assert.equal(g4Paper.questions.filter(q=>q.complete).length,96);
assert.deepEqual(Array.from(g4Paper.questions.filter(q=>!q.complete),q=>q.number),[136,142,145,195]);
for(const o of g4Overlays)assert.equal(apply(g4Paper,o).added,0);
assert.match(reader,/text-study-recovery-2026-11-25-g4-a\.json/);
assert.match(reader,/text-study-recovery-2026-11-25-g4-b\.json/);
assert.match(html,/96 of 100 provisionally readable A–D sets/);
console.log('PASS: 34 Group IV 2016 stored-text option recoveries, 96/100; all ungraded.');

const geEntry=json(dir+'index.json').entries.find(e=>e.id.includes('general-english'));
const geRaw=json(dir+geEntry.file);
const gePaper=make(geRaw,merge(geRaw,json(dir+'ocr-recovery/'+geEntry.file)));
for(const o of [...earlier,...latest])apply(gePaper,o);
assert.equal(gePaper.questions.filter(q=>q.complete).length,70);
const geNext=['text-study-recovery-2026-11-25-ge-a.json','text-study-recovery-2026-11-25-ge-b.json'].map(n=>json(dir+n));
let geAdded=0;
for(const o of geNext){
 assert.equal(o.gradingEnabled,false);
 assert.equal(o.verifiedOriginalWording,false);
 assert.equal(o.officialFinalKeyMapped,false);
 geAdded+=apply(gePaper,o).added;
 for(const spec of o.papers[0].questions){
  const q=gePaper.questions.find(q=>q.number===spec.number);
  assert.equal(q.sourceStatus,'text-source-editorial-study-not-verbatim');
  assert.equal(q.scoreEligible,false);
  assert.equal(q.correctAnswer,null);
  assert.equal(q.options.E,'Answer not known');
 }
}
assert.equal(geAdded,29);
assert.equal(gePaper.questions.filter(q=>q.complete).length,99);
assert.deepEqual(Array.from(gePaper.questions.filter(q=>!q.complete),q=>q.number),[40]);
for(const o of geNext)assert.equal(apply(gePaper,o).added,0);
assert.match(reader,/text-study-recovery-2026-11-25-ge-a\.json/);
assert.match(reader,/text-study-recovery-2026-11-25-ge-b\.json/);
console.log('PASS: 29 further English recoveries, 99/100 A–D options, Q40 unresolved, no grading.');
