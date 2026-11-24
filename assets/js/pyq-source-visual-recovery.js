/* Carefully bounded, visually inspected *editorial* study recovery.
   Never accept user-uploaded overlays; never assign keys, marks or 'verbatim' status. */
(function(root){
'use strict';
const LETTERS=['A','B','C','D','E'];
const SOURCE_STATUS='visual-source-editorial-study-not-verbatim';
const safeSource=x=>typeof x==='string'&&/^https:\/\/www\.tnpsc\.gov\.in\/Tentative\/Document\//i.test(x);
function apply(paper,overlay){
 let added=0;
 if(!paper||paper.pageOnly||!Array.isArray(paper.questions)||paper.questions.length!==100||
    !overlay||overlay.schemaVersion!==1||overlay.gradingEnabled!==false||
    overlay.officialFinalKeyMapped!==false||overlay.verifiedOriginalWording!==false||
    overlay.status!=='visually-inspected-editorial-study-adaptations-not-verbatim'||
    !Array.isArray(overlay.papers))return {paper,added};
 const record=overlay.papers.find(x=>x&&x.paperId===paper.id&&x.sourcePdf===paper.source);
 if(!record||!safeSource(record.sourcePdf)||!Number.isInteger(record.totalPdfPages)||
    !Array.isArray(record.questions)||record.questions.length>25)return {paper,added};
 const seen=new Set();
 for(const recovery of record.questions){
  if(!recovery||!Number.isInteger(recovery.number)||seen.has(recovery.number)||
     !Number.isInteger(recovery.sourcePdfPage)||recovery.sourcePdfPage<1||
     recovery.sourcePdfPage>record.totalPdfPages||
     recovery.verifiedOriginalWording!==false||recovery.officialFinalKeyMapped!==false||
     recovery.scoreEligible!==false||typeof recovery.text!=='string'||
     recovery.text.trim().length<15||recovery.text.length>750||
     !recovery.options||LETTERS.some(l=>typeof recovery.options[l]!=='string')||
     LETTERS.slice(0,4).some(l=>recovery.options[l].trim().length===0)||
     typeof recovery.note!=='string'||recovery.note.trim().length<20)continue;
  seen.add(recovery.number);
  const q=paper.questions.find(x=>x.number===recovery.number);
  const sourceMissing=q&&q.textRecovered===false&&q.complete===false&&
   (q.sourcePdfPage===null||q.sourcePdfPage===recovery.sourcePdfPage);
  const sourceCorrupt=q&&recovery.replaceDamagedText===true&&q.textRecovered===true&&
   q.complete===false&&q.sourcePdfPage===recovery.sourcePdfPage&&
   typeof recovery.expectedBrokenStart==='string'&&recovery.expectedBrokenStart.length>=20&&
   typeof q.text==='string'&&q.text.startsWith(recovery.expectedBrokenStart);
  // A few source PDF English alternatives were mistakenly represented by the
  // Tamil OCR option group. Replace only when exact old source content matches.
  const sourceMisclassifiedComplete=q&&recovery.replaceMachineComplete===true&&
   q.textRecovered===true&&q.complete===true&&
   q.sourceStatus==='machine-split-complete-unverified'&&
   q.sourcePdfPage===recovery.sourcePdfPage&&
   typeof recovery.expectedBrokenStart==='string'&&recovery.expectedBrokenStart.length>=20&&
   typeof q.text==='string'&&q.text.startsWith(recovery.expectedBrokenStart)&&
   typeof recovery.expectedExistingOptionAPrefix==='string'&&
   recovery.expectedExistingOptionAPrefix.length>=8&&
   typeof q.options?.A==='string'&&
   q.options.A.startsWith(recovery.expectedExistingOptionAPrefix);
  if(!sourceMissing&&!sourceCorrupt&&!sourceMisclassifiedComplete)continue;
  q.text=recovery.text;
  q.options=Object.fromEntries(LETTERS.map(l=>[l,recovery.options[l]]));
  q.textRecovered=true;
  q.complete=true;
  q.sourcePdfPage=recovery.sourcePdfPage;
  q.sourceStatus=SOURCE_STATUS;
  q.scoreEligible=false;
  q.correctAnswer=null;
  q.issues=['Source-image-inspected English study adaptation, NOT verbatim. No verified key or score.',recovery.note];
  added++;
 }
 paper.visualStudyRecoveries=(paper.visualStudyRecoveries||0)+added;
 return {paper,added};
}
root.ClearExamsPYQVisualRecovery={apply,SOURCE_STATUS};
})(typeof window!=='undefined'?window:globalThis);
