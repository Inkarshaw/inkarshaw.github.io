(() => {
  'use strict';
  window.CDRCaseFactory = function(ctx){
    const {$,state,subjectEventScopedRecords,dtFmt,escapeHtml,escAttr,contactTitle,contactLabel,fmtDur,audit}=ctx;

  function renderAudit(){if(!$('auditTrailTable'))return;const rows=[...state.auditTrail].slice(-500).reverse();$('auditTrailTable').innerHTML='<thead><tr><th>Date/time</th><th>Case</th><th>Action</th><th>Details</th></tr></thead><tbody>'+(rows.length?rows.map(x=>'<tr><td>'+escapeHtml(dtFmt(new Date(x.at)))+'</td><td>'+escapeHtml(x.caseNo||x.caseTitle||'—')+'</td><td><b>'+escapeHtml(x.action)+'</b></td><td class="details">'+escapeHtml(x.details||'')+'</td></tr>').join(''):'<tr><td colspan="4" class="empty">No local audit events recorded in this workspace.</td></tr>')+'</tbody>';}
  function renderFlags(){const list=$('flagList');if(!list)return;const rows=state.filtered.filter(r=>state.flags.has(r.id));list.innerHTML=rows.length?rows.map(r=>`<div class="note-card"><div class="record-summary"><b title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</b> • ${escapeHtml(dtFmt(r.dt)||`${r.date} ${r.time}`)} • ${escapeHtml(r.callType)} • ${fmtDur(r.duration)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>${escapeHtml(r.firstAddress||r.firstCellId||'')}</div><textarea class="row-note" data-id="${r.id}" placeholder="Note for this record…">${escapeHtml(state.notes[r.id]||'')}</textarea><div style="margin-top:6px"><button class="btn secondary small add-chronology" data-id="${r.id}">Add to chronology</button> <button class="btn secondary small unflag" data-id="${r.id}">Remove flag</button></div></div>`).join(''):`<div class="empty">No records flagged yet.</div>`;renderAudit();}

  function renderChronology(){
    const table=$('chronologyTable');if(!table)return;
    const rows=[...state.chronology].sort((a,b)=>(Number(a.time)||0)-(Number(b.time)||0));
    if(!rows.length){
      table.innerHTML='<tbody><tr><td class="empty" style="padding:28px;text-align:center"><b>No timeline events added yet.</b><br><span class="tiny">Use “Add to chronology” from Records / Flags / SMS Intelligence, or enter a manual event above.</span></td></tr></tbody>';
      return;
    }
    table.innerHTML=`<thead><tr><th>Date/time</th><th>Source</th><th>Event</th><th>Reference</th><th></th></tr></thead><tbody>${rows.map(x=>{
      const linked=x.recordId?state.records.find(r=>r.id===x.recordId):null;
      const sourceMissing=!!x.recordId&&!linked;
      const eventText=x.text||linked?`${x.text||''}`:'';
      return `<tr><td>${escapeHtml(dtFmt(new Date(x.time))||'—')}</td><td>${escapeHtml(x.source||'Manual')}</td><td class="details">${escapeHtml(eventText||'—')}${sourceMissing?'<div class="tiny warntext">Linked source record is no longer loaded.</div>':''}</td><td class="details">${escapeHtml(x.reference||'')}</td><td><button class="file-remove remove-chronology" data-id="${escAttr(x.id)}" title="Remove timeline event">×</button></td></tr>`;
    }).join('')}</tbody>`;
  }

    function bind(){
      if($('flagList')){
        $('flagList').addEventListener('input',e=>{if(e.target.classList.contains('row-note'))state.notes[e.target.dataset.id]=e.target.value;});
        $('flagList').addEventListener('change',e=>{if(e.target.classList.contains('row-note'))audit('Record note changed',e.target.dataset.id);});
      }
      if($('clearAuditBtn'))$('clearAuditBtn').onclick=()=>{state.auditTrail=[];try{localStorage.removeItem('cdrAnalyzer:auditTrail');}catch{}renderAudit();};
      if($('addChronologyManualBtn'))$('addChronologyManualBtn').onclick=()=>{
        const t=$('chronologyText').value.trim();if(!t)return;
        const cv=$('chronologyDt').value;let d=new Date();if(cv){const [date,time='00:00']=cv.split('T'),[y,m,day]=date.split('-').map(Number),[h,min]=time.split(':').map(Number);d=window.CDRCore.dateFromSourceParts(y,m-1,day,h||0,min||0,0,state.sourceTimezone);}
        state.chronology.push({id:'m'+Date.now(),time:+d,source:'Manual',text:t,reference:''});audit('Manual chronology event added',t);
        $('chronologyText').value='';renderChronology();
      };
    }
    return {renderFlags,renderChronology,renderAudit,bind};
  };
})();
