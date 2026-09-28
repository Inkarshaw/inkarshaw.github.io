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
    const backup={records:state.records,filtered:state.filtered,analysisMode:state.analysisMode,indexes:state.indexes};
    try{
      const dt=new Date('2026-09-29T10:00:00+05:30');
      const mk=(id,subject,bparty,mins,cell)=>({id,cdrNo:subject,bparty,bpartyKey:String(bparty).replace(/\D/g,'').slice(-10),dt:new Date(+dt+mins*60000),duration:30,callType:'Outgoing Call',firstCellId:cell,firstAddress:'Test Tower',imei:'123456789012345',imsi:'404000000000001',operator:'TEST',sourceFile:'synthetic.xlsx',sourceSheet:'CDR',rowNumber:+id||1});
      const r1=mk('1','9000000001','9000000002',0,'A'),r2={...r1,id:'2',rowNumber:2},r3=mk('3','9000000001','9000000003',5,'B'),r4=mk('4','9000000004','9000000002',7,'A');
      state.records=[r1,r2,r3,r4];state.analysisMode='unique';core.rebuildIndexes();
      const unique=core.analysisRecords();
      checks.push({type:'functional',name:'Duplicate-safe dataset excludes repeated signature',ok:unique.length===3});
      checks.push({type:'functional',name:'Subject index returns expected rows',ok:core.getIndex('bySubject','9000000001').length===2});
      checks.push({type:'functional',name:'B-party index returns cross-subject rows',ok:core.getIndex('byBparty','9000000002').length===2});
      checks.push({type:'functional',name:'CDRApp respects analysis dataset mode',ok:window.CDRApp?.getRecords?.().length===3});
      checks.push({type:'functional',name:'Duplicate signature is stable',ok:core.duplicateSignature(r1)===core.duplicateSignature(r2)});
      checks.push({type:'functional',name:'Source timezone parser helper produces valid Date',ok:!isNaN(core.dateFromSourceParts(2026,8,29,10,0,0,'Asia/Kolkata'))});
    }catch(err){
      checks.push({type:'functional',name:'Synthetic workflow exception: '+(err?.message||err),ok:false});
    }finally{
      state.records=backup.records;state.filtered=backup.filtered;state.analysisMode=backup.analysisMode;state.indexes=backup.indexes;
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