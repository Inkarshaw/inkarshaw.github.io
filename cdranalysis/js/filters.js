(() => {
  'use strict';
  window.CDRFiltersFactory = function(ctx){
    const {$,state,normalize,contactLabel,contactTag,escAttr,escapeHtml,fill,fillSelect,fmtInt,isServiceSender,renderAll,timeMins,uniq,analysisRecords,rebuildIndexes,audit}=ctx;

  function subjectEventScopedRecords(data=analysisRecords()){
    const subject=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    return data.filter(r=>(!subject||r.cdrNo===subject)&&(!eventType||r.callType===eventType));
  }
  function installViewScopeToolbars(){
    document.querySelectorAll('.view').forEach(view=>{
      if(view.id==='dashboard'||view.querySelector(':scope > .view-scope-toolbar'))return;
      const bar=document.createElement('div');
      bar.className='panel no-print view-scope-toolbar';
      bar.style.padding='10px 12px';
      const bpartyField=view.id==='records'?'<div class="field" style="min-width:220px"><label>B Party</label><input class="view-scope-bparty" placeholder="Search connected number / sender ID"></div>':'';
      const clearLabel=view.id==='records'?'Clear quick filters':'Clear subject/event';
      bar.innerHTML='<div class="subtoolbar" style="margin:0"><div class="field" style="min-width:240px"><label>Subject / MSISDN</label><select class="view-scope-subject"><option value="">All subjects</option></select></div><div class="field" style="min-width:210px"><label>Event type</label><select class="view-scope-event"><option value="">All event types</option></select></div>'+bpartyField+'<button class="btn secondary small view-scope-clear" type="button">'+clearLabel+'</button><span class="tiny view-scope-status"></span></div>';
      view.insertBefore(bar,view.firstChild);
    });
  }
  function syncViewScopeControls(rebuild=false){
    const subjects=uniq('cdrNo'),events=uniq('callType'),subject=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    const fill=(el,items,label,value)=>{
      if(!el)return;
      if(rebuild||el.options.length!==items.length+1){
        el.innerHTML='<option value="">'+label+'</option>'+items.map(x=>'<option value="'+escAttr(x)+'">'+escapeHtml(x)+'</option>').join('');
      }
      el.value=items.includes(value)?value:'';
    };
    document.querySelectorAll('.view-scope-subject').forEach(el=>fill(el,subjects,'All subjects',subject));
    document.querySelectorAll('.view-scope-event').forEach(el=>fill(el,events,'All event types',eventType));
    document.querySelectorAll('.view-scope-bparty').forEach(el=>{if(el.value!==($('bparty')?.value||''))el.value=$('bparty')?.value||'';});
    fill($('dashboardCdr'),subjects,'All subjects',subject);
    fill($('dashboardEventType'),events,'All event types',eventType);
    // Keep the older tab-specific subject controls aligned so they cannot silently narrow to a different subject.
    if($('movementCdr')){fill($('movementCdr'),subjects,'All subjects',subject);}
    if($('smsIntelCdr')){fill($('smsIntelCdr'),subjects,'All subjects',subject);}
    const scopeText=(subject||'All subjects')+' • '+(eventType||'All event types')+' • '+fmtInt(state.filtered.length)+' filtered records';
    document.querySelectorAll('.view-scope-status').forEach(el=>el.textContent=scopeText);
  }
  function setSubjectEventScope(subject,eventType){
    if($('cdrNo'))$('cdrNo').value=subject||'';
    if($('callType'))$('callType').value=eventType||'';
    applyFilters();
  }

  function refreshSelectors(){
    fillSelect('callType',uniq('callType'),'All event types');
    fillSelect('cdrNo',uniq('cdrNo'),'All CDR numbers');
    fillSelect('sourceFile',uniq('sourceFile'),'All files');
    const mc=uniq('cdrNo');
    fillSelect('movementCdr',mc,'All subjects');
    fillSelect('dashboardCdr',mc,'All subjects');
    fillSelect('dashboardEventType',uniq('callType'),'All event types');
    fillSelect('smsIntelCdr',mc,'All subjects');
    installViewScopeToolbars();
    syncViewScopeControls(true);
  }

  function matchesSmartQuery(r,q){
    q=String(q||'').trim();if(!q)return true;const tokens=q.match(/"[^"]*"|\S+/g)||[];
    for(let token of tokens){token=token.replace(/^"|"$/g,'');const p=token.indexOf(':');
      if(p>0){const key=normalize(token.slice(0,p)),v=normalize(token.slice(p+1));
        if(key==='imei'&&!normalize(r.imei).includes(v))return false;if(key==='imsi'&&!normalize(r.imsi).includes(v))return false;
        if(key==='tower'&&!normalize((r.firstAddress||'')+' '+(r.firstCellId||'')).includes(v))return false;
        if(key==='name'&&!normalize(contactLabel(r.bparty)).includes(v))return false;if(key==='tag'&&!normalize(contactTag(r.bparty)).includes(v))return false;
        if(key==='after'){const d=new Date(v);if(!r.dt||isNaN(d)||r.dt<d)return false;}if(key==='before'){const d=new Date(v+'T23:59:59');if(!r.dt||isNaN(d)||r.dt>d)return false;}
      }else{const hay=normalize(r.search+' '+contactLabel(r.bparty)+' '+(contactTag(r.bparty)));if(!hay.includes(normalize(token)))return false;}
    }return true;
  }
  function withinNight(mins,start,end){if(start===null||end===null||mins===null)return true; return start<=end?(mins>=start&&mins<=end):(mins>=start||mins<=end);}
  function activeFilterCount(){
    const ids=['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','cellId','tower','city','subcity','roaming','imei','imsi','provider','operator'];
    let n=ids.filter(id=>String($(id)?.value||'').trim()).length;
    n+=['callType','cdrNo','sourceFile'].filter(id=>$(id)?.value).length;
    n+=['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders'].filter(id=>$(id)?.checked).length;
    if(state.exactIncidentRange)n++;
    return n;
  }
  function updateFilterCount(){if($('activeFilterCount'))$('activeFilterCount').textContent=activeFilterCount();}
  function setFilterDrawer(open){$('filterSidebar')?.classList.toggle('open',open);$('filterBackdrop')?.classList.toggle('show',open);$('mobileFiltersBtn')?.setAttribute('aria-expanded',String(open));$('filterSidebar')?.setAttribute('aria-hidden',String(window.innerWidth<=1100?!open:false));}
  function applyFilters(){
    const f={q:normalize($('q').value),dateFrom:$('dateFrom').value?new Date($('dateFrom').value+'T00:00:00'):null,dateTo:$('dateTo').value?new Date($('dateTo').value+'T23:59:59'):null,
      timeFrom:timeMins($('timeFrom').value),timeTo:timeMins($('timeTo').value),bparty:normalize($('bparty').value),durMin:$('durMin').value===''?null:+$('durMin').value,durMax:$('durMax').value===''?null:+$('durMax').value,
      callType:$('callType').value,callsOnly:$('callsOnly').checked,smsOnly:$('smsOnly').checked,nightOnly:$('nightOnly').checked,weekendOnly:$('weekendOnly').checked,excludeServiceSenders:$('excludeServiceSenders').checked,nightFrom:timeMins($('nightFrom').value),nightTo:timeMins($('nightTo').value),
      cellId:normalize($('cellId').value),tower:normalize($('tower').value),city:normalize($('city').value),subcity:normalize($('subcity').value),roaming:normalize($('roaming').value),imei:normalize($('imei').value),imsi:normalize($('imsi').value),provider:normalize($('provider').value),operator:normalize($('operator').value),cdrNo:$('cdrNo').value,sourceFile:$('sourceFile').value};
    const base=analysisRecords();state.filtered=base.filter(r=>{
      if(state.exactIncidentRange&&(!r.dt||r.dt<state.exactIncidentRange.start||r.dt>state.exactIncidentRange.end))return false;
      if(f.q && !matchesSmartQuery(r,$('q').value))return false; if(f.dateFrom && (!r.dt||r.dt<f.dateFrom))return false; if(f.dateTo && (!r.dt||r.dt>f.dateTo))return false;
      const mins=r.dt?window.CDRCore.sourceMinutes(r.dt):timeMins(r.time); if(f.timeFrom!==null&&f.timeTo!==null&&!withinNight(mins,f.timeFrom,f.timeTo))return false; else {if(f.timeFrom!==null&&f.timeTo===null&&mins<f.timeFrom)return false;if(f.timeTo!==null&&f.timeFrom===null&&mins>f.timeTo)return false;}
      if(f.bparty&&!normalize(r.bparty).includes(f.bparty))return false;if(f.durMin!==null&&r.duration<f.durMin)return false;if(f.durMax!==null&&r.duration>f.durMax)return false;if(f.callType&&r.callType!==f.callType)return false;
      const typ=normalize(r.callType);if(f.callsOnly&&!typ.includes('call'))return false;if(f.smsOnly&&!typ.includes('sms'))return false;if(f.excludeServiceSenders&&isServiceSender(r.bparty))return false;if(f.nightOnly&&!withinNight(mins,f.nightFrom,f.nightTo))return false;if(f.weekendOnly&&(!r.dt||![0,6].includes(window.CDRCore.sourceWeekday(r.dt))))return false;
      if(f.cellId&&!normalize(`${r.firstCellId} ${r.lastCellId}`).includes(f.cellId))return false;if(f.tower&&!normalize(`${r.firstAddress} ${r.lastAddress}`).includes(f.tower))return false;if(f.city&&!normalize(r.mainCity).includes(f.city))return false;if(f.subcity&&!normalize(r.subCity).includes(f.subcity))return false;if(f.roaming&&!normalize(r.roaming).includes(f.roaming))return false;
      if(f.imei&&!normalize(r.imei).includes(f.imei))return false;if(f.imsi&&!normalize(r.imsi).includes(f.imsi))return false;if(f.provider&&!normalize(r.provider).includes(f.provider))return false;if(f.operator&&!normalize(r.operator).includes(f.operator))return false;if(f.cdrNo&&r.cdrNo!==f.cdrNo)return false;if(f.sourceFile&&r.sourceFile!==f.sourceFile)return false;return true;
    });
    state.page=1;updateFilterCount();syncViewScopeControls(false);if($('analysisIntegrityStatus'))$('analysisIntegrityStatus').textContent=(state.analysisMode==='unique'?'Duplicate candidates excluded from analysis':'Raw records used for analysis')+' • '+fmtInt(state.filtered.length)+' filtered / '+fmtInt(base.length)+' analysis rows / '+fmtInt(state.records.length)+' raw rows.';renderAll();window.dispatchEvent(new Event('cdr:updated'));
  }
  function resetFilters(){state.exactIncidentRange=null;if($('exactIncidentStatus'))$('exactIncidentStatus').textContent='Uses the incident date/time entered at the top.';['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','cellId','tower','city','subcity','roaming','imei','imsi','provider','operator'].forEach(id=>$(id).value='');['callType','cdrNo','sourceFile'].forEach(id=>$(id).selectedIndex=0);['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders'].forEach(id=>$(id).checked=false);$('nightFrom').value='20:00';$('nightTo').value='06:00';applyFilters();}



    function bind(){
      $('mobileFiltersBtn').onclick=()=>setFilterDrawer(true);
      $('closeFiltersBtn').onclick=()=>setFilterDrawer(false);
      $('filterBackdrop').onclick=()=>setFilterDrawer(false);
      $('applyBtn').onclick=()=>{applyFilters();if(window.innerWidth<=1100)setFilterDrawer(false);};
      $('resetBtn').onclick=resetFilters;
      if($('analysisMode')){$('analysisMode').value=state.analysisMode||'raw';$('analysisMode').onchange=e=>{state.analysisMode=e.target.value==='unique'?'unique':'raw';rebuildIndexes();audit('Analysis dataset mode changed',state.analysisMode);applyFilters();};}
      if($('sourceTimezone')){$('sourceTimezone').value=state.sourceTimezone||'Asia/Kolkata';$('sourceTimezone').onchange=e=>{state.sourceTimezone=e.target.value||'Asia/Kolkata';audit('Source timezone changed',state.sourceTimezone+' (applies to future imports; existing parsed timestamps are preserved)');if($('analysisIntegrityStatus'))$('analysisIntegrityStatus').textContent='Source timezone set to '+state.sourceTimezone+'. Existing imported timestamps are preserved; re-import to reinterpret them.';};}

      document.addEventListener('change',e=>{
        if(e.target.classList.contains('view-scope-subject'))setSubjectEventScope(e.target.value,$('callType')?.value||'');
        else if(e.target.classList.contains('view-scope-event'))setSubjectEventScope($('cdrNo')?.value||'',e.target.value);
        else if(e.target.classList.contains('view-scope-bparty')){$('bparty').value=e.target.value||'';applyFilters();}
      });
      document.addEventListener('keydown',e=>{
        if(e.target.classList.contains('view-scope-bparty')&&e.key==='Enter'){
          e.preventDefault();$('bparty').value=e.target.value||'';applyFilters();
        }
      });
      document.addEventListener('click',e=>{
        const b=e.target.closest('.view-scope-clear');if(!b)return;
        if(b.closest('#records'))$('bparty').value='';
        setSubjectEventScope('','');
      });
      $('dashboardCdr').onchange=e=>setSubjectEventScope(e.target.value,$('callType')?.value||'');
      $('dashboardEventType').onchange=e=>setSubjectEventScope($('cdrNo')?.value||'',e.target.value);
    }

    return {
      subjectEventScopedRecords,installViewScopeToolbars,syncViewScopeControls,setSubjectEventScope,
      refreshSelectors,matchesSmartQuery,withinNight,activeFilterCount,updateFilterCount,
      setFilterDrawer,applyFilters,resetFilters,bind
    };
  };
})();
