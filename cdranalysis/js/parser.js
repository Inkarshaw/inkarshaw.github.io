(() => {
  'use strict';
  window.CDRParserFactory = function(ctx){
    const {
      $,state,FIELDS,val,normalize,parseCdrDeviceMetadata,phoneKey,refreshSelectors,renderFileList,
      applyFilters,restorePendingWorkspace,showStatus,fmtInt,rebuildIndexes,audit,dateFromSourceParts
    }=ctx;

    let parserWorkerSeq=0,importQueue=[],importBatchTotal=0,importBatchDone=0;

    function showImportLoading(file){
      const overlay=$('importLoadingOverlay'),count=$('importLoadingCount'),name=$('importLoadingFile');
      if(!overlay)return;
      const current=Math.min(importBatchDone+1,Math.max(importBatchTotal,1));
      if(count)count.textContent='Loading '+current+' of '+Math.max(importBatchTotal,1);
      if(name)name.textContent=file?.name||'Preparing CDR…';
      overlay.hidden=false;
    }
    function finishImportStep(){
      importBatchDone++;
      if(importBatchDone>=importBatchTotal&&!importQueue.length&&!state.pendingImport){
        const overlay=$('importLoadingOverlay');if(overlay)overlay.hidden=true;
        importBatchDone=0;importBatchTotal=0;
      }
    }

    function parseDuration(v){
      if(v==null||v==='')return 0;if(typeof v==='number'&&Number.isFinite(v))return v<1&&v>0?Math.round(v*86400):Math.max(0,v);
      const s=String(v).trim();if(!s)return 0;
      const hms=s.match(/^(\d{1,3}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/);
      if(hms){if(hms[3]!=null)return Math.round((+hms[1])*3600+(+hms[2])*60+(+hms[3]));return Math.round((+hms[1])*60+(+hms[2]));}
      const units=s.match(/(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?\s*(?:(\d+(?:\.\d+)?)\s*s)?/i);
      if(units&&(units[1]||units[2]||units[3]))return Math.round((+(units[1]||0))*3600+(+(units[2]||0))*60+(+(units[3]||0)));
      const n=Number(s.replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?Math.max(0,n):0;
    }

    function inferCdrFromFilename(name){const base=String(name||'').replace(/\.[^.]+$/,'');const m=base.match(/(?:^|\D)(\d{8,15})(?:\D|$)/);return m?m[1]:'';}
    function parseTime(v){if(v instanceof Date)return {h:v.getHours(),m:v.getMinutes(),s:v.getSeconds()};if(typeof v==='number'){const total=Math.round(v*86400);return {h:Math.floor(total/3600)%24,m:Math.floor(total%3600/60),s:total%60};}const x=String(v??'').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/);return x?{h:+x[1],m:+x[2],s:+(x[3]||0)}:null;}
    function timeMins(v){const t=parseTime(v);return t?t.h*60+t.m:null;}

    function parseDateTime(dateVal,timeVal,tz=state.sourceTimezone){
      const t=parseTime(timeVal)||{h:0,m:0,s:0};
      if(dateVal instanceof Date)return dateFromSourceParts(dateVal.getFullYear(),dateVal.getMonth(),dateVal.getDate(),t.h,t.m,t.s,tz);
      if(typeof dateVal==='number'&&window.XLSX){const q=XLSX.SSF.parse_date_code(dateVal);if(q)return dateFromSourceParts(q.y,q.m-1,q.d,t.h,t.m,t.s,tz);}
      const s=String(dateVal??'').trim();if(!s)return null;
      const mon={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
      let y,m,d,x=s.match(/^(\d{1,2})[\/\-]([A-Za-z]{3,})[\/\-](\d{2,4})$/);
      if(x){d=+x[1];m=mon[x[2].slice(0,3).toLowerCase()];y=+x[3];if(y<100)y+=2000;}
      else if((x=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/))){d=+x[1];m=+x[2]-1;y=+x[3];if(y<100)y+=2000;}
      else if((x=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){y=+x[1];m=+x[2]-1;d=+x[3];}
      else{
        const q=new Date(s);if(isNaN(q))return null;
        return dateFromSourceParts(q.getFullYear(),q.getMonth(),q.getDate(),t.h||q.getHours(),t.m||q.getMinutes(),t.s||q.getSeconds(),tz);
      }
      return dateFromSourceParts(y,m,d,t.h,t.m,t.s,tz);
    }

    function mapHeaders(headers){const byNorm={};headers.forEach(h=>byNorm[normalize(h)]=h);const map={};Object.entries(FIELDS).forEach(([k,aliases])=>{for(const a of aliases){if(byNorm[normalize(a)]!==undefined){map[k]=byNorm[normalize(a)];break;}}if(!map[k]){const candidates=headers.filter(h=>aliases.some(a=>normalize(h).includes(normalize(a))||normalize(a).includes(normalize(h))));if(candidates.length===1)map[k]=candidates[0];}});return map;}
    function parseLatLong(s,link){const text=String(s??'').trim(),url=String(link??'').trim();let lat=null,lng=null,az='';let m=text.match(/(?:lat(?:itude)?\s*[:=]?\s*)?(-?\d{1,2}(?:\.\d+)?)\s*[,;|\s]+\s*(?:lon(?:gitude)?\s*[:=]?\s*)?(-?\d{1,3}(?:\.\d+)?)(?:\s*[,;|\s]+\s*(?:az(?:imuth)?\s*[:=]?\s*)?(-?\d+(?:\.\d+)?))?/i);if(m){lat=+m[1];lng=+m[2];az=m[3]??'';}if(lat==null||lng==null){m=text.match(/^\s*(\d{1,2}(?:\.\d+)?)\s*-\s*(\d{2,3}(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*$/);if(m){lat=+m[1];lng=+m[2];az=m[3]??'';}}if((lat==null||lng==null)&&url){m=url.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)||url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);if(m){lat=+m[1];lng=+m[2];}}if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return null;return {lat,lng,az};}

    function detectHeaderRow(ws){
      const ref=ws&&ws['!ref'];if(!ref)return 0;
      const rr=XLSX.utils.decode_range(ref),endRow=Math.min(rr.e.r,rr.s.r+11);
      const sample=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false,range:{s:{r:rr.s.r,c:rr.s.c},e:{r:endRow,c:rr.e.c}}});
      let bestRow=rr.s.r,bestScore=-1;
      sample.forEach((row,i)=>{
        const headers=(row||[]).map(v=>String(v??'').trim()).filter(Boolean),map=mapHeaders(headers);
        const coreHits=['cdrNo','bparty','date','time','callType','firstCellId','imei','imsi'].filter(k=>map[k]).length;
        const score=coreHits*10+Object.keys(map).length;
        if(score>bestScore){bestScore=score;bestRow=rr.s.r+i;}
      });
      return bestScore>=20?bestRow:rr.s.r;
    }
    function inspectBuffer(buffer){
      const wb=XLSX.read(buffer,{type:'array',cellDates:true});
      return wb.SheetNames.map(name=>{
        const ws=wb.Sheets[name],ref=ws&&ws['!ref'];let rowCount=0;
        if(ref){const r=XLSX.utils.decode_range(ref);rowCount=r.e.r-r.s.r+1;}
        const headerRow=detectHeaderRow(ws),preview=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:headerRow}).slice(0,8);
        return {name,rowCount,headerRow,headers:preview[0]?Object.keys(preview[0]):[],preview};
      });
    }
    function parseBufferSheets(buffer,sheetNames,headerRows={}){
      const wb=XLSX.read(buffer,{type:'array',cellDates:true});
      return sheetNames.filter(n=>wb.Sheets[n]).map(sheetName=>{
        const ws=wb.Sheets[sheetName],headerRow=Number.isInteger(headerRows?.[sheetName])?headerRows[sheetName]:detectHeaderRow(ws);
        return {sheetName,headerRow,rows:XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:headerRow})};
      });
    }
    function inspectParseCdrBuffer(buffer){
      const wb=XLSX.read(buffer,{type:'array',cellDates:true});
      const sheets=wb.SheetNames.map(name=>{
        const ws=wb.Sheets[name],ref=ws&&ws['!ref'];let rowCount=0;
        if(ref){const r=XLSX.utils.decode_range(ref);rowCount=r.e.r-r.s.r+1;}
        const headerRow=detectHeaderRow(ws);
        const rr=ref?XLSX.utils.decode_range(ref):null;
        const preview=rr?XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:{s:{r:headerRow,c:rr.s.c},e:{r:Math.min(rr.e.r,headerRow+8),c:rr.e.c}}}).slice(0,8):[];
        const headers=preview[0]?Object.keys(preview[0]):[];
        return {name,rowCount,headerRow,headers,preview};
      });
      let compatible=sheets.filter(likelySheet);
      if(!compatible.length){const mapping=sheets.find(x=>normalize(x.name)==='mapping');if(mapping)compatible=[mapping];}
      const headerRows=Object.fromEntries(compatible.map(x=>[x.name,x.headerRow]));
      return {sheets,parsedSheets:parseBufferSheetsFromWorkbook(wb,compatible.map(x=>x.name),headerRows)};
    }
    function parseBufferSheetsFromWorkbook(wb,sheetNames,headerRows={}){
      return sheetNames.filter(n=>wb.Sheets[n]).map(sheetName=>{
        const ws=wb.Sheets[sheetName],headerRow=Number.isInteger(headerRows?.[sheetName])?headerRows[sheetName]:detectHeaderRow(ws);
        return {sheetName,headerRow,rows:XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:headerRow})};
      });
    }
    function workerCall(file,action,sheetNames=[],headerRows={},providedBuffer=null){
      return new Promise(async(resolve,reject)=>{
        const buffer=providedBuffer||await file.arrayBuffer();
        const fallback=()=>{
          try{
            if(action==='inspect')return resolve({sheets:inspectBuffer(buffer)});
            if(action==='inspectParseCdr')return resolve(inspectParseCdrBuffer(buffer));
            return resolve({sheets:parseBufferSheets(buffer,sheetNames,headerRows)});
          }catch(e){return reject(e);}
        };
        if(typeof Worker==='undefined')return fallback();
        const worker=new Worker('/cdranalysis/cdr-parser-worker.js?v=66'),id=++parserWorkerSeq,cleanup=()=>{try{worker.terminate()}catch{}};
        worker.onmessage=e=>{const m=e.data||{};if(m.id!==id)return;cleanup();m.ok?resolve(m):reject(new Error(m.error||'Worker parsing failed'));};
        worker.onerror=()=>{cleanup();file.arrayBuffer().then(b=>{
          try{
            if(action==='inspect')resolve({sheets:inspectBuffer(b)});
            else if(action==='inspectParseCdr')resolve(inspectParseCdrBuffer(b));
            else resolve({sheets:parseBufferSheets(b,sheetNames,headerRows)});
          }catch(err){reject(err);}
        }).catch(reject);};
        worker.postMessage({id,buffer,name:file.name,action,sheetNames,headerRows},[buffer]);
      });
    }

    async function hashBuffer(buf){try{if(!crypto?.subtle)return 'Unavailable';const hash=await crypto.subtle.digest('SHA-256',buf);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}catch{return 'Unavailable';}}
    async function hashFile(file){try{return hashBuffer(await file.arrayBuffer());}catch{return 'Unavailable';}}
    function mappingSignature(headers){let h=2166136261;for(const c of headers.map(normalize).sort().join('|')){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return (h>>>0).toString(16);}
    function savedMapping(headers){try{return JSON.parse(localStorage.getItem('cdrAnalyzer:mapping:'+mappingSignature(headers))||'null');}catch{return null;}}
    function saveMapping(headers,map){if(state.privateSession)return;try{localStorage.setItem('cdrAnalyzer:mapping:'+mappingSignature(headers),JSON.stringify(map));}catch{}}

    function likelySheet(sheet){
      const map=savedMapping(sheet.headers)||mapHeaders(sheet.headers),hits=['cdrNo','bparty','date','time','callType'].filter(k=>map[k]).length;
      return hits>=2;
    }
    function isDerivedReportSheet(name){
      const n=normalize(name);
      return /^(summary|maxcalls|maxduration|maxstay|otherstatecontactsummary|roamingperiod|imeiperiod|imsiperiod|nightmapping|nightmaxstay|daymapping|daymaxstay|workhomelocation|homelocationbasedondayfirstand|isdcalls)$/.test(n);
    }
    function chooseInitialSheets(sheets){
      const exactMapping=sheets.find(x=>normalize(x.name)==='mapping'&&likelySheet(x));
      if(exactMapping)return [exactMapping.name];
      let chosen=sheets.filter(x=>likelySheet(x)&&!isDerivedReportSheet(x.name)).map(x=>x.name);
      if(!chosen.length){
        const candidates=sheets.filter(x=>likelySheet(x));
        if(candidates.length)chosen=[...candidates].sort((a,b)=>b.rowCount-a.rowCount)[0].name;
      }
      if(!chosen.length&&sheets.length)chosen=[...sheets].sort((a,b)=>b.rowCount-a.rowCount)[0].name;
      return chosen;
    }

    function ensureSheetPicker(){
      let picker=$('sheetPicker');
      if(picker&&$('sheetSelect'))return picker;
      const status=$('loadStatus'),drop=$('dropZone');
      if(!status&&!drop)return null;
      picker=document.createElement('div');
      picker.id='sheetPicker';picker.className='panel';
      picker.style.cssText='display:none;padding:10px;margin:8px 0';
      picker.innerHTML='<div class="field"><label>Worksheet / tab</label><select id="sheetSelect"><option value="">Select worksheet</option></select></div><div class="tiny" id="sheetPickerInfo" style="margin:6px 0">Select one worksheet or All tabs.</div><div class="upload-actions"><button type="button" class="btn small" id="importSelectedSheetBtn">Import</button><button type="button" class="btn secondary small" id="cancelSheetImportBtn">Cancel</button></div>';
      if(status?.parentNode)status.parentNode.insertBefore(picker,status.nextSibling);
      else drop?.parentNode?.insertBefore(picker,drop.nextSibling);
      return picker;
    }
    function hideSheetPicker(){
      const picker=$('sheetPicker');if(picker)picker.style.setProperty('display','none','important');
      const select=$('sheetSelect');if(select)select.innerHTML='<option value="">Select worksheet</option>';
    }
    function showSheetPicker(p){
      const picker=ensureSheetPicker(),select=$('sheetSelect'),info=$('sheetPickerInfo');
      if(!picker||!select)return false;
      const recommended=chooseInitialSheets(p.sheets||[])[0]||'';
      select.innerHTML='<option value="__ALL__">All tabs</option>'+(p.sheets||[]).map(s=>{
        const compatible=likelySheet(s),label=s.name+' ('+fmtInt(s.rowCount||0)+' rows'+(compatible?' • CDR':' • report/other')+')';
        return '<option value="'+String(s.name).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'">'+label.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')+'</option>';
      }).join('');
      select.value=recommended||'__ALL__';
      if(info)info.textContent=(p.sheets||[]).length+' worksheet tab(s) found. Choose one tab or All tabs. Non-CDR report tabs are skipped safely.';
      picker.style.setProperty('display','block','important');
      const overlay=$('importLoadingOverlay');if(overlay)overlay.hidden=true;
      return getComputedStyle(picker).display!=='none';
    }

    async function inspectNext(){
      if(state.pendingImport||!importQueue.length)return;
      const file=importQueue.shift();showImportLoading(file);showStatus('Reading '+file.name+' once and detecting CDR tabs…','');
      try{
        const buffer=await file.arrayBuffer(),hashCopy=buffer.slice(0);
        const [fast,sha256]=await Promise.all([workerCall(file,'inspectParseCdr',[],{},buffer),hashBuffer(hashCopy)]);
        const sheets=fast.sheets||[],parsedSheets=fast.parsedSheets||[];
        if(!sheets.length)throw new Error('No worksheets found');
        if(!parsedSheets.length)throw new Error('No CDR-compatible worksheet found');
        const parsedNames=new Set(parsedSheets.map(s=>s.sheetName)),mappings={};
        for(const s of sheets)if(parsedNames.has(s.name))mappings[s.name]=savedMapping(s.headers)||mapHeaders(s.headers);
        state.pendingImport={file,sha256,sheets,parsedSheets,selected:parsedNames,mappings,inspectedAt:new Date().toISOString(),autoAll:true,fastPath:true};
        hideSheetPicker();
        const skipped=Math.max(0,sheets.length-parsedSheets.length);
        showStatus('Detected '+parsedSheets.length+' CDR tab(s)'+(skipped?' • skipped '+skipped+' non-CDR/report tab(s)':'')+'. Importing…','');
        await confirmImport();
      }catch(err){console.error(err);state.pendingImport=null;showStatus('Could not import '+file.name+': '+err.message,'error');finishImportStep();inspectNext();}
    }

    async function confirmImport(){
      const p=state.pendingImport;if(!p)return;
      const picked=p.autoAll?'__ALL__':($('sheetSelect')?.value||'');
      let selected=p.fastPath?(p.parsedSheets||[]).map(s=>s.sheetName):(picked==='__ALL__'?(p.sheets||[]).map(s=>s.name):(picked?[picked]:[...p.selected]));
      if(!selected.length){showStatus('No CDR-compatible worksheet found.','error');return;}
      p.selected=new Set(selected);
      for(const name of selected){const sheet=p.sheets.find(x=>x.name===name);p.mappings[name]=p.mappings[name]||savedMapping(sheet?.headers||[])||mapHeaders(sheet?.headers||[]);if(sheet)saveMapping(sheet.headers,p.mappings[name]);}
      hideSheetPicker();
      showImportLoading(p.file);
      showStatus('Importing '+selected.length+' CDR worksheet(s) from '+p.file.name+'…','');
      try{
        const headerRows=Object.fromEntries((p.sheets||[]).map(x=>[x.name,Number.isInteger(x.headerRow)?x.headerRow:0]));
        const parsed=p.fastPath?{sheets:p.parsedSheets}:await workerCall(p.file,'parse',selected,headerRows),timezone=$('sourceTimezone')?.value||state.sourceTimezone||'Asia/Kolkata';state.sourceTimezone=timezone;
        for(const sh of parsed.sheets||[]){
          const rows=sh.rows||[],map=p.mappings[sh.sheetName]||{};if(!rows.length)continue;
          if(!map.bparty&&!map.cdrNo&&!map.date){
            audit('Worksheet skipped',p.file.name+' / '+sh.sheetName+' • no standard CDR columns');
            continue;
          }
          const fileId=++state.fileSeq,inferredCdr=inferCdrFromFilename(p.file.name);let added=0;
          rows.forEach((r,idx)=>{
            const sourceRow=idx+(Number.isInteger(sh.headerRow)?sh.headerRow:0)+2;
            const rawDate=val(r,map,'date'),rawTime=val(r,map,'time'),dt=parseDateTime(rawDate,rawTime,timezone),loc=parseLatLong(val(r,map,'latlong'),val(r,map,'location')),deviceMeta=parseCdrDeviceMetadata(val(r,map,'manufacturer'),val(r,map,'deviceType'));
            const rec={id:`${fileId}:${sourceRow}`,fileId,sourceFile:p.file.name,sourceSheet:sh.sheetName,rowNumber:sourceRow,sourceHash:p.sha256,sourceTimezone:timezone,rawRow:r,rawDate,rawTime,cdrNo:String(val(r,map,'cdrNo')??'').trim()||inferredCdr,bparty:String(val(r,map,'bparty')??'').trim(),date:rawDate,time:rawTime,dt,duration:parseDuration(val(r,map,'duration')),callType:String(val(r,map,'callType')??'').trim(),firstCellId:String(val(r,map,'firstCellId')??'').trim(),firstAddress:String(val(r,map,'firstAddress')??'').trim(),lastCellId:String(val(r,map,'lastCellId')??'').trim(),lastAddress:String(val(r,map,'lastAddress')??'').trim(),imei:String(val(r,map,'imei')??'').trim(),manufacturer:deviceMeta.manufacturer,model:deviceMeta.model,deviceType:deviceMeta.deviceType,os:deviceMeta.os,imsi:String(val(r,map,'imsi')??'').trim(),roaming:String(val(r,map,'roaming')??'').trim(),provider:String(val(r,map,'provider')??'').trim(),mainCity:String(val(r,map,'mainCity')??'').trim(),subCity:String(val(r,map,'subCity')??'').trim(),latlong:String(val(r,map,'latlong')??'').trim(),lat:loc?.lat??null,lng:loc?.lng??null,azimuth:loc?.az??'',caseName:String(val(r,map,'caseName')??'').trim(),circle:String(val(r,map,'circle')??'').trim(),operator:String(val(r,map,'operator')??'').trim(),lrn:String(val(r,map,'lrn')??'').trim(),callForward:String(val(r,map,'callForward')??'').trim(),location:String(val(r,map,'location')??'').trim()};
            rec.cdrKey=phoneKey(rec.cdrNo);rec.bpartyKey=phoneKey(rec.bparty);rec.search=normalize([rec.cdrNo,rec.bparty,rec.callType,rec.firstCellId,rec.firstAddress,rec.lastCellId,rec.lastAddress,rec.imei,rec.imsi,rec.manufacturer,rec.model,rec.deviceType,rec.os,rec.roaming,rec.provider,rec.mainCity,rec.subCity,rec.operator,rec.sourceFile].join(' | '));state.records.push(rec);added++;
          });
          const info=p.sheets.find(x=>x.name===sh.sheetName)||{};
          state.files.push({id:fileId,name:p.file.name,sheet:sh.sheetName,rows:added,map,headers:info.headers||[],headerRow:Number.isInteger(info.headerRow)?info.headerRow:0,inferredCdr,sha256:p.sha256,size:p.file.size,lastModified:p.file.lastModified?new Date(p.file.lastModified).toISOString():'',importedAt:new Date().toISOString(),sourceTimezone:timezone});
          audit('CDR worksheet imported',p.file.name+' / '+sh.sheetName+' • '+added+' rows • SHA-256 '+p.sha256);
        }
        state.pendingImport=null;rebuildIndexes();refreshSelectors();renderFileList();restorePendingWorkspace();applyFilters();showStatus('Loaded '+fmtInt(state.records.length)+' raw records from '+state.files.length+' worksheet import(s).','ok');finishImportStep();inspectNext();
      }catch(err){console.error(err);showStatus('Import failed: '+err.message,'error');state.pendingImport=null;finishImportStep();inspectNext();}
    }

    function cancelImport(){if(state.pendingImport)audit('CDR import cancelled',state.pendingImport.file?.name||'');hideSheetPicker();state.pendingImport=null;finishImportStep();inspectNext();}
    function loadFiles(files){if(!files?.length)return;if(importBatchTotal===0){importBatchDone=0;importBatchTotal=files.length;}else importBatchTotal+=files.length;importQueue.push(...files);inspectNext();}
    function detectSheet(wb){if(wb.Sheets.Mapping)return 'Mapping';let best=wb.SheetNames[0],max=0;wb.SheetNames.forEach(n=>{const ref=wb.Sheets[n]?.['!ref'];if(ref){const r=XLSX.utils.decode_range(ref),rows=r.e.r-r.s.r+1;if(rows>max){max=rows;best=n;}}});return best;}
    function parseFileOnMain(buffer){const sheets=inspectBuffer(buffer),name=chooseInitialSheets(sheets)[0]||sheets[0]?.name,headerRows=Object.fromEntries(sheets.map(x=>[x.name,x.headerRow||0]));return {sheetName:name,rows:parseBufferSheets(buffer,[name],headerRows)[0]?.rows||[]};}
    async function parseFileInWorker(file){const ins=await workerCall(file,'inspect'),name=chooseInitialSheets(ins.sheets||[])[0],headerRows=Object.fromEntries((ins.sheets||[]).map(x=>[x.name,x.headerRow||0]));const p=await workerCall(file,'parse',[name],headerRows);return {sheetName:name,rows:p.sheets?.[0]?.rows||[]};}

    function syncLoadedUi(){
      document.body.classList.toggle('cdr-loaded',state.records.length>0);
    }

    function removeImportedFile(fileId){
      const id=Number(fileId),file=state.files.find(x=>Number(x.id)===id);
      if(!file)return;
      state.records=state.records.filter(r=>Number(r.fileId)!==id);
      state.files=state.files.filter(x=>Number(x.id)!==id);
      rebuildIndexes();
      refreshSelectors();
      renderFileList();
      applyFilters();
      audit('CDR worksheet removed',(file.name||'')+' / '+(file.sheet||''));
      showStatus(state.records.length
        ? 'Removed '+(file.inferredCdr||file.name)+'. '+fmtInt(state.records.length)+' records remain.'
        : 'Removed the last loaded CDR. Choose a file to start again.','ok');
    }

    function bind(){
      syncLoadedUi();
      window.addEventListener('cdr:updated',syncLoadedUi);
      const choose=$('chooseBtn');if(choose)choose.onclick=()=>$('fileInput')?.click();
      const input=$('fileInput');if(input)input.onchange=e=>{loadFiles([...e.target.files]);e.target.value='';};
      const dz=$('dropZone');if(!dz)return;
      ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag');}));
      ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag');}));
      dz.addEventListener('drop',e=>loadFiles([...e.dataTransfer.files]));
      const list=$('fileList');
      if(list)list.addEventListener('click',e=>{
        const btn=e.target.closest('[data-remove-file]');
        if(!btn)return;
        removeImportedFile(btn.dataset.removeFile);
      });
    }

    return {parseDuration,inferCdrFromFilename,parseDateTime,parseTime,timeMins,mapHeaders,parseLatLong,detectSheet,parseFileOnMain,parseFileInWorker,hashFile,hashBuffer,loadFiles,confirmImport,cancelImport,bind};
  };
})();