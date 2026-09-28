/* My Cases Robust Layer Loader
   Loads reliability modules without changing existing workflow.
*/
(function(){
  const files=[
    'sync-engine.js',
    'audit-engine.js',
    'robust-integration.js',
    'case-history-ui.js'
  ];
  const base='/mycases/';
  files.forEach(function(file){
    if(document.querySelector('script[data-my-cases-module="'+file+'"]')) return;
    const s=document.createElement('script');
    s.src=base+file;
    s.async=false;
    s.dataset.myCasesModule=file;
    document.head.appendChild(s);
  });
})();
