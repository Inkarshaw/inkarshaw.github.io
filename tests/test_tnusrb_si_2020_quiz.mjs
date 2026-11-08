/* Original-order TNUSRB SI 2020 Series C user-supplied PYQ integrity. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const data=JSON.parse(read('data/quizzes/tnusrb-si-2020-series-c.json'));
const html=read('tnusrb-si-2020-quiz.html');
const js=read('assets/js/tnusrb-si-2020-quiz.js');
const missing=[28,29,30,31,32,33,34,35,41,42,44,45,46,47,48,114,115,116];
const blocked=[14,15,22,37,84,95,103,121];
assert.equal(data.schemaVersion,1);
assert.equal(data.exam,'TNUSRB SI');
assert.equal(data.year,2020);
assert.equal(data.recruitmentYear,2019,'2019 recruitment, 12 January 2020 exam');
assert.equal(data.bookletSeries,'C');
assert.equal(data.originalQuestionCount,140);
assert.equal(data.suppliedQuestionCount,122);
assert.equal(data.questions.length,122);
assert.deepEqual(data.missingNumbers,missing,'Do not create missing 18 questions');
assert.deepEqual(data.blockedNumbers,blocked,'Do not grade ambiguous scans, inferred options, missing diagrams or key conflicts');
assert.equal(data.playableQuestionCount,114);
assert.equal(data.scoredQuestionCount,111);
assert.equal(data.maximumIndicativeMarks,55.5);
assert.deepEqual(data.specialKeyNumbers,[58,111,125]);
assert.equal(data.answerKey.answers.length,140,'Final key has all original positions');
assert.match(data.answerKey.sourcePDF,/Final-Answer-Key-TNUSRB-Sub-Inspector-of-Police-Posts\.pdf$/);
const originalNums=data.questions.map(q=>q.number);
assert.equal(new Set(originalNums).size,122);
assert.deepEqual(originalNums,[...originalNums].sort((a,b)=>a-b),'Original order never re-sorted');
assert.deepEqual(Array.from({length:140},(_,i)=>i+1).filter(n=>!originalNums.includes(n)),missing);
for(const q of data.questions){
 assert.ok(q.question&&q.question.trim().length>2,'Q'+q.number+' has supplied stem');
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.ok(Object.values(q.options).every(x=>typeof x==='string'&&x.trim()),'Q'+q.number+' has all four choices');
 assert.equal(q.answerKeyToken,data.answerKey.answers[q.number-1],'Q'+q.number+' correct booklet C key mapping');
 assert.deepEqual(q.acceptedAnswers,q.answerKeyToken==='ALL'?[]:q.answerKeyToken.split('/'));
 if(blocked.includes(q.number)){
  assert.equal(q.scoringStatus,'blocked_source_incomplete','Q'+q.number+' must stay outside live practice');
  assert.ok(q.sourceIssue&&q.textStatus==='needs_original_source_review');
 }else if(q.answerKeyToken==='ALL'){
  assert.equal(q.scoringStatus,'ungraded_all_correct');
 }else assert.equal(q.scoringStatus,'scored_with_final_key');
}
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
assert.match(html,/114 attemptable/);
assert.match(html,/111 graded/);
assert.match(html,/2019 Recruitment \(Exam 2020\)/);
assert.match(html,/not an official 140-question TNUSRB score/);
assert.match(js,/q\.answerKeyToken!==data\.answerKey\.answers\[q\.number-1\]/);
assert.match(js,/blocked_source_incomplete/);
assert.ok(!js.includes('innerHTML'),'No source-content HTML injection');
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'Unique HTML IDs');
for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Referenced DOM ID exists: '+match[1]);
new vm.Script(js,{filename:'assets/js/tnusrb-si-2020-quiz.js'});
assert.match(read('pyq-hub.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb.html'),/tnusrb-si-2020-quiz\.html/);
assert.match(read('tnusrb/previous_year_questions.html'),/\.\.\/tnusrb-si-2020-quiz\.html/);
assert.match(read('sitemap.xml'),/tnusrb-si-2020-quiz\.html/);
console.log('PASS TNUSRB SI 2020 Series C: 122 source records; 114 playable; 111 scoreable; 18 missing, 8 blocked, 3 ALL special.');
