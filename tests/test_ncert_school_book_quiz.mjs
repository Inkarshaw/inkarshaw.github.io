import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const bank=JSON.parse(get('data/ncert/quiz-bank.json'));
const html=get('ncert-school-book-quiz.html');
const js=get('assets/js/ncert-school-book-quiz.js');
assert.equal(bank.schemaVersion,1);
assert.equal(bank.title,'NCERT School Book Quiz');
assert.equal(bank.source.catalogueUrl,'https://ncert.nic.in/textbook.php');
assert.match(bank.description,/Original English-language/);
assert.deepEqual([...new Set(bank.sets.map(s=>s.classLevel))].sort((a,b)=>a-b),[6,7,8,9,10,11,12]);
assert.ok(bank.sets.length>=21,'All classes must have multiple populated topics');
const ids=new Set();const questions=new Set();let count=0;
for(const set of bank.sets){
  assert.ok(/^c(?:6|7|8|9|10|11|12)-[a-z-]+$/.test(set.id),set.id);
  assert.ok(set.subject && set.topic && set.kind==='original-concept-practice');
  assert.equal(set.language,'en');
  assert.equal(set.questions.length,10,'A set must contain ten questions: '+set.id);
  for(const q of set.questions){
    count++;
    assert.ok(!ids.has(q.id),q.id+' duplicated');ids.add(q.id);
    assert.ok(!questions.has(q.question),q.question+' duplicated');questions.add(q.question);
    assert.ok(q.question.length>=10,q.id+' short question');
    assert.equal(q.options.length,4);
    assert.equal(new Set(q.options).size,4,'Repeated distractor');
    assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<4);
    assert.ok(q.explanation.length>=40,q.id+' explanation too brief');
  }
}
assert.equal(count,250);
for(const id of ['classPicker','subjectPicker','topicSearch','setGrid','quizSection','quizTitle','options','feedback','checkAnswer','nextQuestion','resultSection','resultScore','reviewList','retryQuiz','chooseAnother']){
 assert.match(html,new RegExp('id="'+id+'"'),id+' missing in UI');
}
assert.match(html,/NCERT School Book Quiz/);
assert.match(html,/not official NCERT exercises/);
assert.match(html,/ncert-school-book-quiz\.js/);
assert.match(html,/textbook-quiz\.html/,'Keep TN textbook quiz accessible');
assert.match(js,/localStorage\.setItem/);
assert.match(js,/encodeURIComponent|URLSearchParams/);
assert.ok(!js.includes('innerHTML'),'Quiz options must be inserted as plain text, not HTML');
new vm.Script(js,{filename:'assets/js/ncert-school-book-quiz.js'});
console.log('NCERT School Book Quiz: '+bank.sets.length+' sets, '+count+' unique questions, Grades 6–12, UI and script validated.');
