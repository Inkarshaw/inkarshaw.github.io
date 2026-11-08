// Staged 2024 original question extraction must preserve source order and never auto-publish OCR.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const staged=read('data/quizzes/tnpsc-g4-2024-original-questions.json');
const pageIndex=read('data/quizzes/tnpsc-g4-2024-original-page-index.json');
const official=read('data/quizzes/original-final-keys.json').papers.find(x=>x.id===staged.paperId);
assert.equal(staged.totalOriginalQuestions,200);
assert.equal(staged.questions.length,200);
assert.equal(staged.questionTextVerified,0,'OCR candidates have no implied text verification');
assert.ok(/draft|staging/.test(staged.sourceDigitization));
const pages=Array(200).fill(0);
for(const span of pageIndex.pageSpans)for(let i=span.firstQuestion;i<=span.lastQuestion;i++)pages[i-1]=span.pdfPage;
const valid=['not_extracted','manual_source_inspection_pending_review','ocr_full_candidate_unverified','ocr_partial_candidate_unverified'];
for(let i=0;i<200;i++){
 const q=staged.questions[i];
 assert.equal(q.number,i+1,'original order and serial number');
 assert.equal(q.sourcePdfPage,pages[i],'matching official source PDF page');
 assert.equal(q.finalKeyToken,official.answers[i],'matching verified full final-key token');
 assert.deepEqual(q.correctAnswers,q.finalKeyToken==='ALL'?[]:q.finalKeyToken.split('/'));
 assert.ok(valid.includes(q.textStatus),'do not mark OCR verified without source review');
 assert.ok(q.options&&Object.keys(q.options).sort().join('')==='ABCDE');
 if(q.textStatus==='not_extracted')assert.equal(q.question,null);
}
assert.equal(staged.questionTextCoverage,staged.questions.filter(x=>!!x.question).length);
console.log('PASS 200 JSON original source slots, final keys and draft-only textual extraction states.');
