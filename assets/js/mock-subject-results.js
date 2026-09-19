(function () {
  'use strict';
  function summarize(questions, answers) {
    const subjects = new Map();
    questions.forEach((question, index) => {
      const name = typeof question.subject === 'string' && question.subject.trim() ? question.subject.trim() : 'General';
      if (!subjects.has(name)) subjects.set(name, {name, total: 0, correct: 0, wrong: 0, unanswered: 0});
      const row = subjects.get(name);
      row.total++;
      if (answers[index] == null) row.unanswered++;
      else if (answers[index] === question.answer) row.correct++;
      else row.wrong++;
    });
    return [...subjects.values()].sort((a, b) =>
      a.correct / a.total - b.correct / b.total ||
      (b.wrong + b.unanswered) - (a.wrong + a.unanswered) ||
      a.name.localeCompare(b.name)
    );
  }
  function render(host, questions, answers, retry) {
    const rows = summarize(questions, answers);
    const element = (tag, text, className) => {
      const node = document.createElement(tag);
      if (text !== undefined) node.textContent = text;
      if (className) node.className = className;
      return node;
    };
    host.replaceChildren();
    host.appendChild(element('h3', retry ? 'Subject results · practice retry' : 'Subject-wise performance'));
    host.appendChild(element('p', 'Based on this attempt only. Subject score = correct answers / total questions. Lowest scores appear first.', 'explanation'));
    const priorities = rows.filter(row => row.correct < row.total).slice(0, 3);
    host.appendChild(element('p', priorities.length
      ? 'Revise first: ' + priorities.map(row => row.name).join(', ') + '. Review the wrong and unanswered questions below.'
      : rows.length ? 'All questions in this attempt are correct. Revisit these subjects later to check recall.' : 'No questions to analyse.'));
    const grid = element('div', undefined, 'subject-grid');
    rows.forEach(row => {
      const card = element('article', undefined, 'subject-card');
      card.appendChild(element('h4', row.name));
      card.appendChild(element('p', row.correct + ' / ' + row.total + ' correct · ' + Math.round(row.correct / row.total * 100) + '%', 'subject-score'));
      const details = element('dl', undefined, 'subject-counts');
      [['Correct', row.correct], ['Wrong', row.wrong], ['Unanswered', row.unanswered]].forEach(([label, count]) => {
        const group = element('div');
        group.appendChild(element('dt', label));
        group.appendChild(element('dd', String(count)));
        details.appendChild(group);
      });
      card.appendChild(details);
      grid.appendChild(card);
    });
    host.appendChild(grid);
  }
  window.MockSubjectResults = {summarize, render};
})();
