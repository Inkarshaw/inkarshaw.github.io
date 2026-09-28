(() => {
  'use strict';
  window.CDRMovementFactory = function(ctx){
    const {$,state,localDateKey,haversineKm,fmtInt,fmtDur,dtFmt,dateFmt,escapeHtml,escAttr,mapLink,newChart,incidentDateTime,contactLabel,showStatus,timeMins,withinNight}=ctx;
    let movementMap=null, movementLayer=null, movementHeatLayer=null, movementTileLayer=null, movementCanvasRenderer=null;
    let movementPlaybackMarker=null, movementStartMarker=null, movementEndMarker=null;
    let movementPlaybackRows=[], movementPlaybackMarkers=[], movementPlaybackIndex=0, movementPlaybackTimer=null;

  function movementDateRange(){
    const from=$('movementDateFrom')?.value||'',to=$('movementDateTo')?.value||'';
    return {from,to,valid:!from||!to||from<=to};
  }
  function movementDateMatch(r){
    if(!r?.dt)return false;
    const {from,to}=movementDateRange(),d=localDateKey(r.dt);
    if(from&&d<from)return false;
    if(to&&d>to)return false;
    return true;
  }
  function movementRows(){
    let data=state.filtered.filter(r=>r.dt&&(r.firstCellId||r.firstAddress));
    const cdr=$('movementCdr')?.value||''; if(cdr)data=data.filter(r=>r.cdrNo===cdr);
    const range=movementDateRange();if(!range.valid)return [];data=data.filter(movementDateMatch);
    data=[...data].sort((a,b)=>a.dt-b.dt); const gap=(+$('movementMergeMins')?.value||30)*60000; const out=[];
    for(const r of data){
      const key=r.firstCellId||r.firstAddress,last=out[out.length-1],lat=r.lat==null||r.lat===''?null:Number(r.lat),lng=r.lng==null||r.lng===''?null:Number(r.lng),hasCoords=Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
      if(last&&last.key===key&&r.dt-last.end<=gap){last.end=r.dt;last.events++;last.duration+=r.duration;if(r.bparty)last.contacts.add(r.bparty);if(hasCoords){last.lat=lat;last.lng=lng;}continue;}
      out.push({key,cellId:r.firstCellId,address:r.firstAddress,start:r.dt,end:r.dt,events:1,duration:r.duration,contacts:new Set(r.bparty?[r.bparty]:[]),lat:hasCoords?lat:null,lng:hasCoords?lng:null,cdrs:new Set(r.cdrNo?[r.cdrNo]:[])});
    }
    for(let i=0;i<out.length;i++){const a=out[i],b=out[i+1];a.nextDistance=b?haversineKm(a,b):null;a.nextMinutes=b?Math.max(0,(b.start-a.end)/60000):null;a.towerRate=a.nextDistance!=null&&a.nextMinutes>0?a.nextDistance/(a.nextMinutes/60):null;}
    return out;
  }

  function renderMovementMap(rows,attempt=0){
    const el=$('movementMap');if(!el)return;
    const rect=el.getBoundingClientRect();
    if((rect.width<80||rect.height<80)&&attempt<5){setTimeout(()=>renderMovementMap(rows,attempt+1),80);return;}
    movementPlaybackMarkers=[];movementPlaybackMarker=null;
    const pts=rows.map((x,i)=>({x,i})).filter(p=>Number.isFinite(p.x.lat)&&Number.isFinite(p.x.lng)&&Math.abs(p.x.lat)<=90&&Math.abs(p.x.lng)<=180);
    movementPlaybackRows=pts.map(p=>p.x);
    if($('movementMapStatus'))$('movementMapStatus').innerHTML=`<span class="metric-chip">Segments: ${fmtInt(rows.length)}</span><span class="metric-chip">Mapped: ${fmtInt(pts.length)}</span><span class="metric-chip">Without coordinates: ${fmtInt(rows.length-pts.length)}</span><span class="metric-chip" id="tileStatusChip">Loading map tiles…</span>`;
    if(typeof L==='undefined'){el.innerHTML='<div class="map-empty">Map library could not load. Internet access is required to load the map.</div>';return;}

    if(!movementMap){
      try{
        el.innerHTML='';
        movementMap=L.map(el,{preferCanvas:false,zoomControl:true});
        movementMap.createPane('movementRoutePane');movementMap.getPane('movementRoutePane').style.zIndex='430';movementMap.getPane('movementRoutePane').style.pointerEvents='none';
        movementMap.createPane('movementTowerPane');movementMap.getPane('movementTowerPane').style.zIndex='440';
        movementMap.createPane('movementAnchorPane');movementMap.getPane('movementAnchorPane').style.zIndex='650';
        movementCanvasRenderer=L.canvas({padding:.5});
        movementMap.setView([13.0827,80.2707],10);
        let tileOk=false,tileErrors=0,fallbackUsed=false;
        const wireTiles=layer=>{
          layer.on('tileload',()=>{if(tileOk)return;tileOk=true;const chip=$('tileStatusChip');if(chip){chip.textContent=fallbackUsed?'Fallback map tiles loaded':'Map tiles loaded';chip.classList.remove('warntext');chip.classList.add('goodtext');}});
          layer.on('tileerror',()=>{
            tileErrors++;
            const chip=$('tileStatusChip');if(chip){chip.textContent='Map tile loading issue…';chip.classList.add('warntext');}
            if(!tileOk&&!fallbackUsed&&tileErrors>=4){
              fallbackUsed=true;
              try{movementMap.removeLayer(movementTileLayer)}catch{}
              movementTileLayer=L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{maxZoom:20,attribution:'&copy; OpenStreetMap contributors &copy; CARTO'});
              wireTiles(movementTileLayer);movementTileLayer.addTo(movementMap);
              const chip2=$('tileStatusChip');if(chip2)chip2.textContent='Trying fallback map tiles…';
            }
          });
        };
        movementTileLayer=L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap contributors'});
        wireTiles(movementTileLayer);movementTileLayer.addTo(movementMap);
        movementLayer=L.layerGroup().addTo(movementMap);
        movementMap.invalidateSize({pan:false});
      }catch(err){
        try{movementMap?.remove()}catch{}
        movementMap=null;movementLayer=null;movementTileLayer=null;
        el.innerHTML='<div class="map-empty">Movement map could not initialize. Use Refresh after opening the Movement tab.</div>';
        if($('movementMapStatus'))$('movementMapStatus').innerHTML+=`<span class="metric-chip warntext">Map initialization error</span>`;
        return;
      }
    }else{
      if(!movementLayer)movementLayer=L.layerGroup().addTo(movementMap);else movementLayer.clearLayers();
      movementStartMarker=null;movementEndMarker=null;
      movementMap.invalidateSize({pan:false});
      const chip=$('tileStatusChip');if(chip)chip.textContent='Map ready';
    }

    if(movementHeatLayer){try{movementMap.removeLayer(movementHeatLayer)}catch{}movementHeatLayer=null;}
    const heatMode=$('movementHeatMode')?.value||'off';
    if(heatMode!=='off'&&typeof L.heatLayer==='function'){
      const inc=incidentDateTime(),win=(+$('incidentWindowHours')?.value||6)*3600000,subject=$('movementCdr')?.value||'';
      const source=state.filtered.filter(r=>Number.isFinite(r.lat)&&Number.isFinite(r.lng)&&(!subject||r.cdrNo===subject)&&movementDateMatch(r)).filter(r=>{
        if(heatMode==='day')return r.dt&&r.dt.getHours()>=6&&r.dt.getHours()<20;
        if(heatMode==='night')return r.dt&&(r.dt.getHours()>=20||r.dt.getHours()<6);
        if(heatMode==='incident')return inc&&r.dt&&Math.abs(r.dt-inc)<=win;
        return true;
      });
      if(source.length)movementHeatLayer=L.heatLayer(source.map(r=>[r.lat,r.lng,.65]),{radius:24,blur:18,maxZoom:17}).addTo(movementMap);
    }

    if(!pts.length){
      movementMap.invalidateSize({pan:false});
      movementMap.setView([13.0827,80.2707],10);
      if($('movementMapStatus'))$('movementMapStatus').innerHTML+=`<span class="metric-chip warntext">No usable tower coordinates in the current selection</span>`;
      setTimeout(()=>movementMap.invalidateSize({pan:false}),120);
      return;
    }

    // Keep route drawing lightweight on very large CDRs.
    const maxRoutePoints=2500,step=Math.max(1,Math.ceil(pts.length/maxRoutePoints));
    const routePts=pts.filter((_,i)=>i%step===0||i===pts.length-1);
    const latlngs=routePts.map(p=>[p.x.lat,p.x.lng]);
    if(latlngs.length>1)L.polyline(latlngs,{pane:'movementRoutePane',weight:4,opacity:.95,dashArray:'9,6',color:'#18d9ff',lineCap:'round',lineJoin:'round'}).addTo(movementLayer);

    // Small datasets retain chronological numbered markers. Large datasets use one Canvas marker per distinct tower.
    if(pts.length<=500){
      pts.forEach(({x,i},j)=>{
        const icon=L.divIcon({className:'sequence-marker',html:`<span>${i+1}</span>`,iconSize:[30,30],iconAnchor:[15,15]});
        const marker=L.marker([x.lat,x.lng],{pane:'movementAnchorPane',icon,title:`#${i+1} ${x.cellId||x.address||'Tower'}`}).addTo(movementLayer);
        movementPlaybackMarkers[j]=marker;
        const next=x.nextDistance==null?'—':x.nextDistance.toFixed(1)+' km',gap=x.nextMinutes==null?'—':Math.round(x.nextMinutes)+' min';
        const contacts=[...x.contacts].slice(0,12).map(n=>escapeHtml(contactLabel(n))).join(', ');
        marker.bindPopup(`<div style="min-width:230px"><b>Stop #${i+1}</b><br><b>Time:</b> ${escapeHtml(dtFmt(x.start))}${x.end&&+x.end!==+x.start?' – '+escapeHtml(dtFmt(x.end)):''}<br><b>Cell ID:</b> ${escapeHtml(x.cellId||'—')}<br><b>Tower:</b> ${escapeHtml(x.address||'—')}<br><b>Events:</b> ${fmtInt(x.events)}<br><b>Contacts:</b> ${contacts||'—'}<br><b>Next tower:</b> ${escapeHtml(next)} • <b>Gap:</b> ${escapeHtml(gap)}</div>`);
      });
    }else{
      const towers=new Map();
      for(const {x} of pts){
        const k=x.key||x.cellId||x.address||`${x.lat.toFixed(5)},${x.lng.toFixed(5)}`;
        let t=towers.get(k);
        if(!t)t={lat:x.lat,lng:x.lng,cellId:x.cellId,address:x.address,segments:0,events:0,first:x.start,last:x.end,contacts:new Set()};
        t.segments++;t.events+=x.events||0;if(x.start<t.first)t.first=x.start;if(x.end>t.last)t.last=x.end;
        for(const n of x.contacts||[])t.contacts.add(n);
        towers.set(k,t);
      }
      for(const t of towers.values()){
        const radius=Math.max(4,Math.min(10,4+Math.log2(1+t.segments)));
        const marker=L.circleMarker([t.lat,t.lng],{pane:'movementTowerPane',radius,color:'#d9fbff',weight:1.5,fillColor:'#17c9e8',fillOpacity:.88}).addTo(movementLayer);
        marker.bindPopup(`<div style="min-width:230px"><b>${escapeHtml(t.cellId||'Tower')}</b><br><b>Address:</b> ${escapeHtml(t.address||'—')}<br><b>Movement segments:</b> ${fmtInt(t.segments)}<br><b>Events:</b> ${fmtInt(t.events)}<br><b>First:</b> ${escapeHtml(dtFmt(t.first))}<br><b>Last:</b> ${escapeHtml(dtFmt(t.last))}<br><b>Contacts:</b> ${[...t.contacts].slice(0,10).map(n=>escapeHtml(contactLabel(n))).join(', ')||'—'}</div>`);
      }
      if($('movementMapStatus'))$('movementMapStatus').innerHTML+=`<span class="metric-chip">High-volume mode: ${fmtInt(towers.size)} tower markers</span>`;
    }

    const firstPt=pts[0]?.x,lastPt=pts[pts.length-1]?.x;
    if(firstPt){
      movementStartMarker=L.circleMarker([firstPt.lat,firstPt.lng],{pane:'movementAnchorPane',radius:10,color:'#ffffff',weight:3,fillColor:'#31f7a8',fillOpacity:1}).addTo(movementLayer);
      movementStartMarker.bindTooltip('START',{permanent:false,direction:'top'});
    }
    if(lastPt){
      movementEndMarker=L.circleMarker([lastPt.lat,lastPt.lng],{pane:'movementAnchorPane',radius:10,color:'#ffffff',weight:3,fillColor:'#ff5d78',fillOpacity:1}).addTo(movementLayer);
      movementEndMarker.bindTooltip('END',{permanent:false,direction:'top'});
    }
    if($('movementMapStatus'))$('movementMapStatus').innerHTML+=`<span class="metric-chip goodtext">Overlay: route + ${pts.length<=500?fmtInt(pts.length):'tower'} markers</span>`;

    const slider=$('movementSlider');if(slider){slider.max=Math.max(0,movementPlaybackRows.length-1);if(+slider.value>+slider.max)slider.value=0;updateMovementPlayback(+slider.value||0,false);}
    const fullBounds=L.latLngBounds(pts.map(p=>[p.x.lat,p.x.lng]));
    movementMap.invalidateSize({pan:false});
    if(pts.length===1)movementMap.setView([pts[0].x.lat,pts[0].x.lng],15);else movementMap.fitBounds(fullBounds.pad(.08),{maxZoom:16});
    requestAnimationFrame(()=>movementMap?.invalidateSize({pan:false}));
    setTimeout(()=>{movementMap?.invalidateSize({pan:false});if(pts.length>1)movementMap?.fitBounds(fullBounds.pad(.08),{maxZoom:16});},180);
  }

  function updateMovementPlayback(i,openPopup=true,pan=true){
    if(!movementPlaybackRows.length){$('movementPlaybackLabel').textContent='No movement selected';return;}
    movementPlaybackIndex=Math.max(0,Math.min(i,movementPlaybackRows.length-1));
    const r=movementPlaybackRows[movementPlaybackIndex];
    $('movementSlider').value=movementPlaybackIndex;
    $('movementPlaybackLabel').textContent=`#${movementPlaybackIndex+1} / ${movementPlaybackRows.length} • ${dtFmt(r.start)} • ${r.address||r.cellId||'Tower'}`;

    const m=movementPlaybackMarkers[movementPlaybackIndex];
    if(m&&movementMap){
      if(pan)movementMap.panTo(m.getLatLng(),{animate:true,duration:.25});
      if(openPopup)m.openPopup();
      return;
    }

    if(movementMap){
      const ll=[r.lat,r.lng];
      if(!movementPlaybackMarker){
        movementPlaybackMarker=L.circleMarker(ll,{
          pane:'movementAnchorPane',radius:11,color:'#ffffff',weight:3,
          fillColor:'#ffb454',fillOpacity:1
        }).addTo(movementMap);
        const el=movementPlaybackMarker.getElement?.();if(el)el.classList.add('movement-playback-pulse');
      }else movementPlaybackMarker.setLatLng(ll);

      movementPlaybackMarker.bindPopup(`<b>Playback #${movementPlaybackIndex+1}</b><br>${escapeHtml(dtFmt(r.start))}<br>${escapeHtml(r.address||r.cellId||'Tower')}`);
      if(pan)movementMap.panTo(ll,{animate:true,duration:.22});
      if(openPopup)movementPlaybackMarker.openPopup();
    }
  }

  function playbackStepSize(){
    const n=movementPlaybackRows.length;
    if(n>10000)return Math.ceil(n/500);
    if(n>5000)return Math.ceil(n/650);
    if(n>2000)return Math.ceil(n/800);
    if(n>1000)return 2;
    return 1;
  }

  function stopMovementPlayback(){
    if(movementPlaybackTimer){clearTimeout(movementPlaybackTimer);movementPlaybackTimer=null;}
    if($('movementPlayBtn'))$('movementPlayBtn').textContent='▶ Play';
  }

  function scheduleMovementPlayback(){
    if(!movementPlaybackTimer)return;
    const delay=+$('movementSpeed')?.value||350;
    movementPlaybackTimer=setTimeout(()=>{
      if(!movementPlaybackTimer)return;
      const step=playbackStepSize();
      let next=movementPlaybackIndex+step;
      if(next>=movementPlaybackRows.length){
        updateMovementPlayback(movementPlaybackRows.length-1,false,true);
        stopMovementPlayback();
        return;
      }
      updateMovementPlayback(next,false,true);
      scheduleMovementPlayback();
    },delay);
  }

  function toggleMovementPlayback(){
    if(movementPlaybackTimer){stopMovementPlayback();return;}
    if(!movementPlaybackRows.length){
      const rows=movementRows();
      // Rebuild synchronously from the current subject/date/filter state so Play never depends on a stale RAF callback.
      renderMovementMap(rows);
      if(!movementPlaybackRows.length){
        const coordinateRows=state.filtered.filter(r=>{
          const lat=r.lat==null||r.lat===''?NaN:Number(r.lat),lng=r.lng==null||r.lng===''?NaN:Number(r.lng);
          return Number.isFinite(lat)&&Number.isFinite(lng)&&Math.abs(lat)<=90&&Math.abs(lng)<=180;
        }).length;
        showStatus(`Playback unavailable: ${rows.length} movement segment(s), 0 mapped segment(s). ${coordinateRows} filtered CDR record(s) contain coordinates. Check the selected Movement subject/date if needed.`,'error');
        return;
      }
    }
    if(movementPlaybackIndex>=movementPlaybackRows.length-1)updateMovementPlayback(0,false,true);
    $('movementPlayBtn').textContent='⏸ Pause';
    movementPlaybackTimer=-1;
    scheduleMovementPlayback();
  }

  function shiftLocalDateKey(key,days){
    const p=String(key||'').split('-').map(Number);if(p.length!==3||p.some(x=>!Number.isFinite(x)))return key;
    return localDateKey(new Date(p[0],p[1]-1,p[2]+days));
  }
  function displayLocalDateKey(key){
    const p=String(key||'').split('-').map(Number);if(p.length!==3||p.some(x=>!Number.isFinite(x)))return key||'—';
    return dateFmt(new Date(p[0],p[1]-1,p[2]));
  }
  function nightStayAnalysis(){
    const start=timeMins($('nightFrom')?.value||'20:00')??1200,end=timeMins($('nightTo')?.value||'06:00')??360,wrap=start>end,range=movementDateRange();
    let data=state.filtered.filter(r=>r.dt&&(r.firstCellId||r.firstAddress));
    const selected=$('movementCdr')?.value||'';if(selected)data=data.filter(r=>r.cdrNo===selected);
    const groups=new Map();
    for(const r of data){
      const mins=r.dt.getHours()*60+r.dt.getMinutes();if(!withinNight(mins,start,end))continue;
      let nightKey=localDateKey(r.dt);if(wrap&&mins<=end)nightKey=shiftLocalDateKey(nightKey,-1);
      if(range.from&&nightKey<range.from)continue;if(range.to&&nightKey>range.to)continue;
      const subject=r.cdrNo||'—',groupKey=subject+'|'+nightKey,towerKey=r.firstCellId||r.firstAddress;
      let g=groups.get(groupKey);if(!g)g={subject,nightKey,events:0,first:null,last:null,towers:new Map()};
      g.events++;if(!g.first||r.dt<g.first)g.first=r.dt;if(!g.last||r.dt>g.last)g.last=r.dt;
      let t=g.towers.get(towerKey);if(!t)t={key:towerKey,cellId:r.firstCellId||'',address:r.firstAddress||'',events:0,first:null,last:null};
      t.events++;if(!t.first||r.dt<t.first)t.first=r.dt;if(!t.last||r.dt>t.last)t.last=r.dt;g.towers.set(towerKey,t);groups.set(groupKey,g);
    }
    const rows=[...groups.values()].map(g=>{
      const towers=[...g.towers.values()].sort((a,b)=>b.events-a.events||(a.first?.getTime?.()||0)-(b.first?.getTime?.()||0)),main=towers[0]||{key:'',cellId:'',address:'',events:0};
      return {...g,main,distinctTowers:g.towers.size,share:g.events?100*main.events/g.events:0};
    }).sort((a,b)=>a.nightKey.localeCompare(b.nightKey)||String(a.subject).localeCompare(String(b.subject)));
    const repeats=new Map();
    for(const r of rows){const k=r.subject+'|'+r.main.key;repeats.set(k,(repeats.get(k)||0)+1);}
    for(const r of rows)r.repeatedMainNights=repeats.get(r.subject+'|'+r.main.key)||0;
    const recurring=[...rows].sort((a,b)=>b.repeatedMainNights-a.repeatedMainNights||b.main.events-a.main.events)[0]||null;
    return {rows,start,end,wrap,recurring,totalEvents:rows.reduce((s,r)=>s+r.events,0),distinctMain:new Set(rows.map(r=>r.subject+'|'+r.main.key)).size};
  }

  function renderMovement(){if(!$('movementTable'))return;
    const range=movementDateRange();
    if(!range.valid){
      stopMovementPlayback();movementPlaybackRows=[];
      $('movementSummary').innerHTML='<div class="notice">Movement From date cannot be later than To date.</div>';
      $('movementTable').innerHTML='';$('towerStayTable').innerHTML='';if($('nightStayTable'))$('nightStayTable').innerHTML='';if($('nightStaySummary'))$('nightStaySummary').innerHTML='';
      if($('movementMapStatus'))$('movementMapStatus').innerHTML='<span class="metric-chip warntext">Invalid date range</span>';
      showStatus('Movement From date cannot be later than To date.','error');return;
    }
    const rows=movementRows();const dates=state.filtered.filter(r=>r.dt).map(r=>r.dt);const towers=new Set(rows.map(x=>x.key));const dist=rows.reduce((s,x)=>s+(x.nextDistance||0),0);$('movementSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Tower segments</div></div><div class="kpi"><div class="v">${fmtInt(towers.size)}</div><div class="l">Distinct towers</div></div><div class="kpi"><div class="v">${dist.toFixed(1)} km</div><div class="l">Tower-to-tower total</div><div class="s">Coordinate-derived, not actual route distance</div></div><div class="kpi"><div class="v">${rows.length?dtFmt(rows[0].start):'—'}</div><div class="l">First segment</div></div><div class="kpi"><div class="v">${rows.length?dtFmt(rows[rows.length-1].end):'—'}</div><div class="l">Last segment</div></div><div class="kpi"><div class="v">${range.from||range.to?(range.from||'Start')+' → '+(range.to||'End'):'All dates'}</div><div class="l">Movement date range</div></div></div>`;
    $('movementTable').innerHTML=`<thead><tr><th>#</th><th>Start</th><th>End</th><th>Cell ID</th><th>Tower address</th><th>Events</th><th>Contacts</th><th>Duration</th><th>Next distance</th><th>Gap</th><th>Tower-to-tower rate</th><th>Map</th></tr></thead><tbody>${rows.slice(0,3000).map((x,i)=>`<tr><td>${i+1}</td><td>${dtFmt(x.start)}</td><td>${dtFmt(x.end)}</td><td>${escapeHtml(x.cellId)}</td><td class="details">${escapeHtml(x.address)}</td><td class="num">${fmtInt(x.events)}</td><td class="num">${fmtInt(x.contacts.size)}</td><td class="num">${fmtDur(x.duration)}</td><td class="num">${x.nextDistance==null?'':x.nextDistance.toFixed(1)+' km'}</td><td class="num">${x.nextMinutes==null?'':Math.round(x.nextMinutes)+' min'}</td><td class="num ${x.towerRate>250?'warntext':''}">${x.towerRate==null?'':Math.round(x.towerRate)+' km/h'}</td><td>${mapLink(x)}</td></tr>`).join('')}</tbody>`;
    const stays=new Map();for(const x of rows){const k=x.key;let s=stays.get(k)||{cellId:x.cellId,address:x.address,segments:0,events:0,spanMs:0,first:null,last:null};s.segments++;s.events+=x.events;s.spanMs+=Math.max(0,x.end-x.start);if(!s.first||x.start<s.first)s.first=x.start;if(!s.last||x.end>s.last)s.last=x.end;stays.set(k,s);}
    const stayRows=[...stays.values()].sort((a,b)=>b.spanMs-a.spanMs||b.events-a.events);
    $('towerStayTable').innerHTML=`<thead><tr><th>Cell ID</th><th>Tower</th><th>Segments</th><th>Events</th><th>Approx. observed span</th><th>First</th><th>Last</th></tr></thead><tbody>${stayRows.slice(0,200).map(s=>`<tr><td>${escapeHtml(s.cellId)}</td><td class="details">${escapeHtml(s.address)}</td><td>${s.segments}</td><td>${s.events}</td><td>${fmtDur(Math.round(s.spanMs/1000))}</td><td>${dtFmt(s.first)}</td><td>${dtFmt(s.last)}</td></tr>`).join('')}</tbody>`;

    const night=nightStayAnalysis(),nightLabel=`${String(Math.floor(night.start/60)).padStart(2,'0')}:${String(night.start%60).padStart(2,'0')}–${String(Math.floor(night.end/60)).padStart(2,'0')}:${String(night.end%60).padStart(2,'0')}`;
    if($('nightStaySummary')){
      const r=night.recurring;
      $('nightStaySummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(night.rows.length)}</div><div class="l">Subject-nights analysed</div><div class="s">${escapeHtml(nightLabel)}</div></div><div class="kpi"><div class="v">${fmtInt(night.totalEvents)}</div><div class="l">Nighttime CDR events</div></div><div class="kpi"><div class="v">${fmtInt(night.distinctMain)}</div><div class="l">Distinct main night towers</div></div><div class="kpi"><div class="v">${r?fmtInt(r.repeatedMainNights):'0'}</div><div class="l">Most repeated main tower</div><div class="s">${r?escapeHtml((r.main.cellId||r.main.address||'Tower')+' • '+r.subject):'—'}</div></div></div>`;
    }
    if($('nightStayTable'))$('nightStayTable').innerHTML=night.rows.length?`<thead><tr><th>Night</th><th>Subject</th><th>Main recorded night tower</th><th>First night event</th><th>Last night event</th><th>Night events</th><th>Main tower events</th><th>Main share</th><th>Distinct towers</th><th>Repeated as main tower</th></tr></thead><tbody>${night.rows.map(n=>{const endKey=night.wrap?shiftLocalDateKey(n.nightKey,1):n.nightKey;return `<tr><td>${escapeHtml(displayLocalDateKey(n.nightKey))}${night.wrap?' → '+escapeHtml(displayLocalDateKey(endKey)):''}</td><td>${escapeHtml(n.subject)}</td><td class="details"><a href="#" class="link night-stay-filter" data-subject="${escAttr(n.subject)}" data-night="${escAttr(n.nightKey)}" data-cell="${escAttr(n.main.cellId||'')}" data-tower="${escAttr(n.main.address||'')}">${escapeHtml(n.main.cellId||n.main.address||'—')}</a>${n.main.cellId&&n.main.address?`<div class="tiny">${escapeHtml(n.main.address)}</div>`:''}</td><td>${dtFmt(n.first)}</td><td>${dtFmt(n.last)}</td><td class="num">${fmtInt(n.events)}</td><td class="num">${fmtInt(n.main.events)}</td><td class="num">${n.share.toFixed(1)}%</td><td class="num">${fmtInt(n.distinctTowers)}</td><td class="num">${fmtInt(n.repeatedMainNights)} night(s)</td></tr>`}).join('')}</tbody>`:`<tbody><tr><td colspan="10" class="empty">No nighttime tower records match the current subject, filters and Movement date range.</td></tr></tbody>`;

    const pts=rows.filter(x=>x.lat!=null&&x.lng!=null).slice(0,1000);
    const seqPoints=pts.map((p,i)=>({x:p.lng,y:p.lat,seq:i+1,start:p.start,end:p.end,cellId:p.cellId,address:p.address,events:p.events}));
    const startPoint=seqPoints[0],endPoint=seqPoints[seqPoints.length-1];
    const sequenceLabelPlugin={id:'movementSequenceLabels',afterDatasetsDraw(chart){
      const ctx=chart.ctx;ctx.save();ctx.font='600 11px system-ui, sans-serif';ctx.textBaseline='middle';
      const drawLabel=(datasetIndex,text,dx,dy)=>{const el=chart.getDatasetMeta(datasetIndex)?.data?.[0];if(!el)return;const p=el.getProps(['x','y'],true);ctx.fillStyle=getComputedStyle(document.documentElement).getPropertyValue('--text').trim()||'#172033';ctx.fillText(text,p.x+dx,p.y+dy);};
      if(startPoint)drawLabel(1,'Start',9,-9);if(endPoint)drawLabel(2,'End',9,9);ctx.restore();
    }};
    newChart('movementChart',{type:'scatter',data:{datasets:[
      {label:'Sequence',data:seqPoints,showLine:true,borderWidth:2,pointRadius:3,pointHoverRadius:6,tension:0},
      {label:'Start',data:startPoint?[startPoint]:[],showLine:false,pointRadius:7,pointHoverRadius:9,pointStyle:'triangle'},
      {label:'End',data:endPoint?[endPoint]:[],showLine:false,pointRadius:7,pointHoverRadius:9,pointStyle:'rectRot'}
    ]},plugins:[sequenceLabelPlugin],options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:true,position:'bottom',labels:{usePointStyle:true,boxWidth:10}},tooltip:{callbacks:{
      title:items=>{const r=items?.[0]?.raw;return r?(`#${r.seq} • ${dtFmt(r.start)}`):'';},
      label:c=>{const r=c.raw;return `${r.cellId||'Tower'} • ${r.address||'No tower address'}`;},
      afterLabel:c=>{const r=c.raw;return [`Coordinates: ${Number(r.y).toFixed(5)}, ${Number(r.x).toFixed(5)}`,`Events in segment: ${fmtInt(r.events||0)}`,r.end&&r.start&&+r.end!==+r.start?`Segment end: ${dtFmt(r.end)}`:''].filter(Boolean);}
    }}},scales:{x:{title:{display:true,text:'Longitude'}},y:{title:{display:true,text:'Latitude'}}}}});
    if(!$('movement').classList.contains('hidden'))requestAnimationFrame(()=>renderMovementMap(rows));
  }


    function bind(){
      $('movementRefreshBtn').onclick=()=>{stopMovementPlayback();renderMovement();};
      $('movementDateFrom').onchange=()=>{stopMovementPlayback();renderMovement();};
      $('movementDateTo').onchange=()=>{stopMovementPlayback();renderMovement();};
      $('movementHeatMode').onchange=renderMovement;
      $('movementPlayBtn').onclick=toggleMovementPlayback;
      $('movementPrevBtn').onclick=()=>{stopMovementPlayback();updateMovementPlayback(movementPlaybackIndex-1,true,true);};
      $('movementNextBtn').onclick=()=>{stopMovementPlayback();updateMovementPlayback(movementPlaybackIndex+1,true,true);};
      $('movementSlider').oninput=e=>{stopMovementPlayback();updateMovementPlayback(+e.target.value,true,true);};
      $('movementSpeed').onchange=()=>{if(movementPlaybackTimer){clearTimeout(movementPlaybackTimer);movementPlaybackTimer=-1;scheduleMovementPlayback();}};
    }

    function invalidateMap(){
      try{movementMap?.invalidateSize()}catch{}
    }

    return {
      movementDateRange,movementDateMatch,movementRows,renderMovementMap,updateMovementPlayback,
      stopMovementPlayback,scheduleMovementPlayback,toggleMovementPlayback,shiftLocalDateKey,
      displayLocalDateKey,nightStayAnalysis,renderMovement,bind,invalidateMap
    };
  };
})();
