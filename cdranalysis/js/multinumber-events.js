(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = window.CDRCore;
  if (!core || !$('multiEventChoices')) return;

  const esc = core.escapeHtml;
  const attr = core.escAttr;
  const fmt = core.fmtInt;
  let selected = new Set();
  let matches = [];
  let choices = [];

  function availableEvents() {
    const events = [];
    const incident = core.incidentDateTime();
    if (incident instanceof Date && !isNaN(incident)) {
      events.push({ id: 'incident', label: 'Case incident • ' + core.dtFmt(incident), kind: 'time', at: +incident });
    }
    (core.state.chronology || []).forEach((event, index) => {
      const at = Number(event.time);
      if (Number.isFinite(at) && at > 0) {
        events.push({
          id: 'chron:' + index,
          label: 'Timeline • ' + String(event.text || event.source || 'Event').slice(0, 90) + ' • ' + core.dtFmt(new Date(at)),
          kind: 'time',
          at
        });
      }
    });
    const types = [...new Set((core.state.records || []).map(r => String(r.callType || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));
    types.forEach(type => events.push({
      id: 'type:' + encodeURIComponent(type),
      label: 'Event type • ' + type,
      kind: 'type',
      type
    }));
    return events;
  }

  function visibleEvents() {
    const query = $('multiEventSearch').value.trim().toLocaleLowerCase();
    return choices.filter(item => !query || item.label.toLocaleLowerCase().includes(query));
  }

  function drawChoices() {
    const visible = visibleEvents();
    const container = $('multiEventChoices');
    const drawGroup = (label, items) => items.length
      ? '<div class="tiny" style="font-weight:800;margin:8px 0 6px;color:var(--ink)">'
        + esc(label) + '</div>' +
        items.map(item => '<label class="check" style="padding:7px 5px;cursor:pointer;line-height:1.4">' +
          '<input type="checkbox" class="multi-event-choice" data-event-id="' + attr(item.id) + '"' +
          (selected.has(item.id) ? ' checked' : '') + '> ' + esc(item.label) + '</label>').join('')
      : '';
    const types = visible.filter(item => item.kind === 'type');
    const timeline = visible.filter(item => item.kind === 'time');
    container.innerHTML = visible.length
      ? drawGroup('CDR event types', types) + drawGroup('Case incident and timeline events', timeline)
      : '<span class="tiny">No events match. Import CDR data, add a timeline event, or change your search.</span>';

    const typeCount = choices.filter(item => item.kind === 'type' && selected.has(item.id)).length;
    const timelineCount = choices.filter(item => item.kind === 'time' && selected.has(item.id)).length;
    $('multiEventSelectionCount').textContent = fmt(selected.size) + ' selected';
    $('multiEventDropdownSummary').textContent = selected.size
      ? 'Event types: ' + fmt(typeCount) + ' • Timeline: ' + fmt(timelineCount) + '  ▾'
      : 'Select two or more events  ▾';
  }

  function refresh() {
    choices = availableEvents();
    const allowed = new Set(choices.map(item => item.id));
    selected = new Set([...selected].filter(id => allowed.has(id)));
    drawChoices();
    render();
  }

  function getContact(r, numericOnly) {
    const raw = String(r.bparty || '').trim();
    if (!raw) return null;
    const digits = raw.replace(/\D/g, '');
    const numeric = /^\+?[\d\s()\-]+$/.test(raw) && digits.length > 0;
    if (numericOnly && (!numeric || digits.length < 8)) return null;
    const normalized = numeric && digits.length >= 10 ? digits.slice(-10) : raw.toLocaleLowerCase().replace(/\s+/g, '');
    const key = String(r.bpartyKey || normalized).trim().toLocaleLowerCase();
    return key ? { key, raw } : null;
  }

  function recordMatches(r, event, windowMs, timestamp) {
    if (event.kind === 'type') return String(r.callType || '').trim() === event.type;
    return Number.isFinite(timestamp) && Math.abs(timestamp - event.at) <= windowMs;
  }

  // Ensure overlapping timeline windows cannot be satisfied by reusing one CDR row
  // as the sole evidence for multiple selected events.
  function hasDistinctEvidence(buckets) {
    const assigned = new Map();
    const visit = (eventIndex, seen) => {
      for (const recordId of buckets[eventIndex].ids) {
        if (seen.has(recordId)) continue;
        seen.add(recordId);
        const previousEvent = assigned.get(recordId);
        if (previousEvent === undefined || visit(previousEvent, seen)) {
          assigned.set(recordId, eventIndex);
          return true;
        }
      }
      return false;
    };
    for (let index = 0; index < buckets.length; index++) {
      if (!visit(index, new Set())) return false;
    }
    return true;
  }

  function safeCsv(value) {
    let text = String(value ?? '');
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function csvContent(items) {
    const headers = ['Contact', 'CDR subjects', 'Unique records', 'First activity', 'Last activity'];
    for (const item of items) headers.push(item.label + ' records', item.label + ' subjects');
    const rows = matches.map(row => {
      const cells = [
        row.raw, [...row.subjects].join(' | '), row.ids.size,
        row.first === null ? '' : core.dtFmt(new Date(row.first)),
        row.last === null ? '' : core.dtFmt(new Date(row.last))
      ];
      row.events.forEach(event => cells.push(event.count, [...event.subjects].join(' | ')));
      return cells;
    });
    return '\uFEFF' + [headers, ...rows].map(row => row.map(safeCsv).join(',')).join('\r\n');
  }

  function render() {
    const status = $('multiEventStatus');
    const table = $('multiEventTable');
    const summary = $('multiEventSummary');
    const exportBtn = $('multiEventExport');
    const items = choices.filter(item => selected.has(item.id));
    const data = window.CDRApp?.getRecords?.() || core.state.records || [];
    const loadedSubjects = new Set(data.map(r => String(r.cdrNo || '').trim()).filter(Boolean));
    matches = [];
    table.innerHTML = '';
    summary.textContent = '';
    exportBtn.disabled = true;
    $('multiEventSelectionCount').textContent = fmt(items.length) + ' selected';

    if (items.length < 2) {
      status.textContent = 'Select at least two different events to compare common contacts across CDR subjects.';
      return;
    }
    if (loadedSubjects.size < 2) {
      status.textContent = 'Load at least two different CDR / A-party numbers to use Multi-number event comparison.';
      return;
    }

    const minutes = Math.max(1, Math.min(1440, Number($('multiEventWindow').value) || 60));
    const windowMs = minutes * 60000;
    const numericOnly = $('multiEventNumericOnly').checked;
    const byContact = new Map();

    data.forEach((record, recordIndex) => {
      const contact = getContact(record, numericOnly);
      if (!contact) return;
      const timestamp = record.dt instanceof Date ? +record.dt : +new Date(record.dt);
      const hits = [];
      items.forEach((item, index) => {
        if (recordMatches(record, item, windowMs, timestamp)) hits.push(index);
      });
      if (!hits.length) return;

      const subject = String(record.cdrNo || '').trim();
      let entry = byContact.get(contact.key);
      if (!entry) {
        entry = {
          raw: contact.raw,
          subjects: new Set(),
          ids: new Set(),
          first: null,
          last: null,
          events: items.map(() => ({ count: 0, subjects: new Set(), ids: new Set() }))
        };
        byContact.set(contact.key, entry);
      }
      entry.ids.add(recordIndex);
      if (subject) entry.subjects.add(subject);
      if (Number.isFinite(timestamp)) {
        entry.first = entry.first === null ? timestamp : Math.min(entry.first, timestamp);
        entry.last = entry.last === null ? timestamp : Math.max(entry.last, timestamp);
      }
      hits.forEach(index => {
        const bucket = entry.events[index];
        bucket.count++;
        bucket.ids.add(recordIndex);
        if (subject) bucket.subjects.add(subject);
      });
    });

    matches = [...byContact.values()]
      .filter(entry => entry.subjects.size >= 2 &&
        entry.ids.size >= items.length &&
        entry.events.every(event => event.count > 0) &&
        hasDistinctEvidence(entry.events))
      .sort((a, b) => b.ids.size - a.ids.size || a.raw.localeCompare(b.raw, undefined, { numeric: true }));

    const subjects = new Set();
    matches.forEach(entry => entry.subjects.forEach(subject => subjects.add(subject)));
    status.textContent = 'Showing contacts observed in every selected event, across at least two CDR subjects, with distinct supporting records for each event.';
    summary.innerHTML =
      '<span class="metric-chip">Selected events: ' + fmt(items.length) + '</span> ' +
      '<span class="metric-chip">Common contacts: ' + fmt(matches.length) + '</span> ' +
      '<span class="metric-chip">Matching CDR subjects: ' + fmt(subjects.size) + '</span> ' +
      (items.some(item => item.kind === 'time') ? '<span class="metric-chip">Timeline window: ±' + fmt(minutes) + ' min</span>' : '');

    if (!matches.length) {
      table.innerHTML = '<tbody><tr><td class="empty">No contacts meet all selected events and cross-subject requirements. Adjust events, timeline window, or imported data.</td></tr></tbody>';
      return;
    }

    const display = matches.slice(0, 300);
    const header = '<thead><tr><th>Contact</th><th>CDR subjects</th><th>Unique records</th>' +
      items.map((item, index) => '<th title="' + attr(item.label) + '">Event ' + (index + 1) + ' records / subjects</th>').join('') +
      '<th>First activity</th><th>Last activity</th></tr></thead>';
    const body = display.map(entry =>
      '<tr><td><button type="button" class="btn secondary small multi-event-open" data-contact="' + attr(entry.raw) + '">' + esc(entry.raw) + '</button></td>' +
      '<td>' + esc([...entry.subjects].join(', ')) + '</td>' +
      '<td>' + fmt(entry.ids.size) + '</td>' +
      entry.events.map(event => '<td>' + fmt(event.count) + ' / ' + fmt(event.subjects.size) + '</td>').join('') +
      '<td>' + esc(entry.first === null ? '—' : core.dtFmt(new Date(entry.first))) + '</td>' +
      '<td>' + esc(entry.last === null ? '—' : core.dtFmt(new Date(entry.last))) + '</td></tr>'
    ).join('');
    table.innerHTML = header + '<tbody>' + body + '</tbody>';
    exportBtn.disabled = false;
    if (matches.length > display.length) {
      status.textContent += ' Showing the first 300 rows; CSV exports every match.';
    }
  }

  $('multiEventChoices').addEventListener('change', event => {
    const input = event.target.closest('.multi-event-choice');
    if (!input) return;
    if (input.checked) selected.add(input.dataset.eventId);
    else selected.delete(input.dataset.eventId);
    drawChoices();
    render();
  });
  $('multiEventSearch').addEventListener('input', drawChoices);
  $('multiEventDropdown').addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      $('multiEventDropdown').open = false;
      $('multiEventDropdownSummary').focus();
    }
  });
  document.addEventListener('click', event => {
    const dropdown = $('multiEventDropdown');
    if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
  });
  $('multiEventSelectVisible').addEventListener('click', () => {
    visibleEvents().forEach(item => selected.add(item.id));
    drawChoices();
    render();
  });
  $('multiEventClear').addEventListener('click', () => { selected.clear(); drawChoices(); render(); });
  $('multiEventRefresh').addEventListener('click', refresh);
  ['multiEventWindow', 'multiEventNumericOnly'].forEach(id => $(id).addEventListener('change', render));
  $('multiEventTable').addEventListener('click', event => {
    const target = event.target.closest('.multi-event-open');
    if (target) window.CDRApp?.openPairRecords?.('', target.dataset.contact || '');
  });
  $('multiEventExport').addEventListener('click', () => {
    if (!matches.length) return;
    const items = choices.filter(item => selected.has(item.id));
    const blob = new Blob([csvContent(items)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'cdr-multinumber-common-contacts-by-events.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  window.addEventListener('cdr:updated', refresh);
  document.addEventListener('click', event => {
    if (event.target.closest('[data-tab="multinumber"]')) refresh();
  });
  refresh();
})();