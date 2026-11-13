/* ClearExams Group I 2026 source mapping: never confuse local review with official scoring. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const source=JSON.parse(read('data/quizzes/tnpsc-group-i-2026-prelims-text.json'));
const html=read('tnpsc-g1-2026-key-review.html');
const js=read('assets/js/tnpsc-g1-2026-key-review.js');
assert.equal(source.questions.length,200);
assert.equal(source.textReadyCount,198);
assert.equal(source.needsReviewCount,2);
assert.deepEqual(source.sourceReviewQuestionNumbers,[98,200]);
assert.deepEqual(source.secondaryTextReviewQuestionNumbers,[13,35,94,96,192]);
assert.equal(source.keyedAnswerCount,0);
assert.ok(source.questions.every(q=>q.answer===null),'No answers released from unapproved source guide');
for(const n of source.secondaryTextReviewQuestionNumbers){
 const q=source.questions[n-1];
 assert.equal(q.sourceStatus,'secondary_source_text_cross_checked');
 assert.equal(q.sourceComparison.originalTNPSCSpecimenVerified,false);
 assert.ok(Number.isInteger(q.sourceComparison.guideQuestionNumber));
 assert.ok(Number.isInteger(q.sourceComparison.pdfPage));
 assert.match(q.sourceComparison.sourceUrl,/tnpscfactory\.com\/blog/);
}
assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
assert.match(html,/local-only|browser/);
assert.match(html,/Editorial workbench, not a marks calculator/);
assert.match(html,/official tick-marked 2026 specimen PDF/);
assert.match(html,/TNPSC Factory study guide/);
assert.match(html,/mandatory for Q98 and Q200/);
assert.match(html,/Import saved JSON/);
assert.match(html,/Export 200-position review JSON/);
assert.match(html,/Select the downloaded specimen PDF/);
assert.match(html,/the PDF is not included in exported JSON/);
for(const id of ['specimenFile','specimenStatus','specimenJump','specimenOpen','specimenClose','specimenViewer','specimenFrame']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing local PDF review control '+id);
}
assert.match(html,/type="file" id="specimenFile" accept="\.pdf,application\/pdf"/);
assert.match(html,/referrerpolicy="no-referrer"/);
assert.match(js,/PDF_MAX_BYTES=80\*1024\*1024/);
assert.match(js,/PDF_HEADER='%PDF-'/);
assert.match(js,/await file\.slice\(0,5\)\.arrayBuffer\(\)/);
assert.match(js,/URL\.createObjectURL\(file\)/);
assert.match(js,/URL\.revokeObjectURL\(localPdfObjectUrl\)/);
assert.match(js,/specimenFrame/);
assert.match(js,/localPdfObjectUrl\+'#page='\+page/);
assert.match(js,/authenticity is NOT verified/,'Valid PDF header cannot establish TNPSC source authenticity');
assert.ok(!/\.fetch\(|fetch\(.*specimenFile/.test(js),'Selected PDF is never transmitted by the review app');
assert.ok(!js.includes('JSON.stringify(file)'),'Do not serialize local PDF into review export');

assert.match(html,/tnpsc-g1-2026-key-review\.js/);
assert.ok(read('pyq-scoring-review.html').includes('tnpsc-g1-2026-key-review.html'));
assert.ok(read('tnpsc-g1-2026-quiz.html').includes('tnpsc-g1-2026-key-review.html'));
for(const id of ['slot','prev','next','question','choices','sourceContext','specimenNumber','pdfPage',
 'officialTick','typedChoice','printedChoice','stemChecked','choicesChecked','tickChecked','figureChecked',
 'reviewNotes','recordStatus','save','clear','export','importJson','erase','reviewedCount','draftCount','pendingCount']){
 assert.match(html,new RegExp('id="'+id+'"'),'Missing workbench control '+id);
}
assert.equal([...html.matchAll(/id="([^"]+)"/g)].length,new Set([...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1])).size,'Unique control IDs');
assert.ok(!js.includes('innerHTML'),'Question text and imported evidence never inserted as HTML');
assert.match(js,/localStorage\.setItem/);
assert.match(js,/secondary_source_text_cross_checked/,'Reviewer sees the secondary source status separately from official');
assert.match(js,/duplicateSpecimen/,'Specimen number collision must be detected');
assert.match(js,/r\.stemChecked&&r\.choicesChecked&&r\.tickChecked/,'Require all source checks');
assert.match(js,/number!==98&&number!==200\|\|r\.figureChecked/,'Both incomplete dice questions require inspected original figures');
assert.match(js,/NOT_APPROVED|Not an official answer key|No student scoring is authorized/i);
assert.ok(!js.includes('fetch(OFFICIAL'),'The workbench is not auto-scraping ticked scanned PDFs');
assert.ok(!js.includes('correctAnswer'),'No unverified public answer assignment');
assert.ok(!js.includes('scoredQuestionCount'),'Editorial progress never changes student scoreable totals');
new vm.Script(js,{filename:'assets/js/tnpsc-g1-2026-key-review.js'});
console.log('PASS 2026 key workbench: 200 slots, local 80MB PDF signature verification, revocable in-browser PDF previews and original-key safety; no public scores.');
