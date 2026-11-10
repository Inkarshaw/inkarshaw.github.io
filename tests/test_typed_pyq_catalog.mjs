/* Source-of-truth coverage checks for the ClearExams typed PYQ library. */
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import vm from 'node:vm';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const json=p=>JSON.parse(read(p));
const cat=json('data/quizzes/typed-pyq-catalog.json'),html=read('pyq-typed-library.html'),js=read('assets/js/typed-pyq-catalog.js');
assert.equal(cat.schemaVersion,1);
assert.equal(cat.entries.length,8);
assert.equal(new Set(cat.entries.map(e=>e.id)).size,8);
assert.equal(cat.entries.reduce((n,e)=>n+e.typed,0),1353);
assert.equal(cat.entries.filter(e=>e.typed===e.total).length,5);
const by=id=>{const e=cat.entries.find(x=>x.id===id);assert.ok(e,'Missing catalogue '+id);return e;};
for(const e of cat.entries){assert.ok(['TNPSC','TNUSRB'].includes(e.exam));assert.ok(Number.isInteger(e.total)&&Number.isInteger(e.typed)&&Number.isInteger(e.scorable));assert.ok(e.typed<=e.total&&e.scorable<=e.typed);assert.ok(e.sourceStatus.length>16);assert.ok(existsSync(new URL('../'+e.link.split('?')[0],import.meta.url)),'Quiz route missing: '+e.link);}
const g2011=json('data/quizzes/tnpsc-g1-2011-series-d-typed.json');
assert.equal(by('tnpsc-g1-2011').typed,g2011.questionCountInTypedSet);
assert.equal(by('tnpsc-g1-2011').scorable,g2011.scorableQuestionCount);
const g2026=json('data/quizzes/tnpsc-group-i-2026-prelims-text.json');
assert.equal(by('tnpsc-g1-2026').typed,g2026.suppliedQuestionCount);
assert.equal(by('tnpsc-g1-2026').scorable,0,'No guessed 2026 answer key');
const ta=json('data/quizzes/tnpsc-g4-2022-user-transcription-tamil-draft.json');
const en=json('data/quizzes/tnpsc-g4-2022-user-transcription-english-draft.json');
assert.equal(by('tnpsc-g4-2022').typed,ta.questions.length+en.questions.length);
for(const y of [2024,2025]){const d=json('data/quizzes/tnpsc-g4-'+y+'-typed-review.json');assert.equal(by('tnpsc-g4-'+y).typed,d.typedPlayableCount);assert.equal(by('tnpsc-g4-'+y).scorable,d.gradedQuestionCount);assert.equal(by('tnpsc-g4-'+y).type,'full-numbered-draft');}
assert.equal(by('tnpsc-g4-2025').typed,200,'2025 has an adaptation at every original question number');
assert.equal(by('tnpsc-g4-2025').scorable,192,'Eight special ALL final-key positions ungraded');
assert.equal(by('tnpsc-g4-2024').scorable,196,'Four 2024 ALL final-key entries ungraded');
assert.match(by('tnpsc-g4-2024').sourceStatus,/NOT independently visually verified verbatim/,'Full numbered adaptations are not certified originals');
assert.match(by('tnpsc-g4-2025').sourceStatus,/editorial study questions/,'Full numbering does not mean verified verbatim');
const s2010=json('data/quizzes/tnusrb-si-2010-open-type-a.json');
assert.equal(by('tnusrb-si-2010').typed,s2010.availableForQuizCount);
assert.equal(by('tnusrb-si-2010').scorable,s2010.scoredQuestionCount);
assert.equal(s2010.bilingualPubliclyReviewedCount,10,'First ten Open Candidates questions have source-indexed bilingual texts');
assert.match(by('tnusrb-si-2010').sourceStatus,/Q1–10.*bilingual/,'Catalogue must not claim full Tamil translation');
const s2015=json('data/quizzes/tnusrb-si-2015-open.json');
assert.equal(by('tnusrb-si-2015').typed,s2015.playableQuestionCount);
assert.equal(by('tnusrb-si-2015').scorable,s2015.provisionallyScoreableQuestionCount);
assert.equal(by('tnusrb-si-2015').typed,118,'Readable ungraded source-disputed text counts toward playable, not scorable');
assert.equal(by('tnusrb-si-2015').typed-by('tnusrb-si-2015').scorable,9,'Nine 2015 questions must not receive provisional marks');
const s2020=json('data/quizzes/tnusrb-si-2020-series-c.json');
assert.equal(by('tnusrb-si-2020').typed,s2020.playableQuestionCount);
assert.equal(by('tnusrb-si-2020').scorable,s2020.scoredQuestionCount);
assert.equal(by('tnusrb-si-2020').typed,115,'Open Candidates Q22 readable but ungraded');
assert.equal(by('tnusrb-si-2020').typed-by('tnusrb-si-2020').scorable,4,'Three ALL tokens and one disputed key are not scored');
assert.match(html,/PYQ Text Quiz Library/);
assert.match(html,/not independently certified verbatim reproduction/i);
assert.match(js,/typed-pyq-catalog\.json/);
assert.match(js,/textContent/);
assert.ok(!js.includes('innerHTML'),'No untrusted source text injection');
new vm.Script(js,{filename:'assets/js/typed-pyq-catalog.js'});
assert.match(read('pyq-hub.html'),/href="pyq-typed-library\.html"/);
assert.match(read('sitemap.xml'),/pyq-typed-library\.html/);
assert.match(js,/verified-pyqs\.json/);
assert.match(js,/collectAdapted/);
assert.match(js,/URLSearchParams/);
assert.match(html,/<option value="UPSC">UPSC<\/option>/);
assert.match(html,/<option value="adapted">/);
const adaptedRows=json('data/quizzes/verified-pyqs.json');
const adaptedCounts=new Map();
for(const q of adaptedRows){if(q.SourceType==='Adapted PYQ'&&q.Active!=='FALSE'){const key=q.SourceExam+'|'+q.SourceYear;adaptedCounts.set(key,(adaptedCounts.get(key)||0)+1)}}
assert.equal(adaptedCounts.size,8);
assert.equal([...adaptedCounts.values()].reduce((n,x)=>n+x,0),160);

