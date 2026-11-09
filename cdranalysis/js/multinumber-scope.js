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
    const cfg = config[kind];
    const items = matchingOptions(kind);
    $(cfg.choices).innerHTML = items.length
      ? items.map(value =>
          '<label class="multi-scope-option">' +
          '<input type="checkbox" class="multi-scope-choice" data-scope-kind="' + kind +
          '" data-scope-value="' + escAttr(value) + '"' +
          (selected[kind].has(value) ? ' checked' : '') +
          '> <span>' + escape(value) + '</span></label>'
        ).join('')
      : '<p class="multi-scope-empty">No matching ' + escape(cfg.label) + ' found.</p>';
  }

  // Removable preview chips make a multi-selection easy to review on a phone.
  // Only the first four are shown to avoid making the page excessively tall.
  function renderTokens(kind) {
    const container = $(kind === 'subject' ? 'multiScopeSubjectTokens' : 'multiScopeEventTokens');
    const values = [...selected[kind]];
    if (!values.length) {
      container.innerHTML = '<span class="multi-scope-token-empty">Including all ' +
        (kind === 'subject' ? 'loaded subjects' : 'event types') + '</span>';
      return;
    }
    container.innerHTML = values.slice(0, 4).map(value =>
      '<button type="button" class="multi-scope-token" data-scope-kind="' + kind +
      '" data-scope-value="' + escAttr(value) + '" title="Remove ' + escAttr(value) +
      '" aria-label="Remove ' + escAttr(value) + '">' +
      '<span class="token-text">' + escape(value) + '</span>' +
      '<span class="token-remove" aria-hidden="true">×</span></button>'
    ).join('') +
    (values.length > 4 ? '<span class="multi-scope-token-more">+' +
      count(values.length - 4) + ' more selected</span>' : '');
  }

  function summaryLabel(kind) {
    const values = selected[kind];
    if (!values.size) return kind === 'subject' ? 'All subjects' : 'All event types';
    if (values.size === 1) {
      const item = [...values][0];
      return item.length > 38 ? item.slice(0, 38) + '…' : item;
    }
    return count(values.size) + ' ' + config[kind].label + ' selected';
  }

  function updateSummary() {
    $('multiScopeSubjectSummary').textContent = summaryLabel('subject');
    $('multiScopeEventSummary').textContent = summaryLabel('event');
    for (const kind of ['subject', 'event']) renderTokens(kind);

    const isPending = pending();
    $('multiScopeApply').disabled = !isPending;
    const status = $('multiScopeStatus');
    status.dataset.pending = String(isPending);
    const lines = [
      applied.subject.size ? count(applied.subject.size) + ' subjects' : 'All subjects',
      applied.event.size ? count(applied.event.size) + ' event types' : 'All event types',
      count(getRows().length) + ' matching records'
    ];
    status.textContent = (isPending ? 'Changes not applied yet. Tap Apply filters. Current results: ' :
      'Showing: ') + lines.join(' • ');
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
    for (const kind of ['subject', 'event']) $(config[kind].details).open = false;
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
    const tokens = $(kind === 'subject' ? 'multiScopeSubjectTokens' : 'multiScopeEventTokens');
    tokens.addEventListener('click', event => {
      const chip = event.target.closest('.multi-scope-token');
      if (!chip || chip.dataset.scopeKind !== kind) return;
      selected[kind].delete(chip.dataset.scopeValue);
      renderChoices(kind);
      updateSummary();
    });
    $(settings.details).addEventListener('toggle', () => {
      if ($(settings.details).open) {
        for (const other of ['subject', 'event']) {
          if (other !== kind) $(config[other].details).open = false;
        }
      }
    });
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
  window.addEventListener('cdr:updated', refreshChoices);
  window.CDRMultiScope = { getRows, refreshChoices };
  refreshChoices();
})();