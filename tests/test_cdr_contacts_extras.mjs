import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const read=name=>readFileSync(new URL('../cdranalysis/js/'+name+'.js',import.meta.url),'utf8');
const mk=(party,subject,type,dt)=>({bparty:party,bpartyKey:party,cdrNo:subject,callType:type,dt:new Date(dt),duration:40});
const key=x=>String(x??'').replace(/[^0-9]/g,'');
const records=[
  mk('9000000001','SUB-A','SMS','2026-01-01T09:00:00Z'),
  mk('9000000001','SUB-A','Outgoing Call','2026-01-05T10:00:00Z'),
  mk('9000000001','SUB-B','Incoming Call','2026-02-05T11:00:00Z'),
  mk('9000000002','SUB-A','Incoming Call','2026-02-06T12:00:00Z'),
  mk('9000000003','SUB-C','Data Call','2026-02-07T12:00:00Z')
];
const window={};
runInNewContext(read('contacts-insights'),{window,Date});
runInNewContext(read('contacts-extras'),{window,Date});
const core=window.CDRContactsInsights;

function harness(){
  const inputs={};
  const elt=(value='')=>({value,checked:false,innerHTML:'',textContent:'',listeners:{},addEventListener(type,fn){this.listeners[type]=fn;},click(){this.listeners.click?.({target:this});}});
  for(const id of ['contactsSearch','contactsMinCalls','contactsTagFilter','contactsSharedOnly','contactsShortlistOnly','contactsDataScope','contactsBulkTag','contactsShowingCount','contactsSelectVisible','contactsBulkTagApply','contactsShortlistAdd','contactsShortlistRemove','contactsExportSelected','contactsTable','contactsComparisonPanel','identityScope'])
    inputs[id]=elt();
  inputs.contactsDataScope.value='filtered';inputs.contactsMinCalls.value='0';inputs.identityScope.value='case';
  const saved=[],downloads=[],messages=[],caseTags={},globalTags={},state={requestSelected:new Set(),contactShortlist:new Set(),filtered:records.slice(1),globalContactTags:globalTags,contactTags:caseTags};
  const aggregate=data=>{
    const m=new Map();
    for(const r of data){
      let c=m.get(r.bpartyKey);
      if(!c){c={key:r.bpartyKey,bparty:r.bparty,records:0,calls:0,aliases:new Set()};m.set(r.bpartyKey,c);}
      c.records++;if(core.direction(r))c.calls++;c.aliases.add(r.bparty);
    }
    return [...m.values()];
  };
  let rendered=0;
  const extras=window.CDRContactsExtras({
    $:id=>inputs[id],state,aggregateContacts:aggregate,analysisRecords:()=>records,
    recordsIgnoringDateTimeFilters:()=>records,phoneKey:key,
    contactName:n=>n==='9000000001'?'Test Person':'',
    contactLabel:n=>n==='9000000001'?'Test Person':n,
    contactTag:n=>caseTags[n]||globalTags[n]||'',requestIdentifier:key,
    identityStore:()=>inputs.identityScope.value==='global'?globalTags:caseTags,
    persistLocal:(k,v)=>saved.push([k,v]),download:(...a)=>downloads.push(a),
    dtFmt:d=>d instanceof Date&&!Number.isNaN(+d)?d.toISOString():'',
    escapeHtml:x=>String(x).replace(/</g,'&lt;'),escAttr:String,fmtInt:String,
    showStatus:(message,kind)=>messages.push([message,kind]),audit:()=>{},
    localDateKey:d=>d.toISOString().slice(0,10),
    simpleTable:(head,rows)=>JSON.stringify([head,rows]),
    render:()=>{rendered++;}
  });
  return {extras,inputs,saved,downloads,messages,caseTags,globalTags,state,get rendered(){return rendered;}};
}

test('historical chronology separates SMS, first incoming, first outgoing and last voice call',()=>{
  const summary=core.build(records,key).get('9000000001');
  assert.equal(core.date(summary.firstCall).toISOString(),'2026-01-05T10:00:00.000Z');
  assert.equal(core.date(summary.firstIncoming).toISOString(),'2026-02-05T11:00:00.000Z');
  assert.equal(core.date(summary.firstOutgoing).toISOString(),'2026-01-05T10:00:00.000Z');
  assert.equal(core.date(summary.lastCall).toISOString(),'2026-02-05T11:00:00.000Z');
  assert.equal(core.date(summary.lastEvent).toISOString(),'2026-02-05T11:00:00.000Z');
  assert.equal(summary.subjects.size,2);
  assert.equal(core.build(records,key).get('9000000003').firstCall,null);
});

