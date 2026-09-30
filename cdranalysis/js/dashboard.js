(() => {
  'use strict';
  window.CDRDashboardFactory = function(ctx){
    const {
      $,state,normalize,phoneKey,localDateKey,resolveDevice,persistLocal,escapeHtml,escAttr,fmtInt,fmtDur,
      dtFmt,dateFmt,contactLabel,eventColor,parseTime,applyFilters,switchTab
    }=ctx;

  function aggregateContacts(data=state.filtered){
    const m=new Map(); for(const r of data){if(!r.bparty)continue;const k=r.bpartyKey||phoneKey(r.bparty);let x=m.get(k);if(!x)x={key:k,bparty:r.bparty,aliases:new Set(),records:0,calls:0,in:0,out:0,sms:0,duration:0,first:null,last:null,towers:new Set(),providers:new Set(),cdrs:new Set()};x.aliases.add(r.bparty);x.records++;const t=normalize(r.callType);if(t.includes('call')){x.calls++;x.duration+=r.duration;if(t.includes('in'))x.in++;if(t.includes('out'))x.out++;}if(t.includes('sms'))x.sms++;if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;if(r.firstCellId)x.towers.add(r.firstCellId);if(r.provider)x.providers.add(r.provider);if(r.cdrNo)x.cdrs.add(r.cdrNo);m.set(k,x);}return [...m.values()].sort((a,b)=>b.records-a.records||b.duration-a.duration);
  }
  function locationTowerKey(r){const cell=String(r?.firstCellId||'').trim(),op=normalize(r?.operator||'');if(cell)return (op?op+'|':'cell|')+cell;return r?.firstAddress||`${r?.lat||''},${r?.lng||''}`;}
  function aggregateLocations(data=state.filtered){const m=new Map();for(const r of data){const k=locationTowerKey(r);if(!k)continue;let x=m.get(k);if(!x)x={key:k,cellId:r.firstCellId,address:r.firstAddress,lat:r.lat,lng:r.lng,az:r.azimuth,records:0,duration:0,contacts:new Set(),first:null,last:null,cdrs:new Set(),roaming:new Set(),dates:new Set(),operators:new Set()};x.records++;x.duration+=r.duration;if(r.bparty)x.contacts.add(r.bparty);if(r.cdrNo)x.cdrs.add(r.cdrNo);if(r.roaming)x.roaming.add(r.roaming);if(r.operator)x.operators.add(r.operator);if(r.dt){x.dates.add(localDateKey(r.dt));if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;}m.set(k,x);}return [...m.values()].sort((a,b)=>b.records-a.records);}
  function aggregateDevices(data=state.filtered){
    const m=new Map();
    for(const r of data){
      const k=`${r.imei||'—'}|${r.imsi||'—'}`;if(k==='—|—')continue;
      let x=m.get(k);
      if(!x){
        const d=resolveDevice(r.imei,r.manufacturer,r.model);
        x={imei:r.imei,imsi:r.imsi,tac:d.tac,manufacturer:d.manufacturer,model:d.model,deviceType:r.deviceType,os:r.os||'',lookupStatus:d.status,records:0,contacts:new Set(),towers:new Set(),cdrs:new Set(),first:null,last:null};
      }
      x.records++;if(r.bparty)x.contacts.add(r.bparty);if(r.firstCellId)x.towers.add(r.firstCellId);if(r.cdrNo)x.cdrs.add(r.cdrNo);if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;m.set(k,x);
    }
    return [...m.values()].sort((a,b)=>b.records-a.records);
  }


  function caseSnapshots(){try{return JSON.parse(localStorage.getItem('cdrAnalyzer:caseSnapshots')||'[]')||[]}catch{return []}}
  function renderCaseSnapshots(){const rows=caseSnapshots();const el=$('caseSnapshots');if(!el)return;el.innerHTML=rows.length?rows.map((x,i)=>`<div class="file-item"><b>${escapeHtml(x.caseNo||x.title||'Untitled case')}</b><span>${escapeHtml(x.title||'')} • ${escapeHtml(x.station||'')} • ${escapeHtml(x.incidentDate||'')} <button class="btn secondary small load-case-snapshot" data-i="${i}">Open</button> <button class="file-remove delete-case-snapshot" data-i="${i}">×</button></span></div>`).join(''):'No case snapshots saved yet.';}
  function saveCaseSnapshot(){const rows=caseSnapshots();rows.unshift({title:$('caseTitle').value,caseNo:$('caseNo').value,station:$('station').value,analyst:$('analyst').value,incidentDate:$('incidentDate').value,incidentTime:$('incidentTime').value,savedAt:new Date().toISOString()});persistLocal('cdrAnalyzer:caseSnapshots',JSON.stringify(rows.slice(0,50)));renderCaseSnapshots();}
  function renderDashboard(){
    renderCaseSnapshots();
    const selected=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    const d=state.filtered;
    if($('dashboardScopeText')){
      const subjectText=selected?selected:'All subjects',eventText=eventType||'All event types';
      $('dashboardScopeText').textContent=`${subjectText} • ${eventText} • ${fmtInt(d.length)} records within current filters.`;
    }
    const contacts=aggregateContacts(d), locs=aggregateLocations(d), devs=aggregateDevices(d), calls=d.filter(r=>normalize(r.callType).includes('call')), sms=d.filter(r=>normalize(r.callType).includes('sms')), duration=calls.reduce((s,r)=>s+r.duration,0), dates=d.filter(r=>r.dt).map(r=>r.dt);
    const min=dates.length?new Date(Math.min(...dates)):null,max=dates.length?new Date(Math.max(...dates)):null; const uniqueImei=new Set(d.map(r=>r.imei).filter(Boolean)).size, uniqueImsi=new Set(d.map(r=>r.imsi).filter(Boolean)).size;
    const k=[['Dashboard records',fmtInt(d.length),[selected?`Subject ${selected}`:'All subjects',eventType||'All event types'].join(' • ')],['Unique contacts',fmtInt(contacts.length),`${fmtInt(calls.length)} call records`],['Total call duration',fmtDur(duration),`${fmtInt(sms.length)} SMS records`],['Unique towers',fmtInt(locs.length),min&&max?`${dateFmt(min)} – ${dateFmt(max)}`:'—'],['Unique devices (IMEI)',fmtInt(uniqueImei),'Handset identifiers'],['Unique SIMs (IMSI)',fmtInt(uniqueImsi),'SIM / subscription identities'],['CDR numbers',fmtInt(new Set(d.map(r=>r.cdrNo).filter(Boolean)).size),`${fmtInt(state.files.length)} file(s)`]];
    $('kpis').innerHTML=k.map(x=>`<div class="kpi"><div class="v">${x[1]}</div><div class="l">${x[0]}</div><div class="s">${x[2]}</div></div>`).join('');
    if($('topContactBadge'))$('topContactBadge').textContent=contacts.length;
    const topContacts=contacts.slice(0,10);
    if($('dashTopContacts'))$('dashTopContacts').innerHTML=topContacts.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Contact</th><th>Records</th><th>Calls</th><th>SMS</th><th>Duration</th></tr></thead><tbody>${topContacts.map(x=>`<tr><td>${escapeHtml(contactLabel(x.bparty))}</td><td>${fmtInt(x.records)}</td><td>${fmtInt(x.calls)}</td><td>${fmtInt(x.sms)}</td><td>${fmtDur(x.duration)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
    const hours=Array(24).fill(0);d.forEach(r=>{if(r.dt)hours[window.CDRCore.sourceHour(r.dt)]++;else{const t=parseTime(r.time);if(t)hours[t.h]++;}});
    if($('dashHourValues'))$('dashHourValues').innerHTML=`<div class="tablewrap"><table class="table"><thead><tr><th>Hour</th><th>Records</th></tr></thead><tbody>${hours.map((n,h)=>n?`<tr><td>${String(h).padStart(2,'0')}:00–${String(h).padStart(2,'0')}:59</td><td>${fmtInt(n)}</td></tr>`:'').join('')}</tbody></table></div>`;
    const tm={};d.forEach(r=>{const key=r.callType||'Unknown';tm[key]=(tm[key]||0)+1;});
    const typeEntries=Object.entries(tm).sort((a,b)=>b[1]-a[1]);
    if($('dashEventTypes'))$('dashEventTypes').innerHTML=typeEntries.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Event type</th><th>Records</th></tr></thead><tbody>${typeEntries.map(([name,count])=>`<tr><td>${escapeHtml(name)}</td><td>${fmtInt(count)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
    $('dashLocations').innerHTML=locs.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr><th>Cell ID / location</th><th>Records</th><th>Contacts</th></tr></thead><tbody>${locs.slice(0,8).map(x=>`<tr><td><a href="#" class="link dashboard-location-filter" data-cell="${escAttr(x.cellId||'')}" data-tower="${escAttr(x.address||'')}" title="Open matching CDR records">${escapeHtml(x.cellId||x.address||'—')}</a>${x.cellId&&x.address?`<div class="tiny">${escapeHtml(x.address)}</div>`:''}</td><td>${fmtInt(x.records)}</td><td>${fmtInt(x.contacts.size)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
    $('dashDevices').innerHTML=devs.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr><th>Model</th><th>IMEI</th><th>IMSI</th><th>Records</th></tr></thead><tbody>${devs.slice(0,8).map(x=>`<tr><td><a href="#" class="link dashboard-device-filter" data-imei="${escAttr(x.imei||'')}" data-imsi="${escAttr(x.imsi||'')}" title="Open this device / SIM analysis">${escapeHtml([x.manufacturer,x.model].filter(Boolean).join(' ')||'Unknown model')}</a></td><td>${escapeHtml(x.imei||'—')}</td><td>${escapeHtml(x.imsi||'—')}</td><td>${fmtInt(x.records)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
  }
  function simpleTable(headers,rows){return rows.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<div class="empty">No matching data</div>`;}
  function newChart(id,config){if(state.charts[id])state.charts[id].destroy(); if(typeof Chart==='undefined')return; state.charts[id]=new Chart($(id),config);}
  function renderCharts(data,contacts){
    const chartGrid='rgba(83,141,169,.18)',chartTicks='#86aabd',chartBorder='rgba(51,221,255,.16)';
    const top=contacts.slice(0,12);newChart('contactsChart',{type:'bar',data:{labels:top.map(x=>contactLabel(x.bparty)),datasets:[{label:'Records',data:top.map(x=>x.records),backgroundColor:'rgba(49,247,168,.74)',borderColor:'#31f7a8',hoverBackgroundColor:'#33ddff',hoverBorderColor:'#e7fbff',borderWidth:1,borderRadius:4,barPercentage:.72,categoryPercentage:.82}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',onClick:(evt,els)=>{if(!els.length)return;const x=top[els[0].index];if(x)contactFilter(x.bparty);},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>' '+fmtInt(ctx.raw)+' records'}}},scales:{x:{beginAtZero:true,grid:{color:chartGrid},border:{color:chartBorder},ticks:{color:chartTicks}},y:{grid:{color:'rgba(83,141,169,.10)'},border:{color:chartBorder},ticks:{color:chartTicks}}}}});
    const hours=Array(24).fill(0);data.forEach(r=>{if(r.dt)hours[window.CDRCore.sourceHour(r.dt)]++;else{const t=parseTime(r.time);if(t)hours[t.h]++;}});newChart('hourChart',{type:'bar',data:{labels:hours.map((_,i)=>String(i).padStart(2,'0')),datasets:[{label:'Records',data:hours,backgroundColor:'rgba(51,221,255,.76)',borderColor:'#33ddff',hoverBackgroundColor:'#a78bfa',hoverBorderColor:'#e7fbff',borderWidth:1,borderRadius:3,barPercentage:.76,categoryPercentage:.86}]},options:{responsive:true,maintainAspectRatio:false,onClick:(evt,els)=>{if(!els.length)return;const h=String(els[0].index).padStart(2,'0');$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{display:false},tooltip:{callbacks:{title:items=>items.length?items[0].label+':00–'+items[0].label+':59':'',label:ctx=>' '+fmtInt(ctx.raw)+' records'}}},scales:{x:{grid:{display:false},border:{color:chartBorder},ticks:{color:chartTicks,maxRotation:50,minRotation:50}},y:{beginAtZero:true,grid:{color:chartGrid},border:{color:chartBorder},ticks:{color:chartTicks}}}}});
    const tm={};data.forEach(r=>{const k=r.callType||'Unknown';tm[k]=(tm[k]||0)+1});
    const entries=Object.entries(tm).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const eventColor=(label,i)=>{
      const n=normalize(label).replace(/\s+/g,'_');
      if(n.includes('call_in')||(n.includes('call')&&n.includes('in')))return '#31f7a8';
      if(n.includes('call_out')||(n.includes('call')&&n.includes('out')))return '#33ddff';
      if(n.includes('sms_in')||(n.includes('sms')&&n.includes('in')))return '#a78bfa';
      if(n.includes('sms_out')||(n.includes('sms')&&n.includes('out')))return '#ffb454';
      const palette=['#ff5d78','#4ade80','#60a5fa','#f472b6','#facc15','#22d3ee','#c084fc','#fb7185','#34d399','#f97316'];
      return palette[i%palette.length];
    };
    const typeColors=entries.map((x,i)=>eventColor(x[0],i));
    newChart('typeChart',{type:'doughnut',data:{labels:entries.map(x=>x[0]),datasets:[{
      data:entries.map(x=>x[1]),
      backgroundColor:typeColors,
      borderColor:'#07111d',
      borderWidth:3,
      hoverBorderColor:'#e7fbff',
      hoverBorderWidth:3,
      hoverOffset:8
    }]},options:{responsive:true,maintainAspectRatio:false,cutout:'56%',onClick:(evt,els)=>{if(!els.length)return;const x=entries[els[0].index];if(!x)return;$('callType').value=x[0];applyFilters();switchTab('records');},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{position:'bottom',labels:{boxWidth:12,boxHeight:12,usePointStyle:true,pointStyle:'rectRounded',padding:12,color:'#9fc6d6',font:{size:10}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${fmtInt(ctx.raw)}`}}}}});
  }



    function bind(){
      $('saveCaseSnapshotBtn').onclick=()=>{if(window.CDRApp?.openCaseSaveDialog)window.CDRApp.openCaseSaveDialog('snapshot');else saveCaseSnapshot();};
    }

    return {
      aggregateContacts,locationTowerKey,aggregateLocations,aggregateDevices,
      caseSnapshots,renderCaseSnapshots,saveCaseSnapshot,renderDashboard,
      simpleTable,newChart,renderCharts,bind
    };
  };
})();
