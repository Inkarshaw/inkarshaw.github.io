(() => {
  'use strict';
  const {
    $,state,FIELDS,normalize,escapeHtml,fmtInt,fmtDur,dateFmt,dtFmt,val,stableKey,localDateKey,
    haversineKm,percentile,incidentDateTime,escAttr,showStatus,renderFileList,uniq,fillSelect,
    sortData,typePill,safeName
  }=window.CDRCore;
  let identityModule=null, parserModule=null, filtersModule=null, dashboardModule=null, recordsModule=null, contactsModule=null, locationsModule=null, devicesModule=null, movementModule=null, networkModule=null, analysisModule=null, reportsModule=null, workspaceModule=null, caseModule=null, uiModule=null;
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
  function selectRequestContacts(){return contactsModule?.selectRequestContacts();}
  function openCdrRequestGenerator(){return contactsModule?.openCdrRequestGenerator();}

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
    escAttr,escapeHtml,contactTitle,contactLabel,contactTag,contactName,serviceSenderType,fmtInt,fmtDur,dtFmt,simpleTable,
    showStatus,localDateKey
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
  uiModule=window.CDRUIFactory?.({
    $,state,updatePrivacyUi,showStatus,renderCaseSnapshots,renderAll,installViewScopeToolbars,
    syncViewScopeControls,updateFilterCount,exportCaseReport,saveWorkspace,loadWorkspaceObject,
    clearLoaded,applyIncidentWindow,exportTacCache,importTacDatabase,exportCsv,safeName,
    exportWorkbook,download,switchTab,applyFilters,refreshSelectors,renderFileList,renderRecords,
    renderFlags,renderContactProfile,jumpToRecord,samePhone,contactFilter,caseSnapshots,persistLocal,
    renderIncident,contactLabel,timeMins,shiftLocalDateKey,fmtDur,renderChronology,
    selectRequestContacts,renderContacts,openCdrRequestGenerator,updateCdrRequestCount,
    identityStore,renderNetwork,seedBuiltinTacMappings
  })||null;
  uiModule?.bind();

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
