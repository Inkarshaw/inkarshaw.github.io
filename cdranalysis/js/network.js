(() => {
  'use strict';
  window.CDRNetworkFactory = function(ctx){
    const {$,state,aggregateContacts,contactLabel,phoneKey,localDateKey,simpleTable,escapeHtml,escAttr,contactTitle,fmtInt,dtFmt,fmtDur}=ctx;
    let networkNodes=[],networkEdges=[],networkSelected=null;
    let multiTowerMap=null,multiTowerLayer=null,multiTowerTiles=null,multiTowerRows=[],multiTowerSubjects=[];
    const subjectColors=new Map(),palette=['#2563eb','#e11d48','#16a34a','#ea580c','#9333ea','#0891b2','#ca8a04','#db2777','#4f46e5','#0f766e'];
    function subjectColor(n){if(!subjectColors.has(n)){const i=subjectColors.size;subjectColors.set(n,palette[i]||`hsl(${Math.round(i*137.508)%360} 65% 45%)`);}return subjectColors.get(n);}

  function renderNetwork(){const canvas=$('networkCanvas');if(!canvas||!canvas.getContext)return;const rect=canvas.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(600,rect.width*dpr);canvas.height=Math.max(420,rect.height*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);const W=canvas.width/dpr,H=canvas.height/dpr;ctx.clearRect(0,0,W,H);const data=window.CDRMultiScope?.getRows?.()||state.filtered;const cdrs=[...new Set(data.map(r=>r.cdrNo).filter(Boolean))];const topN=+$('networkTop')?.value||30,minEvents=+$('networkMinEvents')?.value||1,sharedOnly=!!$('networkSharedOnly')?.checked;let contacts=aggregateContacts(data).filter(x=>x.records>=minEvents);if(sharedOnly)contacts=contacts.filter(x=>x.cdrs.size>1);contacts=contacts.slice(0,topN);const nodes=[],edges=[];const center={x:W/2,y:H/2};const cr=Math.min(W,H)*0.25;cdrs.forEach((c,i)=>{const a=(Math.PI*2*i/Math.max(1,cdrs.length))-Math.PI/2;nodes.push({id:'a:'+c,label:c,type:'a',x:center.x+Math.cos(a)*cr*.55,y:center.y+Math.sin(a)*cr*.55,w:data.filter(r=>r.cdrNo===c).length});});contacts.forEach((c,i)=>{const a=(Math.PI*2*i/Math.max(1,contacts.length))-Math.PI/2;const rr=cr*(1.2+(i%3)*.15);nodes.push({id:'b:'+c.bparty,label:contactLabel(c.bparty),type:'b',x:center.x+Math.cos(a)*rr,y:center.y+Math.sin(a)*rr,w:c.records,shared:c.cdrs.size>1});for(const ap of c.cdrs){const w=data.filter(r=>r.cdrNo===ap&&(r.bpartyKey||phoneKey(r.bparty))===c.key).length;edges.push({a:'a:'+ap,b:'b:'+c.bparty,w});}});networkNodes=nodes;networkEdges=edges;const nm=new Map(nodes.map(n=>[n.id,n]));ctx.lineCap='round';for(const e of edges){const a=nm.get(e.a),b=nm.get(e.b);if(!a||!b)continue;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);const related=!networkSelected||e.a===networkSelected||e.b===networkSelected;ctx.strokeStyle=related?'rgba(21,94,239,.55)':'rgba(98,116,143,.08)';ctx.lineWidth=Math.min(6,1+Math.log2(1+e.w));ctx.stroke();}for(const n of nodes){const r=n.type==='a'?Math.min(24,11+Math.log2(1+n.w)*2):Math.min(16,6+Math.log2(1+n.w)*1.5);ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);const related=!networkSelected||n.id===networkSelected||edges.some(e=>(e.a===networkSelected&&e.b===n.id)||(e.b===networkSelected&&e.a===n.id));ctx.globalAlpha=related?1:.18;ctx.fillStyle=n.type==='a'?'#155eef':n.shared?'#b54708':'#667085';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font=(n.type==='a'?'700 ':'')+'11px system-ui';ctx.textAlign='center';ctx.fillStyle='#bcecf5';const label=n.label.length>18?n.label.slice(0,18)+'…':n.label;ctx.fillText(label,n.x,n.y+r+14);ctx.globalAlpha=1;}const shared=contacts.filter(x=>x.cdrs.size>1).length;$('networkLegend').innerHTML=`<span class="metric-chip">Subjects: ${cdrs.length}</span><span class="metric-chip">Contacts shown: ${contacts.length}</span><span class="metric-chip">Shared contacts: ${shared}</span><span class="metric-chip">Blue = loaded subject</span><span class="metric-chip">Orange = shared contact</span>`;}
  function colocationEvents(data=state.filtered,windowMin=30){
    const groups=new Map(),out=[],win=windowMin*60000;
    for(const r of data){if(!r.dt||!r.cdrNo||!r.firstCellId)continue;if(!groups.has(r.firstCellId))groups.set(r.firstCellId,[]);groups.get(r.firstCellId).push(r);}
    for(const [cell,a] of groups){a.sort((x,y)=>x.dt-y.dt);for(let i=0;i<a.length;i++){for(let j=i+1;j<a.length&&a[j].dt-a[i].dt<=win;j++){if(a[i].cdrNo===a[j].cdrNo)continue;out.push({a:a[i],b:a[j],cell,address:a[i].firstAddress||a[j].firstAddress,gap:Math.abs(a[j].dt-a[i].dt)/60000,time:a[i].dt<a[j].dt?a[i].dt:a[j].dt});}}}
    return out.sort((x,y)=>x.time-y.time);
  }
  function colocationEpisodes(data=state.filtered,windowMin=30,episodeGapMin=60){
    const events=colocationEvents(data,windowMin),gapMs=Math.max(1,episodeGapMin)*60000,groups=new Map();
    for(const e of events){
      const pair=[e.a.cdrNo,e.b.cdrNo].sort(),k=pair.join('|')+'|'+e.cell;
      if(!groups.has(k))groups.set(k,[]);
      groups.get(k).push({...e,pair});
    }
    const out=[];
    for(const [k,arr] of groups){
      arr.sort((x,y)=>x.time-y.time);let ep=null;
      const flush=()=>{if(!ep)return;ep.recordsA=ep.recordsA.size;ep.recordsB=ep.recordsB.size;out.push(ep);ep=null;};
      for(const e of arr){
        if(!ep||e.time-ep.lastEvent>gapMs){
          flush();
          ep={a:e.pair[0],b:e.pair[1],cell:e.cell,address:e.address,start:e.time,end:e.time,lastEvent:e.time,rawMatches:0,minGap:Infinity,recordsA:new Set(),recordsB:new Set()};
        }
        ep.rawMatches++;ep.minGap=Math.min(ep.minGap,e.gap);ep.end=e.time;ep.lastEvent=e.time;
        const ra=e.a.cdrNo===ep.a?e.a:e.b,rb=e.a.cdrNo===ep.b?e.a:e.b;
        if(ra?.id)ep.recordsA.add(ra.id);if(rb?.id)ep.recordsB.add(rb.id);
      }
      flush();
    }
    return out.sort((a,b)=>a.start-b.start);
  }
  function colocationMatches(data=state.filtered,windowMin=30){const groups=new Map();for(const r of data){if(!r.dt||!r.cdrNo||!r.firstCellId)continue;if(!groups.has(r.firstCellId))groups.set(r.firstCellId,[]);groups.get(r.firstCellId).push(r);}const agg=new Map(),win=windowMin*60000;for(const [cell,a] of groups){a.sort((x,y)=>x.dt-y.dt);for(let i=0;i<a.length;i++){for(let j=i+1;j<a.length&&a[j].dt-a[i].dt<=win;j++){if(a[i].cdrNo===a[j].cdrNo)continue;const pair=[a[i].cdrNo,a[j].cdrNo].sort();const k=`${pair[0]}|${pair[1]}|${cell}`;let x=agg.get(k);const gap=Math.abs(a[j].dt-a[i].dt)/60000;if(!x)x={a:pair[0],b:pair[1],cell,address:a[i].firstAddress||a[j].firstAddress,count:0,minGap:Infinity,first:null,last:null};x.count++;x.minGap=Math.min(x.minGap,gap);const t=a[i].dt<a[j].dt?a[i].dt:a[j].dt;if(!x.first||t<x.first)x.first=t;if(!x.last||t>x.last)x.last=t;agg.set(k,x);}}}return [...agg.values()].sort((x,y)=>y.count-x.count||x.minGap-y.minGap);}
  // Exact cell groups include the operator where supplied. Coordinate groups
  // are a different view: nearby rounded coordinates are not identical cells.
  const cellKey=r=>JSON.stringify([String(r.operator||'').trim().toLowerCase(),String(r.firstCellId||'').trim()]);
  function coordKey(r){
    if(r.lat==null||r.lng==null||r.lat===''||r.lng==='')return '';
    const a=Number(r.lat),b=Number(r.lng);
    return Number.isFinite(a)&&Number.isFinite(b)&&Math.abs(a)<=90&&Math.abs(b)<=180&&(a!==0||b!==0)?a.toFixed(4)+','+b.toFixed(4):'';
  }
  function buildTowerGroups(data,byCoordinate=false){
    const groups=new Map();
    for(const r of data){
      const subject=r.cdrNo,cell=String(r.firstCellId||'').trim(),op=String(r.operator||'').trim(),coord=coordKey(r);
      if(!subject||(!byCoordinate&&!cell)||(byCoordinate&&!coord))continue;
      const key=byCoordinate?coord:cellKey(r);
      let g=groups.get(key);
      if(!g){g={key,cell:byCoordinate?'Coordinate group':cell,operator:byCoordinate?'Multiple / see cells':op,address:r.firstAddress||'',counts:new Map(),coords:new Set(),cells:new Set(),total:0};groups.set(key,g);}
      g.counts.set(subject,(g.counts.get(subject)||0)+1);g.total++;
      if(coord)g.coords.add(coord);
      if(cell)g.cells.add((op||'Unknown operator')+' / '+cell);
      if(!g.address&&r.firstAddress)g.address=r.firstAddress;
    }
    return [...groups.values()];
  }
  function towerGroupTitle(g){return g.cell+(g.operator?' • '+g.operator:' • operator unknown')+(g.address?' • '+g.address:'');}
  function towerPopup(g){
    const counts=[...g.counts].sort((a,b)=>b[1]-a[1]);
    return '<div class="movement-popup"><b>'+escapeHtml(towerGroupTitle(g))+'</b><div>Subjects: '+fmtInt(g.counts.size)+' • CDR events: '+fmtInt(g.total)+'</div>'+counts.map(([n,c])=>'<div><span style="color:'+subjectColor(n)+'">●</span> '+escapeHtml(n)+': <b>'+fmtInt(c)+'</b></div>').join('')+(g.cells.size>1?'<div><b>Cell IDs in group:</b><br>'+[...g.cells].slice(0,20).map(escapeHtml).join('<br>')+(g.cells.size>20?'<br>Additional cells: '+fmtInt(g.cells.size-20):'')+'</div>':'')+'</div>';
  }
  function clearTowerMap(){
    if(multiTowerMap){multiTowerMap.remove();multiTowerMap=null;multiTowerLayer=null;multiTowerTiles=null;}
  }
  function renderMultiTowerView(){
    const box=$('multiTowerMatrix'),mapEl=$('multiTowerMap'),legend=$('multiTowerLegend'),status=$('multiTowerStatus');
    if(!box||!mapEl||!legend||!status)return;
    const byCoordinate=$('multiTowerGrouping').value==='coordinate',scope=$('multiTowerScope').value,sort=$('multiTowerSort').value,countsOn=$('multiTowerCounts').checked,colorsOn=$('multiTowerColors').checked;
    const subjects=multiTowerSubjects;
    if(subjects.length<2){clearTowerMap();mapEl.textContent='Select at least two CDR subjects.';box.innerHTML='';legend.innerHTML='';status.textContent='';return;}
    const groups=buildTowerGroups(multiTowerRows,byCoordinate);
    const filtered=groups.filter(g=>scope==='all'||(scope==='common'&&g.counts.size>1)||(scope==='exclusive'&&g.counts.size===1)||(scope==='every'&&g.counts.size===subjects.length));
    filtered.sort((a,b)=>sort==='events'?b.total-a.total||b.counts.size-a.counts.size:b.counts.size-a.counts.size||b.total-a.total);
    legend.innerHTML=subjects.map((n,i)=>'<span class="metric-chip"><span style="color:'+subjectColor(n)+'">●</span> '+(i+1)+'. '+escapeHtml(n)+'</span>').join('');
    const visible=filtered.slice(0,500);
    const header=['Cell / location','Shared by',...subjects.map((n,i)=>'<span style="color:'+subjectColor(n)+'">●</span> '+(i+1)+'. '+escapeHtml(n)),'Total events'];
    box.innerHTML='<div class="tablewrap">'+simpleTable(header,visible.map(g=>[escapeHtml(towerGroupTitle(g))+(byCoordinate?' <span class="tiny">'+escapeHtml(g.key)+'</span>':''),fmtInt(g.counts.size)+' / '+fmtInt(subjects.length),...subjects.map(n=>g.counts.has(n)?'<b>'+fmtInt(g.counts.get(n))+'</b>':'—'),fmtInt(g.total)]))+'</div>';
    const mappable=filtered.filter(g=>g.coords.size===1);
    const coordGroups=new Map();
    for(const g of mappable){
      const key=[...g.coords][0];let m=coordGroups.get(key);
      if(!m){m={key,cell:g.cell,operator:g.operator,address:g.address,counts:new Map(),cells:new Set(),total:0,groups:[]};coordGroups.set(key,m);}
      m.groups.push(g);m.total+=g.total;
      for(const [n,c] of g.counts)m.counts.set(n,(m.counts.get(n)||0)+c);
      for(const c of g.cells)m.cells.add(c);
    }
    const points=[...coordGroups.values()],shown=points.slice(0,1000);
    status.textContent=fmtInt(filtered.length)+' matching groups • '+fmtInt(shown.length)+' mapped locations • '+fmtInt(filtered.length-mappable.length)+' groups without a single usable coordinate'+(filtered.length>500?' • Matrix shows first 500':'')+(points.length>1000?' • Map shows first 1,000 locations':'');
    if(typeof L==='undefined'){clearTowerMap();mapEl.textContent='Map library unavailable. The comparison matrix remains usable.';return;}
    if(mapEl.getBoundingClientRect().width<80)return;
    if(!multiTowerMap){mapEl.textContent='';multiTowerMap=L.map(mapEl,{zoomControl:true}).setView([13.08,80.27],10);multiTowerLayer=L.layerGroup().addTo(multiTowerMap);}
    multiTowerLayer.clearLayers();
    // External tiles are opt-in and disabled when Movement privacy mode is on.
    const tiles=$('multiTowerBasemap'),privacy=!!$('mapPrivacyMode')?.checked||!!state.mapPrivacyMode;
    if(privacy&&tiles)tiles.checked=false;
    if(tiles?.checked&&!privacy&&!multiTowerTiles){multiTowerTiles=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'}).addTo(multiTowerMap);}
    else if((!tiles?.checked||privacy)&&multiTowerTiles){multiTowerMap.removeLayer(multiTowerTiles);multiTowerTiles=null;}
    const bounds=[];
    for(const g of shown){
      const ll=g.key.split(',').map(Number);bounds.push(ll);
      const members=[...g.counts.keys()].sort((a,b)=>subjects.indexOf(a)-subjects.indexOf(b));
      const size=Math.min(46,24+Math.log2(1+g.total)*2.2),step=100/members.length;
      const gradient=colorsOn?'conic-gradient('+members.map((n,i)=>subjectColor(n)+' '+(i*step)+'% '+((i+1)*step)+'%').join(',')+')':(members.length>1?'#9333ea':'#64748b');
      const label=countsOn?'<span style="position:absolute;top:100%;left:50%;transform:translateX(-50%);background:#0f172a;color:white;padding:1px 4px;border-radius:5px;font-size:11px;white-space:nowrap;font-weight:700">'+fmtInt(g.total)+'</span>':'';
      const icon=L.divIcon({className:'multi-tower-pin',iconSize:[size,size],iconAnchor:[size/2,size/2],html:'<div style="position:relative;width:100%;height:100%;border-radius:50%;border:2px solid white;box-shadow:0 1px 5px #0009;background:'+gradient+';display:grid;place-items:center"><span style="background:#0f172a;color:white;border-radius:50%;padding:2px 5px;font-weight:700;font-size:11px">'+members.length+'</span>'+label+'</div>'});
      const popup=g.groups.length===1?towerPopup(g.groups[0]):'<b>Co-located mapped groups ('+fmtInt(g.groups.length)+')</b><div>Combined map counts do not establish the same cell.</div>'+towerPopup({...g,cell:'Mapped location',operator:'See individual groups'})+g.groups.slice(0,12).map(towerPopup).join('<hr>')+(g.groups.length>12?'<div>Additional groups in matrix: '+fmtInt(g.groups.length-12)+'</div>':'');
      L.marker(ll,{icon,keyboard:true,title:members.length+' subjects, '+g.total+' CDR events'}).bindPopup(popup,{maxHeight:280}).addTo(multiTowerLayer);
    }
    multiTowerMap.invalidateSize({pan:false});
    if(bounds.length===1)multiTowerMap.setView(bounds[0],15);
    else if(bounds.length>1)multiTowerMap.fitBounds(bounds,{padding:[30,30],maxZoom:16});
    else multiTowerMap.setView([13.08,80.27],10);
  }
  function renderCompare(){
    const data=window.CDRMultiScope?.getRows?.()||state.filtered,cdrs=[...new Set(data.map(r=>r.cdrNo).filter(Boolean))],cdrKeys=new Set(data.map(r=>r.cdrKey||phoneKey(r.cdrNo)).filter(Boolean));
    multiTowerRows=data;multiTowerSubjects=[...cdrs].sort();multiTowerSubjects.forEach(subjectColor);
    renderMultiTowerView();
    if(cdrs.length<2){$('compareContent').className='empty';$('compareContent').innerHTML='Load or filter to at least two different CDR / A Party numbers to compare them.';return;}
    const contactMap=new Map(),imeiMap=new Map(),imsiMap=new Map(),direct=[];
    for(const r of data){
      if(!r.cdrNo)continue;
      if(r.bparty){const bk=r.bpartyKey||phoneKey(r.bparty);if(!contactMap.has(bk))contactMap.set(bk,{set:new Set(),display:r.bparty});contactMap.get(bk).set.add(r.cdrNo);if(cdrKeys.has(bk))direct.push(r);}
      if(r.imei){if(!imeiMap.has(r.imei))imeiMap.set(r.imei,new Set());imeiMap.get(r.imei).add(r.cdrNo);}
      if(r.imsi){if(!imsiMap.has(r.imsi))imsiMap.set(r.imsi,new Set());imsiMap.get(r.imsi).add(r.cdrNo);}
    }
    const commonContacts=[...contactMap].filter(([,o])=>o.set.size>1).sort((a,b)=>b[1].set.size-a[1].set.size);
    const commonTowers=buildTowerGroups(data).filter(o=>o.counts.size>1);
    const commonImei=[...imeiMap].filter(([,s])=>s.size>1),commonImsi=[...imsiMap].filter(([,s])=>s.size>1);
    const windowMin=+$('colocationMins').value||30,episodeGap=+$('episodeGapMins').value||60;
    const episodes=colocationEpisodes(data,windowMin,episodeGap);
    const pairSummary=new Map();
    for(const e of episodes){
      const k=e.a+'|'+e.b;let s=pairSummary.get(k)||{a:e.a,b:e.b,episodes:0,rawMatches:0,dates:new Set(),towers:new Set(),minGap:Infinity};
      s.episodes++;s.rawMatches+=e.rawMatches;s.dates.add(localDateKey(e.start));s.towers.add(e.cell);s.minGap=Math.min(s.minGap,e.minGap);pairSummary.set(k,s);
    }
    const pairRows=[...pairSummary.values()].sort((a,b)=>b.episodes-a.episodes||b.dates.size-a.dates.size||b.towers.size-a.towers.size);
    $('compareContent').className='';
    $('compareContent').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${cdrs.length}</div><div class="l">CDR numbers compared</div></div><div class="kpi"><div class="v">${commonContacts.length}</div><div class="l">Common contacts</div></div><div class="kpi"><div class="v">${commonTowers.length}</div><div class="l">Common towers</div></div><div class="kpi"><div class="v">${episodes.length}</div><div class="l">Overlap episodes</div></div><div class="kpi"><div class="v">${direct.length}</div><div class="l">Direct subject-to-subject events</div></div><div class="kpi"><div class="v">${commonImei.length+commonImsi.length}</div><div class="l">Shared identifiers</div></div></div>
      <div class="split"><div><h3>Common contacts</h3>${simpleTable(['B Party','CDR numbers'],commonContacts.slice(0,200).map(([k,o])=>[`<a href="#" class="link contact-filter" data-num="${escapeHtml(o.display)}" title="${escAttr(contactTitle(o.display))}">${escapeHtml(contactLabel(o.display))}</a>`,escapeHtml([...o.set].join(', '))]))}</div><div><h3>Common towers</h3><p class="tiny">See the colour-coded tower map and comparison matrix above. Counts use operator + Cell ID, where operator is known.</p></div></div>
      <div class="split"><div><h3>Same-cell overlap episodes</h3>${simpleTable(['Subjects','Cell / address','Start','End','Records A / B','Closest gap','Raw matches'],episodes.slice(0,300).map(x=>[escapeHtml(x.a+' ↔ '+x.b),escapeHtml(x.cell+' • '+(x.address||'')),dtFmt(x.start),dtFmt(x.end),fmtInt(x.recordsA)+' / '+fmtInt(x.recordsB),x.minGap.toFixed(1)+' min',fmtInt(x.rawMatches)]))}</div><div><h3>Direct communication between loaded subjects</h3>${simpleTable(['From subject','To loaded subject','Date/time','Type','Duration'],direct.slice(0,200).map(r=>[escapeHtml(r.cdrNo),escapeHtml(contactLabel(r.bparty)),dtFmt(r.dt),escapeHtml(r.callType),fmtDur(r.duration)]))}</div></div>
      <h3>Overlap episode summary</h3>${simpleTable(['Subjects','Episodes','Separate dates','Distinct towers','Closest gap','Supporting raw matches'],pairRows.slice(0,200).map(x=>[escapeHtml(x.a+' ↔ '+x.b),fmtInt(x.episodes),fmtInt(x.dates.size),fmtInt(x.towers.size),x.minGap.toFixed(1)+' min',fmtInt(x.rawMatches)]))}
      <h3>Chronological overlap episode timeline</h3>${simpleTable(['Start','End','Subjects','Cell / address','Records A / B'],episodes.slice(0,500).map(x=>[dtFmt(x.start),dtFmt(x.end),escapeHtml(x.a+' ↔ '+x.b),escapeHtml(x.cell+' • '+(x.address||'')),fmtInt(x.recordsA)+' / '+fmtInt(x.recordsB)]))}
      <div class="split"><div><h3>Shared IMEI</h3>${simpleTable(['IMEI','CDR numbers'],commonImei.slice(0,100).map(([k,s])=>[escapeHtml(k),escapeHtml([...s].join(', '))]))}</div><div><h3>Shared IMSI</h3>${simpleTable(['IMSI','CDR numbers'],commonImsi.slice(0,100).map(([k,s])=>[escapeHtml(k),escapeHtml([...s].join(', '))]))}</div></div>`;
  }

    function bind(){
      $('networkRefreshBtn').onclick=()=>{networkSelected=null;renderNetwork();};
      $('networkMinEvents').onchange=renderNetwork;
      $('networkSharedOnly').onchange=renderNetwork;
      $('networkCanvas').addEventListener('click',e=>{
        const rect=$('networkCanvas').getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;
        let hit=null,best=24;
        for(const n of networkNodes){const d=Math.hypot(n.x-x,n.y-y);if(d<best){best=d;hit=n;}}
        networkSelected=hit?hit.id:null;
        renderNetwork();
      });
      $('compareRefreshBtn').onclick=renderCompare;
      for(const id of ['multiTowerGrouping','multiTowerScope','multiTowerSort','multiTowerCounts','multiTowerColors','multiTowerBasemap'])if($(id))$(id).addEventListener('change',renderMultiTowerView);
      if($('mapPrivacyMode'))$('mapPrivacyMode').addEventListener('change',()=>{if($('mapPrivacyMode').checked){if($('multiTowerBasemap'))$('multiTowerBasemap').checked=false;if(multiTowerTiles&&multiTowerMap){multiTowerMap.removeLayer(multiTowerTiles);multiTowerTiles=null;}}});
      if(typeof ResizeObserver!=='undefined'&&$('multiTowerMap'))new ResizeObserver(()=>{if($('multiTowerMap').getBoundingClientRect().width>=80){if(!multiTowerMap)renderMultiTowerView();else multiTowerMap.invalidateSize({pan:false});}}).observe($('multiTowerMap'));
    }
    return {renderNetwork,colocationEvents,colocationEpisodes,colocationMatches,renderCompare,bind};
  };
})();
