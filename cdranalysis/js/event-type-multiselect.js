(() => {
  'use strict';
  const core = window.CDRCore;
  if (!core) return;
  const $ = id => document.getElementById(id);
  const esc = core.escapeHtml;
  const attr = core.escAttr;
  const count = core.fmtInt;

  // One shared selection for all ordinary tabs, and optional narrower selections
  // for Link Analysis and Number Relationship Analysis.
  const scopeNames = ['global', 'link', 'relationship'];
  const draft = { global: new Set(core.state.globalEventTypes || []), link: new Set(), relationship: new Set() };
  const applied = { link: new Set(), relationship: new Set() };
  let options = [];

  const appliedFor = scope => scope === 'global'
    ? (core.state.globalEventTypes || new Set())
    : applied[scope] || new Set();
  const validScope = scope => scopeNames.includes(scope);
  const mounts = scope => [...document.querySelectorAll('.cdr-event-mount')].filter(el => el.dataset.eventScope === scope);

  function availableTypes() {
    return [...new Set((core.state.records || [])
      .map(r => String(r.callType || '').trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
  const pending = scope => {
    const a = draft[scope], b = appliedFor(scope);
    return a.size !== b.size || [...a].some(value => !b.has(value));
  };
  function widgetHtml() {
    return '<details class="cdr-event-picker">' +
      '<summary class="cdr-event-summary">All event types</summary>' +
      '<div class="cdr-event-menu">' +
      '<label class="cdr-event-label">Search event types<input type="search" class="cdr-event-search" placeholder="Call, SMS, data…" autocomplete="off"></label>' +
      '<div class="cdr-event-quick">' +
      '<button type="button" class="btn secondary small" data-event-action="select-visible">Select visible</button>' +
      '<button type="button" class="btn secondary small" data-event-action="clear">Clear</button></div>' +
      '<div class="cdr-event-list" role="group" aria-label="Event type options"></div>' +
      '<p class="cdr-event-hint">No selection includes all event types.</p></div></details>' +
      '<div class="cdr-event-chips"></div>' +
      '<div class="cdr-event-footer"><button type="button" class="btn small cdr-event-apply" data-event-action="apply">Apply selection</button>' +
      '<span class="cdr-event-pending" aria-live="polite"></span></div>';
  }
  function ensureMounts() {
    document.querySelectorAll('.cdr-event-mount').forEach(mount => {
      if (!validScope(mount.dataset.eventScope)) return;
      if (mount.querySelector('.cdr-event-picker')) return;
      mount.innerHTML = widgetHtml();
    });
  }
  function filteredChoices(mount) {
    const query = (mount.querySelector('.cdr-event-search')?.value || '').trim().toLocaleLowerCase();
    return options.filter(value => !query || value.toLocaleLowerCase().includes(query));
  }
  function drawChoices(mount) {
    const scope = mount.dataset.eventScope, selected = draft[scope];
    const items = filteredChoices(mount);
    const list = mount.querySelector('.cdr-event-list');
    if (!list) return;
    list.innerHTML = items.length
      ? items.map(value => '<label class="cdr-event-option"><input type="checkbox" class="cdr-event-checkbox" value="' +
        attr(value) + '"' + (selected.has(value) ? ' checked' : '') + '><span>' +
        esc(value) + '</span></label>').join('')
      : '<div class="cdr-event-empty">No matching event types.</div>';
  }
  function drawSummary(mount) {
    const scope = mount.dataset.eventScope, selected = draft[scope];
    const summary = mount.querySelector('.cdr-event-summary');
    if (!summary) return;
    const label = !selected.size ? 'All event types'
      : selected.size === 1 ? [...selected][0]
      : count(selected.size) + ' event types selected';
    summary.textContent = label;
    const chipBox = mount.querySelector('.cdr-event-chips');
    chipBox.innerHTML = selected.size
      ? [...selected].slice(0, 4).map(value =>
          '<button type="button" class="cdr-event-chip" data-event-remove="' + attr(value) +
          '" title="Remove ' + attr(value) + '" aria-label="Remove ' + attr(value) + '">' +
          '<span>' + esc(value) + '</span><b aria-hidden="true">×</b></button>'
        ).join('') +
        (selected.size > 4 ? '<span class="cdr-event-more">+' + count(selected.size - 4) + ' more</span>' : '')
      : '<span class="cdr-event-all">Including all event types</span>';
    const dirty = pending(scope);
    const apply = mount.querySelector('.cdr-event-apply');
    if (apply) apply.disabled = !dirty;
    const status = mount.querySelector('.cdr-event-pending');
    if (status) status.textContent = dirty ? 'Changes not applied' : 'Current selection';
  }
  function drawScope(scope, withChoices = true) {
    mounts(scope).forEach(mount => {
      if (withChoices) drawChoices(mount);
      drawSummary(mount);
    });
  }
  function syncLegacy(scope) {
    const selected = [...appliedFor(scope)];
    const id = scope === 'global' ? 'callType' : scope === 'link' ? 'linkEventType' : 'relationshipEvent';
    const el = $(id);
    if (el) el.value = selected.length === 1 && [...el.options].some(o => o.value === selected[0])
      ? selected[0] : '';
    if (scope === 'global' && $('dashboardEventType')) {
      $('dashboardEventType').value = selected.length === 1 ? selected[0] : '';
    }
  }
  function apply(scope, opts = {}) {
    if (!validScope(scope)) return;
    const valid = new Set(options);
    const values = new Set([...draft[scope]].filter(value => valid.has(value)));
    if (scope === 'global') core.state.globalEventTypes = values;
    else applied[scope] = values;
    draft[scope] = new Set(values);
    syncLegacy(scope);
    mounts(scope).forEach(mount => {
      const details = mount.querySelector('.cdr-event-picker');
      if (details) details.open = false;
    });
    drawScope(scope);
    if (opts.render === false) return;
    if (scope === 'global') window.CDRApp?.applyFilters?.();
    else if (scope === 'link') $('linkRefreshBtn')?.click();
    else window.CDRRelationship?.render?.();
  }
  function reset(scope, opts = {}) {
    if (!validScope(scope)) return;
    draft[scope].clear();
    apply(scope, opts);
  }
  function externalSet(scope, values) {
    if (!validScope(scope)) return;
    const next = new Set([...values].filter(value => options.includes(value)));
    if (scope === 'global') core.state.globalEventTypes = next;
    else applied[scope] = next;
    draft[scope] = new Set(next);
    syncLegacy(scope);
    drawScope(scope);
  }
  function refresh() {
    options = availableTypes();
    ensureMounts();
    const valid = new Set(options);
    for (const scope of scopeNames) {
      draft[scope] = new Set([...draft[scope]].filter(value => valid.has(value)));
      if (scope === 'global') {
        core.state.globalEventTypes = new Set([...appliedFor(scope)].filter(value => valid.has(value)));
      } else {
        applied[scope] = new Set([...appliedFor(scope)].filter(value => valid.has(value)));
      }
      syncLegacy(scope);
      drawScope(scope);
    }
  }

  document.addEventListener('change', event => {
    const input = event.target.closest?.('.cdr-event-checkbox');
    if (!input) return;
    const mount = input.closest('.cdr-event-mount');
    const scope = mount?.dataset.eventScope;
    if (!validScope(scope) || !options.includes(input.value)) return;
    if (input.checked) draft[scope].add(input.value);
    else draft[scope].delete(input.value);
    drawScope(scope);
  });
  document.addEventListener('input', event => {
    if (!event.target.matches?.('.cdr-event-search')) return;
    const mount = event.target.closest('.cdr-event-mount');
    if (mount) drawChoices(mount);
  });
  document.addEventListener('click', event => {
    const remove = event.target.closest?.('[data-event-remove]');
    const action = event.target.closest?.('[data-event-action]');
    const control = remove || action;
    if (!control) return;
    const mount = control.closest('.cdr-event-mount');
    const scope = mount?.dataset.eventScope;
    if (!validScope(scope)) return;
    if (remove) draft[scope].delete(remove.dataset.eventRemove);
    else if (action.dataset.eventAction === 'select-visible') {
      filteredChoices(mount).forEach(value => draft[scope].add(value));
    } else if (action.dataset.eventAction === 'clear') draft[scope].clear();
    else if (action.dataset.eventAction === 'apply') { apply(scope); return; }
    drawScope(scope);
  });
  document.addEventListener('toggle', event => {
    if (!event.target.matches?.('.cdr-event-picker') || !event.target.open) return;
    const root = event.target.closest('.cdr-event-mount');
    document.querySelectorAll('.cdr-event-picker[open]').forEach(other => {
      if (other !== event.target && other.closest('.cdr-event-mount')?.dataset.eventScope === root?.dataset.eventScope) other.open = false;
    });
  }, true);
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const details = event.target.closest?.('.cdr-event-picker');
    if (details?.open) {
      details.open = false;
      details.querySelector('summary')?.focus();
    }
  });
  window.addEventListener('cdr:updated', refresh);
  window.CDREventTypes = {
    getApplied: scope => new Set(validScope(scope) ? appliedFor(scope) : []),
    apply, reset, externalSet, refresh
  };
  refresh();
})();