import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const guide=JSON.parse(read('data/tnpsc/group1-prelims-topics.json'));
const bank=JSON.parse(read('data/quizzes/tnpsc-group-i-2026-prelims-text.json'));
assert.equal(guide.schemaVersion,1);
assert.equal(guide.syllabusCode,'497');
assert.equal(guide.syllabusReferenceDate,'2024-12-16');
assert.equal(guide.units.length,8,'TNPSC GS I-VI plus two aptitude / mental-ability units');
assert.deepEqual(guide.units.map(u=>u.expectedQuestions),[10,10,25,40,50,40,15,10]);
assert.equal(guide.units.filter(u=>u.part==='General Studies').reduce((s,u)=>s+u.expectedQuestions,0),175);
assert.equal(guide.units.filter(u=>u.part!=='General Studies').reduce((s,u)=>s+u.expectedQuestions,0),25);
assert.equal(guide.totals.questions,200);
assert.equal(guide.totals.maximumMarks,300);
assert.equal(guide.totals.durationMinutes,180);
assert.equal(guide.questionBank,'data/quizzes/tnpsc-group-i-2026-prelims-text.json');
const all=guide.units.flatMap(u=>u.topics);
assert.equal(guide.topicCount,42);
assert.equal(all.length,42);
assert.equal(new Set(all.map(x=>x.id)).size,42,'Unique deep links across all syllabus topics');
const linked=new Set();
for(const u of guide.units){
 const unitLinks=new Set();
 for(const t of u.topics){
  assert.match(t.id,/^[a-z0-9-]+$/);
  assert.ok(t.title.length>=8);
  assert.ok(Array.isArray(t.questionNumbers));
  assert.equal(t.questionNumbers.length,new Set(t.questionNumbers).size,'No repeats within '+t.id);
  t.questionNumbers.forEach(n=>{
   assert.ok(n>=1&&n<=200&&Number.isInteger(n));
   assert.equal(bank.questions[n-1].number,n,'Correct original source number for '+t.id);
   linked.add(n);unitLinks.add(n);
  });
 }
 assert.equal(unitLinks.size,u.mappedDistinctQuestions);
}
assert.equal(linked.size,200,'Every supplied 2026 question has at least one curated unit-to-topic route');
assert.equal(guide.editorialMappedDistinctQuestions,200);
assert.match(guide.editorialStatus,/editorial index/i);
assert.match(guide.editorialStatus,/not official TNPSC topic classifications/i);
assert.equal(bank.keyedAnswerCount,0,'The unscored source remains unscored');
const s=read('tnpsc-group1-syllabus.html'),t=read('tnpsc-group1-topic-practice.html');
const sJS=read('assets/js/tnpsc-group1-syllabus.js');
const tJS=read('assets/js/tnpsc-group1-topic-practice.js');
for(const [page,js,path] of [[s,sJS,'syllabus'],[t,tJS,'topic']]){
 assert.ok(!js.includes('innerHTML'),'No user OCR inserted as markup '+path);
 new vm.Script(js,{filename:path});
 const ids=[...page.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(ids.length,new Set(ids).size,'Unique HTML control IDs on '+path);
 for(const match of js.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.includes(match[1]),'Missing '+path+' control #'+match[1]);
}
assert.match(s,/searchable|Search topics/i);
assert.match(s,/Official syllabus PDF/i);
assert.match(s,/id="studyProgress"/);
assert.match(s,/id="resumeTopic"/);
assert.match(sJS,/tnpsc-group1-topic-practice\.html/,'Topic practice links are generated from the syllabus index');
assert.match(t,/Read\. Choose\. Review\./);
assert.match(t,/Show unanswered only/);
assert.match(t,/Reset topic responses/);
assert.match(t,/No correct.*answer|does not invent correct-answer/);
assert.match(tJS,/slice\(page\*10,\(page\+1\)\*10\)/);
assert.match(tJS,/topic\.questionNumbers\.map\(n=>bank\.questions\[n-1\]\)/);
assert.match(tJS,/localStorage/);
assert.match(tJS,/q\.sourceStatus==='needs_source_review'/);
assert.match(tJS,/letter/g);
assert.ok(!tJS.includes('correctAnswers'),'No spurious correctness claims for tentative key');
for(const [p,needle] of [
 ['index.html','tnpsc-group1-syllabus.html'],
 ['tnpsc.html','tnpsc-group1-syllabus.html'],
 ['pyq-hub.html','tnpsc-group1-syllabus.html'],
 ['sitemap.xml','tnpsc-group1-topic-practice.html']]){
 assert.ok(read(p).includes(needle),'Missing new study link on '+p);
}
for(const p of ['index.html','tnpsc.html','pyq-hub.html'])assert.match(read(p),/assets\/css\/clear-pathways\.css/);
assert.ok(read('assets/css/clear-pathways.css').includes('ce-track-grid'));
for(const original of ['tnpsc-g1-2026-quiz.html','tnusrb-si-2015-quiz.html','pyq-original-paper.html']){
 assert.ok(read('pyq-hub.html').includes(original)||read('tnpsc.html').includes(original),'Preserve original route '+original);
}
console.log('PASS Group I syllabus-first: 8 official units, 42 topics, all 200 2026 source numbers mapped, page navigation and unscored status intact.');
