/* Original-order TNUSRB SI 2020 Series C user-supplied PYQ integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const html=read('tnusrb-si-2020-quiz.html');
const js=read('assets/js/tnusrb-si-2020-quiz.js');
const missing=[];
const blocked=[];
assert.equal(data.schemaVersion,1);
assert.equal(data.exam,'TNUSRB SI');
assert.equal(data.year,2020);
assert.equal(data.recruitmentYear,2019,'2019 recruitment, 12 January 2020 exam');
assert.equal(data.bookletSeries,'C');
assert.equal(data.originalQuestionCount,140);
assert.equal(data.suppliedQuestionCount,140);
assert.equal(data.questions.length,140);
assert.deepEqual(data.missingNumbers,missing,'Every original Series C number is now represented');
assert.deepEqual(data.blockedNumbers,blocked,'Do not grade ambiguous scans, inferred options, missing diagrams or key conflicts');
assert.equal(data.playableQuestionCount,140);
assert.equal(data.ungradedSourceDisputeCount,8);
assert.equal(data.scoredQuestionCount,129);
assert.equal(data.maximumIndicativeMarks,64.5);
assert.deepEqual(data.specialKeyNumbers,[58,111,125]);
assert.equal(data.answerKey.answers.length,140,'Final key has all original positions');
assert.match(data.answerKey.sourcePDF,/Final-Answer-Key-TNUSRB-Sub-Inspector-of-Police-Posts\.pdf$/);
const officialPdf='https://www.tnusrb.tn.gov.in/pdfs/SI_2019_WT_QUESTION.pdf';
assert.equal(data.originalBookletAccess.url,officialPdf);
assert.equal(data.originalBookletAccess.originalBookletVerifiedByClearExams,false,'Source PDF timed out; never certify unseen booklet text');
assert.equal(data.originalBookletAccess.departmentQuotaExcluded,true);
assert.deepEqual(data.sourceRecoveryAudit.blockedOriginalNumbers,blocked,'Manifest must not retain stale 2019/2020 blocked positions');
assert.deepEqual(data.sourceRecoveryAudit.remainingMissingNumbers,missing);
assert.deepEqual(Object.keys(data.missingSourceEvidence),[],'No original Series C question number remains absent');
assert.deepEqual(data.originalBookletAccess.secondarySeriesCScanReview.reviewedOriginalNumbers,[114,115,116]);
assert.equal(data.sourceRecoveryAudit.seriesDMathReview.originalCVisualScanNotVerified,true);
assert.deepEqual(data.sourceRecoveryAudit.seriesDMathReview.addedProvisionalScores,[46,121]);
assert.deepEqual(data.sourceRecoveryAudit.seriesDMathReview.addedUngraded,[47]);

const originalNums=data.questions.map(q=>q.number);
assert.equal(new Set(originalNums).size,140);
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
 }else if([15,22,37,47,84,95,96,103].includes(q.number)){
  assert.equal(q.scoringStatus,'ungraded_source_dispute','Q'+q.number+' cross-series/source conflict is not safe to grade');
  assert.match(q.answerReviewReason,q.number===22?/SAARC/:q.number===15?/Series D/:q.number===47?/Series D/:[84,95,96,103].includes(q.number)?/original|unverified|Series C/i:/Series C supplied OCR/,'Clearly disclose source discrepancy');
  if(q.number===22)assert.equal(q.options.A,'SAARC');
  assert.deepEqual(q.acceptedAnswers,[]);
 }else if(q.answerKeyToken==='ALL'){
  assert.equal(q.scoringStatus,'ungraded_all_correct');
 }else assert.equal(q.scoringStatus,'scored_with_final_key');
}
assert.deepEqual(data.recoveredOriginalNumbers,[28,29,30,31,32,33,34,35,41,42,44,45,46,47,48,114,115,116]);
for(const [n,key,options] of [[114,'B',{A:'16',B:'160',C:'32',D:'None of these'}],[115,'C',{A:'4',B:'6',C:'8',D:'14'}],[116,'D',{A:'1210000',B:'11000',C:'100',D:'111000'}]]){
 const q=data.questions.find(x=>x.number===n);
 assert.equal(q.answerKeyToken,key,'Recovered Series C key position Q'+n);
 assert.deepEqual(q.options,options,'Visually transcribed Series C choices Q'+n);
 assert.equal(q.secondaryScanSource.printedPage,26);
 assert.equal(q.secondaryScanSource.bookletSeries,'C');
 assert.equal(q.originalTamilPaperTextVerified,false,'Secondary scan is not TNUSRB-host certification');
}
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
assert.ok(js.includes('const old137=questions.map'),'Old 137-question attempts must map original question numbers');

const expectedTamil=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,16,17,18,19,20,21,22,23,24,25,26,27,36,38,43,44,45,46,48,49,50,51,52,53,54,55,56,57,58,59,...Array.from({length:40},(_,i)=>i+60),...Array.from({length:17},(_,i)=>i+100),...Array.from({length:24},(_,i)=>i+117)];
assert.deepEqual(data.bilingualEditorialReview.reviewedOriginalNumbers,expectedTamil,'Only reviewed question numbers advertise Tamil study text');
assert.equal(data.bilingualEditorialReview.questionCount,125);
assert.deepEqual(data.bilingualEditorialReview.batchHistory.map(b=>b.count),[20,20,20,20,20,20,2,3],'Bilingual batch review history preserved');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[1].numbers,[23,24,25,26,27,43,44,45,46,48,49,50,51,52,53,54,55,56,57,59]);
assert.deepEqual(data.bilingualEditorialReview.batchHistory[2].numbers,Array.from({length:20},(_,i)=>60+i),'Third bilingual editorial batch exactly covers Q60–79');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[3].numbers,Array.from({length:20},(_,i)=>80+i),'Fourth bilingual editorial batch exactly covers Q80–99');
const fifth=[...Array.from({length:14},(_,i)=>i+100),...Array.from({length:6},(_,i)=>i+117)];
assert.deepEqual(data.bilingualEditorialReview.batchHistory[4].numbers,fifth,'Fifth batch covers exactly 20 readable and source-numbered questions, not missing Q114–116');
const sixth=[22,36,...Array.from({length:18},(_,i)=>i+123)];
assert.deepEqual(data.bilingualEditorialReview.batchHistory[5].numbers,sixth,'Sixth batch restores Q22/Q36 and all Q123–140');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[6].numbers,[38,58],'Seventh closure batch leaves source-ambiguous positions untranslated');
assert.deepEqual(data.bilingualEditorialReview.batchHistory[7].numbers,[114,115,116],'Eighth batch records the visually reviewed Series C scan recovery');
assert.deepEqual([38,58].map(n=>data.questions.find(q=>q.number===n).optionsTamil),[38,58].map(n=>data.questions.find(q=>q.number===n).options),'Source-precise grammatical/scientific alternatives retained');
assert.equal(data.questions.find(q=>q.number===58).scoringStatus,'ungraded_all_correct','Q58 cannot become scored because it was translated');
assert.deepEqual(data.questions.filter(q=>q.sourceTextLanguage!=='ta'&&q.questionTamil===undefined).map(q=>q.number),[15,37,39,40,41,42,47],'Only seven held English-source questions remain');
const q137=data.questions.find(q=>q.number===137);
assert.equal(q137.question,'The ______ of the state is efficient.','Missing printed blank restored');
assert.equal(q137.sourceRecoveryEvidence.originalCBookletVisuallyVerified,false,'Secondary source recovery is not original booklet certification');
assert.equal(q137.answerKeyToken,'A','Series C answer unaffected by text gap restoration');
assert.match(q137.questionTamil,/______/, 'English grammar blank remains visible in Tamil study text');
const q22=data.questions.find(q=>q.number===22);
assert.equal(q22.scoringStatus,'ungraded_source_dispute','Disputed international body options must remain ungraded');
assert.match(q22.sourceIssue,/international.*regional|regional.*international/i,'Explain why SAARC option A is semantically ambiguous');
assert.equal(q22.answerReviewReason,q22.sourceIssue,'Q22 review and source issue use same careful explanation');
assert.equal(q22.externalStudyReferences.length,2,'Independent answer guide is separate from SAARC first-party source');
assert.match(q22.externalStudyReferences[0].url,/saarc-sec\.org/);
assert.match(q22.externalStudyReferences[1].url,/testbook\.com/);
assert.deepEqual(q22.acceptedAnswers,[],'Conflicting Q22 meaning must not trigger right/wrong grading');
assert.match(html,/id="sourceDisputeDesk"/,'Seven-item source review desk is visible before starting');
assert.match(html,/id="sourceDisputeList"/,'Review desk receives actual source-disputed bank questions');
assert.match(js,/function renderSourceDisputes\(/,'Use bank-driven, not invented, seven-question source-review content');
assert.match(js,/questions\.filter\(q=>q\.scoringStatus==='ungraded_source_dispute'\)/,'Source desk dynamically uses all seven ungraded disputes');
assert.match(js,/Study Q/,'Student can open a source-disputed question directly');
assert.match(js,/renderSourceDisputes\(\)/,'Populate queue after successfully loading question bank');
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
    assert.ok(['editorial_tamil_study_translation_not_verified_original_booklet','secondary_scan_checked_editorial_tamil_transcription_not_officially_certified'].includes(q.translationStatus));
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
assert.match(html,/125 questions have editorial or secondary-scan-reviewed Tamil study text/,'Do not label this work official Tamil booklet text');
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
assert.equal(sample[96].options.C,'Diagram C — original figure missing','Q96 original diagram missing; never present editorial option C as the authentic booklet artwork');
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
assert.match(html,/140 readable/);
assert.match(html,/id="sourceGaps"/,'The recovered secondary-scan source note must be shown to the learner');
assert.ok(html.includes('href="'+officialPdf+'"'),'Quiz links board-listed source PDF');
assert.match(html,/The board PDF timed out/,'Never imply unread booklet scan was examined');
assert.match(html,/Q46.*vector/,'Recovered Q46 vector expression is disclosed as sourced from D');
assert.match(html,/Q47.*ungraded/,'D-only matrix choice reconstruction cannot claim C booklet veracity');
assert.match(html,/Q114–116/,'Recovered original-numbered 114 to 116 are disclosed');

assert.match(html,/General Candidates written paper/,'Link General Candidates primary paper, not departmental source');
assert.match(html,/Q15\/Q22\/Q37/,'Existing source-disputed keys are still clearly disclosed');
assert.match(html,/129 provisionally scored/);
assert.match(html,/2019 Recruitment \(Exam 2020\)/);
assert.match(html,/not an official TNUSRB result/);
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

const auditHTML=read('tnusrb-si-2020-source-review.html');
const auditJS=read('assets/js/tnusrb-si-2020-source-review.js');
assert.match(html,/tnusrb-si-2020-source-review\.html/,'Quiz page opens five-item source audit');
assert.match(js,/tnusrb-si-2020-source-review\.html\?q=/,'All five disputed visual questions link to original-source review');
assert.match(auditHTML,/name="robots" content="noindex,nofollow"/,'Editorial-only source review does not pretend to be an indexed public answer key');
assert.match(auditHTML,/Q47, Q84, Q95, Q96 and Q103/,'Five missing original-source visual positions identified');
assert.match(auditHTML,/id="pdfFile"/,'Manual original booklet viewing never uploads source PDF');
assert.match(auditHTML,/id="pdfFrame"/,'Locally selected PDF can be inspected page by page');
assert.match(auditHTML,/id="comparisonImage"/,'Editorial reference art distinguished from original scanned specimen');
assert.match(auditHTML,/id="figureChecked"/,'Original Series C matrix or diagram requires manual verification');
assert.match(auditHTML,/id="sourceKind"/,'Original Series C and secondary scan must not be conflated');
assert.match(auditHTML,/id="staleWarning"/,'Stale source changes are disclosed before rechecking');
assert.match(auditHTML,/id="export"/,'Reviewer can transfer five notes without uploading scanned material');
assert.match(auditJS,/const NUMBERS=\[47,84,95,96,103\]/,'Five original diagrams or matrices require visual audit');
assert.match(auditJS,/const signature=q=>JSON\.stringify/,'Source audit bound to exact stem and alternatives');
assert.match(auditJS,/sourceKind==='board_booklet'/,'Secondary source cannot be marked fully locally checked');
assert.match(auditJS,/r\.printedNumber===q\.number/,'Exact printed Series C question number required');
assert.match(auditJS,/CHECKS\.every\(k=>r\[k\]\)/,'All manual visual and key checks required');
assert.match(auditJS,/sourceSignature:signature\(q\)/,'Review export carries source-text binding');
assert.match(auditHTML,/id="pdfFingerprint"/,'PDF file byte fingerprint displayed explicitly');
assert.match(auditHTML,/id="pdfBindingNotice"/,'Reviewer can tell when source evidence is detached');
assert.match(auditJS,/pdfSHA256/,'Local review must bind to source PDF fingerprint');
assert.match(auditJS,/FIELDS\.filter\(k=>k!=='signature'&&k!=='pdfSHA256'\)/,'Internal source fingerprint is not a nonexistent editable DOM input');
assert.match(auditJS,/activePDFSHA256.length===64&&r.pdfSHA256===activePDFSHA256/,'A saved assertion cannot count without same PDF currently loaded');
assert.match(auditJS,/crypto.subtle.digest\('SHA-256',bytes\)/,'Client-side SHA-256 only, no upload');
assert.match(auditJS,/normalized.signature='';CHECKS.forEach/,'Legacy unbound checkbox assertions must be invalidated');
assert.match(auditJS,/if\(!r.pdfSHA256\)\{CHECKS.forEach/,'Importing old evidence must never retain unbound checks');
assert.match(auditJS,/activePDFSHA256='';/,'Closing or changing PDF removes active fingerprint');
assert.match(auditJS,/CHECKS\.forEach\(k=>\{\$\(k\)\.checked=false\}\)/,'All unsaved visual attestations must be invalidated whenever local PDF closes or switches');
assert.match(auditJS,/saved\?\.pdfSHA256&&saved\.pdfSHA256===activePDFSHA256&&matches\(saved,questions\[current\]\)/,'Only persisted exact PDF and source signatures restore a checked local review');
assert.match(auditHTML,/Closing or changing the PDF clears all onscreen checkboxes/,'Explain PDF-switch checklist reset in reviewer instructions');
assert.match(auditJS,/file hash cannot prove TNUSRB authenticity/,'Hash identity is not official paper certification');

assert.match(auditJS,/row\.sourceSignature!==signature\(q\)/,'Source-changed import loses old checkboxes');
assert.match(auditJS,/data\.scoredQuestionCount!==129/,'Review tool refuses silently changed scoring bank');
assert.match(auditJS,/data\.ungradedSourceDisputeCount!==8/,'All eight disputes remain ungraded');
const sameNamed=data.sourceRecoveryAudit.sameNamedBookletOCRAudit;
assert.equal(sameNamed.sourceURL,'https://www.scribd.com/document/1014181296/SI-2019-WT-QUESTION');
assert.deepEqual(sameNamed.reviewedQuestionNumbers,[47,84,95,103]);
assert.deepEqual(sameNamed.ocrCorroboratedStemAndAlternatives,[84,95]);
assert.deepEqual(sameNamed.partiallyCorroboratedNumbers,[103]);
assert.deepEqual(sameNamed.originalMatricesUnreadable,[47]);
assert.equal(sameNamed.originalFigurePageImagesVerified,false,'Indexed OCR preview is never image proof');
assert.equal(sameNamed.originalBoardHostedPDFInspected,false,'No successful TNUSRB original fetch');
assert.equal(sameNamed.allRemainUngraded,true);
for(const n of [47,84,95,103]){
 const q=data.questions[n-1], ev=q.sameNamedBookletOCRAudit;
 assert.equal(ev.questionNumber,n);
 assert.equal(ev.sourceURL,sameNamed.sourceURL);
 assert.equal(ev.sourceDate,'2026-11-14');
 assert.equal(ev.visuallyVerifiedOriginalFigureOrMatrix,false,'Indexed OCR never authenticates Series C artwork');
 assert.equal(ev.originalBoardHostedPDFInspected,false);
 assert.equal(ev.corroboratesOfficialAnswerKey,false);
 assert.equal(ev.scoringMustRemainDisabled,true);
 assert.equal(q.scoringStatus,'ungraded_source_dispute');
 assert.deepEqual(q.acceptedAnswers,[]);
 assert.ok(ev.observedDetails.length>55);
 assert.ok(ev.requiredNext.length>25);
}
assert.equal(data.questions[46].sameNamedBookletOCRAudit.evidenceLevel,'not_readable_in_public_ocr_index','Q47 matrix source still missing');
assert.equal(data.questions[83].sameNamedBookletOCRAudit.evidenceLevel,'english_stem_and_four_option_values_corroborated_by_ocr','Q84 separate OCR supports option values, not figure');
assert.equal(data.questions[94].sameNamedBookletOCRAudit.evidenceLevel,'english_stem_and_four_option_values_corroborated_by_ocr');
assert.equal(data.questions[102].sameNamedBookletOCRAudit.evidenceLevel,'english_stem_and_numeric_choices_partially_corroborated_by_ocr');
const visualFollowUp=data.sourceRecoveryAudit.primaryOriginalVisualRetrievalFollowUp;
assert.equal(visualFollowUp.date,'2026-11-23','Source retrieval attempts are dated');
assert.equal(visualFollowUp.originalSeriesCQuestionPageImagesInspected,false,'No false certification of original printed booklet');
assert.equal(visualFollowUp.diagramOrMatrixOptionLayoutsVerified,false,'No key-only diagram promotion');
assert.equal(visualFollowUp.allRemainUngraded,true,'All originally recorded four key-only visual gaps remain ungraded');
assert.deepEqual(visualFollowUp.seriesCKeyLetters.map(x=>[x.question,x.token]),[[47,'C'],[84,'B'],[95,'C'],[103,'C']],'Final key visually checked without attributing original diagrams');
assert.match(visualFollowUp.officialPDFResult,/timed out/,'Unretrieved original PDF disclosed');
assert.match(visualFollowUp.secondaryPDFResult,/403/,'Unavailable secondary scan does not count as source');
assert.match(auditHTML,/Checked 23 November 2026/,'Visual reviewer sees last source acquisition status');
assert.match(auditHTML,/none of those four printed question figures or matrix layouts was obtained/,'Answer-key letters are not image proof');
assert.match(auditHTML,/id="ocrEvidencePanel"/,'Reviewer can compare evidence scope');
assert.match(auditHTML,/id="ocrEvidenceDetails"/);
assert.match(auditHTML,/id="ocrEvidenceLink"/);
assert.match(auditJS,/sameNamedBookletOCRAudit/,'OCR evidence comes from versioned question bank');
assert.match(auditJS,/originalFigurePageImagesVerified!==false/,'No unsupported visual certifications allowed');
assert.match(auditJS,/ocrEvidenceLevel/);
assert.match(read('docs/tnusrb-si-2020-original-visual-review-procedure.md'),/Scribd OCR/);

assert.match(auditJS,/q\.acceptedAnswers\?\.length!==0/,'Visual source questions cannot gain answer keys unnoticed');
assert.ok(!auditJS.includes('innerHTML'),'Reviewer source material only rendered safely as text');
const auditIds=[...auditHTML.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(auditIds.length,new Set(auditIds).size,'No duplicate review controls');
for(const m of auditJS.matchAll(/\$\('([^']+)'\)/g))assert.ok(auditIds.includes(m[1]),'Missing review control '+m[1]);
new vm.Script(auditJS,{filename:'assets/js/tnusrb-si-2020-source-review.js'});

// User-supplied original-numbered 2019 SI (held 2020, Series C) Q101–120:
// bilingual text reconciliation does not create a duplicate paper or certify original-page visuals.
for(let n=101;n<=120;n++){
 const q=data.questions[n-1];
 assert.equal(q.number,n,'Source-numbered question retained Q'+n);
 assert.equal(q.newOCRComparison?.date,'2026-11-22','Q'+n+' transcribed user source provenance');
 assert.equal(q.newOCRComparison?.originalSeriesCBookletVisuallyVerified,false,'Q'+n+' no unsupported original booklet certification');
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.deepEqual(Object.keys(q.optionsTamil),['A','B','C','D']);
}
assert.deepEqual(data.questions[100].options,{A:'PRTVXZ',B:'CEGIKM',C:'MORTVX',D:'ZBDFHJ'},'Q101 anomalous letters do not change');
assert.match(data.questions[101].questionTamil,/24 மற்றும் 27/,'Q102 original-numbered Tamil age data preserved');
assert.match(data.questions[106].questionTamil,/8¼/,'Q107 fractional formula preserved in Tamil');
assert.match(data.questions[107].questionTamil,/49\/\?/,'Q108 paired unknown symbol preserved');
assert.match(data.questions[108].questionTamil,/₹38/,'Q109 price and sum retained');
assert.match(data.questions[102].questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Q103 unverified circles remain explicitly ungraded');
assert.equal(data.questions[102].scoringStatus,'ungraded_source_dispute');
assert.deepEqual(data.questions[102].acceptedAnswers,[]);
assert.equal(data.questions[110].answerKeyToken,'ALL','Q111 all-correct key retained');
assert.equal(data.questions[110].scoringStatus,'ungraded_all_correct');
assert.match(data.questions[110].questionTamil,/All correct/,'Q111 translated source caveat remains visible');
for(const n of [114,115,116])assert.equal(data.questions[n-1].textStatus,'secondary_series_c_scan_visually_transcribed','Q'+n+' independently sourced secondary scan evidence kept');
assert.match(data.questions[116].newOCRComparison.status,/English-only supplied/,'Q117 was not supplied in Tamil');
assert.match(data.questions[119].questionTamil,/48, 24, 72, 36, 108/,'Q120 numeric pattern remains legible');

// User-supplied source-numbered Q92–100, received 2026-11-23, reconciled in the
// existing January 2020 Series C quiz rather than creating a second 2019 paper.
for(let n=92;n<=100;n++){
 const item=data.questions[n-1],audit=item.newOCRComparison;
 assert.equal(item.number,n,'Q92–100 original question position preserved');
 assert.equal(audit?.date,'2026-11-23','Q'+n+' user-supplied source recorded');
 assert.equal(audit?.originalSeriesCBookletVisuallyVerified,false,'Q'+n+' not certified against TNUSRB booklet images');
 assert.deepEqual(Object.keys(item.options),['A','B','C','D']);
 assert.deepEqual(Object.keys(item.optionsTamil),['A','B','C','D']);
}
const supplied92=data.questions[91];
assert.equal(supplied92.newOCRComparison.basketArithmetic.result,11,'Q92 fruit count');
assert.equal(supplied92.answerKeyToken,'B','Q92 correct key stays B');
assert.match(supplied92.questionTamil,/12332142314223314113234/,'Q92 exact 23-digit command sequence retained');
assert.match(supplied92.questionTamil,/பையில்/,'Q92 user Tamil bag wording retained separately from English basket');
assert.equal(data.questions[92].answerKeyToken,'A','Q93 middle flags still India and Australia');
assert.equal(data.questions[93].options.A,'NCPQJG','Q94 alternating letter code preserves first choice');
const supplied95=data.questions[94];
assert.equal(supplied95.scoringStatus,'ungraded_source_dispute','Q95 no verified original diagram, so cannot be graded');
assert.deepEqual(supplied95.acceptedAnswers,[]);
assert.equal(supplied95.newOCRComparison.originalFigureSupplied,false);
assert.equal(supplied95.originalCBookletDiagramVerified,false);
assert.match(supplied95.questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Q95 source caution visible in Tamil');
const supplied96=data.questions[95];
assert.equal(supplied96.newOCRComparison.originalFourDiagramImagesSupplied,false);
assert.deepEqual(supplied96.newOCRComparison.rawSuppliedOptionLabels,{A:'Diagram A',B:'Diagram B',C:'Diagram C',D:'Diagram D'});
assert.match(supplied96.instruction,/original diagram-to-option mapping remains unverified/,'Q96 score never inferred from absent original diagrams');
assert.match(supplied96.options.C,/Diagram C.*original figure missing/,'Q96 actual printed original figure C is unavailable');
assert.equal(data.questions[96].newOCRComparison.layoutUnverified,true,'Q97 numeric placement must not be guessed from flattened OCR');
assert.match(data.questions[96].newOCRComparison.rawSuppliedNumberLine,/466, 398, 341, 282, 250, \?/);
assert.equal(data.questions[97].answerKeyToken,'D','Q98 directional key retained');
assert.equal(data.questions[98].answerKeyToken,'B','Q99 wrong-number key retained');
assert.equal(data.questions[99].newOCRComparison.status,'English_only_supplied_editorial_Tamil_retained','Q100 supplied no original Tamil text');

// Bilingual psychology solution audit Q82–91: no unsupported key rewrites.
for(const n of [82,83,89,90,91]){
 const q=data.questions[n-1];
 assert.ok(q.answerExplanation.length>70,'Q'+n+' has substantive English editorial reasoning');
 assert.match(q.answerExplanationTamil,/[\u0B80-\u0BFF]/u,'Q'+n+' has Tamil editorial reasoning');
 assert.equal(q.explanationStatus,'editorial_mathematical_or_logic_derivation_not_original_board_solution');
}
const q89=data.questions[88];
assert.deepEqual(q89.acceptedAnswers,['A','C'],'The published Series C final key accepts both A and C');
assert.equal(q89.answerKeyToken,'A/C');
assert.equal(q89.scoringStatus,'scored_with_final_key');
assert.equal(q89.bilingualKeyReconciliation.sourceCBookletBilingualPageVisuallyVerified,false,'Never claim original Series C printed Tamil certification');
assert.equal(q89.bilingualKeyReconciliation.officialBoardRationaleNotProven,true,'Do not claim official motive for dual key');
assert.equal(q89.bilingualKeyReconciliation.englishAnswer,'C');
assert.equal(q89.bilingualKeyReconciliation.sourceTamilParallelAnswer,'A');
assert.equal(70/360*540,105,'Q89 Hindi corresponds to 105 marks');
assert.equal(90/360*540,135,'Q89 Maths is the largest sector');
assert.match(q89.answerExplanationTamil,/அதிக மதிப்பெண்கள்/,'Separate Tamil rendering explicitly explains highest-marks question');
assert.match(js,/function appendStudyExplanation\(/,'Student quiz has post-answer bilingual explanation renderer');
assert.match(js,/appendStudyExplanation\(div,q\)/,'Practice explanation appears after Check Answer only');
assert.match(js,/appendStudyExplanation\(body,q\)/,'Results review includes bilingual explanation');

// Final twenty original-numbered Series C items: editorial worked solutions, not board solutions.
for(let n=121;n<=140;n++){
 const q=data.questions[n-1];
 assert.equal(q.number,n,'End-of-booklet numbering Q'+n);
 assert.ok(q.answerExplanation?.length>70,'Q'+n+' needs a substantive English worked solution');
 assert.match(q.answerExplanationTamil,/\p{Script=Tamil}/u,'Q'+n+' has Tamil reasoning');
 assert.equal(q.explanationStatus,'editorial_mathematical_or_logic_derivation_not_original_board_solution');
 assert.equal(q.explanationAudit?.reviewedAt,'2026-11-23');
 assert.equal(q.explanationAudit?.verifiedAsBoardIssuedExplanation,false,'No official solution falsely asserted');
 assert.equal(q.explanationAudit?.printedSeriesCBookletVisuallyVerified,false,'No unexamined original booklet authenticated');
 assert.deepEqual(Object.keys(q.options),['A','B','C','D'],'No source alternatives reordered');
}
assert.equal(data.questions[120].answerKeyToken,'C','Q121 digit remains C (8)');
assert.equal(8+(10+8)+(20+8)+(10*8+3)+(10*8+1),210+8,'Q121 arithmetic checked independently');
assert.ok(Math.abs(Math.pow(243,0.2)/
 (Math.pow(7,.25)*Math.pow(49,.075)*Math.pow(343,.2))-3/7)<1e-12,'Q122 exponential fraction 3/7');
assert.equal(17*3-6,45,'Q123 operator replacement valid');
assert.equal((4*3+5*4)/(5*3-2*4),32/7,'Q124 ratio value');
const q125end=data.questions[124];
assert.equal(q125end.answerKeyToken,'ALL','Q125 retains official special key');
assert.equal(q125end.scoringStatus,'ungraded_all_correct','Q125 must remain ungraded');
assert.deepEqual(q125end.acceptedAnswers,[],'Do not award key position for Q125');
assert.equal(q125end.explanationAudit?.specialAllKey,true);
assert.match(q125end.answerExplanation,/29\.5666/,'Q125 displayed calculation not equal to printed alternatives');
assert.equal((35.7-(3+1/3)-(2+2/(2+1/2))).toFixed(3),'29.567');
assert.match(q125end.answerExplanation,/does not establish why the board/,'Printed key provenance and explanation distinguished');
assert.equal(data.questions[128].answerKeyToken,'C','Q129 counted twenty digits');
assert.equal(Array.from({length:100},(_,i)=>i+1).reduce((sum,x)=>sum+String(x).split('3').length-1,0),20);
assert.equal(data.questions[130].answerKeyToken,'C','Q131 reverse alphabet code yields 57');
assert.equal([3,1,20].reduce((sum,x)=>sum+27-x,0),57);
assert.equal(data.questions[131].options.B,'2451','Q132 digit-wise subtraction matches B');
assert.equal(19+19-1,37,'Q134 ranking logic');
assert.equal(data.questions[134].options.B,'TICCHOPSY','Q135 word block output preserved');
assert.match(data.questions[134].question,/TICRONÉU/,'Q135 unusual OCR token NOT silently corrected');
assert.equal(data.questions[134].explanationAudit?.nonstandardOCRGlyphStillUnverified,true);
assert.match(data.questions[136].sourceIssue,/printed blank/i,'Q137 restored blank remains source-caveated');

assert.equal(data.questions[95].originalCBookletOptionMappingVerified,false,'Q96 original A-D Venn mapping cannot be claimed as verified');
assert.equal(data.questions[95].scoringStatus,'ungraded_source_dispute','Missing authentic Series C Q96 image blocks marking');
assert.equal(data.questions[95].answerKeyToken,'C','Published C key retained only for provenance');
assert.deepEqual(data.questions[95].acceptedAnswers,[],'Q96 neutral no accepted option');
assert.equal(data.questions[95].editorialReferenceChoices.originalSeriesCOptionsVisuallyInspected,false,'Cross-series study words are not C original images');
assert.equal(data.questions[95].editorialReferenceChoices.independentlyReproducedSeriesDTextOptions.D,
 'Two concentric circles and one separate circle','Earlier editorial D wording disagreed with parallel Series D study representation');
assert.match(data.questions[95].questionTamil,/மதிப்பெண் வழங்கப்படாது/,'Tamil Q96 tells learner no marks');
assert.equal(data.questions[95].newOCRComparison.gradeDisabledUntilOriginalImages,true);
assert.equal(data.questions[96].newOCRComparison.layoutCorroboratedByOtherBookletSeries,true,
 'Q97 3x2 arrangement is only corroborated by D series, not C original');
assert.equal(data.questions[96].newOCRComparison.printedSeriesCLayoutVisuallyVerified,false);
assert.deepEqual(data.sourceRecoveryAudit.primaryOriginalVisualRetrievalFollowUp.totalVisualQuestionsRequiringOriginalCPage,
 [47,84,95,96,103]);
assert.equal(data.sourceRecoveryAudit.additionalOriginalDiagramReview.excludedFromScore,true);
assert.equal(data.questions[95].sameNamedBookletOCRAudit.evidenceLevel,'not_independently_verified_in_index',
 'No Scribd or original Series C visual claim may be invented for Q96');
assert.match(auditJS,/expectedNumbers=obj.rows.length===4\?\[47,84,95,103\]:NUMBERS/,
 'Legacy four-item reviewer JSON import remains supported after adding Q96');

console.log('PASS TNUSRB SI 2020 Series C: 140/140 playable (129 scored, 3 ALL and 8 source-reviewed ungraded); 0 missing and 0 blocked.');
