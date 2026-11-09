(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const core = window.CDRCore;
  if (!core || !$('multiNumberScopePanel')) return;

  const selected = { subject: new Set(), event: new Set() };
  const applied = { subject: new Set(), event: new Set() };
  const options = { subject: [], event: [] };
  const config = {
    subject: { choices: 'multiScopeSubjectChoices', search: 'multiScopeSubjectSearch',
      summary: 'multiScopeSubjectSummary', details: 'multiScopeSubjects',
      all: 'multiScopeSubjectAll', clear: 'multiScopeSubjectClear',
      label: 'subjects' },
    event: { choices: 'multiScopeEventChoices', search: 'multiScopeEventSearch',
      summary: 'multiScopeEventSummary', details: 'multiScopeEvents',
      all: 'multiScopeEventAll', clear: 'multiScopeEventClear',
      label: 'event types' }
  };

  const escape = core.escapeHtml;
  const escAttr = core.escAttr;
  const count = core.fmtInt;
  const distinct = key => [...new Set((core.state.records || [])
    .map(r => String(r[key] || '').trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  function sameSet(a, b) {
    return a.size === b.size && [...a].every(value => b.has(value));
  }
  function pending() {
    return !sameSet(selected.subject, applied.subject) || !sameSet(selected.event, applied.event);
  }
  function matchingOptions(kind) {
    const query = $(config[kind].search).value.trim().toLocaleLowerCase();
    return options[kind].filter(value => value.toLocaleLowerCase().includes(query));
  }

  function renderChoices(kind) {
    const configForKind = config[kind];
    const list = matchingOptions(kind);
    $(configForKind.choices).innerHTML = list.length
      ? list.map(value => '<label class="check" style="padding:8px 6px;cursor:pointer;line-height:1.4">' +
        '<input type="checkbox" class="multi-scope-choice" data-scope-kind="' + kind +
        '" data-scope-value="' + escAttr(value) + '"' +
        (selected[kind].has(value) ? ' checked' : '') +
        '> ' + escape(value) + '</label>').join('')
      : '<div class="tiny">No matching ' + escape(configForKind.label) + ' found.</div>';
  }

  function summaryLabel(kind) {
    const values = selected[kind];
    if (!values.size) return kind === 'subject' ? 'All subjects ▾' : 'All event types ▾';
    if (values.size === 1) {
      const item = [...values][0];
      return (item.length > 26 ? item.slice(0, 26) + '…' : item) + ' ▾';
    }
    return count(values.size) + ' ' + config[kind].label + ' selected ▾';
  }

  function updateSummary() {
    $('multiScopeSubjectSummary').textContent = summaryLabel('subject');
    $('multiScopeEventSummary').textContent = summaryLabel('event');
    const lines = [
      applied.subject.size ? count(applied.subject.size) + ' subjects' : 'All subjects',
      applied.event.size ? count(applied.event.size) + ' event types' : 'All event types',
      count(getRows().length) + ' matching records'
    ];
    $('multiScopeStatus').textContent = (pending() ? 'Selection changes pending — tap Apply selection. Current results: ' : '') + lines.join(' • ');
  }

  function getRows() {
    // Other tabs retain the normal single-value Subject and Event Type sidebar filters.
    // Here only these two sidebar criteria are bypassed; remaining filters and the
    // selected Raw / Unique analysis mode are preserved.
    const data = window.CDRApp?.getMultiNumberBaseRecords?.() || core.state.filtered || [];
    const subjects = applied.subject;
    const eventTypes = applied.event;
    return data.filter(row =>
      (!subjects.size || subjects.has(String(row.cdrNo || '').trim())) &&
      (!eventTypes.size || eventTypes.has(String(row.callType || '').trim()))
    );
  }

  function refreshChoices() {
    options.subject = distinct('cdrNo');
    options.event = distinct('callType');
    let changed = false;
    for (const kind of ['subject', 'event']) {
      const valid = new Set(options[kind]);
      for (const value of [...selected[kind]]) if (!valid.has(value)) selected[kind].delete(value);
      for (const value of [...applied[kind]]) {
        if (!valid.has(value)) { applied[kind].delete(value); changed = true; }
      }
      renderChoices(kind);
    }
    updateSummary();
    // If an imported CDR was removed, refresh results without the now-missing scope.
    if (changed) window.CDRApp?.applyFilters?.();
  }

  function apply() {
    applied.subject = new Set(selected.subject);
    applied.event = new Set(selected.event);
    updateSummary();
    window.CDRApp?.applyFilters?.();
  }

  for (const kind of ['subject', 'event']) {
    const settings = config[kind];
    $(settings.choices).addEventListener('change', event => {
      const checkbox = event.target.closest('.multi-scope-choice');
      if (!checkbox || checkbox.dataset.scopeKind !== kind) return;
      const value = checkbox.dataset.scopeValue;
      if (!options[kind].includes(value)) return;
      if (checkbox.checked) selected[kind].add(value);
      else selected[kind].delete(value);
      updateSummary();
    });
    $(settings.search).addEventListener('input', () => renderChoices(kind));
    $(settings.all).addEventListener('click', () => {
      matchingOptions(kind).forEach(value => selected[kind].add(value));
      renderChoices(kind);
      updateSummary();
    });
    $(settings.clear).addEventListener('click', () => {
      selected[kind].clear();
      renderChoices(kind);
      updateSummary();
    });
    $(settings.details).addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        $(settings.details).open = false;
        $(settings.summary).focus();
      }
    });
  }

  $('multiScopeApply').addEventListener('click', apply);
  $('multiScopeReset').addEventListener('click', () => {
    selected.subject.clear();
    selected.event.clear();
    for (const kind of ['subject', 'event']) renderChoices(kind);
    apply();
  });
  document.addEventListener('click', event => {
    for (const kind of ['subject', 'event']) {
      const dropdown = $(config[kind].details);
      if (dropdown.open && !dropdown.contains(event.target)) dropdown.open = false;
    }
  });
  window.addEventListener('cdr:updated', refreshChoices);
  window.CDRMultiScope = { getRows, refreshChoices };
  refreshChoices();
})();