import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const source=n=>readFileSync(new URL('../cdranalysis/js/'+n+'.js',import.meta.url),'utf8');
const window={};
for(const n of ['contacts-insights','contacts-extras','contacts'])
  runInNewContext(source(n),{window,Date},{filename:n+'.js'});
const numbers=['9000000011','9000000022'];
const records=[
  {bparty:numbers[0],bpartyKey:numbers[0],cdrNo:'SOURCE-A',callType:'Outgoing Call',dt:new Date('2026-01-02T11:30:00Z'),duration:50},
  {bparty:numbers[0],bpartyKey:numbers[0],cdrNo:'SOURCE-B',callType:'Incoming Call',dt:new Date('2026-05-03T09:00:00Z'),duration:60},
  {bparty:numbers[1],bpartyKey:numbers[1],cdrNo:'SOURCE-A',callType:'SMS',dt:new Date('2026-05-05T10:15:00Z'),duration:0}
];
function create(){
  const input=(value='')=>({value,checked:false,innerHTML:'',textContent:'',addEventListener(kind,fn){this[kind]=fn;},scrollIntoView(){}});
  const elements={};
  for(const id of ['contactsSort','contactsTable','contactsSearch','contactsMinCalls','contactsTagFilter','contactsSharedOnly','contactsShortlistOnly','contactsDataScope','contactsBulkTag','contactsBulkTagApply','contactsShowingCount','contactsSelectVisible','contactsShortlistAdd','contactsShortlistRemove','contactsExportSelected','contactsComparisonPanel','identityScope','contactProfilePanel'])
    elements[id]=input();
  elements.contactsDataScope.value='filtered';elements.contactsMinCalls.value='0';
  const state={requestSelected:new Set(),contactShortlist:new Set(),filtered:records.slice(1),contactTags:{},globalContactTags:{}};
  const phoneKey=x=>String(x);
  function aggregate(data=state.filtered){
    const m=new Map();
    for(const r of data){
      let x=m.get(r.bpartyKey);
      if(!x){x={key:r.bpartyKey,bparty:r.bparty,aliases:new Set(),records:0,calls:0,in:0,out:0,sms:0,duration:0,last:null,first:null,towers:new Set(),providers:new Set(),cdrs:new Set()};m.set(r.bpartyKey,x);}
      x.records++;
      if(window.CDRContactsInsights.direction(r))x.calls++;
      if(/SMS/i.test(r.callType))x.sms++;
      x.duration+=r.duration;
      x.first=!x.first||r.dt<x.first?r.dt:x.first;
      x.last=!x.last||r.dt>x.last?r.dt:x.last;
      x.aliases.add(r.bparty);x.cdrs.add(r.cdrNo);
    }
    return [...m.values()];
  }
  const actions=[];
  const contact=window.CDRContactsFactory({
    $:id=>elements[id]||null,state,aggregateContacts:aggregate,analysisRecords:()=>records,
    recordsIgnoringDateTimeFilters:()=>records,phoneKey,
    identityStore:kind=>state[kind==='name'?'contactNames':'contactTags']||(state[kind==='name'?'contactNames':'contactTags']={}),
    defaultCdrRequestDates:()=>{},updateCdrRequestCount:()=>{},
    requestIdentifier:x=>x,contactTitle:x=>x,contactLabel:x=>x,contactTag:x=>state.contactTags[x]||'',contactName:()=>'',serviceSenderType:()=>'',escAttr:String,escapeHtml:String,fmtInt:String,fmtDur:String,
    dtFmt:d=>d instanceof Date&&!Number.isNaN(+d)?d.toISOString():'',
    showStatus:(...a)=>actions.push(a),audit:()=>{},persistLocal:()=>{},download:(...a)=>actions.push(a),localDateKey:d=>d.toISOString().slice(0,10),
    simpleTable:(headers,rows)=>JSON.stringify([headers,rows]),
    aggregateLocations:()=>[]
  });
  contact.bind();
  return {contact,elements,state,actions};
}

test('integrated Contacts render respects filtered/history scope while historical First predates active period',()=>{
  const h=create();h.contact.render();
  assert.match(h.elements.contactsTable.innerHTML,/First Incoming/);
  assert.match(h.elements.contactsTable.innerHTML,/First Outgoing/);
  assert.match(h.elements.contactsTable.innerHTML,/Last Event \(All\)/);
  assert.match(h.elements.contactsTable.innerHTML,/2026-01-02T11:30:00.000Z/);
  assert.match(h.elements.contactsTable.innerHTML,/2026-05-03T09:00:00.000Z/);
  assert.match(h.elements.contactsTable.innerHTML,/Compare subjects \(2\)/);
  const before=h.elements.contactsTable.innerHTML;
  assert.ok(before.includes('data-num="9000000011"'));
  h.elements.contactsDataScope.value='history';h.contact.render();
  assert.ok(h.elements.contactsTable.innerHTML.includes('data-num="9000000022"'));
  h.elements.contactsSearch.value='SOURCE-A';h.contact.render();
  assert.ok(h.elements.contactsTable.innerHTML.includes('data-num="9000000022"'));
});

test('integrated Contacts bulk shortlist and selection preserve the original copy/CDR state',()=>{
  const h=create();h.contact.render();h.elements.contactsSelectVisible.click();
  assert.deepEqual([...h.state.requestSelected],['9000000011','9000000022']);
  h.elements.contactsShortlistAdd.click();
  assert.equal(h.state.contactShortlist.size,2);
  h.elements.contactsBulkTag.value='Witness';h.elements.contactsBulkTagApply.click();
  assert.equal(h.state.contactTags['9000000011'],'Witness');
  h.elements.contactsExportSelected.click();
  assert.ok(h.actions.some(x=>x[0]==='cdr_selected_contacts.csv'));
  h.elements.contactsShortlistRemove.click();
  assert.equal(h.state.contactShortlist.size,0);
  assert.equal(h.state.requestSelected.size,2,'selected contacts are preserved for Copy and CDR request');
});
