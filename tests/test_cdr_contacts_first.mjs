import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const read=name=>readFileSync(new URL('../cdranalysis/js/'+name+'.js',import.meta.url),'utf8');
const parse=s=>new Date(s);
const iso=d=>d instanceof Date?d.toISOString():'';

function fixture(){
  const records=[
    // Two events before the true first voice call (neither must count as a call).
    {cdrNo:'Subject A',sourceFile:'A.xlsx',provider:'Carrier',bparty:'9000000001',bpartyKey:'9000000001',callType:'SMS',dt:parse('2026-05-03T08:00:00Z')},
    {cdrNo:'Subject A',sourceFile:'A.xlsx',provider:'Carrier',bparty:'9000000001',bpartyKey:'9000000001',callType:'Data Call',dt:parse('2026-06-02T09:00:00Z')},
    {cdrNo:'Subject A',sourceFile:'A.xlsx',provider:'Carrier',bparty:'+91 9000000001',bpartyKey:'9000000001',callType:'Outgoing Call',dt:parse('2026-07-06T08:30:00Z')},
    {cdrNo:'Subject A',sourceFile:'A.xlsx',provider:'Carrier',bparty:'9000000001',bpartyKey:'9000000001',callType:'Incoming Call',dt:parse('2026-10-10T17:30:00Z')},
    // An older call from another CDR and a different source file must not leak into a scoped result.
    {cdrNo:'Subject B',sourceFile:'B.xlsx',provider:'Carrier',bparty:'9000000001',bpartyKey:'9000000001',callType:'Outgoing Call',dt:parse('2026-01-01T10:00:00Z')},
    {cdrNo:'Subject A',sourceFile:'Other.xlsx',provider:'Carrier',bparty:'9000000001',bpartyKey:'9000000001',callType:'Outgoing Call',dt:parse('2026-02-01T10:00:00Z')}
  ];
  const state={records,filtered:[],page:5,analysisMode:'raw',sourceTimezone:'UTC',requestSelected:new Set()};
  const inputs={};
  for(const name of ['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','cellId','tower','city','subcity','roaming','imei','imsi','provider','operator','callType','cdrNo','sourceFile','nightFrom','nightTo'])
    inputs[name]={value:''};
  for(const name of ['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders'])
    inputs[name]={checked:false};
  inputs.identityScope={value:'case'};
  inputs.contactsTable={innerHTML:''};
  inputs.analysisIntegrityStatus={textContent:''};
  inputs.activeFilterCount={textContent:''};
  inputs.nightFrom.value='20:00';inputs.nightTo.value='06:00';
  inputs.cdrNo.value='Subject A';inputs.sourceFile.value='A.xlsx';inputs.provider.value='Carrier';
  inputs.dateFrom.value='2026-10-10';inputs.timeFrom.value='15:00';
  const $=id=>inputs[id]||null;
  const normalize=s=>String(s??'').toLowerCase().trim();
  const window={CDRCore:{
    dateFromSourceParts:(y,m,d,h,min,sec)=>new Date(Date.UTC(y,m,d,h,min,sec)),
    sourceMinutes:d=>d.getUTCHours()*60+d.getUTCMinutes(),
    sourceWeekday:d=>d.getUTCDay()
  }};
  const document={};
  for(const name of ['dashboard','filters','contacts']){
    runInNewContext(read(name),{window,document},{filename:name+'.js'});
  }
  const dashboard=window.CDRDashboardFactory({$,state,normalize,phoneKey:s=>String(s).replace(/\\D/g,'').slice(-10)});
  const filters=window.CDRFiltersFactory({
    $,state,normalize,contactLabel:s=>s,contactTag:()=>'',isServiceSender:()=>false,
    timeMins:s=>s?Number(s.slice(0,2))*60+Number(s.slice(3,5)):null,
    analysisRecords:()=>state.records,
    renderAll:()=>{},fmtInt:String
  });
  const contact=window.CDRContactsFactory({
    $,state,aggregateContacts:dashboard.aggregateContacts,
    recordsIgnoringDateTimeFilters:filters.recordsIgnoringDateTimeFilters,
    identityStore:()=>({}),defaultCdrRequestDates:()=>{},updateCdrRequestCount:()=>{},
    requestIdentifier:s=>String(s).replace(/\\D/g,'').slice(-10),
    escAttr:s=>String(s),escapeHtml:s=>String(s),
    contactTitle:s=>s,contactLabel:s=>s,contactTag:()=>'',contactName:()=>'',serviceSenderType:()=>'',fmtInt:String,
    fmtDur:String,dtFmt:iso,showStatus:()=>{}
  });
  // Avoid DOM render and browser event requirements of full applyFilters(); use same filtering projection.
  return {state,inputs,filters,contact,records};
}

test('First is the earliest voice call even before the selected date and time',()=>{
  const h=fixture();
  const projected=h.filters.recordsIgnoringDateTimeFilters();
  assert.equal(projected.length,4);
  // The current filtered display includes only the October event.
  h.state.filtered=projected.filter(r=>r.dt>=parse('2026-10-10T15:00:00Z'));
  h.contact.render();
  const html=h.inputs.contactsTable.innerHTML;
  assert.match(html,/2026-07-06T08:30:00.000Z/);
  assert.match(html,/2026-10-10T17:30:00.000Z/);
  assert.doesNotMatch(html,/2026-05-03T08:00:00.000Z/);
  assert.doesNotMatch(html,/2026-06-02T09:00:00.000Z/);
  assert.doesNotMatch(html,/2026-01-01T10:00:00.000Z/);
  assert.doesNotMatch(html,/2026-02-01T10:00:00.000Z/);
  assert.match(html,/title="Earliest voice call/);
});

test('date/time, incident, night, weekend and search date constraints are ignored only in the historical lookup',()=>{
  const h=fixture();
  h.inputs.q.value='after:2026-10-01';
  h.inputs.timeTo.value='19:00';
  h.inputs.nightOnly.checked=true;
  h.inputs.weekendOnly.checked=true;
  h.state.exactIncidentRange={start:parse('2026-10-10T17:00:00Z'),end:parse('2026-10-10T19:00:00Z')};
  h.state.filtered=[h.records[3]];
  const before=h.state.filtered;
  const baseline=h.filters.recordsIgnoringDateTimeFilters();
  assert.deepEqual(baseline.map(x=>iso(x.dt)),[
    '2026-05-03T08:00:00.000Z',
    '2026-06-02T09:00:00.000Z',
    '2026-07-06T08:30:00.000Z',
    '2026-10-10T17:30:00.000Z'
  ]);
  assert.strictEqual(h.state.filtered,before,'historical lookup must not mutate the current filtered records');
});

test('First displays a dash for a contact with no call, rather than mislabeling SMS as a call',()=>{
  const h=fixture();
  h.state.records=[{cdrNo:'Subject A',sourceFile:'A.xlsx',provider:'Carrier',bparty:'9000000002',bpartyKey:'9000000002',callType:'SMS',dt:parse('2026-10-10T17:30:00Z')}];
  h.state.filtered=[h.state.records[0]];
  h.contact.render();
  const html=h.inputs.contactsTable.innerHTML;
  assert.match(html,/<th title="Earliest voice call/);
  assert.match(html,/<td>—<\/td><td>2026-10-10T17:30:00.000Z<\/td>/);
});
