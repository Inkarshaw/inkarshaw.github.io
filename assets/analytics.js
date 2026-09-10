(function(){
  'use strict';
  const ID='G-SS34PK7RL0';
  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){dataLayer.push(arguments)};
  if(!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')){
    const s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.appendChild(s);
    gtag('js',new Date());gtag('config',ID);
  }
  window.ceTrack=function(name,params){try{gtag('event',name,params||{})}catch(e){}};
  document.addEventListener('click',function(e){
    const a=e.target.closest('a'); if(!a)return;
    const href=a.getAttribute('href')||'', text=(a.textContent||'').trim().slice(0,100);
    if(/\.pdf(?:$|[?#])/i.test(href)) ceTrack('pdf_download',{file_name:href.split('/').pop().split('?')[0],link_text:text,page_path:location.pathname});
    if(/exam-notifications\.html/.test(location.pathname) && /^https?:\/\//.test(href)) ceTrack('notification_official_click',{link_text:text,link_url:href});
    if(/syllabus/.test(location.pathname) && (/\.pdf(?:$|[?#])/i.test(href)||/^https?:\/\//.test(href))) ceTrack('syllabus_resource_open',{link_text:text,link_url:href});
    if(/exam-preparation\.html/.test(href)||/^(upsc|tnpsc|tnusrb)\.html/.test(href)) ceTrack('exam_selection',{link_text:text,link_url:href});
  });
  document.addEventListener('change',function(e){
    if(e.target && e.target.id==='categoryFilter') ceTrack('notification_category_selected',{category:e.target.value});
    if(e.target && e.target.id==='topicSelect') ceTrack('quiz_subject_selected',{subject:e.target.value});
  });
})();