test('search, tags, minimum calls, historical switch, shared and shortlist filters work together',()=>{
  const h=harness();
  assert.equal(h.extras.visibleRows().length,3);
  h.inputs.contactsSearch.value='test person';
  assert.deepEqual(h.extras.visibleRows().map(x=>x.key),['9000000001']);
  h.inputs.contactsSearch.value='';h.inputs.contactsMinCalls.value='2';
  assert.deepEqual(h.extras.visibleRows().map(x=>x.key),['9000000001']);
  h.inputs.contactsMinCalls.value='0';h.inputs.contactsSharedOnly.checked=true;
  assert.deepEqual(h.extras.visibleRows().map(x=>x.key),['9000000001']);
  h.inputs.contactsSharedOnly.checked=false;h.inputs.contactsDataScope.value='history';
  assert.equal(h.extras.visibleRows().length,3);
  h.caseTags['9000000002']='Witness';h.inputs.contactsTagFilter.value='Witness';
  assert.deepEqual(h.extras.visibleRows().map(x=>x.key),['9000000002']);
  h.inputs.contactsTagFilter.value='';h.inputs.contactsShortlistOnly.checked=true;
  assert.equal(h.extras.visibleRows().length,0);
  h.state.contactShortlist.add('9000000001');
  assert.deepEqual(h.extras.visibleRows().map(x=>x.key),['9000000001']);
});

test('bulk tagging respects current case/global identity scope without network calls',()=>{
  const h=harness();h.state.requestSelected.add('9000000001');
  h.inputs.contactsBulkTag.value='Suspect';h.extras.tagSelected();
  assert.equal(h.caseTags['9000000001'],'Suspect');assert.equal(h.saved.length,0);
  h.inputs.identityScope.value='global';h.inputs.contactsBulkTag.value='Witness';
  h.extras.tagSelected();
  assert.equal(h.globalTags['9000000001'],'Witness');
  assert.equal(h.saved[0][0],'cdrAnalyzer:globalContactTags');
  assert.equal(h.rendered,2);
});

test('selected contacts can be added/removed from shortlist and exported without upload',()=>{
  const h=harness();h.state.requestSelected.add('9000000001');h.extras.changeShortlist(true);
  assert.equal(h.state.contactShortlist.has('9000000001'),true);
  h.extras.exportSelected();
  assert.equal(h.downloads.length,1);
  assert.equal(h.downloads[0][0],'cdr_selected_contacts.csv');
  assert.match(h.downloads[0][1],/Test Person/);
  assert.match(h.downloads[0][1],/SUB-A; SUB-B/);
  h.extras.changeShortlist(false);
  assert.equal(h.state.contactShortlist.size,0);
});

test('CSV quoting escapes formula injection, quotes, commas and line breaks',()=>{
  const csv=core.csv(['Number','Name'],[['9000000001','=HYPERLINK("bad","x"),foo'],['9000000002','Line\nBreak']]);
  assert.match(csv,/"'=HYPERLINK\(""bad"",""x""\),foo"/);
  assert.match(csv,/"Line\nBreak"/);
  assert.match(csv,/\r\n$/);
});

test('per-subject comparison and chronological timeline preserve informative totals',()=>{
  const h=harness();
  assert.equal(h.extras.commonCount('9000000001'),2);
  h.extras.comparison('9000000001');
  assert.match(h.inputs.contactsComparisonPanel.innerHTML,/SUB-A/);
  assert.match(h.inputs.contactsComparisonPanel.innerHTML,/SUB-B/);
  const timeline=core.timeline(records,'9000000001',key,d=>d.toISOString().slice(0,10));
  assert.equal(timeline.voiceCalls,2);
  assert.equal(timeline.days.length,3);
  assert.ok(timeline.largestGapDays>30);
  const html=h.extras.timelineFor('9000000001');
  assert.match(html,/Call dates and communication timeline/);
  assert.match(html,/incomplete CDR coverage/);
});

test('all new controls and workspace shortlist save/restore wiring are present',()=>{
  const html=readFileSync(new URL('../cdranalysis/index.html',import.meta.url),'utf8');
  const workspace=read('workspace');
  for(const id of ['contactsSearch','contactsTagFilter','contactsMinCalls','contactsSharedOnly','contactsShortlistOnly','contactsDataScope','contactsExportSelected','contactsBulkTagApply','contactsShortlistAdd','contactsShortlistRemove','contactsComparisonPanel'])
    assert.match(html,new RegExp('id="'+id+'"'));
  assert.match(workspace,/contactShortlist:\[\.\.\.\(state\.contactShortlist/);
  assert.match(workspace,/state\.contactShortlist=new Set\(Array\.isArray\(w\.contactShortlist\)/);
  assert.match(html,/contacts-insights\.js/);
  assert.match(html,/contacts-extras\.js/);
});
