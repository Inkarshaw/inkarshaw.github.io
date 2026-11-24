// Official CCS2E/2022 General English: 20 source-image-reviewed ungraded retypes.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const context={};
for(const p of [
 'assets/js/pyq-source-text-splitter.js',
 'assets/js/pyq-source-ocr-overlay.js',
 'assets/js/pyq-source-visual-recovery.js'
])vm.runInNewContext(read(p),context,{filename:p,timeout:3000});
const split=context.ClearExamsPYQSourceSplitter.parse;
const merge=context.ClearExamsPYQOcrOverlay.merge;
const apply=context.ClearExamsPYQVisualRecovery.apply;
const dir='data/quizzes/pyq-reader-drafts/';
const index=json(dir+'index.json');
const old=json(dir+'visual-study-recovery-2026-11-23.json');
const gs=json(dir+'visual-study-recovery-2026-11-24.json');
const ge=json(dir+'visual-study-recovery-2026-11-24-general-english.json');
assert.equal(ge.schemaVersion,1);
assert.equal(ge.status,'visually-inspected-editorial-study-adaptations-not-verbatim');
assert.equal(ge.gradingEnabled,false);
assert.equal(ge.officialFinalKeyMapped,false);
assert.equal(ge.verifiedOriginalWording,false);
assert.equal(ge.papers.length,1);
assert.equal(ge.papers[0].questions.length,20);
const expected=[22,56,59,60,61,62,75,76,77,78,79,84,85,86,87,93,94,95,96,100];
assert.deepEqual(ge.papers[0].questions.map(q=>q.number),expected);
const pageFor={22:7,56:16,59:17,60:17,61:17,62:17,75:21,76:21,
77:21,78:21,79:21,84:23,85:23,86:23,87:23,93:25,94:25,95:25,96:25,100:26};
for(const q of ge.papers[0].questions){
 assert.equal(q.sourcePdfPage,pageFor[q.number]);
 assert.equal(q.verifiedOriginalWording,false);
 assert.equal(q.officialFinalKeyMapped,false);
 assert.equal(q.scoreEligible,false);
 assert.ok(q.text.length>=20);
 assert.ok(['A','B','C','D','E'].every(l=>typeof q.options[l]==='string'&&q.options[l].length>0));
 assert.ok(q.note.includes(String(q.number))&&q.note.includes('official PDF'));
}
assert.match(ge.papers[0].questions.find(q=>q.number===100).text,/Column A:[\\s\\S]*Column B:/);
assert.deepEqual(['A','B','C','D'].map(l=>ge.papers[0].questions.find(q=>q.number===100).options[l]),
 ['4, 2, 3, 1','3, 4, 1, 2','1, 2, 4, 3','3, 1, 4, 2']);
const buildPaper=(raw)=>{
 const parsed=split(raw);
 return {id:raw.id,source:raw.sourcePdf,pageOnly:false,pages:raw.pages,
  questions:parsed.questions.map(q=>({
   number:q.number,text:q.text,options:q.options,
   sourcePdfPage:q.sourcePdfPage,textRecovered:q.textRecovered,
   complete:q.fourOptionsDetected,sourceStatus:q.textStatus,
   scoreEligible:false,correctAnswer:null,issues:q.issues
  }))};
};
const sourceFile=ge.papers[0].paperId+'.json';
const original=json(dir+sourceFile);
const ocr=json(dir+'ocr-recovery/'+sourceFile);
assert.equal(ge.papers[0].sourcePdf,original.sourcePdf);
assert.equal(original.questionCandidates.length,0);
const rawStudy=buildPaper(original);
assert.equal(rawStudy.questions.length,100);
assert.equal(rawStudy.questions.filter(q=>q.textRecovered).length,80);
let rawAdded=apply(rawStudy,ge);
assert.equal(rawAdded.added,20,'Raw PDF text-layer fallback must restore all 20 missing stems');
assert.equal(rawStudy.questions.filter(q=>q.textRecovered).length,100);
assert.equal(apply(rawStudy,ge).added,0,'No re-applying edited questions');

let beforeStems=0,beforeOptions=0,afterStems=0,afterOptions=0,totalNewApplied=0;
for(const entry of index.entries){
 const raw=json(dir+entry.file);
 const hasOcr=entry.id===ge.papers[0].paperId;
 const combined=hasOcr?merge(raw,ocr):raw;
 const paper=buildPaper(combined);
 assert.equal(paper.questions.length,100);
 apply(paper,old);
 apply(paper,gs);
 beforeStems+=paper.questions.filter(q=>q.textRecovered).length;
 beforeOptions+=paper.questions.filter(q=>q.complete).length;
 const newly=apply(paper,ge);
 totalNewApplied+=newly.added;
 const isEnglish=entry.id===ge.papers[0].paperId;
 if(isEnglish){
  const uncovered=[];
  for(const n of expected){
   const actual=paper.questions.find(q=>q.number===n);
   const manual=ge.papers[0].questions.find(q=>q.number===n);
   if(actual.text!==manual.text)uncovered.push({n,stem:actual.text.slice(0,90),status:actual.sourceStatus,
    recovered:actual.textRecovered,complete:actual.complete,page:actual.sourcePdfPage});
  }
  assert.deepEqual(uncovered,[],'Every missing English question must use reviewed source text');
  assert.equal(paper.visualStudyRecoveries,newly.added);
  assert.equal(paper.questions.filter(q=>q.textRecovered).length,100);
  for(const n of expected){
   const q=paper.questions.find(x=>x.number===n);
   assert.equal(q.complete,true);
   assert.equal(q.sourceStatus,'visual-source-editorial-study-not-verbatim');
   assert.equal(q.correctAnswer,null);
   assert.equal(q.scoreEligible,false);
   assert.match(q.issues.join(' '),/NOT verbatim/);
   assert.ok(['A','B','C','D'].every(l=>q.options[l]));
  }
  assert.equal(apply(paper,ge).added,0,'No re-application after OCR recovery');
 }else assert.equal(newly.added,0,'English-only manual retypes cannot alter unrelated questions');
 assert.equal(paper.questions.filter(q=>q.scoreEligible===true).length,0);
 assert.equal(new Set(paper.questions.map(q=>q.number)).size,100);
 afterStems+=paper.questions.filter(q=>q.textRecovered).length;
 afterOptions+=paper.questions.filter(q=>q.complete).length;
}
assert.ok(beforeStems>=280&&beforeStems<=300,'Existing OCR may add extra stems before manual recovery');
assert.ok(beforeOptions>=96&&beforeOptions<=116);
assert.equal(afterStems,300);
assert.equal(afterOptions,116);
assert.ok(totalNewApplied>=15&&totalNewApplied<=20,'OCR additions must be explicit and ungraded');
const tampered=structuredClone(ge);tampered.officialFinalKeyMapped=true;
const trial=buildPaper(original);
assert.equal(apply(trial,tampered).added,0);
const wrongSource=buildPaper(original);
wrongSource.source='https://example.invalid/counterfeit-paper.pdf';
assert.equal(apply(wrongSource,ge).added,0);
const reader=read('assets/js/pyq-bulk-reader.js');
assert.match(reader,/visual-study-recovery-2026-11-24-general-english\\.json/);
assert.match(read('pyq-typed-library.html'),/All 300 original-numbered positions now have readable English study stems/);
assert.match(read('pyq-typed-library.html'),/116 A–D option sets/);
assert.ok(!reader.includes('innerHTML'));
console.log('PASS: all 20 missing 2022 General English study questions restored; total 300/300 stems, 116 A-D study option sets; no verified marks.');
