// Content and executable assets are network-first to avoid stale exam questions after a release.
const CACHE='clearexams-shell-v8-fresh-content';
const CORE=['/','/index.html','/start.html','/404.html','/daily-quiz.html','/current-affairs/','/exam-calendar.html','/exam-notifications.html','/pyq-hub.html','/dashboard.html','/search.html','/study-plan-30.html','/answer-writing.html','/exam-preparation.html','/exam-posts.html','/current-affairs/compilations.html','/syllabus.html','/tnpsc.html','/tnusrb.html','/upsc.html','/assets/css/exam-pages.css','/assets/js/pwa.js','/assets/clearexams-icon.svg','/manifest.webmanifest','/data/quizzes/daily-quiz.csv','/data/exams/exam-notifications.json','/current-affairs/text/','/current-affairs/text/editions.json'];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(async cache=>{
    for(const url of CORE){try{await cache.add(url)}catch{}}
  }));
  self.skipWaiting();
});
self.addEventListener('activate',event=>{
  event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();
});

function cacheGood(event,request,response){
  if(!response||!response.ok)return;
  const copy=response.clone();
  // A service worker can stop as soon as respondWith() settles. Keep writes alive.
  event.waitUntil(caches.open(CACHE).then(cache=>cache.put(request,copy)).catch(()=>{}));
}
function offlineFallback(request){
  return caches.match(request).then(cached=>cached||Response.error());
}
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  if(url.origin!==location.origin)return;
  // Never persist private police/case pages or their query strings in the public exam cache.
  if(url.pathname.startsWith('/mycases/')||url.pathname.startsWith('/policedocuments/'))return;
  if(url.pathname.endsWith('.pdf'))return;

  // Current-affairs editions and textbook JSON change without changing URL.
  // All public exam JSON/CSV, JS, and CSS should be fresh on the first online visit.
  // A request-level cache:'no-store' must not be overridden by the service worker.
  const freshData=(url.pathname.startsWith('/current-affairs/text/')||
    (url.pathname.startsWith('/data/textbook/')&&url.pathname.endsWith('.json'))||
    (url.pathname.startsWith('/data/')&&/\.(json|csv)$/i.test(url.pathname))||
    (url.pathname.startsWith('/assets/')&&/\.(js|css)$/i.test(url.pathname)));
  if(freshData){
    event.respondWith(fetch(event.request,{cache:'no-store'}).then(async response=>{
      if(response&&response.ok){cacheGood(event,event.request,response);return response}
      if(response&&response.status>=500){const cached=await caches.match(event.request);return cached||response}
      return response
    }).catch(()=>offlineFallback(event.request)));
    return;
  }

  const isPage=event.request.mode==='navigate';
  if(isPage){
    event.respondWith(fetch(event.request).then(response=>{
      cacheGood(event,event.request,response);return response
    }).catch(async()=>await caches.match(event.request)||await caches.match('/start.html')||await caches.match('/index.html')||Response.error()));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>{
    if(cached)return cached;
    return fetch(event.request).then(response=>{
      cacheGood(event,event.request,response);return response
    }).catch(()=>Response.error());
  }));
});