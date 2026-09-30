const CACHE='cdr-analyzer-v54';
const CORE=[
  '/cdranalysis/',
  '/cdranalysis/index.html',
  '/cdranalysis/vendor/xlsx.full.min.js',
  '/cdranalysis/vendor/chart.umd.js',
  '/cdranalysis/vendor/leaflet.css',
  '/cdranalysis/vendor/leaflet.js',
  '/cdranalysis/vendor/leaflet-heat.js',
  '/cdranalysis/cdr-parser-worker.js',
  '/cdranalysis/css/cdr-components.css',
  '/cdranalysis/css/nexus-ui.css',
  '/cdranalysis/js/core.js',
  '/cdranalysis/js/identity.js',
  '/cdranalysis/js/parser.js',
  '/cdranalysis/js/filters.js',
  '/cdranalysis/js/dashboard.js',
  '/cdranalysis/js/records.js',
  '/cdranalysis/js/excelview.js',
  '/cdranalysis/js/contacts.js',
  '/cdranalysis/js/locations.js',
  '/cdranalysis/js/devices.js',
  '/cdranalysis/js/movement.js',
  '/cdranalysis/js/network.js',
  '/cdranalysis/js/analysis.js',
  '/cdranalysis/js/reports.js',
  '/cdranalysis/js/workspace.js',
  '/cdranalysis/js/case.js',
  '/cdranalysis/js/router.js',
  '/cdranalysis/js/diagnostics.js',
  '/cdranalysis/js/ui.js',
  '/cdranalysis/js/app.js',
  '/cdranalysis/js/relationship.js',
  '/cdranalysis/js/investigation-leads.js'
];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{
  if(event.request.method!=='GET')return;
  const url=new URL(event.request.url);
  const isNavigation=event.request.mode==='navigate'||(url.origin===location.origin&&url.pathname.startsWith('/cdranalysis'));
  if(isNavigation){
    event.respondWith(fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request).then(r=>r||caches.match('/cdranalysis/index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;})));
});
self.addEventListener('message',event=>{if(event.data&&event.data.type==='SKIP_WAITING')self.skipWaiting();if(event.data&&event.data.type==='GET_VERSION')event.source?.postMessage?.({type:'CDR_VERSION',version:CACHE});});
