/* Integrity and missing-data guard for TNPSC Group IV 2024/2025 source-linked typed review. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const keybook=JSON.parse(read('data/quizzes/original-final-keys.json'));
const html=read('tnpsc-g4-typed-review.html');
const js=read('assets/js/tnpsc-g4-typed-review.js');
assert.match(html,/not a verified full-text paper/i);
assert.match(html,/No invented questions/i);
assert.match(html,/source page/i);
assert.match(js,/textStatus|sourceStatus/);
assert.match(js,/sourcePdfPage/);
assert.match(js,/localStorage/);
assert.match(js,/source-pdf-required/,'Source status must remain distinguishable');
assert.match(html,/allowPdfAnswers/,'Optional full original answer-sheet controls are visible');
assert.match(js,/tnpsc-g4-external-readers\.json/,'Source index must load');
assert.match(js,/externalSource/,'Missing text has an independent reading reference');
const idx=JSON.parse(read('data/quizzes/tnpsc-g4-external-readers.json'));
for(const year of [2024,2025]){const pages=idx.years[year].pages;assert.ok(pages.length>20);const numbers=pages.flatMap(p=>Array.from({length:p.end-p.start+1},(_,i)=>p.start+i));assert.deepEqual(numbers,Array.from({length:200},(_,i)=>i+1),'200 external typed-reader positions for '+year);for(const p of pages)assert.match(p.url,/^https:\/\/www\.tnpscguide\.com\/exams\/group-4\/papers\/group-4-20(24|25)-question-paper/)}
assert.match(js,/q\.accepted/,'Key mapping must respect multiple-accepted and ALL');
assert.match(js,/letter of LETTERS/,'All five A–E choices displayed when present');
assert.ok(!js.includes('innerHTML'),'Never inject OCR/user text as markup');
new vm.Script(js,{filename:'assets/js/tnpsc-g4-typed-review.js'});
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(ids.length,new Set(ids).size,'Duplicate DOM ids');
for(const r of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(r[1]),'Referenced id '+r[1]+' exists');
for(const [year,expectedTyped,expectedNumbers] of [
[2024,54,Array.from({length:54},(_,i)=>i+1)],
[2025,200,Array.from({length:200},(_,i)=>i+1)]
]){
const d=JSON.parse(read('data/quizzes/tnpsc-g4-'+year+'-typed-review.json'));
const sourceKeys=keybook.papers.find(p=>p.id===d.paperId);
assert.ok(sourceKeys,'Independent official key mapping found for '+year);
assert.equal(sourceKeys.answers.length,200);
assert.equal(d.exam,'TNPSC Group IV');
assert.equal(d.year,year);
assert.equal(d.originalQuestionCount,200);
assert.equal(d.questions.length,200);
assert.equal(d.status,'incomplete-unverified-typed-draft');
assert.equal(d.verifiedQuestionCount,0,'No OCR falsely certified');
if(year===2025){
 for(let n=43;n<=58;n++){
  const q=d.questions[n-1];
  assert.match(q.transcriptionEvidence,/adapted Tamil draft|editorially adapted Tamil draft/i,'New Q'+n+' retains editorial attribution');
  assert.match(q.sourceReviewStatus,/pending/,'New Q'+n+' is not asserted verbatim');
  assert.match(q.referenceReadingURL,/^https:\/\/www\.tnpscguide\.com\/ta\/exams\/group-4\/papers\/group-4-2025-question-paper\/[67]$/);
 }
 for(let n=59;n<=75;n++){
  const q=d.questions[n-1];
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending','Q'+n+' needs scanned-PDF proofreading');
  assert.match(q.transcriptionEvidence,/adapted Tamil text/,'Q'+n+' must clearly identify adapted wording');
  assert.match(q.referenceReadingURL,/^https:\/\/www\.tnpscguide\.com\/ta\/exams\/group-4\/papers\/group-4-2025-question-paper\/[89]$/);
}
for(let n=76;n<=100;n++){
  const q=d.questions[n-1];
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending','Q'+n+' cannot be certified as exact booklet wording');
  assert.match(q.transcriptionEvidence,/Editorial Tamil adaptation/,'Q'+n+' must disclose editorial rewriting');
  const page=n<=83?10:n<=87?11:n<=91?12:n<=96?13:14;
  assert.equal(q.referenceReadingURL,'https://www.tnpscguide.com/ta/exams/group-4/papers/group-4-2025-question-paper/'+page,'Q'+n+' source index pointer');
}
for(const n of [77,78]){
 assert.equal(d.questions[n-1].keyToken,'C/D','Multi-answer token at Q'+n);
 assert.deepEqual(d.questions[n-1].accepted,['C','D'],'Both final-key answers are valid at Q'+n);
}
const preexisting=new Set([112,113,125]);
for(let n=101;n<=125;n++){
  const q=d.questions[n-1];
  if(preexisting.has(n))continue;
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending','Q'+n+' remains an editorial draft');
  assert.equal(q.translationStatus,'editorial-translation-not-verified-against-official-Tamil','Q'+n+' Tamil translation is not falsely certified');
  assert.match(q.transcriptionEvidence,/Independent editorial English paraphrase and Tamil translation/);
  assert.ok(typeof q.textTamil==='string'&&q.textTamil.length>20,'Q'+n+' has Tamil text');
  assert.ok(['A','B','C','D','E'].every(a=>q.optionsTamil[a].trim().length>0),'Q'+n+' has Tamil options');
  const page=n<=101?14:n<=105?15:n<=110?16:n<=117?17:n<=122?18:19;
  assert.equal(q.referenceReadingURL,'https://www.tnpscguide.com/exams/group-4/papers/group-4-2025-question-paper/'+page);
}

const qAlreadyText=new Set([127,140,146,148]);
if(year===2025){
 for(let n=126;n<=150;n++){
  const q=d.questions[n-1];
  assert.ok(q.textTamil&&q.optionsTamil,'Missing bilingual text for Q'+n);
  assert.ok(['A','B','C','D','E'].every(letter=>String(q.optionsTamil[letter]||'').trim()),'Missing Tamil option Q'+n);
  assert.match(q.translationStatus,/not-verified/,'Tamil translation must be marked for review Q'+n);
  if(qAlreadyText.has(n))continue;
  assert.equal(q.primaryTextLayerReviewed,true,'Q'+n+' must have been checked against primary PDF text layer');
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending','Q'+n+' image proof outstanding');
  assert.match(q.transcriptionEvidence,/TNPSC's primary 2025 Group IV official PDF/);
  const page=n<=128?19:n<=133?20:n<=139?21:n<=148?22:23;
  assert.equal(q.referenceReadingURL,'https://www.tnpscguide.com/exams/group-4/papers/group-4-2025-question-paper/'+page);
 }
 for(let n=151;n<=175;n++){
  const q=d.questions[n-1];
  if(n===151){
   assert.ok(q.text&&q.options&&q.textTamil&&q.optionsTamil,'Adapted dice figure text is now available');
   assert.equal(q.diagramPracticeMode,'dice-figure-text-equivalent');
   assert.equal(q.diagramReviewStatus,'source-image-visual-comparison-required');
   assert.match(q.figureProvenance,/not extracted\/verbatim original diagram/);
   assert.equal(q.options.A,'4');
   assert.match(q.text,/\{2, 3, 5\}/);
   assert.match(q.text,/\{1, 2, 3\}/);
   assert.match(q.text,/\{6, 2, 5\}/);
   continue;
  }
  assert.ok(q.text&&q.options&&q.textTamil&&q.optionsTamil,'Missing bilingual options/stem at Q'+n);
  assert.equal(q.translationStatus,'editorial-translation-not-verified-against-official-Tamil');
  if(n===174)continue; // pre-existing 2025 English stem
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending');
  assert.match(q.transcriptionEvidence,/Independently written English study paraphrase/);
  const srcPage=n<=154?23:n<=158?24:n<=164?25:n<=168?26:n<=174?27:28;
  assert.equal(q.referenceReadingURL,'https://www.tnpscguide.com/exams/group-4/papers/group-4-2025-question-paper/'+srcPage);
}
if(year===2025){
 const keyedAll=d.questions.filter(q=>q.keyToken==='ALL').map(q=>q.number);
 assert.deepEqual(keyedAll,[6,56,74,107,112,138,161,162],'All eight special final-key ALL positions');
 assert.ok(d.questions.slice(100).every(q=>q.textTamil&&q.optionsTamil),'Every 2025 GS / Aptitude position should have a Tamil study translation');
 for(let n=176;n<=200;n++){
  const q=d.questions[n-1];
  assert.ok(q.text&&q.options&&q.textTamil&&q.optionsTamil,'Missing bilingual options at Q'+n);
  if(n===192||n===200)continue; // Existing English drafts gained Tamil study text
  assert.equal(q.sourceReviewStatus,'source-pdf-visual-proof-pending','Not visually proofread: Q'+n);
  assert.match(q.translationStatus,/not-verified/);
  assert.match(q.transcriptionEvidence,/Independent editorial English adaptation/);
  const page=n<=179?28:n<=184?29:n<=188?30:n<=197?31:32;
  assert.equal(q.referenceReadingURL,'https://www.tnpscguide.com/exams/group-4/papers/group-4-2025-question-paper/'+page);
 }
 const fig=d.questions[188];
 assert.equal(fig.diagramPracticeMode,'field-book-figure-text-equivalent');
 assert.equal(fig.diagramReviewStatus,'source-image-visual-comparison-required');
 assert.equal(fig.keyToken,'A');
 assert.equal(fig.options.A,'6550 m²');
 assert.equal((30/2)*50+((30+20)/2)*70+(20/2)*30+(50/2)*80+(50/2)*70,6550,'Field-book numeric text equivalence matches official key');
 assert.equal(d.questions[150].keyToken,'A');
 assert.equal(d.questions[150].diagramTextEquivalenceVerifiedByReasoning,true);
 assert.equal(d.questions[188].diagramTextEquivalenceVerifiedByReasoning,true);
 assert.equal(d.verifiedQuestionCount,0,'All 200 are editorial practice texts, not visually certified verbatim');
}
for(const special of [161,162]){
 assert.equal(d.questions[special-1].keyToken,'ALL','Original final-key ALL marker at '+special);
 assert.deepEqual(d.questions[special-1].accepted,[],'ALL position excluded from provisional score');
}
assert.equal(d.questions[125].keyToken,'B/C');
 assert.deepEqual(d.questions[125].accepted,['B','C'],'Q126 has two final-key accepted answers');
 assert.equal(d.questions[137].keyToken,'ALL');
 assert.deepEqual(d.questions[137].accepted,[],'Q138 must remain ungraded');
}
assert.equal(d.questions[106].keyToken,'ALL','Q107 official ALL answer exception');
assert.deepEqual(d.questions[106].accepted,[],'Q107 is not scored');
assert.equal(d.questions[121].keyToken,'B/C','Q122 official multiple accepted answer exception');
assert.deepEqual(d.questions[121].accepted,['B','C']);
assert.match(html,/id="stemTamil"/,'Tamil separate stem display required');
assert.match(js,/q\.optionsTamil/,'Tamil answer options should render for bilingual records');
assert.match(js,/q\.sourceIssue/,'Source issues must remain available');
assert.match(js,/q\.diagramPracticeMode/,'Adapted diagrams must be labelled as text equivalents');
assert.doesNotMatch(js,/ALL accepted/,'Special ALL key must not be casually described as all choices correct');
assert.equal(d.questions[67].keyToken,'A/B/C','Multiple official answers preserved at Q68');
assert.deepEqual(d.questions[67].accepted,['A','B','C']);
assert.equal(d.questions[73].keyToken,'ALL','Q74 special official key preserved');
assert.deepEqual(d.questions[73].accepted,[],'ALL question is ungraded');
assert.equal(d.questions[55].keyToken,'ALL','Q56 official ALL key is preserved');
 assert.deepEqual(d.questions[55].accepted,[],'Q56 cannot be graded as a single correct answer');
}

assert.equal(d.typedPlayableCount,expectedTyped);
assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:200},(_,i)=>i+1));
const hasText=q=>typeof q.text==='string'&&q.text.length>0;
assert.deepEqual(d.questions.filter(hasText).map(q=>q.number),expectedNumbers);
assert.equal(d.gradedQuestionCount,d.questions.filter(q=>hasText(q)&&q.accepted.length>0).length);
for(const q of d.questions){
const expected=sourceKeys.answers[q.number-1];
assert.equal(q.keyToken,expected,'Official key '+year+' Q'+q.number);
assert.deepEqual(q.accepted,expected==='ALL'?[]:expected.split('/'),'Accepted answers '+year+' Q'+q.number);
assert.ok(q.sourcePdfPage===null||(Number.isInteger(q.sourcePdfPage)&&q.sourcePdfPage>=1&&q.sourcePdfPage<=130));
if(hasText(q)){
assert.ok(q.options&&['A','B','C','D','E'].every(a=>typeof q.options[a]==='string'&&q.options[a].trim()),'Five populated options');
assert.equal(q.textStatus,'editorial-draft-requires-source-proof');
assert.equal(q.sourceStatus,'typed-review-needed');
}else{
assert.equal(q.text,null,'No generated placeholder text in data');
assert.equal(q.options,null,'No guessed options where OCR missing');
assert.equal(q.sourceStatus,'source-pdf-required');
}
}
}
assert.match(read('pyq-hub.html'),/tnpsc-g4-typed-review\.html\?year=2024/);
assert.match(read('pyq-hub.html'),/tnpsc-g4-typed-review\.html\?year=2025/);
assert.match(read('sitemap.xml'),/tnpsc-g4-typed-review\.html/);
console.log('PASS Group IV 2024/2025 source-linked typed reviews: 54 and 200 draft questions, 200 externally readable original slots each, key-mapped without fabricated local text.');
