/* Combine targeted official-PDF OCR page text with existing ungraded drafts.
   Never change grades, official keys, source identifiers or verified status. */
(function(root){
'use strict';
function merge(original,overlay){
 if(!original||!Array.isArray(original.pages))return original;
 if(!overlay||overlay.schemaVersion!==1||overlay.paperId!==original.id||
    overlay.sourcePdf!==original.sourcePdf||overlay.draftOnly!==true||
    overlay.grading!=='disabled'||overlay.verifiedOriginalText!==false||
    overlay.officialFinalKeyMapped!==false||!Array.isArray(overlay.pages))return original;
 const data=new Map(original.pages.filter(p=>Number.isInteger(p.pdfPage)).map(p=>[p.pdfPage,{...p}]));
 let added=0,alternative=0;
 for(const p of overlay.pages.slice(0,80)){
  if(!p||!Number.isInteger(p.pdfPage)||p.pdfPage<1||p.pdfPage>400||
     typeof p.text!=='string'||p.text.trim().length<60||
     p.method!=='tesseract-tam-eng-unverified')continue;
  const page=data.get(p.pdfPage);
  if(!page||typeof page.text!=='string'||page.text.trim().length<45){
    data.set(p.pdfPage,{pdfPage:p.pdfPage,text:p.text.slice(0,30000),
      method:'targeted-machine-ocr-unverified',machineOcrUnverified:true});
    added++;
  }else{
    page.ocrAlternateText=p.text.slice(0,30000);
    page.machineOcrUnverified=true;
    alternative++;
  }
 }
 if(!added&&!alternative)return original;
 return {...original,
   // Original PDF and all ungraded provenance remain authoritative metadata.
   pages:[...data.values()].sort((a,b)=>a.pdfPage-b.pdfPage),
   sourceTextKind:'machine-text-layer-plus-targeted-ocr-unverified',
   ocrRecovery:{added,alternative,verified:false}
 };
}
root.ClearExamsPYQOcrOverlay={merge};
})(typeof window!=='undefined'?window:globalThis);
