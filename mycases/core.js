/* ClearExams My Cases v2 core
   Single source of truth for local storage, cloud sync, migration and navigation handoff.
*/
(function(global){
  'use strict';

  const API_BASE='https://cdr-pdf-bot-production.up.railway.app';
  const INDEX_KEY='clearexamsMyCasesV2Index';
  const CASE_PREFIX='clearexamsMyCaseV2:';
  const SYNC_KEY='clearexamsMyCasesV2SyncQueue';
  const LAST_SYNC_KEY='clearexamsMyCasesV2LastSync';
  const CURRENT_CASE_KEY='clearexamsCurrentCaseV2';
  const OLD_CASES_KEY='clearexamsMyCasesV1';
  const OLD_DELETED_KEY='clearexamsMyCasesDeletedV1';
  const TOKEN_KEY='clearexamsMyCasesCloudTokenV1';
  const TOKEN_COOKIE='clearexamsMyCasesCloudTokenV1';

  const CLOUD_FIELDS=[
    'id','policeStation','caseType','crimeNo','crimeYear','dateOccurrence','dateRegistration',
    'sceneOfCrime','sections','complainant','accused','ioName','priority','court','courtCaseNo',
    'stage','nextHearing','nextAction','notes','createdAt','updatedAt','accusedPersons',
    'investigationChecklist','tasks','hearings','timeline','attachments','courtComplex',
    'courtCaseType','accusedPresentDetails','nbwStatus','fsStatus','finalResult'
  ];

  const clone=v=>JSON.parse(JSON.stringify(v??null));
  const now=()=>new Date().toISOString();
  const uid=()=> 'case_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8);

  function parse(text,fallback){
    try{return JSON.parse(text)}catch(e){return fallback}
  }
  function emit(type,detail={}){
    try{global.dispatchEvent(new CustomEvent(type,{detail}))}catch(e){}
  }
  function caseKey(id){return CASE_PREFIX+String(id)}
  function readIndex(){
    let local=[],session=[];
    try{const v=parse(localStorage.getItem(INDEX_KEY)||'[]',[]);local=Array.isArray(v)?v:[]}catch(e){}
    try{const v=parse(sessionStorage.getItem(INDEX_KEY)||'[]',[]);session=Array.isArray(v)?v:[]}catch(e){}
    return [...new Set([...local,...session].filter(Boolean).map(String))];
  }
  function writeIndex(ids){
    const clean=[...new Set((ids||[]).filter(Boolean).map(String))];
    const text=JSON.stringify(clean);
    try{localStorage.setItem(INDEX_KEY,text)}catch(e){}
    try{sessionStorage.setItem(INDEX_KEY,text)}catch(e){}
    return clean;
  }
  function localAssets(base,local){
    const out={...(base||{})};
    if(!local)return out;
    if(local.accusedPhoto)out.accusedPhoto=local.accusedPhoto;
    const localAcc=new Map((Array.isArray(local.accusedPersons)?local.accusedPersons:[]).map(x=>[String(x.id||''),x]));
    if(Array.isArray(out.accusedPersons)){
      out.accusedPersons=out.accusedPersons.map(p=>({...p,photo:localAcc.get(String(p.id||''))?.photo||p.photo||''}));
    }
    const localFiles=new Map((Array.isArray(local.attachments)?local.attachments:[]).map(x=>[String(x.id||''),x]));
    if(Array.isArray(out.attachments)){
      out.attachments=out.attachments.map(a=>({...a,data:localFiles.get(String(a.id||''))?.data||a.data||''}));
    }
    return out;
  }
  function compactCase(item){
    const safe=clone(item||{});
    delete safe.accusedPhoto;
    if(Array.isArray(safe.accusedPersons))safe.accusedPersons.forEach(p=>delete p.photo);
    if(Array.isArray(safe.attachments))safe.attachments.forEach(a=>delete a.data);
    return safe;
  }
  function normalizeCase(item){
    const c={...(item||{})};
    c.id=String(c.id||uid());
    c.createdAt=c.createdAt||now();
    c.updatedAt=c.updatedAt||c.createdAt;
    ['accusedPersons','investigationChecklist','tasks','hearings','timeline','attachments'].forEach(k=>{
      if(!Array.isArray(c[k]))c[k]=[];
    });
    if(!c.priority)c.priority='Medium';
    if(!c.stage)c.stage='Investigation';
    return c;
  }
  function getCase(id){
    if(!id)return null;
    let c=parse(localStorage.getItem(caseKey(id))||'null',null);
    if(!c){
      c=parse(sessionStorage.getItem(caseKey(id))||'null',null);
    }
    return c&&c.id?normalizeCase(c):null;
  }
  function setCaseRaw(item,{compactFallback=true}={}){
    const c=normalizeCase(item);
    let stored=false;
    try{
      localStorage.setItem(caseKey(c.id),JSON.stringify(c));
      stored=true;
    }catch(e){
      if(compactFallback){
        try{localStorage.setItem(caseKey(c.id),JSON.stringify(compactCase(c)));stored=true}catch(e2){}
      }
    }
    try{sessionStorage.setItem(caseKey(c.id),JSON.stringify(compactCase(c)))}catch(e){}
    const ids=readIndex();
    if(!ids.includes(c.id))writeIndex([c.id,...ids]);
    return stored;
  }
  function listCases({includeDeleted=false}={}){
    const out=[];
    readIndex().forEach(id=>{
      const c=getCase(id);
      if(!c)return;
      if(!includeDeleted&&c.deletedAt)return;
      out.push(c);
    });
    return out;
  }
  function deleteFromIndex(id){
    writeIndex(readIndex().filter(x=>String(x)!==String(id)));
    try{localStorage.removeItem(caseKey(id))}catch(e){}
    try{sessionStorage.removeItem(caseKey(id))}catch(e){}
  }
  function setHandoff(item){
    const safe=compactCase(normalizeCase(item));
    const serialized=JSON.stringify(safe);
    try{localStorage.setItem(CURRENT_CASE_KEY,serialized)}catch(e){}
    try{sessionStorage.setItem(CURRENT_CASE_KEY,serialized)}catch(e){}
    try{global.name='MYCASES_V2:'+encodeURIComponent(serialized)}catch(e){}
    return safe;
  }
  function getHandoff(){
    const candidates=[];
    try{const x=parse(localStorage.getItem(CURRENT_CASE_KEY)||'null',null);if(x&&x.id)candidates.push(x)}catch(e){}
    try{const x=parse(sessionStorage.getItem(CURRENT_CASE_KEY)||'null',null);if(x&&x.id)candidates.push(x)}catch(e){}
    try{
      const p='MYCASES_V2:';
      if(String(global.name||'').startsWith(p)){
        const x=parse(decodeURIComponent(String(global.name).slice(p.length)),null);
        if(x&&x.id)candidates.push(x);
      }
    }catch(e){}
    if(!candidates.length)return null;
    candidates.sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
    return normalizeCase(candidates[0]);
  }
  function mergeCase(local,remote){
    if(!local)return normalizeCase(remote||{});
    if(!remote)return normalizeCase(local||{});
    const useRemote=String(remote.updatedAt||'')>=String(local.updatedAt||'');
    const base=useRemote?remote:local;
    return normalizeCase(localAssets(base,local));
  }

  function readQueue(){
    let local=[],session=[];
    try{const q=parse(localStorage.getItem(SYNC_KEY)||'[]',[]);local=Array.isArray(q)?q:[]}catch(e){}
    try{const q=parse(sessionStorage.getItem(SYNC_KEY)||'[]',[]);session=Array.isArray(q)?q:[]}catch(e){}
    const source=local.length?local:session;
    return Array.isArray(source)?source:[];
  }
  function writeQueue(q){
    const text=JSON.stringify(q||[]);
    try{localStorage.setItem(SYNC_KEY,text)}catch(e){}
    try{sessionStorage.setItem(SYNC_KEY,text)}catch(e){}
    emit('mycases:sync',{pending:(q||[]).length,lastSync:lastSync()});
  }
  function enqueue(caseId,action,payload){
    const id=String(caseId||payload?.id||'');
    if(!id)return;
    let q=readQueue().filter(x=>String(x.caseId)!==id);
    q.push({id:'sync_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),caseId:id,action,payload:payload?compactCase(payload):null,createdAt:now(),attempts:0});
    writeQueue(q);
  }
  function pendingCount(){return readQueue().length}
  function lastSync(){
    try{return localStorage.getItem(LAST_SYNC_KEY)||sessionStorage.getItem(LAST_SYNC_KEY)||''}
    catch(e){try{return sessionStorage.getItem(LAST_SYNC_KEY)||''}catch(e2){return''}}
  }

  function cookieToken(){
    try{
      const prefix=TOKEN_COOKIE+'=';
      const part=document.cookie.split(';').map(x=>x.trim()).find(x=>x.startsWith(prefix));
      return part?decodeURIComponent(part.slice(prefix.length)):'';
    }catch(e){return ''}
  }
  function token(){
    let a='',b='';
    try{a=localStorage.getItem(TOKEN_KEY)||''}catch(e){}
    try{b=sessionStorage.getItem(TOKEN_KEY)||''}catch(e){}
    const t=a||b||cookieToken()||'';
    if(t)rememberToken(t);
    return t;
  }
  function rememberToken(t){
    if(!t)return;
    try{localStorage.setItem(TOKEN_KEY,t)}catch(e){}
    try{sessionStorage.setItem(TOKEN_KEY,t)}catch(e){}
    try{document.cookie=TOKEN_COOKIE+'='+encodeURIComponent(t)+'; Max-Age=604800; Path=/mycases; SameSite=Lax; Secure'}catch(e){}
  }
  function clearToken(){
    try{localStorage.removeItem(TOKEN_KEY)}catch(e){}
    try{sessionStorage.removeItem(TOKEN_KEY)}catch(e){}
    try{document.cookie=TOKEN_COOKIE+'=; Max-Age=0; Path=/mycases; SameSite=Lax; Secure'}catch(e){}
  }
  async function cloudFetch(path,options={}){
    const headers={...(options.headers||{})};
    if(options.body&&!headers['Content-Type'])headers['Content-Type']='application/json';
    const t=token();if(t)headers.Authorization='Bearer '+t;
    let res;
    try{res=await fetch(API_BASE+path,{...options,headers})}
    catch(cause){
      const e=new Error('Cloud connection unavailable');e.status=0;e.cause=cause;throw e;
    }
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      const e=new Error(data.error||('Cloud request failed ('+res.status+')'));e.status=res.status;e.data=data;throw e;
    }
    return data;
  }
  async function login(password){
    const data=await cloudFetch('/api/login',{method:'POST',body:JSON.stringify({password:String(password||'')})});
    rememberToken(data.token);
    emit('mycases:cloud',{connected:true});
    return true;
  }
  async function checkSession(){
    if(!token())return false;
    try{
      const d=await cloudFetch('/api/session');
      if(d.authenticated)return true;
      clearToken();return false;
    }catch(e){
      if(e.status===401){clearToken();return false}
      return null;
    }
  }
  function cloudPayload(item){
    const safe=compactCase(item);
    const out={};
    CLOUD_FIELDS.forEach(k=>{if(k in safe)out[k]=safe[k]});
    return out;
  }
  async function sendUpsert(item){
    const c=normalizeCase(item);
    try{
      const d=await cloudFetch('/api/cases/'+encodeURIComponent(c.id),{method:'PUT',body:JSON.stringify(cloudPayload(c))});
      return d.case||c;
    }catch(e){
      if(e.status!==404)throw e;
      const d=await cloudFetch('/api/cases',{method:'POST',body:JSON.stringify(cloudPayload(c))});
      return d.case||c;
    }
  }
  let processing=false;
  async function processQueue(){
    if(processing||!token()||!navigator.onLine)return false;
    processing=true;
    try{
      let q=readQueue();
      while(q.length){
        const task=q[0];
        try{
          if(task.action==='upsert'){
            const local=getCase(task.caseId)||task.payload;
            const remote=await sendUpsert(local);
            setCaseRaw(mergeCase(local,remote));
            setHandoff(mergeCase(local,remote));
          }else if(task.action==='delete'){
            try{await cloudFetch('/api/cases/'+encodeURIComponent(task.caseId),{method:'DELETE'})}
            catch(e){if(e.status!==404)throw e}
          }else if(task.action==='restore'){
            try{
              const d=await cloudFetch('/api/deleted-cases/'+encodeURIComponent(task.caseId)+'/restore',{method:'POST'});
              if(d.case)setCaseRaw(mergeCase(getCase(task.caseId),d.case));
            }catch(e){
              if(e.status===404){
                const local=getCase(task.caseId)||task.payload;
                const remote=await sendUpsert(local);
                setCaseRaw(mergeCase(local,remote));
              }else throw e;
            }
          }
          q.shift();
          writeQueue(q);
          try{localStorage.setItem(LAST_SYNC_KEY,now())}catch(e){};try{sessionStorage.setItem(LAST_SYNC_KEY,now())}catch(e){};
        }catch(e){
          task.attempts=(task.attempts||0)+1;
          task.lastError=String(e.message||e);
          task.lastAttemptAt=now();
          q[0]=task;
          writeQueue(q);
          if(e.status===401)clearToken();
          break;
        }
      }
      return readQueue().length===0;
    }finally{
      processing=false;
      emit('mycases:changed',{reason:'sync'});
    }
  }
  async function syncFromCloud(){
    if(!token())return false;
    const data=await cloudFetch('/api/cases');
    const remote=Array.isArray(data.cases)?data.cases:[];
    remote.forEach(r=>{
      const local=getCase(r.id);
      const merged=mergeCase(local,r);
      if(local?.deletedAt && String(local.deletedAt)>=String(r.updatedAt||''))return;
      setCaseRaw(merged);
    });
    try{
      const d=await cloudFetch('/api/deleted-cases');
      (Array.isArray(d.cases)?d.cases:[]).forEach(r=>{
        const local=getCase(r.id);
        const merged=mergeCase(local,r);
        merged.deletedAt=r.deletedAt||local?.deletedAt||now();
        setCaseRaw(merged);
      });
    }catch(e){}
    try{localStorage.setItem(LAST_SYNC_KEY,now())}catch(e){};try{sessionStorage.setItem(LAST_SYNC_KEY,now())}catch(e){};
    emit('mycases:changed',{reason:'pull'});
    return true;
  }

  function saveCase(item,{queue=true,touch=true}={}){
    const old=item?.id?getCase(item.id):null;
    const merged=normalizeCase({...old,...clone(item||{})});
    if(!merged.createdAt)merged.createdAt=old?.createdAt||now();
    if(touch)merged.updatedAt=now();
    setCaseRaw(merged);
    setHandoff(merged);
    if(queue)enqueue(merged.id,'upsert',merged);
    emit('mycases:changed',{reason:'save',caseId:merged.id});
    return merged;
  }
  function softDelete(id){
    const c=getCase(id);if(!c)return null;
    c.deletedAt=now();c.updatedAt=now();
    setCaseRaw(c);setHandoff(c);enqueue(c.id,'delete',c);
    emit('mycases:changed',{reason:'delete',caseId:c.id});
    return c;
  }
  function restore(id){
    const c=getCase(id);if(!c)return null;
    delete c.deletedAt;c.updatedAt=now();
    setCaseRaw(c);setHandoff(c);enqueue(c.id,'restore',c);
    emit('mycases:changed',{reason:'restore',caseId:c.id});
    return c;
  }
  function permanentlyDelete(id){
    deleteFromIndex(id);
    emit('mycases:changed',{reason:'permanent-delete',caseId:String(id)});
  }

  function migrateV1(){
    if(readIndex().length)return;
    const active=parse(localStorage.getItem(OLD_CASES_KEY)||'[]',[]);
    const deleted=parse(localStorage.getItem(OLD_DELETED_KEY)||'[]',[]);
    const all=[];
    if(Array.isArray(active))active.forEach(c=>all.push(normalizeCase(c)));
    if(Array.isArray(deleted))deleted.forEach(c=>all.push(normalizeCase({...c,deletedAt:c.deletedAt||now()})));
    all.forEach(c=>setCaseRaw(c));
    const handoff=getHandoff();
    if(handoff)setCaseRaw(handoff);
  }
  function init(){
    migrateV1();
    const handoff=getHandoff();
    if(handoff){
      const current=getCase(handoff.id);
      setCaseRaw(mergeCase(current,handoff));
    }
    global.addEventListener('online',()=>processQueue());
    return true;
  }

  global.MyCasesCore={
    API_BASE,uid,now,init,normalizeCase,compactCase,mergeCase,
    getCase,listCases,saveCase,softDelete,restore,permanentlyDelete,
    setHandoff,getHandoff,pendingCount,lastSync,
    token,login,checkSession,clearToken,processQueue,syncFromCloud
  };
})(window);
