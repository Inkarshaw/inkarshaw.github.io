(() => {
  'use strict';

  function init(){
    const C=window.CDRCore, A=window.CDRApp;
    if(!C||!A)return;
    const $=C.$, state=C.state, esc=C.escapeHtml, fmt=C.fmtInt, dt=C.dtFmt, norm=C.normalize;

    function val(id,fallback){
      const el=$(id),n=Number(el&&el.value);
      return Number.isFinite(n)&&n>0?n:fallback;
    }
    function towerKey(r){
      return [r.operator,r.firstCellId||r.firstAddress].filter(Boolean).join('|') || String(r.firstAddress||r.firstCellId||'').trim();
    }
    function locationText(r){
      return norm([r.firstCellId,r.firstAddress,r.mainCity,r.subCity,r.location].filter(Boolean).join(' '));
    }
    function card(title,count,why,lines){
      return '<div class="lead-card"><h4>'+esc(title)+'</h4><div class="big">'+fmt(count)+'</div><div class="why">'+why+'</div><div class="lead-list">'+(lines&&lines.length?lines.join('<br>'):'<span class="muted">No matching items in the current filter.</span>')+'</div></div>';
    }
    function commonContacts(data){
      const m=new Map();
      data.forEach(r=>{
        if(!r.cdrNo||!r.bparty)return;
        const k=String(r.bparty);
        let x=m.get(k);
        if(!x)x={party:r.bparty,subjects:new Set(),events:0};
        x.subjects.add(r.cdrNo);x.events++;m.set(k,x);
      });
      return [...m.values()].filter(x=>x.subjects.size>=2).sort((a,b)=>b.subjects.size-a.subjects.size||b.events-a.events).slice(0,40);
    }
    function coordinated(data,windowMin){
      const by=new Map(),out=[],win=windowMin*60000;
      data.forEach(r=>{
        if(!r.dt||!r.cdrNo||!r.bparty)return;
        const k=String(r.bparty);if(!by.has(k))by.set(k,[]);by.get(k).push(r);
      });
      by.forEach((rows,party)=>{
        rows.sort((a,b)=>a.dt-b.dt);
        for(let i=0;i<rows.length;i++){
          const subjects=new Map([[rows[i].cdrNo,rows[i]]]);
          let last=i;
          for(let j=i+1;j<rows.length&&rows[j].dt-rows[i].dt<=win;j++){subjects.set(rows[j].cdrNo,rows[j]);last=j;}
          if(subjects.size>=2)out.push({party,start:rows[i].dt,subjects:[...subjects.keys()]});
          if(last>i)i=last-1;
        }
      });
      return out.sort((a,b)=>b.subjects.length-a.subjects.length||a.start-b.start).slice(0,40);
    }
    function sameCell(data,windowMin){
      const by=new Map(),out=[],seen=new Set(),win=windowMin*60000;
      data.forEach(r=>{
        if(!r.dt||!r.cdrNo)return;
        const k=towerKey(r);if(!k)return;
        if(!by.has(k))by.set(k,[]);by.get(k).push(r);
      });
      by.forEach((rows,tower)=>{
        rows.sort((a,b)=>a.dt-b.dt);
        for(let i=0;i<rows.length;i++){
          for(let j=i+1;j<rows.length&&rows[j].dt-rows[i].dt<=win;j++){
            if(rows[i].cdrNo===rows[j].cdrNo)continue;
            const pair=[rows[i].cdrNo,rows[j].cdrNo].sort().join('|');
            const k=tower+'|'+pair+'|'+Math.floor(+rows[i].dt/win);
            if(seen.has(k))continue;seen.add(k);
            out.push({tower,a:rows[i],b:rows[j],gap:Math.round((rows[j].dt-rows[i].dt)/60000)});
          }
        }
      });
      return out.sort((a,b)=>a.gap-b.gap||a.a.dt-b.a.dt).slice(0,50);
    }
    function subjectActivity(data){
      const by=new Map();
      data.forEach(r=>{if(r.cdrNo&&r.dt){if(!by.has(r.cdrNo))by.set(r.cdrNo,[]);by.get(r.cdrNo).push(r);}});
      return [...by].map(([cdr,rows])=>{rows.sort((a,b)=>a.dt-b.dt);return {cdr,first:rows[0],last:rows[rows.length-1],count:rows.length};});
    }
    function incidentSet(data,inc,windowMin,gapHours){
      const out={pre:[],post:[],gaps:[],newAssociations:[]};
      if(!inc)return out;
      const span=windowMin*60000,gapMs=gapHours*3600000;
      const near=data.filter(r=>r.dt&&Math.abs(r.dt-inc)<=span).sort((a,b)=>a.dt-b.dt);
      out.pre=near.filter(r=>r.dt<inc);out.post=near.filter(r=>r.dt>=inc);
      const by=new Map();
      data.forEach(r=>{if(r.cdrNo&&r.dt){if(!by.has(r.cdrNo))by.set(r.cdrNo,[]);by.get(r.cdrNo).push(r);}});
      by.forEach((rows,cdr)=>{
        rows.sort((a,b)=>a.dt-b.dt);
        let before=null,after=null;
        rows.forEach(r=>{if(r.dt<inc)before=r;else if(!after)after=r;});
        if(before&&after&&(after.dt-before.dt)>=gapMs)out.gaps.push({cdr,before,after,ms:after.dt-before.dt});
      });
      const first=new Map();
      A.getRecords().forEach(r=>{
        if(!r.dt||!r.cdrNo||!r.bparty)return;
        const k=String(r.cdrNo)+'|'+String(r.bparty),p=first.get(k);
        if(!p||r.dt<p.dt)first.set(k,r);
      });
      out.pre.forEach(r=>{
        if(!r.bparty)return;
        const p=first.get(String(r.cdrNo)+'|'+String(r.bparty));
        if(p&&p.id===r.id)out.newAssociations.push(r);
      });
      out.gaps.sort((a,b)=>b.ms-a.ms);
      return out;
    }
    function claimed(data,inc,windowMin,q){
      q=norm(q||'');if(!inc||!q)return null;
      const span=windowMin*60000,near=data.filter(r=>r.dt&&Math.abs(r.dt-inc)<=span);
      const matching=near.filter(r=>locationText(r).includes(q));
      return {near,matching,q};
    }
    function render(){
      const host=$('leadsContent');
      if(!host)return;
      let box=$('advancedInvestigationLeads');
      if(!box){
        box=document.createElement('div');
        box.id='advancedInvestigationLeads';
        box.style.marginTop='14px';
        host.parentNode.insertBefore(box,host.nextSibling);
      }
      const data=state.filtered||[],inc=C.incidentDateTime(),incidentMin=val('leadIncidentMins',60),gapHours=val('leadInactivityHours',4),cellMin=val('leadColocationMins',15),coordMin=val('leadCoordinationMins',10);
      const commons=commonContacts(data),coord=coordinated(data,coordMin),cells=sameCell(data,cellMin),activity=subjectActivity(data),iset=incidentSet(data,inc,incidentMin,gapHours);
      const claim=claimed(data,inc,incidentMin,$('leadClaimedLocation')?$('leadClaimedLocation').value:'');
      const cards=[];
      cards.push(card('Common contacts across subjects',commons.length,'Connected parties appearing in two or more loaded subjects.',commons.map(x=>esc(x.party)+' — '+fmt(x.subjects.size)+' subjects • '+fmt(x.events)+' events • '+esc([...x.subjects].join(', ')))));
      cards.push(card('Coordinated-contact windows',coord.length,'Two or more subjects contacted the same connected party within '+fmt(coordMin)+' minutes. Time correlation only.',coord.map(x=>dt(x.start)+' — '+esc(x.party)+' — '+fmt(x.subjects.length)+' subjects: '+esc(x.subjects.join(', ')))));
      cards.push(card('Same-cell overlaps',cells.length,'Different subjects used the same recorded tower within '+fmt(cellMin)+' minutes. This is not GPS-level co-location.',cells.map(x=>dt(x.a.dt)+' — '+esc(x.a.cdrNo)+' ↔ '+esc(x.b.cdrNo)+' • '+esc(x.tower)+' • '+fmt(x.gap)+' min gap')));
      cards.push(card('Pre-incident activity',iset.pre.length,inc?'Events within '+fmt(incidentMin)+' minutes before '+dt(inc)+'.':'Save incident date/time to enable this lead.',iset.pre.slice(-30).reverse().map(r=>dt(r.dt)+' — '+esc(r.cdrNo||'—')+' ↔ '+esc(r.bparty||'—')+' • '+esc(r.firstAddress||r.firstCellId||'—'))));
      cards.push(card('Post-incident activity',iset.post.length,inc?'Events within '+fmt(incidentMin)+' minutes after '+dt(inc)+'.':'Save incident date/time to enable this lead.',iset.post.slice(0,30).map(r=>dt(r.dt)+' — '+esc(r.cdrNo||'—')+' ↔ '+esc(r.bparty||'—')+' • '+esc(r.firstAddress||r.firstCellId||'—'))));
      cards.push(card('New associations near incident',iset.newAssociations.length,inc?'Contacts whose first observed interaction in the loaded CDR history occurred in the pre-incident window.':'Save incident date/time to enable this lead.',iset.newAssociations.slice(0,30).map(r=>dt(r.dt)+' — '+esc(r.cdrNo||'—')+' ↔ '+esc(r.bparty||'—'))));
      cards.push(card('Communication gaps around incident',iset.gaps.length,inc?'Subjects with no dated CDR event for at least '+fmt(gapHours)+' hours spanning the incident. A gap does not prove the handset was switched off.':'Save incident date/time to enable this lead.',iset.gaps.slice(0,30).map(x=>esc(x.cdr)+' — '+C.fmtDur(x.ms/1000)+' gap • last before '+dt(x.before.dt)+' • first after '+dt(x.after.dt))));
      cards.push(card('First / last activity by subject',activity.length,'Earliest and latest dated records within the current filter.',activity.map(x=>esc(x.cdr)+' — first '+dt(x.first.dt)+' • last '+dt(x.last.dt)+' • '+fmt(x.count)+' events')));
      if(claim)cards.push(card('Claimed-location text comparison',claim.matching.length,'Rows inside the incident window whose tower/location text contains “'+esc(claim.q)+'”. A non-match is not automatically an alibi contradiction.',claim.matching.map(r=>dt(r.dt)+' — '+esc(r.cdrNo||'—')+' • '+esc(r.firstAddress||r.firstCellId||'—'))));
      box.innerHTML='<div class="panel-title"><h3>Investigation Leads</h3><span class="muted">Cross-subject and incident-behaviour analysis</span></div><div class="notice"><b>Correlation prompts only:</b> these findings help prioritize verification. CDR metadata does not by itself establish identity, handset possession, exact physical location, intent or wrongdoing.</div><div class="lead-grid">'+cards.join('')+'</div>';
    }

    ['leadIncidentMins','leadInactivityHours','leadColocationMins','leadCoordinationMins','leadClaimedLocation'].forEach(id=>{
      const el=$(id);if(el)el.addEventListener(id==='leadClaimedLocation'?'input':'change',render);
    });
    const refresh=$('leadsRefreshBtn');if(refresh)refresh.addEventListener('click',()=>setTimeout(render,0));
    window.addEventListener('cdr:updated',render);
    const observer=new MutationObserver(()=>{if(!$('advancedInvestigationLeads'))render();});
    const host=$('leadsContent');if(host&&host.parentNode)observer.observe(host.parentNode,{childList:true});
    render();
    window.CDRInvestigationLeads={render};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();