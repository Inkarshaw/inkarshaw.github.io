/* ClearExams textbook question quality guard.
   Removes mechanical paraphrases of the same fact, rejects malformed options,
   repairs boilerplate stems and balances answer positions while preserving
   English/Tamil option alignment. Original question-bank files remain unchanged.
   A browser-side check is not a substitute for textbook fact-checking. */
(function (root) {
  'use strict';
  const wrappers = [
    /^What is the correct textbook answer for:\s*/i,
    /^Which option is correctly associated with:\s*/i,
    /^Identify the correct (?:historical source, work, author, place or term|ruler, dynasty, date, place or cultural fact|ruler, institution, administrative term, place or trade fact|textbook association for this fact|[^:]{1,160}) for:\s*/i,
    /^According to the textbook, which option correctly answers the following:\s*/i,
    /^இதற்கான சரியான பாடநூல் விடை எது[:：]\s*/i
  ];
  function unwrapped(q) {
    let value = String(q || '').trim();
    for (const prefix of wrappers) value = value.replace(prefix, '');
    return value.trim();
  }
  function signature(q) {
    return unwrapped(q).toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '');
  }
  function isBoilerplate(q) { return unwrapped(q) !== String(q || '').trim(); }
  // In scientific notation, changing a letter's case may change the answer:
  // kg and Kg, N and n, or chemical element symbols are distinct distractors.
  // Ordinary prose options must still be unique case-insensitively.
  const notationStem = /\b(?:symbols?|notation|capitali[sz](?:ed|ation)|uppercase|lowercase|letter[-\s]+case|SI[-\s]+style|SI[-\s]+unit)\b/i;
  function distinctOptions(opts, stem) {
    const normalized = opts.map(x => x.normalize('NFC').trim().replace(/\s+/g, ' '));
    if (new Set(normalized.map(x => x.toLowerCase())).size === 4) return true;
    return notationStem.test(stem) && new Set(normalized).size === 4;
  }
  function valid(q) {
    if (!q || typeof q.q_en !== 'string' || !q.q_en.trim()) return false;
    const opts = q.opts_en;
    if (!Array.isArray(opts) || opts.length !== 4) return false;
    if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3) return false;
    return opts.every(x => typeof x === 'string' && x.trim()) &&
      distinctOptions(opts, q.q_en);
  }
  function mechanicallyExpanded(questions) {
    if (!Array.isArray(questions) || questions.length < 30) return false;
    const templated = questions.filter(q => isBoilerplate(q.q_en) ||
      q.type === 'association' || q.type === 'recognition').length;
    return templated / questions.length >= 0.18 &&
      questions.some(q => q.type === 'direct');
  }
  function rewriteEnglish(raw) {
    const stem = unwrapped(raw).replace(/[?\s]+$/, '').trim();
    if (!stem) return raw;
    let m;
    if ((m = /^(Early|Later) Medieval period in Indian history is classified as$/i.exec(stem)))
      return 'Which years correspond to the ' + m[1] + ' Medieval period in Indian history?';
    if (/^Sources are$/i.test(stem)) return 'What are historical sources?';
    if ((m = /^(.*?) was written by$/i.exec(stem))) return 'Who wrote ' + m[1] + '?';
    if ((m = /^(.*?) was founded in$/i.exec(stem))) return 'In which year was ' + m[1] + ' founded?';
    if ((m = /^(.*?) is in$/i.exec(stem))) return 'Where is ' + m[1] + ' located?';
    if ((m = /^(.*?) was called$/i.exec(stem))) return 'What was ' + m[1] + ' called?';
    if ((m = /^(.*?) is classified into how many types$/i.exec(stem)))
      return 'How many types of ' + m[1].toLowerCase() + ' identified?';
    if ((m = /^(.*?) are classified into how many types$/i.exec(stem)))
      return 'Into how many types are ' + m[1].toLowerCase() + ' classified?';
    if ((m = /^SI (fundamental )?unit of (.+)$/i.exec(stem)))
      return 'What is the SI ' + (m[1]||'') + 'unit of ' + m[2] + '?';
    if ((m = /^Formula for (.+)$/i.exec(stem)))
      return 'Which formula is used for ' + m[1] + '?';
    if ((m = /^(Two|Three|Four) (.+) of (.+)$/i.exec(stem)))
      return 'Which are the ' + m[1].toLowerCase() + ' ' + m[2] + ' of ' + m[3] + '?';
    if ((m = /^(One|Another) (.+)$/i.exec(stem)))
      return 'Which of the following is ' + m[1].toLowerCase() + ' ' + m[2] + '?';
    if (/^(Who|What|Which|Where|When|How|Why)\b/i.test(stem)) return stem + '?';
    if (/\b(is|are|was|were|on|in|at|from|by|as|to|for|of|called|means)$/i.test(stem))
      return 'Complete the statement: ' + stem + ' _____.';
    if (/^(Number|Year|Date|Period|Capital|Core area|Place|Founder|Author|Ruler|Courtier|Visitor|Portuguese traveller|Italian visitor|Dynasty|Name|Meaning|Definition|Collective name|Prominent rallying point)\b/i.test(stem))
      return 'Identify the ' + stem.charAt(0).toLowerCase() + stem.slice(1) + '.';
    return 'Which of the following identifies the ' + stem.charAt(0).toLowerCase() + stem.slice(1) + '?';
  }
  function polishQuestion(q) {
    // Convert a fragmentary fact ("X is called?") into a valid completion prompt.
    const match = /^Which of the following identifies the (.+)\?$/i.exec(q);
    if (!match) return q;
    const fragment = match[1].trim();
    if (!/\b(?:is|are|was|were|as|on|in|at|from|by|for|to|about|called|means|a|an)$/i.test(fragment))
      return q;
    return 'Complete the statement: ' +
      fragment.charAt(0).toUpperCase() + fragment.slice(1) + ' _____.';
  }
  function rewriteTamil(raw) {
    return unwrapped(String(raw || '')).replace(/[?\s]+$/, '').trim() + '?';
  }
  const positions = [1,3,0,2,3,0,2,1,0,2,1,3,2,1,3,0,1,0,3,2];
  function balance(q, i) {
    if (!Array.isArray(q.opts_ta) || q.opts_ta.length !== 4) return q;
    const target = (positions[i % 20] + Math.floor(i / 20)) % 4;
    const current = q.correct;
    if (target === current) return q;
    const en = q.opts_en.slice(), ta = q.opts_ta.slice();
    [en[current], en[target]] = [en[target], en[current]];
    [ta[current], ta[target]] = [ta[target], ta[current]];
    return { ...q, opts_en: en, opts_ta: ta, correct: target };
  }
  function curate(input) {
    const arr = Array.isArray(input) ? input : [];
    const expanded = mechanicallyExpanded(arr);
    const candidates = expanded
      ? arr.filter(q => q.type === 'direct')
      : arr;
    // A repeated stem paired with different answers is ambiguous:
    // for example, "One primary source?" with coins AND inscriptions.
    // Exclude the entire conflicting group rather than accepting multiple answers.
    const groups = new Map();
    for (const q of candidates) {
      if (!valid(q)) continue;
      const stem = signature(q.q_en);
      if (!groups.has(stem)) groups.set(stem, new Set());
      groups.get(stem).add(String(q.opts_en[q.correct]).toLowerCase().trim());
    }
    const conflicting = new Set([...groups.entries()]
      .filter(([, answers]) => answers.size > 1).map(([stem]) => stem));
    const seen = new Set(), kept = [];
    for (const q of candidates) {
      if (!valid(q)) continue;
      const key = signature(q.q_en);
      if (conflicting.has(key) || seen.has(key)) continue;
      seen.add(key);
      const next = { ...q };
      if (isBoilerplate(q.q_en)) {
        next.q_en = rewriteEnglish(q.q_en);
        next.q_ta = rewriteTamil(q.q_ta);
      }
      next.q_en = polishQuestion(next.q_en);
      kept.push(next);
    }
    return {
      expanded,
      questions: kept.map((q, i) => balance(q, i)),
      removed: arr.length - kept.length
    };
  }
  // Fully reviewed direct-question banks retain legacy q.quiz source-group labels
  // (6-7 records each), whereas the published catalogue groups 20 by position.
  // Never use the old labels to route these stable editorial quiz sets.
  function selectReviewedQuiz(meta, sourceQuestions, curatedQuestions, quizNumber) {
    if (!meta || !Array.isArray(sourceQuestions) || !Array.isArray(curatedQuestions)) return null;
    const sets = Array.isArray(meta.quiz_sets) ? meta.quiz_sets : [];
    const expectedSets = Math.ceil(sourceQuestions.length / 20);
    const positionalBank = sourceQuestions.length > 0 &&
      sets.length === expectedSets &&
      curatedQuestions.length === sourceQuestions.length &&
      sourceQuestions.every(q => q.type === 'direct');
    const fullyReviewed = positionalBank &&
      Number(meta.qa_reviewed_prefix) === sourceQuestions.length &&
      Number(meta.qa_reviewed_quizzes) === expectedSets;
    // A partially reviewed direct-only bank may explicitly use the same
    // stable 20-question catalogue slots without misusing old q.quiz labels.
    if (!positionalBank || (!fullyReviewed && meta.positional_quiz_sets !== true)) return null;
    if (!Number.isInteger(quizNumber) || quizNumber < 1 || quizNumber > expectedSets) return [];
    return curatedQuestions.slice((quizNumber - 1) * 20, quizNumber * 20);
  }
  root.TextbookQuality = { curate, valid, isBoilerplate, mechanicallyExpanded, unwrapped, selectReviewedQuiz };
})(window);
