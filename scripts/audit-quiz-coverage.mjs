#!/usr/bin/env node
/**
 * ClearExams coverage gate. A "ready" textbook unit is playable, NOT certified
 * exhaustive or aligned to the currently prescribed English/Tamil editions.
 *
 * node scripts/audit-quiz-coverage.mjs --json
 * node scripts/audit-quiz-coverage.mjs --strict
 * node scripts/audit-quiz-coverage.mjs --require-full  // deliberately fails until certified
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const errors = [], warnings = [];
const readJson = (relative) => JSON.parse(readFileSync(resolve(root, relative), 'utf8'));
const scope = readJson('data/quizzes/coverage-scope.json');
const totals = {catalogs:0, units:0, readyUnits:0, starterUnits:0, expandedUnits:0,
  indexedQuestions:0, indexedQuizSets:0, independentlyCertifiedUnits:0};
const byClass = new Map();
function fileInsideRepo(relative) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\')) return null;
  const target = resolve(root, relative);
  return target.startsWith(root + sep) ? target : null;
}
function itemForClass(c) {
  if (!byClass.has(c)) byClass.set(c, {classLevel:c, catalogs:0, units:0,
    readyUnits:0, starterUnits:0, questions:0, subjectCatalogs:[]});
  return byClass.get(c);
}
const seenPaths = new Set();
for (const entry of scope.scertCatalogs) {
  const {classLevel,subject,term,path: indexPath} = entry;
  if (seenPaths.has(indexPath)) errors.push('Duplicated catalog: ' + indexPath);
  seenPaths.add(indexPath);
  const file = fileInsideRepo(indexPath);
  if (!file || !existsSync(file)) { errors.push('Missing/unsafe index: ' + indexPath); continue; }
  let data;
  try { data = readJson(indexPath); } catch(e) {
    errors.push('Cannot parse ' + indexPath + ': ' + e.message); continue;
  }
  if (!Array.isArray(data.units) || !data.units.length) {
    errors.push('Index has no units: ' + indexPath); continue;
  }
  if (Number(data.meta?.class)!==classLevel || String(data.meta?.subject).toLowerCase().replaceAll(' ','-')!==subject) {
    errors.push('Class/subject metadata mismatch: ' + indexPath);
  }
  if (term && Number(data.meta?.term)!==term) errors.push('Term mismatch: ' + indexPath);
  if (data.meta?.unit_count != null && Number(data.meta.unit_count)!==data.units.length) {
    errors.push('Incorrect unit_count: ' + indexPath);
  }
  totals.catalogs++;
  const group = itemForClass(classLevel);
  group.catalogs++;
  group.subjectCatalogs.push(subject+(term?' / Term '+term:''));
  const ids=new Set();
  let catalogQuestions=0;
  for(const unit of data.units) {
    const id=Number(unit.id);
    if (!Number.isInteger(id) || id<1 || ids.has(id)) {
      errors.push('Invalid/duplicate unit ID in ' + indexPath + ': ' + unit.id);
      continue;
    }
    ids.add(id);
    totals.units++;group.units++;
    const count=Number(unit.total);
    if (!Number.isInteger(count) || count<0) {
      errors.push('Bad unit question count: ' + indexPath + ' unit ' + id);
      continue;
    }
    catalogQuestions+=count;
    const part=String(unit.path||'');
    const bankFile=fileInsideRepo(indexPath.replace(/index\.json$/,part));
    if (!part.endsWith('.json') || part.includes('/') || !bankFile || !existsSync(bankFile)) {
      errors.push('Missing/unsafe question bank: ' + indexPath + ' unit ' + id);
      continue;
    }
    if (unit.ready===true && count>0) {
      totals.readyUnits++;group.readyUnits++;
      totals.indexedQuestions+=count;group.questions+=count;
      totals.indexedQuizSets+=Number(unit.quiz_count)||0;
      if(count<=20) {totals.starterUnits++;group.starterUnits++;}
      else totals.expandedUnits++;
      // Explicit two-medium, edition-specific, independently signed approval is required.
      if (unit.editorial_certified===true &&
          unit.edition_certified==='2026–27' &&
          unit.bilingual_source_review==='approved') totals.independentlyCertifiedUnits++;
    } else {
      warnings.push('Not playable: ' + indexPath + ' unit ' + id);
    }
  }
  const sequence=[...ids].sort((a,b)=>a-b);
  if (sequence.some((id,i)=>id!==i+1)) errors.push('Unit number gap: ' + indexPath);
  if (data.meta?.total_questions!=null && Number(data.meta.total_questions)!==catalogQuestions) {
    warnings.push('Declared total differs from sum of units: ' + indexPath);
  }
}
let ncert={sets:0,questions:0,classes:[],englishOnlySets:0,bilingualSets:0,
  bilingualQuestions:0,editorialPendingSets:0,sourceLinkedClass10Chapters:[],
  missingClass10Chapters:[],chapterInventoryCertified:scope.ncertChapterInventoryCertified===true};
try {
  const bank=readJson(scope.ncertBank);
  if (!Array.isArray(bank.sets)) throw new Error('No sets array');
  const classes=new Set();
  const ids=new Set();
  for(const set of bank.sets) {
    if (ids.has(set.id)) errors.push('Duplicate NCERT set: '+set.id);
    ids.add(set.id);classes.add(Number(set.classLevel));
    if (!Array.isArray(set.questions) || !set.questions.length) {
      errors.push('Empty NCERT set: ' + set.id);continue;
    }
    ncert.sets++;
    ncert.questions+=set.questions.length;
    if (set.language==='en-ta') {ncert.bilingualSets++;ncert.bilingualQuestions+=set.questions.length;}
    else ncert.englishOnlySets++;
    if(set.reviewStatus==='editorial-review-pending')ncert.editorialPendingSets++;
  }
  ncert.classes=[...classes].sort((a,b)=>a-b);
  for(let c=6;c<=12;c++) if(!classes.has(c)) errors.push('NCERT class absent: '+c);
  const chapters=readJson('data/ncert/class10-science-chapter-inventory.json').chapters;
  const covered=new Set(bank.sets.filter(s=>s.classLevel===10&&s.subject==='Science'&&
    s.language==='en-ta'&&Number.isInteger(s.source?.chapter)&&s.questions.length)
    .map(s=>s.source.chapter));
  ncert.sourceLinkedClass10Chapters=[...covered].sort((a,b)=>a-b);
  ncert.missingClass10Chapters=chapters.filter(ch=>!covered.has(ch.number))
    .map(ch=>({number:ch.number,title:ch.title}));
  for(const chapter of chapters)if(chapter.editorialCertified===true){
    const sets=bank.sets.filter(s=>s.source?.chapter===chapter.number&&s.classLevel===10);
    if(!sets.length||sets.some(s=>s.reviewStatus==='editorial-review-pending'))
      errors.push('NCERT chapter falsely certified without completed set reviews: '+chapter.number);
  }
} catch(e) { errors.push('NCERT bank missing or invalid: '+e.message); }

const missingSubjects=scope.scertAdditionalSubjectsNotCataloged.flatMap(x=>
  x.subjects.map(subject=>({classLevel:x.classLevel,subject})));
const blockers=[];
if(missingSubjects.length) blockers.push(missingSubjects.length+' additional SCERT class/subject areas lack a quiz catalog');
if(totals.readyUnits!==totals.units) blockers.push((totals.units-totals.readyUnits)+' indexed units are not playable');
if(totals.independentlyCertifiedUnits!==totals.units)
  blockers.push((totals.units-totals.independentlyCertifiedUnits)+' indexed SCERT units are not independently certified against current editions in both languages');
if(!ncert.chapterInventoryCertified) blockers.push('NCERT 2026–27 book-by-book chapter inventory is not certified');
if(ncert.englishOnlySets) blockers.push(ncert.englishOnlySets+' NCERT sets are English-only');
if(ncert.missingClass10Chapters.length) blockers.push(ncert.missingClass10Chapters.length+' NCERT Class 10 Science chapters lack source-linked bilingual practice');
if(ncert.editorialPendingSets) blockers.push(ncert.editorialPendingSets+' NCERT sets still require independent editorial review');
if(errors.length) blockers.push(errors.length+' structural catalog errors');
const report={asOf:scope.asOf,edition:scope.currentEdition,
  note:scope.meaningOfReady,scert:totals,byClass:[...byClass.values()].sort((a,b)=>a.classLevel-b.classLevel),
  missingScertSubjectAreas:missingSubjects,ncert,errors,warnings,
  fullCoverageCertified:blockers.length===0,blockers};
if(args.has('--json')) console.log(JSON.stringify(report,null,2));
else {
  console.log('ClearExams coverage audit: '+totals.readyUnits+'/'+totals.units+
    ' indexed SCERT units playable across '+totals.catalogs+' catalogs; '+
    totals.indexedQuestions+' indexed questions.');
  console.log('NCERT: '+ncert.questions+' questions across '+ncert.sets+' sets.');
  console.log('FULL COVERAGE CERTIFIED: '+(report.fullCoverageCertified?'YES':'NO'));
  blockers.forEach(x=>console.log('GAP: '+x));
  errors.forEach(x=>console.error('ERROR: '+x));
  warnings.slice(0,12).forEach(x=>console.log('WARNING: '+x));
}
if (args.has('--strict') && errors.length) process.exitCode=1;
if (args.has('--require-full') && !report.fullCoverageCertified) process.exitCode=2;
