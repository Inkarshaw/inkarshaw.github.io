(() => {
  'use strict';
  window.CDRCaseFactory = function(ctx){
    const {$,state,subjectEventScopedRecords,dtFmt,escapeHtml,escAttr,contactTitle,contactLabel,fmtDur,audit}=ctx;

  function renderAudit(){if(!$('auditTrailTable'))return;const rows=[...state.auditTrail].slice(-500).reverse();$('auditTrailTable').innerHTML='<thead><tr><th>Date/time</th><th>Action</th><th>Details</th></tr></thead><tbody>'+(rows.length?rows.map(x=>'<tr><td>'+escapeHtml(dtFmt(new Date(x.at)))+'</td><td><b>'+escapeHtml(x.action)+'</b></td><td class="details">'+escapeHtml(x.details||'')+'</td></tr>').join(''):'<tr><td colspan="3" class="empty">No local audit events recorded in this workspace.</td></tr>')+'</tbody>';}
  function renderFlags(){const rows=state.filtered.filter(r=>state.flags.has(r.id));$('flagList').innerHTML=rows.length?rows.map(r=>`<div class="note-card"><div class="record-summary"><b title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</b> • ${escapeHtml(dtFmt(r.dt)||`${r.date} ${r.time}`)} • ${escapeHtml(r.callType)} • ${fmtDur(r.duration)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>${escapeHtml(r.firstAddress||r.firstCellId||'')}</div><textarea class="row-note" data-id="${r.id}" placeholder="Note for this record…">${escapeHtml(state.notes[r.id]||'')}</textarea><div style="margin-top:6px"><button class="btn secondary small add-chronology" data-id="${r.id}">Add to chronology</button> <button class="btn secondary small unflag" data-id="${r.id}">Remove flag</button></div></div>`).join(''):`<div class="empty">No records flagged yet.</div>`;renderAudit();}

  function renderChronology(){const allowed=new Set(subjectEventScopedRecords(state.records).map(r=>r.id));const rows=state.chronology.filter(x=>x.source==='Manual'||!x.recordId||allowed.has(x.recordId)).sort((a,b)=>a.time-b.time);$('chronologyTable').innerHTML=`<thead><tr><th>Date/time</th><th>Source</th><th>Event</th><th>Reference</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${dtFmt(new Date(x.time))}</td><td>${escapeHtml(x.source)}</td><td class="details">${escapeHtml(x.text)}</td><td>${escapeHtml(x.reference||'')}</td><td><button class="file-remove remove-chronology" data-id="${x.id}">×</button></td></tr>`).join('')}</tbody>`;}

    function bind(){
      $('flagList').addEventListener('input',e=>{
        if(e.target.classList.contains('row-note'))state.notes[e.target.dataset.id]=e.target.value;
      });
      $('flagList').addEventListener('change',e=>{if(e.target.classList.contains('row-note'))audit('Record note changed',e.target.dataset.id);});
      if($('clearAuditBtn'))$('clearAuditBtn').onclick=()=>{state.auditTrail=[];renderAudit();};
      $('addChronologyManualBtn').onclick=()=>{
        const t=$('chronologyText').value.trim();if(!t)return;
        const d=$('chronologyDt').value?new Date($('chronologyDt').value):new Date();
        state.chronology.push({id:'m'+Date.now(),time:+d,source:'Manual',text:t,reference:''});audit('Manual chronology event added',t);
        $('chronologyText').value='';
        renderChronology();
      };
    }
    return {renderFlags,renderChronology,renderAudit,bind};
  };
})();
