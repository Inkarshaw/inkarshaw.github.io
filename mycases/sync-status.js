/* My Cases Sync Status UI helper */
(function(global){
  function getStatus(){
    const pending=global.MyCasesSync?global.MyCasesSync.pendingCount():0;
    const last=global.MyCasesSync?global.MyCasesSync.lastSync():'';
    return {pending,last};
  }
  function renderSyncStatus(targetId){
    const el=document.getElementById(targetId);
    if(!el)return;
    const s=getStatus();
    el.textContent=s.pending?
      '⚠ '+s.pending+' pending sync change'+(s.pending>1?'s':''):
      '☁ Synced'+(s.last?' · '+new Date(s.last).toLocaleString():'');
  }
  global.MyCasesSyncUI={renderSyncStatus,getStatus};
})(window);
