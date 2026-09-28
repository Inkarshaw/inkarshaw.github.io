/* My Cases Audit Engine v1 */
(function(global){
  const KEY='myCasesAuditLogV1';

  function getLogs(){
    try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}
  }

  function addEntry(caseId,action,field,oldValue,newValue){
    const logs=getLogs();
    logs.unshift({
      id:'audit_'+Date.now(),
      caseId,
      action,
      field,
      oldValue:oldValue??'',
      newValue:newValue??'',
      createdAt:new Date().toISOString()
    });
    localStorage.setItem(KEY,JSON.stringify(logs.slice(0,2000)));
    return logs[0];
  }

  function getCaseHistory(caseId){
    return getLogs().filter(x=>String(x.caseId)===String(caseId));
  }

  global.MyCasesAudit={
    addEntry,
    getCaseHistory,
    getAll:getLogs
  };
})(window);
