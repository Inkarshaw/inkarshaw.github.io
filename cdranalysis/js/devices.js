(() => {
  'use strict';
  window.CDRDevicesFactory = function(ctx){
    const {$,state,learnTacFromRecords,updateTacStatus,ensureRemoteTacMatches,aggregateDevices,fmtInt,escapeHtml,dtFmt,imeiStructure,resolveDevice}=ctx;
  function analyzeIdentifiers(data=state.filtered){
    const byMsisdn=new Map(),byImsi=new Map(),byImei=new Map(),events=[],transitionsBySubject=new Map();
    const ensure=(map,key,base)=>{let x=map.get(key);if(!x){x=base();map.set(key,x);}return x;};
    for(const r of data){
      const msisdn=String(r.cdrNo||'').trim(),imsi=String(r.imsi||'').trim(),imei=String(r.imei||'').trim();
      if(msisdn){
        const x=ensure(byMsisdn,msisdn,()=>({msisdn,imsis:new Set(),imeis:new Set(),pairs:new Map(),records:0,first:null,last:null,files:new Set()}));
        x.records++;if(imsi)x.imsis.add(imsi);if(imei)x.imeis.add(imei);if(imsi||imei){const k=(imsi||'—')+'|'+(imei||'—');x.pairs.set(k,(x.pairs.get(k)||0)+1);}if(r.sourceFile)x.files.add(r.sourceFile);if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;
      }
      if(imsi){
        const x=ensure(byImsi,imsi,()=>({imsi,msisdns:new Set(),imeis:new Set(),files:new Set(),records:0,first:null,last:null}));
        if(msisdn)x.msisdns.add(msisdn);if(imei)x.imeis.add(imei);if(r.sourceFile)x.files.add(r.sourceFile);x.records++;if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;
      }
      if(imei){
        const x=ensure(byImei,imei,()=>({imei,msisdns:new Set(),imsis:new Set(),files:new Set(),records:0,device:'',first:null,last:null}));
        if(msisdn)x.msisdns.add(msisdn);if(imsi)x.imsis.add(imsi);if(r.sourceFile)x.files.add(r.sourceFile);x.records++;if(!x.device)x.device=[r.manufacturer,r.deviceType].filter(Boolean).join(' • ');if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;
      }
    }
    const sorted=[...data].filter(r=>r.dt&&r.cdrNo).sort((a,b)=>a.dt-b.dt);
    const lastBySubject=new Map();
    for(const r of sorted){
      const msisdn=String(r.cdrNo||'').trim(),imsi=String(r.imsi||'').trim(),imei=String(r.imei||'').trim();
      const p=lastBySubject.get(msisdn)||{imsi:'',imei:''};
      const imsiChanged=!!(imsi&&p.imsi&&imsi!==p.imsi),imeiChanged=!!(imei&&p.imei&&imei!==p.imei);
      if(imsiChanged||imeiChanged){
        let type='',interpretation='';
        if(imsiChanged&&imeiChanged){type='IMSI + IMEI changed';interpretation='SIM/subscription and handset identifiers both changed';}
        else if(imsiChanged&&imei&&p.imei===imei){type='Same IMEI → new IMSI';interpretation='Different SIM/subscription observed in the same handset identifier';}
        else if(imeiChanged&&imsi&&p.imsi===imsi){type='Same IMSI → new IMEI';interpretation='Same SIM/subscription observed with another handset identifier';}
        else if(imsiChanged){type='Same MSISDN → new IMSI';interpretation='SIM/subscription identity changed for the subject number';}
        else {type='MSISDN → new IMEI';interpretation='Handset identifier changed for the subject number';}
        events.push({msisdn,type,at:r.dt,fromImsi:p.imsi,toImsi:imsi,fromImei:p.imei,toImei:imei,interpretation,record:r});
        transitionsBySubject.set(msisdn,(transitionsBySubject.get(msisdn)||0)+1);
      }
      if(imsi)p.imsi=imsi;if(imei)p.imei=imei;lastBySubject.set(msisdn,p);
    }
    const msisdnNewImsi=[...byMsisdn.values()].filter(x=>x.imsis.size>1);
    const imsiNewImei=[...byImsi.values()].filter(x=>x.imeis.size>1);
    const imeiMultiImsi=[...byImei.values()].filter(x=>x.imsis.size>1);
    const imsiCrossCdr=[...byImsi.values()].filter(x=>x.msisdns.size>1||x.files.size>1).sort((a,b)=>b.msisdns.size-a.msisdns.size||b.files.size-a.files.size||b.records-a.records);
    const repeatedSwaps=[...transitionsBySubject].filter(([,n])=>n>=3).map(([msisdn,count])=>({msisdn,count,imsis:byMsisdn.get(msisdn)?.imsis||new Set(),imeis:byMsisdn.get(msisdn)?.imeis||new Set()})).sort((a,b)=>b.count-a.count);
    return {byMsisdn,byImsi,byImei,events,msisdnNewImsi,imsiNewImei,imeiMultiImsi,imsiCrossCdr,repeatedSwaps};
  }

  function buildSubjectDeviceUsage(data){
    const subjects=new Map();
    for(const r of data){
      const subject=String(r.cdrNo||'').trim();if(!subject)continue;
      let x=subjects.get(subject);
      if(!x){x={subject,devices:new Map(),sims:new Map()};subjects.set(subject,x);}
      const imei=String(r.imei||'').trim(),imsi=String(r.imsi||'').trim();
      if(imei){
        let d=x.devices.get(imei);if(!d)d={imei,first:null,last:null,records:0};
        d.records++;
        if(r.dt&&(!d.first||r.dt<d.first))d.first=r.dt;
        if(r.dt&&(!d.last||r.dt>d.last))d.last=r.dt;
        x.devices.set(imei,d);
      }
      if(imsi){
        let s=x.sims.get(imsi);if(!s)s={imsi,first:null,last:null,records:0};
        s.records++;
        if(r.dt&&(!s.first||r.dt<s.first))s.first=r.dt;
        if(r.dt&&(!s.last||r.dt>s.last))s.last=r.dt;
        x.sims.set(imsi,s);
      }
    }
    return [...subjects.values()].map(x=>({
      subject:x.subject,
      devices:[...x.devices.values()].sort((a,b)=>(a.first?.getTime?.()||0)-(b.first?.getTime?.()||0)||a.imei.localeCompare(b.imei)),
      sims:[...x.sims.values()].sort((a,b)=>(a.first?.getTime?.()||0)-(b.first?.getTime?.()||0)||a.imsi.localeCompare(b.imsi))
    })).sort((a,b)=>a.subject.localeCompare(b.subject,undefined,{numeric:true}));
  }

  function renderDeviceUsageSummary(data){
    const box=$('deviceUsageSummary');if(!box)return;
    const subjects=buildSubjectDeviceUsage(data);
    if(!subjects.length){box.innerHTML='<div class="empty">No IMEI / IMSI usage is available in the current filters.</div>';return;}
    box.innerHTML=subjects.map(x=>{
      const deviceLines=x.devices.length?x.devices.map(d=>{
        const info=resolveDevice(d.imei),model=[info.manufacturer,info.model].filter(Boolean).join(' ')||'Unknown model';
        return `<div class="device-usage-row"><div class="device-usage-id"><b>IMEI</b> ${escapeHtml(d.imei)} <span class="device-model">(${escapeHtml(model)})</span></div><div class="device-usage-range"><span><b>From</b> ${escapeHtml(dtFmt(d.first)||'—')}</span><span><b>To</b> ${escapeHtml(dtFmt(d.last)||'—')}</span></div></div>`;
      }).join(''):'<div class="tiny">No IMEI recorded.</div>';
      const simLines=x.sims.length?x.sims.map((s,i)=>`<div class="device-usage-row"><div class="device-usage-id"><b>IMSI</b> ${escapeHtml(s.imsi)} <span class="device-model">(SIM ${i+1})</span></div><div class="device-usage-range"><span><b>From</b> ${escapeHtml(dtFmt(s.first)||'—')}</span><span><b>To</b> ${escapeHtml(dtFmt(s.last)||'—')}</span></div></div>`).join(''):'<div class="tiny">No IMSI recorded.</div>';
      return `<div class="device-usage-card">
        <div class="device-usage-head">
          <div><b>${escapeHtml(x.subject)}</b><div class="tiny">Subject / MSISDN</div></div>
          <div class="metric-row"><span class="metric-chip"><b>${fmtInt(x.devices.length)}</b> device${x.devices.length===1?'':'s'} used</span><span class="metric-chip"><b>${fmtInt(x.sims.length)}</b> SIM${x.sims.length===1?'':'s'} used</span></div>
        </div>
        <div class="device-usage-section"><div class="device-usage-label">Devices</div>${deviceLines}</div>
        <div class="device-usage-section"><div class="device-usage-label">SIMs</div>${simLines}</div>
      </div>`;
    }).join('');
  }

  function renderDevices(){
    learnTacFromRecords(state.records);updateTacStatus();
    const data=state.filtered,A=analyzeIdentifiers(data),rows=aggregateDevices(data);
    renderDeviceUsageSummary(data);
    const uniqueSubjects=new Set(data.map(r=>r.cdrNo).filter(Boolean)).size,uniqueImsi=A.byImsi.size,uniqueImei=A.byImei.size;
    $('identifierSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(uniqueSubjects)}</div><div class="l">MSISDN / subjects</div></div><div class="kpi"><div class="v">${fmtInt(uniqueImsi)}</div><div class="l">Unique IMSI</div></div><div class="kpi"><div class="v">${fmtInt(uniqueImei)}</div><div class="l">Unique IMEI</div></div><div class="kpi"><div class="v">${fmtInt(A.msisdnNewImsi.length)}</div><div class="l">MSISDN with multiple IMSIs</div></div><div class="kpi"><div class="v">${fmtInt(A.imsiNewImei.length)}</div><div class="l">IMSI with multiple IMEIs</div></div><div class="kpi"><div class="v">${fmtInt(A.imeiMultiImsi.length)}</div><div class="l">IMEI with multiple IMSIs</div></div></div>`;
    $('resolvedDeviceTable').innerHTML=`<thead><tr><th>IMEI</th><th>TAC</th><th>Manufacturer</th><th>Model</th><th>IMSI</th><th>Lookup status</th><th>Records</th><th>First</th><th>Last</th></tr></thead><tbody>${rows.map(x=>`<tr><td>${escapeHtml(x.imei||'—')}</td><td>${escapeHtml(x.tac||'—')}</td><td>${escapeHtml(x.manufacturer||'—')}</td><td class="details">${escapeHtml(x.model||'—')}</td><td>${escapeHtml(x.imsi||'—')}</td><td>${escapeHtml(x.lookupStatus||'Unknown TAC')}</td><td class="num">${fmtInt(x.records)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join('')}</tbody>`;
    const uniqueImeis=[...new Set(data.map(r=>r.imei).filter(Boolean))];
    $('imeiStructureTable').innerHTML=`<thead><tr><th>IMEI / IMEISV</th><th>TAC</th><th>Serial</th><th>Check digit / SVN</th><th>IMEI validity</th><th>Resolved device</th></tr></thead><tbody>${uniqueImeis.map(imei=>{const s=imeiStructure(imei),d=resolveDevice(imei);return `<tr><td>${escapeHtml(imei)}</td><td>${escapeHtml(s.tac||'—')}</td><td>${escapeHtml(s.serial||'—')}</td><td>${escapeHtml(s.checkDigit?('CD '+s.checkDigit):s.svn?('SVN '+s.svn):'—')}</td><td>${s.luhn===true?'<span class="goodtext">Valid</span>':s.luhn===false?'<span class="warntext">Invalid</span>':'—'}</td><td class="details">${escapeHtml([d.manufacturer,d.model].filter(Boolean).join(' ')||'Unknown TAC')}</td></tr>`}).join('')}</tbody>`;



    const relationships=[...A.byMsisdn.values()].sort((a,b)=>b.records-a.records);
    $('identifierRelationshipTable').innerHTML=`<thead><tr><th>MSISDN / subject</th><th>IMSI(s)</th><th>IMEI(s)</th><th>Records</th><th>First</th><th>Last</th><th>Detection</th></tr></thead><tbody>${relationships.map(x=>{const flags=[];if(x.imsis.size>1)flags.push('SIM/subscription change');if(x.imeis.size>1)flags.push('Handset change');return `<tr><td>${escapeHtml(x.msisdn)}</td><td class="details">${escapeHtml([...x.imsis].join(', ')||'—')}</td><td class="details">${escapeHtml([...x.imeis].map(i=>{const d=resolveDevice(i);return d.model?i+' ('+[d.manufacturer,d.model].filter(Boolean).join(' ')+')':i}).join(', ')||'—')}</td><td class="num">${fmtInt(x.records)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td>${flags.length?flags.map(v=>`<span class="pill">${escapeHtml(v)}</span>`).join(' '):'—'}</td></tr>`}).join('')}</tbody>`;

    $('deviceChangeTable').innerHTML=`<thead><tr><th>Subject</th><th>Detection</th><th>Date/time</th><th>Previous IMSI</th><th>New IMSI</th><th>Previous IMEI</th><th>New IMEI / model</th><th>Interpretation</th><th>Source</th></tr></thead><tbody>${A.events.map(x=>`<tr><td>${escapeHtml(x.msisdn)}</td><td><span class="pill">${escapeHtml(x.type)}</span></td><td>${dtFmt(x.at)}</td><td>${escapeHtml(x.fromImsi||'—')}</td><td>${escapeHtml(x.toImsi||'—')}</td><td>${escapeHtml(x.fromImei||'—')}</td><td>${escapeHtml(x.toImei||'—')}${x.toImei&&resolveDevice(x.toImei).model?' • '+escapeHtml([resolveDevice(x.toImei).manufacturer,resolveDevice(x.toImei).model].filter(Boolean).join(' ')):''}</td><td class="details">${escapeHtml(x.interpretation)}</td><td>${escapeHtml(x.record.sourceFile||'')} • row ${x.record.rowNumber||''}</td></tr>`).join('')}</tbody>`;

    $('imsiCrossCdrTable').innerHTML=`<thead><tr><th>IMSI</th><th>Subject/MSISDN</th><th>IMEI(s)</th><th>Files</th><th>Records</th><th>Interpretation</th></tr></thead><tbody>${A.imsiCrossCdr.slice(0,300).map(x=>`<tr><td>${escapeHtml(x.imsi)}</td><td class="details">${escapeHtml([...x.msisdns].join(', ')||'—')}</td><td class="details">${escapeHtml([...x.imeis].join(', ')||'—')}</td><td>${fmtInt(x.files.size)}</td><td>${fmtInt(x.records)}</td><td class="details">${x.msisdns.size>1?'Same IMSI appears under multiple subject numbers — possible subscription linkage':'Same IMSI appears across multiple imported files'}</td></tr>`).join('')}</tbody>`;

    $('imeiMultiImsiTable').innerHTML=`<thead><tr><th>IMEI</th><th>IMSI(s)</th><th>Subject/MSISDN</th><th>Device</th><th>Records</th><th>Interpretation</th></tr></thead><tbody>${A.imeiMultiImsi.slice(0,300).map(x=>`<tr><td>${escapeHtml(x.imei)}</td><td class="details">${escapeHtml([...x.imsis].join(', '))}</td><td class="details">${escapeHtml([...x.msisdns].join(', ')||'—')}</td><td class="details">${escapeHtml(([resolveDevice(x.imei).manufacturer,resolveDevice(x.imei).model].filter(Boolean).join(' ')||x.device||'—'))}</td><td>${fmtInt(x.records)}</td><td>Multiple SIM/subscription identities observed with the same handset identifier</td></tr>`).join('')}</tbody>`;

    const imeis=[...A.byImei.keys()].slice(0,25),imsis=[...A.byImsi.keys()].slice(0,25),pair={};
    for(const r of data){if(!r.imei||!r.imsi)continue;pair[r.imei+'|'+r.imsi]=(pair[r.imei+'|'+r.imsi]||0)+1;}
    $('imeiImsiMatrix').innerHTML=`<table class="table"><thead><tr><th>IMEI / Mobile model \\ IMSI</th>${imsis.map(x=>`<th>${escapeHtml(x)}</th>`).join('')}</tr></thead><tbody>${imeis.map(i=>{const d=resolveDevice(i),model=[d.manufacturer,d.model].filter(Boolean).join(' ')||'Unknown model';return `<tr><td><b>${escapeHtml(i)}</b><div class="tiny">${escapeHtml(model)}</div></td>${imsis.map(s=>`<td style="text-align:center">${pair[i+'|'+s]||''}</td>`).join('')}</tr>`}).join('')}</tbody></table>`;
    if(ensureRemoteTacMatches){
      Promise.resolve(ensureRemoteTacMatches(state.records)).then(result=>{
        if(result?.changed&&!$('devices')?.classList.contains('hidden'))renderDevices();
      }).catch(()=>{});
    }
  }

    return {analyzeIdentifiers,renderDevices};
  };
})();
