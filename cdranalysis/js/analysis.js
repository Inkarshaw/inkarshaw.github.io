(() => {
  'use strict';
  window.CDRAnalysisFactory = function(ctx){
    const {
      $,state,smsIntelRows,smsSenderIntelligence,senderBrandInfo,getSmsSenderOverride,setSmsSenderOverride,clearSmsSenderOverride,fmtInt,escapeHtml,dtFmt,
      incidentDateTime,subjectEventScopedRecords,localDateKey,aggregateContacts,simpleTable,
      escAttr,contactLabel,contactTitle,typePill,fmtDur,normalize,analyzeIdentifiers,percentile,
      setSubjectEventScope
    }=ctx;

  function smsLikeRecord(r){
    if(!r||!r.dt||!senderBrandInfo(r.bparty))return false;
    const typ=normalize(r.callType);
    if(typ.includes('call'))return false;
    return typ.includes('sms')||/[A-Za-z]/.test(String(r.bparty||''));
  }

  function smsFirstObservationMap(){
    const m=new Map();
    for(const r of state.records){
      if(!smsLikeRecord(r))continue;
      const bi=senderBrandInfo(r.bparty);if(!bi)continue;
      const k=String(r.cdrNo||'')+'|'+bi.key;
      const prev=m.get(k);
      if(!prev||r.dt<prev.dt)m.set(k,r);
    }
    return m;
  }

  function smsBurstGroups(timeline,gapMin,minCount=3,mode='any'){
    const by=new Map(),gap=Math.max(1,Number(gapMin)||15)*60000,min=Math.max(2,Number(minCount)||3);
    for(const x of timeline){
      const s=String(x.record.cdrNo||'—');
      if(!by.has(s))by.set(s,[]);
      by.get(s).push(x);
    }
    const out=[];
    for(const [subject,arr] of by){
      arr.sort((p,q)=>p.record.dt-q.record.dt);
      let group=[];
      const flush=()=>{
        if(group.length>=min){
          const brands=new Set(group.map(x=>x.brandKey||x.brand)),senderIds=new Set(group.map(x=>x.senderId));
          const qualifies=mode==='same'?brands.size===1:mode==='multi'?brands.size>1:true;
          if(qualifies)out.push({subject,start:group[0].record.dt,end:group[group.length-1].record.dt,events:group.slice(),senderIds,brands:new Set(group.map(x=>x.brand)),categories:new Set(group.map(x=>x.category))});
        }
        group=[];
      };
      for(const x of arr){
        if(!group.length){group=[x];continue;}
        const prev=group[group.length-1];
        if(x.record.dt-prev.record.dt<=gap)group.push(x);
        else{flush();group=[x];}
      }
      flush();
    }
    return out.sort((x,y)=>y.events.length-x.events.length||x.start-y.start);
  }

  function smsPreviousNextActivity(r){
    if(!r?.dt)return {prev:null,next:null,prevMin:null,nextMin:null};
    const a=state.records.filter(x=>x.dt&&x.cdrNo===r.cdrNo&&x.id!==r.id).sort((x,y)=>x.dt-y.dt);
    let prev=null,next=null;
    for(const x of a){if(x.dt<r.dt)prev=x;else if(x.dt>r.dt){next=x;break;}}
    return {prev,next,prevMin:prev?Math.round((r.dt-prev.dt)/60000):null,nextMin:next?Math.round((next.dt-r.dt)/60000):null};
  }

  function smsCrossSubjectClosestGap(timeline,brandKey){
    const rows=timeline.filter(x=>x.brandKey===brandKey&&x.record?.dt&&x.record?.cdrNo).sort((a,b)=>a.record.dt-b.record.dt);
    let best=Infinity;
    for(let i=0;i<rows.length;i++)for(let j=i+1;j<rows.length;j++){
      if(rows[i].record.cdrNo===rows[j].record.cdrNo)continue;
      const gap=Math.abs(rows[j].record.dt-rows[i].record.dt)/60000;
      if(gap<best)best=gap;
      if(Number.isFinite(best)&&rows[j].record.dt-rows[i].record.dt>best*60000)break;
    }
    return Number.isFinite(best)?best:null;
  }

  function smsReviewFilter(decorated){
    const q=normalize($('smsIntelSearch')?.value||''),cat=$('smsIntelFilterCategory')?.value||'',rec=$('smsIntelFilterRecognition')?.value||'';
    const firstOnly=!!$('smsIntelFirstOnly')?.checked,incidentOnly=!!$('smsIntelIncidentOnly')?.checked,unusualOnly=!!$('smsIntelUnusualOnly')?.checked;
    return decorated.filter(x=>{
      if(q&&!normalize([x.senderId,x.brand,x.category,x.record.cdrNo].join(' ')).includes(q))return false;
      if(cat&&x.category!==cat)return false;
      if(rec&&x.recognition!==rec)return false;
      if(firstOnly&&!x.firstObserved)return false;
      if(incidentOnly&&!x.incidentNear)return false;
      if(unusualOnly&&!x.unusual)return false;
      return true;
    });
  }

  function smsBaselineRows(incidentMin){
    const inc=incidentDateTime();if(!inc)return [];
    const subject=$('smsIntelCdr')?.value||'',allRows=state.records.filter(r=>smsLikeRecord(r)&&(!subject||r.cdrNo===subject));
    const A=smsSenderIntelligence(allRows),nearMs=Math.max(1,incidentMin)*60000,nearStart=new Date(inc-nearMs),nearEnd=new Date(inc+nearMs),d7=new Date(inc-7*86400000),d30=new Date(inc-30*86400000);
    const keys=new Map();
    for(const x of A.timeline){
      let z=keys.get(x.brandKey);if(!z)z={key:x.brandKey,label:x.brand,category:x.category,near:0,prior7:0,prior30:0,beforeEver:0,first:null,last:null};
      const t=x.record.dt;
      if(t>=nearStart&&t<=nearEnd)z.near++;
      if(t>=d7&&t<nearStart)z.prior7++;
      if(t>=d30&&t<nearStart)z.prior30++;
      if(t<nearStart)z.beforeEver++;
      if(!z.first||t<z.first)z.first=t;if(!z.last||t>z.last)z.last=t;keys.set(x.brandKey,z);
    }
    const windowDays=(2*Math.max(1,incidentMin))/1440;
    return [...keys.values()].filter(x=>x.near>0||x.prior7>0).map(x=>{const firstNear=x.near>0&&x.beforeEver===0,expected7=(x.prior7/7)*windowDays,ratio7=expected7>0?x.near/expected7:null;let status='Previously observed';if(firstNear)status='First observed near incident';else if(x.near===0&&x.prior7>0)status='Active in prior 7 days; absent near incident';else if(x.near>=2&&ratio7!=null&&ratio7>=3)status='Incident-near rate above prior 7-day rate';return {...x,firstNear,expected7,ratio7,status};}).sort((a,b)=>b.near-a.near||b.prior7-a.prior7||a.label.localeCompare(b.label));
  }

  function smsAnalysisSnapshot(){
    const rows=smsIntelRows(),A=smsSenderIntelligence(rows),firstMap=smsFirstObservationMap();
    const inc=incidentDateTime(),incidentMin=Math.max(1,+$('smsIntelIncidentMins')?.value||60),incidentMs=incidentMin*60000;
    const burstMin=Math.max(1,+$('smsIntelBurstMins')?.value||15),burstCount=Math.max(2,+$('smsIntelBurstMinCount')?.value||3),burstMode=$('smsIntelBurstMode')?.value||'any';
    const decorated=A.timeline.map(x=>{
      const first=firstMap.get(String(x.record.cdrNo||'')+'|'+String(x.brandKey||''));
      const pn=smsPreviousNextActivity(x.record);
      return {...x,firstObserved:!!first&&first.id===x.record.id,incidentNear:!!inc&&Math.abs(x.record.dt-inc)<=incidentMs,...pn};
    });
    const filtered=smsReviewFilter(decorated),bursts=smsBurstGroups(filtered,burstMin,burstCount,burstMode),baseline=smsBaselineRows(incidentMin);
    return {rows,A,decorated,filtered,bursts,baseline,inc,incidentMin,burstMin,burstCount,burstMode};
  }

  function renderSmsContext(recordId){
    const panel=$('smsIntelContextPanel');if(!panel)return;
    const focus=state.records.find(r=>String(r.id)===String(recordId));
    if(!focus||!focus.dt){panel.innerHTML='<div class="empty">The selected SMS record is unavailable or has no parsed date/time.</div>';return;}
    state.smsContextRecordId=focus.id;
    const mins=Math.max(1,+$('smsIntelContextMins')?.value||30),span=mins*60000;
    const subject=focus.cdrNo||'',all=state.records.filter(r=>r.dt&&r.cdrNo===subject).sort((a,b)=>a.dt-b.dt),nearby=all.filter(r=>Math.abs(r.dt-focus.dt)<=span),pos=all.findIndex(r=>r.id===focus.id);
    const towerText=r=>r?[r.firstCellId,r.firstAddress].filter(Boolean).join(' • ')||'—':'—';
    let prevTower=null,nextTower=null;
    for(let i=pos-1;i>=0;i--){if(all[i].firstCellId||all[i].firstAddress){prevTower=all[i];break;}}
    for(let i=pos+1;i<all.length;i++){if(all[i].firstCellId||all[i].firstAddress){nextTower=all[i];break;}}
    const calls=nearby.filter(r=>normalize(r.callType).includes('call')).length,sms=nearby.filter(r=>smsLikeRecord(r)).length,otherSenders=new Set(nearby.filter(r=>smsLikeRecord(r)&&r.id!==focus.id).map(r=>r.bparty).filter(Boolean)),idSet=new Set(nearby.map(r=>[r.imsi,r.imei].filter(Boolean).join('|')).filter(Boolean)),bi=senderBrandInfo(focus.bparty);
    const rel=r=>{const d=Math.round((r.dt-focus.dt)/60000);return d===0?'0 min':(d>0?'+':'')+d+' min';};
    panel.innerHTML=`<div class="panel-title"><h3>${escapeHtml(bi?.label||focus.bparty||'SMS event')} context</h3><span class="muted">${escapeHtml(dtFmt(focus.dt))} • ±${fmtInt(mins)} min • ${escapeHtml(subject||'—')}</span></div><div class="notice"><b>Context only:</b> nearby calls, tower records and identifier metadata are time correlations. They do not establish what the SMS contained or what action, if any, caused it.</div><div class="kpis"><div class="kpi"><div class="v">${fmtInt(nearby.length)}</div><div class="l">Nearby CDR events</div></div><div class="kpi"><div class="v">${fmtInt(calls)}</div><div class="l">Calls in window</div></div><div class="kpi"><div class="v">${fmtInt(sms)}</div><div class="l">SMS-like events</div></div><div class="kpi"><div class="v">${fmtInt(otherSenders.size)}</div><div class="l">Other sender IDs</div></div><div class="kpi"><div class="v">${fmtInt(idSet.size)}</div><div class="l">IMSI/IMEI states</div></div></div><div class="metric-row"><span class="metric-chip"><b>Focus tower:</b> ${escapeHtml(towerText(focus))}</span><span class="metric-chip"><b>Previous tower:</b> ${escapeHtml(towerText(prevTower))}${prevTower?' • '+escapeHtml(dtFmt(prevTower.dt)):''}</span><span class="metric-chip"><b>Next tower:</b> ${escapeHtml(towerText(nextTower))}${nextTower?' • '+escapeHtml(dtFmt(nextTower.dt)):''}</span></div><div class="tablewrap" style="margin-top:10px"><table class="table"><thead><tr><th>Offset</th><th>Date / Time</th><th>Event</th><th>Connected party / sender</th><th>Duration</th><th>Tower</th><th>IMEI</th><th>IMSI</th><th>Source</th><th>Action</th></tr></thead><tbody>${nearby.map(r=>`<tr class="${r.id===focus.id?'record-highlight':''}"><td><b>${escapeHtml(rel(r))}</b></td><td>${escapeHtml(dtFmt(r.dt))}</td><td>${typePill(r.callType||'—')}</td><td title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</td><td>${fmtDur(r.duration)}</td><td class="details">${escapeHtml(towerText(r))}</td><td>${escapeHtml(r.imei||'—')}</td><td>${escapeHtml(r.imsi||'—')}</td><td class="details">${escapeHtml((r.sourceFile||'')+(r.rowNumber?' • row '+r.rowNumber:''))}</td><td><button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">View</button></td></tr>`).join('')}</tbody></table></div>`;
    panel.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function exportSmsIntelCsv(){
    const S=smsAnalysisSnapshot(),cell=v=>{const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
    const headers=['Date/Time','Subject','Raw Sender ID','Brand Inference','Recognition','Service Category','Basis','First Observed','Unusual Time','Near Incident','Previous Activity Gap Min','Next Activity Gap Min','Nearby Calls','Nearby IMSI/IMEI Changes','Cell ID','Tower Address','IMEI','IMSI','Source File','Source Sheet','Source Row'];
    const lines=[headers.join(',')];
    for(const x of S.filtered){const r=x.record;lines.push([dtFmt(r.dt),r.cdrNo,x.senderId,x.brand,x.recognition,x.category,x.basis,x.firstObserved?'Yes':'No',x.unusual?'Yes':'No',x.incidentNear?'Yes':'No',x.prevMin??'',x.nextMin??'',x.nearbyCalls,x.nearbyIds,r.firstCellId,r.firstAddress,r.imei,r.imsi,r.sourceFile,r.sourceSheet,r.rowNumber].map(cell).join(','));}
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sms_intelligence_review.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function renderSmsMatrices(S){
    const timeline=S.filtered,subjects=[...new Set(timeline.map(x=>x.record.cdrNo).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true})).slice(0,20);
    const brands=[...new Map(timeline.map(x=>[x.brandKey,{key:x.brandKey,label:x.brand,category:x.category}])).values()].sort((a,b)=>{
      const ca=timeline.filter(x=>x.brandKey===a.key).length,cb=timeline.filter(x=>x.brandKey===b.key).length;return cb-ca||a.label.localeCompare(b.label);
    }).slice(0,30);
    $('smsIntelSubjectMatrix').innerHTML=subjects.length&&brands.length?`<table class="table"><thead><tr><th>Sender / brand</th>${subjects.map(s=>`<th>${escapeHtml(s)}</th>`).join('')}</tr></thead><tbody>${brands.map(b=>`<tr><td><b>${escapeHtml(b.label)}</b><div class="tiny">${escapeHtml(b.category)}</div></td>${subjects.map(s=>`<td class="num">${fmtInt(timeline.filter(x=>x.brandKey===b.key&&x.record.cdrNo===s).length)||''}</td>`).join('')}</tr>`).join('')}</tbody></table>`:'<div class="empty">Load SMS metadata from one or more subjects to build the matrix.</div>';

    const dates=[...new Set(timeline.map(x=>localDateKey(x.record.dt)).filter(Boolean))].sort().slice(-31),topBrands=brands.slice(0,20);
    $('smsIntelDayMatrix').innerHTML=dates.length&&topBrands.length?`<table class="table"><thead><tr><th>Sender / brand</th>${dates.map(d=>`<th title="${escapeHtml(d)}">${escapeHtml(d.slice(5))}</th>`).join('')}</tr></thead><tbody>${topBrands.map(b=>`<tr><td><b>${escapeHtml(b.label)}</b></td>${dates.map(d=>{const n=timeline.filter(x=>x.brandKey===b.key&&localDateKey(x.record.dt)===d).length;return `<td class="num">${n||''}</td>`;}).join('')}</tr>`).join('')}</tbody></table>`:'<div class="empty">No dated SMS metadata is available for the day matrix.</div>';
  }

  function renderSmsIncidentContext(){
    const panel=$('smsIncidentContextPanel');if(!panel)return;
    const inc=incidentDateTime();if(!inc){panel.innerHTML='<div class="notice">Enter Incident Date and Time at the top first.</div>';return;}
    const mins=Math.max(1,+$('smsIntelIncidentMins')?.value||60),span=mins*60000,subject=$('smsIntelCdr')?.value||'',start=new Date(inc-span),end=new Date(inc+span);
    const rows=state.records.filter(r=>r.dt&&r.dt>=start&&r.dt<=end&&(!subject||r.cdrNo===subject)).sort((x,y)=>x.dt-y.dt);
    const idEvents=(analyzeIdentifiers(state.records).events||[]).filter(x=>x.at>=start&&x.at<=end&&(!subject||x.msisdn===subject)).sort((x,y)=>x.at-y.at);
    let towerChanges=0,prevTower='';
    for(const r of rows){const t=String(r.firstCellId||r.firstAddress||'');if(t&&prevTower&&t!==prevTower)towerChanges++;if(t)prevTower=t;}
    const smsCount=rows.filter(smsLikeRecord).length,callCount=rows.filter(r=>normalize(r.callType).includes('call')).length,contacts=new Set(rows.map(r=>r.bparty).filter(Boolean));
    const events=[
      ...rows.map(r=>({at:r.dt,kind:smsLikeRecord(r)?'Service SMS / sender metadata':normalize(r.callType).includes('call')?'Call / voice event':'CDR event',subject:r.cdrNo||'—',detail:smsLikeRecord(r)?((senderBrandInfo(r.bparty)?.label||r.bparty)+' • '+(senderBrandInfo(r.bparty)?.category||'Unclassified')):contactLabel(r.bparty),tower:[r.firstCellId,r.firstAddress].filter(Boolean).join(' • ')||'—',imei:r.imei||'—',imsi:r.imsi||'—',source:(r.sourceFile||'')+(r.rowNumber?' • row '+r.rowNumber:''),recordId:r.id})),
      ...idEvents.map(x=>({at:x.at,kind:'SIM / device identifier change',subject:x.msisdn||'—',detail:x.interpretation||x.type||'Identifier change',tower:'—',imei:x.toImei||x.fromImei||'—',imsi:x.toImsi||x.fromImsi||'—',source:'Identifier analysis',recordId:''}))
    ].sort((x,y)=>x.at-y.at);
    panel.innerHTML=`<div class="notice"><b>Incident Context:</b> chronological metadata within ±${fmtInt(mins)} minutes of ${escapeHtml(dtFmt(inc))}. Timing proximity does not establish causation or the content of any SMS.</div><div class="kpis"><div class="kpi"><div class="v">${fmtInt(events.length)}</div><div class="l">Context events</div></div><div class="kpi"><div class="v">${fmtInt(smsCount)}</div><div class="l">SMS-like events</div></div><div class="kpi"><div class="v">${fmtInt(callCount)}</div><div class="l">Calls</div></div><div class="kpi"><div class="v">${fmtInt(towerChanges)}</div><div class="l">Recorded tower changes</div></div><div class="kpi"><div class="v">${fmtInt(idEvents.length)}</div><div class="l">SIM/device change markers</div></div><div class="kpi"><div class="v">${fmtInt(contacts.size)}</div><div class="l">Connected parties / senders</div></div></div><div class="tablewrap"><table class="table"><thead><tr><th>Offset</th><th>Date / Time</th><th>Type</th><th>Subject</th><th>Detail</th><th>Tower</th><th>IMEI</th><th>IMSI</th><th>Source</th><th>Action</th></tr></thead><tbody>${events.length?events.map(x=>{const off=Math.round((x.at-inc)/60000);return `<tr><td><b>${off===0?'0':(off>0?'+':'')+off} min</b></td><td>${escapeHtml(dtFmt(x.at))}</td><td>${escapeHtml(x.kind)}</td><td>${escapeHtml(x.subject)}</td><td class="details">${escapeHtml(x.detail)}</td><td class="details">${escapeHtml(x.tower)}</td><td>${escapeHtml(x.imei)}</td><td>${escapeHtml(x.imsi)}</td><td class="details">${escapeHtml(x.source)}</td><td>${x.recordId?`<button class="btn secondary small lead-view-record" data-id="${escAttr(x.recordId)}">View record</button>`:'—'}</td></tr>`;}).join(''):'<tr><td colspan="10" class="empty">No CDR or identifier events fall inside this incident window.</td></tr>'}</tbody></table></div>`;
  }

  function renderSmsIntelligence(){
    if(!$('smsIntelSummary'))return;
    const from=$('smsIntelFrom').value,to=$('smsIntelTo').value;
    if(from&&to&&from>to){$('smsIntelSummary').innerHTML='<div class="notice">SMS Intelligence From date cannot be later than To date.</div>';['smsIntelCategoryTable','smsIntelBrandTable','smsIntelTimelineTable','smsIntelBurstsTable','smsIntelUnknownTable','smsIntelBaselineTable'].forEach(id=>{if($(id))$(id).innerHTML='';});return;}
    const S=smsAnalysisSnapshot(),A=S.A,decorated=S.filtered,inc=S.inc;
    const categories=[...new Set(S.decorated.map(x=>x.category).filter(Boolean))].sort(),catEl=$('smsIntelFilterCategory'),curCat=catEl?.value||'';
    if(catEl){catEl.innerHTML='<option value="">All categories</option>'+categories.map(x=>`<option value="${escAttr(x)}">${escapeHtml(x)}</option>`).join('');if(categories.includes(curCat))catEl.value=curCat;}
    const unusual=decorated.filter(x=>x.unusual).length,callLinked=decorated.filter(x=>x.nearbyCalls>0).length,idLinked=decorated.filter(x=>x.nearbyIds>0).length,explicit=decorated.filter(x=>x.basis==='Explicit SMS event').length,inferred=decorated.filter(x=>x.basis==='Sender-ID inference').length,firstObserved=decorated.filter(x=>x.firstObserved).length,incidentNear=decorated.filter(x=>x.incidentNear).length,crossSubject=A.brands.filter(x=>x.subjects.size>1).length,unknown=decorated.filter(x=>x.recognition==='Unclassified').length;
    $('smsIntelSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(A.rawCount)}</div><div class="l">Raw SMS candidates</div></div><div class="kpi"><div class="v">${fmtInt(A.uniqueCount)}</div><div class="l">Unique SMS events</div></div><div class="kpi"><div class="v">${fmtInt(A.duplicateCount)}</div><div class="l">Duplicate rows excluded</div></div><div class="kpi"><div class="v">${fmtInt(decorated.length)}</div><div class="l">Displayed after review filters</div></div><div class="kpi"><div class="v">${fmtInt(explicit)}</div><div class="l">Explicit SMS events</div></div><div class="kpi"><div class="v">${fmtInt(inferred)}</div><div class="l">Sender-ID inferred</div></div><div class="kpi"><div class="v">${fmtInt(firstObserved)}</div><div class="l">First-observed senders</div></div><div class="kpi"><div class="v">${fmtInt(S.bursts.length)}</div><div class="l">SMS bursts</div><div class="s">${fmtInt(S.burstCount)}+ • ≤ ${fmtInt(S.burstMin)} min</div></div><div class="kpi"><div class="v">${fmtInt(incidentNear)}</div><div class="l">Near incident</div><div class="s">±${fmtInt(S.incidentMin)} min</div></div><div class="kpi"><div class="v">${fmtInt(crossSubject)}</div><div class="l">Cross-subject brands</div></div><div class="kpi"><div class="v">${fmtInt(unknown)}</div><div class="l">Unclassified senders</div></div><div class="kpi"><div class="v">${fmtInt(unusual)}</div><div class="l">Unusual-time SMS</div></div><div class="kpi"><div class="v">${fmtInt(callLinked)}</div><div class="l">SMS with call ±${A.callWindowMin}m</div></div><div class="kpi"><div class="v">${fmtInt(idLinked)}</div><div class="l">SMS near ID change ±${A.idWindowMin}m</div></div></div>`;

    const unknownMap=new Map();
    for(const x of S.decorated.filter(x=>x.recognition==='Unclassified')){let z=unknownMap.get(x.senderId);if(!z)z={sender:x.senderId,count:0,subjects:new Set(),days:new Set(),first:null,last:null};z.count++;if(x.record.cdrNo)z.subjects.add(x.record.cdrNo);z.days.add(localDateKey(x.record.dt));if(!z.first||x.record.dt<z.first)z.first=x.record.dt;if(!z.last||x.record.dt>z.last)z.last=x.record.dt;unknownMap.set(x.senderId,z);}
    const unknownRows=[...unknownMap.values()].sort((a,b)=>b.count-a.count||a.sender.localeCompare(b.sender));
    $('smsIntelUnknownTable').innerHTML=`<thead><tr><th>Raw sender ID</th><th>Events</th><th>Subjects</th><th>Active days</th><th>First</th><th>Last</th><th>Action</th></tr></thead><tbody>${unknownRows.length?unknownRows.map(x=>`<tr><td><b>${escapeHtml(x.sender)}</b></td><td>${fmtInt(x.count)}</td><td class="details">${escapeHtml([...x.subjects].join(', ')||'—')}</td><td>${fmtInt(x.days.size)}</td><td>${escapeHtml(dtFmt(x.first))}</td><td>${escapeHtml(dtFmt(x.last))}</td><td><button class="btn secondary small sms-edit-sender" data-sender="${escAttr(x.sender)}">Edit sender</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">No unclassified sender IDs in the current loaded data.</td></tr>'}</tbody>`;

    $('smsIntelBaselineTable').innerHTML=inc?`<thead><tr><th>Sender / brand</th><th>Category</th><th>Near incident</th><th>Prior 7 days</th><th>Prior 30 days</th><th>Expected in incident window from 7-day rate</th><th>Rate ratio</th><th>Status</th></tr></thead><tbody>${S.baseline.length?S.baseline.map(x=>`<tr><td><b>${escapeHtml(x.label)}</b></td><td>${escapeHtml(x.category)}</td><td>${fmtInt(x.near)}</td><td>${fmtInt(x.prior7)}</td><td>${fmtInt(x.prior30)}</td><td>${x.expected7.toFixed(2)}</td><td>${x.ratio7==null?'—':x.ratio7.toFixed(1)+'×'}</td><td class="details">${escapeHtml(x.status)}</td></tr>`).join(''):'<tr><td colspan="8" class="empty">No SMS sender activity is available for the incident/baseline comparison.</td></tr>'}</tbody>`:'<tbody><tr><td class="empty">Enter Incident Date and Time at the top to compare against 7-day and 30-day baselines.</td></tr></tbody>';

    renderSmsMatrices(S);

    const firstRows=decorated.filter(x=>x.firstObserved).slice(0,20),incidentRows=decorated.filter(x=>x.incidentNear).sort((a,b)=>Math.abs(a.record.dt-inc)-Math.abs(b.record.dt-inc)).slice(0,20),crossRows=A.brands.filter(x=>x.subjects.size>1).slice(0,20).map(x=>({...x,closestGap:smsCrossSubjectClosestGap(S.decorated,x.key)}));
    $('smsIntelInsights').innerHTML=`<div class="split"><div><h4>First-observed senders in current view</h4>${firstRows.length?firstRows.map(x=>`<div class="note-card"><b>${escapeHtml(x.brand)}</b> • ${escapeHtml(x.category)} • ${escapeHtml(dtFmt(x.record.dt))}<br><span class="tiny">${escapeHtml(x.record.cdrNo||'—')} • ${escapeHtml(x.senderId)} • ${escapeHtml(x.recognition)}</span> <button class="lead-action sms-context" data-id="${escAttr(x.record.id)}">Show context</button></div>`).join(''):'<div class="empty">No first-observed sender matches the current review filters.</div>'}</div><div><h4>Incident-near SMS metadata</h4>${inc?(incidentRows.length?incidentRows.map(x=>`<div class="note-card"><b>${escapeHtml(x.brand)}</b> • ${escapeHtml(dtFmt(x.record.dt))} • ${Math.round((x.record.dt-inc)/60000)>=0?'+':''}${fmtInt(Math.round((x.record.dt-inc)/60000))} min<br><span class="tiny">${escapeHtml(x.record.cdrNo||'—')} • ${escapeHtml(x.senderId)}</span> <button class="lead-action sms-context" data-id="${escAttr(x.record.id)}">Show context</button></div>`).join(''):'<div class="empty">No SMS candidate falls within the selected incident proximity.</div>'):'<div class="empty">Enter Incident Date and Time at the top.</div>'}</div></div><h4 style="margin-top:14px">Cross-subject sender overlap</h4>${crossRows.length?`<div class="tablewrap"><table class="table"><thead><tr><th>Brand inference</th><th>Category</th><th>Subjects</th><th>SMS candidates</th><th>Closest cross-subject gap</th><th>Raw sender IDs</th></tr></thead><tbody>${crossRows.map(x=>`<tr><td><b>${escapeHtml(x.label)}</b></td><td>${escapeHtml(x.category)}</td><td class="details">${escapeHtml([...x.subjects].join(', '))}</td><td>${fmtInt(x.count)}</td><td>${x.closestGap==null?'—':x.closestGap.toFixed(1)+' min'}</td><td class="details">${escapeHtml([...x.senderIds].join(', '))}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No recognizable brand appears under more than one loaded subject.</div>'}`;

    const catMap=new Map();for(const x of decorated){let z=catMap.get(x.category);if(!z)z={category:x.category,count:0,brands:new Set(),senderIds:new Set(),first:null,last:null,unusual:0};z.count++;z.brands.add(x.brand);z.senderIds.add(x.senderId);if(x.unusual)z.unusual++;if(!z.first||x.record.dt<z.first)z.first=x.record.dt;if(!z.last||x.record.dt>z.last)z.last=x.record.dt;catMap.set(x.category,z);}
    $('smsIntelCategoryTable').innerHTML=`<thead><tr><th>Service category inference</th><th>SMS candidates</th><th>Brands</th><th>Raw sender IDs</th><th>First SMS</th><th>Last SMS</th><th>Unusual-time</th></tr></thead><tbody>${[...catMap.values()].sort((a,b)=>b.count-a.count).map(x=>`<tr><td><b>${escapeHtml(x.category)}</b></td><td class="num">${fmtInt(x.count)}</td><td class="details">${escapeHtml([...x.brands].join(', '))}</td><td class="num">${fmtInt(x.senderIds.size)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td class="num">${fmtInt(x.unusual)}</td></tr>`).join('')}</tbody>`;

    const brandMap=new Map();for(const x of decorated){let z=brandMap.get(x.brandKey);if(!z)z={key:x.brandKey,label:x.brand,recognition:x.recognition,category:x.category,senderIds:new Set(),count:0,first:null,last:null,days:new Set(),hours:Array(24).fill(0),firstObserved:0,incidentNear:0,unusual:0,subjects:new Set(),towers:new Set(),nearCalls:0,nearIds:0};z.senderIds.add(x.senderId);z.count++;z.days.add(localDateKey(x.record.dt));z.hours[x.record.dt.getHours()]++;if(x.firstObserved)z.firstObserved++;if(x.incidentNear)z.incidentNear++;if(x.unusual)z.unusual++;if(x.record.cdrNo)z.subjects.add(x.record.cdrNo);if(x.record.firstCellId||x.record.firstAddress)z.towers.add(x.record.firstCellId||x.record.firstAddress);z.nearCalls+=x.nearbyCalls;z.nearIds+=x.nearbyIds;if(!z.first||x.record.dt<z.first)z.first=x.record.dt;if(!z.last||x.record.dt>z.last)z.last=x.record.dt;brandMap.set(x.brandKey,z);}
    $('smsIntelBrandTable').innerHTML=`<thead><tr><th>Brand inference</th><th>Recognition</th><th>Classification basis</th><th>Service category</th><th>Raw sender ID(s)</th><th>SMS</th><th>First SMS</th><th>Last SMS</th><th>Active days</th><th>Peak hour</th><th>First observed</th><th>Incident-near</th><th>Unusual-time</th><th>Subjects</th><th>Towers</th><th>Nearby calls</th><th>Nearby ID changes</th><th>Edit</th></tr></thead><tbody>${[...brandMap.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label)).map(x=>{const mx=Math.max(...x.hours),h=mx?x.hours.indexOf(mx):null,raw=[...x.senderIds][0]||'';return `<tr><td><b>${escapeHtml(x.label)}</b></td><td>${escapeHtml(x.recognition)}</td><td class="details">${escapeHtml((S.decorated.find(y=>y.brandKey===x.key)?.classificationBasis)||'Sender-ID metadata classification')}</td><td>${escapeHtml(x.category)}</td><td class="details">${escapeHtml([...x.senderIds].join(', '))}</td><td class="num">${fmtInt(x.count)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td class="num">${fmtInt(x.days.size)}</td><td>${h===null?'—':String(h).padStart(2,'0')+':00 ('+fmtInt(mx)+')'}</td><td class="num">${fmtInt(x.firstObserved)}</td><td class="num">${fmtInt(x.incidentNear)}</td><td class="num">${fmtInt(x.unusual)}</td><td class="details">${escapeHtml([...x.subjects].join(', ')||'—')}</td><td class="num">${fmtInt(x.towers.size)}</td><td class="num">${fmtInt(x.nearCalls)}</td><td class="num">${fmtInt(x.nearIds)}</td><td><button class="btn secondary small sms-edit-sender" data-sender="${escAttr(raw)}">Edit sender</button></td></tr>`}).join('')}</tbody>`;

    $('smsIntelBurstsTable').innerHTML=`<thead><tr><th>Subject</th><th>Start</th><th>End</th><th>SMS events</th><th>Brands</th><th>Categories</th><th>Raw senders</th><th>Action</th></tr></thead><tbody>${S.bursts.length?S.bursts.slice(0,200).map(x=>`<tr><td>${escapeHtml(x.subject)}</td><td>${escapeHtml(dtFmt(x.start))}</td><td>${escapeHtml(dtFmt(x.end))}</td><td>${fmtInt(x.events.length)}</td><td class="details">${escapeHtml([...x.brands].join(', '))}</td><td class="details">${escapeHtml([...x.categories].join(', '))}</td><td class="details">${escapeHtml([...x.senderIds].join(', '))}</td><td><button class="btn secondary small sms-context" data-id="${escAttr(x.events[0].record.id)}">Show context</button></td></tr>`).join(''):'<tr><td colspan="8" class="empty">No burst matches the selected gap, minimum-event count and burst mode.</td></tr>'}</tbody>`;

    $('smsIntelTimelineTable').innerHTML=`<thead><tr><th>Select</th><th>Date / Time</th><th>Subject</th><th>Sender ID</th><th>Brand inference</th><th>Recognition</th><th>Classification basis</th><th>Service category</th><th>Event basis</th><th>Flags</th><th>Prev gap</th><th>Next gap</th><th>Tower metadata</th><th>IMEI</th><th>IMSI</th><th>Calls ±${A.callWindowMin}m</th><th>ID changes ±${A.idWindowMin}m</th><th>Source</th><th>Actions</th></tr></thead><tbody>${decorated.slice(0,3000).map(x=>{const r=x.record,flags=[x.firstObserved?'First observed':'',x.unusual?'Unusual time':'',x.incidentNear?'Near incident':''].filter(Boolean);return `<tr><td><input type="checkbox" class="sms-review-check" data-id="${escAttr(r.id)}" ${state.smsReviewSelected.has(r.id)?'checked':''}></td><td>${dtFmt(r.dt)}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td>${escapeHtml(x.senderId)}</td><td><b>${escapeHtml(x.brand)}</b></td><td>${escapeHtml(x.recognition)}</td><td class="details">${escapeHtml(x.classificationBasis||'Sender-ID metadata classification')}</td><td>${escapeHtml(x.category)}</td><td>${escapeHtml(x.basis)}</td><td class="details">${flags.length?flags.map(f=>'<span class="pill">'+escapeHtml(f)+'</span>').join(' '):'—'}</td><td>${x.prevMin==null?'—':fmtInt(x.prevMin)+' min'}</td><td>${x.nextMin==null?'—':fmtInt(x.nextMin)+' min'}</td><td class="details">${escapeHtml(r.firstAddress||r.firstCellId||'—')}</td><td>${escapeHtml(r.imei||'—')}</td><td>${escapeHtml(r.imsi||'—')}</td><td class="num">${fmtInt(x.nearbyCalls)}</td><td class="num">${fmtInt(x.nearbyIds)}</td><td>${escapeHtml(r.sourceFile||'')} • row ${r.rowNumber||''}</td><td style="white-space:nowrap"><button class="btn secondary small sms-context" data-id="${escAttr(r.id)}">Context</button> <button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">Record</button> <button class="btn secondary small sms-open-movement" data-id="${escAttr(r.id)}" data-subject="${escAttr(r.cdrNo||'')}">Movement @ time</button> <button class="btn secondary small sms-add-chronology" data-id="${escAttr(r.id)}">Chronology</button> <button class="btn secondary small sms-filter-sender" data-subject="${escAttr(r.cdrNo||'')}" data-sender="${escAttr(r.bparty||'')}">Sender records</button> <button class="btn secondary small sms-edit-sender" data-sender="${escAttr(r.bparty||'')}">Edit sender</button></td></tr>`}).join('')}</tbody>`;
    if($('smsSelectedCount'))$('smsSelectedCount').textContent=fmtInt(state.smsReviewSelected.size);
  }

  function renderIncident(){
    const inc=incidentDateTime();
    if(!inc){$('incidentSummary').innerHTML='<div class="notice">Enter Incident Date and Incident Time at the top first.</div>';$('baselineCompare').innerHTML='';$('contactChanges').innerHTML='';$('incidentTable').innerHTML='';return;}
    const beforeH=+$('incidentBeforeHours').value||6,duringM=+$('incidentDuringMins').value||30,afterH=+$('incidentAfterHours').value||6;
    const start=new Date(inc-beforeH*3600000),duringStart=new Date(inc-duringM*60000),duringEnd=new Date(inc+duringM*60000),end=new Date(inc+afterH*3600000);
    const scoped=subjectEventScopedRecords(state.records);
    const rows=scoped.filter(r=>r.dt&&r.dt>=start&&r.dt<=end).sort((a,b)=>a.dt-b.dt);
    const before=rows.filter(r=>r.dt<duringStart),during=rows.filter(r=>r.dt>=duringStart&&r.dt<=duringEnd),after=rows.filter(r=>r.dt>duringEnd);
    $('incidentSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(before.length)}</div><div class="l">Before</div><div class="s">${beforeH} hours</div></div><div class="kpi"><div class="v">${fmtInt(during.length)}</div><div class="l">During</div><div class="s">±${duringM} min</div></div><div class="kpi"><div class="v">${fmtInt(after.length)}</div><div class="l">After</div><div class="s">${afterH} hours</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(r=>r.bparty).filter(Boolean)).size)}</div><div class="l">Contacts</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(r=>r.firstCellId).filter(Boolean)).size)}</div><div class="l">Towers</div></div></div>`;
    const baseStart=new Date(inc-30*86400000),baseRows=scoped.filter(r=>r.dt&&r.dt>=baseStart&&r.dt<start);
    const baseDays=Math.max(1,new Set(baseRows.map(r=>localDateKey(r.dt))).size);
    const incidentContacts=new Set(rows.map(r=>r.bparty).filter(Boolean)),baseContacts=new Set(baseRows.map(r=>r.bparty).filter(Boolean));
    const incidentTowers=new Set(rows.map(r=>r.firstCellId).filter(Boolean)),baseTowers=new Set(baseRows.map(r=>r.firstCellId).filter(Boolean));
    const newContacts=[...incidentContacts].filter(x=>!baseContacts.has(x)),newTowers=[...incidentTowers].filter(x=>!baseTowers.has(x));
    $('baselineCompare').innerHTML=simpleTable(['Metric','30-day baseline','Incident window'],[['Events',fmtInt(baseRows.length)+' total / '+(baseRows.length/baseDays).toFixed(1)+' per day',fmtInt(rows.length)],['Unique contacts',fmtInt(baseContacts.size),fmtInt(incidentContacts.size)],['Unique towers',fmtInt(baseTowers.size),fmtInt(incidentTowers.size)],['Contacts not in baseline','—',fmtInt(newContacts.length)],['Towers not in baseline','—',fmtInt(newTowers.length)]]);
    const allContacts=aggregateContacts(scoped),near=7*86400000;
    const changed=allContacts.filter(x=>(x.first&&Math.abs(x.first-inc)<=near)||(x.last&&Math.abs(x.last-inc)<=near)).slice(0,80);
    $('contactChanges').innerHTML=simpleTable(['Contact','First seen','Last seen','Indicator'],changed.map(x=>{const firstNear=x.first&&Math.abs(x.first-inc)<=near,lastNear=x.last&&Math.abs(x.last-inc)<=near;const label=firstNear&&lastNear?'Short-window contact':firstNear?'First seen near incident':'Last seen near incident';return [`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}">${escapeHtml(contactLabel(x.bparty))}</a>`,dtFmt(x.first),dtFmt(x.last),label];}));


    $('incidentTable').innerHTML=`<thead><tr><th>Period</th><th>Date / Time</th><th>Subject</th><th>Contact</th><th>Type</th><th>Duration</th><th>Tower</th><th>IMEI</th><th>IMSI</th><th>Source</th></tr></thead><tbody>${rows.slice(0,2000).map(r=>{const period=r.dt<duringStart?'Before':r.dt<=duringEnd?'During':'After';return `<tr><td><span class="pill">${period}</span></td><td>${escapeHtml(dtFmt(r.dt))}</td><td>${escapeHtml(r.cdrNo)}</td><td><a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</a></td><td>${typePill(r.callType)}</td><td>${fmtDur(r.duration)}</td><td class="details">${escapeHtml(r.firstAddress||r.firstCellId)}</td><td>${escapeHtml(r.imei)}</td><td>${escapeHtml(r.imsi)}</td><td>${escapeHtml(r.sourceFile)} • row ${r.rowNumber}</td></tr>`}).join('')}</tbody>`;
  }


  function renderDaySummary(){
    const m=new Map();for(const r of state.filtered){if(!r.dt)continue;const d=localDateKey(r.dt);let x=m.get(d)||{date:d,first:null,firstType:'',last:null,lastType:'',events:0,calls:0,sms:0,contacts:new Set(),towers:new Set(),imei:new Set(),imsi:new Set(),night:0};x.events++;const t=normalize(r.callType);if(t.includes('call'))x.calls++;if(t.includes('sms'))x.sms++;if(r.bparty)x.contacts.add(r.bparty);if(r.firstCellId)x.towers.add(r.firstCellId);if(r.imei)x.imei.add(r.imei);if(r.imsi)x.imsi.add(r.imsi);if(!x.first||r.dt<x.first){x.first=r.dt;x.firstType=r.callType||'';}if(!x.last||r.dt>x.last){x.last=r.dt;x.lastType=r.callType||'';}if(r.dt.getHours()>=20||r.dt.getHours()<6)x.night++;m.set(d,x);}
    const rows=[...m.values()].sort((a,b)=>a.date.localeCompare(b.date));$('daySummaryTable').innerHTML=`<thead><tr><th>Date</th><th>First activity</th><th>Last activity</th><th>Events</th><th>Calls</th><th>SMS</th><th>Contacts</th><th>Towers</th><th>IMEI</th><th>IMSI</th><th>Night events</th></tr></thead><tbody>${rows.map(x=>`<tr><td><button class="btn secondary small day-filter" data-date="${x.date}">${x.date}</button></td><td>${dtFmt(x.first)} <span class="tiny">•</span> ${typePill(x.firstType)}</td><td>${dtFmt(x.last)} <span class="tiny">•</span> ${typePill(x.lastType)}</td><td>${fmtInt(x.events)}</td><td>${fmtInt(x.calls)}</td><td>${fmtInt(x.sms)}</td><td>${fmtInt(x.contacts.size)}</td><td>${fmtInt(x.towers.size)}</td><td>${fmtInt(x.imei.size)}</td><td>${fmtInt(x.imsi.size)}</td><td>${fmtInt(x.night)}</td></tr>`).join('')}</tbody>`;
  }

  function renderPatterns(){
    const data=state.filtered.filter(r=>r.dt),total=data.length,dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if(!total){
      $('patternSummary').innerHTML='<div class="empty">No dated records match the current filters.</div>';
      ['patternWeekdayTable','patternEventTypeTable','patternRegularContactsTable','patternUnusualHoursTable','patternTimeBandTable','patternHighDatesTable','patternContactHourTable','patternWeekdayContactHourTable'].forEach(id=>$(id).innerHTML='');
      $('patternNarrative').innerHTML='';
      $('hourMatrix').innerHTML='';$('contactDayMatrix').innerHTML='';return;
    }

    const activeDates=[...new Set(data.map(r=>localDateKey(r.dt)))].sort(),activeDayCount=activeDates.length;
    const hourCounts=Array(24).fill(0),weekdayCounts=Array(7).fill(0),weekdayDates=Array.from({length:7},()=>new Set()),typeMap=new Map(),nightRows=[],weekendRows=[];
    for(const r of data){
      const h=r.dt.getHours(),w=r.dt.getDay(),date=localDateKey(r.dt),type=String(r.callType||'—');
      hourCounts[h]++;weekdayCounts[w]++;weekdayDates[w].add(date);
      if(h>=20||h<6)nightRows.push(r);if(w===0||w===6)weekendRows.push(r);
      let t=typeMap.get(type);if(!t)t={type,count:0,days:new Set(),hours:Array(24).fill(0)};t.count++;t.days.add(date);t.hours[h]++;typeMap.set(type,t);
    }
    const peakHour=Math.max(...hourCounts),peakHourIndex=hourCounts.indexOf(peakHour),peakWeekday=Math.max(...weekdayCounts),peakWeekdayIndex=weekdayCounts.indexOf(peakWeekday);
    const pct=n=>total?(100*n/total):0;
    const weekdayEvents=total-weekendRows.length;
    const commonHourThreshold=Math.max(1,Math.ceil(peakHour*.2));
    const lowHours=hourCounts.map((count,h)=>({h,count})).filter(x=>x.count>0&&x.count<=commonHourThreshold).sort((a,b)=>a.count-b.count||a.h-b.h);
    const lowHourSet=new Set(lowHours.map(x=>x.h)),lowHourEvents=data.filter(r=>lowHourSet.has(r.dt.getHours())).length;
    const weekdayActiveDates=new Set(data.filter(r=>![0,6].includes(r.dt.getDay())).map(r=>localDateKey(r.dt))).size;
    const weekendActiveDates=new Set(data.filter(r=>[0,6].includes(r.dt.getDay())).map(r=>localDateKey(r.dt))).size;
    const weekdayRate=weekdayActiveDates?weekdayEvents/weekdayActiveDates:0,weekendRate=weekendActiveDates?weekendRows.length/weekendActiveDates:0;
    const weekendRateRatio=weekdayRate?weekendRate/weekdayRate:null;
    const topHours=hourCounts.map((count,h)=>({h,count})).sort((a,b)=>b.count-a.count||a.h-b.h).slice(0,3),top3Events=topHours.reduce((s,x)=>s+x.count,0);
    const bandDefs=[['Overnight','00:00–05:59',0,6],['Morning','06:00–11:59',6,12],['Afternoon','12:00–17:59',12,18],['Evening','18:00–23:59',18,24]];
    const timeBands=bandDefs.map(([name,label,start,end])=>{const rows=data.filter(r=>{const h=r.dt.getHours();return h>=start&&h<end});return {name,label,count:rows.length,days:new Set(rows.map(r=>localDateKey(r.dt))).size};}).sort((a,b)=>b.count-a.count);
    const dateCountMap=new Map();for(const r of data){const d=localDateKey(r.dt);dateCountMap.set(d,(dateCountMap.get(d)||0)+1);}
    const dateCounts=activeDates.map(date=>({date,count:dateCountMap.get(date)||0}));
    const dayMean=activeDayCount?total/activeDayCount:0,daySd=activeDayCount?Math.sqrt(dateCounts.reduce((s,x)=>s+(x.count-dayMean)**2,0)/activeDayCount):0,highDateThreshold=dayMean+2*daySd;
    const highDates=activeDayCount>=5?dateCounts.filter(x=>x.count>highDateThreshold).sort((a,b)=>b.count-a.count||a.date.localeCompare(b.date)):[];
    const contactHourMap=new Map();
    for(const r of data){
      if(!r.bparty)continue;
      const h=r.dt.getHours(),key=r.bparty+'|'+h;
      let x=contactHourMap.get(key);
      if(!x)x={num:r.bparty,h,count:0,days:new Set(),types:new Set(),first:null,last:null};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');
      if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;
      contactHourMap.set(key,x);
    }
    const contactHourMinDays=Math.max(2,Math.min(5,Math.ceil(activeDayCount*.20)));
    const recurringContactHours=[...contactHourMap.values()].filter(x=>x.days.size>=contactHourMinDays).sort((a,b)=>b.days.size-a.days.size||b.count-a.count||a.h-b.h);
    const topRecurringContactHour=recurringContactHours[0]||null;
    const weekdayContactHourMap=new Map();
    for(const r of data){
      if(!r.bparty)continue;
      const w=r.dt.getDay(),h=r.dt.getHours(),key=r.bparty+'|'+w+'|'+h;
      let x=weekdayContactHourMap.get(key);
      if(!x)x={num:r.bparty,w,h,count:0,days:new Set(),types:new Set(),first:null,last:null};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');
      if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;
      weekdayContactHourMap.set(key,x);
    }
    const recurringWeekdayContactHours=[...weekdayContactHourMap.values()].map(x=>{
      x.possible=weekdayDates[x.w].size;
      x.minDays=Math.max(2,Math.min(4,Math.ceil(x.possible*.35)));
      x.coverage=x.possible?100*x.days.size/x.possible:0;
      return x;
    }).filter(x=>x.possible>=2&&x.days.size>=x.minDays).sort((a,b)=>b.coverage-a.coverage||b.days.size-a.days.size||b.count-a.count||a.w-b.w||a.h-b.h);
    const topWeekdayContactHour=recurringWeekdayContactHours[0]||null;

    $('patternSummary').innerHTML=`<div class="kpis">
      <div class="kpi"><div class="v">${String(peakHourIndex).padStart(2,'0')}:00–${String((peakHourIndex+1)%24).padStart(2,'0')}:00</div><div class="l">Most active hour</div><div class="s">${fmtInt(peakHour)} event(s) • ${pct(peakHour).toFixed(1)}%</div></div>
      <div class="kpi"><div class="v">${dayNames[peakWeekdayIndex]}</div><div class="l">Most active weekday</div><div class="s">${fmtInt(peakWeekday)} event(s) • ${pct(peakWeekday).toFixed(1)}%</div></div>
      <div class="kpi"><div class="v">${pct(nightRows.length).toFixed(1)}%</div><div class="l">Night activity</div><div class="s">20:00–05:59 • ${fmtInt(nightRows.length)} event(s)</div></div>
      <div class="kpi"><div class="v">${pct(weekendRows.length).toFixed(1)}%</div><div class="l">Weekend activity</div><div class="s">${fmtInt(weekendRows.length)} weekend • ${fmtInt(weekdayEvents)} weekday</div></div>
      <div class="kpi"><div class="v">${fmtInt(activeDayCount)}</div><div class="l">Active dates</div><div class="s">${fmtInt(total)} filtered event(s)</div></div>
      <div class="kpi"><div class="v">${pct(lowHourEvents).toFixed(1)}%</div><div class="l">Lower-frequency-hour events</div><div class="s">${fmtInt(lowHourEvents)} event(s) across ${fmtInt(lowHours.length)} hour band(s)</div></div>
      <div class="kpi"><div class="v">${fmtInt(recurringContactHours.length)}</div><div class="l">Recurring contact-hour patterns</div><div class="s">At least ${fmtInt(contactHourMinDays)} separate active dates</div></div>
      <div class="kpi"><div class="v">${fmtInt(recurringWeekdayContactHours.length)}</div><div class="l">Weekday + contact + hour patterns</div><div class="s">Adaptive threshold from active same-weekday dates</div></div>
    </div>`;

    $('patternWeekdayTable').innerHTML=`<thead><tr><th>Weekday</th><th>Events</th><th>%</th><th>Active dates</th><th>Avg / active date</th></tr></thead><tbody>${dayNames.map((name,w)=>`<tr><td>${name}</td><td class="num">${fmtInt(weekdayCounts[w])}</td><td class="num">${pct(weekdayCounts[w]).toFixed(1)}%</td><td class="num">${fmtInt(weekdayDates[w].size)}</td><td class="num">${weekdayDates[w].size?(weekdayCounts[w]/weekdayDates[w].size).toFixed(1):'0.0'}</td></tr>`).join('')}</tbody>`;

    const types=[...typeMap.values()].sort((a,b)=>b.count-a.count);
    $('patternEventTypeTable').innerHTML=`<thead><tr><th>Event type</th><th>Events</th><th>%</th><th>Active dates</th><th>Peak hour</th></tr></thead><tbody>${types.map(x=>{const mx=Math.max(...x.hours),h=x.hours.indexOf(mx);return `<tr><td>${typePill(x.type)}</td><td class="num">${fmtInt(x.count)}</td><td class="num">${pct(x.count).toFixed(1)}%</td><td class="num">${fmtInt(x.days.size)}</td><td>${String(h).padStart(2,'0')}:00 <span class="tiny">(${fmtInt(mx)})</span></td></tr>`}).join('')}</tbody>`;

    const contacts=new Map();
    for(const r of data){
      if(!r.bparty)continue;let x=contacts.get(r.bparty);if(!x)x={num:r.bparty,count:0,days:new Set(),first:null,last:null,types:new Set()};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;contacts.set(r.bparty,x);
    }
    const allRecurring=[...contacts.values()].sort((a,b)=>b.days.size-a.days.size||b.count-a.count),recurring=allRecurring.slice(0,20);
    const recurringThreshold=Math.max(2,Math.ceil(activeDayCount*.30)),regularContacts=allRecurring.filter(x=>x.days.size>=recurringThreshold),topContact=allRecurring[0]||null;
    const weekendComparison=weekendRateRatio===null?'No weekday active-date baseline is available.':weekendRateRatio>1.15?`Weekend activity is ${weekendRateRatio.toFixed(2)}x the weekday active-date rate.`:weekendRateRatio<0.85?`Weekend activity is ${weekendRateRatio.toFixed(2)}x the weekday active-date rate.`:`Weekend and weekday active-date rates are broadly similar (${weekendRateRatio.toFixed(2)}x).`;
    const highDateText=activeDayCount<5?'At least 5 active dates are needed for the high-activity-date check.':highDates.length?`${highDates.length} date(s) exceed the mean + 2 SD threshold (${highDateThreshold.toFixed(1)} events).`:`No active date exceeds the mean + 2 SD threshold (${highDateThreshold.toFixed(1)} events).`;
    $('patternNarrative').innerHTML=`<b>Automatic pattern summary</b><div style='margin-top:6px;line-height:1.65'>Peak activity is <b>${String(peakHourIndex).padStart(2,'0')}:00–${String((peakHourIndex+1)%24).padStart(2,'0')}:00</b>; the three busiest hours contain <b>${pct(top3Events).toFixed(1)}%</b> of filtered events.<br><b>${dayNames[peakWeekdayIndex]}</b> has the highest raw event count. ${escapeHtml(weekendComparison)}<br>Night activity (20:00–05:59) is <b>${pct(nightRows.length).toFixed(1)}%</b>. The leading six-hour band is <b>${escapeHtml(timeBands[0]?.name||'—')}</b> (${escapeHtml(timeBands[0]?.label||'')}).<br>${topContact?`Most recurrent contact: <b>${escapeHtml(contactLabel(topContact.num))}</b> on ${fmtInt(topContact.days.size)} of ${fmtInt(activeDayCount)} active dates (${(100*topContact.days.size/activeDayCount).toFixed(1)}%). `:''}${fmtInt(regularContacts.length)} contact(s) appear on at least ${fmtInt(recurringThreshold)} active dates (30% baseline).<br>${escapeHtml(highDateText)}</div>`;
    if(topRecurringContactHour){
      $('patternNarrative').innerHTML+=`<div style='margin-top:4px'>Strongest same-contact/same-hour recurrence: <b>${escapeHtml(contactLabel(topRecurringContactHour.num))}</b> at <b>${String(topRecurringContactHour.h).padStart(2,'0')}:00–${String((topRecurringContactHour.h+1)%24).padStart(2,'0')}:00</b> on ${fmtInt(topRecurringContactHour.days.size)} separate dates. ${fmtInt(recurringContactHours.length)} pattern(s) meet the current ${fmtInt(contactHourMinDays)}-date threshold.</div>`;
    }
    if(topWeekdayContactHour){
      $('patternNarrative').innerHTML+=`<div style='margin-top:4px'>Strongest same-weekday/contact/hour recurrence: <b>${escapeHtml(contactLabel(topWeekdayContactHour.num))}</b> on <b>${dayNames[topWeekdayContactHour.w]}</b> at <b>${String(topWeekdayContactHour.h).padStart(2,'0')}:00–${String((topWeekdayContactHour.h+1)%24).padStart(2,'0')}:00</b>, appearing on ${fmtInt(topWeekdayContactHour.days.size)} of ${fmtInt(topWeekdayContactHour.possible)} active ${dayNames[topWeekdayContactHour.w]} date(s) (${topWeekdayContactHour.coverage.toFixed(1)}% coverage). ${fmtInt(recurringWeekdayContactHours.length)} weekday/contact/hour pattern(s) meet their adaptive recurrence threshold.</div>`;
    }
    $('patternTimeBandTable').innerHTML=`<thead><tr><th>Time band</th><th>Events</th><th>%</th><th>Active dates</th><th>Avg / active date</th></tr></thead><tbody>${timeBands.map(x=>`<tr><td>${escapeHtml(x.name)} <span class='tiny'>• ${escapeHtml(x.label)}</span></td><td class='num'>${fmtInt(x.count)}</td><td class='num'>${pct(x.count).toFixed(1)}%</td><td class='num'>${fmtInt(x.days)}</td><td class='num'>${x.days?(x.count/x.days).toFixed(1):'0.0'}</td></tr>`).join('')}</tbody>`;
    $('patternHighDatesTable').innerHTML=`<thead><tr><th>Date</th><th>Events</th><th>Vs active-date mean</th></tr></thead><tbody>${activeDayCount<5?`<tr><td colspan='3' class='empty'>Need at least 5 active dates for this statistical check.</td></tr>`:highDates.length?highDates.map(x=>`<tr><td><button class='link day-filter' data-date='${x.date}'>${x.date}</button></td><td class='num'>${fmtInt(x.count)}</td><td class='num'>${dayMean?(x.count/dayMean).toFixed(2)+'x':'—'}</td></tr>`).join(''):`<tr><td colspan='3' class='empty'>No date exceeds mean + 2 SD (${highDateThreshold.toFixed(1)} events).</td></tr>`}</tbody>`;
    $('patternRegularContactsTable').innerHTML=`<thead><tr><th>Contact</th><th>Active dates</th><th>Date coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurring.map(x=>`<tr><td><a href="#" class="link contact-filter" data-num="${escAttr(x.num)}" title="${escAttr(contactTitle(x.num))}">${escapeHtml(contactLabel(x.num))}</a></td><td class="num">${fmtInt(x.days.size)}</td><td class="num">${activeDayCount?(100*x.days.size/activeDayCount).toFixed(1):'0.0'}%</td><td class="num">${fmtInt(x.count)}</td><td class="details">${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join('')}</tbody>`;

    $('patternContactHourTable').innerHTML=`<thead><tr><th>Contact</th><th>Hour band</th><th>Active dates</th><th>Date coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurringContactHours.length?recurringContactHours.slice(0,30).map(x=>`<tr><td><button class='link pattern-contact-hour-filter' data-num='${escAttr(x.num)}' data-hour='${x.h}' title='${escAttr(contactTitle(x.num))}'>${escapeHtml(contactLabel(x.num))}</button></td><td><button class='link pattern-contact-hour-filter' data-num='${escAttr(x.num)}' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class='num'>${fmtInt(x.days.size)}</td><td class='num'>${activeDayCount?(100*x.days.size/activeDayCount).toFixed(1):'0.0'}%</td><td class='num'>${fmtInt(x.count)}</td><td class='details'>${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join(''):`<tr><td colspan='8' class='empty'>No contact repeats in the same hour across at least ${fmtInt(contactHourMinDays)} separate active dates under the current filters.</td></tr>`}</tbody>`;

    $('patternWeekdayContactHourTable').innerHTML=`<thead><tr><th>Contact</th><th>Weekday</th><th>Hour band</th><th>Matched dates</th><th>Active weekday dates</th><th>Coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurringWeekdayContactHours.length?recurringWeekdayContactHours.slice(0,40).map(x=>`<tr><td><button class='link pattern-weekday-contact-hour-filter' data-num='${escAttr(x.num)}' data-weekday='${x.w}' data-hour='${x.h}' title='${escAttr(contactTitle(x.num))}'>${escapeHtml(contactLabel(x.num))}</button></td><td>${dayNames[x.w]}</td><td><button class='link pattern-weekday-contact-hour-filter' data-num='${escAttr(x.num)}' data-weekday='${x.w}' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class='num'>${fmtInt(x.days.size)}</td><td class='num'>${fmtInt(x.possible)}</td><td class='num'>${x.coverage.toFixed(1)}%</td><td class='num'>${fmtInt(x.count)}</td><td class='details'>${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join(''):`<tr><td colspan='10' class='empty'>No same-weekday/contact/hour recurrence meets the adaptive threshold under the current filters.</td></tr>`}</tbody>`;
    $('patternUnusualHoursTable').innerHTML=`<thead><tr><th>Hour</th><th>Events</th><th>% of total</th><th>% of peak-hour count</th><th>Active dates</th></tr></thead><tbody>${lowHours.length?lowHours.map(x=>{const ds=new Set(data.filter(r=>r.dt.getHours()===x.h).map(r=>localDateKey(r.dt)));return `<tr><td><button class='link pattern-hour-filter' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class="num">${fmtInt(x.count)}</td><td class="num">${pct(x.count).toFixed(1)}%</td><td class="num">${peakHour?(100*x.count/peakHour).toFixed(1):'0.0'}%</td><td class="num">${fmtInt(ds.size)}</td></tr>`}).join(''):`<tr><td colspan="5" class="empty">No lower-frequency active hours under the current 20% threshold.</td></tr>`}</tbody>`;

    const days=activeDates.slice(-31),matrix={};let max=1;
    for(const d of days)matrix[d]=Array(24).fill(0);
    for(const r of data){const d=localDateKey(r.dt);if(matrix[d]){matrix[d][r.dt.getHours()]++;max=Math.max(max,matrix[d][r.dt.getHours()]);}}
    $('hourMatrix').innerHTML=`<table class="table"><thead><tr><th>Date</th>${Array.from({length:24},(_,h)=>`<th>${String(h).padStart(2,'0')}</th>`).join('')}</tr></thead><tbody>${days.map(d=>`<tr><td><button class='link day-filter' data-date='${d}'>${d}</button></td>${matrix[d].map((v,h)=>`<td title="${v} event(s)" style="text-align:center;background:rgba(21,94,239,${v?0.08+0.72*v/max:0})">${v?`<button class='link pattern-hour-date-filter' data-date='${d}' data-hour='${h}' title='Open ${v} matching record(s)'>${v}</button>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    const top=aggregateContacts(data).slice(0,20),cd={};let cmax=1;
    for(const x of top){cd[x.bparty]={};for(const d of days)cd[x.bparty][d]=0;}
    for(const r of data){if(!cd[r.bparty])continue;const d=localDateKey(r.dt);if(d in cd[r.bparty]){cd[r.bparty][d]++;cmax=Math.max(cmax,cd[r.bparty][d]);}}
    $('contactDayMatrix').innerHTML=`<h3>Contact-by-day matrix</h3><div class="tiny" style="margin-bottom:6px">Top 20 contacts within the current filters across the latest 31 filtered dates.</div><div class="tablewrap"><table class="table"><thead><tr><th>Contact</th>${days.map(d=>`<th>${d.slice(5)}</th>`).join('')}</tr></thead><tbody>${top.map(x=>`<tr><td title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</td>${days.map(d=>{const v=cd[x.bparty][d]||0;return `<td title="${v} event(s)" style="text-align:center;background:rgba(181,71,8,${v?0.08+0.72*v/cmax:0})">${v||''}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function qualitySnapshot(){
    const data=subjectEventScopedRecords(state.records);
    const signature=r=>[r.cdrNo,r.bparty,r.dt?+r.dt:'',Number(r.duration)||0,r.callType,r.firstCellId].join('|');
    const groups=new Map();
    for(const r of data){const k=signature(r);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    const duplicateGroups=[...groups.entries()].filter(([,rows])=>rows.length>1);
    const duplicateKeys=new Set(duplicateGroups.map(([k])=>k));
    const issues={
      duplicates:{
        label:'Rows in duplicate-signature groups',
        rows:data.filter(r=>duplicateKeys.has(signature(r))),
        impact:'Can inflate event counts, contact frequency, duration totals and pattern summaries when the same records were imported more than once.'
      },
      missingDate:{
        label:'Missing date / time',
        rows:data.filter(r=>!r.dt),
        impact:'Weakens chronology, incident-window analysis, night activity, peak-hour analysis and movement sequencing.'
      },
      missingSubject:{
        label:'Missing subject / CDR No.',
        rows:data.filter(r=>!r.cdrNo),
        impact:'Prevents reliable attribution to an A-party and weakens subject-wise, Cross-CDR and relationship analysis.'
      },
      missingParty:{
        label:'Missing connected party / B Party',
        rows:data.filter(r=>!r.bparty),
        impact:'Weakens contact frequency, relationship analysis, communication network and pair-level review.'
      },
      missingTower:{
        label:'Missing tower',
        rows:data.filter(r=>!r.firstCellId&&!r.firstAddress),
        impact:'Weakens movement, common-tower, location-match and night-stay analysis.'
      },
      missingCoords:{
        label:'Missing coordinates',
        rows:data.filter(r=>r.lat==null||r.lng==null),
        impact:'Prevents map plotting and distance calculations for those rows. Cell-ID/address based tower analysis may still remain usable.'
      }
    };
    const issueIds=new Set();
    for(const x of Object.values(issues))for(const r of x.rows)issueIds.add(r.id);
    const extraDuplicateRows=duplicateGroups.reduce((sum,[,rows])=>sum+Math.max(0,rows.length-1),0);
    return {data,signature,groups,duplicateGroups,issues,issueIds,extraDuplicateRows};
  }

  function qualityGroupRows(q,field,missingLabel){
    const m=new Map();
    for(const r of q.data){
      const key=String(r[field]||'').trim()||missingLabel;
      let x=m.get(key);
      if(!x)x={key,total:0,missingDate:0,missingSubject:0,missingParty:0,missingTower:0,missingCoords:0,duplicateRows:0};
      x.total++;
      if(!r.dt)x.missingDate++;
      if(!r.cdrNo)x.missingSubject++;
      if(!r.bparty)x.missingParty++;
      if(!r.firstCellId&&!r.firstAddress)x.missingTower++;
      if(r.lat==null||r.lng==null)x.missingCoords++;
      if((q.groups.get(q.signature(r))||[]).length>1)x.duplicateRows++;
      m.set(key,x);
    }
    return [...m.values()].sort((a,b)=>b.total-a.total||String(a.key).localeCompare(String(b.key),undefined,{numeric:true}));
  }

  function renderQualityDrilldown(issueKey){
    const box=$('qualityDrilldown');if(!box)return;
    const q=qualitySnapshot(),issue=q.issues[issueKey];
    if(!issue){box.innerHTML='<div class="empty">Choose an issue above to inspect its affected records.</div>';return;}
    const rows=issue.rows.slice(0,300);
    box.innerHTML=`<div class="panel-title"><h3>${escapeHtml(issue.label)}</h3><span class="muted">${fmtInt(issue.rows.length)} affected row(s)${issue.rows.length>300?' • showing first 300':''}</span></div><div class="notice">${escapeHtml(issue.impact)}</div><div class="tablewrap"><table class="table"><thead><tr><th>Date / Time</th><th>Subject</th><th>B Party</th><th>Event</th><th>Cell / Tower</th><th>Source</th><th>Action</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${escapeHtml(dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim()||'—')}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(r.bparty?contactLabel(r.bparty):'—')}</td><td>${escapeHtml(r.callType||'—')}</td><td class="details">${escapeHtml([r.firstCellId,r.firstAddress].filter(Boolean).join(' • ')||'—')}</td><td class="details">${escapeHtml([r.sourceFile,r.sourceSheet,r.rowNumber?('row '+r.rowNumber):''].filter(Boolean).join(' / ')||'—')}</td><td><button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">View record</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">No affected records.</td></tr>'}</tbody></table></div>`;
  }

  function qualityMappingWarnings(fileRows){
    const checks=[
      ['missingDate','Date / time','Timeline, chronology, night activity and movement ordering'],
      ['missingSubject','Subject / CDR No.','Subject-wise, Cross-CDR and relationship analysis'],
      ['missingParty','B Party / connected number','Contact, network and relationship analysis'],
      ['missingTower','Tower / Cell ID','Movement, location match, common towers and night stay']
    ];
    const out=[];
    for(const x of fileRows){
      if(x.total<5)continue;
      for(const [field,label,impact] of checks){
        const n=Number(x[field]||0),share=x.total?n/x.total:0;
        if(share>=0.8)out.push({file:x.key,field,label,impact,count:n,total:x.total,share});
      }
    }
    return out.sort((a,b)=>b.share-a.share||b.count-a.count||String(a.file).localeCompare(String(b.file)));
  }

  function exportQualityCsv(){
    const q=qualitySnapshot();
    const issueNames=new Map();
    for(const [key,x] of Object.entries(q.issues))for(const r of x.rows){if(!issueNames.has(r.id))issueNames.set(r.id,[]);issueNames.get(r.id).push(x.label);}
    const cell=v=>{const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
    const headers=['Issues','CDR No','B Party','Date/Time','Event Type','Duration Seconds','First Cell ID','First Tower Address','Latitude','Longitude','IMEI','IMSI','Source File','Source Sheet','Source Row'];
    const lines=[headers.join(',')];
    for(const r of q.data){
      const issues=issueNames.get(r.id)||[];
      if(!issues.length)continue;
      lines.push([issues.join(' | '),r.cdrNo,r.bparty,dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim(),r.callType,r.duration,r.firstCellId,r.firstAddress,r.lat??'',r.lng??'',r.imei,r.imsi,r.sourceFile,r.sourceSheet,r.rowNumber].map(cell).join(','));
    }
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='cdr_data_quality_issues.csv';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function renderDataQuality(){
    const q=qualitySnapshot(),total=q.data.length,affected=q.issueIds.size,clean=Math.max(0,total-affected);
    const pct=n=>total?((n*100/total).toFixed(1)+'%'):'0.0%';
    const issueOrder=['duplicates','missingDate','missingSubject','missingParty','missingTower','missingCoords'];
    const subjectRows=qualityGroupRows(q,'cdrNo','— Missing subject —').slice(0,100);
    const fileRows=qualityGroupRows(q,'sourceFile','— Unknown source file —').slice(0,100);
    const mappingWarnings=qualityMappingWarnings(fileRows);
    const groupTable=(rows,kind)=>`<div class="tablewrap"><table class="table"><thead><tr><th>Name</th><th>Records</th><th>Missing date</th><th>Missing subject</th><th>Missing B Party</th><th>Missing tower</th><th>Missing coordinates</th><th>Duplicate-group rows</th><th>Action</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td class="details">${escapeHtml(x.key)}</td><td>${fmtInt(x.total)}</td><td>${fmtInt(x.missingDate)}</td><td>${fmtInt(x.missingSubject)}</td><td>${fmtInt(x.missingParty)}</td><td>${fmtInt(x.missingTower)}</td><td>${fmtInt(x.missingCoords)}</td><td>${fmtInt(x.duplicateRows)}</td><td>${((kind==='subject'&&x.key!=='— Missing subject —')||(kind==='file'&&x.key!=='— Unknown source file —'))?`<button class="btn secondary small quality-scope-records" data-kind="${kind}" data-value="${escAttr(x.key)}">Open records</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">No data.</td></tr>'}</tbody></table></div>`;
    const dupRows=q.duplicateGroups.slice(0,100).map(([,rows])=>{
      const r=rows[0];
      return `<tr><td>${fmtInt(rows.length)}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(r.bparty?contactLabel(r.bparty):'—')}</td><td>${escapeHtml(dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim()||'—')}</td><td>${escapeHtml(r.callType||'—')}</td><td>${escapeHtml(r.firstCellId||'—')}</td><td class="details">${escapeHtml(rows.map(x=>[x.sourceFile,x.sourceSheet,x.rowNumber?('row '+x.rowNumber):''].filter(Boolean).join(' / ')).join(' | '))}</td><td><button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">View sample</button></td></tr>`;
    }).join('');
    $('qualitySummary').innerHTML=`
      <div class="notice">These checks describe the structure of the loaded CDR rows. A missing field does not automatically make an entire CDR unusable; it indicates which downstream analyses may be incomplete or unavailable for the affected rows.</div>
      <div class="subtoolbar no-print" style="margin:10px 0"><button class="btn secondary small" id="qualityExportBtn">Export quality issues CSV</button><span class="tiny">Exports only rows that have at least one listed quality issue.</span></div>
      <div class="kpis">
        <div class="kpi"><div class="v">${fmtInt(total)}</div><div class="l">Records checked</div></div>
        <div class="kpi"><div class="v">${fmtInt(affected)}</div><div class="l">Rows with ≥1 issue</div><div class="s">${pct(affected)}</div></div>
        <div class="kpi"><div class="v">${fmtInt(clean)}</div><div class="l">Rows without listed issues</div><div class="s">${pct(clean)}</div></div>
        <div class="kpi"><div class="v">${fmtInt(q.duplicateGroups.length)}</div><div class="l">Duplicate groups</div></div>
        <div class="kpi"><div class="v">${fmtInt(q.extraDuplicateRows)}</div><div class="l">Extra duplicate rows</div></div>
      </div>
      <h3>Issues requiring review</h3>
      <div class="tablewrap"><table class="table"><thead><tr><th>Check</th><th>Affected rows</th><th>Share</th><th>Why it matters</th><th>Review</th></tr></thead><tbody>
        ${issueOrder.map(k=>{const x=q.issues[k];return `<tr><td><b>${escapeHtml(x.label)}</b></td><td>${fmtInt(x.rows.length)}</td><td>${pct(x.rows.length)}</td><td class="details">${escapeHtml(x.impact)}</td><td><button class="btn secondary small quality-review" data-issue="${k}">View affected</button></td></tr>`}).join('')}
      </tbody></table></div>
      <div id="qualityDrilldown" style="margin-top:16px"><div class="empty">Choose “View affected” to inspect the source rows for an issue.</div></div>
      <h3 style="margin-top:20px">Potential file mapping / metadata problems</h3>
      <div class="tiny" style="margin-bottom:6px">A warning appears when at least 80% of a file's rows (minimum 5 rows) are missing the same key field. This is a prompt to review the source export or column mapping, not proof that the file was parsed incorrectly.</div>
      <div class="tablewrap"><table class="table"><thead><tr><th>File</th><th>Field</th><th>Affected</th><th>Share</th><th>Analysis affected</th><th>Action</th></tr></thead><tbody>${mappingWarnings.length?mappingWarnings.map(x=>`<tr><td class="details">${escapeHtml(x.file)}</td><td><b>${escapeHtml(x.label)}</b></td><td>${fmtInt(x.count)} / ${fmtInt(x.total)}</td><td>${(x.share*100).toFixed(1)}%</td><td class="details">${escapeHtml(x.impact)}</td><td>${x.file!=='— Unknown source file —'?`<button class="btn secondary small quality-scope-records" data-kind="file" data-value="${escAttr(x.file)}">Open file records</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">No strong file-level missing-field concentration detected.</td></tr>'}</tbody></table></div>
      <h3 style="margin-top:20px">Likely duplicate groups</h3>
      <div class="tiny" style="margin-bottom:6px">A duplicate signature uses Subject + B Party + Date/Time + Duration + Event Type + First Cell ID. Matching signatures can be genuine repeated records in some provider exports, so review the source rows before removing anything.</div>
      <div class="tablewrap"><table class="table"><thead><tr><th>Rows</th><th>Subject</th><th>B Party</th><th>Date / Time</th><th>Event</th><th>Cell ID</th><th>Sources</th><th>Action</th></tr></thead><tbody>${dupRows||'<tr><td colspan="8" class="empty">No duplicate-signature groups found.</td></tr>'}</tbody></table></div>
      <h3 style="margin-top:20px">Quality by subject</h3>
      <div class="tiny" style="margin-bottom:6px">Use this to identify whether missing fields are concentrated in one subject/CDR rather than across the whole upload.</div>
      ${groupTable(subjectRows,'subject')}
      <h3 style="margin-top:20px">Quality by imported file</h3>
      <div class="tiny" style="margin-bottom:6px">Useful for spotting a provider/export file whose column mapping or metadata is incomplete.</div>
      ${groupTable(fileRows,'file')}
    `;
  }

  function findBursts(data,mins,minCount){const by=new Map();for(const r of data){if(!r.dt||!r.bparty)continue;const k=`${r.cdrNo}|${r.bparty}`;if(!by.has(k))by.set(k,[]);by.get(k).push(r);}const out=[];const win=mins*60000;for(const [k,a] of by){a.sort((x,y)=>x.dt-y.dt);let left=0,best=null;for(let right=0;right<a.length;right++){while(a[right].dt-a[left].dt>win)left++;const count=right-left+1;if(count>=minCount&&(!best||count>best.count))best={count,start:a[left].dt,end:a[right].dt,records:a.slice(left,right+1)};}if(best){const [cdr,bparty]=k.split('|');out.push({cdr,bparty,...best});}}return out.sort((a,b)=>b.count-a.count||a.start-b.start);}
  function identifierUsage(cdr,field){
    const m=new Map();
    for(const r of state.filtered){
      if(r.cdrNo!==cdr)continue;
      const id=String(r[field]||'').trim(); if(!id)continue;
      let x=m.get(id);
      if(!x)x={id,first:null,last:null,count:0,device:''};
      x.count++;
      if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;
      if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;
      if(field==='imei'&&!x.device)x.device=[r.manufacturer,r.deviceType].filter(Boolean).join(' • ');
      m.set(id,x);
    }
    return [...m.values()].sort((a,b)=>(a.first?.getTime?.()||0)-(b.first?.getTime?.()||0));
  }
  function deviceChangeDetailsHtml(cdr){
    const imeis=identifierUsage(cdr,'imei'),imsis=identifierUsage(cdr,'imsi');
    const rows=[
      ...imeis.map(x=>['IMEI',x.id,x.device||'—',x.first,x.last,x.count]),
      ...imsis.map(x=>['IMSI',x.id,'—',x.first,x.last,x.count])
    ];
    if(!rows.length)return '<div class="muted">No identifier timestamps are available in the current filter.</div>';
    return `<div class="device-change-body"><div class="tiny" style="margin-bottom:6px">First/last use shown within the current filtered CDR records.</div><div style="overflow:auto"><table><thead><tr><th>Type</th><th>Identifier</th><th>Device</th><th>First use</th><th>Last use</th><th>Records</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td><td>${escapeHtml(dtFmt(r[3])||'—')}</td><td>${escapeHtml(dtFmt(r[4])||'—')}</td><td>${fmtInt(r[5])}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function buildLeads(){const data=state.filtered,identifierAnalysis=analyzeIdentifiers(data),contacts=aggregateContacts(data),counts=contacts.map(x=>x.records),p95=percentile(counts,.95),burstM=+$('burstMins')?.value||10,burstC=+$('burstCount')?.value||3,longSec=+$('longCallSec')?.value||600;const high=contacts.filter(x=>x.records>=Math.max(5,p95)).slice(0,20);const bursts=findBursts(data,burstM,burstC).slice(0,30);const night=aggregateContacts(data.filter(r=>{if(!r.dt)return false;const h=r.dt.getHours();return h>=22||h<6;})).slice(0,20);const longCalls=data.filter(r=>normalize(r.callType).includes('call')&&r.duration>=longSec).sort((a,b)=>b.duration-a.duration).slice(0,30);const cf=data.filter(r=>r.callForward&&normalize(r.callForward)!=='no'&&normalize(r.callForward)!=='false'&&normalize(r.callForward)!=='0');const byCdr=new Map();for(const r of data){if(!r.cdrNo)continue;if(!byCdr.has(r.cdrNo))byCdr.set(r.cdrNo,{imei:new Set(),imsi:new Set()});if(r.imei)byCdr.get(r.cdrNo).imei.add(r.imei);if(r.imsi)byCdr.get(r.cdrNo).imsi.add(r.imsi);}const deviceChanges=[...byCdr].filter(([,x])=>x.imei.size>1||x.imsi.size>1);const roam={};for(const r of data){if(r.roaming)roam[r.roaming]=(roam[r.roaming]||0)+1;}const inc=incidentDateTime();let incident=[];if(inc){const h=(+$('incidentWindowHours').value||6)*3600000;incident=data.filter(r=>r.dt&&Math.abs(r.dt-inc)<=h).sort((a,b)=>Math.abs(a.dt-inc)-Math.abs(b.dt-inc)).slice(0,100);}return {high,p95,bursts,night,longCalls,cf,deviceChanges,identifierAnalysis,roam,incident,inc};}
  function renderLeads(){if(!$('leadsContent'))return;const L=buildLeads();const leadCard=(title,big,why,body)=>`<div class="lead-card"><h4>${title}</h4><div class="big">${big}</div><div class="why">${why}</div><div class="lead-list">${body||'<span class="muted">No matching items in the current filter.</span>'}</div></div>`;const html=[];html.push(leadCard('High-frequency contacts',fmtInt(L.high.length),`Contacts at or above the current 95th percentile (${Math.round(L.p95||0)} records).`,L.high.map(x=>`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${fmtInt(x.records)} events, ${fmtDur(x.duration)} <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Communication bursts',fmtInt(L.bursts.length),`${$('burstCount').value} or more events with the same contact inside ${$('burstMins').value} minutes.`,L.bursts.map(x=>`${escapeHtml(x.cdr||'Subject')} ↔ <a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${x.count} events, ${dtFmt(x.start)} <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Night activity contacts',fmtInt(L.night.length),'Most active contacts between 22:00 and 05:59 in the current filter.',L.night.map(x=>`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${x.records} events <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Long calls',fmtInt(L.longCalls.length),`Calls at or above ${$('longCallSec').value} seconds.`,L.longCalls.map(r=>`${dtFmt(r.dt)} — <a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</a> — ${fmtDur(r.duration)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));html.push(leadCard('Device / SIM changes',fmtInt(L.deviceChanges.length),'Click a subject to view first and last use of every IMEI / IMSI in the current filtered period.',L.deviceChanges.map(([cdr,x])=>`<details class="device-change-detail"><summary>${escapeHtml(cdr)} — ${x.imei.size} IMEI, ${x.imsi.size} IMSI</summary>${deviceChangeDetailsHtml(cdr)}</details>`).join('')));
html.push(leadCard('MSISDN → multiple IMSIs',fmtInt(L.identifierAnalysis.msisdnNewImsi.length),'Subject numbers observed with more than one IMSI in the current filter. This may indicate SIM/subscription replacement or another subscription-profile change.',L.identifierAnalysis.msisdnNewImsi.slice(0,30).map(x=>`${escapeHtml(x.msisdn)} — ${x.imsis.size} IMSIs: ${escapeHtml([...x.imsis].join(', '))}<br>`).join('')));
html.push(leadCard('Same IMSI → multiple IMEIs',fmtInt(L.identifierAnalysis.imsiNewImei.length),'The same SIM/subscription identity was observed with more than one handset identifier.',L.identifierAnalysis.imsiNewImei.slice(0,30).map(x=>`${escapeHtml(x.imsi)} — ${x.imeis.size} IMEIs: ${escapeHtml([...x.imeis].join(', '))}<br>`).join('')));
html.push(leadCard('Same IMEI → multiple IMSIs',fmtInt(L.identifierAnalysis.imeiMultiImsi.length),'More than one SIM/subscription identity was observed with the same handset identifier.',L.identifierAnalysis.imeiMultiImsi.slice(0,30).map(x=>`${escapeHtml(x.imei)} — ${x.imsis.size} IMSIs: ${escapeHtml([...x.imsis].join(', '))}<br>`).join('')));
html.push(leadCard('IMSI cross-CDR linkage',fmtInt(L.identifierAnalysis.imsiCrossCdr.length),'IMSI values appearing under multiple subject numbers or across multiple imported CDR files. Treat as a linkage lead requiring corroboration.',L.identifierAnalysis.imsiCrossCdr.slice(0,30).map(x=>`${escapeHtml(x.imsi)} — subjects: ${escapeHtml([...x.msisdns].join(', ')||'—')} — files: ${fmtInt(x.files.size)}<br>`).join('')));
html.push(leadCard('Repeated identifier changes',fmtInt(L.identifierAnalysis.repeatedSwaps.length),'Subjects with three or more IMSI/IMEI transition events in the current filtered period; shown for manual review only.',L.identifierAnalysis.repeatedSwaps.slice(0,30).map(x=>`${escapeHtml(x.msisdn)} — ${fmtInt(x.count)} transitions • ${fmtInt(x.imsis.size)} IMSI • ${fmtInt(x.imeis.size)} IMEI<br>`).join('')));html.push(leadCard('Roaming labels',fmtInt(Object.keys(L.roam).length),'Network roaming/circle labels appearing in the filtered records.',Object.entries(L.roam).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${escapeHtml(k)} — ${fmtInt(v)} events<br>`).join('')));html.push(leadCard('Call-forward indicators',fmtInt(L.cf.length),'Rows where the CallForward field contains a non-empty/non-false value.',L.cf.slice(0,30).map(r=>`${dtFmt(r.dt)} — ${escapeHtml(contactLabel(r.bparty))} — ${escapeHtml(r.callForward)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));html.push(leadCard('Incident-window events',fmtInt(L.incident.length),L.inc?`Nearest events within ±${$('incidentWindowHours').value} hours of ${dtFmt(L.inc)}.`:'Enter incident date/time at the top to populate this lead.',L.incident.slice(0,30).map(r=>`${dtFmt(r.dt)} — ${escapeHtml(contactLabel(r.bparty))} — ${escapeHtml(r.firstAddress||r.firstCellId)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));$('leadsContent').innerHTML=`<div class="notice">These are rule-based review prompts only. Frequency, night activity, roaming, device change, same-cell use or call patterns do not establish identity, intent, presence or wrongdoing by themselves.</div><div class="lead-grid">${html.join('')}</div>`;}


    function bind(){
      $('smsIntelRefreshBtn').onclick=renderSmsIntelligence;
      if($('smsIntelExportBtn'))$('smsIntelExportBtn').onclick=exportSmsIntelCsv;
      $('smsIntelCdr').onchange=e=>setSubjectEventScope(e.target.value,$('callType')?.value||'');
      ['smsIntelFrom','smsIntelTo','smsIntelNightFrom','smsIntelNightTo','smsIntelCallMins','smsIntelIdMins','smsIntelContextMins','smsIntelBurstMins','smsIntelBurstMinCount','smsIntelBurstMode','smsIntelIncidentMins','smsIntelFilterCategory','smsIntelFilterRecognition','smsIntelFirstOnly','smsIntelIncidentOnly','smsIntelUnusualOnly'].forEach(id=>{if($(id))$(id).onchange=renderSmsIntelligence;});
      if($('smsIntelSearch'))$('smsIntelSearch').oninput=renderSmsIntelligence;
      if($('smsIntelClearReviewFilters'))$('smsIntelClearReviewFilters').onclick=()=>{['smsIntelSearch','smsIntelFilterCategory','smsIntelFilterRecognition'].forEach(id=>{if($(id))$(id).value='';});['smsIntelFirstOnly','smsIntelIncidentOnly','smsIntelUnusualOnly'].forEach(id=>{if($(id))$(id).checked=false;});renderSmsIntelligence();};
      document.addEventListener('change',e=>{if(e.target.classList.contains('sms-review-check')){const id=e.target.dataset.id;e.target.checked?state.smsReviewSelected.add(id):state.smsReviewSelected.delete(id);if($('smsSelectedCount'))$('smsSelectedCount').textContent=fmtInt(state.smsReviewSelected.size);}});
      document.addEventListener('click',e=>{
        const ctx=e.target.closest('.sms-context');if(ctx){e.preventDefault();renderSmsContext(ctx.dataset.id);return;}
        const preset=e.target.closest('.sms-context-preset');if(preset){e.preventDefault();if($('smsIntelContextMins'))$('smsIntelContextMins').value=preset.dataset.mins||30;if(state.smsContextRecordId)renderSmsContext(state.smsContextRecordId);return;}
        const mov=e.target.closest('.sms-open-movement');if(mov){e.preventDefault();const r=state.records.find(x=>String(x.id)===String(mov.dataset.id));if(r?.dt){state.smsMovementFocus={recordId:r.id,subject:r.cdrNo,at:+r.dt};if($('cdrNo'))$('cdrNo').value=r.cdrNo||'';if($('movementCdr'))$('movementCdr').value=r.cdrNo||'';if($('movementDateFrom'))$('movementDateFrom').value=localDateKey(r.dt);if($('movementDateTo'))$('movementDateTo').value=localDateKey(r.dt);setSubjectEventScope(r.cdrNo||'','');window.CDRApp?.switchTab?.('movement');}return;}
        const chr=e.target.closest('.sms-add-chronology');if(chr){e.preventDefault();const r=state.records.find(x=>String(x.id)===String(chr.dataset.id));if(r&&!state.chronology.some(x=>x.recordId===r.id)){state.chronology.push({id:'sms'+r.id,recordId:r.id,time:+r.dt,source:'SMS Intelligence',text:`${r.bparty||'Sender'} • ${r.callType||'SMS metadata'}`,reference:`${r.sourceFile||''} / ${r.sourceSheet||''} / row ${r.rowNumber||''}`});}window.CDRApp?.switchTab?.('chronology');return;}
        const sf=e.target.closest('.sms-filter-sender');if(sf){e.preventDefault();if($('bparty'))$('bparty').value=sf.dataset.sender||'';setSubjectEventScope(sf.dataset.subject||'','');window.CDRApp?.switchTab?.('records');return;}
        const edit=e.target.closest('.sms-edit-sender');if(edit){e.preventDefault();const raw=edit.dataset.sender||'',bi=senderBrandInfo(raw);if($('smsSenderRaw'))$('smsSenderRaw').value=raw;if($('smsSenderLabel'))$('smsSenderLabel').value=bi?.label||'';if($('smsSenderCategory'))$('smsSenderCategory').value=bi?.category||'Other / Unclassified';if($('smsSenderMappingStatus'))$('smsSenderMappingStatus').textContent=(getSmsSenderOverride(raw)?'Manual mapping loaded for ':'Auto inference loaded for ')+raw;return;}
        if(e.target.closest('#smsSenderSaveBtn')){e.preventDefault();const raw=$('smsSenderRaw')?.value.trim()||'',label=$('smsSenderLabel')?.value.trim()||'',category=$('smsSenderCategory')?.value||'Other / Unclassified';if(raw){const token=senderBrandInfo(raw)?.key||'',applyAliases=!!$('smsSenderApplyAliases')?.checked,aliases=applyAliases&&token?[...new Set(state.records.map(r=>r.bparty).filter(v=>v&&senderBrandInfo(v)?.key===token))]:[raw];for(const v of aliases)setSmsSenderOverride(v,{label,category,recognition:'Manual'});if($('smsSenderMappingStatus'))$('smsSenderMappingStatus').textContent='Saved manual mapping for '+fmtInt(aliases.length)+' sender ID(s).';renderSmsIntelligence();}return;}
        if(e.target.closest('#smsSenderClearBtn')){e.preventDefault();const raw=$('smsSenderRaw')?.value.trim()||'';if(raw){const token=senderBrandInfo(raw)?.key||'',applyAliases=!!$('smsSenderApplyAliases')?.checked,aliases=applyAliases&&token?[...new Set(state.records.map(r=>r.bparty).filter(v=>v&&senderBrandInfo(v)?.key===token))]:[raw];let removed=0;for(const v of aliases)if(clearSmsSenderOverride(v))removed++;if($('smsSenderMappingStatus'))$('smsSenderMappingStatus').textContent='Removed '+fmtInt(removed)+' manual sender mapping(s).';renderSmsIntelligence();}return;}
        if(e.target.closest('#smsIncidentContextBtn')){e.preventDefault();renderSmsIncidentContext();return;}
        if(e.target.closest('#smsSelectDisplayedBtn')){e.preventDefault();for(const x of smsAnalysisSnapshot().filtered.slice(0,3000))state.smsReviewSelected.add(x.record.id);renderSmsIntelligence();return;}
        if(e.target.closest('#smsClearSelectedBtn')){e.preventDefault();state.smsReviewSelected.clear();renderSmsIntelligence();return;}
        if(e.target.closest('#smsAddSelectedChronologyBtn')){e.preventDefault();for(const id of state.smsReviewSelected){const r=state.records.find(x=>String(x.id)===String(id));if(r&&!state.chronology.some(x=>x.recordId===r.id))state.chronology.push({id:'sms'+r.id,recordId:r.id,time:+(r.dt||new Date()),source:'SMS Intelligence',text:`${r.bparty||'Sender'} • ${r.callType||'SMS metadata'}`,reference:`${r.sourceFile||''} / ${r.sourceSheet||''} / row ${r.rowNumber||''}`});}window.CDRApp?.switchTab?.('chronology');return;}
      });
      $('incidentRefreshBtn').onclick=renderIncident;
      $('leadsRefreshBtn').onclick=renderLeads;
      document.addEventListener('click',e=>{
        const q=e.target.closest('.quality-review');if(q){e.preventDefault();renderQualityDrilldown(q.dataset.issue||'');return;}
        if(e.target.closest('#qualityExportBtn')){e.preventDefault();exportQualityCsv();return;}
        const scope=e.target.closest('.quality-scope-records');if(scope){
          e.preventDefault();
          if(scope.dataset.kind==='subject'){if($('cdrNo'))$('cdrNo').value=scope.dataset.value||'';if($('sourceFile'))$('sourceFile').value='';}
          if(scope.dataset.kind==='file'){if($('sourceFile'))$('sourceFile').value=scope.dataset.value||'';if($('cdrNo'))$('cdrNo').value='';}
          $('applyBtn')?.click();window.CDRApp?.switchTab?.('records');
        }
      });
    }

    return {
      renderSmsIntelligence,renderSmsContext,renderSmsIncidentContext,smsAnalysisSnapshot,exportSmsIntelCsv,renderIncident,renderDaySummary,renderPatterns,renderDataQuality,exportQualityCsv,
      findBursts,identifierUsage,deviceChangeDetailsHtml,buildLeads,renderLeads,bind
    };
  };
})();
