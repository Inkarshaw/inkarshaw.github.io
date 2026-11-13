/* Evidence-based scoring audit: all untrusted editorial reasons rendered as text. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const selector = $('paperSelect'), status = $('auditStatus'), area = $('selectedDetails');
const make = (tag, value, className) => {
 const node = document.createElement(tag);
 if (value !== undefined) node.textContent = String(value);
 if (className) node.className = className;
 return node;
};
const officialSource = url => /^https:\/\/(?:www\.)?(?:tnpsc\.gov\.in|tnusrb\.tn\.gov\.in)\//i.test(String(url || ''));
function link(parent, href, label, className) {
 const a = make('a', label, className);
 a.href = href;
 if (/^https:\/\//i.test(href)) { a.target = '_blank'; a.rel = 'noopener noreferrer'; }
 parent.append(a);
}
function lineList(title, items, format) {
 if (!items.length) return;
 area.append(make('h3', title));
 const ul = document.createElement('ul');
 items.forEach(item => ul.append(make('li', format(item))));
 area.append(ul);
}
function details(p) {
 area.replaceChildren();
 if (!p) return;
 area.append(make('h3', p.name));
 const summary = make('p', p.provisionallyScorable + ' of ' + p.playable + ' source-numbered positions provisionally scorable; ' + p.notScored + ' ungraded.');
 area.append(summary);
 for (const [num, label] of [[p.notMappedToQuestionText, 'Official key mapping pending'], [p.specialAllNumbers.length, 'Special ALL exclusions'], [p.sourceDisputes.length, 'Source disputes']]) {
  if (num) area.append(make('span', num + ' ' + label, 'pill'));
 }
 area.append(make('p', 'Key evidence: ' + p.answerKeyEvidence));
 if (p.notMappedToQuestionText) {
  area.append(make('h3', 'Questions Q1–Q' + p.notMappedToQuestionText + ' — key not safely mapped'));
  area.append(make('p', 'These responses are recorded without correct/incorrect flags or exam marks. The original specimen numbering and each A–E alternative must be visually checked before grading.'));
 }
 lineList('Special ALL-key numbers — excluded by current practice policy',
          p.specialAllNumbers, n => 'Q' + n + ': official/special ALL key entry; not assigned one correct option');
 lineList('Source/key disputes — not scored',
          p.sourceDisputes, row => 'Q' + row.number + ': ' + (row.reason || 'Original source verification pending'));
 lineList('Additional OCR and figure warnings (subset of the ungraded key-mapping group)',
          p.additionalTextWarnings, row => 'Q' + row.number + ': ' + (row.reason || 'Source image review needed'));
 area.append(make('h3', 'Next editorial action'));
 area.append(make('p', p.reviewNextStep));
 if (officialSource(p.sourceUrl)) link(area, p.sourceUrl, 'Official source or paper archive', 'action');
 if (/^(?:tnpsc|tnusrb|pyq)-[a-z0-9-]+\.html(?:\?year=20(?:24|25))?$/.test(p.quizUrl))
  link(area, p.quizUrl, 'Open this text quiz', 'action');
}
fetch('data/quizzes/pyq-scoring-review.json', {cache:'no-store'})
 .then(response => { if (!response.ok) throw Error('HTTP ' + response.status); return response.json(); })
 .then(data => {
  if (data.schemaVersion !== 1 || !Array.isArray(data.papers) || data.papers.length !== 8 ||
      data.totals?.playable !== 1420 || data.totals?.provisionallyScorable !== 1157 ||
      data.totals?.notScored !== 263 || data.totals?.specialAllExcluded !== 31 ||
      data.totals?.sourceDisputes !== 32 || data.totals?.notMappedToQuestionText !== 200 ||
      data.papers.some(p => p.notScored !== p.notMappedToQuestionText + p.specialAllNumbers.length + p.sourceDisputes.length))
    throw Error('The scoring register does not reconcile with published paper totals');
  data.papers.forEach(p => {
   const option = make('option', p.name); option.value = p.id; selector.append(option);
  });
  selector.addEventListener('change', () => details(data.papers.find(p => p.id === selector.value)));
  status.textContent = 'Audit loaded: ' + data.totals.papers + ' papers. Choose a paper to view exact exceptions.';
  selector.value = 'tnpsc-g1-2026';
  details(data.papers[0]);
 })
 .catch(error => {
  status.textContent = 'The detailed question register could not load (' + error.message + '). The paper-by-paper static summary above remains available.';
 });
})();
