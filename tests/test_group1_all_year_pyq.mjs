// Group I all-years PYQ index and full-paper answer-sheet source integrity.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const catalog=JSON.parse(read('data/quizzes/tnpsc-group1-all-years.json'));
const companions=JSON.parse(read('data/quizzes/original-paper-practice.json'));
const typed=JSON.parse(read('data/quizzes/typed-pyq-catalog.json'));
const page=read('tnpsc-group1-pyq.html');
const script=read('assets/js/pyq-original-paper.js');
assert.equal(catalog.schemaVersion,1);
assert.equal(catalog.updatedOn,'2026-11-15');
const years=catalog.entries.map(e=>e.year);
assert.deepEqual(years,[2026,2025,2024,2022,2021,2019,2017,2015,2014,2013,2011,2010,2009,2007]);
assert.equal(new Set(years).size,years.length,'No duplicate indexed years');
assert.ok(!years.includes(2023),'No fabricated 2023 Prelims year');
assert.equal(catalog.specialYears[0].year,2023);
assert.equal(catalog.specialYears[0].stage,'mains-only');
assert.match(catalog.mainsArchiveUrl,/tnpsc\.gov\.in\/English\/descriptive-questions\.html/);
const keyByYear=new Map(catalog.entries.map(e=>[e.year,e]));
const practice=new Map(companions.papers.filter(p=>p.exam==='Group I'||p.year===2011).map(p=>[p.id,p]));
assert.equal(practice.size,9);
for(const year of [2026,2025,2024,2022,2021,2019,2017,2015,2011]){
 const e=keyByYear.get(year),p=practice.get(e.practicePaperId);
 assert.ok(p,'Missing 200-answer paper '+year);
 assert.equal(p.year,year);
 assert.equal(p.questionCount,200);
 assert.equal(p.durationMinutes,180);
 assert.equal(p.transcriptionStatus,'not-transcribed');
 assert.match(p.paperUrl,/^https:\/\/(?:www\.)?tnpsc\.gov\.in\//i);
 assert.equal(e.paperUrl,p.paperUrl);
 if(year!==2011)assert.equal(p.answerKeyStatus,'official-pdf-only','Non-mapped keys must never auto-score');
}
assert.equal(catalog.entries.filter(x=>x.typedUrl).length,9,'Full 2011/2022/2026 and six partial typed starter years');
const typedStarterCounts=new Map([[2015,7],[2017,2],[2019,9],[2021,2],[2022,200],[2024,10],[2025,10]]);
for(const [year,count] of typedStarterCounts){
 const e=keyByYear.get(year);
 assert.equal(e.typedQuestionCount,count,'Partial text count remains truthful: '+year);
 assert.equal(e.typedUrl,'tnpsc-group1-typed-years.html?year='+year);
 assert.equal(e.provisionallyScorable,0);
}

for(const y of [2011,2026]){
 const e=keyByYear.get(y);
 assert.equal(e.typedQuestionCount,200);
 assert.ok(existsSync(new URL('../'+e.typedUrl,import.meta.url)));
 assert.ok(typed.entries.some(x=>x.year===y&&x.paper.includes('Group I')));
}
assert.equal(keyByYear.get(2022).provisionallyScorable,0);
assert.match(keyByYear.get(2022).finalKeyUrl,/Gr_I_Ans_Key_19_11_22\.pdf/);
assert.equal(keyByYear.get(2026).provisionallyScorable,0);
assert.equal(keyByYear.get(2011).provisionallyScorable,192);
for(const y of [2014,2013,2010,2009,2007]){
 const e=keyByYear.get(y);
 assert.equal(e.paperUrl,null);
 assert.equal(e.practicePaperId,null);
 assert.equal(e.typedQuestionCount,0);
 assert.equal(e.sourceStatus,'official-pdf-unresolved');
}
assert.match(page,/data\/quizzes\/tnpsc-group1-all-years\.json/);
assert.match(page,/tnpsc-group1-syllabus\.html/);
assert.match(page,/descriptive-questions\.html/);
assert.match(page,/not a digitized text quiz/i);
assert.match(page,/Full 200-position typed practice/i);
assert.match(page,/Six other years/i);
assert.match(page,/Source gaps/);
assert.match(read('pyq-hub.html'),/href="tnpsc-group1-pyq\.html"/);
assert.match(read('tnpsc-group1-syllabus.html'),/href="tnpsc-group1-pyq\.html"/);
assert.match(read('sitemap.xml'),/tnpsc-group1-pyq\.html/);
assert.match(script,/answerReferenceLabel/);
assert.match(script,/digital scoring not verified/);
const inline=page.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(inline);
new vm.Script(inline[1],{filename:'tnpsc-group1-pyq.html:inline-js'});
new vm.Script(script,{filename:'assets/js/pyq-original-paper.js'});
console.log('Group I all-years PYQ source, discoverability, and interaction checks passed');
