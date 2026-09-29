(() => {
  'use strict';
  window.CDRRecordsFactory = function(ctx){
    const {$,state,sortData,typePill,escapeHtml,escAttr,fmtInt,fmtDur,dtFmt,contactTitle,contactLabel,localDateKey,applyFilters,switchTab}=ctx;

    const cols=[
      ['dt','Date / Time',true],
      ['cdrNo','A Party',true],
      ['bparty','B Party',true],
      ['callType','Type',true],
      ['duration','Duration',true],
      ['tower','Cell / Tower',false],
      ['imei','IMEI / IMSI',true],
      ['source','Source',false],
      ['actions','Actions',false]
    ];

    function towerCell(r){
      const startCell=r.firstCellId||'',startAddr=r.firstAddress||'',endCell=r.lastCellId||'',endAddr=r.lastAddress||'';
      const start=[startCell,startAddr].filter(Boolean).join(' • ');
      const end=[endCell,endAddr].filter(Boolean).join(' • ');
      const different=end&&end!==start;
      if(!start&&!end)return '—';
      return `<div class="record-compact-main">${escapeHtml(start||end)}</div>${different?`<div class="tiny">End: ${escapeHtml(end)}</div>`:''}`;
    }

    function deviceCell(r){
      if(!r.imei&&!r.imsi)return '—';
      return `${r.imei?`<div class="record-compact-main" title="IMEI">${escapeHtml(r.imei)}</div>`:''}${r.imsi?`<div class="tiny" title="IMSI">IMSI: ${escapeHtml(r.imsi)}</div>`:''}`;
    }

    function sourceCell(r){
      return `<div class="record-compact-main" title="${escAttr(r.sourceFile||'')}">${escapeHtml(r.sourceFile||'—')}</div><div class="tiny">${escapeHtml(r.sourceSheet||'—')} • row ${fmtInt(r.rowNumber||0)}</div>`;
    }

    function partyCell(r){
      const label=contactLabel(r.bparty),same=String(label||'')===String(r.bparty||'');
      return `<a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(label||r.bparty||'—')}</a>${!same&&r.bparty?`<div class="tiny">${escapeHtml(r.bparty)}</div>`:''}`;
    }

    function actionsCell(r){
      return `<div class="record-actions">
        <button class="btn secondary small flag-btn" data-id="${escAttr(r.id)}" title="Flag / unflag">${state.flags.has(r.id)?'★':'☆'}</button>
        <button class="btn secondary small relationship-open" type="button" data-subject="${escAttr(r.cdrNo)}" data-num="${escAttr(r.bparty)}" title="Analyse A Party and B Party">↔</button>
      </div>`;
    }

    function render(){
      state.pageSize=+$('pageSize').value;
      const sorted=sortData(state.filtered),pages=Math.max(1,Math.ceil(sorted.length/state.pageSize));
      if(state.page>pages)state.page=pages;
      if(state.page<1)state.page=1;
      const start=(state.page-1)*state.pageSize,items=sorted.slice(start,start+state.pageSize);
      $('recordCount').textContent=`${fmtInt(state.filtered.length)} record(s)`;
      $('pageInfo').textContent=`Page ${state.page} of ${pages}`;

      const head=`<thead><tr>${cols.map(([k,l,sortable])=>`<th${sortable?` data-sort="${k}"`:''}>${l}${sortable&&state.sort.key===k?(state.sort.dir==='asc'?' ▲':' ▼'):''}</th>`).join('')}</tr></thead>`;
      const body=items.length
        ?`<tbody>${items.map(r=>`<tr data-record-id="${escAttr(r.id)}" class="${state.flags.has(r.id)?'flagged ':''}${state.highlightRecordId===r.id?'record-highlight':''}">
          <td class="record-date">${escapeHtml(dtFmt(r.dt)||`${r.date||''} ${r.time||''}`)}</td>
          <td><b>${escapeHtml(r.cdrNo||'—')}</b></td>
          <td>${partyCell(r)}</td>
          <td>${typePill(r.callType)}</td>
          <td class="num">${fmtDur(r.duration)}</td>
          <td class="details record-tower">${towerCell(r)}</td>
          <td class="details record-device">${deviceCell(r)}</td>
          <td class="details record-source">${sourceCell(r)}</td>
          <td>${actionsCell(r)}</td>
        </tr>`).join('')}</tbody>`
        :'<tbody><tr><td colspan="9" class="empty">No records match the current filters.</td></tr></tbody>';
      $('recordsTable').innerHTML=head+body;
    }

    function jumpToRecord(rec){
      if(!rec)return;
      state.highlightRecordId=rec.id;
      state.exactIncidentRange=null;
      if($('exactIncidentStatus'))$('exactIncidentStatus').textContent='Uses the incident date/time saved with the case.';
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