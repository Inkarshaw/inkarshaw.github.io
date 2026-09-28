(() => {
  'use strict';
  const {
    $,state,FIELDS,normalize,escapeHtml,fmtInt,fmtDur,dateFmt,dtFmt,val,stableKey,localDateKey,
    haversineKm,percentile,incidentDateTime,escAttr,showStatus,renderFileList,uniq,fillSelect,
    sortData,typePill,safeName
  }=window.CDRCore;
  let identityModule=null, parserModule=null, filtersModule=null, dashboardModule=null, recordsModule=null, contactsModule=null, locationsModule=null, devicesModule=null, movementModule=null, networkModule=null, analysisModule=null, reportsModule=null, workspaceModule=null, caseModule=null;
  function parseDuration(v){return parserModule?.parseDuration(v)||0;}
  function inferCdrFromFilename(name){return parserModule?.inferCdrFromFilename(name)||'';}
  function contactName(num){return identityModule?.contactName(num)||'';}
  function contactTag(num){return identityModule?.contactTag(num)||'';}
  function contactLabel(num){return identityModule?.contactLabel(num)||String(num??'');}
  function contactTitle(num){return identityModule?.contactTitle(num)||String(num??'');}
  function identityStore(kind){return identityModule?.identityStore(kind)||{};}
  function persistLocal(key,value){return identityModule?.persistLocal(key,value);}
  function updatePrivacyUi(){return identityModule?.updatePrivacyUi();}
  function phoneKey(v){return identityModule?.phoneKey(v)||'';}
  function samePhone(a,b){return identityModule?.samePhone(a,b)||false;}
  function serviceSenderType(v){return identityModule?.serviceSenderType(v)||'';}
  function isServiceSender(v){return identityModule?.isServiceSender(v)||false;}
  function senderServiceCategory(v){return identityModule?.senderServiceCategory(v)||'';}
  function senderBrandInfo(v){return identityModule?.senderBrandInfo(v)||null;}
  function smsRecordBasis(r){return identityModule?.smsRecordBasis(r)||'';}
  function isSmsRecord(r){return identityModule?.isSmsRecord(r)||false;}
  function smsIntelRows(){return identityModule?.smsIntelRows()||[];}
  function smsSenderIntelligence(data=smsIntelRows()){return identityModule?.smsSenderIntelligence(data)||{categories:[],brands:[],timeline:[],callWindowMin:0,idWindowMin:0};}
  function requestIdentifier(v){return identityModule?.requestIdentifier(v)||'';}
  function parseCdrDeviceMetadata(a,b){return identityModule?.parseCdrDeviceMetadata(a,b)||{manufacturer:'',model:'',deviceType:'',os:''};}
  function imeiDigits(v){return identityModule?.imeiDigits(v)||'';}
  function luhnValidImei(v){return identityModule?.luhnValidImei(v)??null;}
  function imeiStructure(v){return identityModule?.imeiStructure(v)||{format:'',tac:'',reportingBody:'',modelIdentifier:'',serial:'',checkDigit:'',svn:'',luhn:null};}
  function tacFromImei(v){return identityModule?.tacFromImei(v)||'';}
  function seedBuiltinTacMappings(){return identityModule?.seedBuiltinTacMappings();}
  function normalizeTacEntry(v){return identityModule?.normalizeTacEntry(v)||null;}
  function saveTacCache(){return identityModule?.saveTacCache();}
  function updateTacStatus(){return identityModule?.updateTacStatus();}
  function learnTacFromRecords(rows){return identityModule?.learnTacFromRecords(rows);}
  function resolveDevice(v){return identityModule?.resolveDevice(v)||{manufacturer:'',model:'',deviceType:'',os:'',status:'Unknown TAC'};}
  function tacField(r,names){return identityModule?.tacField(r,names)||'';}
  function importTacDatabase(file){return identityModule?.importTacDatabase(file);}
  function exportTacCache(){return identityModule?.exportTacCache();}
  function updateCdrRequestCount(){return identityModule?.updateCdrRequestCount();}
  function defaultCdrRequestDates(){return identityModule?.defaultCdrRequestDates();}

  function parseDateTime(dateVal,timeVal){return parserModule?.parseDateTime(dateVal,timeVal)||null;}
  function parseTime(v){return parserModule?.parseTime(v)||null;}
  function timeMins(v){return parserModule?.timeMins(v)??null;}
  function mapHeaders(headers){return parserModule?.mapHeaders(headers)||{};}
  function parseLatLong(v,link){return parserModule?.parseLatLong(v,link)||null;}
  function detectSheet(wb){return parserModule?.detectSheet(wb)||wb?.SheetNames?.[0]||'';}
  function parseFileOnMain(buffer){return parserModule?.parseFileOnMain(buffer);}
  function parseFileInWorker(file){return parserModule?.parseFileInWorker(file);}
  function loadFiles(files){return parserModule?.loadFiles(files);}

  function subjectEventScopedRecords(data=state.filtered){return filtersModule?.subjectEventScopedRecords(data)||data;}
  function installViewScopeToolbars(){return filtersModule?.installViewScopeToolbars();}
  function syncViewScopeControls(force=false){return filtersModule?.syncViewScopeControls(force);}
  function setSubjectEventScope(subject,eventType){return filtersModule?.setSubjectEventScope(subject,eventType);}
  function refreshSelectors(){return filtersModule?.refreshSelectors();}
  function matchesSmartQuery(r,q){return filtersModule?.matchesSmartQuery(r,q)??true;}
  function withinNight(mins,from,to){return filtersModule?.withinNight(mins,from,to)??true;}
  function activeFilterCount(){return filtersModule?.activeFilterCount()||0;}
  function updateFilterCount(){return filtersModule?.updateFilterCount();}
  function setFilterDrawer(open){return filtersModule?.setFilterDrawer(open);}
  function applyFilters(){return filtersModule?.applyFilters();}
  function resetFilters(){return filtersModule?.resetFilters();}

  function aggregateContacts(data=state.filtered){return dashboardModule?.aggregateContacts(data)||[];}
  function locationTowerKey(r){return dashboardModule?.locationTowerKey(r)||'';}
  function aggregateLocations(data=state.filtered){return dashboardModule?.aggregateLocations(data)||[];}
  function aggregateDevices(data=state.filtered){return dashboardModule?.aggregateDevices(data)||[];}

  function renderAll(){const active=document.querySelector('.tab.active')?.dataset.tab||'dashboard';if(active==='dashboard')renderDashboard();else if(active==='records')renderRecords();else if(active==='contacts')renderContacts();else if(active==='locations')renderLocations();else if(active==='devices')renderDevices();else if(active==='smsintel')renderSmsIntelligence();else if(active==='incident')renderIncident();else if(active==='days')renderDaySummary();else if(active==='patterns')renderPatterns();else if(active==='quality')renderDataQuality();else if(active==='movement')renderMovement();else if(active==='leads')renderLeads();else if(active==='network')requestAnimationFrame(renderNetwork);else if(active==='compare')renderCompare();else if(active==='chronology')renderChronology();else if(active==='flags')renderFlags();}
  function caseSnapshots(){return dashboardModule?.caseSnapshots()||[];}
  function renderCaseSnapshots(){return dashboardModule?.renderCaseSnapshots();}
  function saveCaseSnapshot(){return dashboardModule?.saveCaseSnapshot();}
  function renderDashboard(){return dashboardModule?.renderDashboard();}
  function simpleTable(headers,rows){return dashboardModule?.simpleTable(headers,rows)||'';}
  function newChart(id,config){return dashboardModule?.newChart(id,config);}
  function renderCharts(data,contacts){return dashboardModule?.renderCharts(data,contacts);}

  function jumpToRecord(rec){return recordsModule?.jumpToRecord(rec);}
  function renderRecords(){return recordsModule?.render();}
  function renderContacts(){return contactsModule?.render();}
  function selectRequestContacts(){
    for(const x of aggregateContacts()){const id=requestIdentifier(x.bparty);if(id)state.requestSelected.add(id);}
    renderContacts();showStatus(`${state.requestSelected.size} numeric contact(s) selected for CDR request.`,'ok');
  }
  function openCdrRequestGenerator(){
    if(!state.requestSelected.size){showStatus('Select at least one numeric contact for the CDR request.','error');return;}
    const from=$('cdrRequestFrom').value,to=$('cdrRequestTo').value;
    if(from&&to&&from>to){showStatus('CDR request From date cannot be later than To date.','error');return;}
    const entries=[];
    for(const number of state.requestSelected){
      const rows=state.records.filter(r=>requestIdentifier(r.bparty)===number),raw=rows[0]?.bparty||number;
      const relation=[contactTag(raw),contactName(raw)].filter(Boolean).join(' - ')||'CDR Contact';
      const dates=rows.filter(r=>r.dt).map(r=>r.dt).sort((a,b)=>a-b);
      entries.push({number,relation,fromDate:from||(dates.length?localDateKey(dates[0]):''),toDate:to||(dates.length?localDateKey(dates[dates.length-1]):'')});
    }
    const draft={version:1,source:'cdr-analyzer',createdAt:new Date().toISOString(),case:{title:$('caseTitle').value||'',caseNo:$('caseNo').value||'',station:$('station').value||'',analyst:$('analyst').value||''},entries};
    localStorage.setItem('cdrAnalyzer:requestDraftV1',JSON.stringify(draft));
    window.open('/policedocuments/cdr_request_generator.html?from=cdr-analyzer','_blank','noopener');
  }

  function renderContactProfile(num){return contactsModule?.renderProfile(num);}
  function mapLink(x){return locationsModule?.mapLink(x)||'';}
  function renderLocationMatchSubjects(){return locationsModule?.renderLocationMatchSubjects();}
  function locationPairEvents(data,windowMin){return locationsModule?.locationPairEvents(data,windowMin)||[];}
  function locationEpisodes(events,episodeGapMin){return locationsModule?.locationEpisodes(events,episodeGapMin)||[];}
  function multiSubjectSameCellMatches(data,subjects,windowMin){return locationsModule?.multiSubjectSameCellMatches(data,subjects,windowMin)||[];}
  function locationSharedSummary(episodes){return locationsModule?.locationSharedSummary(episodes)||[];}
  function renderLocationMatches(){return locationsModule?.renderLocationMatches();}
  function renderLocations(){return locationsModule?.renderLocations();}

  function analyzeIdentifiers(data=state.filtered){return devicesModule?.analyzeIdentifiers(data)||{byMsisdn:new Map(),byImsi:new Map(),byImei:new Map(),events:[],msisdnNewImsi:[],imsiNewImei:[],imeiMultiImsi:[],imsiCrossCdr:[],repeatedSwaps:[]};}
  function renderDevices(){return devicesModule?.renderDevices();}

  function movementDateRange(){return movementModule?.movementDateRange()||{from:'',to:'',valid:true};}
  function movementDateMatch(r){return movementModule?.movementDateMatch(r)??false;}
  function movementRows(){return movementModule?.movementRows()||[];}

  function renderSmsIntelligence(){return analysisModule?.renderSmsIntelligence();}
  function renderIncident(){return analysisModule?.renderIncident();}
  function renderDaySummary(){return analysisModule?.renderDaySummary();}
  function renderPatterns(){return analysisModule?.renderPatterns();}
  function renderDataQuality(){return analysisModule?.renderDataQuality();}
  function renderMovementMap(rows,attempt=0){return movementModule?.renderMovementMap(rows,attempt);}
  function updateMovementPlayback(i,openPopup=true,pan=true){return movementModule?.updateMovementPlayback(i,openPopup,pan);}
  function stopMovementPlayback(){return movementModule?.stopMovementPlayback();}
  function scheduleMovementPlayback(){return movementModule?.scheduleMovementPlayback();}
  function toggleMovementPlayback(){return movementModule?.toggleMovementPlayback();}
  function shiftLocalDateKey(key,days){return movementModule?.shiftLocalDateKey(key,days)||key;}
  function displayLocalDateKey(key){return movementModule?.displayLocalDateKey(key)||key||'—';}
  function nightStayAnalysis(){return movementModule?.nightStayAnalysis()||{rows:[],start:1200,end:360,wrap:true,recurring:null,totalEvents:0,distinctMain:0};}
  function renderMovement(){return movementModule?.renderMovement();}

  function findBursts(data,mins,minCount){return analysisModule?.findBursts(data,mins,minCount)||[];}
  function identifierUsage(cdr,field){return analysisModule?.identifierUsage(cdr,field)||[];}
  function deviceChangeDetailsHtml(cdr){return analysisModule?.deviceChangeDetailsHtml(cdr)||'';}
  function buildLeads(){return analysisModule?.buildLeads()||{high:[],p95:0,bursts:[],night:[],longCalls:[],cf:[],deviceChanges:[],identifierAnalysis:analyzeIdentifiers([]),roam:{},incident:[],inc:null};}
  function renderLeads(){return analysisModule?.renderLeads();}

  function renderNetwork(){return networkModule?.renderNetwork();}
  function colocationEvents(data=state.filtered,windowMin=30){return networkModule?.colocationEvents(data,windowMin)||[];}
  function colocationEpisodes(data=state.filtered,windowMin=30,episodeGapMin=60){return networkModule?.colocationEpisodes(data,windowMin,episodeGapMin)||[];}
  function colocationMatches(data=state.filtered,windowMin=30){return networkModule?.colocationMatches(data,windowMin)||[];}
  function renderCompare(){return networkModule?.renderCompare();}

  function renderFlags(){return caseModule?.renderFlags();}
  function renderChronology(){return caseModule?.renderChronology();}

  function switchTab(id){document.querySelectorAll('.view').forEach(v=>{v.setAttribute('role','tabpanel');v.classList.toggle('hidden',v.id!==id)});document.querySelectorAll('.tab').forEach(t=>{const active=t.dataset.tab===id;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));});if(id==='dashboard')renderDashboard();else if(id==='records')renderRecords();else if(id==='contacts')renderContacts();else if(id==='locations')renderLocations();else if(id==='devices')renderDevices();else if(id==='smsintel')renderSmsIntelligence();else if(id==='incident')renderIncident();else if(id==='days')renderDaySummary();else if(id==='patterns')renderPatterns();else if(id==='quality')renderDataQuality();else if(id==='movement'){requestAnimationFrame(()=>renderMovement());setTimeout(()=>movementModule?.invalidateMap(),300);}else if(id==='leads')renderLeads();else if(id==='network')requestAnimationFrame(renderNetwork);else if(id==='compare')renderCompare();else if(id==='relationship'){window.CDRRelationship?.render?.();}else if(id==='chronology')renderChronology();else if(id==='flags')renderFlags();}
  function contactFilter(num){$('bparty').value=num;applyFilters();switchTab('records');}
  function csvCell(v){return reportsModule?.csvCell(v)??String(v??'');}
  function download(name,text,type='text/plain;charset=utf-8'){return reportsModule?.download(name,text,type);}
  function exportCsv(records,name){return reportsModule?.exportCsv(records,name);}
  function exportWorkbook(){return reportsModule?.exportWorkbook();}

  function filterSnapshot(){return workspaceModule?.filterSnapshot()||{};}
  function applyFilterSnapshot(f){return workspaceModule?.applyFilterSnapshot(f);}
  function workspacePayload(){return workspaceModule?.workspacePayload()||{};}
  function saveWorkspace(){return workspaceModule?.saveWorkspace();}
  function restorePendingWorkspace(){return workspaceModule?.restorePendingWorkspace();}
  function loadWorkspaceObject(obj){return workspaceModule?.loadWorkspaceObject(obj);}
  function clearLoaded(){return workspaceModule?.clearLoaded();}
  function applyIncidentWindow(){return workspaceModule?.applyIncidentWindow();}

  function reportTable(headers,rows){return reportsModule?.reportTable(headers,rows)||'';}
  function reportSection(on,title,body){return reportsModule?.reportSection(on,title,body)||'';}
  function exportCaseReport(){return reportsModule?.exportCaseReport();}

  $('exportDirectoryBtn').onclick=()=>download('cdr_contact_directory.json',JSON.stringify({version:2,exportedAt:new Date().toISOString(),contactTags:state.globalContactTags,contactNames:state.globalContactNames},null,2),'application/json');
  $('importDirectoryBtn').onclick=()=>$('directoryInput').click();
  $('directoryInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());state.globalContactTags={...state.globalContactTags,...(d.contactTags||{})};state.globalContactNames={...state.globalContactNames,...(d.contactNames||{})};persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));renderAll();showStatus('Contact directory imported.','ok');}catch(err){showStatus('Directory import failed: '+err.message,'error');}e.target.value='';});
  identityModule=window.CDRIdentityFactory?.({
    $,state,normalize,analyzeIdentifiers,download,fmtInt,localDateKey,renderDevices,showStatus,
    subjectEventScopedRecords,timeMins,withinNight
  })||null;

  parserModule=window.CDRParserFactory?.({
    $,state,FIELDS,val,normalize,parseCdrDeviceMetadata,phoneKey,refreshSelectors,renderFileList,
    applyFilters,restorePendingWorkspace,showStatus,fmtInt
  })||null;
  parserModule?.bind();

  filtersModule=window.CDRFiltersFactory?.({
    $,state,normalize,contactLabel,contactTag,escAttr,escapeHtml,fillSelect,fmtInt,isServiceSender,
    renderAll,timeMins,uniq
  })||null;
  filtersModule?.bind();

  dashboardModule=window.CDRDashboardFactory?.({
    $,state,normalize,phoneKey,localDateKey,resolveDevice,persistLocal,escapeHtml,escAttr,fmtInt,fmtDur,
    dtFmt,dateFmt,contactLabel,parseTime,applyFilters,switchTab
  })||null;
  dashboardModule?.bind();

  recordsModule=window.CDRRecordsFactory?.({
    $,state,sortData,typePill,escapeHtml,escAttr,fmtInt,fmtDur,dtFmt,contactTitle,contactLabel,localDateKey,applyFilters,switchTab
  })||null;
  recordsModule?.bind();

  contactsModule=window.CDRContactsFactory?.({
    $,state,aggregateContacts,aggregateLocations,identityStore,defaultCdrRequestDates,updateCdrRequestCount,requestIdentifier,
    escAttr,escapeHtml,contactTitle,contactLabel,contactTag,serviceSenderType,fmtInt,fmtDur,dtFmt,simpleTable
  })||null;

  locationsModule=window.CDRLocationsFactory?.({
    $,state,uniq,escAttr,escapeHtml,localDateKey,locationTowerKey,fmtInt,dtFmt,aggregateLocations,fmtDur
  })||null;
  locationsModule?.bind();

  devicesModule=window.CDRDevicesFactory?.({
    $,state,learnTacFromRecords,updateTacStatus,aggregateDevices,fmtInt,escapeHtml,dtFmt,imeiStructure,resolveDevice
  })||null;

  movementModule=window.CDRMovementFactory?.({
    $,state,localDateKey,haversineKm,fmtInt,fmtDur,dtFmt,dateFmt,escapeHtml,escAttr,mapLink,newChart,
    incidentDateTime,contactLabel,showStatus,timeMins,withinNight
  })||null;
  movementModule?.bind();

  networkModule=window.CDRNetworkFactory?.({
    $,state,aggregateContacts,contactLabel,phoneKey,localDateKey,simpleTable,escapeHtml,escAttr,contactTitle,fmtInt,dtFmt,fmtDur
  })||null;
  networkModule?.bind();

  analysisModule=window.CDRAnalysisFactory?.({
    $,state,smsIntelRows,smsSenderIntelligence,senderBrandInfo,fmtInt,escapeHtml,dtFmt,
    incidentDateTime,subjectEventScopedRecords,localDateKey,aggregateContacts,simpleTable,
    escAttr,contactLabel,contactTitle,typePill,fmtDur,normalize,analyzeIdentifiers,percentile,
    setSubjectEventScope
  })||null;
  analysisModule?.bind();

  reportsModule=window.CDRReportsFactory?.({
    $,state,dtFmt,contactLabel,aggregateContacts,aggregateLocations,aggregateDevices,
    contactTag,serviceSenderType,imeiStructure,resolveDevice,analyzeIdentifiers,
    smsSenderIntelligence,movementRows,colocationEpisodes,incidentDateTime,showStatus,
    safeName,buildLeads,escapeHtml,fmtInt,fmtDur,localDateKey
  })||null;

  workspaceModule=window.CDRWorkspaceFactory?.({
    $,state,download,dtFmt,applyFilters,incidentDateTime,refreshSelectors,renderAll,renderFileList,
    safeName,showStatus,stableKey
  })||null;

  caseModule=window.CDRCaseFactory?.({
    $,state,subjectEventScopedRecords,dtFmt,escapeHtml,escAttr,contactTitle,contactLabel,fmtDur
  })||null;
  caseModule?.bind();

  $('privateSessionBtn').onclick=()=>{state.privateSession=!state.privateSession;updatePrivacyUi();showStatus(state.privateSession?'Private Session enabled. New local persistence is paused.':'Private Session disabled. Local persistence is enabled.','ok');};
  $('clearLocalDataBtn').onclick=()=>{if(!confirm('Clear locally saved CDR Analyzer case metadata, contact names/tags and case snapshots from this browser? Loaded CDR rows in the current session will remain open.'))return;for(const k of Object.keys(localStorage)){if(k.startsWith('cdrAnalyzer:'))localStorage.removeItem(k);}state.contactTags={};state.contactNames={};state.globalContactTags={};state.globalContactNames={};['caseTitle','caseNo','station','analyst','incidentDate','incidentTime','generalNote'].forEach(id=>{if($(id))$(id).value='';});renderCaseSnapshots();renderAll();showStatus('Local case data cleared from this browser.','ok');};
  installViewScopeToolbars();syncViewScopeControls(true);
    updatePrivacyUi();updateFilterCount();
  $('printBtn').onclick=()=>window.print();$('reportBtn').onclick=exportCaseReport;$('saveWorkspaceBtn').onclick=saveWorkspace;$('loadWorkspaceBtn').onclick=()=>$('workspaceInput').click();$('clearFilesBtn').onclick=clearLoaded;$('focusIncidentBtn').onclick=applyIncidentWindow;$('importTacBtn').onclick=()=>$('tacInput').click();
  $('exportTacBtn').onclick=exportTacCache;
  $('tacInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importTacDatabase(f);}catch(err){showStatus('TAC import failed: '+err.message,'error');}e.target.value='';});
  $('exportBtn').onclick=()=>exportCsv(state.filtered,`${safeName($('caseNo').value||$('caseTitle').value)}_filtered_cdr.csv`);$('exportFlagsBtn').onclick=()=>exportCsv(state.records.filter(r=>state.flags.has(r.id)),`${safeName($('caseNo').value||$('caseTitle').value)}_flagged_cdr.csv`);$('exportXlsxBtn').onclick=exportWorkbook;
  $('exportNotesBtn').onclick=()=>{const payload={case:{title:$('caseTitle').value,caseNo:$('caseNo').value,station:$('station').value,analyst:$('analyst').value},generalNote:$('generalNote').value,recordNotes:state.notes,flagged:[...state.flags]};download(`${safeName($('caseNo').value||$('caseTitle').value)}_notes.json`,JSON.stringify(payload,null,2),'application/json');};
  $('workspaceInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{loadWorkspaceObject(JSON.parse(await f.text()));}catch(err){showStatus('Workspace load failed: '+err.message,'error');}e.target.value='';});
  $('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)switchTab(b.dataset.tab)});$('tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...document.querySelectorAll('.tab')],cur=tabs.indexOf(document.activeElement);if(cur<0)return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(cur+1)%tabs.length:(cur-1+tabs.length)%tabs.length;tabs[n].focus();switchTab(tabs[n].dataset.tab);});document.addEventListener('click',e=>{const j=e.target.closest('[data-jump]');if(j)switchTab(j.dataset.jump);const lr=e.target.closest('.location-records-filter');if(lr){e.preventDefault();$('cellId').value=lr.dataset.cell||'';$('tower').value=lr.dataset.tower||'';$('operator').value=lr.dataset.operator||'';applyFilters();switchTab('records');}const lm=e.target.closest('.location-movement');if(lm){e.preventDefault();$('cdrNo').value=lm.dataset.subject||'';$('cellId').value='';$('tower').value='';$('operator').value='';applyFilters();syncViewScopeControls(false);if($('movementCdr'))$('movementCdr').value=lm.dataset.subject||'';switchTab('movement');}const dl=e.target.closest('.dashboard-location-filter');if(dl){e.preventDefault();$('cellId').value=dl.dataset.cell||'';$('tower').value=dl.dataset.tower||'';applyFilters();switchTab('records');}const dd=e.target.closest('.dashboard-device-filter');if(dd){e.preventDefault();$('imei').value=dd.dataset.imei||'';$('imsi').value=dd.dataset.imsi||'';applyFilters();switchTab('devices');}const c=e.target.closest('.contact-filter');if(c){e.preventDefault();contactFilter(c.dataset.num);}const f=e.target.closest('.flag-btn');if(f){const id=f.dataset.id;state.flags.has(id)?state.flags.delete(id):state.flags.add(id);renderRecords();renderFlags();}const u=e.target.closest('.unflag');if(u){state.flags.delete(u.dataset.id);renderRecords();renderFlags();}const cp=e.target.closest('.contact-profile-btn');if(cp){e.preventDefault();renderContactProfile(cp.dataset.num);$('contactProfilePanel').scrollIntoView({behavior:'smooth',block:'start'});}const lcr=e.target.closest('.lead-contact-records');if(lcr){e.preventDefault();contactFilter(lcr.dataset.num);}const lvr=e.target.closest('.lead-view-record');if(lvr){e.preventDefault();jumpToRecord(state.records.find(r=>r.id===lvr.dataset.id));}const fl=e.target.closest('.contact-first-last');if(fl){const rr=state.records.filter(r=>samePhone(r.bparty,fl.dataset.num)&&r.dt).sort((a,b)=>a.dt-b.dt);jumpToRecord(fl.dataset.which==='last'?rr[rr.length-1]:rr[0]);}const cs=e.target.closest('.load-case-snapshot');if(cs){const x=caseSnapshots()[+cs.dataset.i];if(x){$('caseTitle').value=x.title||'';$('caseNo').value=x.caseNo||'';$('station').value=x.station||'';$('analyst').value=x.analyst||'';$('incidentDate').value=x.incidentDate||'';$('incidentTime').value=x.incidentTime||'';renderIncident();}}const cd=e.target.closest('.delete-case-snapshot');if(cd){const rows=caseSnapshots();rows.splice(+cd.dataset.i,1);persistLocal('cdrAnalyzer:caseSnapshots',JSON.stringify(rows));renderCaseSnapshots();}const df=e.target.closest('.day-filter');if(df){$('dateFrom').value=df.dataset.date;$('dateTo').value=df.dataset.date;applyFilters();switchTab('records');}const ph=e.target.closest('.pattern-hour-filter');if(ph){const h=String(+ph.dataset.hour).padStart(2,'0');$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const phd=e.target.closest('.pattern-hour-date-filter');if(phd){const h=String(+phd.dataset.hour).padStart(2,'0');$('dateFrom').value=phd.dataset.date;$('dateTo').value=phd.dataset.date;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pch=e.target.closest('.pattern-contact-hour-filter');if(pch){const h=String(+pch.dataset.hour).padStart(2,'0');$('bparty').value=pch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pwch=e.target.closest('.pattern-weekday-contact-hour-filter');if(pwch){const h=String(+pwch.dataset.hour).padStart(2,'0'),w=+pwch.dataset.weekday;$('bparty').value=pwch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();state.filtered=state.filtered.filter(r=>r.dt&&r.dt.getDay()===w);state.page=1;switchTab('records');showStatus('Showing '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][w]+' records for '+contactLabel(pwch.dataset.num)+' during '+h+':00–'+h+':59.','ok');}const ns=e.target.closest('.night-stay-filter');if(ns){e.preventDefault();const startKey=ns.dataset.night,endKey=shiftLocalDateKey(startKey,1);$('cdrNo').value=ns.dataset.subject||'';$('dateFrom').value=startKey;$('dateTo').value=(timeMins($('nightFrom').value)>timeMins($('nightTo').value))?endKey:startKey;$('nightOnly').checked=true;$('cellId').value='';$('tower').value='';if(ns.dataset.cell)$('cellId').value=ns.dataset.cell;else if(ns.dataset.tower)$('tower').value=ns.dataset.tower;applyFilters();switchTab('records');showStatus('Showing records for the selected subject, night window and main recorded tower.','ok');}const ac=e.target.closest('.add-chronology');if(ac){const r=state.records.find(x=>x.id===ac.dataset.id);if(r&&!state.chronology.some(x=>x.recordId===r.id)){state.chronology.push({id:'r'+r.id,recordId:r.id,time:+(r.dt||new Date()),source:'CDR',text:`${contactLabel(r.bparty)} • ${r.callType} • ${fmtDur(r.duration)}`,reference:`${r.sourceFile} / ${r.sourceSheet} / row ${r.rowNumber}`});}switchTab('chronology');}const rc=e.target.closest('.remove-chronology');if(rc){state.chronology=state.chronology.filter(x=>x.id!==rc.dataset.id);renderChronology();}const rm=e.target.closest('[data-remove-file]');if(rm){const id=+rm.dataset.removeFile;state.records=state.records.filter(r=>r.fileId!==id);state.files=state.files.filter(f=>f.id!==id);refreshSelectors();renderFileList();applyFilters();showStatus('File removed from this browser session.','ok');}});
  $('selectRequestContactsBtn').onclick=selectRequestContacts;
  $('clearRequestContactsBtn').onclick=()=>{state.requestSelected.clear();renderContacts();};
  $('openCdrRequestBtn').onclick=openCdrRequestGenerator;
  $('identityScope').onchange=renderContacts;
  $('contactsTable').addEventListener('change',e=>{
    if(e.target.classList.contains('cdr-request-check')){e.target.checked?state.requestSelected.add(e.target.dataset.num):state.requestSelected.delete(e.target.dataset.num);updateCdrRequestCount();return;}
    if(e.target.classList.contains('contact-tag')){
      const v=e.target.value==='Unclassified'?'':e.target.value,store=identityStore('tag');store[e.target.dataset.num]=v;
      if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
      renderContacts();
    }
    if(e.target.classList.contains('contact-name')){
      const store=identityStore('name');store[e.target.dataset.num]=e.target.value.trim();
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
  ['caseTitle','caseNo','station','analyst','incidentDate','incidentTime','incidentWindowHours','generalNote'].forEach(id=>{const el=$(id);const key='cdrAnalyzer:'+id;el.value=localStorage.getItem(key)||'';el.addEventListener('input',()=>persistLocal(key,el.value));});
  document.querySelectorAll('.view').forEach(v=>v.setAttribute('role','tabpanel'));document.querySelectorAll('.tab').forEach(t=>t.setAttribute('tabindex',t.classList.contains('active')?'0':'-1'));
  if(typeof XLSX==='undefined')showStatus('The local XLSX library did not load. Refresh the analyzer files.','error');
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/cdranalysis/sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});}
  window.CDRApp={
    getRecords:()=>state.records,
    getFilteredRecords:()=>state.filtered,
    currentSubject:()=>$('cdrNo')?.value||'',
    formatDateTime:dtFmt,
    formatDuration:fmtDur,
    contactLabel,
    switchTab,
    openPairRecords:(subject,other)=>{if($('cdrNo'))$('cdrNo').value=subject||'';if($('bparty'))$('bparty').value=other||'';applyFilters();switchTab('records');},
    refresh:()=>{refreshSelectors();applyFilters();}
  };
  renderAll();
  window.dispatchEvent(new Event('cdr:updated'));
})();
