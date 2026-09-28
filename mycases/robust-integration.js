/* My Cases Robust Integration Layer
   Phase 1 + Phase 2 bridge
   Loaded after sync-engine.js and audit-engine.js
*/
(function(global){
  function snapshotCase(c){
    return JSON.parse(JSON.stringify(c||{}));
  }

  function compareCaseChanges(oldCase,newCase){
    const changes=[];
    const keys=new Set([...Object.keys(oldCase||{}),...Object.keys(newCase||{})]);
    keys.forEach(key=>{
      const oldValue=JSON.stringify((oldCase||{})[key]??'');
      const newValue=JSON.stringify((newCase||{})[key]??'');
      if(oldValue!==newValue){
        changes.push({
          field:key,
          oldValue:(oldCase||{})[key]??'',
          newValue:(newCase||{})[key]??''
        });
      }
    });
    return changes;
  }

  function recordCaseUpdate(oldCase,newCase){
    if(!global.MyCasesAudit)return [];
    const changes=compareCaseChanges(oldCase,newCase);
    changes.forEach(c=>{
      global.MyCasesAudit.addEntry({
        caseId:newCase.id,
        action:'UPDATE',
        field:c.field,
        oldValue:c.oldValue,
        newValue:c.newValue
      });
    });
    return changes;
  }

  function queueCaseSync(c,action){
    if(!global.MyCasesSync)return null;
    return global.MyCasesSync.addSyncTask(c.id,action,snapshotCase(c));
  }

  global.MyCasesRobust={
    compareCaseChanges,
    recordCaseUpdate,
    queueCaseSync,
    snapshotCase
  };
})(window);
