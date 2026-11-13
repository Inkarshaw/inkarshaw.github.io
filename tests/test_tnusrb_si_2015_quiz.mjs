import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const d=JSON.parse(read('data/quizzes/tnusrb-si-2015-open.json'));
const html=read('tnusrb-si-2015-quiz.html'),js=read('assets/js/tnusrb-si-2015-quiz.js');
assert.equal(d.schemaVersion,1);
assert.equal(d.exam,'TNUSRB Sub-Inspector');
assert.equal(d.year,2015);
assert.equal(d.quota,'Open');
assert.equal(d.maxOriginalQuestions,140);
assert.equal(d.questions.length,140);
assert.equal(d.providedQuestionCount,140);
assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:140},(_,i)=>i+1));
assert.equal(d.answerKey.answers.length,140);
assert.equal(d.answerKey.bookletSeries,'unconfirmed');
assert.equal(d.answerKey.answers[29],null,'Secondary printed answer table lacks Q30');
assert.equal(d.answerKey.type,'unverified_secondary_answer_table');
const reader='https://civilserviceaspirants.in/Tnusrb/Question-Paper-with-Answer/Tnusrb-si/Tnusrb-si-2015-gk-open-2.php';
assert.equal(d.bilingualNumberedReaderReview.sourceURL,reader);
assert.deepEqual(d.bilingualNumberedReaderReview.reviewedOriginalNumbers,Array.from({length:10},(_,i)=>i+11));
assert.match(d.bilingualNumberedReaderReview.status,/primary-TNUSRB-booklet-and-key-not-verified/);
const bilingual2015=d.questions.filter(q=>q.secondaryBilingualSourceURL===reader);
assert.deepEqual(bilingual2015.map(q=>q.number),Array.from({length:10},(_,i)=>i+11));
for(const q of bilingual2015){
 assert.equal(q.secondaryBilingualSourceURL,reader,'Indexed 2015 Open Candidates number-linked source');
 assert.ok(q.questionTamil?.trim(),'Tamil study stem for Q'+q.number);
 assert.ok(['A','B','C','D'].every(k=>q.optionsTamil?.[k]?.trim()),'Tamil A–D choice text for Q'+q.number);
 assert.equal(q.translationStatus,'editorial-Tamil-translation-not-confirmed-with-original-TNUSRB-booklet');
 assert.match(q.sourceReviewStatus,/not-original-booklet-verified/);
 assert.match(q.sourceReviewEvidence,/not a certified original booklet transcription/);
}
assert.equal(d.questions[13].scoringStatus,'ungraded_source_dispute','Q14 answer conflict must not become gradable');
assert.deepEqual(d.questions[13].acceptedAnswers,[]);
assert.equal(d.questions[13].answerKeyToken,'C','Keep secondary-source key token only as provenance');
assert.match(d.questions[13].scoringReviewReason,/grammatically correct.*D/);
assert.match(d.questions[13].sourceReviewEvidence,/reader marks C even though/,'Printed secondary key problem independently corroborated');
assert.equal(d.questions[13].optionsTamil.D,'சாலை பழுது பார்க்கப்பட்டுக் கொண்டிருக்கிறது');

