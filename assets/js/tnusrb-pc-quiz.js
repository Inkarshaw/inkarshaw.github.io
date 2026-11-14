/* TNUSRB Police Constable source-numbered PYQ study reader; no unsupported exam marks. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const allowed = new Set(['2019', '2020', '2022']);
const requested = new URLSearchParams(location.search).get('year');
const year = allowed.has(requested) ? requested : '2022';
const letters = ['A', 'B', 'C', 'D'];
const storageKey = 'clearexams:tnusrb-pc-pyq:v1:' + year;
let bank = null, answers = {}, flags = {}, checked = {}, index = 0, mode = 'practice', finished = false;
const newElement = (tag, text, css) => {
 const el = document.createElement(tag);
 if (text !== undefined && text !== null) el.textContent = text;
 if (css) el.className = css;
 return el;
};
function save() {
 try { localStorage.setItem(storageKey, JSON.stringify({answers, flags, checked, index, mode, finished})); } catch {}
}
function restore() {
 let saved;
 try { saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); } catch { saved = null; }
 if (!saved || typeof saved !== 'object') return;
 const valid = new Set(bank.questions.map(q => String(q.number)));
 const clean = (object, test) => Object.fromEntries(
  Object.entries(object && typeof object === 'object' && !Array.isArray(object) ? object : {})
   .filter(([key, value]) => valid.has(key) && test(value))
 );
 answers = clean(saved.answers, v => letters.includes(v));
 flags = clean(saved.flags, v => v === true);
 checked = clean(saved.checked, v => v === true);
 index = Number.isInteger(saved.index) && saved.index >= 0 && saved.index < bank.questions.length ? saved.index : 0;
 mode = saved.mode === 'exam' ? 'exam' : 'practice';
 finished = saved.finished === true;
 $('mode').value = mode;
}
function countAnswered() { return bank.questions.filter(q => letters.includes(answers[q.number])).length; }
function provisional(q) { return q.scoringStatus === 'provisional_key'; }
function showOnly(section) {
 for (const name of ['setup', 'quiz', 'result']) $(name).hidden = name !== section;
}
function setNotice() {
 const provisionalCount = bank.questions.filter(provisional).length;
 const allCount = bank.questions.filter(q => q.scoringStatus === 'ungraded_all_options_accepted').length;
 const figureCount = bank.questions.filter(q => q.scoringStatus === 'ungraded_missing_original_figure').length;
 $('heading').textContent = 'TNUSRB Police Constable ' + year + ' · Booklet ' + bank.bookletSeries;
 document.title = 'TNUSRB PC ' + year + ' PYQ Study Quiz | ClearExams';
 document.querySelectorAll('.papers a[data-year]').forEach(link => {
  if (link.dataset.year === year) link.setAttribute('aria-current', 'page');
  else link.removeAttribute('aria-current');
 });
 $('meta').replaceChildren();
 [bank.questionCount + ' source-numbered questions',
  provisionalCount + ' provisionally scorable',
  (bank.questionCount - provisionalCount) + ' ungraded',
  'Booklet ' + bank.bookletSeries]
  .forEach(message => $('meta').append(newElement('span', message)));
 if (year === '2022') {
  $('sourceNote').textContent = '2022 Booklet A: the supplied final key supports indicative scoring only for ' + provisionalCount +
  ' questions. ' + allCount + ' all-options-accepted entries and ' + figureCount +
  ' figure-dependent entries without reproduced original artwork are ungraded. Tamil study text and tables are normalized, not certified as verbatim official wording.';
  $('sourceNote').classList.add('verified');
 } else {
  $('sourceNote').textContent = year + ' Booklet ' + bank.bookletSeries +
   ': all 80 questions can be answered, but the supplied workbook includes worked study answers rather than a verified official final key. No exam marks or correct/incorrect claims are made. Some original figures are not yet reproduced.';
 }
}
function drawPalette() {
 const palette = $('palette'); palette.replaceChildren();
 for (let i=0; i<bank.questions.length; i++) {
  const q = bank.questions[i];
  const button = newElement('button', String(q.number), (answers[q.number] ? 'done ' : '') + (flags[q.number] ? 'flagged ' : '') + (i === index ? 'current' : ''));
  button.type = 'button';
  button.setAttribute('aria-label', 'Go to question ' + q.number +
   (answers[q.number] ? ', answered' : ', unanswered') + (flags[q.number] ? ', flagged' : ''));
  if (i === index) button.setAttribute('aria-current','step');
  button.addEventListener('click', () => { index=i; save(); drawQuestion(); });
  palette.append(button);
 }
}
function drawQuestion() {
 const q = bank.questions[index]; if (!q) return;
 showOnly('quiz');
 $('position').textContent = 'Question ' + q.number + ' of ' + bank.questionCount;
 $('status').textContent = countAnswered() + ' answered · ' + Object.keys(flags).length + ' flagged';
 $('progressFill').style.width = (100 * countAnswered() / bank.questionCount).toFixed(1) + '%';
 $('progress').setAttribute('aria-valuenow', String(Math.round(100 * countAnswered() / bank.questionCount)));
 $('section').textContent = q.section + ' · ' + q.topic + (provisional(q) ? ' · provisional key' : ' · ungraded');
 $('questionText').textContent = q.question;
 $('questionSource').replaceChildren(newElement('span', 'Source: ' + q.source));
 if (q.figureRef) {
  $('questionSource').append(newElement('p', 'Original figure reference: ' + q.figureRef +
   '. The source visual is not reproduced here; interpret this question using the original paper. ' +
   (provisional(q) ? '' : 'This item is not graded.')));
 }
 if (q.editorialNote) $('questionSource').append(newElement('p', 'Editorial note: ' + q.editorialNote));
 if (q.figureRef && bank.sourcePaperUrl) {
  const page = /PDF p\.\s*(\d+)/i.exec(q.source);
  const link = newElement('a', 'Open externally hosted 2022 source PDF' + (page ? ' near page ' + page[1] : ''));
  link.href = bank.sourcePaperUrl + (page ? '#page=' + encodeURIComponent(page[1]) : '');
  link.target = '_blank'; link.rel = 'noopener noreferrer';
  $('questionSource').append(link);
 }
 const options = $('options'); options.replaceChildren();
 for (const letter of letters) {
  const button = newElement('button', undefined, 'option'); button.type = 'button';
  button.setAttribute('aria-pressed', String(answers[q.number] === letter));
  button.append(newElement('b', letter), newElement('span', q.options[letter]));
  button.addEventListener('click', () => {
   answers[q.number] = letter; delete checked[q.number]; save(); drawQuestion();
  });
  options.append(button);
 }
 $('flag').textContent = flags[q.number] ? 'Unmark review flag' : 'Mark for review';
 $('prev').disabled = index === 0; $('next').disabled = index === bank.questions.length - 1;
 $('check').hidden = mode === 'exam';
 $('feedback').hidden = !(mode === 'practice' && checked[q.number]);
 if (!$('feedback').hidden) explain(q, $('feedback'), true);
 drawPalette();
}
function explanationText(q) {
 if (q.scoringStatus === 'ungraded_unverified_final_key') {
  return 'Unofficial worked-study answer from the supplied workbook: ' +
   (q.studyAnswer.join(' / ') || 'not stated') +
   '. Original-board final key not verified. No exam marks awarded.';
 }
 if (q.scoringStatus === 'ungraded_missing_original_figure') {
  return 'Ungraded: original figure ' + q.figureRef +
   ' has not been reproduced or visually reconciled. Source-key letters are not treated as certified correctness.';
 }
 if (q.scoringStatus === 'ungraded_all_options_accepted') {
  return 'Ungraded: the supplied final key accepts all choices. This is excluded from indicative marking.';
 }
 const selected = answers[q.number];
 const accepted = q.acceptedAnswers;
 if (!selected) return 'Not answered. Accepted for provisional practice marks: ' + accepted.join(' / ') + '.';
 return (accepted.includes(selected) ? 'Provisional correct.' : 'Provisional incorrect.') +
  ' Accepted key: ' + accepted.join(' / ') + '. The official original booklet is authoritative.';
}
function explain(q, target, includeReason) {
 target.replaceChildren();
 target.append(newElement('h3', 'Source-aware answer review'));
 target.append(newElement('p', explanationText(q)));
 if (!includeReason) return;
 if (q.editorialNote) target.append(newElement('p', 'Source caution: ' + q.editorialNote));
 if (q.scoringStatus === 'ungraded_missing_original_figure') {
  target.append(newElement('p', 'Option explanations are withheld until the exact source figure is compared.')); return;
 }
 const list = newElement('ul');
 for (const letter of letters) list.append(newElement('li', letter + ': ' + q.optionExplanations[letter]));
 target.append(list);
}
function openResult() {
 finished = true; save(); showOnly('result');
 const scored = bank.questions.filter(provisional);
 const attempted = scored.filter(q => letters.includes(answers[q.number]));
 const correct = attempted.filter(q => q.acceptedAnswers.includes(answers[q.number]));
 const notScored = bank.questionCount - scored.length;
 $('score').textContent = scored.length ? correct.length + ' / ' + scored.length : 'Ungraded study paper';
 $('scoreDetails').textContent = countAnswered() + ' of ' + bank.questionCount + ' questions answered. ' +
 (scored.length ? correct.length + ' provisionally correct, ' + (attempted.length-correct.length) +
 ' provisionally incorrect, ' + (scored.length-attempted.length) + ' unattempted gradable, ' : '') +
 notScored + ' ungraded. These are not official exam marks.';
 const list = $('resultList'); list.replaceChildren();
 for (const q of bank.questions) {
  const panel = newElement('details');
  const state = provisional(q) ? (
   answers[q.number] ? (q.acceptedAnswers.includes(answers[q.number]) ? 'Indicative correct' : 'Indicative incorrect') : 'Unanswered'
  ) : 'Ungraded';
  panel.append(newElement('summary', 'Q' + q.number + ' · ' + state +
   ' · Chosen: ' + (answers[q.number] || '—') + (flags[q.number] ? ' · flagged' : '')));
  const body = newElement('div', undefined, 'resultBody');
  body.append(newElement('p', q.question));
  explain(q, body, true);
  panel.append(body); list.append(panel);
 }
}
function validateBank(data) {
 const count = year === '2022' ? 150 : 80;
 if (!data || data.schemaVersion!==1 || data.year!==Number(year) || data.questionCount!==count ||
 !Array.isArray(data.questions) || data.questions.length !== count) throw Error('Question bank invalid or incomplete.');
 let scored = 0;
 data.questions.forEach((q,i) => {
  if (q.number!==i+1 || !String(q.question||'').trim() || !q.options ||
   letters.some(letter=>!String(q.options[letter]||'').trim()) ||
   !Array.isArray(q.acceptedAnswers) || !Array.isArray(q.studyAnswer) ||
   !q.optionExplanations || letters.some(letter=>!String(q.optionExplanations[letter]||'').trim())) {
   throw Error('Incomplete question Q' + (i+1));
  }
  if (q.scoringStatus==='provisional_key') {
   if (year!=='2022' || q.figureRef || !q.acceptedAnswers.length ||
    q.acceptedAnswers.some(letter=>!letters.includes(letter))) throw Error('Unsafe graded answer Q'+q.number);
   scored++;
  } else if (year!=='2022' && (q.scoringStatus!=='ungraded_unverified_final_key'||q.acceptedAnswers.length)) {
   throw Error('Unofficial key must not score Q'+q.number);
  }
 });
 if (scored!==(year==='2022'?141:0)) throw Error('Scoring audit failed');
}
$('start').addEventListener('click', () => { mode = $('mode').value==='exam'?'exam':'practice'; finished = false; save(); drawQuestion(); });
$('restart').addEventListener('click', () => {
 if (!window.confirm('Clear saved answers and flags for ' + year + '?')) return;
 answers={}; flags={}; checked={}; index=0; finished=false; save(); $('mode').value='practice'; $('setup').hidden=false; showOnly('setup');
});
$('check').addEventListener('click', () => { if (!bank || mode==='exam') return; checked[bank.questions[index].number]=true; save(); drawQuestion(); });
$('flag').addEventListener('click', () => { const n=bank.questions[index].number; if(flags[n])delete flags[n];else flags[n]=true;save();drawQuestion(); });
$('clear').addEventListener('click', () => { const n=bank.questions[index].number;delete answers[n];delete checked[n];save();drawQuestion(); });
$('prev').addEventListener('click', () => {if(index>0){index--;save();drawQuestion();}});
$('next').addEventListener('click', () => {if(bank&&index<bank.questions.length-1){index++;save();drawQuestion();}});
$('finish').addEventListener('click', () => {if(bank)openResult();});
$('reviewPaper').addEventListener('click', () => {finished=false;save();drawQuestion();});
$('newAttempt').addEventListener('click', () => {
 if (!window.confirm('Clear this attempt and start again?'))return;
 answers={};flags={};checked={};index=0;finished=false;save();showOnly('setup');
});
fetch('data/quizzes/tnusrb-pc-'+year+'.json', {cache:'no-store'})
.then(response => {if(!response.ok) throw Error('HTTP '+response.status);return response.json();})
.then(data => {
 validateBank(data); bank=data; restore(); setNotice();
 $('loadStatus').textContent='All '+bank.questionCount+' source-numbered questions loaded.';
 if(finished) openResult(); else if(countAnswered()>0) drawQuestion(); else showOnly('setup');
})
.catch(error => {
 $('loadStatus').textContent='The source-numbered paper could not be opened: '+error.message+'. Please reload later.';
});
})();
