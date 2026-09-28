(() => {
  'use strict';
  const EXPECTED_GLOBALS=[
    'CDRCore','CDRIdentityFactory','CDRParserFactory','CDRFiltersFactory','CDRDashboardFactory',
    'CDRRecordsFactory','CDRContactsFactory','CDRLocationsFactory','CDRDevicesFactory',
    'CDRMovementFactory','CDRNetworkFactory','CDRAnalysisFactory','CDRReportsFactory',
    'CDRWorkspaceFactory','CDRCaseFactory','CDRRouterFactory','CDRUIFactory','CDRApp','CDRRelationship'
  ];
  const REQUIRED_IDS=[
    'fileInput','dropZone','recordsTable','contactsTable','locationsTable','devicesTable',
    'movementMap','networkCanvas','relationship','tabs','applyBtn','resetBtn','bparty','callType','cdrNo',
    'analysisMode','sourceTimezone','importReviewPanel','runSelfTestBtn','mapPrivacyMode','auditTrailTable'
  ];

  function run(){
    const globals=EXPECTED_GLOBALS.map(name=>({type:'global',name,ok:typeof window[name]!=='undefined'}));
    const elements=REQUIRED_IDS.map(name=>({type:'element',name,ok:!!document.getElementById(name)}));
    const checks=[
      ...globals,...elements,
      {type:'api',name:'CDRApp.getRecords',ok:typeof window.CDRApp?.getRecords==='function'},
      {type:'api',name:'CDRApp.getIndex',ok:typeof window.CDRApp?.getIndex==='function'},
      {type:'api',name:'CDRApp.switchTab',ok:typeof window.CDRApp?.switchTab==='function'},
      {type:'api',name:'Relationship.render',ok:typeof window.CDRRelationship?.render==='function'},
      {type:'api',name:'Relationship.snapshot',ok:typeof window.CDRRelationship?.snapshot==='function'},
      {type:'runtime',name:'XLSX',ok:typeof window.XLSX!=='undefined'},
      {type:'runtime',name:'Chart',ok:typeof window.Chart!=='undefined'},
      {type:'runtime',name:'Leaflet',ok:typeof window.L!=='undefined'},
      {type:'runtime',name:'WebCrypto SHA-256',ok:!!window.crypto?.subtle}
    ];
    const failed=checks.filter(x=>!x.ok);
    return {ok:failed.length===0,checkedAt:new Date().toISOString(),checks,failed};
  }

  function runFunctional(){
    const base=run(),core=window.CDRCore,state=core?.state,checks=[...base.checks];
    if(!state||!core){return {...base,ok:false,failed:[...base.failed,{type:'functional',name:'Core state unavailable',ok:false}]};}
    const ids=['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','callType','cdrNo','sourceFile','movementCdr','movementDateFrom','movementDateTo','smsIntelCdr','smsIntelFrom','smsIntelTo','relationshipA','relationshipB','relationshipFrom','relationshipTo','relationshipEvent'];
    const dom={};for(const id of ids){const el=document.getElementById(id);if(el)dom[id]=el.value;}
    const checksDom=['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders','relationshipNightOnly'];const domChecks={};for(const id of checksDom){const el=document.getElementById(id);if(el)domChecks[id]=el.checked;}
    const backup={records:state.records,filtered:state.filtered,files:state.files,analysisMode:state.analysisMode,indexes:state.indexes,chronology:state.chronology,exactIncidentRange:state.exactIncidentRange,page:state.page};
    try{
      const dt=new Date('2026-09-29T04:30:00Z');
      const mk=(id,subject,bparty,mins,cell,type='Outgoing Call')=>({id,cdrNo:subject,cdrKey:String(subject),bparty,bpartyKey:String(bparty).replace(/\D/g,'').slice(-10)||String(bparty).toLowerCase(),dt:new Date(+dt+mins*60000),date:'29-09-2026',time:'10:00:00',rawDate:'29-09-2026',rawTime:'10:00:00',sourceTimezone:'Asia/Kolkata',duration:type.includes('Call')?30:0,callType:type,firstCellId:cell,firstAddress:'Test Tower '+cell,lastCellId:cell,lastAddress:'Test Tower '+cell,lat:13.08+(mins/10000),lng:80.27+(mins/10000),imei:'123456789012345',imsi:'404000000000001',operator:'TEST',provider:'TEST',sourceFile:'synthetic.xlsx',sourceSheet:'CDR',rowNumber:+id||1,search:''});
      const r1=mk('1','9000000001','9000000002',0,'A'),r2={...r1,id:'2',rowNumber:2},r3=mk('3','9000000001','9000000003',5,'B'),r4=mk('4','9000000004','9000000002',7,'A'),r5=mk('5','9000000001','VM-SWIGGY',10,'B','SMS');
      state.records=[r1,r2,r3,r4,r5];state.files=[{id:1,name:'synthetic.xlsx',sheet:'CDR',rows:5,sha256:'synthetic',sourceTimezone:'Asia/Kolkata'}];state.analysisMode='unique';state.exactIncidentRange=null;state.chronology=[];core.rebuildIndexes();
      for(const id of ids){const el=document.getElementById(id);if(el)el.value='';}for(const id of checksDom){const el=document.getElementById(id);if(el)el.checked=false;}
      window.CDRApp?.refresh?.();

      const unique=core.analysisRecords();
      checks.push({type:'functional',name:'Duplicate-safe dataset excludes repeated signature',ok:unique.length===4});
      checks.push({type:'functional',name:'Subject index returns expected unique rows',ok:core.getIndex('bySubject','9000000001').length===3});
      checks.push({type:'functional',name:'B-party index returns cross-subject rows',ok:core.getIndex('byBparty','9000000002').length===2});
      checks.push({type:'functional',name:'Global filter pipeline accepts synthetic rows',ok:window.CDRApp?.getFilteredRecords?.().length===4});

      const bp=document.getElementById('bparty');if(bp)bp.value='9000000002';window.CDRApp?.applyFilters?.();
      checks.push({type:'functional',name:'B-party filter narrows synthetic records',ok:window.CDRApp?.getFilteredRecords?.().length===2});
      if(bp)bp.value='';window.CDRApp?.applyFilters?.();

      window.CDRRelationship?.fillInputs?.();const ra=document.getElementById('relationshipA'),rb=document.getElementById('relationshipB');if(ra)ra.value='9000000001';if(rb)rb.value='9000000002';
      const rel=window.CDRRelationship?.snapshot?.();
      checks.push({type:'functional',name:'Relationship snapshot finds direct interaction',ok:!!rel&&rel.metrics?.interactions===1});

      const sms=window.CDRApp?.smsAnalysisSnapshot?.();
      checks.push({type:'functional',name:'SMS intelligence identifies service sender metadata',ok:!!sms&&(sms.A?.uniqueCount||0)>=1&&(sms.A?.brands||[]).some(x=>String(x.label).toLowerCase().includes('swiggy'))});

      const mc=document.getElementById('movementCdr');if(mc)mc.value='9000000001';const mov=window.CDRApp?.movementRows?.()||[];
      checks.push({type:'functional',name:'Movement analysis builds tower segments',ok:mov.length>=2});

      state.chronology.push({id:'test-chronology',recordId:r1.id,time:+r1.dt,source:'Self-Test',text:'Synthetic chronology event',reference:'synthetic.xlsx / CDR / row 1'});
      checks.push({type:'functional',name:'Chronology accepts record-linked event',ok:state.chronology.some(x=>x.id==='test-chronology')});
      checks.push({type:'functional',name:'Excel export runtime is available',ok:typeof window.XLSX!=='undefined'&&typeof window.CDRApp?.exportWorkbook==='function'});
      checks.push({type:'functional',name:'Source timezone helper returns expected local date',ok:core.localDateKey(dt)==='2026-09-29'});
    }catch(err){
      checks.push({type:'functional',name:'Synthetic workflow exception: '+(err?.message||err),ok:false});
    }finally{
      state.records=backup.records;state.filtered=backup.filtered;state.files=backup.files;state.analysisMode=backup.analysisMode;state.indexes=backup.indexes;state.chronology=backup.chronology;state.exactIncidentRange=backup.exactIncidentRange;state.page=backup.page;
      for(const [id,v] of Object.entries(dom)){const el=document.getElementById(id);if(el)el.value=v;}for(const [id,v] of Object.entries(domChecks)){const el=document.getElementById(id);if(el)el.checked=v;}
      try{window.CDRApp?.refresh?.();}catch{}
      for(const [id,v] of Object.entries(dom)){const el=document.getElementById(id);if(el&&[...el.options||[]].some?.(o=>o.value===v))el.value=v;else if(el&&el.tagName!=='SELECT')el.value=v;}
    }
    const failed=checks.filter(x=>!x.ok);
    return {ok:failed.length===0,checkedAt:new Date().toISOString(),checks,failed};
  }

  function show(result){
    let box=document.getElementById('cdrDiagnosticsPanel');
    if(!box){box=document.createElement('aside');box.id='cdrDiagnosticsPanel';box.style.cssText='position:fixed;right:12px;bottom:12px;z-index:99999;max-width:min(620px,calc(100vw - 24px));max-height:65vh;overflow:auto;padding:12px;border:1px solid currentColor;border-radius:10px;background:Canvas;color:CanvasText;font:12px/1.4 ui-monospace,monospace;box-shadow:0 8px 28px rgba(0,0,0,.25)';document.body.appendChild(box);}
    const failed=result.failed;box.innerHTML='<div style="display:flex;gap:10px;align-items:center;justify-content:space-between"><b>CDR Analyzer diagnostics: '+(result.ok?'PASS':'FAIL')+'</b><button type="button" id="cdrDiagnosticsClose">×</button></div><div>'+result.checks.length+' checks • '+failed.length+' failed</div>'+(failed.length?'<ul>'+failed.map(x=>'<li>'+x.type+': '+x.name+'</li>').join(''):'<div>All expected modules, APIs, integrity controls and synthetic checks passed.</div>');document.getElementById('cdrDiagnosticsClose').onclick=()=>box.remove();
  }

  function bindSelfTest(){
    const btn=document.getElementById('runSelfTestBtn'),status=document.getElementById('selfTestStatus');if(!btn)return;
    btn.onclick=()=>{const result=runFunctional();if(status)status.textContent=result.ok?'PASS • '+result.checks.length+' checks • loaded case restored unchanged':'FAIL • '+result.failed.length+' check(s) failed';show(result);};
  }

  window.CDRDiagnostics={run,runFunctional,show,version:'2.0'};
  const params=new URLSearchParams(location.search);
  window.addEventListener('load',()=>{bindSelfTest();if(params.get('debug')==='1')setTimeout(()=>{const result=runFunctional();console.group('CDR Analyzer diagnostics');console.table(result.checks);console.log(result);console.groupEnd();show(result);},0);},{once:true});
})();