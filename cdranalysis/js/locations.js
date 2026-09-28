(() => {
  'use strict';
  window.CDRLocationsFactory = function(ctx){
    const {$,state,uniq,escAttr,escapeHtml,localDateKey,locationTowerKey,fmtInt,dtFmt,aggregateLocations,fmtDur}=ctx;
  function mapLink(x){if(x.lat!==null&&x.lng!==null)return `<a class="link" target="_blank" rel="noopener" href="https://www.google.com/maps?q=${encodeURIComponent(x.lat+','+x.lng)}">Open map</a>`;return ''}
  function renderLocationMatchSubjects(){
    const el=$('locationMatchSubjects');if(!el)return;
    const subjects=uniq('cdrNo'),available=new Set(subjects);
    state.locationMatchSelected=new Set([...state.locationMatchSelected].filter(x=>available.has(x)));
    el.innerHTML=subjects.length?subjects.map(n=>`<label class="check" style="min-width:190px"><input type="checkbox" class="location-match-subject" value="${escAttr(n)}" ${state.locationMatchSelected.has(n)?'checked':''}> ${escapeHtml(n)}</label>`).join(''):'<span class="tiny">Load CDR files to select subjects.</span>';
  }
  function locationMatchBaseRows(){
    const eventType=$('callType')?.value||'',from=$('locationMatchFrom')?.value||'',to=$('locationMatchTo')?.value||'';
    return state.records.filter(r=>{
      if(!r.dt||!r.cdrNo||!r.firstCellId)return false;
      if(eventType&&r.callType!==eventType)return false;
      const d=localDateKey(r.dt);if(from&&d<from)return false;if(to&&d>to)return false;
      return state.locationMatchSelected.has(r.cdrNo);
    });
  }
  function locationPairEvents(data,windowMin){
    const groups=new Map(),out=[],win=Math.max(0,+windowMin||0)*60000;
    for(const r of data){const k=locationTowerKey(r);if(!k)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    for(const [towerKey,a] of groups){
      a.sort((x,y)=>x.dt-y.dt);
      for(let i=0;i<a.length;i++)for(let j=i+1;j<a.length&&a[j].dt-a[i].dt<=win;j++){
        if(a[i].cdrNo===a[j].cdrNo)continue;
        const first=a[i],second=a[j],cell=first.firstCellId||second.firstCellId,address=first.firstAddress||second.firstAddress||'',operator=first.operator||second.operator||'';
        out.push({a:first,b:second,towerKey,cell,address,operator,gap:Math.abs(second.dt-first.dt)/60000,time:first.dt<second.dt?first.dt:second.dt});
      }
    }
    return out.sort((a,b)=>a.time-b.time);
  }
  function locationEpisodes(events,episodeGapMin){
    const gapMs=Math.max(1,+episodeGapMin||60)*60000,groups=new Map(),out=[];
    for(const e of events){
      const pair=[e.a.cdrNo,e.b.cdrNo].sort(),k=pair.join('|')+'|'+e.towerKey;
      if(!groups.has(k))groups.set(k,[]);groups.get(k).push({...e,pair});
    }
    for(const arr of groups.values()){
      arr.sort((a,b)=>a.time-b.time);let ep=null;
      const flush=()=>{if(!ep)return;ep.recordsA=ep.recordsA.size;ep.recordsB=ep.recordsB.size;out.push(ep);ep=null;};
      for(const e of arr){
        if(!ep||e.time-ep.lastEvent>gapMs){flush();ep={a:e.pair[0],b:e.pair[1],towerKey:e.towerKey,cell:e.cell,address:e.address,operator:e.operator,start:e.time,end:e.time,lastEvent:e.time,rawMatches:0,minGap:Infinity,recordsA:new Set(),recordsB:new Set(),lat:e.a.lat??e.b.lat,lng:e.a.lng??e.b.lng};}
        ep.rawMatches++;ep.minGap=Math.min(ep.minGap,e.gap);ep.end=e.time;ep.lastEvent=e.time;
        const ra=e.a.cdrNo===ep.a?e.a:e.b,rb=e.a.cdrNo===ep.b?e.a:e.b;if(ra?.id)ep.recordsA.add(ra.id);if(rb?.id)ep.recordsB.add(rb.id);
      }
      flush();
    }
    return out.sort((a,b)=>a.start-b.start);
  }
  function multiSubjectSameCellMatches(data,subjects,windowMin){
    const selected=[...subjects],need=selected.length,win=Math.max(0,+windowMin||0)*60000,groups=new Map(),out=[];
    for(const r of data){const k=locationTowerKey(r);if(!k)continue;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    for(const [towerKey,events] of groups){
      events.sort((a,b)=>a.dt-b.dt);let left=0,have=0;const counts=new Map();
      for(let right=0;right<events.length;right++){
        const sr=events[right].cdrNo,prev=counts.get(sr)||0;counts.set(sr,prev+1);if(prev===0)have++;
        while(left<=right&&events[right].dt-events[left].dt>win){const sl=events[left].cdrNo,n=(counts.get(sl)||0)-1;if(n<=0){counts.delete(sl);have--;}else counts.set(sl,n);left++;}
        if(have!==need)continue;
        while(left<right&&(counts.get(events[left].cdrNo)||0)>1){const sl=events[left].cdrNo;counts.set(sl,counts.get(sl)-1);left++;}
        if(have!==need)continue;
        const slice=events.slice(left,right+1),mid=(+events[left].dt + +events[right].dt)/2,chosen=new Map();
        for(const s of selected){const candidates=slice.filter(r=>r.cdrNo===s);if(!candidates.length)continue;candidates.sort((a,b)=>Math.abs(+a.dt-mid)-Math.abs(+b.dt-mid));chosen.set(s,candidates[0]);}
        if(chosen.size!==need)continue;
        const picked=[...chosen.values()].sort((a,b)=>a.dt-b.dt),start=picked[0].dt,end=picked[picked.length-1].dt,first=picked[0];
        const key=towerKey+'|'+picked.map(r=>r.id).sort().join('|');if(out.some(x=>x.key===key))continue;
        out.push({key,towerKey,cell:first.firstCellId,address:picked.find(r=>r.firstAddress)?.firstAddress||'',operator:first.operator||'',start,end,spread:(end-start)/60000,records:picked,lat:picked.find(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng))?.lat??null,lng:picked.find(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng))?.lng??null});
        const sl=events[left].cdrNo,n=(counts.get(sl)||0)-1;if(n<=0){counts.delete(sl);have--;}else counts.set(sl,n);left++;
      }
    }
    return out.sort((a,b)=>a.start-b.start||a.spread-b.spread);
  }
  function locationSharedSummary(episodes){
    const m=new Map();
    for(const e of episodes){
      const k=e.towerKey||e.cell;let x=m.get(k);
      if(!x)x={towerKey:k,cell:e.cell,address:e.address,operator:e.operator,episodes:0,dates:new Set(),subjects:new Set(),minGap:Infinity,rawMatches:0,lat:e.lat,lng:e.lng};
      x.episodes++;x.dates.add(localDateKey(e.start));x.subjects.add(e.a);x.subjects.add(e.b);x.minGap=Math.min(x.minGap,e.minGap);x.rawMatches+=e.rawMatches||1;m.set(k,x);
    }
    return [...m.values()].sort((a,b)=>b.episodes-a.episodes||b.dates.size-a.dates.size||a.minGap-b.minGap);
  }
  function renderLocationMatches(){
    const summary=$('locationMatchSummary'),table=$('locationMatchTable'),shared=$('locationSharedTowerSummary');if(!summary||!table)return;
    if(shared)shared.innerHTML='';
    const selected=[...state.locationMatchSelected],from=$('locationMatchFrom').value,to=$('locationMatchTo').value;
    if(from&&to&&from>to){summary.innerHTML='<div class="notice">From date cannot be later than To date.</div>';table.innerHTML='';return;}
    if(!selected.length){summary.innerHTML='<div class="empty">Select one or more subject numbers above.</div>';table.innerHTML='';return;}
    const data=locationMatchBaseRows(),win=Math.max(0,+$('locationMatchMins').value||0),episodeGap=Math.max(1,+$('locationEpisodeGapMins')?.value||60),mode=$('locationMatchMode').value||'all';
    if(selected.length===1){
      const rows=data.sort((a,b)=>a.dt-b.dt);
      summary.innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Location events</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(locationTowerKey)).size)}</div><div class="l">Distinct tower identities</div></div><div class="kpi"><div class="v">1</div><div class="l">Selected subject</div></div></div>`;
      table.innerHTML=`<thead><tr><th>Date / time</th><th>Subject</th><th>Operator</th><th>Cell ID</th><th>Tower address</th><th>Event type</th><th>IMEI</th><th>IMSI</th><th>Map</th></tr></thead><tbody>${rows.slice(0,3000).map(r=>`<tr><td>${dtFmt(r.dt)}</td><td>${escapeHtml(r.cdrNo)}</td><td>${escapeHtml(r.operator||'—')}</td><td>${escapeHtml(r.firstCellId)}</td><td class="details">${escapeHtml(r.firstAddress||'—')}</td><td>${escapeHtml(r.callType||'—')}</td><td>${escapeHtml(r.imei||'—')}</td><td>${escapeHtml(r.imsi||'—')}</td><td>${mapLink({lat:r.lat,lng:r.lng})}</td></tr>`).join('')}</tbody>`;
      return;
    }
    if(mode==='pair'){
      const events=locationPairEvents(data,win),episodes=locationEpisodes(events,episodeGap),towerSummary=locationSharedSummary(episodes);
      summary.innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(selected.length)}</div><div class="l">Selected subjects</div></div><div class="kpi"><div class="v">${fmtInt(episodes.length)}</div><div class="l">Match episodes</div></div><div class="kpi"><div class="v">${fmtInt(events.length)}</div><div class="l">Supporting raw matches</div></div><div class="kpi"><div class="v">${fmtInt(towerSummary.length)}</div><div class="l">Shared tower identities</div></div><div class="kpi"><div class="v">${win}</div><div class="l">Max pair gap (min)</div></div><div class="kpi"><div class="v">${episodeGap}</div><div class="l">Episode break gap (min)</div></div></div>`;
      table.innerHTML=`<thead><tr><th>Subjects</th><th>Start</th><th>End</th><th>Closest gap</th><th>Operator</th><th>Cell ID</th><th>Tower address</th><th>Records A / B</th><th>Raw matches</th><th>Map</th></tr></thead><tbody>${episodes.slice(0,2000).map(e=>`<tr><td>${escapeHtml(e.a+' ↔ '+e.b)}</td><td>${dtFmt(e.start)}</td><td>${dtFmt(e.end)}</td><td>${e.minGap.toFixed(1)} min</td><td>${escapeHtml(e.operator||'—')}</td><td>${escapeHtml(e.cell)}</td><td class="details">${escapeHtml(e.address||'—')}</td><td>${fmtInt(e.recordsA)} / ${fmtInt(e.recordsB)}</td><td>${fmtInt(e.rawMatches)}</td><td>${mapLink(e)}</td></tr>`).join('')}</tbody>`;
      if(shared)shared.innerHTML=`<thead><tr><th>Tower</th><th>Operator</th><th>Subjects</th><th>Match episodes</th><th>Separate dates</th><th>Closest gap</th><th>Supporting matches</th><th>Map</th></tr></thead><tbody>${towerSummary.slice(0,500).map(x=>`<tr><td><b>${escapeHtml(x.cell||'—')}</b><div class="tiny">${escapeHtml(x.address||'')}</div></td><td>${escapeHtml(x.operator||'—')}</td><td class="details">${escapeHtml([...x.subjects].join(', '))}</td><td class="num">${fmtInt(x.episodes)}</td><td class="num">${fmtInt(x.dates.size)}</td><td class="num">${x.minGap.toFixed(1)} min</td><td class="num">${fmtInt(x.rawMatches)}</td><td>${mapLink(x)}</td></tr>`).join('')}</tbody>`;
      return;
    }
    const matches=multiSubjectSameCellMatches(data,selected,win),pseudoEpisodes=matches.map(x=>({a:selected[0],b:selected[1]||selected[0],towerKey:x.towerKey,cell:x.cell,address:x.address,operator:x.operator,start:x.start,minGap:x.spread,rawMatches:1,lat:x.lat,lng:x.lng})),towerSummary=locationSharedSummary(pseudoEpisodes);
    summary.innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(selected.length)}</div><div class="l">Selected subjects</div></div><div class="kpi"><div class="v">${fmtInt(matches.length)}</div><div class="l">All-subject matches</div></div><div class="kpi"><div class="v">${fmtInt(new Set(matches.map(x=>x.towerKey)).size)}</div><div class="l">Matched tower identities</div></div><div class="kpi"><div class="v">${win}</div><div class="l">Maximum spread (min)</div></div></div>`;
    table.innerHTML=`<thead><tr><th>Start</th><th>End</th><th>Time spread</th><th>Operator</th><th>Cell ID</th><th>Tower address</th><th>Subjects / timestamps</th><th>Event types</th><th>Map</th></tr></thead><tbody>${matches.slice(0,2000).map(x=>`<tr><td>${dtFmt(x.start)}</td><td>${dtFmt(x.end)}</td><td>${x.spread.toFixed(1)} min</td><td>${escapeHtml(x.operator||'—')}</td><td>${escapeHtml(x.cell)}</td><td class="details">${escapeHtml(x.address||'—')}</td><td class="details">${x.records.map(r=>escapeHtml(r.cdrNo)+' — '+dtFmt(r.dt)).join('<br>')}</td><td class="details">${x.records.map(r=>escapeHtml(r.cdrNo)+': '+escapeHtml(r.callType||'—')).join('<br>')}</td><td>${mapLink(x)}</td></tr>`).join('')}</tbody>`;
    if(shared)shared.innerHTML=`<thead><tr><th>Tower</th><th>Operator</th><th>Selected subjects</th><th>Matches</th><th>Separate dates</th><th>Best spread</th><th>Map</th></tr></thead><tbody>${towerSummary.slice(0,500).map(x=>`<tr><td><b>${escapeHtml(x.cell||'—')}</b><div class="tiny">${escapeHtml(x.address||'')}</div></td><td>${escapeHtml(x.operator||'—')}</td><td>${escapeHtml(selected.join(', '))}</td><td class="num">${fmtInt(x.episodes)}</td><td class="num">${fmtInt(x.dates.size)}</td><td class="num">${x.minGap.toFixed(1)} min</td><td>${mapLink(x)}</td></tr>`).join('')}</tbody>`;
  }
  function renderLocations(){
    renderLocationMatchSubjects();renderLocationMatches();
    const rows=aggregateLocations(),mapped=rows.filter(x=>Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng))),subjects=new Set(state.filtered.map(r=>r.cdrNo).filter(Boolean)),sharedTowers=rows.filter(x=>x.cdrs.size>1);
    if($('locationKpis'))$('locationKpis').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Distinct tower identities</div></div><div class="kpi"><div class="v">${fmtInt(mapped.length)}</div><div class="l">Towers with coordinates</div></div><div class="kpi"><div class="v">${fmtInt(rows.length-mapped.length)}</div><div class="l">Without coordinates</div></div><div class="kpi"><div class="v">${fmtInt(subjects.size)}</div><div class="l">Subjects represented</div></div><div class="kpi"><div class="v">${fmtInt(sharedTowers.length)}</div><div class="l">Towers used by multiple subjects</div></div></div>`;
    $('locationsTable').innerHTML=`<thead><tr><th>Cell ID / tower</th><th>Operator</th><th>Records</th><th>Active dates</th><th>Subjects</th><th>Contacts</th><th>Call duration</th><th>First</th><th>Last</th><th>Coordinates</th><th>Roaming</th><th>Actions</th></tr></thead><tbody>${rows.map(x=>{const subject=x.cdrs.size===1?[...x.cdrs][0]:'';return `<tr><td><a href="#" class="link location-records-filter" data-cell="${escAttr(x.cellId||'')}" data-tower="${escAttr(x.address||'')}" data-operator="${escAttr([...x.operators][0]||'')}">${escapeHtml(x.cellId||x.address||'—')}</a>${x.cellId&&x.address?`<div class="tiny">${escapeHtml(x.address)}</div>`:''}</td><td>${escapeHtml([...x.operators].join(', ')||'—')}</td><td class="num">${fmtInt(x.records)}</td><td class="num">${fmtInt(x.dates.size)}</td><td class="num" title="${escAttr([...x.cdrs].join(', '))}">${fmtInt(x.cdrs.size)}</td><td class="num">${fmtInt(x.contacts.size)}</td><td class="num">${fmtDur(x.duration)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td>${Number.isFinite(Number(x.lat))&&Number.isFinite(Number(x.lng))?'<span class="goodtext">Mapped</span>':'<span class="warntext">No coordinates</span>'}</td><td>${escapeHtml([...x.roaming].join(', '))}</td><td>${mapLink(x)}${subject?` <button class="btn secondary small location-movement" data-subject="${escAttr(subject)}">Movement</button>`:''}</td></tr>`}).join('')}</tbody>`;
  }


    function bind(){
      $('locationMatchRunBtn').onclick=renderLocationMatches;
      $('locationMatchSelectAllBtn').onclick=()=>{state.locationMatchSelected=new Set(uniq('cdrNo'));renderLocationMatchSubjects();renderLocationMatches();};
      $('locationMatchClearBtn').onclick=()=>{state.locationMatchSelected.clear();renderLocationMatchSubjects();renderLocationMatches();};
      $('locationMatchMode').onchange=renderLocationMatches;
      $('locationMatchMins').onchange=renderLocationMatches;
      $('locationMatchFrom').onchange=renderLocationMatches;
      $('locationMatchTo').onchange=renderLocationMatches;
      $('locationMatchSubjects').addEventListener('change',e=>{
        if(!e.target.classList.contains('location-match-subject'))return;
        e.target.checked?state.locationMatchSelected.add(e.target.value):state.locationMatchSelected.delete(e.target.value);
        renderLocationMatches();
      });
    }
    return {mapLink,renderLocationMatchSubjects,locationPairEvents,locationEpisodes,multiSubjectSameCellMatches,locationSharedSummary,renderLocationMatches,renderLocations,bind};
  };
})();
