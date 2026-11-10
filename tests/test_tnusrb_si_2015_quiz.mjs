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

assert.equal(d.blockedNumbers.length,22);
assert.equal(d.playableQuestionCount,118);
assert.equal(d.ungradedReadableQuestionCount,9);
assert.equal(d.provisionallyScoreableQuestionCount,109);
const blocked=new Set(d.blockedNumbers);
const playable=d.questions.filter(q=>q.scoringStatus!=='blocked_source_incomplete');
assert.equal(playable.length,118);
assert.equal(d.questions.filter(q=>q.scoringStatus==='provisional_secondary_key').length,109);
assert.equal(d.questions.filter(q=>q.scoringStatus==='ungraded_source_dispute').length,9);
assert.equal(d.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').length,22);
const recovered=[8,14,29,30,33,65,66,84,127];
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
assert.equal(d.questions[119].number,120);
assert.equal(d.questions[119].options.A,'','Missing Q120 option must not be invented');
assert.ok(blocked.has(90)&&blocked.has(99)&&blocked.has(120)&&blocked.has(129));
assert.match(html,/118 readable practice questions/);
assert.match(html,/9 ungraded · 22 held/);
assert.match(html,/id="ungradedIssues"/);
assert.match(html,/non-officially verified secondary answer table/);
assert.match(js,/provisional_secondary_key/);
assert.match(js,/ungraded_source_dispute/,'Ungraded questions need distinct scoring status');
assert.match(js,/const scored=q.scoringStatus==='provisional_secondary_key'/,'Feedback must be neutral for ungraded');
assert.match(js,/const scoreable=questions.filter/,'Score denominator excludes ungraded questions');
assert.match(js,/if\(filter==='ungraded'&&scored\)continue/,'Review filter lists ungraded entries');
assert.match(js,/gradedIndices\[saved.index\]/,'Previous 109-question attempts must be mapped into 118-question order');
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
console.log('PASS SI 2015: 140 source-numbered user OCR records, 118 readable (109 graded, 9 ungraded), 22 blocked, non-official key clearly marked.');
