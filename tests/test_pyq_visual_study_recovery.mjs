// Official-page screenshot review may restore study text, never certify originals or grades.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const context={};
vm.runInNewContext(read('assets/js/pyq-source-text-splitter.js'),context,{timeout:3000});
vm.runInNewContext(read('assets/js/pyq-source-visual-recovery.js'),context,{timeout:3000});
const splitter=context.ClearExamsPYQSourceSplitter;
const recovery=context.ClearExamsPYQVisualRecovery;
assert.equal(typeof recovery.apply,'function');
const overlay=json('data/quizzes/pyq-reader-drafts/visual-study-recovery-2026-11-23.json');
assert.equal(overlay.gradingEnabled,false);
assert.equal(overlay.officialFinalKeyMapped,false);
assert.equal(overlay.verifiedOriginalWording,false);
assert.equal(overlay.papers.length,2);
assert.equal(overlay.papers.reduce((s,x)=>s+x.questions.length,0),8);
const index=json('data/quizzes/pyq-reader-drafts/index.json');
const expected={
 'tnpsc-group-iv-2016-06-11-2016-g4-gs-3a616959':[130,191],
 'tnpsc-group-ii-iia-2022-general-studies-ccs2e-2022-answer-key-opt-5aaa9a34':[140,153,158,192,199,200]
};
let totalBefore=0,totalAfter=0,completeBefore=0,completeAfter=0,added=0;
for(const entry of index.entries){
 const raw=json('data/quizzes/pyq-reader-drafts/'+entry.file);
 const parsed=splitter.parse(raw);
 assert.equal(parsed.questions.length,100);
 const paper={id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:raw.pages,
  questions:parsed.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,
   sourcePdfPage:q.sourcePdfPage,textRecovered:q.textRecovered,
   complete:q.fourOptionsDetected,sourceStatus:q.textStatus,
   scoreEligible:false,correctAnswer:null,issues:q.issues
  }))};
 totalBefore+=paper.questions.filter(x=>x.textRecovered).length;
 completeBefore+=paper.questions.filter(x=>x.complete).length;
 const before191=paper.questions.find(q=>q.number===191);
 if(raw.id.includes('group-iv-2016')){
  assert.equal(before191.textRecovered,true);
  assert.equal(before191.complete,false);
  assert.match(before191.text,/If x = ; then the/);
 }
 const r=recovery.apply(paper,overlay);
 assert.equal(r.paper,paper);
 assert.equal(r.added,(expected[raw.id]||[]).length);
 assert.equal(paper.visualStudyRecoveries||0,r.added);
 added+=r.added;
 for(const n of expected[raw.id]||[]){
  const q=paper.questions.find(x=>x.number===n);
  const source=overlay.papers.find(p=>p.paperId===raw.id).questions.find(x=>x.number===n);
  assert.equal(q.text,source.text,'Study question wording changed from reviewed overlay');
  assert.equal(q.sourcePdfPage,source.sourcePdfPage);
  assert.equal(q.complete,true);
  assert.equal(q.textRecovered,true);
  assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
  assert.ok(['A','B','C','D'].every(l=>q.options[l]));
  assert.equal(q.scoreEligible,false);
  assert.equal(q.correctAnswer,null);
  assert.match(q.issues.join(' '),/NOT verbatim/);
 }
 const rerun=recovery.apply(paper,overlay);
 assert.equal(rerun.added,0,'Reviewed edits must not overwrite a now-readable question');
 totalAfter+=paper.questions.filter(x=>x.textRecovered).length;
 completeAfter+=paper.questions.filter(x=>x.complete).length;
 assert.equal(paper.questions.length,100);
 assert.equal(paper.questions.some(q=>q.scoreEligible===true),false);
}
assert.equal(totalBefore,272,'Unedited PDF text extraction baseline shifted');
assert.equal(completeBefore,86,'Unedited source A–D machine split baseline shifted');
assert.equal(added,8,'Seven missing stems and one source-corrupt equation repaired');
assert.equal(totalAfter,279);
assert.equal(completeAfter,94);
const g4=json('data/quizzes/pyq-reader-drafts/tnpsc-group-iv-2016-06-11-2016-g4-gs-3a616959.json');
const q130=overlay.papers[0].questions.find(q=>q.number===130);
assert.match(q130.text,/Kandla.*Jawaharlal Nehru.*Paradip.*Haldia/);
const q191=overlay.papers[0].questions.find(q=>q.number===191);
assert.match(q191.text,/\(7\/12\)\^\(-4\)/);
const g2=overlay.papers[1].questions;
assert.equal(g2.find(q=>q.number===200).sourcePdfPage,66);
assert.equal(g2.find(q=>q.number===199).options.A,'80');
assert.equal(g2.find(q=>q.number===192).options.D,'4½ hours');
const parsed=splitter.parse(g4);
const wrong={id:g4.id,source:'https://example.invalid/other.pdf',pageOnly:false,
 pages:g4.pages,questions:parsed.questions.map(q=>({
 number:q.number,text:q.text,sourcePdfPage:q.sourcePdfPage,
 textRecovered:q.textRecovered,complete:q.fourOptionsDetected
 }))};
assert.equal(recovery.apply(wrong,overlay).added,0,'No cross-paper/cross-source answer contamination');
const tampered=JSON.parse(JSON.stringify(overlay));
tampered.gradingEnabled=true;
wrong.source=g4.sourcePdf;
assert.equal(recovery.apply(wrong,tampered).added,0,'Cannot make editorial source-overlay scored');
const html=read('pyq-bulk-reader.html'),reader=read('assets/js/pyq-bulk-reader.js');
assert.match(html,/pyq-source-visual-recovery\.js/);
assert.match(reader,/visual-study-recovery-2026-11-23\.json/);
assert.match(reader,/EDITORIAL ENGLISH STUDY ADAPTATION/);
assert.match(read('pyq-typed-library.html'),/280 readable study question stems/);
assert.ok(!reader.includes('innerHTML'),'Unverified content must be inserted as text only');
console.log('PASS: 7 new stems + 1 damaged mathematical question repaired from official page image; 279/300 readable stems, 94 provisional A-D option sets, zero grades.');
