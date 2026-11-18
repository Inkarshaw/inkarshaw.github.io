import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../assets/js/pyq-source-ocr-overlay.js',import.meta.url),'utf8');
new vm.Script(source);
const context={};vm.runInNewContext(source,context);
const merge=context.ClearExamsPYQOcrOverlay.merge;
const base={schemaVersion:1,id:'test-paper',sourcePdf:'https://www.tnpsc.gov.in/test.pdf',
 draftOnly:true,grading:'disabled',pages:[
  {pdfPage:1,text:'An existing source page with its own trusted text layer; keep the original content unchanged even if OCR differs.'},
  {pdfPage:2,text:'',method:'unreadable-text-layer'}]};
const overlay={schemaVersion:1,paperId:'test-paper',sourcePdf:base.sourcePdf,
 draftOnly:true,verifiedOriginalText:false,officialFinalKeyMapped:false,grading:'disabled',
 pages:[{pdfPage:1,text:'This OCR alternative is readable but must never overwrite an existing source page.',method:'tesseract-tam-eng-unverified'},
  {pdfPage:2,text:'Q. 12. Original scan text machine-recovered with printed choices A B C D; this is not a verified question.',method:'tesseract-tam-eng-unverified'},
  {pdfPage:3,text:'Q. 13. Original scan printed line returned by machine OCR, again no grade is added and no inferred choices.',method:'tesseract-tam-eng-unverified'}]};
const result=merge(base,overlay);
assert.equal(result.pages.length,3);
assert.equal(result.pages[0].text,base.pages[0].text,'Do not replace original extracted text');
assert.ok(result.pages[0].ocrAlternateText.includes('OCR alternative'));
assert.match(result.pages[1].text,/machine-recovered/);
assert.equal(result.pages[2].method,'targeted-machine-ocr-unverified');
assert.equal(result.ocrRecovery.added,2);
assert.equal(result.ocrRecovery.alternative,1);
assert.equal(result.grading,'disabled');
assert.equal(result.sourcePdf,base.sourcePdf);
assert.equal(result.ocrRecovery.verified,false);
assert.equal(merge(base,{...overlay,paperId:'wrong-id'}),base);
assert.equal(merge(base,{...overlay,grading:'enabled'}),base);
assert.equal(merge(base,{...overlay,sourcePdf:'https://evil.test/file.pdf'}),base);
assert.equal(merge(base,{...overlay,officialFinalKeyMapped:true}),base);
const withInvalid=merge(base,{...overlay,pages:[{pdfPage:4,text:'This text is long enough but not a supported machine OCR method and should be rejected.',method:'untrusted-file'}]});
assert.equal(withInvalid,base);
console.log('PASS targeted OCR preserves existing source text and disables score/key inference.');
