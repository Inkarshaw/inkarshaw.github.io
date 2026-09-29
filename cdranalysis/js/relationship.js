(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const key = v => {
    const s=String(v??'').trim();
    const d=s.replace(/\D/g,'');
    if(d.length>=10)return d.slice(-10);
    return s.toLowerCase().replace(/\s+/g,'');
  };
  const same=(a,b)=>!!key(a)&&key(a)===key(b);
  const invalidPair=(a,b)=>!!a&&!!b&&same(a,b);
  function showPairValidation(a,b){
    if(!invalidPair(a,b))return false;
    if($('relationshipSummary'))$('relationshipSummary').innerHTML='<div class="notice" style="border-color:rgba(255,93,120,.45)"><b>Person A and Person B cannot be the same number.</b><br>Select a different B Party number to run Relationship Analysis.</div>';
    if($('relationshipTimeline'))$('relationshipTimeline').innerHTML='';
    if($('relationshipTowers'))$('relationshipTowers').innerHTML='';
    if($('relationshipDevices'))$('relationshipDevices').innerHTML='';
    if($('relationshipSubjects'))$('relationshipSubjects').innerHTML='';
    if($('relationshipScope'))$('relationshipScope').textContent='Invalid pair • A and B are the same number';
    const bEl=$('relationshipB');if(bEl){bEl.setCustomValidity('Person A and Person B cannot be the same number.');bEl.setAttribute('aria-invalid','true');}
    return true;
  }
  function clearPairValidation(){const bEl=$('relationshipB');if(bEl){bEl.setCustomValidity('');bEl.removeAttribute('aria-invalid');}}
  const localDate=d=>d instanceof Date&&!isNaN(d)?`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`:'';
  const fmtInt=n=>Number(n||0).toLocaleString('en-IN');
  const fmtDur=sec=>window.CDRApp?.formatDuration?window.CDRApp.formatDuration(sec):`${Number(sec||0)}s`;
  const fmtDt=d=>window.CDRApp?.formatDateTime?window.CDRApp.formatDateTime(d):(d instanceof Date&&!isNaN(d)?d.toLocaleString('en-GB'):'');
  const label=n=>window.CDRApp?.contactLabel?window.CDRApp.contactLabel(n):n;
  const records=()=>window.CDRApp?.getRecords?.()||[];
  const subjects=()=>[...new Set(records().map(r=>r.cdrNo).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
  const contacts=()=>[...new Set(records().map(r=>r.bparty).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));

  function fillInputs(){
    const a=$('relationshipA'),list=$('relationshipBOptions');if(!a||!list)return;
    const cur=a.value,subs=subjects();
    a.innerHTML='<option value="">Select subject</option>'+subs.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
    if(subs.includes(cur))a.value=cur; else if(subs.length===1)a.value=subs[0];
    list.innerHTML=contacts().slice(0,5000).map(x=>`<option value="${esc(x)}">${esc(label(x))}</option>`).join('');
    const evt=$('relationshipEvent');
    if(evt){
      const selected=evt.value,events=[...new Set(records().map(r=>r.callType).filter(Boolean))].sort((x,y)=>String(x).localeCompare(String(y)));
      evt.innerHTML='<option value="">All event types</option>'+events.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('');
      if(events.includes(selected))evt.value=selected;
    }
  }

  function relationshipFilters(){
    const parse=(v,end=false)=>{if(!v)return null;const [y,m,d]=String(v).split('-').map(Number);return window.CDRCore.dateFromSourceParts(y,m-1,d,end?23:0,end?59:0,end?59:0,window.CDRCore.state.sourceTimezone);};
    const from=parse($('relationshipFrom')?.value,false);
    const to=parse($('relationshipTo')?.value,true);
    return {from,to,event:$('relationshipEvent')?.value||'',nightOnly:!!$('relationshipNightOnly')?.checked};
  }
  function scopedRows(data=records()){
    const f=relationshipFilters();
    return data.filter(r=>{
      if(f.from&&(!r.dt||r.dt<f.from))return false;
      if(f.to&&(!r.dt||r.dt>f.to))return false;
      if(f.event&&r.callType!==f.event)return false;
      if(f.nightOnly){
        if(!r.dt)return false;
        const h=window.CDRCore.sourceHour(r.dt);
        if(!(h>=20||h<6))return false;
      }
      return true;
    });
  }

  function direction(r,a,b){
    const t=String(r.callType||'').toLowerCase();
    if(same(r.cdrNo,a)&&same(r.bparty,b)){
      if(t.includes('in'))return 'B → A';
      if(t.includes('out'))return 'A → B';
      return 'A ↔ B';
    }
    if(same(r.cdrNo,b)&&same(r.bparty,a)){
      if(t.includes('in'))return 'A → B';
      if(t.includes('out'))return 'B → A';
      return 'A ↔ B';
    }
    return 'A ↔ B';
  }

  function directRows(a,b){
    const ia=window.CDRApp?.getIndex?.('bySubject',a)||[],ib=window.CDRApp?.getIndex?.('bySubject',b)||[];
    const pool=(ia.length||ib.length)?[...ia,...ib.filter(x=>!ia.includes(x))]:records();
    return scopedRows(pool).filter(r=>(same(r.cdrNo,a)&&same(r.bparty,b))||(same(r.cdrNo,b)&&same(r.bparty,a))).sort((x,y)=>(x.dt?.getTime?.()||0)-(y.dt?.getTime?.()||0));
  }

  function dedupe(rows,a,b){
    const seen=new Set(),out=[];
    for(const r of rows){
      const d=direction(r,a,b),ts=r.dt instanceof Date&&!isNaN(r.dt)?Math.round(r.dt.getTime()/2000):`${r.date}|${r.time}`;
      const k=[d,ts,Math.round(Number(r.duration)||0),String(r.callType||'').toLowerCase()].join('|');
      if(seen.has(k))continue;seen.add(k);out.push(r);
    }
    return out;
  }

  function towerKey(r){const cell=String(r.firstCellId||'').trim(),op=String(r.operator||'').trim().toLowerCase();return cell?`${op}|${cell}`:'';}
  function towerSummary(a,b){
    const all=scopedRows(records()).filter(r=>r.dt&&r.firstCellId&&(same(r.cdrNo,a)||same(r.cdrNo,b)));
    const map=new Map();
    for(const r of all){const k=towerKey(r);if(!k)continue;let x=map.get(k);if(!x)x={cell:r.firstCellId,address:r.firstAddress||'',operator:r.operator||'',a:[],b:[]};(same(r.cdrNo,a)?x.a:x.b).push(r);map.set(k,x);}
    const out=[];
    for(const x of map.values()){
      if(!x.a.length||!x.b.length)continue;
      x.a.sort((p,q)=>p.dt-q.dt);x.b.sort((p,q)=>p.dt-q.dt);
      let i=0,j=0,min=Infinity;
      while(i<x.a.length&&j<x.b.length){const gap=Math.abs(x.a[i].dt-x.b[j].dt)/60000;min=Math.min(min,gap);if(x.a[i].dt<x.b[j].dt)i++;else j++;}
      out.push({...x,minGap:min});
    }
    return out.sort((x,y)=>x.minGap-y.minGap||(y.a.length+y.b.length)-(x.a.length+x.b.length));
  }

  function sharedIds(a,b){
    const ar=scopedRows(records()).filter(r=>same(r.cdrNo,a)),br=scopedRows(records()).filter(r=>same(r.cdrNo,b));
    const intersect=(field)=>{const A=new Set(ar.map(r=>String(r[field]||'').trim()).filter(Boolean)),B=new Set(br.map(r=>String(r[field]||'').trim()).filter(Boolean));return [...A].filter(x=>B.has(x));};
    return {imei:intersect('imei'),imsi:intersect('imsi')};
  }

  function connectedSubjects(b){
    if(!b)return [];
    const candidates=(window.CDRApp?.getIndex?.('byBparty',key(b))||records().filter(r=>same(r.bparty,b)));
    const by=new Map();
    for(const r of scopedRows(candidates)){
      if(!same(r.bparty,b)||!r.cdrNo||same(r.cdrNo,b))continue;
      if(!by.has(r.cdrNo))by.set(r.cdrNo,[]);
      by.get(r.cdrNo).push(r);
    }
    return [...by.entries()].map(([subject,raw])=>{
      const rows=dedupe(raw.sort((x,y)=>(x.dt?.getTime?.()||0)-(y.dt?.getTime?.()||0)),subject,b);
      const calls=rows.filter(r=>String(r.callType||'').toLowerCase().includes('call')).length;
      const sms=rows.filter(r=>String(r.callType||'').toLowerCase().includes('sms')).length;
      const dur=rows.reduce((sum,r)=>sum+(Number(r.duration)||0),0);
      const night=rows.filter(r=>r.dt&&((window.CDRCore.sourceHour(r.dt)>=20)||(window.CDRCore.sourceHour(r.dt)<6))).length;
      return {subject,rows,calls,sms,dur,night,first:rows[0]?.dt,last:rows[rows.length-1]?.dt};
    }).filter(x=>x.rows.length).sort((a,b)=>b.rows.length-a.rows.length||b.dur-a.dur||String(a.subject).localeCompare(String(b.subject),undefined,{numeric:true}));
  }

  function renderSubjectMatches(b){
    const table=$('relationshipSubjects');if(!table)return [];
    const matches=connectedSubjects(b);
    if(!b){
      table.innerHTML='<tbody><tr><td class="empty">Enter Person B to search across all loaded CDR subjects.</td></tr></tbody>';
      return matches;
    }
    table.innerHTML=matches.length?`<thead><tr><th>Loaded subject</th><th>Interactions</th><th>Calls</th><th>SMS</th><th>Total duration</th><th>Night events</th><th>First</th><th>Last</th><th>Action</th></tr></thead><tbody>${matches.map(x=>`<tr><td>${esc(x.subject)}</td><td>${fmtInt(x.rows.length)}</td><td>${fmtInt(x.calls)}</td><td>${fmtInt(x.sms)}</td><td>${esc(fmtDur(x.dur))}</td><td>${fmtInt(x.night)}</td><td>${esc(fmtDt(x.first)||'—')}</td><td>${esc(fmtDt(x.last)||'—')}</td><td><button class="btn secondary small relationship-pick-subject" type="button" data-subject="${esc(x.subject)}" data-num="${esc(b)}">Analyse pair</button></td></tr>`).join('')}</tbody>`:'<tbody><tr><td class="empty">No loaded CDR subject has a direct record with this B Party number.</td></tr></tbody>';
    return matches;
  }

  function csvCell(v){const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
  function exportPair(){
    const a=$('relationshipA')?.value||'',b=$('relationshipB')?.value.trim()||'';
    if(!a||!b)return;
    if(showPairValidation(a,b))return;
    clearPairValidation();
    const rows=dedupe(directRows(a,b),a,b);
    const headers=['Person A','Person B','Date/Time','Direction','Event Type','Duration Seconds','CDR Subject','B Party','First Cell ID','First Tower Address','Last Cell ID','Last Tower Address','IMEI','IMSI','Operator','Source File','Source Sheet','Source Row'];
    const lines=[headers.join(',')];
    for(const r of rows)lines.push([a,b,fmtDt(r.dt)||`${r.date||''} ${r.time||''}`,direction(r,a,b),r.callType,r.duration,r.cdrNo,r.bparty,r.firstCellId,r.firstAddress,r.lastCellId,r.lastAddress,r.imei,r.imsi,r.operator,r.sourceFile,r.sourceSheet,r.rowNumber].map(csvCell).join(','));
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download=`relationship_${String(a).replace(/[^0-9A-Za-z_-]+/g,'_')}_${String(b).replace(/[^0-9A-Za-z_-]+/g,'_')}.csv`;
    link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function render(){
    fillInputs();
    const a=$('relationshipA')?.value||'',b=$('relationshipB')?.value.trim()||'';
    clearPairValidation();
    if(showPairValidation(a,b))return;
    const matches=renderSubjectMatches(b);
    if(!b){
      if($('relationshipSummary'))$('relationshipSummary').innerHTML='<div class="empty">Enter Person B to find which loaded CDR subjects contacted that number.</div>';
      if($('relationshipTimeline'))$('relationshipTimeline').innerHTML='';
      if($('relationshipTowers'))$('relationshipTowers').innerHTML='';
      if($('relationshipDevices'))$('relationshipDevices').innerHTML='';
      if($('relationshipScope'))$('relationshipScope').textContent='Enter a B Party number to search all loaded subjects.';
      return;
    }
    if(!a){
      if($('relationshipSummary'))$('relationshipSummary').innerHTML='<div class="notice"><b>'+fmtInt(matches.length)+'</b> loaded subject(s) have direct records with <b>'+esc(b)+'</b>. Choose a subject below or select Person A to open the full pair analysis.</div>';
      if($('relationshipTimeline'))$('relationshipTimeline').innerHTML='';
      if($('relationshipTowers'))$('relationshipTowers').innerHTML='';
      if($('relationshipDevices'))$('relationshipDevices').innerHTML='';
      if($('relationshipScope'))$('relationshipScope').textContent=`B: ${b} • ${fmtInt(matches.length)} connected loaded subject(s)`;
      return;
    }
    const raw=directRows(a,b),rows=dedupe(raw,a,b),dirs=rows.map(r=>direction(r,a,b));
    const ab=dirs.filter(x=>x==='A → B').length,ba=dirs.filter(x=>x==='B → A').length,amb=dirs.filter(x=>x==='A ↔ B').length;
    const dur=rows.reduce((s,r)=>s+(Number(r.duration)||0),0),dates=new Set(rows.map(r=>localDate(r.dt)).filter(Boolean));
    const night=rows.filter(r=>r.dt&&((window.CDRCore.sourceHour(r.dt)>=20)||(window.CDRCore.sourceHour(r.dt)<6))).length;
    const towers=towerSummary(a,b),ids=sharedIds(a,b);
    const first=rows[0]?.dt,last=rows[rows.length-1]?.dt;
    const callRows=rows.filter(r=>String(r.callType||'').toLowerCase().includes('call'));
    const longest=callRows.reduce((m,r)=>Math.max(m,Number(r.duration)||0),0);
    const hours=new Map();for(const r of rows){if(!r.dt)continue;const h=window.CDRCore.sourceHour(r.dt);hours.set(h,(hours.get(h)||0)+1);}
    const peak=[...hours.entries()].sort((x,y)=>y[1]-x[1]||x[0]-y[0])[0];
    const f=relationshipFilters();
    const scope=[f.from?'From '+$('relationshipFrom').value:'',f.to?'To '+$('relationshipTo').value:'',f.event||'',f.nightOnly?'Night only':''].filter(Boolean).join(' • ');
    $('relationshipSummary').innerHTML=`<div class="notice">This view summarizes CDR metadata for the selected pair. Communication direction depends on the loaded provider event labels, and shared towers/identifiers are correlation leads requiring independent verification.${scope?'<br><b>Relationship scope:</b> '+esc(scope):''}</div><div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Interactions</div><div class="s">${amb?fmtInt(amb)+' undirected':''}</div></div><div class="kpi"><div class="v">${fmtInt(ab)}</div><div class="l">A → B</div></div><div class="kpi"><div class="v">${fmtInt(ba)}</div><div class="l">B → A</div></div><div class="kpi"><div class="v">${fmtDur(dur)}</div><div class="l">Total duration</div></div><div class="kpi"><div class="v">${fmtInt(dates.size)}</div><div class="l">Active days</div></div><div class="kpi"><div class="v">${fmtInt(night)}</div><div class="l">Night events</div></div></div><div class="metric-row"><span class="metric-chip"><b>First:</b> ${esc(fmtDt(first)||'—')}</span><span class="metric-chip"><b>Last:</b> ${esc(fmtDt(last)||'—')}</span><span class="metric-chip"><b>Longest call:</b> ${esc(longest?fmtDur(longest):'—')}</span><span class="metric-chip"><b>Peak hour:</b> ${peak?String(peak[0]).padStart(2,'0')+':00–'+String((peak[0]+1)%24).padStart(2,'0')+':00 ('+fmtInt(peak[1])+')':'—'}</span><span class="metric-chip"><b>Common towers:</b> ${fmtInt(towers.length)}</span><span class="metric-chip"><b>Shared IMEI:</b> ${fmtInt(ids.imei.length)}</span><span class="metric-chip"><b>Shared IMSI:</b> ${fmtInt(ids.imsi.length)}</span></div>`;
    $('relationshipTimeline').innerHTML=rows.length?`<thead><tr><th>Date / Time</th><th>Direction</th><th>Event</th><th>Duration</th><th>Subject</th><th>Cell ID</th><th>Tower</th><th>IMEI</th><th>IMSI</th></tr></thead><tbody>${rows.slice(0,1000).map(r=>`<tr><td>${esc(fmtDt(r.dt))}</td><td>${esc(direction(r,a,b))}</td><td>${esc(r.callType||'—')}</td><td>${esc(fmtDur(r.duration))}</td><td>${esc(r.cdrNo||'—')}</td><td>${esc(r.firstCellId||'—')}</td><td class="details">${esc(r.firstAddress||'—')}</td><td>${esc(r.imei||'—')}</td><td>${esc(r.imsi||'—')}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No direct communication records found.</td></tr></tbody>';
    $('relationshipTowers').innerHTML=towers.length?`<thead><tr><th>Operator</th><th>Cell ID</th><th>Tower</th><th>A Events</th><th>B Events</th><th>Closest Gap</th></tr></thead><tbody>${towers.slice(0,200).map(x=>`<tr><td>${esc(x.operator||'—')}</td><td>${esc(x.cell)}</td><td class="details">${esc(x.address||'—')}</td><td>${fmtInt(x.a.length)}</td><td>${fmtInt(x.b.length)}</td><td>${Number.isFinite(x.minGap)?x.minGap.toFixed(1)+' min':'—'}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No common tower data. Both numbers must be loaded as CDR subjects for this comparison.</td></tr></tbody>';
    const idRows=[...ids.imei.map(x=>['IMEI',x]),...ids.imsi.map(x=>['IMSI',x])];
    $('relationshipDevices').innerHTML=idRows.length?`<thead><tr><th>Identifier</th><th>Value shared by both loaded subjects</th></tr></thead><tbody>${idRows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No shared IMEI/IMSI found, or Person B is not loaded as a CDR subject.</td></tr></tbody>';
    if($('relationshipScope'))$('relationshipScope').textContent=`A: ${a} • B: ${b} • ${fmtInt(rows.length)} direct event(s)`;
  }

  function snapshot(){
    const a=$('relationshipA')?.value||'',b=$('relationshipB')?.value.trim()||'';
    if(!a||!b||invalidPair(a,b))return null;
    const rows=dedupe(directRows(a,b),a,b),dirs=rows.map(r=>direction(r,a,b)),towers=towerSummary(a,b),ids=sharedIds(a,b);
    return {a,b,filters:relationshipFilters(),rows,towers,ids,metrics:{interactions:rows.length,aToB:dirs.filter(x=>x==='A → B').length,bToA:dirs.filter(x=>x==='B → A').length,undirected:dirs.filter(x=>x==='A ↔ B').length,duration:rows.reduce((s,r)=>s+(Number(r.duration)||0),0),activeDays:new Set(rows.map(r=>localDate(r.dt)).filter(Boolean)).size,night:rows.filter(r=>r.dt&&((window.CDRCore.sourceHour(r.dt)>=20)||(window.CDRCore.sourceHour(r.dt)<6))).length}};
  }

  function openFromContact(num,subject=''){
    fillInputs();
    const subs=subjects(),current=window.CDRApp?.currentSubject?.()||'';
    $('relationshipA').value=subs.includes(subject)?subject:(subs.includes(current)?current:(subs[0]||''));
    $('relationshipB').value=num||'';
    window.CDRApp?.switchTab?.('multinumber');
    render();
  }

  document.addEventListener('click',e=>{
    const rel=e.target.closest('.relationship-open');if(rel){e.preventDefault();openFromContact(rel.dataset.num||'',rel.dataset.subject||'');return;}
    const pick=e.target.closest('.relationship-pick-subject');if(pick){e.preventDefault();fillInputs();$('relationshipA').value=pick.dataset.subject||'';$('relationshipB').value=pick.dataset.num||'';render();return;}
    if(e.target.closest('#relationshipAnalyse')){render();return;}
    if(e.target.closest('#relationshipExport')){exportPair();return;}
    if(e.target.closest('#relationshipSwap')){const a=$('relationshipA').value,b=$('relationshipB').value;const subs=subjects();if(subs.includes(b))$('relationshipA').value=b;$('relationshipB').value=a;render();return;}
    if(e.target.closest('#relationshipClear')){$('relationshipB').value='';if($('relationshipFrom'))$('relationshipFrom').value='';if($('relationshipTo'))$('relationshipTo').value='';if($('relationshipEvent'))$('relationshipEvent').value='';if($('relationshipNightOnly'))$('relationshipNightOnly').checked=false;if($('relationshipScope'))$('relationshipScope').textContent='Select a pair to analyse.';render();return;}
    if(e.target.closest('#relationshipOpenARecords')){const a=$('relationshipA').value,b=$('relationshipB').value.trim();if(showPairValidation(a,b))return;if(a&&b)window.CDRApp?.openPairRecords?.(a,b);return;}
    if(e.target.closest('#relationshipOpenBRecords')){const a=$('relationshipA').value,b=$('relationshipB').value.trim();if(showPairValidation(a,b))return;if(a&&b&&subjects().some(x=>same(x,b)))window.CDRApp?.openPairRecords?.(b,a);return;}
  });
  document.addEventListener('change',e=>{if(['relationshipA','relationshipB','relationshipFrom','relationshipTo','relationshipEvent','relationshipNightOnly'].includes(e.target.id))render();});
  document.addEventListener('input',e=>{if(e.target.id==='relationshipB'){const a=$('relationshipA')?.value||'',b=e.target.value.trim();if(invalidPair(a,b))showPairValidation(a,b);else clearPairValidation();}});
  window.addEventListener('cdr:updated',fillInputs);
  window.CDRRelationship={render,openFromContact,fillInputs,snapshot};
  fillInputs();
})();
