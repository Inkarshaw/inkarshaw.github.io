(function () {
  'use strict';
  if (!window.ceTrack && !document.querySelector('script[src$="assets/analytics.js"]')) {
    const analytics=document.createElement('script');analytics.src='assets/analytics.js';analytics.defer=true;document.head.appendChild(analytics);
  }
  const cache = new Map();
  function json(path) {
    if (!cache.has(path)) cache.set(path, fetch(path).then(r => {
      if (!r.ok) throw new Error('Unable to load ' + path);
      return r.json();
    }).catch(error => { cache.delete(path); throw error; }));
    return cache.get(path);
  }
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const prepURL = exam => 'exam-preparation.html?exam=' + encodeURIComponent(exam.id);
  const syllabusURL = exam => exam.syllabus ? 'syllabus.html#' + exam.syllabus : exam.official;
  const link = (label, url, cls = 'button secondary') => `<a class="${escape(cls)}" href="${escape(url)}"${/^https:\/\//.test(url) ? ' target="_blank" rel="noopener noreferrer"' : ''}>${escape(label)}</a>`;
  function formatDate(value, time = false) {
    if (!value) return 'Not listed';
    return new Intl.DateTimeFormat('en-IN', {timeZone:'Asia/Kolkata',day:'numeric',month:'short',year:'numeric',...(time ? {hour:'2-digit',minute:'2-digit',hour12:false} : {})}).format(new Date(value.length === 10 ? value + 'T00:00:00+05:30' : value)) + (time ? ' IST' : '');
  }
  function notificationStatus(item, now = new Date()) {
    if (item.kind === 'archive') return {label:'Archived · applications closed', className:'closed'};
    if (item.kind === 'planned') return {label: now > new Date(item.notificationDate + 'T23:59:59+05:30') ? 'Planner date passed · check official notice' : 'Tentative annual plan', className:'planned'};
    if (!item.applicationStart || !item.applicationEnd) return {label:'Check official notice',className:'planned'};
    if (now > new Date(item.applicationEnd)) return {label:'Applications closed',className:'closed'};
    if (now < new Date(item.applicationStart + 'T00:00:00+05:30')) return {label:'Applications upcoming',className:'planned'};
    return {label:'Applications open · check amendments',className:'open'};
  }
  function notificationHTML(item) {
    const state = notificationStatus(item);
    return `<article class="notification-card"><span class="status-tag ${state.className}">${escape(state.label)}</span><h3>${escape(item.title)}</h3><dl class="dates"><div><dt>${item.kind === 'planned' ? 'Planned notification' : 'Notification'}</dt><dd>${formatDate(item.notificationDate)}</dd></div><div><dt>${item.kind === 'planned' ? 'Tentative examination' : 'Examination'}</dt><dd>${formatDate(item.examDate)}</dd></div><div><dt>Applications start</dt><dd>${formatDate(item.applicationStart)}</dd></div><div><dt>Application deadline</dt><dd>${formatDate(item.applicationEnd, true)}</dd></div></dl><p class="muted">${escape(item.note)}</p><div class="actions">${link(item.sourceLabel, item.source)}${link('Official updates ↗', item.official)}</div></article>`;
  }
  window.ClearExams = {json,escape,prepURL,syllabusURL,link,formatDate,notificationStatus,notificationHTML};
})();
