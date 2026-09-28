/* My Cases Sync Engine v1
   Local-first sync queue foundation.
*/
(function(global){
  const QUEUE_KEY='myCasesSyncQueueV1';
  const LAST_SYNC_KEY='myCasesLastSyncV1';

  function readQueue(){
    try{return JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]')}catch(e){return []}
  }
  function saveQueue(queue){
    localStorage.setItem(QUEUE_KEY,JSON.stringify(queue));
  }
  function addSyncTask(caseId,action,payload){
    const queue=readQueue();
    queue.push({
      id:'sync_'+Date.now()+'_'+Math.random().toString(36).slice(2,8),
      caseId,
      action,
      payload,
      createdAt:new Date().toISOString(),
      retryCount:0,
      status:'PENDING'
    });
    saveQueue(queue);
    return queue[queue.length-1];
  }
  function pendingCount(){
    return readQueue().filter(x=>x.status!=='SYNCED').length;
  }
  function markSynced(id){
    const queue=readQueue().map(x=>x.id===id?{...x,status:'SYNCED',syncedAt:new Date().toISOString()}:x);
    saveQueue(queue);
    localStorage.setItem(LAST_SYNC_KEY,new Date().toISOString());
  }
  function markFailed(id,error){
    const queue=readQueue().map(x=>x.id===id?{...x,status:'FAILED',retryCount:(x.retryCount||0)+1,error}:x);
    saveQueue(queue);
  }
  function clearCompleted(){
    saveQueue(readQueue().filter(x=>x.status!=='SYNCED'));
  }
  global.MyCasesSync={
    addSyncTask,
    pendingCount,
    markSynced,
    markFailed,
    clearCompleted,
    getQueue:readQueue,
    lastSync:()=>localStorage.getItem(LAST_SYNC_KEY)||''
  };
})(window);
