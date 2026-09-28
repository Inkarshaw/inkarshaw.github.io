(() => {
  'use strict';
  const {
    $,state,FIELDS,normalize,escapeHtml,fmtInt,fmtDur,dateFmt,dtFmt,val,stableKey,localDateKey,
    haversineKm,percentile,incidentDateTime,escAttr,showStatus,renderFileList,uniq,fillSelect,
    sortData,typePill,safeName
  }=window.CDRCore;
  let identityModule=null, parserModule=null, filtersModule=null, dashboardModule=null, recordsModule=null, contactsModule=null, locationsModule=null, devicesModule=null, movementModule=null, networkModule=null, analysisModule=null, reportsModule=null, workspaceModule=null, caseModule=null, routerModule=null, uiModule=null;
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
  function senderBrandInfo(v){return identityModule?.senderBrandInfo(v)||null;}
  function getSmsSenderOverride(v){return identityModule?.getSmsSenderOverride(v)||null;}
  function setSmsSenderOverride(v,patch){return identityModule?.setSmsSenderOverride(v,patch)||null;}
  function clearSmsSenderOverride(v){return identityModule?.clearSmsSenderOverride(v)||false;}
  function smsIntelRows(){return identityModule?.smsIntelRows()||[];}
  function smsSenderIntelligence(data=smsIntelRows()){return identityModule?.smsSenderIntelligence(data)||{categories:[],brands:[],timeline:[],callWindowMin:0,idWindowMin:0};}
  function requestIdentifier(v){return identityModule?.requestIdentifier(v)||'';}
  function parseCdrDeviceMetadata(a,b){return identityModule?.parseCdrDeviceMetadata(a,b)||{manufacturer:'',model:'',deviceType:'',os:''};}
  function imeiStructure(v){return identityModule?.imeiStructure(v)||{format:'',tac:'',reportingBody:'',modelIdentifier:'',serial:'',checkDigit:'',svn:'',luhn:null};}
  function seedBuiltinTacMappings(){return identityModule?.seedBuiltinTacMappings();}
  function updateTacStatus(){return identityModule?.updateTacStatus();}
  function learnTacFromRecords(rows){return identityModule?.learnTacFromRecords(rows);}
  function resolveDevice(v){return identityModule?.resolveDevice(v)||{manufacturer:'',model:'',deviceType:'',os:'',status:'Unknown TAC'};}
  function importTacDatabase(file){return identityModule?.importTacDatabase(file);}
  function exportTacCache(){return identityModule?.exportTacCache();}
  function updateCdrRequestCount(){return identityModule?.updateCdrRequestCount();}
  function defaultCdrRequestDates(){return identityModule?.defaultCdrRequestDates();}

  function parseTime(v){return parserModule?.parseTime(v)||null;}
  function timeMins(v){return parserModule?.timeMins(v)??null;}

  function subjectEventScopedRecords(data=state.filtered){return filtersModule?.subjectEventScopedRecords(data)||data;}
  function installViewScopeToolbars(){return filtersModule?.installViewScopeToolbars();}
  function syncViewScopeControls(force=false){return filtersModule?.syncViewScopeControls(force);}
  function setSubjectEventScope(subject,eventType){return filtersModule?.setSubjectEventScope(subject,eventType);}
  function refreshSelectors(){return filtersModule?.refreshSelectors();}
  function withinNight(mins,from,to){return filtersModule?.withinNight(mins,from,to)??true;}
  function updateFilterCount(){return filtersModule?.updateFilterCount();}
  function applyFilters(){return filtersModule?.applyFilters();}

  function aggregateContacts(data=state.filtered){return dashboardModule?.aggregateContacts(data)||[];}
  function locationTowerKey(r){return dashboardModule?.locationTowerKey(r)||'';}
  function aggregateLocations(data=state.filtered){return dashboardModule?.aggregateLocations(data)||[];}
  function aggregateDevices(data=state.filtered){return dashboardModule?.aggregateDevices(data)||[];}

  function renderAll(){return routerModule?.renderAll();}
  function caseSnapshots(){return dashboardModule?.caseSnapshots()||[];}
  function renderCaseSnapshots(){return dashboardModule?.renderCaseSnapshots();}
  function renderDashboard(){return dashboardModule?.renderDashboard();}
  function simpleTable(headers,rows){return dashboardModule?.simpleTable(headers,rows)||'';}
  function newChart(id,config){return dashboardModule?.newChart(id,config);}

  function jumpToRecord(rec){return recordsModule?.jumpToRecord(rec);}
  function renderRecords(){return recordsModule?.render();}
  function renderContacts(){return contactsModule?.render();}
  function selectRequestContacts(){return contactsModule?.selectRequestContacts();}
  function openCdrRequestGenerator(){return contactsModule?.openCdrRequestGenerator();}

  function mapLink(x){return locationsModule?.mapLink(x)||'';}
  function locationEpisodes(events,episodeGapMin){return locationsModule?.locationEpisodes(events,episodeGapMin)||[];}
  function renderLocations(){return locationsModule?.renderLocations();}

  function analyzeIdentifiers(data=state.filtered){return devicesModule?.analyzeIdentifiers(data)||{byMsisdn:new Map(),byImsi:new Map(),byImei:new Map(),events:[],msisdnNewImsi:[],imsiNewImei:[],imeiMultiImsi:[],imsiCrossCdr:[],repeatedSwaps:[]};}
  function renderDevices(){return devicesModule?.renderDevices();}

  function movementRows(){return movementModule?.movementRows()||[];}

  function renderSmsIntelligence(){return analysisModule?.renderSmsIntelligence();}
  function renderIncident(){return analysisModule?.renderIncident();}
  function renderDaySummary(){return analysisModule?.renderDaySummary();}
  function renderPatterns(){return analysisModule?.renderPatterns();}
  function renderDataQuality(){return analysisModule?.renderDataQuality();}
  function shiftLocalDateKey(key,days){return movementModule?.shiftLocalDateKey(key,days)||key;}
  function renderMovement(){return movementModule?.renderMovement();}

  function buildLeads(){return analysisModule?.buildLeads()||{high:[],p95:0,bursts:[],night:[],longCalls:[],cf:[],deviceChanges:[],identifierAnalysis:analyzeIdentifiers([]),roam:{},incident:[],inc:null};}
  function renderLeads(){return analysisModule?.renderLeads();}

  function renderNetwork(){return networkModule?.renderNetwork();}
  function colocationEpisodes(data=state.filtered,windowMin=30,episodeGapMin=60){return networkModule?.colocationEpisodes(data,windowMin,episodeGapMin)||[];}
  function renderCompare(){return networkModule?.renderCompare();}

  function renderFlags(){return caseModule?.renderFlags();}
  function renderChronology(){return caseModule?.renderChronology();}

  function switchTab(id){return routerModule?.switchTab(id);}
  function contactFilter(num){return routerModule?.contactFilter(num);}
  function download(name,text,type='text/plain;charset=utf-8'){return reportsModule?.download(name,text,type);}
  function exportCsv(records,name){return reportsModule?.exportCsv(records,name);}
  function exportWorkbook(){return reportsModule?.exportWorkbook();}

  function saveWorkspace(){return workspaceModule?.saveWorkspace();}
  function restorePendingWorkspace(){return workspaceModule?.restorePendingWorkspace();}
  function loadWorkspaceObject(obj){return workspaceModule?.loadWorkspaceObject(obj);}
  function clearLoaded(){return workspaceModule?.clearLoaded();}
  function applyIncidentWindow(){return workspaceModule?.applyIncidentWindow();}

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
    $,state,smsIntelRows,smsSenderIntelligence,senderBrandInfo,getSmsSenderOverride,setSmsSenderOverride,clearSmsSenderOverride,fmtInt,escapeHtml,dtFmt,
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
  routerModule=window.CDRRouterFactory?.({
    $,applyFilters,renderDashboard,renderRecords,renderContacts,renderLocations,renderDevices,
    renderSmsIntelligence,renderIncident,renderDaySummary,renderPatterns,renderDataQuality,
    renderMovement,invalidateMovementMap:()=>movementModule?.invalidateMap(),renderLeads,
    renderNetwork,renderCompare,renderChronology,renderFlags
  })||null;

  uiModule=window.CDRUIFactory?.({
    $,state,updatePrivacyUi,showStatus,renderCaseSnapshots,renderAll,installViewScopeToolbars,
    syncViewScopeControls,updateFilterCount,exportCaseReport,saveWorkspace,loadWorkspaceObject,
    clearLoaded,applyIncidentWindow,exportTacCache,importTacDatabase,exportCsv,safeName,
    exportWorkbook,download,switchTab,applyFilters,refreshSelectors,renderFileList,renderRecords,
    renderFlags,renderContactProfile:num=>contactsModule?.renderProfile(num),jumpToRecord,samePhone,contactFilter,caseSnapshots,persistLocal,
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
    senderBrandInfo,getSmsSenderOverride,setSmsSenderOverride,clearSmsSenderOverride,
    switchTab,
    openPairRecords:(subject,other)=>{if($('cdrNo'))$('cdrNo').value=subject||'';if($('bparty'))$('bparty').value=other||'';applyFilters();switchTab('records');},
    refresh:()=>{refreshSelectors();applyFilters();}
  };
  renderAll();
  window.dispatchEvent(new Event('cdr:updated'));
})();
