import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const tracker=fs.readFileSync('assets/js/group4-diagnostic-analytics.js','utf8');
const home=fs.readFileSync('index.html','utf8');
const landing=fs.readFileSync('group4-diagnostic.html','utf8');
const practice=fs.readFileSync('assets/js/pyq-original-paper.js','utf8');
assert.match(home,/id="diagnosticHomeCTA" href="group4-diagnostic.html"/);
assert.match(landing,/id="beginDiagnostic" href="pyq-original-paper.html\?paper=tnpsc-group-iv-2024-general-tamil-general-studies&amp;diagnostic=group4"/);
assert.match(practice,/renderDiagnosticInsights\(grade\)/);
assert.match(practice,/analytics\.complete\(/);
let now=1700000000000;
class TestDate extends Date{static now(){return now}}
const local=new Map(),events=[];
const store=map=>({getItem:key=>map.get(key)??null,setItem:(key,value)=>map.set(key,String(value)),removeItem:key=>map.delete(key)});
function open(path,session,analyticsEnabled=true){
  const win={addEventListener:()=>{}};
  if(analyticsEnabled)win.gtag=(type,name,params)=>events.push({type,name,params});
  const query=path.includes('pyq-original-paper')?'?diagnostic=group4':'';
  vm.runInNewContext(tracker,{window:win,localStorage:store(local),sessionStorage:store(session),
    location:{pathname:path,search:query},Date:TestDate,URLSearchParams,Math});
  return win.ceGroup4Diagnostic;
}
const session1=new Map();
let api=open('/group4-diagnostic.html',session1);
api.start('diagnostic_landing',true);
assert.equal(events.length,0,'landing navigation must not prematurely count a started test');
api=open('/pyq-original-paper.html',session1);
assert.equal(events.filter(e=>e.name==='g4_diagnostic_start').length,1);
api.complete({answered:170,graded:196,correct:120,accuracy:61,autoSubmit:false});
api.complete({answered:170,graded:196,correct:120,accuracy:61,autoSubmit:false});
assert.equal(events.filter(e=>e.name==='g4_diagnostic_complete').length,1,'submissions deduplicate');
now+=31*60*1000;
const session2=new Map();
open('/index.html',session2);
open('/index.html',session2);
assert.equal(events.filter(e=>e.name==='g4_diagnostic_return_7d').length,1,'one returning candidate');
const session3=new Map();
now+=8*86400000;
open('/index.html',session3);
assert.equal(events.filter(e=>e.name==='g4_diagnostic_return_7d').length,1,'no late extra return');
console.log('Group IV diagnostic launch and retention smoke checks passed');
