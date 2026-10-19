#!/usr/bin/env node
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import vm from 'node:vm';

const root = process.cwd();
const context = vm.createContext({window: {}});
vm.runInContext(fs.readFileSync(path.join(root, 'assets/js/textbook-quality.js'), 'utf8'), context);
const quality = context.window.TextbookQuality;
const bank = JSON.parse(fs.readFileSync(
  path.join(root, 'data/textbook/class-9/science/unit-1.json'), 'utf8'));

test('Class 9 SI-symbol distractors remain eligible in the live player', () => {
  for (const number of [6, 21, 39, 107, 108, 133, 182, 216, 302, 313, 403]) {
    const q = bank.questions[number - 1];
    assert.equal(quality.valid(q), true, q.id + ': valid scientific symbol options should be accepted');
    const curated = quality.curate([q]);
    assert.equal(curated.questions.length, 1, q.id + ': should remain playable');
    assert.equal(curated.questions[0].id, q.id);
  }
});

test('ordinary case duplicates and exact duplicate scientific symbols remain invalid', () => {
  const base = bank.questions[5];
  assert.equal(quality.valid({...base, q_en: 'Which force acts on falling bodies?',
    opts_en: ['Gravity', 'gravity', 'Friction', 'Magnetism']}), false);
  assert.equal(quality.valid({...base, opts_en: ['kg', 'kg', 'KG', 'kG']}), false);
  assert.equal(quality.valid({...base, q_en: 'Which force is measured?',
    opts_en: ['kg', 'Kg', 'KG', 'kG']}), false);
});
