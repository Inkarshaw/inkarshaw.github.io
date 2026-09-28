(() => {
  'use strict';
  window.CDRRecordsFactory = function(ctx){
    const {$,state,sortData,typePill,escapeHtml,escAttr,fmtInt,fmtDur,dtFmt,contactTitle,contactLabel,localDateKey,applyFilters,switchTab}=ctx;
    const cols=[['flag','★'],['chronology','Chronology'],['bparty','B Party'],['cdrNo','CDR No'],['dt','Date / Time'],['duration','Duration'],['callType','Type'],['firstCellId','First Cell ID'],['firstAddress','First Tower Address'],['lastCellId','Last Cell ID'],['lastAddress','Last Tower Address'],['imei','IMEI'],['imsi','IMSI'],['roaming','Roaming'],['provider','B Party Provider'],['mainCity','Main City'],['subCity','Sub City'],['operator','Operator'],['sourceFile','Source File'],['sourceSheet','Source Sheet'],['rowNumber','Source Row']];

    function render(){
      state.pageSize=+$('pageSize').value;
      const sorted=sortData(state.filtered),pages=Math.max(1,Math.ceil(sorted.length/state.pageSize));
      if(state.page>pages)state.page=pages;
      const start=(state.page-1)*state.pageSize,items=sorted.slice(start,start+state.pageSize);
      $('recordCount').textContent=`${fmtInt(state.filtered.length)} record(s)`;
      $('pageInfo').textContent=`Page ${state.page} of ${pages}`;
      const head=`<thead><tr>${cols.map(([k,l])=>`<th data-sort="${k}">${l}${state.sort.key===k?(state.sort.dir==='asc'?' ▲':' ▼'):''}</th>`).join('')}</tr></thead>`;
      const body=items.length
        ?`<tbody>${items.map(r=>`<tr data-record-id="${escAttr(r.id)}" class="${state.flags.has(r.id)?'flagged ':''}${state.highlightRecordId===r.id?'record-highlight':''}"><td><button class="btn secondary small flag-btn" data-id="${r.id}" title="Flag / unflag">${state.flags.has(r.id)?'★':'☆'}</button></td><td><button class="btn secondary small add-chronology" data-id="${r.id}" title="Add this CDR event to case chronology">${state.chronology.some(x=>x.recordId===r.id)?'✓ Added':'+ Add'}</button></td><td><div style="display:flex;align-items:center;gap:6px;white-space:nowrap"><a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</a><button class="btn secondary small relationship-open" type="button" data-subject="${escAttr(r.cdrNo)}" data-num="${escAttr(r.bparty)}" title="Analyse this CDR number and B Party">↔</button></div></td><td>${escapeHtml(r.cdrNo)}</td><td>${escapeHtml(dtFmt(r.dt)||`${r.date} ${r.time}`)}</td><td class="num">${fmtDur(r.duration)}</td><td>${typePill(r.callType)}</td><td>${escapeHtml(r.firstCellId)}</td><td title="${escapeHtml(r.firstAddress)}">${escapeHtml(r.firstAddress)}</td><td>${escapeHtml(r.lastCellId)}</td><td title="${escapeHtml(r.lastAddress)}">${escapeHtml(r.lastAddress)}</td><td>${escapeHtml(r.imei)}</td><td>${escapeHtml(r.imsi)}</td><td>${escapeHtml(r.roaming)}</td><td>${escapeHtml(r.provider)}</td><td>${escapeHtml(r.mainCity)}</td><td>${escapeHtml(r.subCity)}</td><td>${escapeHtml(r.operator)}</td><td>${escapeHtml(r.sourceFile)}</td><td>${escapeHtml(r.sourceSheet)}</td><td>${r.rowNumber}</td></tr>`).join('')}</tbody>`
        :'<tbody><tr><td colspan="21" class="empty">No records match the filters.</td></tr></tbody>';
      $('recordsTable').innerHTML=head+body;
    }

    function jumpToRecord(rec){
      if(!rec)return;
      state.highlightRecordId=rec.id;
      state.exactIncidentRange=null;
      if($('exactIncidentStatus'))$('exactIncidentStatus').textContent='Uses the incident date/time entered at the top.';
      $('bparty').value=rec.bparty||'';
      $('timeFrom').value='';
      $('timeTo').value='';
      if(rec.dt){
        const d=localDateKey(rec.dt);
        $('dateFrom').value=d;
        $('dateTo').value=d;
      }else{
        $('dateFrom').value='';
        $('dateTo').value='';
      }
      applyFilters();
      const sorted=sortData(state.filtered),idx=sorted.findIndex(r=>r.id===rec.id);
      if(idx>=0){
        state.pageSize=+$('pageSize').value||100;
        state.page=Math.floor(idx/state.pageSize)+1;
      }
      switchTab('records');
      render();
      setTimeout(()=>{
        const el=[...document.querySelectorAll('#recordsTable tr[data-record-id]')].find(x=>x.dataset.recordId===rec.id);
        el?.scrollIntoView({behavior:'smooth',block:'center'});
      },50);
    }

    function bind(){
      $('recordsTable').addEventListener('click',e=>{
        const th=e.target.closest('th[data-sort]');
        if(!th)return;
        const k=th.dataset.sort;
        if(k==='flag'||k==='chronology')return;
        if(state.sort.key===k)state.sort.dir=state.sort.dir==='asc'?'desc':'asc';
        else state.sort={key:k,dir:k==='dt'?'asc':'desc'};
        render();
      });
      $('prevPage').onclick=()=>{if(state.page>1){state.page--;render();}};
      $('nextPage').onclick=()=>{const p=Math.ceil(state.filtered.length/state.pageSize);if(state.page<p){state.page++;render();}};
      $('pageSize').onchange=()=>{state.page=1;render();};
    }

    return {render,jumpToRecord,bind};
  };
})();
