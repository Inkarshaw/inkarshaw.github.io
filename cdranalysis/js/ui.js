(() => {
  'use strict';
  window.CDRUIFactory = function(ctx){
    const {
      $,state,updatePrivacyUi,showStatus,renderCaseSnapshots,saveCaseSnapshot,renderAll,installViewScopeToolbars,
      syncViewScopeControls,updateFilterCount,exportCaseReport,saveWorkspace,loadWorkspaceObject,
      clearLoaded,applyIncidentWindow,exportTacCache,importTacDatabase,exportCsv,safeName,
      exportWorkbook,download,switchTab,applyFilters,refreshSelectors,renderFileList,renderRecords,
      renderFlags,renderContactProfile,jumpToRecord,samePhone,contactFilter,caseSnapshots,persistLocal,
      renderIncident,contactLabel,timeMins,shiftLocalDateKey,fmtDur,renderChronology,
      selectRequestContacts,renderContacts,openCdrRequestGenerator,updateCdrRequestCount,
      identityStore,renderNetwork,seedBuiltinTacMappings,audit
    }=ctx;

    let caseSaveMode='workspace',caseSaveBackup={};
    function openCaseSaveDialog(mode='workspace'){
      caseSaveBackup={};['caseTitle','caseNo','station','analyst','incidentDate','incidentTime'].forEach(id=>{caseSaveBackup[id]=$(id)?.value||'';});
      caseSaveMode=mode==='snapshot'?'snapshot':'workspace';
      const dlg=$('caseSaveDialog');if(!dlg)return;
      if($('caseSaveDialogTitle'))$('caseSaveDialogTitle').textContent=caseSaveMode==='snapshot'?'Save Case Snapshot':'Save Case Workspace';
      if($('caseSaveConfirmBtn'))$('caseSaveConfirmBtn').textContent=caseSaveMode==='snapshot'?'Save Snapshot':'Save Case Workspace';
      if(typeof dlg.showModal==='function'){if(!dlg.open)dlg.showModal();}else dlg.setAttribute('open','');
      setTimeout(()=>$('caseTitle')?.focus(),0);
    }
    function closeCaseSaveDialog(){
      const dlg=$('caseSaveDialog');if(!dlg)return;
      if(typeof dlg.close==='function'&&dlg.open)dlg.close();else dlg.removeAttribute('open');
    }
    function cancelCaseSaveDialog(){
      Object.entries(caseSaveBackup).forEach(([id,value])=>{if($(id))$(id).value=value;});
      closeCaseSaveDialog();
    }
    function persistCaseMeta(){
      // Case metadata is retained in the current session and explicit workspace/snapshot saves only.
    }

    function bind(){
  $('exportDirectoryBtn').onclick=()=>download('cdr_contact_directory.json',JSON.stringify({version:2,exportedAt:new Date().toISOString(),contactTags:state.globalContactTags,contactNames:state.globalContactNames},null,2),'application/json');
  $('importDirectoryBtn').onclick=()=>$('directoryInput').click();
  $('directoryInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());state.globalContactTags={...state.globalContactTags,...(d.contactTags||{})};state.globalContactNames={...state.globalContactNames,...(d.contactNames||{})};persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));renderAll();showStatus('Contact directory imported.','ok');}catch(err){showStatus('Directory import failed: '+err.message,'error');}e.target.value='';});



  $('privateSessionBtn').onclick=()=>{state.privateSession=!state.privateSession;updatePrivacyUi();showStatus(state.privateSession?'Private Session enabled. New local persistence is paused.':'Private Session disabled. Local persistence is enabled.','ok');};
  $('clearLocalDataBtn').onclick=()=>{if(!confirm('Clear locally saved CDR Analyzer case metadata, contact names/tags and case snapshots from this browser? Loaded CDR rows in the current session will remain open.'))return;for(const k of Object.keys(localStorage)){if(k.startsWith('cdrAnalyzer:'))localStorage.removeItem(k);}state.contactTags={};state.contactNames={};state.globalContactTags={};state.globalContactNames={};state.smsSenderOverrides={};state.smsReviewSelected?.clear?.();state.auditTrail=[];['caseTitle','caseNo','station','analyst','incidentDate','incidentTime','generalNote'].forEach(id=>{if($(id))$(id).value='';});renderCaseSnapshots();renderAll();showStatus('Local case data cleared from this browser.','ok');};
  installViewScopeToolbars();syncViewScopeControls(true);
    updatePrivacyUi();updateFilterCount();
  $('printBtn').onclick=()=>window.print();$('reportBtn').onclick=exportCaseReport;$('saveWorkspaceBtn').onclick=()=>openCaseSaveDialog('workspace');$('loadWorkspaceBtn').onclick=()=>$('workspaceInput').click();$('clearFilesBtn').onclick=clearLoaded;$('importTacBtn').onclick=()=>$('tacInput').click();
  $('caseSaveCancelBtn').onclick=cancelCaseSaveDialog;
  $('caseSaveForm').addEventListener('submit',e=>{e.preventDefault();persistCaseMeta();closeCaseSaveDialog();if(caseSaveMode==='snapshot')saveCaseSnapshot?.();else saveWorkspace();});
  $('exportTacBtn').onclick=exportTacCache;
  $('tacInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importTacDatabase(f);}catch(err){showStatus('TAC import failed: '+err.message,'error');}e.target.value='';});
  $('exportBtn').onclick=()=>exportCsv(state.filtered,`${safeName($('caseNo').value||$('caseTitle').value)}_filtered_cdr.csv`);$('exportFlagsBtn').onclick=()=>exportCsv(state.records.filter(r=>state.flags.has(r.id)),`${safeName($('caseNo').value||$('caseTitle').value)}_flagged_cdr.csv`);$('exportXlsxBtn').onclick=exportWorkbook;
  $('exportNotesBtn').onclick=()=>{const payload={case:{title:$('caseTitle').value,caseNo:$('caseNo').value,station:$('station').value,analyst:$('analyst').value},generalNote:$('generalNote').value,recordNotes:state.notes,flagged:[...state.flags]};download(`${safeName($('caseNo').value||$('caseTitle').value)}_notes.json`,JSON.stringify(payload,null,2),'application/json');};
  $('workspaceInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{loadWorkspaceObject(JSON.parse(await f.text()));}catch(err){showStatus('Workspace load failed: '+err.message,'error');}e.target.value='';});
  $('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)switchTab(b.dataset.tab)});$('tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...document.querySelectorAll('.tab')],cur=tabs.indexOf(document.activeElement);if(cur<0)return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(cur+1)%tabs.length:(cur-1+tabs.length)%tabs.length;tabs[n].focus();switchTab(tabs[n].dataset.tab);});document.addEventListener('click',e=>{const j=e.target.closest('[data-jump]');if(j)switchTab(j.dataset.jump);const lr=e.target.closest('.location-records-filter');if(lr){e.preventDefault();$('cellId').value=lr.dataset.cell||'';$('tower').value=lr.dataset.tower||'';$('operator').value=lr.dataset.operator||'';applyFilters();switchTab('records');}const lm=e.target.closest('.location-movement');if(lm){e.preventDefault();$('cdrNo').value=lm.dataset.subject||'';$('cellId').value='';$('tower').value='';$('operator').value='';applyFilters();syncViewScopeControls(false);if($('movementCdr'))$('movementCdr').value=lm.dataset.subject||'';switchTab('movement');}const dl=e.target.closest('.dashboard-location-filter');if(dl){e.preventDefault();$('cellId').value=dl.dataset.cell||'';$('tower').value=dl.dataset.tower||'';applyFilters();switchTab('records');}const dd=e.target.closest('.dashboard-device-filter');if(dd){e.preventDefault();$('imei').value=dd.dataset.imei||'';$('imsi').value=dd.dataset.imsi||'';applyFilters();switchTab('devices');}const c=e.target.closest('.contact-filter');if(c){e.preventDefault();contactFilter(c.dataset.num);}const f=e.target.closest('.flag-btn');if(f){const id=f.dataset.id;if(state.flags.has(id)){state.flags.delete(id);audit?.('Record flag removed',id);}else{state.flags.add(id);audit?.('Record flagged',id);}renderRecords();renderFlags();}const u=e.target.closest('.unflag');if(u){state.flags.delete(u.dataset.id);audit?.('Record flag removed',u.dataset.id);renderRecords();renderFlags();}const cp=e.target.closest('.contact-profile-btn');if(cp){e.preventDefault();renderContactProfile(cp.dataset.num);$('contactProfilePanel').scrollIntoView({behavior:'smooth',block:'start'});}const lcr=e.target.closest('.lead-contact-records');if(lcr){e.preventDefault();contactFilter(lcr.dataset.num);}const lvr=e.target.closest('.lead-view-record');if(lvr){e.preventDefault();jumpToRecord(state.records.find(r=>r.id===lvr.dataset.id));}const fl=e.target.closest('.contact-first-last');if(fl){const rr=state.records.filter(r=>samePhone(r.bparty,fl.dataset.num)&&r.dt).sort((a,b)=>a.dt-b.dt);jumpToRecord(fl.dataset.which==='last'?rr[rr.length-1]:rr[0]);}const cs=e.target.closest('.load-case-snapshot');if(cs){const x=caseSnapshots()[+cs.dataset.i];if(x){$('caseTitle').value=x.title||'';$('caseNo').value=x.caseNo||'';$('station').value=x.station||'';$('analyst').value=x.analyst||'';$('incidentDate').value=x.incidentDate||'';$('incidentTime').value=x.incidentTime||'';renderIncident();}}const cd=e.target.closest('.delete-case-snapshot');if(cd){const rows=caseSnapshots();rows.splice(+cd.dataset.i,1);persistLocal('cdrAnalyzer:caseSnapshots',JSON.stringify(rows));renderCaseSnapshots();}const df=e.target.closest('.day-filter');if(df){$('dateFrom').value=df.dataset.date;$('dateTo').value=df.dataset.date;applyFilters();switchTab('records');}const ph=e.target.closest('.pattern-hour-filter');if(ph){const h=String(+ph.dataset.hour).padStart(2,'0');$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const phd=e.target.closest('.pattern-hour-date-filter');if(phd){const h=String(+phd.dataset.hour).padStart(2,'0');$('dateFrom').value=phd.dataset.date;$('dateTo').value=phd.dataset.date;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pch=e.target.closest('.pattern-contact-hour-filter');if(pch){const h=String(+pch.dataset.hour).padStart(2,'0');$('bparty').value=pch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pwch=e.target.closest('.pattern-weekday-contact-hour-filter');if(pwch){const h=String(+pwch.dataset.hour).padStart(2,'0'),w=+pwch.dataset.weekday;$('bparty').value=pwch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();state.filtered=state.filtered.filter(r=>r.dt&&window.CDRCore.sourceWeekday(r.dt)===w);state.page=1;switchTab('records');showStatus('Showing '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][w]+' records for '+contactLabel(pwch.dataset.num)+' during '+h+':00–'+h+':59.','ok');}const ns=e.target.closest('.night-stay-filter');if(ns){e.preventDefault();const startKey=ns.dataset.night,endKey=shiftLocalDateKey(startKey,1);$('cdrNo').value=ns.dataset.subject||'';$('dateFrom').value=startKey;$('dateTo').value=(timeMins($('nightFrom').value)>timeMins($('nightTo').value))?endKey:startKey;$('nightOnly').checked=true;$('cellId').value='';$('tower').value='';if(ns.dataset.cell)$('cellId').value=ns.dataset.cell;else if(ns.dataset.tower)$('tower').value=ns.dataset.tower;applyFilters();switchTab('records');showStatus('Showing records for the selected subject, night window and main recorded tower.','ok');}const ac=e.target.closest('.add-chronology');if(ac){const r=state.records.find(x=>x.id===ac.dataset.id);if(r&&!state.chronology.some(x=>x.recordId===r.id)){state.chronology.push({id:'r'+r.id,recordId:r.id,time:+(r.dt||new Date()),source:'CDR',text:`${contactLabel(r.bparty)} • ${r.callType} • ${fmtDur(r.duration)}`,reference:`${r.sourceFile} / ${r.sourceSheet} / row ${r.rowNumber}`});}switchTab('casereview');}const rc=e.target.closest('.remove-chronology');if(rc){state.chronology=state.chronology.filter(x=>x.id!==rc.dataset.id);audit?.('Chronology event removed',rc.dataset.id);renderChronology();}const rm=e.target.closest('[data-remove-file]');if(rm){const id=+rm.dataset.removeFile;const removedFile=state.files.find(f=>f.id===id);state.records=state.records.filter(r=>r.fileId!==id);state.files=state.files.filter(f=>f.id!==id);audit?.('Imported worksheet removed',removedFile?(removedFile.name+' / '+removedFile.sheet):String(id));refreshSelectors();renderFileList();applyFilters();showStatus('File removed from this browser session.','ok');}});
  $('selectRequestContactsBtn').onclick=selectRequestContacts;
  $('clearRequestContactsBtn').onclick=()=>{state.requestSelected.clear();renderContacts();};
  $('openCdrRequestBtn').onclick=openCdrRequestGenerator;
  $('identityScope').onchange=renderContacts;
  $('contactsTable').addEventListener('change',e=>{
    if(e.target.classList.contains('cdr-request-check')){e.target.checked?state.requestSelected.add(e.target.dataset.num):state.requestSelected.delete(e.target.dataset.num);updateCdrRequestCount();return;}
    if(e.target.classList.contains('contact-tag')){
      const v=e.target.value==='Unclassified'?'':e.target.value,store=identityStore('tag');store[e.target.dataset.num]=v;audit?.('Contact tag changed',e.target.dataset.num+' → '+(v||'Unclassified'));
      if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
      renderContacts();
    }
    if(e.target.classList.contains('contact-name')){
      const store=identityStore('name');store[e.target.dataset.num]=e.target.value.trim();audit?.('Contact name changed',e.target.dataset.num+' → '+e.target.value.trim());
      if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));
      renderAll();switchTab('contacts');
    }
  });
  $('contactsTable').addEventListener('input',e=>{if(e.target.classList.contains('contact-name')){const store=identityStore('name');store[e.target.dataset.num]=e.target.value;if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));}});

  window.addEventListener('resize',()=>{const n=document.getElementById('network');if(n&&!n.classList.contains('hidden'))renderNetwork();});
  try{state.globalContactTags=JSON.parse(localStorage.getItem('cdrAnalyzer:globalContactTags')||localStorage.getItem('cdrAnalyzer:contactTags')||'{}')||{};}catch{state.globalContactTags={};}
  try{state.tacCache=JSON.parse(localStorage.getItem('cdrAnalyzer:tacCache')||'{}')||{};}catch{state.tacCache={};}
  seedBuiltinTacMappings();
  try{state.globalContactNames=JSON.parse(localStorage.getItem('cdrAnalyzer:globalContactNames')||localStorage.getItem('cdrAnalyzer:contactNames')||'{}')||{};}catch{state.globalContactNames={};}
  state.contactTags={};state.contactNames={};
  if(!localStorage.getItem('cdrAnalyzer:globalContactTags')&&Object.keys(state.globalContactTags).length)persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
  if(!localStorage.getItem('cdrAnalyzer:globalContactNames')&&Object.keys(state.globalContactNames).length)persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));
  ['generalNote'].forEach(id=>{const el=$(id);const key='cdrAnalyzer:'+id;if(!el)return;el.value=localStorage.getItem(key)||el.value||'';el.addEventListener('input',()=>persistLocal(key,el.value));});
  document.querySelectorAll('.view').forEach(v=>v.setAttribute('role','tabpanel'));document.querySelectorAll('.tab').forEach(t=>t.setAttribute('tabindex',t.classList.contains('active')?'0':'-1'));
  if(typeof XLSX==='undefined')showStatus('The local XLSX library did not load. Refresh the analyzer files.','error');
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/cdranalysis/sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});}

    }

    return {bind,openCaseSaveDialog};
  };
})();
