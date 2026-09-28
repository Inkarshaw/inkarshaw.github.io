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
    return records().filter(r=>(same(r.cdrNo,a)&&same(r.bparty,b))||(same(r.cdrNo,b)&&same(r.bparty,a))).sort((x,y)=>(x.dt?.getTime?.()||0)-(y.dt?.getTime?.()||0));
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
    const all=records().filter(r=>r.dt&&r.firstCellId&&(same(r.cdrNo,a)||same(r.cdrNo,b)));
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
    const ar=records().filter(r=>same(r.cdrNo,a)),br=records().filter(r=>same(r.cdrNo,b));
    const intersect=(field)=>{const A=new Set(ar.map(r=>String(r[field]||'').trim()).filter(Boolean)),B=new Set(br.map(r=>String(r[field]||'').trim()).filter(Boolean));return [...A].filter(x=>B.has(x));};
    return {imei:intersect('imei'),imsi:intersect('imsi')};
  }

  function render(){
    fillInputs();
    const a=$('relationshipA')?.value||'',b=$('relationshipB')?.value.trim()||'';
    if(!a||!b){
      if($('relationshipSummary'))$('relationshipSummary').innerHTML='<div class="empty">Select Person A and enter Person B, then click Analyse.</div>';
      if($('relationshipTimeline'))$('relationshipTimeline').innerHTML='';
      if($('relationshipTowers'))$('relationshipTowers').innerHTML='';
      if($('relationshipDevices'))$('relationshipDevices').innerHTML='';
      return;
    }
    const raw=directRows(a,b),rows=dedupe(raw,a,b),dirs=rows.map(r=>direction(r,a,b));
    const ab=dirs.filter(x=>x==='A → B').length,ba=dirs.filter(x=>x==='B → A').length,amb=dirs.filter(x=>x==='A ↔ B').length;
    const dur=rows.reduce((s,r)=>s+(Number(r.duration)||0),0),dates=new Set(rows.map(r=>localDate(r.dt)).filter(Boolean));
    const night=rows.filter(r=>r.dt&&((r.dt.getHours()>=20)||(r.dt.getHours()<6))).length;
    const towers=towerSummary(a,b),ids=sharedIds(a,b);
    const first=rows[0]?.dt,last=rows[rows.length-1]?.dt;
    $('relationshipSummary').innerHTML=`<div class="notice">This view summarizes CDR metadata for the selected pair. Communication direction depends on the loaded provider event labels, and shared towers/identifiers are correlation leads requiring independent verification.</div><div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Interactions</div><div class="s">${amb?fmtInt(amb)+' undirected':''}</div></div><div class="kpi"><div class="v">${fmtInt(ab)}</div><div class="l">A → B</div></div><div class="kpi"><div class="v">${fmtInt(ba)}</div><div class="l">B → A</div></div><div class="kpi"><div class="v">${fmtDur(dur)}</div><div class="l">Total duration</div></div><div class="kpi"><div class="v">${fmtInt(dates.size)}</div><div class="l">Active days</div></div><div class="kpi"><div class="v">${fmtInt(night)}</div><div class="l">Night events</div></div></div><div class="metric-row"><span class="metric-chip"><b>First:</b> ${esc(fmtDt(first)||'—')}</span><span class="metric-chip"><b>Last:</b> ${esc(fmtDt(last)||'—')}</span><span class="metric-chip"><b>Common towers:</b> ${fmtInt(towers.length)}</span><span class="metric-chip"><b>Shared IMEI:</b> ${fmtInt(ids.imei.length)}</span><span class="metric-chip"><b>Shared IMSI:</b> ${fmtInt(ids.imsi.length)}</span></div>`;
    $('relationshipTimeline').innerHTML=rows.length?`<thead><tr><th>Date / Time</th><th>Direction</th><th>Event</th><th>Duration</th><th>Subject</th><th>Cell ID</th><th>Tower</th><th>IMEI</th><th>IMSI</th></tr></thead><tbody>${rows.slice(0,1000).map(r=>`<tr><td>${esc(fmtDt(r.dt))}</td><td>${esc(direction(r,a,b))}</td><td>${esc(r.callType||'—')}</td><td>${esc(fmtDur(r.duration))}</td><td>${esc(r.cdrNo||'—')}</td><td>${esc(r.firstCellId||'—')}</td><td class="details">${esc(r.firstAddress||'—')}</td><td>${esc(r.imei||'—')}</td><td>${esc(r.imsi||'—')}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No direct communication records found.</td></tr></tbody>';
    $('relationshipTowers').innerHTML=towers.length?`<thead><tr><th>Operator</th><th>Cell ID</th><th>Tower</th><th>A Events</th><th>B Events</th><th>Closest Gap</th></tr></thead><tbody>${towers.slice(0,200).map(x=>`<tr><td>${esc(x.operator||'—')}</td><td>${esc(x.cell)}</td><td class="details">${esc(x.address||'—')}</td><td>${fmtInt(x.a.length)}</td><td>${fmtInt(x.b.length)}</td><td>${Number.isFinite(x.minGap)?x.minGap.toFixed(1)+' min':'—'}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No common tower data. Both numbers must be loaded as CDR subjects for this comparison.</td></tr></tbody>';
    const idRows=[...ids.imei.map(x=>['IMEI',x]),...ids.imsi.map(x=>['IMSI',x])];
    $('relationshipDevices').innerHTML=idRows.length?`<thead><tr><th>Identifier</th><th>Value shared by both loaded subjects</th></tr></thead><tbody>${idRows.map(x=>`<tr><td>${x[0]}</td><td>${esc(x[1])}</td></tr>`).join('')}</tbody>`:'<tbody><tr><td>No shared IMEI/IMSI found, or Person B is not loaded as a CDR subject.</td></tr></tbody>';
    if($('relationshipScope'))$('relationshipScope').textContent=`A: ${a} • B: ${b} • ${fmtInt(rows.length)} direct event(s)`;
  }

  function openFromContact(num){
    fillInputs();
    const subs=subjects(),current=window.CDRApp?.currentSubject?.()||'';
    $('relationshipA').value=subs.includes(current)?current:(subs[0]||'');
    $('relationshipB').value=num||'';
    window.CDRApp?.switchTab?.('relationship');
    render();
  }

  document.addEventListener('click',e=>{
    const rel=e.target.closest('.relationship-open');if(rel){e.preventDefault();openFromContact(rel.dataset.num||'');return;}
    if(e.target.closest('#relationshipAnalyse')){render();return;}
    if(e.target.closest('#relationshipSwap')){const a=$('relationshipA').value,b=$('relationshipB').value;const subs=subjects();if(subs.includes(b))$('relationshipA').value=b;$('relationshipB').value=a;render();return;}
    if(e.target.closest('#relationshipClear')){$('relationshipB').value='';if($('relationshipScope'))$('relationshipScope').textContent='Select a pair to analyse.';render();return;}
    if(e.target.closest('#relationshipOpenARecords')){const a=$('relationshipA').value,b=$('relationshipB').value.trim();if(a&&b)window.CDRApp?.openPairRecords?.(a,b);return;}
    if(e.target.closest('#relationshipOpenBRecords')){const a=$('relationshipA').value,b=$('relationshipB').value.trim();if(a&&b&&subjects().some(x=>same(x,b)))window.CDRApp?.openPairRecords?.(b,a);return;}
  });
  document.addEventListener('change',e=>{if(e.target.id==='relationshipA')render();});
  window.addEventListener('cdr:updated',fillInputs);
  window.CDRRelationship={render,openFromContact,fillInputs};
  fillInputs();
})();
