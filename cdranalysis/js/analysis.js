(() => {
  'use strict';
  window.CDRAnalysisFactory = function(ctx){
    const {
      $,state,smsIntelRows,smsSenderIntelligence,senderBrandInfo,fmtInt,escapeHtml,dtFmt,
      incidentDateTime,subjectEventScopedRecords,localDateKey,aggregateContacts,simpleTable,
      escAttr,contactLabel,contactTitle,typePill,fmtDur,normalize,analyzeIdentifiers,percentile,
      setSubjectEventScope
    }=ctx;

  function renderSmsIntelligence(){
    if(!$('smsIntelSummary'))return;
    const from=$('smsIntelFrom').value,to=$('smsIntelTo').value;
    if(from&&to&&from>to){
      $('smsIntelSummary').innerHTML='<div class="notice">SMS Intelligence From date cannot be later than To date.</div>';
      $('smsIntelCategoryTable').innerHTML='';$('smsIntelBrandTable').innerHTML='';$('smsIntelTimelineTable').innerHTML='';return;
    }
    const rows=smsIntelRows(),A=smsSenderIntelligence(rows),unusual=A.timeline.filter(x=>x.unusual).length,callLinked=A.timeline.filter(x=>x.nearbyCalls>0).length,idLinked=A.timeline.filter(x=>x.nearbyIds>0).length;
    const explicit=A.timeline.filter(x=>x.basis==='Explicit SMS event').length,inferred=A.timeline.filter(x=>x.basis==='Sender-ID inference').length;
    const recognizableLoaded=state.records.filter(r=>senderBrandInfo(r.bparty)).length,recognizableWithDt=state.records.filter(r=>r.dt&&senderBrandInfo(r.bparty)).length;
    $('smsIntelSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(rows.length)}</div><div class="l">Sender-ID SMS candidates</div></div><div class="kpi"><div class="v">${fmtInt(explicit)}</div><div class="l">Explicit SMS events</div></div><div class="kpi"><div class="v">${fmtInt(inferred)}</div><div class="l">Sender-ID inferred</div></div><div class="kpi"><div class="v">${fmtInt(A.brands.length)}</div><div class="l">Recognizable brands</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(r=>r.bparty)).size)}</div><div class="l">Raw sender IDs</div></div><div class="kpi"><div class="v">${fmtInt(unusual)}</div><div class="l">Unusual-time SMS</div></div><div class="kpi"><div class="v">${fmtInt(callLinked)}</div><div class="l">SMS with call ±${A.callWindowMin}m</div></div><div class="kpi"><div class="v">${fmtInt(idLinked)}</div><div class="l">SMS near ID change ±${A.idWindowMin}m</div></div></div>`+
      (rows.length?'':`<div class="notice" style="margin-top:10px">No sender-ID records match the SMS Intelligence filters. Loaded data contains ${fmtInt(recognizableLoaded)} recognizable sender-ID row(s), of which ${fmtInt(recognizableWithDt)} have a parsed date/time. Clear the SMS Intelligence subject/date range if needed.</div>`);
    $('smsIntelCategoryTable').innerHTML=`<thead><tr><th>Service category inference</th><th>SMS candidates</th><th>Brands</th><th>Raw sender IDs</th><th>First SMS</th><th>Last SMS</th><th>Unusual-time</th></tr></thead><tbody>${A.categories.map(x=>`<tr><td><b>${escapeHtml(x.category)}</b></td><td class="num">${fmtInt(x.count)}</td><td class="details">${escapeHtml([...x.brands].join(', '))}</td><td class="num">${fmtInt(x.senderIds.size)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td class="num">${fmtInt(x.unusual)}</td></tr>`).join('')}</tbody>`;
    $('smsIntelBrandTable').innerHTML=`<thead><tr><th>Brand inference</th><th>Service category</th><th>Raw sender ID(s)</th><th>SMS</th><th>First SMS</th><th>Last SMS</th><th>Active days</th><th>Unusual-time</th><th>Subjects</th><th>Towers</th><th>Nearby calls</th><th>Nearby IMSI/IMEI changes</th></tr></thead><tbody>${A.brands.map(x=>`<tr><td><b>${escapeHtml(x.label)}</b></td><td>${escapeHtml(x.category)}</td><td class="details">${escapeHtml([...x.senderIds].join(', '))}</td><td class="num">${fmtInt(x.count)}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td><td class="num">${fmtInt(x.days.size)}</td><td class="num">${fmtInt(x.unusual)}</td><td class="details">${escapeHtml([...x.subjects].join(', ')||'—')}</td><td class="num">${fmtInt(x.towers.size)}</td><td class="num">${fmtInt(x.nearCalls)}</td><td class="num">${fmtInt(x.nearIds)}</td></tr>`).join('')}</tbody>`;
    $('smsIntelTimelineTable').innerHTML=`<thead><tr><th>Date / Time</th><th>Subject</th><th>Sender ID</th><th>Brand inference</th><th>Service category</th><th>Basis</th><th>Timing</th><th>Tower metadata</th><th>IMEI</th><th>IMSI</th><th>Calls ±${A.callWindowMin}m</th><th>ID changes ±${A.idWindowMin}m</th><th>Source</th></tr></thead><tbody>${A.timeline.slice(0,3000).map(x=>{const r=x.record;return `<tr><td>${dtFmt(r.dt)}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td>${escapeHtml(x.senderId)}</td><td><b>${escapeHtml(x.brand)}</b></td><td>${escapeHtml(x.category)}</td><td>${escapeHtml(x.basis)}</td><td>${x.unusual?'<span class="pill">Unusual-time</span>':'Normal window'}</td><td class="details">${escapeHtml(r.firstAddress||r.firstCellId||'—')}</td><td>${escapeHtml(r.imei||'—')}</td><td>${escapeHtml(r.imsi||'—')}</td><td class="num">${fmtInt(x.nearbyCalls)}</td><td class="num">${fmtInt(x.nearbyIds)}</td><td>${escapeHtml(r.sourceFile||'')} • row ${r.rowNumber||''}</td></tr>`}).join('')}</tbody>`;
  }


  function renderIncident(){
    const inc=incidentDateTime();
    if(!inc){$('incidentSummary').innerHTML='<div class="notice">Enter Incident Date and Incident Time at the top first.</div>';$('baselineCompare').innerHTML='';$('contactChanges').innerHTML='';$('incidentTable').innerHTML='';return;}
    const beforeH=+$('incidentBeforeHours').value||6,duringM=+$('incidentDuringMins').value||30,afterH=+$('incidentAfterHours').value||6;
    const start=new Date(inc-beforeH*3600000),duringStart=new Date(inc-duringM*60000),duringEnd=new Date(inc+duringM*60000),end=new Date(inc+afterH*3600000);
    const scoped=subjectEventScopedRecords(state.records);
    const rows=scoped.filter(r=>r.dt&&r.dt>=start&&r.dt<=end).sort((a,b)=>a.dt-b.dt);
    const before=rows.filter(r=>r.dt<duringStart),during=rows.filter(r=>r.dt>=duringStart&&r.dt<=duringEnd),after=rows.filter(r=>r.dt>duringEnd);
    $('incidentSummary').innerHTML=`<div class="kpis"><div class="kpi"><div class="v">${fmtInt(before.length)}</div><div class="l">Before</div><div class="s">${beforeH} hours</div></div><div class="kpi"><div class="v">${fmtInt(during.length)}</div><div class="l">During</div><div class="s">±${duringM} min</div></div><div class="kpi"><div class="v">${fmtInt(after.length)}</div><div class="l">After</div><div class="s">${afterH} hours</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(r=>r.bparty).filter(Boolean)).size)}</div><div class="l">Contacts</div></div><div class="kpi"><div class="v">${fmtInt(new Set(rows.map(r=>r.firstCellId).filter(Boolean)).size)}</div><div class="l">Towers</div></div></div>`;
    const baseStart=new Date(inc-30*86400000),baseRows=scoped.filter(r=>r.dt&&r.dt>=baseStart&&r.dt<start);
    const baseDays=Math.max(1,new Set(baseRows.map(r=>localDateKey(r.dt))).size);
    const incidentContacts=new Set(rows.map(r=>r.bparty).filter(Boolean)),baseContacts=new Set(baseRows.map(r=>r.bparty).filter(Boolean));
    const incidentTowers=new Set(rows.map(r=>r.firstCellId).filter(Boolean)),baseTowers=new Set(baseRows.map(r=>r.firstCellId).filter(Boolean));
    const newContacts=[...incidentContacts].filter(x=>!baseContacts.has(x)),newTowers=[...incidentTowers].filter(x=>!baseTowers.has(x));
    $('baselineCompare').innerHTML=simpleTable(['Metric','30-day baseline','Incident window'],[['Events',fmtInt(baseRows.length)+' total / '+(baseRows.length/baseDays).toFixed(1)+' per day',fmtInt(rows.length)],['Unique contacts',fmtInt(baseContacts.size),fmtInt(incidentContacts.size)],['Unique towers',fmtInt(baseTowers.size),fmtInt(incidentTowers.size)],['Contacts not in baseline','—',fmtInt(newContacts.length)],['Towers not in baseline','—',fmtInt(newTowers.length)]]);
    const allContacts=aggregateContacts(scoped),near=7*86400000;
    const changed=allContacts.filter(x=>(x.first&&Math.abs(x.first-inc)<=near)||(x.last&&Math.abs(x.last-inc)<=near)).slice(0,80);
    $('contactChanges').innerHTML=simpleTable(['Contact','First seen','Last seen','Indicator'],changed.map(x=>{const firstNear=x.first&&Math.abs(x.first-inc)<=near,lastNear=x.last&&Math.abs(x.last-inc)<=near;const label=firstNear&&lastNear?'Short-window contact':firstNear?'First seen near incident':'Last seen near incident';return [`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}">${escapeHtml(contactLabel(x.bparty))}</a>`,dtFmt(x.first),dtFmt(x.last),label];}));


    $('incidentTable').innerHTML=`<thead><tr><th>Period</th><th>Date / Time</th><th>Subject</th><th>Contact</th><th>Type</th><th>Duration</th><th>Tower</th><th>IMEI</th><th>IMSI</th><th>Source</th></tr></thead><tbody>${rows.slice(0,2000).map(r=>{const period=r.dt<duringStart?'Before':r.dt<=duringEnd?'During':'After';return `<tr><td><span class="pill">${period}</span></td><td>${escapeHtml(dtFmt(r.dt))}</td><td>${escapeHtml(r.cdrNo)}</td><td><a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</a></td><td>${typePill(r.callType)}</td><td>${fmtDur(r.duration)}</td><td class="details">${escapeHtml(r.firstAddress||r.firstCellId)}</td><td>${escapeHtml(r.imei)}</td><td>${escapeHtml(r.imsi)}</td><td>${escapeHtml(r.sourceFile)} • row ${r.rowNumber}</td></tr>`}).join('')}</tbody>`;
  }


  function renderDaySummary(){
    const m=new Map();for(const r of state.filtered){if(!r.dt)continue;const d=localDateKey(r.dt);let x=m.get(d)||{date:d,first:null,firstType:'',last:null,lastType:'',events:0,calls:0,sms:0,contacts:new Set(),towers:new Set(),imei:new Set(),imsi:new Set(),night:0};x.events++;const t=normalize(r.callType);if(t.includes('call'))x.calls++;if(t.includes('sms'))x.sms++;if(r.bparty)x.contacts.add(r.bparty);if(r.firstCellId)x.towers.add(r.firstCellId);if(r.imei)x.imei.add(r.imei);if(r.imsi)x.imsi.add(r.imsi);if(!x.first||r.dt<x.first){x.first=r.dt;x.firstType=r.callType||'';}if(!x.last||r.dt>x.last){x.last=r.dt;x.lastType=r.callType||'';}if(r.dt.getHours()>=20||r.dt.getHours()<6)x.night++;m.set(d,x);}
    const rows=[...m.values()].sort((a,b)=>a.date.localeCompare(b.date));$('daySummaryTable').innerHTML=`<thead><tr><th>Date</th><th>First activity</th><th>Last activity</th><th>Events</th><th>Calls</th><th>SMS</th><th>Contacts</th><th>Towers</th><th>IMEI</th><th>IMSI</th><th>Night events</th></tr></thead><tbody>${rows.map(x=>`<tr><td><button class="btn secondary small day-filter" data-date="${x.date}">${x.date}</button></td><td>${dtFmt(x.first)} <span class="tiny">•</span> ${typePill(x.firstType)}</td><td>${dtFmt(x.last)} <span class="tiny">•</span> ${typePill(x.lastType)}</td><td>${fmtInt(x.events)}</td><td>${fmtInt(x.calls)}</td><td>${fmtInt(x.sms)}</td><td>${fmtInt(x.contacts.size)}</td><td>${fmtInt(x.towers.size)}</td><td>${fmtInt(x.imei.size)}</td><td>${fmtInt(x.imsi.size)}</td><td>${fmtInt(x.night)}</td></tr>`).join('')}</tbody>`;
  }

  function renderPatterns(){
    const data=state.filtered.filter(r=>r.dt),total=data.length,dayNames=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    if(!total){
      $('patternSummary').innerHTML='<div class="empty">No dated records match the current filters.</div>';
      ['patternWeekdayTable','patternEventTypeTable','patternRegularContactsTable','patternUnusualHoursTable','patternTimeBandTable','patternHighDatesTable','patternContactHourTable','patternWeekdayContactHourTable'].forEach(id=>$(id).innerHTML='');
      $('patternNarrative').innerHTML='';
      $('hourMatrix').innerHTML='';$('contactDayMatrix').innerHTML='';return;
    }

    const activeDates=[...new Set(data.map(r=>localDateKey(r.dt)))].sort(),activeDayCount=activeDates.length;
    const hourCounts=Array(24).fill(0),weekdayCounts=Array(7).fill(0),weekdayDates=Array.from({length:7},()=>new Set()),typeMap=new Map(),nightRows=[],weekendRows=[];
    for(const r of data){
      const h=r.dt.getHours(),w=r.dt.getDay(),date=localDateKey(r.dt),type=String(r.callType||'—');
      hourCounts[h]++;weekdayCounts[w]++;weekdayDates[w].add(date);
      if(h>=20||h<6)nightRows.push(r);if(w===0||w===6)weekendRows.push(r);
      let t=typeMap.get(type);if(!t)t={type,count:0,days:new Set(),hours:Array(24).fill(0)};t.count++;t.days.add(date);t.hours[h]++;typeMap.set(type,t);
    }
    const peakHour=Math.max(...hourCounts),peakHourIndex=hourCounts.indexOf(peakHour),peakWeekday=Math.max(...weekdayCounts),peakWeekdayIndex=weekdayCounts.indexOf(peakWeekday);
    const pct=n=>total?(100*n/total):0;
    const weekdayEvents=total-weekendRows.length;
    const commonHourThreshold=Math.max(1,Math.ceil(peakHour*.2));
    const lowHours=hourCounts.map((count,h)=>({h,count})).filter(x=>x.count>0&&x.count<=commonHourThreshold).sort((a,b)=>a.count-b.count||a.h-b.h);
    const lowHourSet=new Set(lowHours.map(x=>x.h)),lowHourEvents=data.filter(r=>lowHourSet.has(r.dt.getHours())).length;
    const weekdayActiveDates=new Set(data.filter(r=>![0,6].includes(r.dt.getDay())).map(r=>localDateKey(r.dt))).size;
    const weekendActiveDates=new Set(data.filter(r=>[0,6].includes(r.dt.getDay())).map(r=>localDateKey(r.dt))).size;
    const weekdayRate=weekdayActiveDates?weekdayEvents/weekdayActiveDates:0,weekendRate=weekendActiveDates?weekendRows.length/weekendActiveDates:0;
    const weekendRateRatio=weekdayRate?weekendRate/weekdayRate:null;
    const topHours=hourCounts.map((count,h)=>({h,count})).sort((a,b)=>b.count-a.count||a.h-b.h).slice(0,3),top3Events=topHours.reduce((s,x)=>s+x.count,0);
    const bandDefs=[['Overnight','00:00–05:59',0,6],['Morning','06:00–11:59',6,12],['Afternoon','12:00–17:59',12,18],['Evening','18:00–23:59',18,24]];
    const timeBands=bandDefs.map(([name,label,start,end])=>{const rows=data.filter(r=>{const h=r.dt.getHours();return h>=start&&h<end});return {name,label,count:rows.length,days:new Set(rows.map(r=>localDateKey(r.dt))).size};}).sort((a,b)=>b.count-a.count);
    const dateCountMap=new Map();for(const r of data){const d=localDateKey(r.dt);dateCountMap.set(d,(dateCountMap.get(d)||0)+1);}
    const dateCounts=activeDates.map(date=>({date,count:dateCountMap.get(date)||0}));
    const dayMean=activeDayCount?total/activeDayCount:0,daySd=activeDayCount?Math.sqrt(dateCounts.reduce((s,x)=>s+(x.count-dayMean)**2,0)/activeDayCount):0,highDateThreshold=dayMean+2*daySd;
    const highDates=activeDayCount>=5?dateCounts.filter(x=>x.count>highDateThreshold).sort((a,b)=>b.count-a.count||a.date.localeCompare(b.date)):[];
    const contactHourMap=new Map();
    for(const r of data){
      if(!r.bparty)continue;
      const h=r.dt.getHours(),key=r.bparty+'|'+h;
      let x=contactHourMap.get(key);
      if(!x)x={num:r.bparty,h,count:0,days:new Set(),types:new Set(),first:null,last:null};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');
      if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;
      contactHourMap.set(key,x);
    }
    const contactHourMinDays=Math.max(2,Math.min(5,Math.ceil(activeDayCount*.20)));
    const recurringContactHours=[...contactHourMap.values()].filter(x=>x.days.size>=contactHourMinDays).sort((a,b)=>b.days.size-a.days.size||b.count-a.count||a.h-b.h);
    const topRecurringContactHour=recurringContactHours[0]||null;
    const weekdayContactHourMap=new Map();
    for(const r of data){
      if(!r.bparty)continue;
      const w=r.dt.getDay(),h=r.dt.getHours(),key=r.bparty+'|'+w+'|'+h;
      let x=weekdayContactHourMap.get(key);
      if(!x)x={num:r.bparty,w,h,count:0,days:new Set(),types:new Set(),first:null,last:null};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');
      if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;
      weekdayContactHourMap.set(key,x);
    }
    const recurringWeekdayContactHours=[...weekdayContactHourMap.values()].map(x=>{
      x.possible=weekdayDates[x.w].size;
      x.minDays=Math.max(2,Math.min(4,Math.ceil(x.possible*.35)));
      x.coverage=x.possible?100*x.days.size/x.possible:0;
      return x;
    }).filter(x=>x.possible>=2&&x.days.size>=x.minDays).sort((a,b)=>b.coverage-a.coverage||b.days.size-a.days.size||b.count-a.count||a.w-b.w||a.h-b.h);
    const topWeekdayContactHour=recurringWeekdayContactHours[0]||null;

    $('patternSummary').innerHTML=`<div class="kpis">
      <div class="kpi"><div class="v">${String(peakHourIndex).padStart(2,'0')}:00–${String((peakHourIndex+1)%24).padStart(2,'0')}:00</div><div class="l">Most active hour</div><div class="s">${fmtInt(peakHour)} event(s) • ${pct(peakHour).toFixed(1)}%</div></div>
      <div class="kpi"><div class="v">${dayNames[peakWeekdayIndex]}</div><div class="l">Most active weekday</div><div class="s">${fmtInt(peakWeekday)} event(s) • ${pct(peakWeekday).toFixed(1)}%</div></div>
      <div class="kpi"><div class="v">${pct(nightRows.length).toFixed(1)}%</div><div class="l">Night activity</div><div class="s">20:00–05:59 • ${fmtInt(nightRows.length)} event(s)</div></div>
      <div class="kpi"><div class="v">${pct(weekendRows.length).toFixed(1)}%</div><div class="l">Weekend activity</div><div class="s">${fmtInt(weekendRows.length)} weekend • ${fmtInt(weekdayEvents)} weekday</div></div>
      <div class="kpi"><div class="v">${fmtInt(activeDayCount)}</div><div class="l">Active dates</div><div class="s">${fmtInt(total)} filtered event(s)</div></div>
      <div class="kpi"><div class="v">${pct(lowHourEvents).toFixed(1)}%</div><div class="l">Lower-frequency-hour events</div><div class="s">${fmtInt(lowHourEvents)} event(s) across ${fmtInt(lowHours.length)} hour band(s)</div></div>
      <div class="kpi"><div class="v">${fmtInt(recurringContactHours.length)}</div><div class="l">Recurring contact-hour patterns</div><div class="s">At least ${fmtInt(contactHourMinDays)} separate active dates</div></div>
      <div class="kpi"><div class="v">${fmtInt(recurringWeekdayContactHours.length)}</div><div class="l">Weekday + contact + hour patterns</div><div class="s">Adaptive threshold from active same-weekday dates</div></div>
    </div>`;

    $('patternWeekdayTable').innerHTML=`<thead><tr><th>Weekday</th><th>Events</th><th>%</th><th>Active dates</th><th>Avg / active date</th></tr></thead><tbody>${dayNames.map((name,w)=>`<tr><td>${name}</td><td class="num">${fmtInt(weekdayCounts[w])}</td><td class="num">${pct(weekdayCounts[w]).toFixed(1)}%</td><td class="num">${fmtInt(weekdayDates[w].size)}</td><td class="num">${weekdayDates[w].size?(weekdayCounts[w]/weekdayDates[w].size).toFixed(1):'0.0'}</td></tr>`).join('')}</tbody>`;

    const types=[...typeMap.values()].sort((a,b)=>b.count-a.count);
    $('patternEventTypeTable').innerHTML=`<thead><tr><th>Event type</th><th>Events</th><th>%</th><th>Active dates</th><th>Peak hour</th></tr></thead><tbody>${types.map(x=>{const mx=Math.max(...x.hours),h=x.hours.indexOf(mx);return `<tr><td>${typePill(x.type)}</td><td class="num">${fmtInt(x.count)}</td><td class="num">${pct(x.count).toFixed(1)}%</td><td class="num">${fmtInt(x.days.size)}</td><td>${String(h).padStart(2,'0')}:00 <span class="tiny">(${fmtInt(mx)})</span></td></tr>`}).join('')}</tbody>`;

    const contacts=new Map();
    for(const r of data){
      if(!r.bparty)continue;let x=contacts.get(r.bparty);if(!x)x={num:r.bparty,count:0,days:new Set(),first:null,last:null,types:new Set()};
      x.count++;x.days.add(localDateKey(r.dt));x.types.add(r.callType||'—');if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;contacts.set(r.bparty,x);
    }
    const allRecurring=[...contacts.values()].sort((a,b)=>b.days.size-a.days.size||b.count-a.count),recurring=allRecurring.slice(0,20);
    const recurringThreshold=Math.max(2,Math.ceil(activeDayCount*.30)),regularContacts=allRecurring.filter(x=>x.days.size>=recurringThreshold),topContact=allRecurring[0]||null;
    const weekendComparison=weekendRateRatio===null?'No weekday active-date baseline is available.':weekendRateRatio>1.15?`Weekend activity is ${weekendRateRatio.toFixed(2)}x the weekday active-date rate.`:weekendRateRatio<0.85?`Weekend activity is ${weekendRateRatio.toFixed(2)}x the weekday active-date rate.`:`Weekend and weekday active-date rates are broadly similar (${weekendRateRatio.toFixed(2)}x).`;
    const highDateText=activeDayCount<5?'At least 5 active dates are needed for the high-activity-date check.':highDates.length?`${highDates.length} date(s) exceed the mean + 2 SD threshold (${highDateThreshold.toFixed(1)} events).`:`No active date exceeds the mean + 2 SD threshold (${highDateThreshold.toFixed(1)} events).`;
    $('patternNarrative').innerHTML=`<b>Automatic pattern summary</b><div style='margin-top:6px;line-height:1.65'>Peak activity is <b>${String(peakHourIndex).padStart(2,'0')}:00–${String((peakHourIndex+1)%24).padStart(2,'0')}:00</b>; the three busiest hours contain <b>${pct(top3Events).toFixed(1)}%</b> of filtered events.<br><b>${dayNames[peakWeekdayIndex]}</b> has the highest raw event count. ${escapeHtml(weekendComparison)}<br>Night activity (20:00–05:59) is <b>${pct(nightRows.length).toFixed(1)}%</b>. The leading six-hour band is <b>${escapeHtml(timeBands[0]?.name||'—')}</b> (${escapeHtml(timeBands[0]?.label||'')}).<br>${topContact?`Most recurrent contact: <b>${escapeHtml(contactLabel(topContact.num))}</b> on ${fmtInt(topContact.days.size)} of ${fmtInt(activeDayCount)} active dates (${(100*topContact.days.size/activeDayCount).toFixed(1)}%). `:''}${fmtInt(regularContacts.length)} contact(s) appear on at least ${fmtInt(recurringThreshold)} active dates (30% baseline).<br>${escapeHtml(highDateText)}</div>`;
    if(topRecurringContactHour){
      $('patternNarrative').innerHTML+=`<div style='margin-top:4px'>Strongest same-contact/same-hour recurrence: <b>${escapeHtml(contactLabel(topRecurringContactHour.num))}</b> at <b>${String(topRecurringContactHour.h).padStart(2,'0')}:00–${String((topRecurringContactHour.h+1)%24).padStart(2,'0')}:00</b> on ${fmtInt(topRecurringContactHour.days.size)} separate dates. ${fmtInt(recurringContactHours.length)} pattern(s) meet the current ${fmtInt(contactHourMinDays)}-date threshold.</div>`;
    }
    if(topWeekdayContactHour){
      $('patternNarrative').innerHTML+=`<div style='margin-top:4px'>Strongest same-weekday/contact/hour recurrence: <b>${escapeHtml(contactLabel(topWeekdayContactHour.num))}</b> on <b>${dayNames[topWeekdayContactHour.w]}</b> at <b>${String(topWeekdayContactHour.h).padStart(2,'0')}:00–${String((topWeekdayContactHour.h+1)%24).padStart(2,'0')}:00</b>, appearing on ${fmtInt(topWeekdayContactHour.days.size)} of ${fmtInt(topWeekdayContactHour.possible)} active ${dayNames[topWeekdayContactHour.w]} date(s) (${topWeekdayContactHour.coverage.toFixed(1)}% coverage). ${fmtInt(recurringWeekdayContactHours.length)} weekday/contact/hour pattern(s) meet their adaptive recurrence threshold.</div>`;
    }
    $('patternTimeBandTable').innerHTML=`<thead><tr><th>Time band</th><th>Events</th><th>%</th><th>Active dates</th><th>Avg / active date</th></tr></thead><tbody>${timeBands.map(x=>`<tr><td>${escapeHtml(x.name)} <span class='tiny'>• ${escapeHtml(x.label)}</span></td><td class='num'>${fmtInt(x.count)}</td><td class='num'>${pct(x.count).toFixed(1)}%</td><td class='num'>${fmtInt(x.days)}</td><td class='num'>${x.days?(x.count/x.days).toFixed(1):'0.0'}</td></tr>`).join('')}</tbody>`;
    $('patternHighDatesTable').innerHTML=`<thead><tr><th>Date</th><th>Events</th><th>Vs active-date mean</th></tr></thead><tbody>${activeDayCount<5?`<tr><td colspan='3' class='empty'>Need at least 5 active dates for this statistical check.</td></tr>`:highDates.length?highDates.map(x=>`<tr><td><button class='link day-filter' data-date='${x.date}'>${x.date}</button></td><td class='num'>${fmtInt(x.count)}</td><td class='num'>${dayMean?(x.count/dayMean).toFixed(2)+'x':'—'}</td></tr>`).join(''):`<tr><td colspan='3' class='empty'>No date exceeds mean + 2 SD (${highDateThreshold.toFixed(1)} events).</td></tr>`}</tbody>`;
    $('patternRegularContactsTable').innerHTML=`<thead><tr><th>Contact</th><th>Active dates</th><th>Date coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurring.map(x=>`<tr><td><a href="#" class="link contact-filter" data-num="${escAttr(x.num)}" title="${escAttr(contactTitle(x.num))}">${escapeHtml(contactLabel(x.num))}</a></td><td class="num">${fmtInt(x.days.size)}</td><td class="num">${activeDayCount?(100*x.days.size/activeDayCount).toFixed(1):'0.0'}%</td><td class="num">${fmtInt(x.count)}</td><td class="details">${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join('')}</tbody>`;

    $('patternContactHourTable').innerHTML=`<thead><tr><th>Contact</th><th>Hour band</th><th>Active dates</th><th>Date coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurringContactHours.length?recurringContactHours.slice(0,30).map(x=>`<tr><td><button class='link pattern-contact-hour-filter' data-num='${escAttr(x.num)}' data-hour='${x.h}' title='${escAttr(contactTitle(x.num))}'>${escapeHtml(contactLabel(x.num))}</button></td><td><button class='link pattern-contact-hour-filter' data-num='${escAttr(x.num)}' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class='num'>${fmtInt(x.days.size)}</td><td class='num'>${activeDayCount?(100*x.days.size/activeDayCount).toFixed(1):'0.0'}%</td><td class='num'>${fmtInt(x.count)}</td><td class='details'>${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join(''):`<tr><td colspan='8' class='empty'>No contact repeats in the same hour across at least ${fmtInt(contactHourMinDays)} separate active dates under the current filters.</td></tr>`}</tbody>`;

    $('patternWeekdayContactHourTable').innerHTML=`<thead><tr><th>Contact</th><th>Weekday</th><th>Hour band</th><th>Matched dates</th><th>Active weekday dates</th><th>Coverage</th><th>Events</th><th>Types</th><th>First</th><th>Last</th></tr></thead><tbody>${recurringWeekdayContactHours.length?recurringWeekdayContactHours.slice(0,40).map(x=>`<tr><td><button class='link pattern-weekday-contact-hour-filter' data-num='${escAttr(x.num)}' data-weekday='${x.w}' data-hour='${x.h}' title='${escAttr(contactTitle(x.num))}'>${escapeHtml(contactLabel(x.num))}</button></td><td>${dayNames[x.w]}</td><td><button class='link pattern-weekday-contact-hour-filter' data-num='${escAttr(x.num)}' data-weekday='${x.w}' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class='num'>${fmtInt(x.days.size)}</td><td class='num'>${fmtInt(x.possible)}</td><td class='num'>${x.coverage.toFixed(1)}%</td><td class='num'>${fmtInt(x.count)}</td><td class='details'>${escapeHtml([...x.types].join(', '))}</td><td>${dtFmt(x.first)}</td><td>${dtFmt(x.last)}</td></tr>`).join(''):`<tr><td colspan='10' class='empty'>No same-weekday/contact/hour recurrence meets the adaptive threshold under the current filters.</td></tr>`}</tbody>`;
    $('patternUnusualHoursTable').innerHTML=`<thead><tr><th>Hour</th><th>Events</th><th>% of total</th><th>% of peak-hour count</th><th>Active dates</th></tr></thead><tbody>${lowHours.length?lowHours.map(x=>{const ds=new Set(data.filter(r=>r.dt.getHours()===x.h).map(r=>localDateKey(r.dt)));return `<tr><td><button class='link pattern-hour-filter' data-hour='${x.h}'>${String(x.h).padStart(2,'0')}:00–${String((x.h+1)%24).padStart(2,'0')}:00</button></td><td class="num">${fmtInt(x.count)}</td><td class="num">${pct(x.count).toFixed(1)}%</td><td class="num">${peakHour?(100*x.count/peakHour).toFixed(1):'0.0'}%</td><td class="num">${fmtInt(ds.size)}</td></tr>`}).join(''):`<tr><td colspan="5" class="empty">No lower-frequency active hours under the current 20% threshold.</td></tr>`}</tbody>`;

    const days=activeDates.slice(-31),matrix={};let max=1;
    for(const d of days)matrix[d]=Array(24).fill(0);
    for(const r of data){const d=localDateKey(r.dt);if(matrix[d]){matrix[d][r.dt.getHours()]++;max=Math.max(max,matrix[d][r.dt.getHours()]);}}
    $('hourMatrix').innerHTML=`<table class="table"><thead><tr><th>Date</th>${Array.from({length:24},(_,h)=>`<th>${String(h).padStart(2,'0')}</th>`).join('')}</tr></thead><tbody>${days.map(d=>`<tr><td><button class='link day-filter' data-date='${d}'>${d}</button></td>${matrix[d].map((v,h)=>`<td title="${v} event(s)" style="text-align:center;background:rgba(21,94,239,${v?0.08+0.72*v/max:0})">${v?`<button class='link pattern-hour-date-filter' data-date='${d}' data-hour='${h}' title='Open ${v} matching record(s)'>${v}</button>`:''}</td>`).join('')}</tr>`).join('')}</tbody></table>`;

    const top=aggregateContacts(data).slice(0,20),cd={};let cmax=1;
    for(const x of top){cd[x.bparty]={};for(const d of days)cd[x.bparty][d]=0;}
    for(const r of data){if(!cd[r.bparty])continue;const d=localDateKey(r.dt);if(d in cd[r.bparty]){cd[r.bparty][d]++;cmax=Math.max(cmax,cd[r.bparty][d]);}}
    $('contactDayMatrix').innerHTML=`<h3>Contact-by-day matrix</h3><div class="tiny" style="margin-bottom:6px">Top 20 contacts within the current filters across the latest 31 filtered dates.</div><div class="tablewrap"><table class="table"><thead><tr><th>Contact</th>${days.map(d=>`<th>${d.slice(5)}</th>`).join('')}</tr></thead><tbody>${top.map(x=>`<tr><td title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</td>${days.map(d=>{const v=cd[x.bparty][d]||0;return `<td title="${v} event(s)" style="text-align:center;background:rgba(181,71,8,${v?0.08+0.72*v/cmax:0})">${v||''}</td>`}).join('')}</tr>`).join('')}</tbody></table></div>`;
  }

  function qualitySnapshot(){
    const data=subjectEventScopedRecords(state.records);
    const signature=r=>[r.cdrNo,r.bparty,r.dt?+r.dt:'',Number(r.duration)||0,r.callType,r.firstCellId].join('|');
    const groups=new Map();
    for(const r of data){const k=signature(r);if(!groups.has(k))groups.set(k,[]);groups.get(k).push(r);}
    const duplicateGroups=[...groups.entries()].filter(([,rows])=>rows.length>1);
    const duplicateKeys=new Set(duplicateGroups.map(([k])=>k));
    const issues={
      duplicates:{
        label:'Rows in duplicate-signature groups',
        rows:data.filter(r=>duplicateKeys.has(signature(r))),
        impact:'Can inflate event counts, contact frequency, duration totals and pattern summaries when the same records were imported more than once.'
      },
      missingDate:{
        label:'Missing date / time',
        rows:data.filter(r=>!r.dt),
        impact:'Weakens chronology, incident-window analysis, night activity, peak-hour analysis and movement sequencing.'
      },
      missingSubject:{
        label:'Missing subject / CDR No.',
        rows:data.filter(r=>!r.cdrNo),
        impact:'Prevents reliable attribution to an A-party and weakens subject-wise, Cross-CDR and relationship analysis.'
      },
      missingParty:{
        label:'Missing connected party / B Party',
        rows:data.filter(r=>!r.bparty),
        impact:'Weakens contact frequency, relationship analysis, communication network and pair-level review.'
      },
      missingTower:{
        label:'Missing tower',
        rows:data.filter(r=>!r.firstCellId&&!r.firstAddress),
        impact:'Weakens movement, common-tower, location-match and night-stay analysis.'
      },
      missingCoords:{
        label:'Missing coordinates',
        rows:data.filter(r=>r.lat==null||r.lng==null),
        impact:'Prevents map plotting and distance calculations for those rows. Cell-ID/address based tower analysis may still remain usable.'
      }
    };
    const issueIds=new Set();
    for(const x of Object.values(issues))for(const r of x.rows)issueIds.add(r.id);
    const extraDuplicateRows=duplicateGroups.reduce((sum,[,rows])=>sum+Math.max(0,rows.length-1),0);
    return {data,signature,groups,duplicateGroups,issues,issueIds,extraDuplicateRows};
  }

  function qualityGroupRows(q,field,missingLabel){
    const m=new Map();
    for(const r of q.data){
      const key=String(r[field]||'').trim()||missingLabel;
      let x=m.get(key);
      if(!x)x={key,total:0,missingDate:0,missingSubject:0,missingParty:0,missingTower:0,missingCoords:0,duplicateRows:0};
      x.total++;
      if(!r.dt)x.missingDate++;
      if(!r.cdrNo)x.missingSubject++;
      if(!r.bparty)x.missingParty++;
      if(!r.firstCellId&&!r.firstAddress)x.missingTower++;
      if(r.lat==null||r.lng==null)x.missingCoords++;
      if((q.groups.get(q.signature(r))||[]).length>1)x.duplicateRows++;
      m.set(key,x);
    }
    return [...m.values()].sort((a,b)=>b.total-a.total||String(a.key).localeCompare(String(b.key),undefined,{numeric:true}));
  }

  function renderQualityDrilldown(issueKey){
    const box=$('qualityDrilldown');if(!box)return;
    const q=qualitySnapshot(),issue=q.issues[issueKey];
    if(!issue){box.innerHTML='<div class="empty">Choose an issue above to inspect its affected records.</div>';return;}
    const rows=issue.rows.slice(0,300);
    box.innerHTML=`<div class="panel-title"><h3>${escapeHtml(issue.label)}</h3><span class="muted">${fmtInt(issue.rows.length)} affected row(s)${issue.rows.length>300?' • showing first 300':''}</span></div><div class="notice">${escapeHtml(issue.impact)}</div><div class="tablewrap"><table class="table"><thead><tr><th>Date / Time</th><th>Subject</th><th>B Party</th><th>Event</th><th>Cell / Tower</th><th>Source</th><th>Action</th></tr></thead><tbody>${rows.length?rows.map(r=>`<tr><td>${escapeHtml(dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim()||'—')}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(r.bparty?contactLabel(r.bparty):'—')}</td><td>${escapeHtml(r.callType||'—')}</td><td class="details">${escapeHtml([r.firstCellId,r.firstAddress].filter(Boolean).join(' • ')||'—')}</td><td class="details">${escapeHtml([r.sourceFile,r.sourceSheet,r.rowNumber?('row '+r.rowNumber):''].filter(Boolean).join(' / ')||'—')}</td><td><button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">View record</button></td></tr>`).join(''):'<tr><td colspan="7" class="empty">No affected records.</td></tr>'}</tbody></table></div>`;
  }

  function qualityMappingWarnings(fileRows){
    const checks=[
      ['missingDate','Date / time','Timeline, chronology, night activity and movement ordering'],
      ['missingSubject','Subject / CDR No.','Subject-wise, Cross-CDR and relationship analysis'],
      ['missingParty','B Party / connected number','Contact, network and relationship analysis'],
      ['missingTower','Tower / Cell ID','Movement, location match, common towers and night stay']
    ];
    const out=[];
    for(const x of fileRows){
      if(x.total<5)continue;
      for(const [field,label,impact] of checks){
        const n=Number(x[field]||0),share=x.total?n/x.total:0;
        if(share>=0.8)out.push({file:x.key,field,label,impact,count:n,total:x.total,share});
      }
    }
    return out.sort((a,b)=>b.share-a.share||b.count-a.count||String(a.file).localeCompare(String(b.file)));
  }

  function exportQualityCsv(){
    const q=qualitySnapshot();
    const issueNames=new Map();
    for(const [key,x] of Object.entries(q.issues))for(const r of x.rows){if(!issueNames.has(r.id))issueNames.set(r.id,[]);issueNames.get(r.id).push(x.label);}
    const cell=v=>{const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;};
    const headers=['Issues','CDR No','B Party','Date/Time','Event Type','Duration Seconds','First Cell ID','First Tower Address','Latitude','Longitude','IMEI','IMSI','Source File','Source Sheet','Source Row'];
    const lines=[headers.join(',')];
    for(const r of q.data){
      const issues=issueNames.get(r.id)||[];
      if(!issues.length)continue;
      lines.push([issues.join(' | '),r.cdrNo,r.bparty,dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim(),r.callType,r.duration,r.firstCellId,r.firstAddress,r.lat??'',r.lng??'',r.imei,r.imsi,r.sourceFile,r.sourceSheet,r.rowNumber].map(cell).join(','));
    }
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob),link=document.createElement('a');
    link.href=url;link.download='cdr_data_quality_issues.csv';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function renderDataQuality(){
    const q=qualitySnapshot(),total=q.data.length,affected=q.issueIds.size,clean=Math.max(0,total-affected);
    const pct=n=>total?((n*100/total).toFixed(1)+'%'):'0.0%';
    const issueOrder=['duplicates','missingDate','missingSubject','missingParty','missingTower','missingCoords'];
    const subjectRows=qualityGroupRows(q,'cdrNo','— Missing subject —').slice(0,100);
    const fileRows=qualityGroupRows(q,'sourceFile','— Unknown source file —').slice(0,100);
    const mappingWarnings=qualityMappingWarnings(fileRows);
    const groupTable=(rows,kind)=>`<div class="tablewrap"><table class="table"><thead><tr><th>Name</th><th>Records</th><th>Missing date</th><th>Missing subject</th><th>Missing B Party</th><th>Missing tower</th><th>Missing coordinates</th><th>Duplicate-group rows</th><th>Action</th></tr></thead><tbody>${rows.length?rows.map(x=>`<tr><td class="details">${escapeHtml(x.key)}</td><td>${fmtInt(x.total)}</td><td>${fmtInt(x.missingDate)}</td><td>${fmtInt(x.missingSubject)}</td><td>${fmtInt(x.missingParty)}</td><td>${fmtInt(x.missingTower)}</td><td>${fmtInt(x.missingCoords)}</td><td>${fmtInt(x.duplicateRows)}</td><td>${((kind==='subject'&&x.key!=='— Missing subject —')||(kind==='file'&&x.key!=='— Unknown source file —'))?`<button class="btn secondary small quality-scope-records" data-kind="${kind}" data-value="${escAttr(x.key)}">Open records</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="9" class="empty">No data.</td></tr>'}</tbody></table></div>`;
    const dupRows=q.duplicateGroups.slice(0,100).map(([,rows])=>{
      const r=rows[0];
      return `<tr><td>${fmtInt(rows.length)}</td><td>${escapeHtml(r.cdrNo||'—')}</td><td title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(r.bparty?contactLabel(r.bparty):'—')}</td><td>${escapeHtml(dtFmt(r.dt)||((r.date||'')+' '+(r.time||'')).trim()||'—')}</td><td>${escapeHtml(r.callType||'—')}</td><td>${escapeHtml(r.firstCellId||'—')}</td><td class="details">${escapeHtml(rows.map(x=>[x.sourceFile,x.sourceSheet,x.rowNumber?('row '+x.rowNumber):''].filter(Boolean).join(' / ')).join(' | '))}</td><td><button class="btn secondary small lead-view-record" data-id="${escAttr(r.id)}">View sample</button></td></tr>`;
    }).join('');
    $('qualitySummary').innerHTML=`
      <div class="notice">These checks describe the structure of the loaded CDR rows. A missing field does not automatically make an entire CDR unusable; it indicates which downstream analyses may be incomplete or unavailable for the affected rows.</div>
      <div class="subtoolbar no-print" style="margin:10px 0"><button class="btn secondary small" id="qualityExportBtn">Export quality issues CSV</button><span class="tiny">Exports only rows that have at least one listed quality issue.</span></div>
      <div class="kpis">
        <div class="kpi"><div class="v">${fmtInt(total)}</div><div class="l">Records checked</div></div>
        <div class="kpi"><div class="v">${fmtInt(affected)}</div><div class="l">Rows with ≥1 issue</div><div class="s">${pct(affected)}</div></div>
        <div class="kpi"><div class="v">${fmtInt(clean)}</div><div class="l">Rows without listed issues</div><div class="s">${pct(clean)}</div></div>
        <div class="kpi"><div class="v">${fmtInt(q.duplicateGroups.length)}</div><div class="l">Duplicate groups</div></div>
        <div class="kpi"><div class="v">${fmtInt(q.extraDuplicateRows)}</div><div class="l">Extra duplicate rows</div></div>
      </div>
      <h3>Issues requiring review</h3>
      <div class="tablewrap"><table class="table"><thead><tr><th>Check</th><th>Affected rows</th><th>Share</th><th>Why it matters</th><th>Review</th></tr></thead><tbody>
        ${issueOrder.map(k=>{const x=q.issues[k];return `<tr><td><b>${escapeHtml(x.label)}</b></td><td>${fmtInt(x.rows.length)}</td><td>${pct(x.rows.length)}</td><td class="details">${escapeHtml(x.impact)}</td><td><button class="btn secondary small quality-review" data-issue="${k}">View affected</button></td></tr>`}).join('')}
      </tbody></table></div>
      <div id="qualityDrilldown" style="margin-top:16px"><div class="empty">Choose “View affected” to inspect the source rows for an issue.</div></div>
      <h3 style="margin-top:20px">Potential file mapping / metadata problems</h3>
      <div class="tiny" style="margin-bottom:6px">A warning appears when at least 80% of a file's rows (minimum 5 rows) are missing the same key field. This is a prompt to review the source export or column mapping, not proof that the file was parsed incorrectly.</div>
      <div class="tablewrap"><table class="table"><thead><tr><th>File</th><th>Field</th><th>Affected</th><th>Share</th><th>Analysis affected</th><th>Action</th></tr></thead><tbody>${mappingWarnings.length?mappingWarnings.map(x=>`<tr><td class="details">${escapeHtml(x.file)}</td><td><b>${escapeHtml(x.label)}</b></td><td>${fmtInt(x.count)} / ${fmtInt(x.total)}</td><td>${(x.share*100).toFixed(1)}%</td><td class="details">${escapeHtml(x.impact)}</td><td>${x.file!=='— Unknown source file —'?`<button class="btn secondary small quality-scope-records" data-kind="file" data-value="${escAttr(x.file)}">Open file records</button>`:'—'}</td></tr>`).join(''):'<tr><td colspan="6" class="empty">No strong file-level missing-field concentration detected.</td></tr>'}</tbody></table></div>
      <h3 style="margin-top:20px">Likely duplicate groups</h3>
      <div class="tiny" style="margin-bottom:6px">A duplicate signature uses Subject + B Party + Date/Time + Duration + Event Type + First Cell ID. Matching signatures can be genuine repeated records in some provider exports, so review the source rows before removing anything.</div>
      <div class="tablewrap"><table class="table"><thead><tr><th>Rows</th><th>Subject</th><th>B Party</th><th>Date / Time</th><th>Event</th><th>Cell ID</th><th>Sources</th><th>Action</th></tr></thead><tbody>${dupRows||'<tr><td colspan="8" class="empty">No duplicate-signature groups found.</td></tr>'}</tbody></table></div>
      <h3 style="margin-top:20px">Quality by subject</h3>
      <div class="tiny" style="margin-bottom:6px">Use this to identify whether missing fields are concentrated in one subject/CDR rather than across the whole upload.</div>
      ${groupTable(subjectRows,'subject')}
      <h3 style="margin-top:20px">Quality by imported file</h3>
      <div class="tiny" style="margin-bottom:6px">Useful for spotting a provider/export file whose column mapping or metadata is incomplete.</div>
      ${groupTable(fileRows,'file')}
    `;
  }

  function findBursts(data,mins,minCount){const by=new Map();for(const r of data){if(!r.dt||!r.bparty)continue;const k=`${r.cdrNo}|${r.bparty}`;if(!by.has(k))by.set(k,[]);by.get(k).push(r);}const out=[];const win=mins*60000;for(const [k,a] of by){a.sort((x,y)=>x.dt-y.dt);let left=0,best=null;for(let right=0;right<a.length;right++){while(a[right].dt-a[left].dt>win)left++;const count=right-left+1;if(count>=minCount&&(!best||count>best.count))best={count,start:a[left].dt,end:a[right].dt,records:a.slice(left,right+1)};}if(best){const [cdr,bparty]=k.split('|');out.push({cdr,bparty,...best});}}return out.sort((a,b)=>b.count-a.count||a.start-b.start);}
  function identifierUsage(cdr,field){
    const m=new Map();
    for(const r of state.filtered){
      if(r.cdrNo!==cdr)continue;
      const id=String(r[field]||'').trim(); if(!id)continue;
      let x=m.get(id);
      if(!x)x={id,first:null,last:null,count:0,device:''};
      x.count++;
      if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;
      if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;
      if(field==='imei'&&!x.device)x.device=[r.manufacturer,r.deviceType].filter(Boolean).join(' • ');
      m.set(id,x);
    }
    return [...m.values()].sort((a,b)=>(a.first?.getTime?.()||0)-(b.first?.getTime?.()||0));
  }
  function deviceChangeDetailsHtml(cdr){
    const imeis=identifierUsage(cdr,'imei'),imsis=identifierUsage(cdr,'imsi');
    const rows=[
      ...imeis.map(x=>['IMEI',x.id,x.device||'—',x.first,x.last,x.count]),
      ...imsis.map(x=>['IMSI',x.id,'—',x.first,x.last,x.count])
    ];
    if(!rows.length)return '<div class="muted">No identifier timestamps are available in the current filter.</div>';
    return `<div class="device-change-body"><div class="tiny" style="margin-bottom:6px">First/last use shown within the current filtered CDR records.</div><div style="overflow:auto"><table><thead><tr><th>Type</th><th>Identifier</th><th>Device</th><th>First use</th><th>Last use</th><th>Records</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${r[0]}</td><td>${escapeHtml(r[1])}</td><td>${escapeHtml(r[2])}</td><td>${escapeHtml(dtFmt(r[3])||'—')}</td><td>${escapeHtml(dtFmt(r[4])||'—')}</td><td>${fmtInt(r[5])}</td></tr>`).join('')}</tbody></table></div></div>`;
  }
  function buildLeads(){const data=state.filtered,identifierAnalysis=analyzeIdentifiers(data),contacts=aggregateContacts(data),counts=contacts.map(x=>x.records),p95=percentile(counts,.95),burstM=+$('burstMins')?.value||10,burstC=+$('burstCount')?.value||3,longSec=+$('longCallSec')?.value||600;const high=contacts.filter(x=>x.records>=Math.max(5,p95)).slice(0,20);const bursts=findBursts(data,burstM,burstC).slice(0,30);const night=aggregateContacts(data.filter(r=>{if(!r.dt)return false;const h=r.dt.getHours();return h>=22||h<6;})).slice(0,20);const longCalls=data.filter(r=>normalize(r.callType).includes('call')&&r.duration>=longSec).sort((a,b)=>b.duration-a.duration).slice(0,30);const cf=data.filter(r=>r.callForward&&normalize(r.callForward)!=='no'&&normalize(r.callForward)!=='false'&&normalize(r.callForward)!=='0');const byCdr=new Map();for(const r of data){if(!r.cdrNo)continue;if(!byCdr.has(r.cdrNo))byCdr.set(r.cdrNo,{imei:new Set(),imsi:new Set()});if(r.imei)byCdr.get(r.cdrNo).imei.add(r.imei);if(r.imsi)byCdr.get(r.cdrNo).imsi.add(r.imsi);}const deviceChanges=[...byCdr].filter(([,x])=>x.imei.size>1||x.imsi.size>1);const roam={};for(const r of data){if(r.roaming)roam[r.roaming]=(roam[r.roaming]||0)+1;}const inc=incidentDateTime();let incident=[];if(inc){const h=(+$('incidentWindowHours').value||6)*3600000;incident=data.filter(r=>r.dt&&Math.abs(r.dt-inc)<=h).sort((a,b)=>Math.abs(a.dt-inc)-Math.abs(b.dt-inc)).slice(0,100);}return {high,p95,bursts,night,longCalls,cf,deviceChanges,identifierAnalysis,roam,incident,inc};}
  function renderLeads(){if(!$('leadsContent'))return;const L=buildLeads();const leadCard=(title,big,why,body)=>`<div class="lead-card"><h4>${title}</h4><div class="big">${big}</div><div class="why">${why}</div><div class="lead-list">${body||'<span class="muted">No matching items in the current filter.</span>'}</div></div>`;const html=[];html.push(leadCard('High-frequency contacts',fmtInt(L.high.length),`Contacts at or above the current 95th percentile (${Math.round(L.p95||0)} records).`,L.high.map(x=>`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${fmtInt(x.records)} events, ${fmtDur(x.duration)} <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Communication bursts',fmtInt(L.bursts.length),`${$('burstCount').value} or more events with the same contact inside ${$('burstMins').value} minutes.`,L.bursts.map(x=>`${escapeHtml(x.cdr||'Subject')} ↔ <a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${x.count} events, ${dtFmt(x.start)} <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Night activity contacts',fmtInt(L.night.length),'Most active contacts between 22:00 and 05:59 in the current filter.',L.night.map(x=>`<a href="#" class="link contact-filter" data-num="${escAttr(x.bparty)}" title="${escAttr(contactTitle(x.bparty))}">${escapeHtml(contactLabel(x.bparty))}</a> — ${x.records} events <button class="lead-action lead-contact-records" data-num="${escAttr(x.bparty)}">View records</button><br>`).join('')));html.push(leadCard('Long calls',fmtInt(L.longCalls.length),`Calls at or above ${$('longCallSec').value} seconds.`,L.longCalls.map(r=>`${dtFmt(r.dt)} — <a href="#" class="link contact-filter" data-num="${escAttr(r.bparty)}" title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</a> — ${fmtDur(r.duration)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));html.push(leadCard('Device / SIM changes',fmtInt(L.deviceChanges.length),'Click a subject to view first and last use of every IMEI / IMSI in the current filtered period.',L.deviceChanges.map(([cdr,x])=>`<details class="device-change-detail"><summary>${escapeHtml(cdr)} — ${x.imei.size} IMEI, ${x.imsi.size} IMSI</summary>${deviceChangeDetailsHtml(cdr)}</details>`).join('')));
html.push(leadCard('MSISDN → multiple IMSIs',fmtInt(L.identifierAnalysis.msisdnNewImsi.length),'Subject numbers observed with more than one IMSI in the current filter. This may indicate SIM/subscription replacement or another subscription-profile change.',L.identifierAnalysis.msisdnNewImsi.slice(0,30).map(x=>`${escapeHtml(x.msisdn)} — ${x.imsis.size} IMSIs: ${escapeHtml([...x.imsis].join(', '))}<br>`).join('')));
html.push(leadCard('Same IMSI → multiple IMEIs',fmtInt(L.identifierAnalysis.imsiNewImei.length),'The same SIM/subscription identity was observed with more than one handset identifier.',L.identifierAnalysis.imsiNewImei.slice(0,30).map(x=>`${escapeHtml(x.imsi)} — ${x.imeis.size} IMEIs: ${escapeHtml([...x.imeis].join(', '))}<br>`).join('')));
html.push(leadCard('Same IMEI → multiple IMSIs',fmtInt(L.identifierAnalysis.imeiMultiImsi.length),'More than one SIM/subscription identity was observed with the same handset identifier.',L.identifierAnalysis.imeiMultiImsi.slice(0,30).map(x=>`${escapeHtml(x.imei)} — ${x.imsis.size} IMSIs: ${escapeHtml([...x.imsis].join(', '))}<br>`).join('')));
html.push(leadCard('IMSI cross-CDR linkage',fmtInt(L.identifierAnalysis.imsiCrossCdr.length),'IMSI values appearing under multiple subject numbers or across multiple imported CDR files. Treat as a linkage lead requiring corroboration.',L.identifierAnalysis.imsiCrossCdr.slice(0,30).map(x=>`${escapeHtml(x.imsi)} — subjects: ${escapeHtml([...x.msisdns].join(', ')||'—')} — files: ${fmtInt(x.files.size)}<br>`).join('')));
html.push(leadCard('Repeated identifier changes',fmtInt(L.identifierAnalysis.repeatedSwaps.length),'Subjects with three or more IMSI/IMEI transition events in the current filtered period; shown for manual review only.',L.identifierAnalysis.repeatedSwaps.slice(0,30).map(x=>`${escapeHtml(x.msisdn)} — ${fmtInt(x.count)} transitions • ${fmtInt(x.imsis.size)} IMSI • ${fmtInt(x.imeis.size)} IMEI<br>`).join('')));html.push(leadCard('Roaming labels',fmtInt(Object.keys(L.roam).length),'Network roaming/circle labels appearing in the filtered records.',Object.entries(L.roam).sort((a,b)=>b[1]-a[1]).map(([k,v])=>`${escapeHtml(k)} — ${fmtInt(v)} events<br>`).join('')));html.push(leadCard('Call-forward indicators',fmtInt(L.cf.length),'Rows where the CallForward field contains a non-empty/non-false value.',L.cf.slice(0,30).map(r=>`${dtFmt(r.dt)} — ${escapeHtml(contactLabel(r.bparty))} — ${escapeHtml(r.callForward)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));html.push(leadCard('Incident-window events',fmtInt(L.incident.length),L.inc?`Nearest events within ±${$('incidentWindowHours').value} hours of ${dtFmt(L.inc)}.`:'Enter incident date/time at the top to populate this lead.',L.incident.slice(0,30).map(r=>`${dtFmt(r.dt)} — ${escapeHtml(contactLabel(r.bparty))} — ${escapeHtml(r.firstAddress||r.firstCellId)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>`).join('')));$('leadsContent').innerHTML=`<div class="notice">These are rule-based review prompts only. Frequency, night activity, roaming, device change, same-cell use or call patterns do not establish identity, intent, presence or wrongdoing by themselves.</div><div class="lead-grid">${html.join('')}</div>`;}


    function bind(){
      $('smsIntelRefreshBtn').onclick=renderSmsIntelligence;
      $('smsIntelCdr').onchange=e=>setSubjectEventScope(e.target.value,$('callType')?.value||'');
      $('smsIntelFrom').onchange=renderSmsIntelligence;
      $('smsIntelTo').onchange=renderSmsIntelligence;
      $('incidentRefreshBtn').onclick=renderIncident;
      $('leadsRefreshBtn').onclick=renderLeads;
      document.addEventListener('click',e=>{
        const q=e.target.closest('.quality-review');if(q){e.preventDefault();renderQualityDrilldown(q.dataset.issue||'');return;}
        if(e.target.closest('#qualityExportBtn')){e.preventDefault();exportQualityCsv();return;}
        const scope=e.target.closest('.quality-scope-records');if(scope){
          e.preventDefault();
          if(scope.dataset.kind==='subject'){if($('cdrNo'))$('cdrNo').value=scope.dataset.value||'';if($('sourceFile'))$('sourceFile').value='';}
          if(scope.dataset.kind==='file'){if($('sourceFile'))$('sourceFile').value=scope.dataset.value||'';if($('cdrNo'))$('cdrNo').value='';}
          $('applyBtn')?.click();window.CDRApp?.switchTab?.('records');
        }
      });
    }

    return {
      renderSmsIntelligence,renderIncident,renderDaySummary,renderPatterns,renderDataQuality,exportQualityCsv,
      findBursts,identifierUsage,deviceChangeDetailsHtml,buildLeads,renderLeads,bind
    };
  };
})();
