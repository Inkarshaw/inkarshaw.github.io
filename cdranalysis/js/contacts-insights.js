(() => {
  'use strict';
  // All calculations run on imported rows already held in browser memory.
  const time=d=>d instanceof Date&&Number.isFinite(+d)?+d:null;
  const earlier=(current,next)=>next!==null&&(current===null||next<current)?next:current;
  const later=(current,next)=>next!==null&&(current===null||next>current)?next:current;
  const date=x=>x===null?null:new Date(x);
  function direction(r){
    const t=String(r?.callType||'').toLowerCase().replace(/[\s_-]+/g,'');
    if(/sms|data|gprs|internet/.test(t))return '';
    if(/^(?:incoming|incall|incomingcall|mt|mtc|ic)$/.test(t)||t.includes('incoming')||t.includes('mtcall'))return 'incoming';
    if(/^(?:outgoing|outcall|outgoingcall|mo|moc|og)$/.test(t)||t.includes('outgoing')||t.includes('mocall'))return 'outgoing';
    if(/call|voice/.test(t))return 'call';
    return '';
  }
  function build(rows,keyFn){
    const map=new Map();
    for(const r of rows){
      if(!r.bparty)continue;
      const key=r.bpartyKey||keyFn(r.bparty);
      if(!key)continue;
      let c=map.get(key);
      if(!c){c={key,firstCall:null,firstIncoming:null,firstOutgoing:null,lastCall:null,lastEvent:null,subjects:new Map()};map.set(key,c);}
      const t=time(r.dt),dir=direction(r);
      c.lastEvent=later(c.lastEvent,t);
      if(dir){
        c.firstCall=earlier(c.firstCall,t);
        c.lastCall=later(c.lastCall,t);
        if(dir==='incoming')c.firstIncoming=earlier(c.firstIncoming,t);
        if(dir==='outgoing')c.firstOutgoing=earlier(c.firstOutgoing,t);
      }
      const subject=String(r.cdrNo||'').trim();
      if(subject){
        let s=c.subjects.get(subject);
        if(!s){s={subject,records:0,calls:0,first:null,last:null};c.subjects.set(subject,s);}
        s.records++;
        if(dir)s.calls++;
        s.first=earlier(s.first,t);
        s.last=later(s.last,t);
      }
    }
    return map;
  }
  function timeline(rows,key,keyFn,dayKey){
    const days=new Map();const calls=[];
    for(const r of rows){
      if(!r.bparty||(r.bpartyKey||keyFn(r.bparty))!==key)continue;
      const t=time(r.dt);if(t===null)continue;
      const day=dayKey(r.dt);if(!day)continue;
      let d=days.get(day);if(!d){d={day,events:0,calls:0,sms:0,incoming:0,outgoing:0};days.set(day,d);}
      const dir=direction(r);
      d.events++;
      if(dir){d.calls++;calls.push(t);if(dir==='incoming')d.incoming++;if(dir==='outgoing')d.outgoing++;}
      if(/sms/i.test(String(r.callType||'')))d.sms++;
    }
    calls.sort((a,b)=>a-b);
    let largestGapDays=0;
    for(let i=1;i<calls.length;i++)largestGapDays=Math.max(largestGapDays,(calls[i]-calls[i-1])/86400000);
    return {days:[...days.values()].sort((a,b)=>a.day.localeCompare(b.day)),voiceCalls:calls.length,largestGapDays};
  }
  // Prevent spreadsheet programs interpreting externally supplied labels as formulas.
  function csvCell(v){
    const raw=String(v??'');
    const safe=/^[\s]*[=+@\-]/.test(raw)?"'"+raw:raw;
    return '"'+safe.replace(/"/g,'""')+'"';
  }
  function csv(headers,rows){return [headers,...rows].map(line=>line.map(csvCell).join(',')).join('\r\n')+'\r\n';}
  window.CDRContactsInsights={build,timeline,direction,date,csv};
})();