const allYears=json('data/quizzes/pyq-yearwise-catalog.json');
assert.equal(allYears.entries.length,67,'All 67 source-indexed exam-year papers must remain discoverable');
assert.deepEqual(new Set(allYears.entries.map(x=>x.category)),new Set(['TNPSC','TNUSRB','UPSC','SSC','Railways']));
assert.match(js,/pyq-yearwise-catalog\.json/,'Unified library fetches the all-year source index');
assert.match(js,/hasTextFor/,'Source-only archive records must be separated from existing text');
assert.match(js,/makeArchiveCard/,'Missing question text must be labelled rather than invented');
assert.match(js,/source-only/,'Source-only records can be filtered');
for(const field of ['yearFilter','showMore','dataNotice'])assert.ok(html.includes('id="'+field+'"'),'Missing archive UI control '+field);
for(const board of ['SSC','Railways'])assert.ok(html.includes('value="'+board+'"'),'Missing exam board '+board);
const archiveKeys=new Set(allYears.entries.map(x=>x.category+'|'+x.exam+'|'+x.year));
assert.equal(archiveKeys.size,67,'Archive exam/year records must be unique');
const adaptedKeys=new Set([...adaptedCounts.keys()].map(x=>{
 const [exam,year]=x.split('|');
 if(exam==='TNPSC Group IV')return 'TNPSC|Group IV|'+year;
 if(exam==='TNPSC Group II/IIA')return 'TNPSC|Group II / IIA|'+year;
 if(exam==='UPSC Civil Services Prelims')return 'UPSC|Civil Services Prelims|'+year;
 throw Error('Unknown adapted source '+x);
}));
assert.ok([...adaptedKeys].every(x=>archiveKeys.has(x)),'All adapted exam/year sets should map to the archive');
const typedKeys=new Set(cat.entries.map(e=>{
 if(e.exam==='TNPSC'&&e.paper.startsWith('Group IV'))return 'TNPSC|Group IV|'+e.year;
 if(e.exam==='TNPSC'&&e.paper.startsWith('Group I'))return 'TNPSC|Group I|'+e.year;
 if(e.exam==='TNUSRB'&&e.paper.startsWith('SI Open'))return 'TNUSRB|SI (Open Candidates)|'+e.year;
 return e.exam+'|'+e.paper+'|'+e.year;
}));
assert.equal(new Set([...archiveKeys,...typedKeys,...adaptedKeys]).size,72,
 '67 archived exam years plus five unique typed-only years');
const sourceOnly=[...archiveKeys].filter(k=>!adaptedKeys.has(k)&&!typedKeys.has(k));
assert.equal(sourceOnly.length,58,'Exactly 58 indexed exam-year sources lack a local text quiz');
assert.ok(read('pyq-hub.html').includes('Explore all exams, years and text coverage'),'Universal coverage discoverable from main PYQ hub');

console.log('PASS 72 distinct indexed exam-year records: 8 typed sets (1353 positions), 8 adapted sets (160 questions), and 58 archive-only exam-years honestly marked without question text.');
