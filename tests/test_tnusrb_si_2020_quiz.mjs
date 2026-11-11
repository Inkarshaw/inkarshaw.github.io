/* Original-order TNUSRB SI 2020 Series C user-supplied PYQ integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const html=read('tnusrb-si-2020-quiz.html');
const js=read('assets/js/tnusrb-si-2020-quiz.js');
const missing=[46,47,114,115,116];
const blocked=[121];
assert.equal(data.schemaVersion,1);
assert.equal(data.exam,'TNUSRB SI');
assert.equal(data.year,2020);
assert.equal(data.recruitmentYear,2019,'2019 recruitment, 12 January 2020 exam');
assert.equal(data.bookletSeries,'C');
assert.equal(data.originalQuestionCount,140);
assert.equal(data.suppliedQuestionCount,135);
assert.equal(data.questions.length,135);
assert.deepEqual(data.missingNumbers,missing,'Keep five genuinely unavailable source numbers explicit');
assert.deepEqual(data.blockedNumbers,blocked,'Do not grade ambiguous scans, inferred options, missing diagrams or key conflicts');
assert.equal(data.playableQuestionCount,134);
assert.equal(data.ungradedSourceDisputeCount,6);
assert.equal(data.scoredQuestionCount,125);
assert.equal(data.maximumIndicativeMarks,62.5);
assert.deepEqual(data.specialKeyNumbers,[58,111,125]);
assert.equal(data.answerKey.answers.length,140,'Final key has all original positions');
assert.match(data.answerKey.sourcePDF,/Final-Answer-Key-TNUSRB-Sub-Inspector-of-Police-Posts\.pdf$/);
const officialPdf='https://www.tnusrb.tn.gov.in/pdfs/SI_2019_WT_QUESTION.pdf';
assert.equal(data.originalBookletAccess.url,officialPdf);
assert.equal(data.originalBookletAccess.originalBookletVerifiedByClearExams,false,'Source PDF timed out; never certify unseen booklet text');
assert.equal(data.originalBookletAccess.departmentQuotaExcluded,true);
assert.deepEqual(data.sourceRecoveryAudit.blockedOriginalNumbers,blocked,'Manifest must not retain stale 2019/2020 blocked positions');
assert.deepEqual(data.sourceRecoveryAudit.remainingMissingNumbers,missing);
assert.deepEqual(Object.keys(data.missingSourceEvidence).map(Number),missing);
assert.deepEqual(data.missingSourceEvidence['46'].visibleOptions,{A:'45',B:'35',C:'25',D:'15'});
assert.equal(data.missingSourceEvidence['46'].scoringAllowed,false);
assert.equal(data.missingSourceEvidence['47'].visibleOptions.A,null,'Missing matrix option must never be fabricated');
assert.equal(data.missingSourceEvidence['47'].scoringAllowed,false);

const originalNums=data.questions.map(q=>q.number);
assert.equal(new Set(originalNums).size,135);
assert.deepEqual(originalNums,[...originalNums].sort((a,b)=>a-b),'Original order never re-sorted');
assert.deepEqual(Array.from({length:140},(_,i)=>i+1).filter(n=>!originalNums.includes(n)),missing);
for(const q of data.questions){
 assert.ok(q.question&&q.question.trim().length>2,'Q'+q.number+' has supplied stem');
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.ok(Object.values(q.options).every(x=>typeof x==='string'&&x.trim()),'Q'+q.number+' has all four choices');
 assert.equal(q.answerKeyToken,data.answerKey.answers[q.number-1],'Q'+q.number+' correct booklet C key mapping');
 assert.deepEqual(q.acceptedAnswers,q.answerKeyToken==='ALL'||q.scoringStatus==='ungraded_source_dispute'?[]:q.answerKeyToken.split('/'));
 if(blocked.includes(q.number)){
  assert.equal(q.scoringStatus,'blocked_source_incomplete','Q'+q.number+' must stay outside live practice');
  assert.ok(q.sourceIssue&&q.textStatus==='needs_original_source_review');
 }else if([15,22,37,84,95,103].includes(q.number)){
  assert.equal(q.scoringStatus,'ungraded_source_dispute','Q'+q.number+' cross-series/source conflict is not safe to grade');
  assert.match(q.answerReviewReason,q.number===22?/SAARC/:q.number===15?/Series D/:[84,95,103].includes(q.number)?/not.*original Series C|not.*original Series C|not the original Series C/i:/Series C supplied OCR/,'Clearly disclose source discrepancy');
  if(q.number===22)assert.equal(q.options.A,'SAARC');
  assert.deepEqual(q.acceptedAnswers,[]);
 }else if(q.answerKeyToken==='ALL'){
  assert.equal(q.scoringStatus,'ungraded_all_correct');
 }else assert.equal(q.scoringStatus,'scored_with_final_key');
}
assert.deepEqual(data.recoveredOriginalNumbers,[28,29,30,31,32,33,34,35,41,42,44,45,48]);
assert.equal(data.questions.find(q=>q.number===14).options.B,'Ganga–Brahmaputra');
assert.equal(data.questions.find(q=>q.number===14).crossSeriesSource.bookletSeries,'D');
assert.equal(data.questions.find(q=>q.number===14).scoringStatus,'scored_with_final_key');
assert.deepEqual(data.questions.find(q=>q.number===37).acceptedAnswers,[]);
assert.deepEqual(data.questions.find(q=>q.number===37).crossSeriesSource.seriesDOptions,{A:'waist',B:'waste',C:'weist',D:'weste'});
assert.equal(data.questions.find(q=>q.number===42).answerKeyToken,'C','Reader D cannot override Series C key C');
const sample=Object.fromEntries(data.questions.map(q=>[q.number,q]));
for(const [n,key] of Object.entries({1:'B',2:'A',3:'A',4:'A',5:'B',6:'B',7:'D',10:'B',16:'A/D',36:'A',43:'D',52:'B',56:'A/B/D',58:'ALL',69:'A',81:'A/D',89:'A/C',90:'B',98:'D',111:'ALL',122:'A',125:'ALL',140:'B'})){
 assert.equal(sample[Number(n)].answerKeyToken,key,'Paper Series C special answer Q'+n);
}
assert.match(sample[82].question,/ABLMS\s*\|/,'Q82 coding table preserved');
assert.match(sample[83].question,/Paper VII/,'Q83 marks table preserved');
assert.match(sample[89].question,/Maths 90°/,'Q89 chart angles preserved');
assert.match(sample[91].question,/31–45/,'Q91 age percentage data preserved');
assert.match(sample[96].options.C,/two small circles/,'Q96 Venn choices in text');
assert.match(sample[97].question,/466/,'Q97 arranged numbers preserved');
assert.match(sample[107].question,/8¼/,'Q107 fraction rendered');
assert.match(sample[122].question,/243/,'Q122 exponential expression present');
for(const n of [84,95,103]){
 const q=sample[n];
 assert.equal(q.scoringStatus,'ungraded_source_dispute','Reference study figure cannot be graded as original Series C Q'+n);
 assert.equal(q.originalCBookletDiagramVerified,false);
 assert.equal(q.figureStatus,'editorial_comparison_reference_NOT_verbatim_original_series_c');
 assert.deepEqual(q.acceptedAnswers,[]);
 assert.match(q.figureAsset,new RegExp('^assets/figures/tnusrb-si-2020-q'+n+'-reference-ungraded\\.svg
assert.match(html,/134 readable/);
assert.match(html,/id="sourceGaps"/,'The unverified source holes must be shown to the learner');
assert.ok(html.includes('href="'+officialPdf+'"'),'Quiz links board-listed source PDF');
assert.match(html,/The board PDF timed out/,'Never imply unread booklet scan was examined');
assert.match(html,/Q46.*mathematical expressions/,'Partial surviving math question must be clearly disclosed');
assert.match(js,/Q46: a numbered secondary reader preserves A=45/,'Reader Q46 options shown only as secondary source clues');
assert.match(js,/Q47: the reader says/,'Matrix missing without invented matrices');

assert.match(html,/General Candidates written paper/,'Link General Candidates primary paper, not departmental source');
assert.match(html,/Q22's answer-key dispute/);
assert.match(html,/125 provisionally scored/);
assert.match(html,/2019 Recruitment \(Exam 2020\)/);
assert.match(html,/not an official 140-question TNUSRB score/);
assert.match(js,/q\.answerKeyToken!==data\.answerKey\.answers\[q\.number-1\]/);
assert.match(js,/blocked_source_incomplete/);
assert.match(js,/ungraded_source_dispute/);
assert.match(js,/const graded=q.scoringStatus==='scored_with_final_key'/,'Do not count disputed Q22 in marks');
assert.match(js,/migratedAttempt/,'Retain previously saved attempts after Q22 insertion');
assert.match(js,/q.scoringStatus==='scored_with_final_key'&&q.acceptedAnswers.includes\(letter\)/,'No right/wrong highlights for Q22');
assert.ok(!js.includes('innerHTML'),'No source-content HTML injection');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Unique HTML IDs');
for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Referenced DOM ID exists: '+match[1]);
new vm.Script(js,{filename:'assets/js/tnusrb-si-2020-quiz.js'});
assert.match(read('pyq-hub.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb/previous_year_questions.html'),/\.\.\/tnusrb-si-2020-quiz\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2020-quiz\.html/);
const yearArchive=read('tnusrb/previous_year_questions.html');
assert.equal((yearArchive.match(/href="\.\.\/tnusrb-si-2020-quiz\.html" class="card-btn start-test"/g)||[]).length,2,
 '2019 recruitment and 2020 sitting cards both launch same real Series C quiz');
assert.doesNotMatch(yearArchive,/clearexams\.ink\/tnusrb\/\d{4}_(?:si|pc)_question_paper\.html/,
 'No more dead legacy SI and PC paper routes');
assert.doesNotMatch(yearArchive,/Download complete|would download a ZIP|actual implementation/i,
 'Never show fabricated download success or non-existent archive bundles');
assert.match(yearArchive,/SI2022OPENQPANSKEY\.pdf/,'2022 Open candidates link must never point to Departmental source');
assert.match(yearArchive,/JR_2023_Open_Qns\.pdf/,'2023 Open candidate paper retained');
assert.match(yearArchive,/SI_2019_WT_QUESTION\.pdf/,'2019 recruitment/2020 exam board PDF used');
assert.match(yearArchive,/2h 30m/,'Exam duration corrected for Series C');
assert.match(yearArchive,/Total marks/,'Unverified cut-off percentages removed from 2019/2020 cards');

console.log('PASS TNUSRB SI 2020 Series C: 135 numbered records; 134 readable (125 scored, 3 ALL and 6 source-reviewed ungraded); 5 missing and 1 blocked.');
));
 assert.match(q.figureAlt,/Reference|reference|Illustrative/);
 const source=read(q.figureAsset);
 assert.match(source,/NOT a verified Series C|NOT verified Series C|NOT a verified Series C original/,'SVG must disclaim original scan identity');
 assert.match(source,/Ungraded/);
 assert.ok(q.comparisonSourceURLs?.length>=2,'Q'+n+' independent sources declared');
}
assert.deepEqual(data.sourceRecoveryAudit.referenceDiagramRecovery.positions,[84,95,103]);
assert.equal(data.sourceRecoveryAudit.referenceDiagramRecovery.allUngraded,true);
assert.deepEqual(data.blockedNumbers,[121],'Only vertical-arithmetic Q121 remains blocked');
assert.match(html,/id="questionFigure"/,'Reference figure has accessible rendering');
assert.match(html,/id="referenceNote"/,'Editorial drawing disclosure on the question screen');
assert.match(js,/\$\('questionFigure'\)/,'Runtime renders the figure');
assert.match(js,/\$\('referenceNote'\)/,'Runtime labels unverified figures');
assert.match(js,/const old131=questions\.map/,'Previously saved 131-question attempts migrate by numbered positions');

assert.match(html,/134 readable/);
assert.match(html,/id="sourceGaps"/,'The unverified source holes must be shown to the learner');
assert.ok(html.includes('href="'+officialPdf+'"'),'Quiz links board-listed source PDF');
assert.match(html,/The board PDF timed out/,'Never imply unread booklet scan was examined');
assert.match(html,/Q46.*mathematical expressions/,'Partial surviving math question must be clearly disclosed');
assert.match(js,/Q46: a numbered secondary reader preserves A=45/,'Reader Q46 options shown only as secondary source clues');
assert.match(js,/Q47: the reader says/,'Matrix missing without invented matrices');

assert.match(html,/General Candidates written paper/,'Link General Candidates primary paper, not departmental source');
assert.match(html,/Q22's answer-key dispute/);
assert.match(html,/125 provisionally scored/);
assert.match(html,/2019 Recruitment \(Exam 2020\)/);
assert.match(html,/not an official 140-question TNUSRB score/);
assert.match(js,/q\.answerKeyToken!==data\.answerKey\.answers\[q\.number-1\]/);
assert.match(js,/blocked_source_incomplete/);
assert.match(js,/ungraded_source_dispute/);
assert.match(js,/const graded=q.scoringStatus==='scored_with_final_key'/,'Do not count disputed Q22 in marks');
assert.match(js,/migratedAttempt/,'Retain previously saved attempts after Q22 insertion');
assert.match(js,/q.scoringStatus==='scored_with_final_key'&&q.acceptedAnswers.includes\(letter\)/,'No right/wrong highlights for Q22');
assert.ok(!js.includes('innerHTML'),'No source-content HTML injection');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Unique HTML IDs');
for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Referenced DOM ID exists: '+match[1]);
new vm.Script(js,{filename:'assets/js/tnusrb-si-2020-quiz.js'});
assert.match(read('pyq-hub.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb/previous_year_questions.html'),/\.\.\/tnusrb-si-2020-quiz\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2020-quiz\.html/);
const yearArchive=read('tnusrb/previous_year_questions.html');
assert.equal((yearArchive.match(/href="\.\.\/tnusrb-si-2020-quiz\.html" class="card-btn start-test"/g)||[]).length,2,
 '2019 recruitment and 2020 sitting cards both launch same real Series C quiz');
assert.doesNotMatch(yearArchive,/clearexams\.ink\/tnusrb\/\d{4}_(?:si|pc)_question_paper\.html/,
 'No more dead legacy SI and PC paper routes');
assert.doesNotMatch(yearArchive,/Download complete|would download a ZIP|actual implementation/i,
 'Never show fabricated download success or non-existent archive bundles');
assert.match(yearArchive,/SI2022OPENQPANSKEY\.pdf/,'2022 Open candidates link must never point to Departmental source');
assert.match(yearArchive,/JR_2023_Open_Qns\.pdf/,'2023 Open candidate paper retained');
assert.match(yearArchive,/SI_2019_WT_QUESTION\.pdf/,'2019 recruitment/2020 exam board PDF used');
assert.match(yearArchive,/2h 30m/,'Exam duration corrected for Series C');
assert.match(yearArchive,/Total marks/,'Unverified cut-off percentages removed from 2019/2020 cards');

console.log('PASS TNUSRB SI 2020 Series C: 135 numbered records; 134 readable (125 scored, 3 ALL and 6 source-reviewed ungraded); 5 missing and 1 blocked.');
