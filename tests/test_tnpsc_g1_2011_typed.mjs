/* Full original-numbered 2011 TNPSC Group I Series D (IDPC) English-adapted quiz integrity gate. */
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
assert.equal(d.questionCountInTypedSet,200);
assert.equal(d.questions.length,200);
assert.equal(d.scorableQuestionCount,192);
assert.equal(d.status,'complete-adapted-text-practice');
assert.match(d.sourcePaperUrl,/tnpsc\.gov\.in\/static_pdf\/dptpreviousyearquestion\/IDPC\.pdf/);
assert.match(d.sourceKeyUrl,/tnpsc\.gov\.in\/static_pdf\/anskeys\/05_06_2011_g1_gk\.pdf/);
assert.deepEqual(d.questions.map(q=>q.number),Array.from({length:200},(_,i)=>i+1));
assert.equal(new Set(d.questions.map(q=>q.id)).size,200);
const officialAnswers=`B A C ALL C D A B D C A C D C AB C ALL B C D B D C C A C D A D B C D B D B A C D A B C A A B B A B C D B D A B A C D B D B A D B D C A A D D B A D D C A D A D B B D A C D B C A B B B D A C D B B B D C C B C C B A A D B C C A C D B ALL B C A A C B A A B A C B A BC B B B C D B B D D C B D D A D D D B D A A A A ALL B C A A A A C D C A A D C C C C B A ALL C B B A C A B B D A D C C D C A C D B`.split(/\s+/);
assert.equal(officialAnswers.length,200,'200 official D-series key entries');
for(const q of d.questions){
  assert.ok(q.text.length>12,'Meaningful typed adaptation for Q'+q.number);
  assert.equal(q.options.length,4,'Four options for Q'+q.number);
  assert.equal(new Set(q.options).size,4,'Distinct options for Q'+q.number);
  assert.ok(q.options.every(x=>typeof x==='string'&&x.length>0),'Non-empty answers for Q'+q.number);
  assert.ok(q.explanation.length>10,'Explanation for Q'+q.number);
  assert.ok(q.sourcePdfPage>=3&&q.sourcePdfPage<=64,'Official source page for Q'+q.number);
  assert.equal(q.reviewStatus,'source-page-inspected');
  const expected=officialAnswers[q.number-1];
  if(expected==='ALL'){
    assert.deepEqual(q.accepted,[],'ALL entry deliberately not graded Q'+q.number);
    assert.equal(q.points,0);
    assert.equal(q.keyStatus,'all-options-accepted-ungraded');
  } else {
    assert.deepEqual(q.accepted,expected.split(''),'Series D official key Q'+q.number);
    assert.equal(q.points,1.5);
  }
}
assert.deepEqual(d.questions.filter(q=>q.points===0).map(q=>q.number),[4,17,77,78,114,152,171,194]);
assert.deepEqual(d.questions.filter(q=>q.accepted.length>1).map(q=>q.number),[15,74,128]);
assert.equal(d.questions.reduce((s,q)=>s+q.points,0),288);
assert.match(html,/Full 200-question English typed practice/i);
assert.match(html,/not an independently certified verbatim/i);
assert.match(html,/192 scorable/);
assert.match(html,/General Knowledge 2011/);
assert.match(html,/localStorage/);
assert.match(html,/sourcePdfPage/);
assert.match(html,/q\.explanation/);
assert.match(html,/all four options/i);
assert.match(html,/data\/quizzes\/tnpsc-g1-2011-series-d-typed\.json/);
assert.ok(!html.includes('innerHTML'),'No untrusted question HTML injection');
const script=html.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(script,'Quiz contains executable script');
new vm.Script(script[1],{filename:'tnpsc-g1-2011-quiz.inline.js'});
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);
assert.equal(ids.length,new Set(ids).size,'No duplicate element IDs');
for(const ref of script[1].matchAll(/\$\('([^']+)'\)/g))
  assert.ok(ids.includes(ref[1]),'UI element '+ref[1]+' exists');
assert.match(read('pyq-hub.html'),/href="tnpsc-g1-2011-quiz\.html"/);
assert.match(read('sitemap.xml'),/tnpsc-g1-2011-quiz\.html/);
console.log('PASS Group I 2011: all 200 source-numbered English adaptations, 192 scored, 8 ALL ungraded, 3 multi-accepted.');
