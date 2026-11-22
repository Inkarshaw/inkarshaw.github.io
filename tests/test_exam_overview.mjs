import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const directory=JSON.parse(read('data/exams/all-exams-directory.json'));
const exams=directory.categories.flatMap(cat=>cat.exams.map(exam=>({...exam,category:cat.id})));
assert.equal(exams.length,90);
const foundation=exams.filter(exam=>exam.level==='foundation');
assert.equal(foundation.length,42,'42 foundation-only exams should have honest overviews');
for(const exam of foundation){
 assert.ok(exam.href,'Foundation fallback resource must exist');
 const file=new URL(exam.href,'https://clearexams.ink/').pathname.replace(/^\//,'');
 assert.ok(fs.existsSync(path.join(root,file)),'Foundation fallback must not 404: '+exam.id);
}
for(const exam of exams.filter(e=>e.officialUrl)){
 assert.match(exam.officialUrl,/^https:\/\//);
 assert.ok(exam.officialLabel,'Attribute verified official link to actual authority');
 assert.ok(['upsc-nda','upsc-capf','upsc-ese','upsc-cms','upsc-ifos','ctet','ugc-net','cuet-ug','cuet-pg','csir-ugc-net'].includes(exam.id),'Only curated URLs should be added');
}
const html=read('exam-overview.html'),script=read('assets/js/exam-overview.js'),search=read('assets/js/all-exams-directory.js');
assert.match(html,/name="robots" content="noindex,follow"/,'Thin overview pages should not be indexed as full exam syllabus');
for(const id of ['examName','examSummary','examCoverage','mainResource','resourceCards','missingItems','officialArea','loadStatus'])
 assert.ok(html.includes('id="'+id+'"'),'Overview missing '+id);
assert.match(html,/src="assets\/js\/pwa\.js"/);
assert.match(html,/src="assets\/js\/exam-overview\.js"/);
assert.match(search,/if\(exam\.level==='foundation'\)/);
assert.match(search,/exam-overview\.html\?exam=/);
assert.match(search,/shared\.href=exam\.href/,'Keep direct shared-resource link for candidates');
assert.match(script,/if\(!exam\|\|!category\)/,'Unknown exam IDs must not silently display a different exam');
assert.match(script,/localHref\(exam\.href\)/,'Only safe local study routes');
assert.match(script,/officialHref\(exam\.officialUrl\)/);
assert.match(script,/No dedicated|not published|not available yet/i);
assert.match(script,/source-verified original/);
assert.match(read('assets/js/pwa.js'),/\/exam-overview\.html/,'The mobile Exams tab must highlight on overview');
console.log('PASS exam overview: 42 foundation-only entries, curated official links, no fake exam-specific mocks');
