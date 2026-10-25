import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const contactsScript=readFileSync(new URL('../cdranalysis/js/contacts.js',import.meta.url),'utf8');
const date=value=>value?new Date(value):null;
const makeRow=(key,records,last)=>({
  key,bparty:key,records,last:date(last),calls:records,in:0,out:records,sms:0,duration:10,
  towers:new Set(),providers:new Set(),cdrs:new Set()
});
function harness(){
  const rows=[
    makeRow('9000000001',10,'2026-11-01T09:00:00Z'),
    makeRow('9000000002',8,'2026-08-20T10:00:00Z'),
    makeRow('9000000003',6,null),
    makeRow('9000000004',2,'2026-10-05T08:00:00Z')
  ];
  const history=[
    {key:'9000000001',first:date('2026-01-12T09:00:00Z')},
    {key:'9000000002',first:date('2025-11-20T10:00:00Z')},
    {key:'9000000004',first:date('2026-07-05T08:00:00Z')}
  ];
  const table={innerHTML:'',addEventListener(name,callback){this[name]=callback;}};
  const select={value:'records_desc',addEventListener(name,callback){this[name]=callback;}};
  const inputs={contactsTable:table,contactsSort:select,identityScope:{value:'case'}};
  const state={requestSelected:new Set(['9000000004']),filtered:[{test:'current filtered unchanged'}]};
  const window={};
  runInNewContext(contactsScript,{window},{filename:'contacts.js'});
  const module=window.CDRContactsFactory({
    $:id=>inputs[id],
    state,
    aggregateContacts:raw=>raw===undefined?rows:history,
    recordsIgnoringDateTimeFilters:()=>[{callType:'Outgoing Call'}],
    identityStore:()=>({}),
    defaultCdrRequestDates:()=>{},
    updateCdrRequestCount:()=>{},
    requestIdentifier:x=>x,
    escAttr:String,escapeHtml:String,contactTitle:String,contactLabel:String,
    contactTag:()=>'',contactName:()=>'',serviceSenderType:()=>'',fmtInt:String,fmtDur:String,
    dtFmt:d=>d instanceof Date?d.toISOString():'',
    showStatus:()=>{}
  });
  module.bind();
  const displayed=()=>[...table.innerHTML.matchAll(/class="link contact-filter" data-num="([^"]+)"/g)].map(m=>m[1]);
  const choose=value=>{select.value=value;select.change({target:select});};
  const clickHeader=field=>table.click({target:{closest:s=>s==='.contact-date-sort'?{dataset:{sort:field}}:null}});
  return {module,rows,history,table,select,state,displayed,choose,clickHeader};
}
const A='9000000001',B='9000000002',C='9000000003',D='9000000004';

test('default Contacts order remains highest number of records',()=>{
  const h=harness();
  h.module.render();
  assert.deepEqual(h.displayed(),[A,B,C,D]);
  assert.equal(h.select.value,'records_desc');
});

test('First asc sorts by historical call timestamps, not by filtered First/Last',()=>{
  const h=harness();h.choose('first_asc');
  assert.deepEqual(h.displayed(),[B,A,D,C]);
  assert.match(h.table.innerHTML,/aria-sort="ascending" title="Earliest voice call/);
  assert.match(h.table.innerHTML,/First ▲/);
  assert.match(h.table.innerHTML,/2025-11-20T10:00:00.000Z/);
});

test('First descending order keeps contacts without calls last',()=>{
  const h=harness();h.choose('first_desc');
  assert.deepEqual(h.displayed(),[D,A,B,C]);
  assert.match(h.table.innerHTML,/First ▼/);
});

test('Last supports oldest and newest orders, always placing empty dates last',()=>{
  const h=harness();h.choose('last_asc');
  assert.deepEqual(h.displayed(),[B,D,A,C]);
  assert.match(h.table.innerHTML,/aria-sort="ascending" title="Last record within current filters"/);
  h.choose('last_desc');
  assert.deepEqual(h.displayed(),[A,D,B,C]);
  assert.match(h.table.innerHTML,/Last ▼/);
});

test('clicking either table heading toggles sorting direction',()=>{
  const h=harness();h.module.render();
  h.clickHeader('first');
  assert.equal(h.select.value,'first_asc');
  assert.deepEqual(h.displayed(),[B,A,D,C]);
  h.clickHeader('first');
  assert.equal(h.select.value,'first_desc');
  assert.deepEqual(h.displayed(),[D,A,B,C]);
  h.clickHeader('last');
  assert.equal(h.select.value,'last_asc');
  assert.deepEqual(h.displayed(),[B,D,A,C]);
});

test('sorting does not mutate source data, active filters, or checked contacts',()=>{
  const h=harness();const originalRows=h.rows.slice();const originalFiltered=h.state.filtered;
  h.choose('first_desc');h.choose('last_asc');h.module.render();
  assert.deepEqual(h.rows,originalRows);
  assert.strictEqual(h.state.filtered,originalFiltered);
  assert.equal(h.state.requestSelected.has(D),true);
  assert.match(h.table.innerHTML,/data-num="9000000004" checked/);
  assert.equal(h.select.value,'last_asc');
});

test('date sort controls are present and wired into CDR initialization',()=>{
  const html=readFileSync(new URL('../cdranalysis/index.html',import.meta.url),'utf8');
  const app=readFileSync(new URL('../cdranalysis/js/app.js',import.meta.url),'utf8');
  assert.match(html,/<select id="contactsSort"/);
  for(const mode of ['records_desc','first_asc','first_desc','last_asc','last_desc'])
    assert.match(html,new RegExp('value="'+mode+'"'));
  assert.match(app,/contactsModule\?\.bind\(\);/);
});
