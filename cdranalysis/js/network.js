(() => {
  'use strict';
  window.CDRNetworkFactory = function(ctx){
    const {$,state,aggregateContacts,contactLabel,phoneKey,localDateKey,simpleTable,escapeHtml,escAttr,contactTitle,fmtInt,dtFmt,fmtDur}=ctx;
    let networkNodes=[],networkEdges=[],networkSelected=null;

  function renderNetwork(){const canvas=$('networkCanvas');if(!canvas||!canvas.getContext)return;const rect=canvas.getBoundingClientRect();const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(600,rect.width*dpr);canvas.height=Math.max(420,rect.height*dpr);const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);const W=canvas.width/dpr,H=canvas.height/dpr;ctx.clearRect(0,0,W,H);const data=state.filtered;const cdrs=[...new Set(data.map(r=>r.cdrNo).filter(Boolean))];const topN=+$('networkTop')?.value||30,minEvents=+$('networkMinEvents')?.value||1,sharedOnly=!!$('networkSharedOnly')?.checked;let contacts=aggregateContacts(data).filter(x=>x.records>=minEvents);if(sharedOnly)contacts=contacts.filter(x=>x.cdrs.size>1);contacts=contacts.slice(0,topN);const nodes=[],edges=[];const center={x:W/2,y:H/2};const cr=Math.min(W,H)*0.25;cdrs.forEach((c,i)=>{const a=(Math.PI*2*i/Math.max(1,cdrs.length))-Math.PI/2;nodes.push({id:'a:'+c,label:c,type:'a',x:center.x+Math.cos(a)*cr*.55,y:center.y+Math.sin(a)*cr*.55,w:data.filter(r=>r.cdrNo===c).length});});contacts.forEach((c,i)=>{const a=(Math.PI*2*i/Math.max(1,contacts.length))-Math.PI/2;const rr=cr*(1.2+(i%3)*.15);nodes.push({id:'b:'+c.bparty,label:contactLabel(c.bparty),type:'b',x:center.x+Math.cos(a)*rr,y:center.y+Math.sin(a)*rr,w:c.records,shared:c.cdrs.size>1});for(const ap of c.cdrs){const w=data.filter(r=>r.cdrNo===ap&&(r.bpartyKey||phoneKey(r.bparty))===c.key).length;edges.push({a:'a:'+ap,b:'b:'+c.bparty,w});}});networkNodes=nodes;networkEdges=edges;const nm=new Map(nodes.map(n=>[n.id,n]));ctx.lineCap='round';for(const e of edges){const a=nm.get(e.a),b=nm.get(e.b);if(!a||!b)continue;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);const related=!networkSelected||e.a===networkSelected||e.b===networkSelected;ctx.strokeStyle=related?'rgba(21,94,239,.55)':'rgba(98,116,143,.08)';ctx.lineWidth=Math.min(6,1+Math.log2(1+e.w));ctx.stroke();}for(const n of nodes){const r=n.type==='a'?Math.min(24,11+Math.log2(1+n.w)*2):Math.min(16,6+Math.log2(1+n.w)*1.5);ctx.beginPath();ctx.arc(n.x,n.y,r,0,Math.PI*2);const related=!networkSelected||n.id===networkSelected||edges.some(e=>(e.a===networkSelected&&e.b===n.id)||(e.b===networkSelected&&e.a===n.id));ctx.globalAlpha=related?1:.18;ctx.fillStyle=n.type==='a'?'#155eef':n.shared?'#b54708':'#667085';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font=(n.type==='a'?'700 ':'')+'11px system-ui';ctx.textAlign='center';ctx.fillStyle='#bcecf5';const label=n.label.length>18?n.label.slice(0,18)+'…':n.label;ctx.fillText(label,n.x,n.y+r+14);ctx.globalAlpha=1;}const shared=contacts.filter(x=>x.cdrs.size>1).length;$('networkLegend').innerHTML=`<span class="metric-chip">Subjects: ${cdrs.length}</span><span class="metric-chip">Contacts shown: ${contacts.length}</span><span class="metric-chip">Shared contacts: ${shared}</span><span class="metric-chip">Blue = loaded subject</span><span class="metric-chip">Orange = shared contact</span>`;}
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
  function renderCompare(){
    const data=state.filtered,cdrs=[...new Set(data.map(r=>r.cdrNo).filter(Boolean))],cdrKeys=new Set(data.map(r=>r.cdrKey||phoneKey(r.cdrNo)).filter(Boolean));
    if(cdrs.length<2){$('compareContent').className='empty';$('compareContent').innerHTML='Load or filter to at least two different CDR / A Party numbers to compare them.';return;}
    const contactMap=new Map(),towerMap=new Map(),imeiMap=new Map(),imsiMap=new Map(),direct=[];
    for(const r of data){
      if(!r.cdrNo)continue;
      if(r.bparty){const bk=r.bpartyKey||phoneKey(r.bparty);if(!contactMap.has(bk))contactMap.set(bk,{set:new Set(),display:r.bparty});contactMap.get(bk).set.add(r.cdrNo);if(cdrKeys.has(bk))direct.push(r);}
      if(r.firstCellId){if(!towerMap.has(r.firstCellId))towerMap.set(r.firstCellId,{set:new Set(),address:r.firstAddress});towerMap.get(r.firstCellId).set.add(r.cdrNo);}
      if(r.imei){if(!imeiMap.has(r.imei))imeiMap.set(r.imei,new Set());imeiMap.get(r.imei).add(r.cdrNo);}
      if(r.imsi){if(!imsiMap.has(r.imsi))imsiMap.set(r.imsi,new Set());imsiMap.get(r.imsi).add(r.cdrNo);}
    }
    const commonContacts=[...contactMap].filter(([,o])=>o.set.size>1).sort((a,b)=>b[1].set.size-a[1].set.size);
    const commonTowers=[...towerMap].filter(([,o])=>o.set.size>1).sort((a,b)=>b[1].set.size-a[1].set.size);
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
      <div class="split"><div><h3>Common contacts</h3>${simpleTable(['B Party','CDR numbers'],commonContacts.slice(0,200).map(([k,o])=>[`<a href="#" class="link contact-filter" data-num="${escapeHtml(o.display)}" title="${escAttr(contactTitle(o.display))}">${escapeHtml(contactLabel(o.display))}</a>`,escapeHtml([...o.set].join(', '))]))}</div><div><h3>Common towers</h3>${simpleTable(['Cell ID / address','CDR numbers'],commonTowers.slice(0,200).map(([k,o])=>[escapeHtml(k+' • '+(o.address||'')),escapeHtml([...o.set].join(', '))]))}</div></div>
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
    }
    return {renderNetwork,colocationEvents,colocationEpisodes,colocationMatches,renderCompare,bind};
  };
})();
