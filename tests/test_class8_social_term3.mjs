#!/usr/bin/env node
// Class 8 Social Science Term III: enforce truthful partial coverage and bilingual quiz integrity.
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import vm from 'node:vm';

const read = p => readFileSync(new URL('../' + p, import.meta.url), 'utf8');
const root = 'data/textbook/class-8/social-science/term-3/';
const index = JSON.parse(read(root + 'index.json'));
const pageStarts = [122, 131, 140, 147, 164, 177, 187, 196];
assert.equal(index.meta.class, 8);
assert.equal(index.meta.subject, 'Social Science');
assert.equal(index.meta.term, 3);
assert.equal(index.meta.edition, 2019);
assert.equal(index.meta.unit_count, 8);
assert.equal(index.units.length, 8);
assert.deepEqual(index.units.map(u => u.chapter_page_en), pageStarts);
assert.equal(index.meta.published_unit_count, 4);
assert.equal(index.meta.total_questions, 80);
assert.equal(index.meta.total_quiz_sets, 4);
const ready = index.units.filter(u => u.ready);
const pending = index.units.filter(u => !u.ready);
assert.deepEqual(ready.map(u => u.id), [1,3,7,8]);
assert.deepEqual(pending.map(u => u.id), [2,4,5,6]);
for (const u of pending) {
  assert.equal(u.total, 0);
  assert.equal(u.quiz_count, 0);
  assert.ok(!u.path, 'Pending unit must not have a playable path');
  assert.ok(!existsSync(new URL('../' + root + 'unit-' + u.id + '.json', import.meta.url)));
}
const qc = vm.createContext({window:{}});
vm.runInContext(read('assets/js/textbook-quality.js'), qc);
const quality = qc.window.TextbookQuality;
const en = 'https://cdn1.byjus.com/wp-content/uploads/2020/01/Samacheer-Kalvi-Class-8-Social-Science_Term_IIIEM.pdf';
const ta = 'https://cdn1.byjus.com/wp-content/uploads/2020/01/Samacheer-Kalvi-Class-8-Social-Science_Term_IIITM.pdf';
const pages = {1:[122,130],3:[140,146],7:[187,194],8:[196,205]};
const ids = new Set();
for (const u of ready) {
  assert.equal(u.total, 20);
  assert.equal(u.quiz_count, 1);
  assert.equal(u.path, 'unit-' + u.id + '.json');
  const d = JSON.parse(read(root + u.path));
  assert.equal(d.meta.class, 8);
  assert.equal(d.meta.term, 3);
  assert.equal(d.meta.edition, 2019);
  assert.equal(d.meta.unit, u.id);
  assert.equal(d.meta.total_questions, 20);
  assert.equal(d.meta.quiz_sets.length, 1);
  assert.equal(d.meta.source_en_url, en);
  assert.equal(d.meta.source_ta_url, ta);
  assert.ok(/2026|prescribed|certif/i.test(d.meta.editorial_status), 'Disclose edition/translation limitations');
  assert.equal(d.questions.length, 20);
  const positions = new Set();
  for (const [i,q] of d.questions.entries()) {
    assert.equal(q.id, 'C8SS3U' + u.id + '-Q' + String(i+1).padStart(3,'0'));
    assert.ok(!ids.has(q.id), 'Duplicate question ID');
    ids.add(q.id);
    assert.equal(q.quiz, 1);
    assert.equal(typeof q.q_en,'string');
    assert.equal(typeof q.q_ta,'string');
    assert.ok(q.q_en.endsWith('?') && q.q_ta.endsWith('?'), q.id + ' bilingual question');
    assert.ok(q.q_en.length >= 22 && q.q_ta.length >= 10, q.id + ' meaningful stems');
    assert.equal(q.opts_en.length, 4);
    assert.equal(q.opts_ta.length, 4);
    assert.equal(new Set(q.opts_en.map(x => x.trim().toLowerCase())).size, 4);
    assert.equal(new Set(q.opts_ta.map(x => x.trim().toLowerCase())).size, 4);
    assert.ok(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4);
    positions.add(q.correct);
    assert.ok(q.exp_en.length >= 30 && q.exp_ta.length >= 15, q.id + ' explanation');
    assert.ok(q.page_en >= pages[u.id][0] && q.page_en <= pages[u.id][1], q.id + ' page range');
    assert.ok(quality.valid(q), 'Rejected by player quality gate: ' + q.id);
    assert.ok(!quality.isBoilerplate(q.q_en), q.id + ' boilerplate stem');
  }
  assert.ok(positions.size >= 3, 'Answer positions need variation: unit ' + u.id);
  const curated = quality.curate(d.questions).questions;
  assert.equal(curated.length, 20, 'All questions must be playable in unit ' + u.id);
  assert.deepEqual(Array.from(curated, q => q.id).sort(), d.questions.map(q => q.id).sort());
}
assert.equal(ids.size, 80);
const catalog = read('textbook-quiz.html');
const player = read('textbook-play.html');
assert.ok(catalog.includes("'data/textbook/class-'+cls+'/'+subject+termSegment+'/index.json'"));
assert.ok(catalog.includes('if(!u.ready)'));
assert.ok(catalog.includes('Four of eight Term III Social Science chapters currently have 20-question bilingual starter quizzes'));
assert.ok(player.includes("'data/textbook/class-'+classNo+'/'+subject+'/term-'+term+'/unit-'+unit+'.json'"));
console.log('Class 8 Term III: four source-linked ready units, 80 bilingual MCQs, four clearly pending units.');
