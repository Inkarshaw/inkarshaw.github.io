(() => {
  'use strict';

  function init(){
    const C=window.CDRCore, A=window.CDRApp;
    if(!C||!A)return;
    const $=C.$, state=C.state, esc=C.escapeHtml, fmt=C.fmtInt, dt=C.dtFmt;

    function towerKey(r){
      return [r.operator,r.firstCellId||r.firstAddress].filter(Boolean).join('|') || String(r.firstAddress||r.firstCellId||'').trim();
    }

    function commonContacts(data){
      const m=new Map();
      for(const r of data){
        if(!r.cdrNo||!r.bparty)continue;
        const k=String(r.bparty);
        let x=m.get(k);
        if(!x)x={party:r.bparty,subjects:new Set(),events:0};
        x.subjects.add(r.cdrNo);x.events++;m.set(k,x);
      }
      return [...m.values()].filter(x=>x.subjects.size>=2)
        .sort((a,b)=>b.subjects.size-a.subjects.size||b.events-a.events).slice(0,20);
    }

    function sameTower(data,minutes=15){
      const by=new Map(),out=[],seen=new Set(),win=minutes*60000;
      for(const r of data){
        if(!r.dt||!r.cdrNo)continue;
        const k=towerKey(r);if(!k)continue;
        if(!by.has(k))by.set(k,[]);
        by.get(k).push(r);
      }
      for(const [tower,rows] of by){
        rows.sort((a,b)=>a.dt-b.dt);
        for(let i=0;i<rows.length;i++){
          for(let j=i+1;j<rows.length&&rows[j].dt-rows[i].dt<=win;j++){
            if(rows[i].cdrNo===rows[j].cdrNo)continue;
            const pair=[rows[i].cdrNo,rows[j].cdrNo].sort().join('|');
            const key=tower+'|'+pair+'|'+Math.floor(+rows[i].dt/win);
            if(seen.has(key))continue;
            seen.add(key);
            out.push({tower,a:rows[i],b:rows[j],gap:Math.round((rows[j].dt-rows[i].dt)/60000)});
          }
        }
      }
      return out.sort((a,b)=>a.gap-b.gap||a.a.dt-b.a.dt).slice(0,20);
    }

    function deviceChanges(data){
      const by=new Map();
      for(const r of data){
        if(!r.cdrNo)continue;
        let x=by.get(r.cdrNo);
        if(!x)x={imei:new Set(),imsi:new Set()};
        if(r.imei)x.imei.add(r.imei);
        if(r.imsi)x.imsi.add(r.imsi);
        by.set(r.cdrNo,x);
      }
      return [...by].filter(([,x])=>x.imei.size>1||x.imsi.size>1)
        .map(([cdr,x])=>({cdr,imei:x.imei.size,imsi:x.imsi.size})).slice(0,20);
    }

    function incidentInfo(data,inc,windowMin=60,gapHours=4){
      const out={pre:[],post:[],newContacts:[],gaps:[]};
      if(!inc)return out;
      const span=windowMin*60000,gapMs=gapHours*3600000;
      const near=data.filter(r=>r.dt&&Math.abs(r.dt-inc)<=span).sort((a,b)=>a.dt-b.dt);
      out.pre=near.filter(r=>r.dt<inc);
      out.post=near.filter(r=>r.dt>=inc);

      const firstSeen=new Map();
      for(const r of A.getRecords()){
        if(!r.dt||!r.cdrNo||!r.bparty)continue;
        const k=r.cdrNo+'|'+r.bparty,p=firstSeen.get(k);
        if(!p||r.dt<p.dt)firstSeen.set(k,r);
      }
      for(const r of out.pre){
        if(!r.bparty)continue;
        const p=firstSeen.get(r.cdrNo+'|'+r.bparty);
        if(p&&p.id===r.id)out.newContacts.push(r);
      }

      const by=new Map();
      for(const r of data){
        if(!r.cdrNo||!r.dt)continue;
        if(!by.has(r.cdrNo))by.set(r.cdrNo,[]);
        by.get(r.cdrNo).push(r);
      }
      for(const [cdr,rows] of by){
        rows.sort((a,b)=>a.dt-b.dt);
        let before=null,after=null;
        for(const r of rows){if(r.dt<inc)before=r;else if(!after)after=r;}
        if(before&&after&&after.dt-before.dt>=gapMs)out.gaps.push({cdr,before,after,ms:after.dt-before.dt});
      }
      out.gaps.sort((a,b)=>b.ms-a.ms);
      return out;
    }

    function section(title,items,emptyText){
      return '<div style="margin-top:16px"><h3 style="margin:0 0 8px">'+esc(title)+'</h3>'+
        (items.length?'<div class="tablewrap"><table class="table"><tbody>'+items.join('')+'</tbody></table></div>':'<div class="tiny">'+esc(emptyText)+'</div>')+
        '</div>';
    }

    function render(){
      const host=$('leadsContent');if(!host)return;
      const old=$('advancedInvestigationLeads');if(old)old.remove();

      const data=state.filtered||[],inc=C.incidentDateTime();
      const common=commonContacts(data),tower=sameTower(data,15),devices=deviceChanges(data),incident=incidentInfo(data,inc,60,4);

      const rows=[];
      rows.push(section('Common contacts',
        common.slice(0,10).map(x=>'<tr><td><b>'+esc(x.party)+'</b></td><td>'+fmt(x.subjects.size)+' subjects</td><td>'+fmt(x.events)+' events</td><td class="tiny">'+esc([...x.subjects].join(', '))+'</td></tr>'),
        'No common contacts found between loaded subjects.'
      ));

      rows.push(section('Incident activity',
        inc?[
          ...incident.pre.slice(-5).reverse().map(r=>'<tr><td>Before</td><td>'+esc(dt(r.dt))+'</td><td>'+esc(r.cdrNo||'—')+' ↔ '+esc(r.bparty||'—')+'</td><td class="tiny">'+esc(r.firstAddress||r.firstCellId||'—')+'</td></tr>'),
          ...incident.post.slice(0,5).map(r=>'<tr><td>After</td><td>'+esc(dt(r.dt))+'</td><td>'+esc(r.cdrNo||'—')+' ↔ '+esc(r.bparty||'—')+'</td><td class="tiny">'+esc(r.firstAddress||r.firstCellId||'—')+'</td></tr>')
        ]:[],
        inc?'No activity found within 60 minutes of the incident.':'Save incident date/time in the case to show this.'
      ));

      rows.push(section('Device / SIM changes',
        devices.map(x=>'<tr><td><b>'+esc(x.cdr)+'</b></td><td>'+fmt(x.imei)+' IMEI</td><td>'+fmt(x.imsi)+' IMSI</td></tr>'),
        'No multiple IMEI/IMSI use found in the current filter.'
      ));

      rows.push(section('Same tower near the same time',
        tower.slice(0,10).map(x=>'<tr><td>'+esc(dt(x.a.dt))+'</td><td><b>'+esc(x.a.cdrNo)+'</b> ↔ <b>'+esc(x.b.cdrNo)+'</b></td><td>'+fmt(x.gap)+' min</td><td class="tiny">'+esc(x.tower)+'</td></tr>'),
        'No cross-subject same-tower overlaps found within 15 minutes.'
      ));

      rows.push(section('New contacts shortly before incident',
        incident.newContacts.slice(0,10).map(r=>'<tr><td>'+esc(dt(r.dt))+'</td><td><b>'+esc(r.cdrNo||'—')+'</b></td><td>'+esc(r.bparty||'—')+'</td></tr>'),
        inc?'No first-time contacts found in the 60 minutes before the incident.':'Save incident date/time in the case to show this.'
      ));

      rows.push(section('Long communication gap across incident',
        incident.gaps.slice(0,10).map(x=>'<tr><td><b>'+esc(x.cdr)+'</b></td><td>'+C.fmtDur(x.ms/1000)+'</td><td class="tiny">Last before: '+esc(dt(x.before.dt))+' • First after: '+esc(dt(x.after.dt))+'</td></tr>'),
        inc?'No gap of 4 hours or more spans the incident.':'Save incident date/time in the case to show this.'
      ));

      host.innerHTML='<div id="simpleInvestigationLeads"><div class="notice"><b>Quick review only.</b> These are leads for verification, not conclusions. Tower data is approximate and should be corroborated.</div>'+rows.join('')+'</div>';
    }

    const refresh=$('leadsRefreshBtn');if(refresh)refresh.addEventListener('click',()=>setTimeout(render,0));
    const apply=$('applyBtn');if(apply)apply.addEventListener('click',()=>setTimeout(render,0));
    window.addEventListener('cdr:updated',render);

    const host=$('leadsContent');
    if(host){
      const obs=new MutationObserver(()=>{if(!$('simpleInvestigationLeads'))render();});
      obs.observe(host,{childList:true});
    }

    render();
    window.CDRInvestigationLeads={render};
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();