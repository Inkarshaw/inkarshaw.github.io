/* TNPSC Group IV 2022 text-draft practice.
   Source questions are user-supplied and NOT labelled as complete verbatim verification.
   Version A keys are mapped from the linked TNPSC final-key PDF.
   Incomplete source questions and official ALL entries are excluded from indicative scoring. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const STORE = 'clearexamsTNPSCG42022TextQuizV1';
  const PAPER = 'tnpsc-group-iv-2022-general-tamil-general-studies';
  const CHOICES = ['A', 'B', 'C', 'D', 'E'];
  const KEY_RE = /^(?:[ABCD](?:\/[ABCD]){0,3}|ALL)$/;
  let questions = [], finalKey = null, state = null, ticker = null;
  const hasMissing = q => q.textStatus === 'incomplete_user_transcription' ||
    CHOICES.some(letter => /\[(?:not legible|not shown|missing)/i.test(q.options?.[letter] || ''));
  const isSpecial = q => finalKey.answers[q.number - 1] === 'ALL';
  const saved = () => { try { return JSON.parse(localStorage.getItem(STORE) || 'null'); } catch { return null; } };
  const save = () => { if (state) try { localStorage.setItem(STORE, JSON.stringify(state)); } catch {} };
  const blank = (mode, timed) => ({
    version: 1, index: 0, answers: Array(200).fill(null),
    marked: Array(200).fill(false), shown: Array(200).fill(false),
    mode, timed, deadline: timed ? Date.now() + 180 * 60000 : 0,
    submitted: false
  });
  const validState = s => s && s.version === 1 && s.answers?.length === 200 &&
    s.marked?.length === 200 && s.shown?.length === 200 &&
    s.answers.every(x => x === null || CHOICES.includes(x)) &&
    s.marked.every(x => typeof x === 'boolean') &&
    s.shown.every(x => typeof x === 'boolean') &&
    Number.isInteger(s.index) && s.index >= 0 && s.index < 200 &&
    ['practice', 'exam'].includes(s.mode) && typeof s.submitted === 'boolean' &&
    (!s.timed || Number.isFinite(s.deadline));
  function setLoading(txt) { $('loading').textContent = txt; }
  function eligible(q) { return !hasMissing(q) && !isSpecial(q); }
  function grade(q) {
    if (!eligible(q)) return 'ungraded';
    const answer = state.answers[q.number - 1];
    if (!answer) return 'unanswered';
    return finalKey.answers[q.number - 1].split('/').includes(answer) ? 'correct' : 'incorrect';
  }
  function summary() {
    const results = questions.map(grade);
    const count = k => results.filter(v => v === k).length;
    const correct = count('correct'), incorrect = count('incorrect'),
      unanswered = count('unanswered'), ungraded = count('ungraded');
    return { correct, incorrect, unanswered, ungraded, maximum: (200 - ungraded) * 1.5, marks: correct * 1.5 };
  }
  function filterQuestions() {
    const f = $('filter').value;
    return questions.filter(q => f === 'all' ||
      (f === 'ta' && q.number <= 100) ||
      (f === 'en' && q.number > 100) ||
      (f === 'incomplete' && hasMissing(q)) ||
      (f === 'marked' && state.marked[q.number - 1]));
  }
  function move(step) {
    const list = filterQuestions();
    const at = list.findIndex(q => q.number - 1 === state.index);
    const next = at < 0 ? 0 : Math.max(0, Math.min(at + step, list.length - 1));
    if (list[next]) { state.index = list[next].number - 1; save(); render(); }
  }
  function displayKey(q) {
    const token = finalKey.answers[q.number - 1];
    return token === 'ALL' ?
      'TNPSC final key: ALL. This question is excluded from indicative scoring.' :
      'TNPSC final key: ' + token + '. ' +
      token.split('/').map(letter => letter + ') ' + q.options[letter]).join(' · ');
  }
  function status(q) {
    return hasMissing(q) ? 'Text incomplete' : isSpecial(q) ? 'Official ALL key' : 'User transcription · review pending';
  }
  function render() {
    if (!state) return;
    const q = questions[state.index], i = state.index, missing = hasMissing(q);
    $('questionNo').textContent = 'Original Question ' + q.number + ' of 200';
    $('questionSection').textContent = q.number <= 100 ? 'General Tamil' : 'General Studies & Aptitude';
    $('questionStatus').textContent = status(q);
    $('questionText').textContent = q.question;
    $('questionText').lang = q.number <= 100 ? 'ta' : 'en';
    const figure = $('questionFigure'); figure.replaceChildren();
    if (q.visual && ['assets/pyq-original/tnpsc-g4-2022-q172.svg','assets/pyq-original/tnpsc-g4-2022-q173.svg'].includes(q.visual.src)) {
      const img = document.createElement('img'); img.src = q.visual.src;
      img.alt = q.visual.alt || ('Question ' + q.number + ' figure');
      img.loading = 'lazy'; figure.append(img);
    }
    $('questionWarning').hidden = !missing;
    if (missing) $('questionWarning').textContent =
      'This question has missing, damaged or suspect source content. Read the TNPSC original PDF before answering. This question will not affect the indicative score.';
    const options = $('optionList'); options.replaceChildren();
    CHOICES.forEach(letter => {
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'option' + (/\[(?:not legible|not shown|missing)/i.test(q.options?.[letter] || '') ? ' incomplete' : '');
      b.setAttribute('aria-pressed', String(state.answers[i] === letter));
      b.disabled = state.submitted;
      const lead = document.createElement('b'); lead.textContent = letter;
      const value = document.createElement('span'); value.textContent = q.options[letter] || '[not supplied]';
      b.append(lead, value);
      b.addEventListener('click', () => {
        state.answers[i] = letter; save(); render();
      });
      options.append(b);
    });
    $('mark').textContent = state.marked[i] ? '⚑ Marked for review' : '⚐ Review later';
    $('clear').disabled = !state.answers[i] || state.submitted;
    $('reveal').hidden = state.mode === 'exam' && !state.submitted;
    $('reveal').disabled = state.mode === 'exam' && !state.submitted;
    const showKey = state.submitted || state.shown[i];
    $('feedback').hidden = !showKey;
    if (showKey) {
      $('feedback').textContent = displayKey(q) +
        (missing ? ' Source text requires correction; this question is ungraded.' : '');
      $('feedback').className = 'feedback' + (missing || isSpecial(q) ? ' warning' : '');
    }
    const list = filterQuestions(), pos = list.findIndex(v => v.number - 1 === i);
    $('previous').disabled = pos <= 0;
    $('next').disabled = pos < 0 || pos >= list.length - 1;
    updateProgress(); drawPalette(); save();
  }
  function drawPalette() {
    const frag = document.createDocumentFragment(), list = filterQuestions();
    list.forEach(q => {
      const i = q.number - 1;
      const b = document.createElement('button'); b.type = 'button';
      b.className = 'slot' +
        (state.answers[i] ? ' answered' : '') +
        (state.marked[i] ? ' marked' : '') +
        (state.index === i ? ' current' : '');
      b.textContent = q.number;
      b.title = 'Question ' + q.number + (hasMissing(q) ? ' · transcription incomplete' : '');
      b.setAttribute('aria-label', b.title);
      if (state.index === i) b.setAttribute('aria-current', 'step');
      b.addEventListener('click', () => { state.index = i; save(); render(); });
      frag.append(b);
    });
    $('palette').replaceChildren(frag);
    $('paletteStats').textContent = list.length + ' shown; ' +
      list.filter(q => state.answers[q.number - 1]).length + ' answered in this filter.';
  }
  function updateProgress() {
    const answered = state.answers.filter(Boolean).length;
    const marked = state.marked.filter(Boolean).length;
    $('progressText').textContent = answered + '/200 answered · ' +
      marked + ' marked · ' + questions.filter(hasMissing).length + ' transcript issues';
    $('progressFill').style.width = (100 * answered / 200).toFixed(1) + '%';
  }
  function tick() {
    if (!state || state.submitted || !state.timed) { $('timer').hidden = true; return; }
    const left = Math.max(0, Math.ceil((state.deadline - Date.now()) / 1000));
    $('timer').hidden = false;
    $('timer').textContent = 'Remaining: ' + Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
    if (!left) finish(true);
  }
  function start() {
    const prior = saved();
    if (validState(prior) && !prior.submitted) {
      state = prior;
    } else {
      state = blank($('mode').value, $('timed').checked);
    }
    $('setup').hidden = true;
    $('workspace').hidden = false;
    $('results').hidden = true;
    $('filter').value = 'all';
    render(); tick();
  }
  function finish(expired = false) {
    if (!state || state.submitted) return;
    const unanswered = state.answers.filter(x => !x).length;
    if (!expired && unanswered && !confirm(unanswered + ' question(s) are unanswered. Submit anyway?')) return;
    state.submitted = true; save();
    $('workspace').hidden = true; $('results').hidden = false;
    const s = summary();
    $('score').textContent = (expired ? 'Time expired. ' : '') +
      s.correct + ' correct, ' + s.incorrect + ' incorrect, ' +
      s.unanswered + ' unanswered in gradable questions; ' + s.ungraded +
      ' ungraded. Indicative marks: ' + s.marks + ' / ' + s.maximum + '.';
    const box = $('review'); box.replaceChildren();
    questions.forEach(q => {
      const i = q.number - 1;
      const item = document.createElement('details'); item.className = 'review-item';
      const head = document.createElement('summary'); head.textContent =
        q.number + '. ' + q.question.slice(0, 125) +
        (q.question.length > 125 ? '…' : '') + ' — ' + grade(q);
      const selected = document.createElement('p');
      selected.textContent = 'Your choice: ' +
        (state.answers[i] ? state.answers[i] + '. ' + q.options[state.answers[i]] : 'Unanswered');
      const key = document.createElement('p'); key.textContent = displayKey(q);
      const note = document.createElement('p'); note.className = 'small';
      note.textContent = status(q);
      item.append(head, selected, key, note); box.append(item);
    });
    $('results').scrollIntoView({ block: 'start' });
  }
  function reset() {
    if (!confirm('Delete the saved answers and begin a new attempt?')) return;
    try { localStorage.removeItem(STORE); } catch {}
    state = null;
    $('workspace').hidden = true; $('results').hidden = true; $('setup').hidden = false;
    $('mode').disabled = false; $('timed').disabled = false;
    window.scrollTo(0, 0);
  }
  $('start').addEventListener('click', start);
  $('reset').addEventListener('click', reset);
  $('filter').addEventListener('change', () => {
    if (!state) return;
    const list = filterQuestions();
    if (list.length && !list.some(q => q.number === state.index + 1)) state.index = list[0].number - 1;
    render();
  });
  $('previous').addEventListener('click', () => move(-1));
  $('next').addEventListener('click', () => move(1));
  $('mark').addEventListener('click', () => { if (!state) return; state.marked[state.index] = !state.marked[state.index]; render(); });
  $('clear').addEventListener('click', () => { state.answers[state.index] = null; render(); });
  $('reveal').addEventListener('click', () => { state.shown[state.index] = true; render(); });
  $('submit').addEventListener('click', () => finish(false));
  $('return').addEventListener('click', () => {
    $('workspace').hidden = false; $('results').hidden = true; render();
  });
  $('retry').addEventListener('click', () => {
    if (!confirm('Start a fresh attempt? This replaces saved answers.')) return;
    state = blank(state.mode, state.timed);
    $('workspace').hidden = false; $('results').hidden = true; render(); tick();
  });
  ticker = setInterval(tick, 1000);
  Promise.all([
    fetch('data/quizzes/tnpsc-g4-2022-user-transcription-tamil-draft.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw Error('Tamil transcription unavailable'); return r.json(); }),
    fetch('data/quizzes/tnpsc-g4-2022-user-transcription-english-draft.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw Error('English transcription unavailable'); return r.json(); }),
    fetch('data/quizzes/original-final-keys.json', { cache: 'no-store' }).then(r => { if (!r.ok) throw Error('Final key mapping unavailable'); return r.json(); })
  ]).then(([ta, en, keys]) => {
    if (ta.paperId !== PAPER || en.paperId !== PAPER || ta.questionCount !== 100 || en.questionCount !== 100) throw Error('Source paper version mismatch');
    const entry = keys.papers?.find(p => p.id === PAPER);
    if (!entry || entry.paperVersion !== 'CCS4T/2022 · General Tamil + General Studies' ||
      entry.answers?.length !== 200 || !entry.answers.every(x => KEY_RE.test(x))) throw Error('Official key not fully mapped');
    finalKey = entry;
    questions = [...ta.questions, ...en.questions].sort((a, b) => a.number - b.number);
    if (questions.length !== 200 || questions.some((q, i) => q.number !== i + 1 ||
      !q.question || !CHOICES.every(c => typeof q.options?.[c] === 'string'))) throw Error('Transcription data invalid');
    const incomplete = questions.filter(hasMissing).length;
    const special = questions.filter(isSpecial).length;
    $('sourceStats').hidden = false;
    $('sourceStats').textContent = '200 numbered questions imported · ' + incomplete +
      ' flagged incomplete · ' + special + ' official ALL-key exceptions · 1.5 marks each.';
    const previous = saved();
    setLoading(validState(previous) && !previous.submitted ?
      'Saved answers found. Resume your previous session or reset to start afresh.' :
      'Ready. Choose a mode to begin 200-question practice.');
    $('start').disabled = false; $('reset').disabled = !validState(previous);
  }).catch(error => { setLoading('Unable to load quiz: ' + error.message + '. Please use the linked official PDF instead.'); });
})();
