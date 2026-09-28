(() => {
  'use strict';
  window.CDRContactsFactory = function(ctx){
    const {$,state,aggregateContacts,aggregateLocations,identityStore,defaultCdrRequestDates,updateCdrRequestCount,requestIdentifier,escAttr,escapeHtml,contactTitle,contactLabel,contactTag,serviceSenderType,fmtInt,fmtDur,dtFmt,simpleTable}=ctx;

    function render(){
      const rows=aggregateContacts(),opts=['','Suspect','Victim','Witness','Associate','Service','Other'];
      const names=identityStore('name'),tags=identityStore('tag'),scope=$('identityScope')?.value==='global'?'Global':'Case';
      defaultCdrRequestDates();
      updateCdrRequestCount();
      $('contactsTable').innerHTML=`<thead><tr><th>Request</th><th>B Party</th><th>${scope} Tag</th><th>${scope} Name</th><th>Effective identity</th><th>Sender type</th><th>Records</th><th>Calls</th><th>Incoming</th><th>Outgoing</th><th>SMS</th><th>Total duration</th><th>First</th><th>Last</th><th>Towers</th><th>Providers</th><th>CDRs</th></tr></thead><tbody>${rows.map(x=>{const tag=tags[x.bparty]||'',name=names[x.bparty]||'',req=requestIdentifier(x.bparty);return `<tr><td style="text-align:center">${req?`<input type="checkbox" class="cdr-request-check" data-num="${escAttr(req)}" ${state.requestSelected.has(req)?'checked':''} title="Include in CDR request">`:'—'}</td><td><a href="#" class="link contact-filter" data-num="${escapeHtml(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> <button class="btn secondary small contact-profile-btn" data-num="${escAttr(x.bparty)}">Profile</button> <button class="btn secondary small relationship-open" data-num="${escAttr(x.bparty)}">Relationship</button></td><td><select class="tag-select contact-tag" data-num="${escAttr(x.bparty)}">${opts.map(o=>`<option ${tag===o?'selected':''}>${o||'Unclassified'}</option>`).join('')}</select></td><td><input class="contact-name" data-num="${escAttr(x.bparty)}" value="${escAttr(name)}" placeholder="Type known name" style="min-width:150px;padding:6px 8px;border:1px solid #d0d5dd;border-radius:7px"></td><td title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}${contactTag(x.bparty)?' • '+escapeHtml(contactTag(x.bparty)):''}</td><td>${serviceSenderType(x.bparty)?`<span class="pill sms">${escapeHtml(serviceSenderType(x.bparty))}</span>`:'—'}</td><td class="num">${fmtInt(x.records)}</td><td class="num">${fmtInt(x.calls)}</td><td class="num">${fmtInt(x.in)}</td><td class="num">${fmtInt(x.out)}</td><td class="num">${fmtInt(x.sms)}</td><td class="num">${fmtDur(x.duration)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td class="num">${fmtInt(x.towers.size)}</td><td>${escapeHtml([...x.providers].join(', '))}</td><td>${escapeHtml([...x.cdrs].join(', '))}</td></tr>`}).join('')}</tbody>`;
    }

    function renderProfile(num){
      const rows=state.records.filter(r=>r.bparty===num).sort((a,b)=>(a.dt?.getTime?.()||0)-(b.dt?.getTime?.()||0));
      const a=aggregateContacts(rows)[0];
      if(!a){
        $('contactProfilePanel').innerHTML='<div class="empty">No contact data.</div>';
        return;
      }
      const night=rows.filter(r=>r.dt&&(r.dt.getHours()>=22||r.dt.getHours()<6)).length;
      const towers=aggregateLocations(rows).slice(0,8),subjects=[...new Set(rows.map(r=>r.cdrNo).filter(Boolean))];
      $('contactProfilePanel').innerHTML=`<div class="panel" style="box-shadow:none"><div class="panel-title"><h2>${escapeHtml(contactLabel(num))}</h2><span class="muted">${escapeHtml(num)}</span></div><div class="kpis"><div class="kpi"><div class="v">${a.records}</div><div class="l">Events</div></div><div class="kpi"><div class="v">${a.calls}</div><div class="l">Calls</div></div><div class="kpi"><div class="v">${a.sms}</div><div class="l">SMS</div></div><div class="kpi"><div class="v">${fmtDur(a.duration)}</div><div class="l">Duration</div></div><div class="kpi"><div class="v">${night}</div><div class="l">Night events</div></div></div><p><b>First:</b> ${dtFmt(a.first)||'—'} <button class="btn secondary small contact-first-last" data-num="${escAttr(num)}" data-which="first">View first</button> &nbsp; <b>Last:</b> ${dtFmt(a.last)||'—'} <button class="btn secondary small contact-first-last" data-num="${escAttr(num)}" data-which="last">View last</button><br><b>Subjects:</b> ${escapeHtml(subjects.join(', ')||'—')}<br><b>Sender classification:</b> ${escapeHtml(serviceSenderType(num)||'Ordinary/unknown')}</p><p><button class="btn secondary small relationship-open" data-num="${escAttr(num)}">Check Relationship</button></p><h3>Most-used towers</h3>${simpleTable(['Tower','Events','First','Last'],towers.map(t=>[escapeHtml(t.address||t.cellId||'—'),fmtInt(t.records),dtFmt(t.first),dtFmt(t.last)]))}</div>`;
    }

    return {render,renderProfile};
  };
})();
