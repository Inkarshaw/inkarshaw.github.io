(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = window.CDRCore;
  if (!core || !$('eventContactsA')) return;
  const esc = core.escapeHtml;
  const fmt = core.fmtInt;
  let matches = [];

  const eventItems = () => {
    const state = core.state;
    const list = [];
    const incident = core.incidentDateTime();
    if (incident instanceof Date && !isNaN(incident)) {
      list.push({ id: 'incident', label: 'Case incident • ' + core.dtFmt(incident), kind: 'time', at: +incident });
    }
    (state.chronology || []).forEach((e, i) => {
      const at = Number(e.time);
      if (Number.isFinite(at) && at > 0) {
        list.push({ id: 'chron:' + i, label: 'Timeline • ' + (e.text || e.source || 'Event').slice(0, 72) + ' • ' + core.dtFmt(new Date(at)), kind: 'time', at });
      }
    });
    const types = [...new Set((state.records || []).map(r => String(r.callType || '').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    types.forEach(t => list.push({ id: 'type:' + encodeURIComponent(t), label: 'Event type • ' + t, kind: 'type', type: t }));
    return list;
  };

  function refreshOptions() {
    const items = eventItems();
    for (const [id, empty] of [['eventContactsA', 'Select first event'], ['eventContactsB', 'None — compare one event']]) {
      const el = $(id), previous = el.value;
      el.innerHTML = '<option value="">' + empty + '</option>' +
        items.map(item => '<option value="' + core.escAttr(item.id) + '">' + esc(item.label) + '</option>').join('');
      if (items.some(item => item.id === previous)) el.value = previous;
    }
    render();
  }

  const keyFor = r => {
    const raw = String(r.bparty || '').trim();
    if (!raw) return null;
    const numeric = /^\+?[\d\s()\-]+$/.test(raw) && /\d/.test(raw);
    if ($('eventContactsNumericOnly').checked && (!numeric || raw.replace(/\D/g, '').length < 8)) return null;
    const digits = raw.replace(/\D/g, '');
    const normalized = numeric && digits.length >= 10 ? digits.slice(-10) : raw.toLowerCase().replace(/\s+/g, '');
    return { key: String(r.bpartyKey || normalized).trim(), raw };
  };

  function selectRecord(r, item, windowMs) {
    if (!item) return false;
    if (item.kind === 'type') return String(r.callType || '').trim() === item.type;
    const at = r.dt instanceof Date ? +r.dt : +new Date(r.dt);
    return Number.isFinite(at) && Math.abs(at - item.at) <= windowMs;
  }

  function toCsv(rows) {
    const headers = ['Contact', 'Event 1 records', 'Event 2 records', 'Event 1 subjects', 'Event 2 subjects', 'First event', 'Last event'];
    const safe = v => {
      let s = String(v ?? '');
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
      return '"' + s.replace(/"/g, '""') + '"';
    };
    const table = [headers, ...rows.map(x => [x.raw, x.a.count, x.b.count, [...x.a.subjects].join(' | '), [...x.b.subjects].join(' | '), x.first ? core.dtFmt(new Date(x.first)) : '', x.last ? core.dtFmt(new Date(x.last)) : ''])];
    return '\uFEFF' + table.map(row => row.map(safe).join(',')).join('\r\n');
  }

  function render() {
    const status = $('eventContactsStatus'), table = $('eventContactsTable'), summary = $('eventContactsSummary');
    const eventA = $('eventContactsA')?.value || '', eventB = $('eventContactsB')?.value || '';
    matches = [];
    const items = eventItems(), A = items.find(x => x.id === eventA), B = items.find(x => x.id === eventB);
    $('eventContactsExport').disabled = true;
    table.innerHTML = '';
    summary.textContent = '';
    if (!A) { status.textContent = 'Select Event 1 to see shared contacts. Event 2 is optional.'; return; }
    if (B && B.id === A.id) { status.textContent = 'Choose two different events, or leave Event 2 empty.'; return; }

    const minutes = Math.max(1, Math.min(1440, Number($('eventContactsWindow').value) || 60));
    const windowMs = minutes * 60000;
    const map = new Map(), subjects = new Set();
    const data = window.CDRApp?.getRecords?.() || core.state.records || [];
    for (const r of data) {
      const info = keyFor(r);
      if (!info) continue;
      const inA = selectRecord(r, A, windowMs), inB = B ? selectRecord(r, B, windowMs) : false;
      if (!inA && !inB) continue;
      const subject = String(r.cdrNo || '').trim();
      if (subject) subjects.add(subject);
      let x = map.get(info.key);
      if (!x) {
        x = { raw: info.raw, a: { count: 0, subjects: new Set() }, b: { count: 0, subjects: new Set() }, first: null, last: null };
        map.set(info.key, x);
      }
      const at = r.dt instanceof Date ? +r.dt : +new Date(r.dt);
      if (Number.isFinite(at)) { x.first = x.first === null ? at : Math.min(x.first, at); x.last = x.last === null ? at : Math.max(x.last, at); }
      if (inA) { x.a.count++; if (subject) x.a.subjects.add(subject); }
      if (inB) { x.b.count++; if (subject) x.b.subjects.add(subject); }
    }
    const minSubjects = subjects.size < 2 ? 1 : 2;
    matches = [...map.values()].filter(x => B ? x.a.count > 0 && x.b.count > 0 : x.a.count > 0 && x.a.subjects.size >= minSubjects)
      .sort((x, y) => (y.a.count + y.b.count) - (x.a.count + x.b.count) || x.raw.localeCompare(y.raw, undefined, { numeric: true }));
    status.textContent = B
      ? 'Only contacts observed in both selected events are listed.'
      : subjects.size < 2 ? 'Only one CDR subject has matching records; showing its event contacts (not cross-subject common contacts).' : 'Contacts appearing across at least two CDR subjects within Event 1.';
    summary.innerHTML = '<span class="metric-chip">Matching contacts: ' + fmt(matches.length) + '</span> ' +
      '<span class="metric-chip">CDR subjects in selected event(s): ' + fmt(subjects.size) + '</span> ' +
      ((A.kind === 'time' || B?.kind === 'time') ? '<span class="metric-chip">Timeline window: ±' + fmt(minutes) + ' min</span>' : '');
    if (!matches.length) {
      table.innerHTML = '<tbody><tr><td class="empty">No matching contacts for the selected event(s). Check imported data and the time window.</td></tr></tbody>';
      return;
    }
    const rows = matches.slice(0, 500);
    table.innerHTML = '<thead><tr><th>Contact</th><th>Event 1 records</th>' +
      (B ? '<th>Event 2 records</th>' : '') +
      '<th>Event 1 CDR subjects</th>' + (B ? '<th>Event 2 CDR subjects</th>' : '') +
      '<th>First matching activity</th><th>Last matching activity</th></tr></thead><tbody>' +
      rows.map(x => '<tr><td><button type="button" class="btn secondary small event-common-open" data-contact="' + core.escAttr(x.raw) + '" title="Show this contact in Records">' + esc(x.raw) + '</button></td><td>' +
        fmt(x.a.count) + '</td>' + (B ? '<td>' + fmt(x.b.count) + '</td>' : '') +
        '<td>' + esc([...x.a.subjects].join(', ') || '—') + '</td>' +
        (B ? '<td>' + esc([...x.b.subjects].join(', ') || '—') + '</td>' : '') +
        '<td>' + esc(x.first !== null ? core.dtFmt(new Date(x.first)) : '—') + '</td><td>' +
        esc(x.last !== null ? core.dtFmt(new Date(x.last)) : '—') + '</td></tr>').join('') + '</tbody>';
    $('eventContactsExport').disabled = false;
    if (matches.length > 500) status.textContent += ' Showing the first 500 rows; CSV includes all matches.';
  }

  ['eventContactsA', 'eventContactsB', 'eventContactsWindow', 'eventContactsNumericOnly'].forEach(id => $(id)?.addEventListener('change', render));
  $('eventContactsRefresh')?.addEventListener('click', refreshOptions);
  $('eventContactsTable')?.addEventListener('click', e => {
    const btn = e.target.closest('.event-common-open');
    if (!btn) return;
    window.CDRApp?.openPairRecords?.('', btn.dataset.contact || '');
  });
  $('eventContactsExport')?.addEventListener('click', () => {
    if (!matches.length) return;
    const blob = new Blob([toCsv(matches)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'cdr-event-common-contacts.csv'; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('cdr:updated', refreshOptions);
  document.addEventListener('click', e => { if (e.target.closest('[data-tab="contacts"]')) refreshOptions(); });
  refreshOptions();
})();