import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const json = path => JSON.parse(read(path));
const year = json('data/quizzes/pyq-yearwise-catalog.json').entries.find(
  item => item.year === 2025 && item.exam === 'Group II / IIA'
);
const catalogue = json('data/quizzes/typed-pyq-catalog.json').entries;
const reader = read('assets/js/pyq-bulk-reader.js');
const library = read('pyq-typed-library.html');
const sections = [
  { short: 'general-tamil-ccse2-2at', variant: 'GT', first: 1, firstPage: 3, lastPage: 42 },
  { short: 'general-english-ccse2-2ae', variant: 'GE', first: 1, firstPage: 3, lastPage: 42 },
  { short: 'gs-ccse2-2at', variant: 'GT', first: 101, firstPage: 43, lastPage: 131 }
];

const [tamil, english, studies] = sections.map(({ short, variant, first, firstPage, lastPage }) => {
  const id = 'tnpsc-group-ii-iia-2025-' + short + '-reviewed';
  const link = 'pyq-bulk-reader.html?paper=' + id;
  const book = json('data/quizzes/pyq-reader-drafts/' + id + '.json');
  assert.ok(year.documents.some(d => d.type === 'practice' && d.url === link));
  assert.ok(catalogue.some(e => e.id === id && e.link === link && e.typed === 100 && e.scorable === 0));
  assert.ok(reader.includes(id) && library.includes(link));
  assert.equal(book.sourcePdf, 'https://tnpsc.gov.in/Tentative/Document/11_2025_' + variant + '_WITH_GS_GRP_II_IIA.pdf');
  assert.equal(book.grading, 'disabled');
  assert.equal(book.officialFinalKeyMapped, false);
  assert.equal(book.questionCandidates.length, 100);
  assert.deepEqual(book.pages.map(p => p.pdfPage), Array.from({ length: lastPage - firstPage + 1 }, (_, i) => firstPage + i));
  let previous = firstPage;
  for (const [i, q] of book.questionCandidates.entries()) {
    assert.equal(q.number, first + i);
    assert.equal(q.sourcePdfPage, q.printedBookletPage);
    assert.ok(q.sourcePdfPage >= previous && q.sourcePdfPage <= lastPage);
    assert.equal(q.scoreEligible, false);
    assert.equal(q.correctAnswer, null);
    assert.equal(q.textRecovered, true);
    assert.equal(q.fourOptionsDetected, true);
    assert.ok(q.text.trim() && !q.text.includes('[ESEVAI]'));
    assert.deepEqual(Object.keys(q.options), ['A', 'B', 'C', 'D', 'E']);
    assert.ok(Object.values(q.options).every(value => value.trim().length));
    assert.equal(q.options.E, short.includes('tamil') ? 'விடை தெரியவில்லை' : 'Answer not known');
    previous = q.sourcePdfPage;
  }
  return book;
});

for (const [book, start, end, page] of [[tamil, 37, 41, 16], [english, 62, 64, 29]]) {
  const group = book.questionCandidates.slice(start - 1, end);
  const passage = group[0].text.split('\n\n')[0];
  assert.ok(passage.length > 200);
  assert.ok(group.every(q => q.passagePdfPage === page && q.text.startsWith(passage + '\n\n')));
  assert.equal(new Set(group.map(q => q.text)).size, group.length);
}
for (const [book, index] of [[english, 92], [studies, 0]]) {
  const q = book.questionCandidates[index];
  assert.equal(book.tentativeKeyReview.entries[q.number], null);
  assert.match(q.issues.join(' '), /expert committee/i);
}
assert.equal(studies.questionCandidates[98].sourcePdfPage, 130);
assert.match(studies.questionCandidates[98].options.C, /2.*3 and 6/);
assert.equal(studies.tentativeKeyReview.entries['199'], 'C');
assert.match(tamil.questionCandidates[50].options.A, /\n/);
assert.match(english.questionCandidates[29].options.A, /^Bourggiese$/);
console.log('PASS: both 200-question routes, sources, options, reading passages and ungraded referral items.');
