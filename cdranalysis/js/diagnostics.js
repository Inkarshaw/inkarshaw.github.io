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
    'movementMap','networkCanvas','relationship','tabs','applyBtn','resetBtn','bparty','callType','cdrNo'
  ];

  function run(){
    const globals=EXPECTED_GLOBALS.map(name=>({type:'global',name,ok:typeof window[name]!=='undefined'}));
    const elements=REQUIRED_IDS.map(name=>({type:'element',name,ok:!!document.getElementById(name)}));
    const checks=[
      ...globals,
      ...elements,
      {type:'api',name:'CDRApp.getRecords',ok:typeof window.CDRApp?.getRecords==='function'},
      {type:'api',name:'CDRApp.switchTab',ok:typeof window.CDRApp?.switchTab==='function'},
      {type:'api',name:'Relationship.render',ok:typeof window.CDRRelationship?.render==='function'},
      {type:'runtime',name:'XLSX',ok:typeof window.XLSX!=='undefined'},
      {type:'runtime',name:'Chart',ok:typeof window.Chart!=='undefined'},
      {type:'runtime',name:'Leaflet',ok:typeof window.L!=='undefined'}
    ];
    const failed=checks.filter(x=>!x.ok);
    return {ok:failed.length===0,checkedAt:new Date().toISOString(),checks,failed};
  }

  function show(result){
    let box=document.getElementById('cdrDiagnosticsPanel');
    if(!box){
      box=document.createElement('aside');
      box.id='cdrDiagnosticsPanel';
      box.style.cssText='position:fixed;right:12px;bottom:12px;z-index:99999;max-width:min(520px,calc(100vw - 24px));max-height:55vh;overflow:auto;padding:12px;border:1px solid currentColor;border-radius:10px;background:Canvas;color:CanvasText;font:12px/1.4 ui-monospace,monospace;box-shadow:0 8px 28px rgba(0,0,0,.25)';
      document.body.appendChild(box);
    }
    const failed=result.failed;
    box.innerHTML='<div style="display:flex;gap:10px;align-items:center;justify-content:space-between"><b>CDR Analyzer diagnostics: '+(result.ok?'PASS':'FAIL')+'</b><button type="button" id="cdrDiagnosticsClose">×</button></div>'
      +'<div>'+result.checks.length+' checks • '+failed.length+' failed</div>'
      +(failed.length?'<ul>'+failed.map(x=>'<li>'+x.type+': '+x.name+'</li>').join('')+'</ul>':'<div>All expected modules, APIs and required UI elements are available.</div>');
    document.getElementById('cdrDiagnosticsClose').onclick=()=>box.remove();
  }

  window.CDRDiagnostics={run,show,version:'1.0'};
  const params=new URLSearchParams(location.search);
  if(params.get('debug')==='1'){
    window.addEventListener('load',()=>setTimeout(()=>{
      const result=run();
      console.group('CDR Analyzer diagnostics');
      console.table(result.checks);
      console.log(result);
      console.groupEnd();
      show(result);
    },0),{once:true});
  }
})();
