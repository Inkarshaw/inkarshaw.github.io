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
assert.equal(d.blockedNumbers.length,31);
assert.equal(d.playableQuestionCount,109);
assert.equal(d.provisionallyScoreableQuestionCount,109);
const blocked=new Set(d.blockedNumbers);
const playable=d.questions.filter(q=>q.scoringStatus==='provisional_secondary_key');
assert.equal(playable.length,109);
assert.equal(d.questions.filter(q=>q.scoringStatus==='blocked_source_incomplete').length,31);
for(const q of d.questions){
 assert.equal(q.answerKeyToken,d.answerKey.answers[q.number-1],'Q'+q.number+' secondary key alignment');
 assert.deepEqual(q.acceptedAnswers,q.answerKeyToken?[q.answerKeyToken]:[]);
 assert.deepEqual(Object.keys(q.options),['A','B','C','D']);
 assert.equal(q.section,q.number<=80?'General Knowledge':'Psychology');
 if(blocked.has(q.number)){
  assert.equal(q.scoringStatus,'blocked_source_incomplete','Q'+q.number+' must be excluded');
  assert.ok(q.sourceIssue&&q.sourceIssue.length>10);
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
assert.match(html,/109 attemptable/);
assert.match(html,/31 held for source\/key review/);
assert.match(html,/provisional, non-officially verified answer table/);
assert.match(js,/provisional_secondary_key/);
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
console.log('PASS SI 2015: 140 original-numbered user OCR records, 109 playable, 31 blocked, non-official key clearly marked.');
