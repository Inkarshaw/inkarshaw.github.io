(() => {
  'use strict';
  window.CDRLinkAnalysisFactory=function(ctx){
    const {$,state,phoneKey,contactLabel,contactTitle,escapeHtml,escAttr,fmtInt,fmtDur,dtFmt,switchTab}=ctx;
    let nodes=[],edges=[],selectedId=null,lastGraph=null;

    const key=v=>phoneKey?phoneKey(v):String(v??'').trim();
    const dateKey=d=>d instanceof Date&&!isNaN(d)?[d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-'):'';
    function sourceRows(){
      let rows=state.filtered||state.records||[];
      const subject=$('linkSubject')?.value||'',from=$('linkFrom')?.value||'',to=$('linkTo')?.value||'',event=$('linkEventType')?.value||'';
      if(subject)rows=rows.filter(r=>key(r.cdrNo)===key(subject));
      if(from)rows=rows.filter(r=>r.dt&&dateKey(r.dt)>=from);
      if(to)rows=rows.filter(r=>r.dt&&dateKey(r.dt)<=to);
      if(event)rows=rows.filter(r=>String(r.callType||'')===event);
      return rows.filter(r=>r.cdrNo&&r.bparty);
    }
    function refreshSelectors(){
      const s=$('linkSubject'),e=$('linkEventType');if(!s||!e)return;
      const cur=s.value,subjects=[...new Map((state.records||[]).filter(r=>r.cdrNo).map(r=>[key(r.cdrNo),r.cdrNo])).values()].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
      s.innerHTML='<option value="">All loaded subjects</option>'+subjects.map(x=>'<option value="'+escAttr(x)+'">'+escapeHtml(x)+'</option>').join('');
      if(subjects.includes(cur))s.value=cur;
      const ce=e.value,events=[...new Set((state.records||[]).map(r=>String(r.callType||'').trim()).filter(Boolean))].sort();
      e.innerHTML='<option value="">All event types</option>'+events.map(x=>'<option value="'+escAttr(x)+'">'+escapeHtml(x)+'</option>').join('');
      if(events.includes(ce))e.value=ce;
    }
    function buildGraph(){
      const rows=sourceRows(),min=Math.max(1,+$('linkMinEvents')?.value||1),top=Math.max(5,+$('linkTop')?.value||40),mutualOnly=!!$('linkMutualOnly')?.checked;
      const subjectMap=new Map(),contactMap=new Map(),edgeMap=new Map();
      for(const r of rows){
        const sk=key(r.cdrNo),bk=key(r.bparty);if(!sk||!bk)continue;
        if(!subjectMap.has(sk))subjectMap.set(sk,{id:'s:'+sk,key:sk,label:r.cdrNo,type:'subject',events:0,contacts:new Set(),duration:0});
        const sn=subjectMap.get(sk);sn.events++;sn.duration+=(+r.duration||0);sn.contacts.add(bk);
        if(!contactMap.has(bk))contactMap.set(bk,{id:'c:'+bk,key:bk,label:contactLabel(r.bparty),raw:r.bparty,type:'contact',events:0,subjects:new Set(),duration:0});
        const cn=contactMap.get(bk);cn.events++;cn.duration+=(+r.duration||0);cn.subjects.add(sk);
        const ek=sk+'|'+bk;let ed=edgeMap.get(ek);if(!ed)ed={a:'s:'+sk,b:'c:'+bk,subject:r.cdrNo,contact:r.bparty,count:0,duration:0,first:null,last:null};
        ed.count++;ed.duration+=(+r.duration||0);if(r.dt&&(!ed.first||r.dt<ed.first))ed.first=r.dt;if(r.dt&&(!ed.last||r.dt>ed.last))ed.last=r.dt;edgeMap.set(ek,ed);
      }
      let contacts=[...contactMap.values()].filter(x=>x.events>=min);
      if(mutualOnly)contacts=contacts.filter(x=>x.subjects.size>1);
      contacts.sort((a,b)=>b.events-a.events||b.subjects.size-a.subjects.size);contacts=contacts.slice(0,top);
      const allowed=new Set(contacts.map(x=>x.key));
      const keptEdges=[...edgeMap].filter(([k])=>allowed.has(k.split('|')[1])).map(([,v])=>v).sort((a,b)=>b.count-a.count);
      const usedSubjects=new Set(keptEdges.map(e=>e.a.slice(2)));
      const subjects=[...subjectMap.values()].filter(x=>usedSubjects.has(x.key));
      return {rows,subjects,contacts,edges:keptEdges};
    }
    function draw(g){
      const canvas=$('linkAnalysisCanvas');if(!canvas||!canvas.getContext)return;
      const rect=canvas.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1),W=Math.max(640,rect.width||640),H=Math.max(460,rect.height||460);
      canvas.width=W*dpr;canvas.height=H*dpr;const c=canvas.getContext('2d');c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
      nodes=[];edges=g.edges.slice();const cx=W/2,cy=H/2,sr=Math.min(W,H)*.17,cr=Math.min(W,H)*.38;
      g.subjects.forEach((n,i)=>{const a=2*Math.PI*i/Math.max(1,g.subjects.length)-Math.PI/2;nodes.push({...n,x:cx+Math.cos(a)*sr,y:cy+Math.sin(a)*sr});});
      g.contacts.forEach((n,i)=>{const a=2*Math.PI*i/Math.max(1,g.contacts.length)-Math.PI/2;const ring=cr*(.88+(i%3)*.06);nodes.push({...n,x:cx+Math.cos(a)*ring,y:cy+Math.sin(a)*ring,shared:n.subjects.size>1});});
      const nm=new Map(nodes.map(n=>[n.id,n]));
      for(const e of edges){const a=nm.get(e.a),b=nm.get(e.b);if(!a||!b)continue;const related=!selectedId||e.a===selectedId||e.b===selectedId;c.globalAlpha=related?1:.08;c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.strokeStyle='rgba(21,94,239,.48)';c.lineWidth=Math.min(8,1+Math.log2(1+e.count)*1.3);c.stroke();}
      for(const n of nodes){const related=!selectedId||n.id===selectedId||edges.some(e=>(e.a===selectedId&&e.b===n.id)||(e.b===selectedId&&e.a===n.id));c.globalAlpha=related?1:.16;const r=n.type==='subject'?Math.min(28,12+Math.log2(1+n.events)*2):Math.min(20,7+Math.log2(1+n.events)*1.4);n.radius=r;c.beginPath();c.arc(n.x,n.y,r,0,Math.PI*2);c.fillStyle=n.type==='subject'?'#155eef':n.shared?'#b54708':'#667085';c.fill();c.lineWidth=2;c.strokeStyle='#fff';c.stroke();c.fillStyle='#172033';c.font=(n.type==='subject'?'700 ':'')+'11px system-ui';c.textAlign='center';const label=String(n.label||'');c.fillText(label.length>20?label.slice(0,20)+'…':label,n.x,n.y+r+14);c.globalAlpha=1;}
    }
    function renderTables(g){
      const mutual=g.contacts.filter(x=>x.subjects.size>1).sort((a,b)=>b.subjects.size-a.subjects.size||b.events-a.events);
      const degree=new Map();for(const e of g.edges){degree.set(e.a,(degree.get(e.a)||0)+1);degree.set(e.b,(degree.get(e.b)||0)+1);}
      const hubs=nodes.slice().sort((a,b)=>(degree.get(b.id)||0)-(degree.get(a.id)||0)||b.events-a.events).slice(0,20);
      const hub=$('linkHubTable');if(hub)hub.innerHTML='<thead><tr><th>Node</th><th>Links</th><th>Events</th></tr></thead><tbody>'+hubs.map(n=>'<tr><td title="'+escAttr(contactTitle(n.raw||n.label))+'">'+escapeHtml(n.label)+'</td><td>'+fmtInt(degree.get(n.id)||0)+'</td><td>'+fmtInt(n.events)+'</td></tr>').join('')+'</tbody>';
      const et=$('linkEdgesTable');if(et)et.innerHTML='<thead><tr><th>Subject</th><th>Contact</th><th>Events</th><th>Duration</th><th>First</th><th>Last</th></tr></thead><tbody>'+g.edges.slice(0,100).map(e=>'<tr><td>'+escapeHtml(e.subject)+'</td><td>'+escapeHtml(contactLabel(e.contact))+'</td><td>'+fmtInt(e.count)+'</td><td>'+fmtDur(e.duration)+'</td><td>'+dtFmt(e.first)+'</td><td>'+dtFmt(e.last)+'</td></tr>').join('')+'</tbody>';
      const mt=$('linkMutualTable');if(mt)mt.innerHTML='<thead><tr><th>Contact</th><th>Subjects</th><th>Events</th></tr></thead><tbody>'+mutual.slice(0,100).map(n=>'<tr><td>'+escapeHtml(n.label)+'</td><td>'+fmtInt(n.subjects.size)+'</td><td>'+fmtInt(n.events)+'</td></tr>').join('')+'</tbody>';
      const s=$('linkAnalysisSummary');if(s)s.innerHTML='<span class="metric-chip">Subjects: '+fmtInt(g.subjects.length)+'</span><span class="metric-chip">Contacts shown: '+fmtInt(g.contacts.length)+'</span><span class="metric-chip">Links: '+fmtInt(g.edges.length)+'</span><span class="metric-chip">Mutual contacts: '+fmtInt(mutual.length)+'</span><span class="metric-chip">Events represented: '+fmtInt(g.edges.reduce((a,e)=>a+e.count,0))+'</span>';
      if($('linkAnalysisCount'))$('linkAnalysisCount').textContent=fmtInt(g.edges.length)+' links';
    }
    function renderSelected(){
      const box=$('linkSelectedNode');if(!box)return;const n=nodes.find(x=>x.id===selectedId);
      if(!n){box.className='empty';box.style.padding='24px 12px';box.innerHTML='Click a node in the graph.';return;}
      const rel=edges.filter(e=>e.a===n.id||e.b===n.id),total=rel.reduce((a,e)=>a+e.count,0),dur=rel.reduce((a,e)=>a+e.duration,0);
      box.className='';box.style.padding='';
      box.innerHTML='<div class="link-node-title">'+escapeHtml(n.label)+'</div>'+
        '<div class="link-node-stat"><span>Type</span><b>'+(n.type==='subject'?'Loaded subject':'Connected number')+'</b></div>'+
        '<div class="link-node-stat"><span>Direct links</span><b>'+fmtInt(rel.length)+'</b></div>'+
        '<div class="link-node-stat"><span>CDR events</span><b>'+fmtInt(total)+'</b></div>'+
        '<div class="link-node-stat"><span>Total duration</span><b>'+fmtDur(dur)+'</b></div>'+
        (n.type==='contact'?'<div class="link-node-stat"><span>Loaded subjects linked</span><b>'+fmtInt(n.subjects?.size||0)+'</b></div>':'')+
        '<div class="link-node-actions"><button class="btn secondary small" id="linkOpenRecordsBtn">Open records</button></div>';
      $('linkOpenRecordsBtn')?.addEventListener('click',()=>{
        if(n.type==='subject'){if($('cdrNo'))$('cdrNo').value=n.label||'';if($('bparty'))$('bparty').value='';}
        else {if($('bparty'))$('bparty').value=n.raw||n.label||'';}
        window.CDRApp?.applyFilters?.();switchTab?.('records');
      });
    }
    function render(){
      refreshSelectors();lastGraph=buildGraph();draw(lastGraph);renderTables(lastGraph);renderSelected();
    }
    function reset(){
      ['linkSubject','linkFrom','linkTo','linkEventType'].forEach(id=>{if($(id))$(id).value='';});
      if($('linkTop'))$('linkTop').value='40';if($('linkMinEvents'))$('linkMinEvents').value='1';if($('linkMutualOnly'))$('linkMutualOnly').checked=false;selectedId=null;render();
    }
    function bind(){
      $('linkRefreshBtn')?.addEventListener('click',render);$('linkResetBtn')?.addEventListener('click',reset);
      ['linkSubject','linkFrom','linkTo','linkEventType','linkTop','linkMinEvents','linkMutualOnly'].forEach(id=>$(id)?.addEventListener('change',render));
      $('linkAnalysisCanvas')?.addEventListener('click',e=>{const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top;let hit=null,best=28;for(const n of nodes){const d=Math.hypot(n.x-x,n.y-y);if(d<Math.max(best,n.radius||0)){best=d;hit=n;}}selectedId=hit?.id||null;if(lastGraph)draw(lastGraph);renderSelected();});
      window.addEventListener('resize',()=>{if(document.querySelector('.tab.active')?.dataset.tab==='linkanalysis'&&lastGraph)draw(lastGraph);});
      window.addEventListener('cdr:updated',()=>refreshSelectors());
    }
    return {render,bind,refreshSelectors};
  };
})();