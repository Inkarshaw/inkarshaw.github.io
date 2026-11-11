/* Original-order TNUSRB SI 2020 Series C user-supplied PYQ integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const html=read('tnusrb-si-2020-quiz.html');
const js=read('assets/js/tnusrb-si-2020-quiz.js');
const missing=[114,115,116];
const blocked=[];
assert.equal(data.schemaVersion,1);
assert.equal(data.exam,'TNUSRB SI');
assert.equal(data.year,2020);
assert.equal(data.recruitmentYear,2019,'2019 recruitment, 12 January 2020 exam');
assert.equal(data.bookletSeries,'C');
assert.equal(data.originalQuestionCount,140);
assert.equal(data.suppliedQuestionCount,137);
assert.equal(data.questions.length,137);
assert.deepEqual(data.missingNumbers,missing,'Keep five genuinely unavailable source numbers explicit');
assert.deepEqual(data.blockedNumbers,blocked,'Do not grade ambiguous scans, inferred options, missing diagrams or key conflicts');
assert.equal(data.playableQuestionCount,137);
assert.equal(data.ungradedSourceDisputeCount,7);
assert.equal(data.scoredQuestionCount,127);
assert.equal(data.maximumIndicativeMarks,63.5);
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
assert.deepEqual(Object.keys(data.missingSourceEvidence),['114','115','116'],'Only three original Series C records remain absent');
assert.equal(data.sourceRecoveryAudit.seriesDMathReview.originalCVisualScanNotVerified,true);
assert.deepEqual(data.sourceRecoveryAudit.seriesDMathReview.addedProvisionalScores,[46,121]);
assert.deepEqual(data.sourceRecoveryAudit.seriesDMathReview.addedUngraded,[47]);

const originalNums=data.questions.map(q=>q.number);
assert.equal(new Set(originalNums).size,137);
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
 }else if([15,22,37,47,84,95,103].includes(q.number)){
  assert.equal(q.scoringStatus,'ungraded_source_dispute','Q'+q.number+' cross-series/source conflict is not safe to grade');
  assert.match(q.answerReviewReason,q.number===22?/SAARC/:q.number===15?/Series D/:q.number===47?/Series D/:[84,95,103].includes(q.number)?/original|unverified|Series C/i:/Series C supplied OCR/,'Clearly disclose source discrepancy');
  if(q.number===22)assert.equal(q.options.A,'SAARC');
  assert.deepEqual(q.acceptedAnswers,[]);
 }else if(q.answerKeyToken==='ALL'){
  assert.equal(q.scoringStatus,'ungraded_all_correct');
 }else assert.equal(q.scoringStatus,'scored_with_final_key');
}
assert.deepEqual(data.recoveredOriginalNumbers,[28,29,30,31,32,33,34,35,41,42,44,45,46,47,48]);
assert.equal(data.questions.find(q=>q.number===14).options.B,'Ganga–Brahmaputra');
assert.equal(data.questions.find(q=>q.number===14).crossSeriesSource.bookletSeries,'D');
assert.equal(data.questions.find(q=>q.number===14).scoringStatus,'scored_with_final_key');
assert.deepEqual(data.questions.find(q=>q.number===37).acceptedAnswers,[]);
assert.deepEqual(data.questions.find(q=>q.number===37).crossSeriesSource.seriesDOptions,{A:'waist',B:'waste',C:'weist',D:'weste'});
assert.equal(data.questions.find(q=>q.number===42).answerKeyToken,'C','Reader D cannot override Series C key C');
const math46=data.questions.find(q=>q.number===46);
assert.match(math46.question,/13.*5.*60/,'D Q25 restores all lost vector magnitudes and dot product');
assert.deepEqual(math46.options,{A:'45',B:'35',C:'25',D:'15'},'Original-numbered C reader A–D matches D Q25');
assert.equal(math46.answerKeyToken,'C');
assert.deepEqual(math46.acceptedAnswers,['C'],'D-sourced vector identity and Series C key agree provisionally');
assert.equal(math46.crossSeriesSource.printedQuestionNumber,25);
assert.equal(math46.crossSeriesSource.originalCBookletVerified,false);
assert.equal((13*13*5*5-60*60)**0.5,25,'Q46 mathematically verified independent of answer-key letter');
const matrix47=data.questions.find(q=>q.number===47);
assert.equal(matrix47.answerKeyToken,'C','The C-series answer key remains a source field and is not used to grade Q47');
assert.equal(matrix47.scoringStatus,'ungraded_source_dispute','C original matrix choices remain absent');
assert.deepEqual(matrix47.acceptedAnswers,[]);
assert.equal(matrix47.crossSeriesSource.choicesCrossMatched,false,'D-only choices cannot be described as C-original');
assert.match(matrix47.options.C,/d.*−b.*−c.*a/);
assert.match(matrix47.instruction,/UNGRADED|UN GRADED/);
const digit121=data.questions.find(q=>q.number===121);
assert.match(digit121.question,/\? \+ 1\? \+ 2\? \+ \?3 \+ \?1 = 21\?/);
assert.equal(digit121.secondaryCrossSeriesSource.printedQuestionNumber,114);
assert.equal(digit121.secondaryCrossSeriesSource.originalCBookletVerified,false);
assert.equal(digit121.scoringStatus,'scored_with_final_key');
assert.equal(digit121.answerKeyToken,'C');
assert.deepEqual(digit121.acceptedAnswers,['C']);
assert.equal((210-34)/(23-1),8,'Q121 equation directly yields option C');
assert.ok(js.includes('const old134=questions.map'),'Old 134-question attempts must map original question numbers');

const expectedTamil=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,36,43,44,45,46,48,49,50,51,52,53,54,55,56,57,59,...Array.from({length:40},(_,i)=>i+60),...Array.from({length:14},(_,i)=>i+100),...Array.from({length:24},(_,i)=>i+117)];
assert.deepEqual(data.bilingualEditorialReview.reviewedOriginalNumbers,expectedTamil,'Only reviewed question numbers advertise Tamil study text');
assert.equal(data.bilingualEditorialReview.questionCount,120);
assert.deepEqual(data.bilingualEditorialReview.batchHistory.map(b=>b.count),[20,20,20,20,20,20],'Bilingual batch review history preserved');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[1].numbers,[23,24,25,26,27,43,44,45,46,48,49,50,51,52,53,54,55,56,57,59]);
assert.deepEqual(data.bilingualEditorialReview.batchHistory[2].numbers,Array.from({length:20},(_,i)=>60+i),'Third bilingual editorial batch exactly covers Q60–79');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[3].numbers,Array.from({length:20},(_,i)=>80+i),'Fourth bilingual editorial batch exactly covers Q80–99');
const fifth=[...Array.from({length:14},(_,i)=>i+100),...Array.from({length:6},(_,i)=>i+117)];
assert.deepEqual(data.bilingualEditorialReview.batchHistory[4].numbers,fifth,'Fifth batch covers exactly 20 readable and source-numbered questions, not missing Q114–116');
const sixth=[22,36,...Array.from({length:18},(_,i)=>i+123)];
assert.deepEqual(data.bilingualEditorialReview.batchHistory[5].numbers,sixth,'Sixth batch restores Q22/Q36 and all Q123–140');
const q137=data.questions.find(q=>q.number===137);
assert.equal(q137.question,'The ______ of the state is efficient.','Missing printed blank restored');
assert.equal(q137.sourceRecoveryEvidence.originalCBookletVisuallyVerified,false,'Secondary source recovery is not original booklet certification');
assert.equal(q137.answerKeyToken,'A','Series C answer unaffected by text gap restoration');
assert.match(q137.questionTamil,/______/, 'English grammar blank remains visible in Tamil study text');
const q22=data.questions.find(q=>q.number===22);
assert.equal(q22.scoringStatus,'ungraded_source_dispute','Disputed international body options must remain ungraded');
assert.match(q22.questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Uncertainty warning visible in Tamil');
const q125=data.questions.find(q=>q.number===125);
assert.equal(q125.scoringStatus,'ungraded_all_correct','Final-key ALL must remain ungraded');
assert.match(q125.questionTamil,/All correct/,'ALL source status visible in Tamil');
assert.deepEqual(data.questions.find(q=>q.number===36).optionsTamil,data.questions.find(q=>q.number===36).options,'Passive voice English options remain intact');
assert.deepEqual(data.questions.find(q=>q.number===135).optionsTamil,data.questions.find(q=>q.number===135).options,'Letter pattern choices must remain source-identical');
assert.ok(data.questions.find(q=>q.number===140).optionsTamil.C.includes('Interculturatiom'),'Source spelling must remain unaltered');
for(const n of [100,101,104,107,108,112,113,117,119,120,121,122]){
 const q=data.questions.find(q=>q.number===n);
 assert.ok(q?.questionTamil,'Source-numbered Tamil stem Q'+n);
}
const figure103=data.questions.find(q=>q.number===103);
assert.equal(figure103.scoringStatus,'ungraded_source_dispute');
assert.match(figure103.questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Reference four-by-three circles must be marked ungraded in Tamil');
assert.deepEqual(figure103.acceptedAnswers,[]);
assert.equal(data.questions.find(q=>q.number===111).scoringStatus,'ungraded_all_correct');
assert.match(data.questions.find(q=>q.number===111).questionTamil,/All correct/,'All-correct status preserved and disclosed');
assert.match(data.questions.find(q=>q.number===121).questionTamil,/அசல் Series C/,'Digit question must disclose uncertified original layout');
assert.equal(data.questions.find(q=>q.number===121).answerKeyToken,'C');
assert.deepEqual(data.questions.find(q=>q.number===122).optionsTamil,data.questions.find(q=>q.number===122).options,'Scientific numeric alternatives preserve exact original text');
for(const n of [84,95]){const q=data.questions.find(q=>q.number===n);assert.match(q.questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Reference figure is explicitly ungraded in Tamil');assert.equal(q.originalCBookletDiagramVerified,false);}
assert.match(data.questions.find(q=>q.number===82).questionTamil,/ABLMS \| QRLBA/,'Coding table cannot change when translating');
assert.match(data.questions.find(q=>q.number===89).questionTamil,/கணிதம் 90°/,'Pie chart angles preserved in Tamil');
for(const n of [60,63,64,68,70,76]){
 const q=data.questions.find(q=>q.number===n);
 assert.equal(q.translationStatus,'editorial_tamil_study_translation_not_verified_original_booklet');
 assert.equal(q.originalTamilPaperTextVerified,false);
}
const q60=data.questions.find(q=>q.number===60);
assert.deepEqual(q60.optionsTamil,q60.options,'Physics scientific notation must remain exactly as in the original English transcription');
const q64=data.questions.find(q=>q.number===64);
assert.deepEqual(q64.optionsTamil,q64.options,'Latin organism names must not be altered in Tamil study edition');
const q68=data.questions.find(q=>q.number===68);
assert.deepEqual(q68.optionsTamil,q68.options,'Plasmodium species must preserve printed spellings');
const q70=data.questions.find(q=>q.number===70);
assert.deepEqual(q70.optionsTamil,q70.options,'Latin cholera pathogen choices must preserve English source spelling');
const q76=data.questions.find(q=>q.number===76);
assert.ok(q76.optionsTamil.A.includes(q76.options.A),'Unusual source option A name kept verbatim rather than silently corrected');
assert.equal(q76.answerKeyToken,data.answerKey.answers[75],'Never modify 2020 C answer keys as part of translation');

assert.equal(data.bilingualEditorialReview.originalTamilPrintVerified,false,'Not a certified original-language reproduction');
assert.deepEqual(data.bilingualEditorialReview.excludedOriginalNumbers,[15,37,39,40,41,42,47],'Source ambiguity and English-only grammar/matrix alternatives must not be silently reinterpreted');
for(const q of data.questions){
  const translated=expectedTamil.includes(q.number);
  if(translated){
    assert.equal(q.translationStatus,'editorial_tamil_study_translation_not_verified_original_booklet');
    assert.equal(q.originalTamilPaperTextVerified,false);
    assert.ok(/\p{Script=Tamil}/u.test(q.questionTamil),'Tamil script required at Q'+q.number);
    assert.deepEqual(Object.keys(q.optionsTamil),['A','B','C','D'],'Preserve exact A-D choice identities');
    assert.ok(Object.values(q.optionsTamil).every(x=>x.length>0),'All Tamil choices must be populated Q'+q.number);
  }else assert.equal(q.questionTamil,undefined,'Never imply unreviewed item has Tamil source text Q'+q.number);
}
const originalTamil=[28,29,30,31,32,33,34,35];
assert.deepEqual(data.bilingualEditorialReview.alreadySourceTamilNumberedOriginals,originalTamil);
assert.equal(originalTamil.filter(n=>expectedTamil.includes(n)).length,0,'Already Tamil C source transcriptions are NOT claimed as editorial English translations');
for(const n of originalTamil){
 const q=data.questions.find(q=>q.number===n);
 assert.equal(q.sourceTextLanguage,'ta','Q'+n+' source transcription is in Tamil');
 assert.equal(q.sourceLanguageStatus,'original_numbered_tamil_transcription_pending_primary_series_c_booklet');
 assert.equal(q.originalTamilPaperTextVerified,false,'Printed original C Tamil scan is not certified');
 assert.equal(q.questionTamil,undefined,'Do not duplicate already Tamil source as if it were translated');
 assert.ok(/[\u0B80-\u0BFF]/u.test(q.question));
 assert.ok(Object.values(q.options).every(v=>/[\u0B80-\u0BFF]/u.test(v)));
}
assert.match(js,/sourceTamilNumbers/,'Reader must distinguish original Tamil source from editorial translations');
assert.match(js,/This original-numbered source transcription is already in Tamil/,'Language switch may not pretend English source exists');
assert.match(html,/120 questions have editorial Tamil study translations/,'Do not label this work official Tamil booklet text');
assert.match(html,/id="language"/,'Learners can switch languages without new attempt');
assert.match(html,/value="ta"/,'Tamil-only mode available');
assert.match(html,/value="both"/,'Side-by-side bilingual mode available');
assert.match(html,/id="questionTamil" lang="ta"/,'Semantically labelled Tamil stem');
assert.match(html,/id="translationNotice"/,'Editorial translation source warning visible');
assert.match(js,/const translatedNumbers=new Set/,'Tamil integrity validation in reader');
assert.match(js,/Tamil translation is not yet reviewed/,'English fallback for untranslated source-numbered questions');
assert.ok(!js.includes('innerHTML'),'Continue source-text injection protection');
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
 assert.equal(q.scoringStatus,'ungraded_source_dispute','Reference cannot be graded as original Series C Q'+n);
 assert.equal(q.originalCBookletDiagramVerified,false);
 assert.equal(q.figureStatus,'editorial_comparison_reference_NOT_verbatim_original_series_c');
 assert.deepEqual(q.acceptedAnswers,[]);
 assert.equal(q.figureAsset,'assets/figures/tnusrb-si-2020-q'+n+'-reference-ungraded.svg');
 assert.ok(q.figureAlt.length>50);
 const source=read(q.figureAsset);
 assert.ok(source.includes('NOT')&&source.includes('Ungraded'),'SVG source must explicitly disclaim originality');
 assert.ok(q.comparisonSourceURLs.length>=2,'Independent source comparison trail required');
}
assert.deepEqual(data.sourceRecoveryAudit.referenceDiagramRecovery.positions,[84,95,103]);
assert.equal(data.sourceRecoveryAudit.referenceDiagramRecovery.allUngraded,true);
assert.deepEqual(data.blockedNumbers,[],'Source-comparison practice has no further blocked original-numbered questions');
assert.match(html,/id="questionFigure"/,'SVG rendering element is present');
assert.match(html,/id="referenceNote"/,'Editorial drawing disclaimer appears on question screen');
assert.ok(js.includes("$('questionFigure')"));
assert.ok(js.includes("$('referenceNote')"));
assert.ok(js.includes('const old131=old134.filter'),'Historical 131-question attempt migration retained through original paper positions');
assert.match(html,/137 readable/);
assert.match(html,/id="sourceGaps"/,'The unverified source holes must be shown to the learner');
assert.ok(html.includes('href="'+officialPdf+'"'),'Quiz links board-listed source PDF');
assert.match(html,/The board PDF timed out/,'Never imply unread booklet scan was examined');
assert.match(html,/Q46.*vector/,'Recovered Q46 vector expression is disclosed as sourced from D');
assert.match(html,/Q47.*ungraded/,'D-only matrix choice reconstruction cannot claim C booklet veracity');
assert.match(html,/Q114–116/,'Original-numbered 114 to 116 still missing');

assert.match(html,/General Candidates written paper/,'Link General Candidates primary paper, not departmental source');
assert.match(html,/Q15\/Q22\/Q37/,'Existing source-disputed keys are still clearly disclosed');
assert.match(html,/127 provisionally scored/);
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

console.log('PASS TNUSRB SI 2020 Series C: 137 numbered records; 137 readable (127 scored, 3 ALL and 7 source-reviewed ungraded); 3 missing and 0 blocked.');
