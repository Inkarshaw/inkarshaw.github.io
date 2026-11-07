import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const get=p=>readFileSync(resolve(root,p),'utf8');
const scope=JSON.parse(get('data/quizzes/coverage-scope.json'));
const page=get('quiz-coverage.html');
assert.equal(scope.schemaVersion,1);
assert.equal(scope.scertCatalogs.length,25,'Six–ten Science/Social plus 11–12 available subjects');
assert.deepEqual([...new Set(scope.scertCatalogs.map(x=>x.classLevel))],[6,7,8,9,10,11,12]);
assert.ok(scope.scertAdditionalSubjectsNotCataloged.length>=7);
assert.equal(scope.ncertChapterInventoryCertified,false);
assert.match(page,/id="catalogs"/);
assert.match(page,/id="gaps"/);
assert.match(page,/editorial verification|Editorial Verification/i);
assert.match(page,/data\/quizzes\/coverage-scope\.json/);
assert.match(page,/Current quiz statistics/);
assert.match(page,/not automatically a finished chapter/);
const r=spawnSync(process.execPath,['scripts/audit-quiz-coverage.mjs','--json','--strict'],
  {cwd:root,encoding:'utf8',maxBuffer:12*1024*1024});
assert.equal(r.status,0,'Coverage audit structural errors:\n'+r.stderr+'\n'+r.stdout.slice(0,5000));
const audit=JSON.parse(r.stdout);
assert.equal(audit.scert.catalogs,25);
assert.ok(audit.scert.units>=288,'All 288 already-indexed units must remain tracked');
assert.equal(audit.scert.readyUnits,audit.scert.units,'Every tracked canonical bank should be playable');
assert.ok(audit.scert.indexedQuestions>=39000);
assert.equal(audit.ncert.classes.length,7);
assert.ok(audit.ncert.questions>=390);
assert.ok(audit.missingScertSubjectAreas.length>0);
const chapters=JSON.parse(get('data/ncert/class10-science-chapter-inventory.json'));
assert.equal(chapters.chapterCount,13);
assert.equal(chapters.chapters.length,13);
assert.equal(chapters.chapters[0].title,'Chemical Reactions and Equations');
assert.equal(chapters.chapters[2].title,'Metals and Non-metals');
assert.match(page,/ncert10Chapters/);
const ncertBank=JSON.parse(get('data/ncert/quiz-bank.json'));
const sourced=new Set(ncertBank.sets.filter(s=>s.classLevel===10&&s.source?.chapter).map(s=>s.source.chapter));
assert.deepEqual([...sourced].sort((a,b)=>a-b),[1,2,3,4]);
assert.equal(audit.fullCoverageCertified,false,
 'Never claim complete SCERT/NCERT coverage before book-level bilingual review');
console.log('Quiz coverage: '+audit.scert.readyUnits+'/'+audit.scert.units+
  ' indexed SCERT units playable; '+audit.scert.indexedQuestions+
  ' indexed questions, '+audit.ncert.questions+' NCERT questions; completion NOT certified.');
