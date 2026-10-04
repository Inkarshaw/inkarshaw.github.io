(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {records:[], filtered:[], files:[], page:1, pageSize:100, sort:{key:'dt',dir:'asc'}, charts:{}, flags:new Set(), notes:{}, chronology:[], contactTags:{}, contactNames:{}, globalContactTags:{}, globalContactNames:{}, tacCache:{}, smsSenderOverrides:{}, smsReviewSelected:new Set(), smsMovementFocus:null, analysisMode:'raw', sourceTimezone:'Asia/Kolkata', indexes:{source:null,bySubject:new Map(),byBparty:new Map(),byTower:new Map(),byDate:new Map(),byImei:new Map(),byImsi:new Map()}, auditTrail:[], appVersion:'v65', mapPrivacyMode:false, fileSeq:0, pendingWorkspace:null, pendingImport:null, exactIncidentRange:null, privateSession:false, highlightRecordId:null, requestSelected:new Set(), locationMatchSelected:new Set()};
  try{state.auditTrail=JSON.parse(localStorage.getItem('cdrAnalyzer:auditTrail')||'[]')||[];}catch{state.auditTrail=[];}
  const FIELDS = {
    cdrNo:['cdrno','a party','aparty','a-party','msisdn','subscriber number','mobile number'],
    bparty:['b party','bparty','b-party','other party','connected number','called number','calling number'],
    date:['date','call date','event date'], time:['time','call time','event time'], duration:['duration','call duration','duration sec','duration seconds'],
    callType:['call type','event type','direction','type'], firstCellId:['first cell id','first cellid','cell id','first cell'], firstAddress:['first cell id address','first cellid address','first tower address','tower address'],
    lastCellId:['last cell id','last cellid','last cell'], lastAddress:['last cell id address','last cellid address','last tower address'], imei:['imei'], manufacturer:['imei manufacturer','manufacturer'], deviceType:['device type'], imsi:['imsi'], roaming:['roaming'],
    provider:['b party provider','bparty provider','provider'], mainCity:['main city(first cellid)','main city','city'], subCity:['sub city(first cellid)','sub city','subcity'], latlong:['lat-long-azimuth (first cellid)','lat long azimuth','lat-long-azimuth','latitude longitude azimuth'],
    caseName:['case'], circle:['circle'], operator:['operator'], lrn:['lrn'], callForward:['callforward','call forward'], location:['location','map','map link']
  };
  const normalize = s => String(s ?? '').toLowerCase().replace(/[\n\r]+/g,' ').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim();
  const escapeHtml = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmtInt = n => Number(n||0).toLocaleString('en-IN');
  const fmtDur = sec => {sec=Number(sec)||0; const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60); return h?`${h}h ${m}m ${s}s`:m?`${m}m ${s}s`:`${s}s`;};
  const displayTz=()=>state.sourceTimezone&&state.sourceTimezone!=='browser'?state.sourceTimezone:undefined;
  const dateFmt = d => d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric',...(displayTz()?{timeZone:displayTz()}:{})}) : '';
  const dtFmt = d => d instanceof Date && !isNaN(d) ? d.toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit',...(displayTz()?{timeZone:displayTz()}:{})}) : '';
  const val = (obj,map,key) => {const h=map[key]; return h ? obj[h] : '';};
  const stableKey = r => [r.sourceFile,r.sourceSheet,r.rowNumber,r.cdrNo,r.bparty,r.dt instanceof Date&&!isNaN(r.dt)?r.dt.toISOString():`${r.date} ${r.time}`].join('|');
  function localDateKey(d){if(!(d instanceof Date)||isNaN(d))return '';const tz=displayTz();if(!tz)return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;try{const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));return `${p.year}-${p.month}-${p.day}`;}catch{return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}}

  if(typeof Chart!=='undefined'){
    Chart.defaults.color='#86a9b8';
    Chart.defaults.borderColor='rgba(97,163,187,.14)';
    Chart.defaults.font.family='Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  }
  function haversineKm(a,b){if(a?.lat==null||a?.lng==null||b?.lat==null||b?.lng==null)return null;const R=6371,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng),s=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));}
  function percentile(arr,p){const a=arr.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(i-lo);}
  function incidentDateTime(){if(!$('incidentDate').value)return null;const [y,m,d]=String($('incidentDate').value).split('-').map(Number),[h,min]=String($('incidentTime').value||'00:00').split(':').map(Number);const out=dateFromSourceParts(y,m-1,d,h||0,min||0,0,state.sourceTimezone);return isNaN(out)?null:out;}
  function duplicateSignature(r){return [r?.cdrNo||'',r?.bparty||'',r?.dt?+r.dt:`${r?.date||''} ${r?.time||''}`,Number(r?.duration)||0,r?.callType||'',r?.firstCellId||''].join('|');}
  function uniqueRecords(data=state.records){const seen=new Set();return data.filter(r=>{const k=duplicateSignature(r);if(seen.has(k))return false;seen.add(k);return true;});}
  function analysisRecords(){return state.analysisMode==='unique'?uniqueRecords(state.records):state.records;}
  function rebuildIndexes(data=analysisRecords()){
    const idx={source:data,mode:state.analysisMode,rawCount:state.records.length,bySubject:new Map(),byBparty:new Map(),byTower:new Map(),byDate:new Map(),byImei:new Map(),byImsi:new Map()};
    const push=(map,key,r)=>{if(!key)return;let a=map.get(key);if(!a){a=[];map.set(key,a);}a.push(r);};
    for(const r of data){push(idx.bySubject,r.cdrNo,r);push(idx.byBparty,r.bpartyKey||phoneish(r.bparty),r);push(idx.byTower,[r.operator,r.firstCellId||r.firstAddress].filter(Boolean).join('|'),r);push(idx.byDate,localDateKey(r.dt),r);push(idx.byImei,r.imei,r);push(idx.byImsi,r.imsi,r);}
    state.indexes=idx;return idx;
  }
  function phoneish(v){const s=String(v??'').trim(),d=s.replace(/\D/g,'');return d.length>=10?d.slice(-10):s.toLowerCase().replace(/\s+/g,'');}
  function getIndex(name,key){const idx=(state.indexes?.mode===state.analysisMode&&state.indexes?.rawCount===state.records.length)?state.indexes:rebuildIndexes();return idx?.[name]?.get(key)||[];}
  function audit(action,details=''){const entry={at:new Date().toISOString(),caseNo:$('caseNo')?.value||'',caseTitle:$('caseTitle')?.value||'',action:String(action||''),details:String(details||'')};state.auditTrail.push(entry);if(state.auditTrail.length>5000)state.auditTrail.splice(0,state.auditTrail.length-5000);if(!state.privateSession){try{localStorage.setItem('cdrAnalyzer:auditTrail',JSON.stringify(state.auditTrail));}catch{}}return entry;}
  function sourceDateParts(d){
    if(!(d instanceof Date)||isNaN(d))return null;
    const tz=displayTz();
    if(!tz)return {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes(),second:d.getSeconds(),weekday:d.getDay()};
    try{
      const parts=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',weekday:'short',hourCycle:'h23'}).formatToParts(d).filter(x=>x.type!=='literal').map(x=>[x.type,x.value]));
      const wd={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
      return {year:+parts.year,month:+parts.month,day:+parts.day,hour:+parts.hour,minute:+parts.minute,second:+parts.second,weekday:wd[parts.weekday]??0};
    }catch{return {year:d.getFullYear(),month:d.getMonth()+1,day:d.getDate(),hour:d.getHours(),minute:d.getMinutes(),second:d.getSeconds(),weekday:d.getDay()};}
  }
  function sourceMinutes(d){const p=sourceDateParts(d);return p?p.hour*60+p.minute:null;}
  function sourceHour(d){const p=sourceDateParts(d);return p?.hour??null;}
  function sourceWeekday(d){const p=sourceDateParts(d);return p?.weekday??null;}
  function sourceTimezoneOffsetMinutes(tz){if(tz==='UTC')return 0;if(tz==='Asia/Kolkata')return 330;return null;}
  function dateFromSourceParts(y,m,d,h=0,min=0,sec=0,tz=state.sourceTimezone){const off=sourceTimezoneOffsetMinutes(tz);return off==null?new Date(y,m,d,h,min,sec,0):new Date(Date.UTC(y,m,d,h,min,sec,0)-off*60000);}

  function escAttr(s){return escapeHtml(s).replace(/'/g,'&#39;');}
  function showStatus(msg,type){const el=$('loadStatus');el.textContent=msg;el.className='status show'+(type?` ${type}`:'');}
  function renderImportHealth(){
    const el=$('importHealthStatus');if(!el)return;
    const rows=state.records,total=rows.length;
    if(!total){el.innerHTML='No CDR rows loaded.';return;}
    const coverage=(label,test)=>{const n=rows.reduce((s,r)=>s+(test(r)?1:0),0),pct=Math.round(n*100/total),cls=pct>=95?'goodtext':pct>=60?'warntext':'badtext';return '<span class="metric-chip '+cls+'">'+label+' '+pct+'%</span>';};
    const dup=Math.max(0,total-uniqueRecords(rows).length);
    el.innerHTML='<div style="margin-bottom:4px"><b>Import health:</b> '+fmtInt(total)+' rows'+(dup?' • '+fmtInt(dup)+' duplicate candidate row(s)':'')+'</div><div class="metric-row">'+[
      coverage('A Party',r=>!!r.cdrNo),coverage('B Party',r=>!!r.bparty),coverage('Date/Time',r=>!!r.dt),
      coverage('Tower',r=>!!(r.firstCellId||r.firstAddress)),coverage('IMEI',r=>!!r.imei),coverage('IMSI',r=>!!r.imsi)
    ].join('')+'</div>';
  }
  function renderFileList(){
    $('fileList').innerHTML=state.files.map(f=>`<div class="file-item"><b title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</b><span>${f.inferredCdr?escapeHtml(f.inferredCdr)+' • ':''}${escapeHtml(f.sheet)} • ${fmtInt(f.rows)} rows <button class="file-remove" data-remove-file="${f.id}" title="Remove this loaded CDR">Remove</button></span><span class="tiny" title="${escapeHtml(f.sha256||'')}">${f.sha256?'SHA-256 '+escapeHtml(f.sha256.slice(0,12))+'… • ':''}${escapeHtml(f.sourceTimezone||'')}${f.size?' • '+fmtInt(f.size)+' bytes':''}</span></div>`).join('');
    renderImportHealth();
  }
  function uniq(key){return [...new Set(state.records.map(r=>r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));}
  function fillSelect(id,items,label){const el=$(id),cur=el.value;el.innerHTML=`<option value="">${label}</option>`+items.map(x=>`<option>${escapeHtml(x)}</option>`).join('');if(items.includes(cur))el.value=cur;}
  function sortData(arr){const {key,dir}=state.sort;const mul=dir==='asc'?1:-1;return [...arr].sort((a,b)=>{let x=a[key],y=b[key];if(key==='dt'){x=x?.getTime?.()||0;y=y?.getTime?.()||0;}else if(key==='duration'){x=+x||0;y=+y||0;}else{x=String(x??'').toLowerCase();y=String(y??'').toLowerCase();}return x<y?-mul:x>y?mul:0;});}
  function typePill(t){const n=normalize(t);const cls=n.includes('sms')?'sms':n.includes('in')?'in':n.includes('out')?'out':'';return `<span class="pill ${cls}">${escapeHtml(t||'—')}</span>`;}
  function safeName(s){return String(s||'cdr_case').replace(/[^a-z0-9_-]+/gi,'_').replace(/^_+|_+$/g,'').slice(0,60)||'cdr_case';}


  window.CDRCore={
    $,state,FIELDS,normalize,escapeHtml,fmtInt,fmtDur,dateFmt,dtFmt,val,stableKey,localDateKey,
    haversineKm,percentile,incidentDateTime,escAttr,showStatus,renderFileList,renderImportHealth,uniq,fillSelect,
    sortData,typePill,safeName,duplicateSignature,uniqueRecords,analysisRecords,rebuildIndexes,getIndex,audit,sourceDateParts,sourceMinutes,sourceHour,sourceWeekday,sourceTimezoneOffsetMinutes,dateFromSourceParts
  };
})();
