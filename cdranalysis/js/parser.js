(() => {
  'use strict';
  window.CDRParserFactory = function(ctx){
    const {
      $,state,FIELDS,val,normalize,parseCdrDeviceMetadata,phoneKey,refreshSelectors,renderFileList,
      applyFilters,restorePendingWorkspace,showStatus,fmtInt
    }=ctx;

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

  function parseDateTime(dateVal,timeVal){
    if(dateVal instanceof Date){const d=new Date(dateVal); if(timeVal){const t=parseTime(timeVal); if(t){d.setHours(t.h,t.m,t.s,0);}} return d;}
    if(typeof dateVal==='number' && window.XLSX){const p=XLSX.SSF.parse_date_code(dateVal); if(p){const d=new Date(p.y,p.m-1,p.d); const t=parseTime(timeVal); if(t)d.setHours(t.h,t.m,t.s,0); return d;}}
    const s=String(dateVal??'').trim(); if(!s)return null;
    const mon={jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11};
    let y,m,d; let x=s.match(/^(\d{1,2})[\/\-]([A-Za-z]{3,})[\/\-](\d{2,4})$/);
    if(x){d=+x[1];m=mon[x[2].slice(0,3).toLowerCase()];y=+x[3];if(y<100)y+=2000;}
    else if((x=s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/))){d=+x[1];m=+x[2]-1;y=+x[3];if(y<100)y+=2000;}
    else if((x=s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/))){y=+x[1];m=+x[2]-1;d=+x[3];}
    else {const q=new Date(s); if(!isNaN(q)){const t=parseTime(timeVal); if(t)q.setHours(t.h,t.m,t.s,0); return q;} return null;}
    const out=new Date(y,m,d); const t=parseTime(timeVal); if(t)out.setHours(t.h,t.m,t.s,0); return out;
  }
  function parseTime(v){if(v instanceof Date)return {h:v.getHours(),m:v.getMinutes(),s:v.getSeconds()}; if(typeof v==='number'){const total=Math.round(v*86400);return {h:Math.floor(total/3600)%24,m:Math.floor(total%3600/60),s:total%60};} const x=String(v??'').trim().match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/); return x?{h:+x[1],m:+x[2],s:+(x[3]||0)}:null;}
  function timeMins(v){const t=parseTime(v);return t?t.h*60+t.m:null;}
  function mapHeaders(headers){const byNorm={}; headers.forEach(h=>byNorm[normalize(h)]=h); const map={}; Object.entries(FIELDS).forEach(([k,aliases])=>{for(const a of aliases){if(byNorm[normalize(a)]!==undefined){map[k]=byNorm[normalize(a)];break;}} if(!map[k]){const candidates=headers.filter(h=>aliases.some(a=>normalize(h).includes(normalize(a))||normalize(a).includes(normalize(h)))); if(candidates.length===1)map[k]=candidates[0];}}); return map;}
  function parseLatLong(s,link){
    const text=String(s??'').trim(),url=String(link??'').trim();
    let lat=null,lng=null,az='';
    let m=text.match(/(?:lat(?:itude)?\s*[:=]?\s*)?(-?\d{1,2}(?:\.\d+)?)\s*[,;|\s]+\s*(?:lon(?:gitude)?\s*[:=]?\s*)?(-?\d{1,3}(?:\.\d+)?)(?:\s*[,;|\s]+\s*(?:az(?:imuth)?\s*[:=]?\s*)?(-?\d+(?:\.\d+)?))?/i);
    if(m){lat=+m[1];lng=+m[2];az=m[3]??'';}
    if(lat==null||lng==null){
      // Common telecom export form: latitude-longitude-azimuth (hyphens used as separators).
      m=text.match(/^\s*(\d{1,2}(?:\.\d+)?)\s*-\s*(\d{2,3}(?:\.\d+)?)(?:\s*-\s*(\d+(?:\.\d+)?))?\s*$/);
      if(m){lat=+m[1];lng=+m[2];az=m[3]??'';}
    }
    if((lat==null||lng==null)&&url){
      m=url.match(/[?&](?:q|query|ll)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/i)||url.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
      if(m){lat=+m[1];lng=+m[2];}
    }
    if(!Number.isFinite(lat)||!Number.isFinite(lng)||Math.abs(lat)>90||Math.abs(lng)>180)return null;
    return {lat,lng,az};
  }
  function detectSheet(wb){if(wb.Sheets.Mapping)return 'Mapping'; let best=wb.SheetNames[0],max=0; wb.SheetNames.forEach(n=>{const ws=wb.Sheets[n]; const ref=ws['!ref']; if(ref){const r=XLSX.utils.decode_range(ref);const rows=r.e.r-r.s.r+1;if(rows>max){max=rows;best=n;}}}); return best;}

  function parseFileOnMain(buffer){
    const wb=XLSX.read(buffer,{type:'array',cellDates:true});const sheetName=detectSheet(wb),ws=wb.Sheets[sheetName];
    return {sheetName,rows:XLSX.utils.sheet_to_json(ws,{defval:'',raw:false})};
  }
  let parserWorkerSeq=0;
  function parseFileInWorker(file){
    return new Promise(async(resolve,reject)=>{
      const buffer=await file.arrayBuffer();
      if(typeof Worker==='undefined'){try{return resolve(parseFileOnMain(buffer));}catch(e){return reject(e);}}
      const worker=new Worker('/cdranalysis/cdr-parser-worker.js');
      const id=++parserWorkerSeq;
      const cleanup=()=>{try{worker.terminate()}catch{}};
      worker.onmessage=e=>{const m=e.data||{};if(m.id!==id)return;cleanup();m.ok?resolve({sheetName:m.sheetName,rows:m.rows}):reject(new Error(m.error||'Worker parsing failed'));};
      worker.onerror=e=>{cleanup();file.arrayBuffer().then(b=>resolve(parseFileOnMain(b))).catch(reject);};
      worker.postMessage({id,buffer,name:file.name},[buffer]);
    });
  }

  async function loadFiles(files){
    if(!files.length)return; showStatus(`Reading ${files.length} file(s)…`,'');
    for(const file of files){
      try{
        showStatus(`Parsing ${file.name} in background…`,'');
        const parsed=await parseFileInWorker(file),sheetName=parsed.sheetName,rows=parsed.rows;
        if(!rows.length)throw new Error('No rows found');
        const headers=Object.keys(rows[0]); const map=mapHeaders(headers); if(!map.bparty && !map.cdrNo && !map.date)throw new Error('Could not identify standard CDR columns');
        const fileId=++state.fileSeq; const inferredCdr=inferCdrFromFilename(file.name); let added=0;
        rows.forEach((r,idx)=>{
          const dt=parseDateTime(val(r,map,'date'),val(r,map,'time')); const loc=parseLatLong(val(r,map,'latlong'),val(r,map,'location'));
          const deviceMeta=parseCdrDeviceMetadata(val(r,map,'manufacturer'),val(r,map,'deviceType'));
          const rec={
            id:`${fileId}:${idx+2}`, fileId, sourceFile:file.name, sourceSheet:sheetName, rowNumber:idx+2,
            cdrNo:String(val(r,map,'cdrNo')??'').trim()||inferredCdr, bparty:String(val(r,map,'bparty')??'').trim(), date:val(r,map,'date'), time:val(r,map,'time'), dt,
            duration:parseDuration(val(r,map,'duration')), callType:String(val(r,map,'callType')??'').trim(),
            firstCellId:String(val(r,map,'firstCellId')??'').trim(), firstAddress:String(val(r,map,'firstAddress')??'').trim(), lastCellId:String(val(r,map,'lastCellId')??'').trim(), lastAddress:String(val(r,map,'lastAddress')??'').trim(),
            imei:String(val(r,map,'imei')??'').trim(), manufacturer:deviceMeta.manufacturer, model:deviceMeta.model, deviceType:deviceMeta.deviceType, os:deviceMeta.os, imsi:String(val(r,map,'imsi')??'').trim(), roaming:String(val(r,map,'roaming')??'').trim(), provider:String(val(r,map,'provider')??'').trim(),
            mainCity:String(val(r,map,'mainCity')??'').trim(), subCity:String(val(r,map,'subCity')??'').trim(), latlong:String(val(r,map,'latlong')??'').trim(), lat:loc?.lat??null,lng:loc?.lng??null,azimuth:loc?.az??'',
            caseName:String(val(r,map,'caseName')??'').trim(), circle:String(val(r,map,'circle')??'').trim(), operator:String(val(r,map,'operator')??'').trim(), lrn:String(val(r,map,'lrn')??'').trim(), callForward:String(val(r,map,'callForward')??'').trim(), location:String(val(r,map,'location')??'').trim()
          };
          rec.cdrKey=phoneKey(rec.cdrNo);rec.bpartyKey=phoneKey(rec.bparty);
          rec.search=normalize([rec.cdrNo,rec.bparty,rec.callType,rec.firstCellId,rec.firstAddress,rec.lastCellId,rec.lastAddress,rec.imei,rec.imsi,rec.manufacturer,rec.model,rec.deviceType,rec.os,rec.roaming,rec.provider,rec.mainCity,rec.subCity,rec.operator,rec.sourceFile].join(' | '));
          state.records.push(rec); added++;
        });
        state.files.push({id:fileId,name:file.name,sheet:sheetName,rows:added,map,inferredCdr});
      }catch(err){console.error(err); showStatus(`Error in ${file.name}: ${err.message}`,'error');}
    }
    refreshSelectors(); renderFileList(); restorePendingWorkspace(); applyFilters(); showStatus(`Loaded ${fmtInt(state.records.length)} records from ${state.files.length} file(s).`,'ok');
  }



    function bind(){
      $('chooseBtn').onclick=()=>$('fileInput').click();
      $('fileInput').onchange=e=>loadFiles([...e.target.files]);
      const dz=$('dropZone');
      ['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag');}));
      ['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag');}));
      dz.addEventListener('drop',e=>loadFiles([...e.dataTransfer.files]));
    }

    return {
      parseDuration,inferCdrFromFilename,parseDateTime,parseTime,timeMins,mapHeaders,parseLatLong,
      detectSheet,parseFileOnMain,parseFileInWorker,loadFiles,bind
    };
  };
})();
