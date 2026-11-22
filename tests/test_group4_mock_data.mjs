import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const full=JSON.parse(fs.readFileSync('data/quizzes/tnpsc-group4-full-mock-1.json','utf8'));
assert.equal(full.schemaVersion,1);
assert.equal(full.durationMinutes,180);
assert.equal(full.questionCount,200);
assert.equal(full.questions.length,200);
assert.equal(full.questions.filter(x=>x.section==='Tamil').length,100);
assert.equal(full.questions.filter(x=>x.section==='General Studies').length,75);
assert.equal(full.questions.filter(x=>x.section==='Aptitude').length,25);
assert.deepEqual(full.questions.slice(0,100).map(x=>x.section).filter(x=>x!=='Tamil'),[]);
assert.deepEqual(full.questions.slice(100,175).map(x=>x.section).filter(x=>x!=='General Studies'),[]);
assert.deepEqual(full.questions.slice(175).map(x=>x.section).filter(x=>x!=='Aptitude'),[]);
assert.equal(full.tamilMinimumMarks,60);
assert.equal(full.overallMinimumMarks,90);
assert.ok(full.questions.every(x=>typeof x.question==='string'&&x.question.trim().length>8&&Array.isArray(x.options)&&x.options.length>=4&&x.options.every(s=>typeof s==='string'&&s.trim())&&x.acceptedAnswers.length>=1&&x.acceptedAnswers.every(a=>Number.isInteger(a)&&a>=0&&a<=3)));
assert.equal(full.questions.filter(q=>q.originalQuestionNumber!==null).length,193);
assert.equal(full.questions.filter(q=>q.originalQuestionNumber===null).length,7);
for(const file of ['assets/js/group4-short-mock.js','assets/js/group4-full-mock.js']){
 const content=fs.readFileSync(file,'utf8');
 new vm.Script(content,{filename:file});
 assert.match(content,/localStorage\.setItem\(STORE/);
 assert.match(content,/deadline=Date\.now\(\)\+duration\*1000/);
 assert.match(content,/deadline:saved|deadline,retry/);
 assert.match(content,/startClock\(\)/);
 assert.match(content,/pagehide/);
}
const fullScript=fs.readFileSync('assets/js/group4-full-mock.js','utf8');
assert.match(fullScript,/tamilMarks>=60/);
assert.match(fullScript,/mark>=90/);
assert.match(fullScript,/General Studies and Aptitude scores have not been evaluated/);
for(let i=1;i<=4;i++){
 const html=fs.readFileSync('tnpsc/mocks/mock-'+i+'.html','utf8');
 assert.match(html,/assets\/js\/group4-short-mock\.js/);
 assert.match(html,/id="saveProgress"/);
}
const fullHtml=fs.readFileSync('tnpsc/mocks/full-mock-1.html','utf8');
assert.match(fullHtml,/assets\/js\/group4-full-mock\.js/);
assert.match(fullHtml,/id="gateOutcome"/);
assert.match(fs.readFileSync('tnpsc/mocks/index.html','utf8'),/full-mock-1\.html/);
console.log('PASS Group IV four saved short mocks and 200-question timed mock structural checks');
