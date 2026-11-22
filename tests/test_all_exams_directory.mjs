import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const directory=JSON.parse(read('data/exams/all-exams-directory.json'));
const original=JSON.parse(read('data/exams/exam-catalog.json'));
assert.equal(directory.schemaVersion,1);
assert.equal(directory.categories.length,12,'Do not drop existing categories');
const ids=new Set();
const levelCounts={};
let number=0;
for(const category of directory.categories){
 assert.match(category.id,/^[a-z0-9-]+$/);
 assert.ok(category.title.trim());
 assert.ok(category.exams.length>=1);
 for(const exam of category.exams){
  assert.ok(!ids.has(exam.id),'Duplicate exam route '+exam.id);
  ids.add(exam.id);
  number++;levelCounts[exam.level]=(levelCounts[exam.level]||0)+1;
  assert.ok(['practice','pyq','guide','foundation'].includes(exam.level),'Unknown support level '+exam.id);
  assert.ok(exam.name.length>2,'Exam name required');
  const url=new URL(exam.href,'https://clearexams.ink/');
  assert.equal(url.origin,'https://clearexams.ink','Only site routes allowed');
  const target=path.join(root,decodeURIComponent(url.pathname.replace(/^\//,'')));
  assert.ok(fs.existsSync(target),'Broken exam link '+exam.id+' -> '+exam.href);
 }
}
assert.ok(number>=90,'Directory must cover at least the initial 90 exam/service routes');
assert.ok(levelCounts.foundation>=40,'Unsupported exams must be clearly labelled as shared resources');
const pairs=Object.entries(original);
for(const [cat,body] of pairs){
 const group=directory.categories.find(x=>x.id===cat);
 assert.ok(group,'Existing catalog category missing: '+cat);
 for(const exam of body.items)assert.ok(group.exams.some(x=>x.id===exam.id),'Existing exam/post missing: '+exam.id);
}
for(const [id,level,href] of [
 ['tnpsc-group-4','practice','tnpsc/mocks/'],
 ['tnusrb-si-taluk','pyq','tnusrb-si-2015-quiz.html'],
 ['tnusrb-police-constable','pyq','tnusrb-pc-quiz.html'],
 ['upsc-cds','pyq','pyq-cds.html'],
 ['jee-main','guide','syllabus.html#jee-main'],
 ['neet-ug','guide','syllabus.html#neet-ug'],
 ['ctet','foundation','syllabus.html'],
 ['kpsc-kas','foundation','textbook-quiz.html']
]){
 const exam=directory.categories.flatMap(x=>x.exams).find(x=>x.id===id);
 assert.deepEqual([exam.level,exam.href],[level,href],id+' supports only the stated material');
}
const html=read('start.html');
assert.match(html,/id="exam-directory"/);
for(const key of ['ceExamSearch','ceExamCategory','ceExamResults','ceExamSummary','ceExamReturn'])assert.ok(html.includes('id="'+key+'"'),'Exam directory control missing '+key);
assert.match(html,/assets\/css\/all-exams-directory\.css/);
assert.match(html,/assets\/js\/all-exams-directory\.js/);
const script=read('assets/js/all-exams-directory.js');
assert.match(script,/fetch\('data\/exams\/all-exams-directory\.json'/);
assert.match(script,/root\.replaceChildren\(\)/);
assert.match(script,/No matching exam found/);
assert.match(read('index.html'),/href="start\.html#exam-directory"/);
assert.match(read('assets/js/pwa.js'),/href="\/start\.html#exam-directory"/);
console.log('PASS searchable directory: '+number+' routes, '+directory.categories.length+' categories, verified paths and honest support levels');
