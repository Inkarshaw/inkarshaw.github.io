import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

// Simulate a service worker controlling the public exam site, with an older
// cached quiz bank and the option to lose the network between requests.
const source=readFileSync(new URL('../service-worker.js',import.meta.url),'utf8');
const listeners={},saved=new Map(),calls=[];
let online=true,status=200;
const origin='https://clearexams.ink';
const response=(value,code=200)=>({value,status:code,ok:code>=200&&code<300,
  clone(){return response(value,code)}});
const key=request=>typeof request==='string'?new URL(request,origin).href:request.url;
const cache={
  add:async()=>{},
  put:async(request,body)=>{saved.set(key(request),body)},
};
const caches={
  open:async()=>cache,
  match:async(request)=>saved.get(key(request)),
  keys:async()=>[],
  delete:async()=>true,
};
const globals={
  self:{addEventListener:(type,fn)=>{listeners[type]=fn},skipWaiting(){},
    clients:{claim(){}}},
  location:{origin},
  caches,URL,Response:{error:()=>response('network-unavailable',0)},
  fetch:async(request,options={})=>{
    calls.push({url:key(request),options});
    if(!online)throw Error('offline');
    return response('network:'+key(request),status);
  },
};
vm.runInNewContext(source,globals,{filename:'service-worker.js'});
assert.equal(typeof listeners.fetch,'function','Service worker must handle fetch');

async function request(path,{mode='cors',initial=null}={}){
  const url=origin+path;
  if(initial)saved.set(url,response(initial));
  const tasks=[];let answer=null;let intercepted=false;
  const event={
    request:{url,method:'GET',mode},
    respondWith(p){intercepted=true;answer=p},
    waitUntil(p){tasks.push(p)},
  };
  listeners.fetch(event);
  if(!intercepted)return {intercepted:false};
  const result=await answer;
  await Promise.all(tasks);
  return {intercepted:true,result};
}

for(const path of [
  '/data/ncert/quiz-bank.json',
  '/data/quizzes/daily-quiz.csv',
  '/data/quizzes/verified-pyqs.json',
  '/data/exams/exam-notifications.json',
  '/data/textbook/class-11/history/unit-04.json',
  '/data/special-quizzes/firsts.json',
  '/current-affairs/text/editions.json',
  '/current-affairs/text/2026-10-26.html',
  '/assets/js/ncert-school-book-quiz.js',
  '/assets/css/exam-pages.css',
]){
  online=true;status=200;
  const fresh=await request(path,{initial:'old-cache'});
  assert.equal(fresh.result.value,'network:'+origin+path,
    path+' should not return the old cache on the first online visit');
  assert.equal(calls.at(-1).options.cache,'no-store',path+' should bypass browser HTTP cache');
  assert.equal(saved.get(origin+path).value,'network:'+origin+path,
    path+' must save verified network content for offline use');

  online=false;
  const offline=await request(path);
  assert.equal(offline.result.value,'network:'+origin+path,
    path+' must use last verified copy while offline');
}

online=true;status=503;
const outage=await request('/data/ncert/quiz-bank.json');
assert.equal(outage.result.value,'network:'+origin+'/data/ncert/quiz-bank.json',
  '5xx server problems should fall back to a saved public quiz bank');
status=404;
const missing=await request('/data/ncert/quiz-bank.json');
assert.equal(missing.result.status,404,'404 must not silently display a replaced or deleted question bank');

for(const privatePath of ['/mycases/?crime=42','/policedocuments/?name=private']){
  const privateResult=await request(privatePath);
  assert.equal(privateResult.intercepted,false,'Private case/document pages must bypass public cache');
}
const pdf=await request('/current-affairs/2026-09-21.pdf');
assert.equal(pdf.intercepted,false,'PDFs are not cached by the shell');
assert.match(source,/clearexams-shell-v8-fresh-content/);
console.log('PASS: fresh public quiz data and assets, offline fallback, 5xx/404 handling and private-page exclusion');
