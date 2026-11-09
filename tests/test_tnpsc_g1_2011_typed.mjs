/* Source-identity, scoring and UI integrity checks for the 2011 Group I D-series partial typed set. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const d=JSON.parse(read('data/quizzes/tnpsc-g1-2011-series-d-typed.json'));
const html=read('tnpsc-g1-2011-quiz.html');
assert.equal(d.schemaVersion,1);
assert.equal(d.exam,'TNPSC Group I');
assert.equal(d.year,2011);
assert.equal(d.bookletCode,'IDPC');
assert.equal(d.bookletSeries,'D');
assert.equal(d.questionCountInOfficialPaper,200);
assert.equal(d.questionCountInTypedSet,d.questions.length);
assert.equal(d.questions.length,20);
assert.equal(d.scorableQuestionCount,18);
assert.equal(d.status,'partial-adapted-text-practice');
assert.match(d.sourcePaperUrl,/tnpsc\.gov\.in\/static_pdf\/dptpreviousyearquestion\/IDPC\.pdf/);
assert.match(d.sourceKeyUrl,/tnpsc\.gov\.in\/static_pdf\/anskeys\/05_06_2011_g1_gk\.pdf/);
assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:20},(_,i)=>i+1));
assert.equal(new Set(d.questions.map(q=>q.id)).size,20);
const officialAnswers=['B','A','C','ALL','C','D','A','B','D','C','A','C','D','C','AB','C','ALL','B','C','D'];
for(const q of d.questions){
  assert.ok(q.text.length>12,'Meaningful text for Q'+q.number);
  assert.equal(q.options.length,4,'Four options for Q'+q.number);
  assert.equal(new Set(q.options).size,4,'Distinct options for Q'+q.number);
  assert.ok(q.explanation.length>10,'Explanation for Q'+q.number);
  assert.ok(q.sourcePdfPage>=3&&q.sourcePdfPage<=9,'Original page mapped');
  assert.equal(q.reviewStatus,'source-page-inspected');
  const expected=officialAnswers[q.number-1];
  if(expected==='ALL'){
    assert.deepEqual(q.accepted,[],'ALL entry deliberately not graded');
    assert.equal(q.points,0);
    assert.equal(q.keyStatus,'all-options-accepted-ungraded');
  }else{
    assert.deepEqual(q.accepted,expected.split(''));
    assert.equal(q.points,1.5);
  }
}
assert.match(html,/not the full 200-question paper/i);
assert.match(html,/concise English adaptations/i);
assert.match(html,/General Knowledge 2011/i);
assert.match(html,/localStorage/);
assert.match(html,/sourcePdfPage/);
assert.match(html,/q\.explanation/);
assert.match(html,/all four options/i);
assert.match(html,/data\/quizzes\/tnpsc-g1-2011-series-d-typed\.json/);
assert.ok(!html.includes('innerHTML'),'No interpolation of question HTML into page');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script,'Quiz has its executable script');
new vm.Script(script[1],{filename:'tnpsc-g1-2011-quiz.inline.js'});
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'No duplicate element ids');
for(const ref of script[1].matchAll(/\$\('([^']+)'\)/g)){
 assert.ok(ids.includes(ref[1]),'UI element '+ref[1]+' exists');
}
assert.match(read('pyq-hub.html'),/href="tnpsc-g1-2011-quiz\.html"/);
console.log('PASS TNPSC Group I 2011 D-series: 20 adapted typed questions; 18 scored with official key; 2 ALL ungraded; A\/B accepted for Q15.');
