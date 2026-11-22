/* Offline readiness for public Group IV mock practice.
   All question banks are pre-cached by the versioned public exam service worker.
   No answers or private case information are transmitted. */
(function(){
'use strict';
const label=document.getElementById('offlineStatus');
if(!label)return;
function status(message){label.textContent=message}
if(!('serviceWorker' in navigator)||!('caches' in window)||!window.isSecureContext){
 status('Online required on this browser. Saved answers still stay on this device.');
 return;
}
const path=location.pathname;
const match=path.match(/\/tnpsc\/mocks\/mock-([1-4])\.html$/);
const full=/\/tnpsc\/mocks\/full-mock-1\.html$/.test(path);
const required=full?[
 '/tnpsc/mocks/full-mock-1.html',
 '/assets/js/group4-full-mock.js',
 '/data/quizzes/tnpsc-group4-full-mock-1.json'
]:match?[
 '/tnpsc/mocks/mock-'+match[1]+'.html',
 '/assets/js/group4-short-mock.js',
 '/data/quizzes/tnpsc-group4-mock-'+match[1]+'.json'
]:[
 '/tnpsc/mocks/index.html',
 '/tnpsc/mocks/full-mock-1.html',
 '/data/quizzes/tnpsc-group4-full-mock-1.json'
];
required.push('/assets/js/mock-offline.js');
navigator.serviceWorker.register('/service-worker.js',{scope:'/'})
 .then(()=>navigator.serviceWorker.ready)
 .then(async()=>{
   const entries=await Promise.all(required.map(path=>caches.match(path)));
   if(entries.every(Boolean)){
     status('Offline-ready on this device. Open the saved mock without internet; the original timer keeps running.');
   }else{
     status('Offline files are still being prepared. Keep internet available until the offline-ready message appears.');
   }
 })
 .catch(()=>{
   status('Offline installation is unavailable in this browser. You can continue online; answers still save locally.');
 });
})();