assert.equal(d.blockedNumbers.length,0);
assert.equal(d.playableQuestionCount,140);
assert.equal(d.ungradedReadableQuestionCount,24);
assert.equal(d.provisionallyScoreableQuestionCount,116);
const blocked=new Set(d.blockedNumbers);
const playable=d.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
assert.equal(playable.length,140);
assert.equal(d.questions.filter(q=>q.scoringStatus==='provisional_secondary_key').length,116);
assert.equal(d.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').length,24);
assert.equal(d.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').length,0);
const recovered=[8,9,14,21,27,29,30,33,60,65,66,73,80,84,90,95,99,100,101,102,103,104,120,127];
assert.deepEqual(d.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').map(q=>q.number),recovered);
for(const n of recovered){
 const q=d.questions[n-1];
 assert.deepEqual(q.acceptedAnswers,[],'Never grade a disputed secondary key at Q'+n);
 assert.ok(q.scoringReviewReason?.length>30);
 assert.ok('ABCD'.split('').every(l=>q.options[l]?.trim()),'Recovered Q'+n+' must have all real options');
 assert.equal(q.answerKeyToken,d.answerKey.answers[n-1],'Keep original secondary token for provenance only');
}
for(const q of d.questions){
 assert.equal(q.answerKeyToken,d.answerKey.answers[q.number-1],'Q'+q.number+' secondary key alignment');
 assert.deepEqual(q.acceptedAnswers,q.scoringStatus==='ungraded_source_dispute'?[]:q.answerKeyToken?[q.answerKeyToken]:[]);
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.equal(q.section,q.number<=80?'General Knowledge':'Psychology');
 if(blocked.has(q.number)){
  assert.equal(q.scoringStatus,'blocked_source_incomplete','Q'+q.number+' must be excluded');
  assert.ok(q.sourceIssue&&q.sourceIssue.length>10);
 }else if(q.scoringStatus==='ungraded_source_dispute'){
  assert.ok(q.question.trim()&&Object.values(q.options).every(v=>v.trim()),'Ungraded readable item Q'+q.number);
  assert.equal(q.textReviewStatus,'readable_options_answer_key_unverified');
 }else{
  assert.equal(q.scoringStatus,'provisional_secondary_key');
  assert.ok(q.question.trim()&&Object.values(q.options).every(v=>v.trim()),'Q'+q.number+' requires all four choices');
  assert.ok('ABCD'.includes(q.answerKeyToken));
 }
}
assert.match(d.questions[0].question,/மணநூல்/,'Original Tamil question preserved');
assert.match(d.questions[7].options.C,/ஆதிமந்தி/,'History source answer option preserved, conflicting key flagged');
assert.match(d.questions[79].options.D,/IHRC/,'Key-disputed Q80 source wording preserved');
assert.match(d.questions[80].question,/27 125 343/,'Psychology Tamil source preserved');
assert.match(d.questions[131].passage,/Seven children/);
assert.match(d.questions[133].passage,/two children/);
assert.equal(d.questions[108].figureAsset,'assets/figures/tnusrb-si-2015-q109.svg');
assert.equal(d.questions[108].scoringStatus,'provisional_secondary_key');
assert.deepEqual([99,100,101,102,103,104].map(n=>d.questions[n-1].graphSourceEvidence.requiredProductionGraphPresent),[false,false,false,false,false,false]);
const q100Conflict=d.questions[99].graphSourceEvidence.competingSecondaryOptionC;
assert.equal(q100Conflict.numberedArchiveOriginalQ100,'1996');
assert.equal(q100Conflict.athiyamanCompiledPsychologyQ85,'1995');
assert.equal(q100Conflict.additionalNumberedSource2015.optionC,'1995');
assert.equal(q100Conflict.additionalNumberedSource2015.verifiedOriginalGraph,false);
assert.equal(d.questions[99].scoringStatus,'ungraded_source_dispute','Third-party disagreement cannot enable grading');
for(const n of [99,100,101,102,103,104]){
 const q=d.questions[n-1];
 assert.equal(q.scoringStatus,'ungraded_source_dispute');
 assert.deepEqual(q.acceptedAnswers,[],'No marks for unverified original graph');
 assert.equal(q.figureAsset,'assets/figures/tnusrb-si-2015-q99-104-comparison-ungraded.svg');
 assert.equal(q.figureStatus,'editorial_comparison_reconstruction_NOT_verbatim_original_booklet');
 assert.equal(q.graphSourceEvidence.athiyamanSubjectGroupedGraphFound,true);
 assert.equal(q.graphSourceEvidence.officialOriginalBookletGraphVerified,false);
 assert.equal(q.graphSourceEvidence.scoringAllowed,false);
 assert.ok(q.graphSourceEvidence.athiyamanPDF.endsWith('TN-Taluk-SI-2015-Question-Paper-140-Questions-Police-SI-Athiyaman-Team.pdf'));
 assert.match(q.question,/ungraded study-comparison chart/);
}
assert.equal(d.graphLearningStatus.editorialTamilGuideCount,6,'All six graph positions receive Tamil study guidance');
assert.equal(d.graphLearningStatus.officialBookletVerified,false);
assert.equal(d.graphLearningStatus.gradedCount,0,'Graph study methods may not add marks');
assert.deepEqual(d.graphLearningStatus.guideQuestionNumbers,[99,100,101,102,103,104]);
const expectedFormulas=[
 'P(ஆண்டு) + Q(ஆண்டு) / P(year) + Q(year)',
 '(Qᵧ − Qᵧ₋₁) ÷ Qᵧ₋₁ × 100',
 'P(1992) ÷ Q(1992) × 100',
 '|Q(1995) − Q(1994)| × 1,000',
 '(P(1992) − P(1993)) ÷ P(1992) × 100',
 '(P(1994) − P(1993)) × 1,000'
];
for(let n=99;n<=104;n++){
 const q=d.questions[n-1],g=q.graphStudyGuide;
 assert.ok(q.questionTamil?.length>45,'Tamil study text Q'+n);
 assert.equal(g.translationStatus,'original_tamil_not_verified_editorial_study_translation');
 assert.equal(g.originalTNUSRBBookletVerified,false);
 assert.equal(g.exactPointValuesConfirmed,false);
 assert.equal(g.gradingAllowed,false);
 assert.equal(g.coachingQuestionNumber,n-15);
 assert.equal(g.coachingPdfPage,n===99?25:26);
 assert.match(g.coachingPdf,/athiyamanteam\.com\/wp-content/);
 assert.equal(g.formula,expectedFormulas[n-99]);
 assert.ok(g.methodEnglish.length>40 && g.methodTamil.length>45);
 assert.deepEqual(q.acceptedAnswers,[],'Bilingual formula must never disclose a graded answer');
 assert.equal(q.scoringStatus,'ungraded_source_dispute');
}
assert.equal(d.questions[99].options.C,'1996','Preserve numbered secondary option while original remains inaccessible');
assert.equal(d.questions[99].graphStudyGuide.optionCConflict.subjectGroupedCompilation,'1995');
assert.equal(d.questions[99].graphStudyGuide.optionCConflict.numberedArchive,'1996');
assert.match(html,/id="graphStudyPanel"/);
assert.match(html,/id="graphMethodTamil"/);
assert.match(html,/id="graphMethodEnglish"/);
assert.match(html,/id="graphFormula"/);
assert.match(html,/id="graphDispute"/);
assert.match(html,/id="graphStudySource"/);
assert.match(html,/Six bilingual, answer-neutral graph-reading methods/);
assert.match(js,/graphStudyPanel/);
assert.match(js,/graphDispute/);
assert.match(js,/guide\.gradingAllowed!==false/);
assert.equal(d.visualSourceRecoveryAudit.graphRecovered,false,'Original-numbered official paper is still uncertified');
assert.equal(d.visualSourceRecoveryAudit.ungradedComparisonFigureFound,true,'The secondary figure has been visually inspected');
assert.equal(d.visualSourceRecoveryAudit.comparisonFigurePDFPageZeroIndexed,24);
const comparisonSVG=read('assets/figures/tnusrb-si-2015-q99-104-comparison-ungraded.svg');
assert.match(comparisonSVG,/NOT OFFICIAL PAPER/,'Never present approximate secondary graph as original official');
assert.match(comparisonSVG,/Line positions are approximate/);
assert.match(js,/const old134=questions.map/,'Prior 134-position attempt migration preserved');
assert.match(js,/const map=\{134:old134,133:prior133/,'Prior 133-position attempt migration preserved');
assert.match(html,/id="graphRecovery"/);
assert.match(html,/id="questionFigure"/);
assert.equal(d.questions[119].number,120);
assert.match(d.questions[119].options.A,/Figure A/,'Q120 traced source option is visible with honest description');
assert.equal(d.questions[119].figureAsset,'assets/figures/tnusrb-si-2015-q120-ungraded.svg');
assert.equal(d.questions[119].visualReview.noPrintedInstruction,true);
assert.equal(d.questions[119].scoringStatus,'ungraded_source_dispute');
assert.deepEqual(d.questions[119].acceptedAnswers,[],'Original Q120 instruction not printed: do not grade editorial reconstruction');
for(const n of [21,27,60,73,80,90,95,120])assert.equal(d.questions[n-1].scoringStatus,'ungraded_source_dispute','Conflicting secondary key must never be scored Q'+n);
for(const n of [34,45,92,93])assert.equal(d.questions[n-1].scoringStatus,'provisional_secondary_key','Visible source and provisional key mapped Q'+n);
assert.match(d.questions[89].question,/√\(176 \+ √2401\)/,'Q90 outer radical restored from inspected scan');
assert.match(d.questions[91].question,/a\/3 = b\/4 = c\/7/,'Q92 stacked ratio restored');
assert.deepEqual([...blocked],[],'No questions blocked: six source-comparison chart questions are available but remain ungraded');
assert.equal(d.questions[8].options.A,d.questions[8].options.C,'Never hide numbered 2015 archive Q9 duplicate');
assert.equal(d.questions[8].scoringStatus,'ungraded_source_dispute','Q9 must be playable only without marks');
assert.deepEqual(d.questions[8].acceptedAnswers,[]);
assert.match(d.questions[8].scoringReviewReason,/Athiyaman/,'Competing source alternative disclosed');
assert.equal(blocked.has(119),false);
assert.equal(blocked.has(129),false);
assert.equal(d.questions[118].figureAsset,'assets/figures/tnusrb-si-2015-q119.svg');
assert.equal(d.questions[128].figureAsset,'assets/figures/tnusrb-si-2015-q129.svg');
for(const n of [109,119,129])assert.match(d.questions[n-1].figureAsset,/\.svg$/);
assert.match(html,/140 playable study questions/);
assert.match(html,/24 ungraded · 0 blocked/);
assert.match(html,/id="ungradedIssues"/);
assert.match(html,/116 are provisionally scored<\/strong> from a secondary answer table/,'Provisional answers must not be represented as certified');
assert.match(html,/not a verified original TNUSRB booklet figure/,'The source-warning for the six graph questions must remain visible');
assert.match(html,/All 24 ungraded questions, including the six Q99–104 chart-comparison exercises, remain playable for study but receive no marks/,'Results must describe ungraded items accurately');
assert.doesNotMatch(html,/six source-incomplete graph questions remain withheld/,'Do not repeat outdated chart-blocking claim');
assert.match(js,/provisional_secondary_key/);
assert.match(js,/ungraded_source_dispute/,'Ungraded questions need distinct scoring status');
assert.match(js,/const scored=q.scoringStatus==='provisional_secondary_key'/,'Feedback must be neutral for ungraded');
assert.match(js,/const scoreable=questions.filter/,'Score denominator excludes ungraded questions');
assert.match(js,/if\(filter==='ungraded'&&scored\)continue/,'Review filter lists ungraded entries');
assert.match(js,/const old109=old118\.filter/,'Previous 109-question attempts still restore via original-number positions');
assert.match(js,/const prior133=old134\.filter\(i=>questions\[i\]\.number!==9\)/,'Prior 133-question attempt position migration preserves the original Q9 exclusion');
assert.match(js,/const old121=old134\.filter\(i=>!newlyReadable\.has\(questions\[i\]\.number\)\)/,'Earlier 121-question attempts retain their historical original-number exclusions');
assert.match(js,/q\.optionsTamil/,'Tamil option text should render for indexed Open Candidates Q11–20');
assert.match(js,/\$\('questionTamil'\)/);
assert.match(js,/\$\('sourceReader'\)/);
assert.match(html,/id="questionTamil"/);
assert.match(html,/id="sourceReader"/);
assert.match(html,/Tnusrb-si-2015-gk-open-2\.php/);
assert.match(js,/clearexams:tnusrb:si:2015:open/);
assert.ok(!js.includes('innerHTML'),'Source strings must never be injected as HTML');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size);
for(const m of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(m[1]),'Missing UI control '+m[1]);
new vm.Script(js,{filename:'assets/js/tnusrb-si-2015-quiz.js'});
for(const p of ['pyq-hub.html','tnusrb.html','sitemap.xml'])assert.match(read(p),/tnusrb-si-2015-quiz\.html/);
assert.match(read('tnusrb/previous_year_questions.html'),/\.\.\/tnusrb-si-2015-quiz\.html/);
for(const other of ['2010','2020']){
 assert.match(read('tnusrb.html'),new RegExp('tnusrb-si-'+other+'-quiz\\.html'),'Retain '+other+' landing nav');
 assert.match(read('pyq-hub.html'),new RegExp('tnusrb-si-'+other+'-quiz\\.html'),'Retain '+other+' PYQ nav');
}
console.log('PASS SI 2015: 140 playable, 116 provisional-keyed, 24 ungraded; Q99–104 bilingual, method-only comparison chart with Q100 source-year conflict, no invented grades.');
