// Regression checks for the 27-chapter Class 10 bilingual mixed mock.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const context=vm.createContext({window:{}});
vm.runInContext(read('assets/js/class10-social-mock-core.js'),context);
const core=context.window.Class10SocialMockCore;
assert.ok(core,'Mixed mock core must be available to the browser.');
const root='data/textbook/class-10/social-science/';
const index=JSON.parse(read(root+'index.json'));
const units=core.validateIndex(index);
assert.equal(units.length,27);
const docs=units.map(u=>JSON.parse(read(root+u.path)));
const bank=core.assemble(units,docs);
assert.ok(bank.length>=620,'Retain all 620 published bilingual History and other Social Science MCQs');
assert.equal(bank.length,index.meta.total_questions,'Mock bank should equal published catalogue total');
assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
assert.equal(bank.filter(q=>q.unitId===2&&q.quiz===2).length,20,'History 2 Quiz 2 must be available to mixed mock');
assert.equal(bank.filter(q=>q.unitId===18&&q.quiz===2).length,20,'Indian Constitution Quiz 2 must be available');
assert.equal(bank.filter(q=>q.unitId===19&&q.quiz===2).length,20,'Central Government Quiz 2 must be available');
assert.equal(bank.filter(q=>q.unitId===20&&q.quiz===2).length,20,'State Government Quiz 2 must be available');
for(const [size,distribution] of [
  [20,[8,5,4,3]],[50,[20,13,9,8]],[100,[40,25,18,17]]
]){
  const sample=core.draw(bank,size,()=>.37);
  assert.equal(sample.length,size);
  assert.equal(new Set(sample.map(q=>q.id)).size,size,'Repeated question in mixed mock');
  assert.deepEqual(Array.from(core.sections,section=>sample.filter(q=>q.sectionEn===section).length),distribution,'Subject quota for '+size);
  const correct=core.grade(sample,sample.map(q=>q.correct));
  assert.equal(correct.correct,size);assert.equal(correct.wrong,0);assert.equal(correct.blank,0);assert.equal(correct.percent,100);
  const blank=core.grade(sample,sample.map(()=>null));
  assert.equal(blank.blank,size);assert.equal(blank.correct,0);assert.equal(blank.percent,0);
  const wrong=core.grade(sample,sample.map(q=>(q.correct+1)%4));
  assert.equal(wrong.wrong,size);assert.equal(wrong.correct,0);
  const mixed=core.grade(sample,sample.map((q,i)=>i%3===0?q.correct:i%3===1?null:(q.correct+1)%4));
  assert.equal(mixed.total,size);
  assert.equal(mixed.correct+mixed.wrong+mixed.blank,size);
  assert.equal(Object.values(mixed.breakdown).reduce((n,g)=>n+g.total,0),size);
}
const malformed=docs.map(d=>structuredClone(d));
malformed[0].questions[0].opts_en=[];
assert.throws(()=>core.assemble(units,malformed),/Incomplete options/,'Reject broken source data');
const wrongGroup=docs.map(d=>structuredClone(d));
wrongGroup[17].questions[20].quiz=1;
assert.throws(()=>core.assemble(units,wrongGroup),/20 questions per quiz/,'Reject unequal quiz groups');
const inaccurate=structuredClone(index);
inaccurate.meta.total_questions=index.meta.total_questions-1;
assert.throws(()=>core.validateIndex(inaccurate),/Question count disagrees/,'Reject inaccurate catalogue totals');
assert.throws(()=>core.draw(bank,13),/Choose 20, 50 or 100/,'Reject unsupported paper size');
const html=read('class10-social-mock.html');
const catalog=read('textbook-quiz.html');
assert.ok(catalog.includes('href="class10-social-mock.html"'),'Mixed mock must be discoverable from the catalogue');
assert.ok(catalog.includes("socialStats.questions+'-question pool"),'Catalogue mock badge must use the current chapter index total');
assert.ok(catalog.includes("socialStats.sets+' quiz sets"),'Catalogue source status must use the current quiz-set count');
assert.ok(catalog.includes('socialStats={questions,sets}'),'Catalogue must read counts from published index metadata');
assert.ok(html.includes('displayedQuestions=index.meta.total_questions'),'Mixed mock must read the actual index count');
assert.ok(html.includes("'+displayedQuestions+' available questions"),'Mixed mock coverage must render the loaded count');
assert.ok(html.includes('loadIndex().catch('),'Mixed mock must load coverage at first visit and handle unavailable catalogues');
assert.ok(!catalog.includes('600-question pool'),'Catalogue must not hard-code the current number of questions');
assert.ok(!html.includes('600 available questions'),'Mixed mock must not hard-code the current number of questions');
assert.ok(catalog.includes("cls===10&&subject==='social-science'?"),'Link must be visible on the correct class/subject route');
assert.ok(html.includes('assets/js/class10-social-mock-core.js'),'Mixed mock must load tested helpers');
assert.ok(html.includes("'&quiz='+q.quiz"),'Review links must take learners to the actual quiz set, not always Quiz 1');
assert.ok(html.includes('fetch(\'data/textbook/class-10/social-science/index.json\''),'Mock must load live 27-chapter catalogue');
assert.ok(!html.includes('Math.random()*20'),'Mock should use subject quotas rather than a hard-coded small pool');
for(const id of ['setup','paper','result','size','start','submit','palette','question','options','reviewList','subjectRows','previous','next','again']){
  assert.ok(html.includes('id="'+id+'"'),'Missing interactive element '+id);
}
const scriptStart=html.lastIndexOf('<script>');
const scriptEnd=html.lastIndexOf('</script>');
assert.ok(scriptStart>=0&&scriptEnd>scriptStart,'Missing browser script');
new vm.Script(html.slice(scriptStart+'<script>'.length,scriptEnd),{filename:'class10-social-mock.html'});
console.log('Class 10 Social Science mixed mock: 27 chapters, '+bank.length+' questions, 20/50/100 balanced papers, answer scoring, error handling and UI wiring verified.');
