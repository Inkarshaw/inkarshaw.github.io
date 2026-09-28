(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const state = {records:[], filtered:[], files:[], page:1, pageSize:100, sort:{key:'dt',dir:'asc'}, charts:{}, flags:new Set(), notes:{}, chronology:[], contactTags:{}, contactNames:{}, globalContactTags:{}, globalContactNames:{}, tacCache:{}, fileSeq:0, pendingWorkspace:null, exactIncidentRange:null, privateSession:false, highlightRecordId:null, requestSelected:new Set(), locationMatchSelected:new Set()};
  let recordsModule=null, contactsModule=null, locationsModule=null, devicesModule=null, movementModule=null, networkModule=null, analysisModule=null, reportsModule=null, workspaceModule=null;
  const FIELDS = {
    cdrNo:['cdrno','a party','aparty','a-party','msisdn','subscriber number','mobile number'],
    bparty:['b party','bparty','b-party','other party','connected number','called number','calling number'],
    date:['date','call date','event date'], time:['time','call time','event time'], duration:['duration','call duration','duration sec','duration seconds'],
    callType:['call type','event type','direction','type'], firstCellId:['first cell id','first cellid','cell id','first cell'], firstAddress:['first cell id address','first cellid address','first tower address','tower address'],
    lastCellId:['last cell id','last cellid','last cell'], lastAddress:['last cell id address','last cellid address','last tower address'], imei:['imei'], manufacturer:['imei manufacturer','manufacturer'], deviceType:['device type'], imsi:['imsi'], roaming:['roaming'],
    provider:['b party provider','bparty provider','provider'], mainCity:['main city(first cellid)','main city','city'], subCity:['sub city(first cellid)','sub city','subcity'], latlong:['lat-long-azimuth (first cellid)','lat long azimuth','lat-long-azimuth','latitude longitude azimuth'],
    caseName:['case'], circle:['circle'], operator:['operator'], lrn:['lrn'], callForward:['callforward','call forward'], location:['location','map','map link']
  };
  const normalize = s => String(s ?? '').toLowerCase().replace(/[\n\r]+/g,' ').replace(/[_]+/g,' ').replace(/\s+/g,' ').trim();
  const escapeHtml = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const fmtInt = n => Number(n||0).toLocaleString('en-IN');
  const fmtDur = sec => {sec=Number(sec)||0; const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=Math.floor(sec%60); return h?`${h}h ${m}m ${s}s`:m?`${m}m ${s}s`:`${s}s`;};
  const dateFmt = d => d instanceof Date && !isNaN(d) ? d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '';
  const dtFmt = d => d instanceof Date && !isNaN(d) ? d.toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'}) : '';
  const val = (obj,map,key) => {const h=map[key]; return h ? obj[h] : '';};
  const stableKey = r => [r.sourceFile,r.sourceSheet,r.rowNumber,r.cdrNo,r.bparty,r.dt instanceof Date&&!isNaN(r.dt)?r.dt.toISOString():`${r.date} ${r.time}`].join('|');
  function localDateKey(d){if(!(d instanceof Date)||isNaN(d))return '';return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
  function parseDuration(v){
    if(v==null||v==='')return 0;if(typeof v==='number'&&Number.isFinite(v))return v<1&&v>0?Math.round(v*86400):Math.max(0,v);
    const s=String(v).trim();if(!s)return 0;
    const hms=s.match(/^(\d{1,3}):(\d{1,2})(?::(\d{1,2}(?:\.\d+)?))?$/);
    if(hms){if(hms[3]!=null)return Math.round((+hms[1])*3600+(+hms[2])*60+(+hms[3]));return Math.round((+hms[1])*60+(+hms[2]));}
    const units=s.match(/(?:(\d+(?:\.\d+)?)\s*h)?\s*(?:(\d+(?:\.\d+)?)\s*m)?\s*(?:(\d+(?:\.\d+)?)\s*s)?/i);
    if(units&&(units[1]||units[2]||units[3]))return Math.round((+(units[1]||0))*3600+(+(units[2]||0))*60+(+(units[3]||0)));
    const n=Number(s.replace(/[^0-9.\-]/g,''));return Number.isFinite(n)?Math.max(0,n):0;
  }
  if(typeof Chart!=='undefined'){
    Chart.defaults.color='#86a9b8';
    Chart.defaults.borderColor='rgba(97,163,187,.14)';
    Chart.defaults.font.family='Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial,sans-serif';
  }
  function inferCdrFromFilename(name){const base=String(name||'').replace(/\.[^.]+$/,'');const m=base.match(/(?:^|\D)(\d{8,15})(?:\D|$)/);return m?m[1]:'';}
  function haversineKm(a,b){if(a?.lat==null||a?.lng==null||b?.lat==null||b?.lng==null)return null;const R=6371,rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLon=rad(b.lng-a.lng),s=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLon/2)**2;return 2*R*Math.asin(Math.min(1,Math.sqrt(s)));}
  function percentile(arr,p){const a=arr.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(i-lo);}
  function incidentDateTime(){if(!$('incidentDate').value)return null;const t=$('incidentTime').value||'00:00';const d=new Date(`${$('incidentDate').value}T${t}:00`);return isNaN(d)?null:d;}
  function escAttr(s){return escapeHtml(s).replace(/'/g,'&#39;');}
  function contactName(num){const n=String(num??'').trim();return String(state.contactNames[n]??state.globalContactNames[n]??'').trim();}
  function contactTag(num){const n=String(num??'').trim();return String(state.contactTags[n]??state.globalContactTags[n]??'').trim();}
  function contactLabel(num){const n=String(num??'').trim();const name=contactName(n);return name||n||'—';}
  function contactTitle(num){const n=String(num??'').trim();const name=contactName(n),tag=contactTag(n);return [name&&n?name+' • '+n:(name||n||'—'),tag].filter(Boolean).join(' • ');}
  function identityStore(kind){const global=$('identityScope')?.value==='global';return kind==='name'?(global?state.globalContactNames:state.contactNames):(global?state.globalContactTags:state.contactTags);}

  function persistLocal(key,value){if(!state.privateSession)localStorage.setItem(key,value);}
  function updatePrivacyUi(){
    if(!$('privateSessionBtn'))return;
    $('privateSessionBtn').textContent=`Private Session: ${state.privateSession?'On':'Off'}`;
    $('privacyModeStatus').textContent=state.privateSession?'Private Session is on: new case metadata, names and tags will not be written to local browser storage.':'Case metadata, names and tags may be remembered on this device.';
  }

  function phoneKey(v){
    const raw=String(v??'').trim();if(!raw)return '';
    const digits=raw.replace(/\D/g,'');
    if(/^91\d{10}$/.test(digits))return digits.slice(-10);
    if(/^0\d{10}$/.test(digits))return digits.slice(-10);
    if(/^\d{10}$/.test(digits))return digits;
    return 'raw:'+normalize(raw);
  }
  function samePhone(a,b){const ka=phoneKey(a),kb=phoneKey(b);return !!ka&&ka===kb;}
  function serviceSenderType(v){
    const s=String(v??'').trim();if(!s)return '';
    const compact=s.replace(/\s+/g,'');
    if(/[A-Za-z]/.test(compact)){
      if(/^[A-Za-z]{2,3}-?[A-Za-z0-9]{3,10}$/.test(compact))return 'Alphanumeric sender ID';
      if(/^[A-Za-z0-9_-]{3,18}$/.test(compact))return 'Service/OTP-like sender';
    }
    const digits=compact.replace(/\D/g,'');
    if(/^\d{3,8}$/.test(digits))return 'Short code';
    return '';
  }
  function isServiceSender(v){return !!serviceSenderType(v);}
  function senderServiceCategory(brandKey,raw=''){
    const key=String(brandKey||'').toUpperCase().replace(/[^A-Z0-9]/g,''),src=(key+' '+String(raw||'').toUpperCase().replace(/[^A-Z0-9]/g,''));
    const has=(...tokens)=>tokens.some(t=>src.includes(t));
    if(has('KOTAK','IDFC','SBI','HDFC','ICICI','AXIS','CANARA','PNB','PUNJABNATIONAL','BANKOFBARODA','BOB','BANKOFINDIA','BOI','UNIONBANK','INDIANBANK','INDUSIND','YESBANK','FEDERALBANK','FEDERAL','RBL','BANDHAN','UCOBANK','CITYUNION','CUB','IOB','INDIANOVERSEAS','KARURVYSYA','KVB','SOUTINDIANBANK','SIB'))return 'Banking';
    if(has('SWIGGY','ZOMATO'))return 'Food Delivery';
    if(has('RAPIDO','UBER','OLA'))return 'Cab / Transport';
    if(has('AIRTEL','BHARTIAIRTEL','JIO','RELIANCEJIO','VODAFONE','IDEA','VODAFONEIDEA','VIINDIA')||key==='VI')return 'SIM / Telecom';
    if(has('AMAZON','FLIPKART','MYNTRA','MEESHO','AJIO'))return 'E-commerce';
    if(has('PAYTM','PHONEPE','GPAY','GOOGLEPAY','MOBIKWIK','FREECHARGE'))return 'Payments / Wallet';
    return 'Other / Unclassified';
  }
  function senderBrandInfo(v){
    const raw=String(v??'').trim();if(!raw||!/[A-Za-z]/.test(raw))return null;
    const compact=raw.toUpperCase().replace(/\s+/g,'');
    let brand='';
    const parts=compact.split(/[-_]/).filter(Boolean);
    if(parts.length>1){
      brand=parts.slice(1).join('');
    }else{
      brand=compact.replace(/[^A-Z0-9]/g,'');
      if(/^[A-Z]{2}[A-Z0-9]{3,12}$/.test(brand)&&serviceSenderType(raw))brand=brand.slice(2);
    }
    brand=brand.replace(/[^A-Z0-9]/g,'');
    if(!brand||brand.length<2)return null;
    const label=brand.length<=4?brand:brand.charAt(0)+brand.slice(1).toLowerCase();
    return {raw,key:brand,label,category:senderServiceCategory(brand,raw)};
  }
  function smsRecordBasis(r){
    const typ=normalize(r?.callType),bi=senderBrandInfo(r?.bparty);
    if(!bi)return '';
    if(typ.includes('sms'))return 'Explicit SMS event';
    if(typ.includes('call'))return '';
    if(isServiceSender(r?.bparty)||/[A-Za-z]/.test(String(r?.bparty||'')))return 'Sender-ID inference';
    return '';
  }
  function isSmsRecord(r){return !!smsRecordBasis(r);}
  function smsIntelRows(){
    const subject=$('smsIntelCdr')?.value||'',from=$('smsIntelFrom')?.value||'',to=$('smsIntelTo')?.value||'';
    return subjectEventScopedRecords(state.records).filter(r=>{
      if(!r.dt||!smsRecordBasis(r))return false;
      if(subject&&r.cdrNo!==subject)return false;
      const d=localDateKey(r.dt);if(from&&d<from)return false;if(to&&d>to)return false;
      return true;
    }).sort((a,b)=>a.dt-b.dt);
  }
  function smsSenderIntelligence(data=smsIntelRows()){
    const callWindow=(+$('smsIntelCallMins')?.value||10)*60000,idWindow=(+$('smsIntelIdMins')?.value||60)*60000;
    const nightFrom=timeMins($('smsIntelNightFrom')?.value||'22:00'),nightTo=timeMins($('smsIntelNightTo')?.value||'06:00');
    const calls=state.records.filter(r=>r.dt&&normalize(r.callType).includes('call')).sort((a,b)=>a.dt-b.dt);
    const idChanges=analyzeIdentifiers(state.records).events;
    const brands=new Map(),timeline=[];
    for(const r of data){
      const bi=senderBrandInfo(r.bparty);if(!bi)continue;
      const mins=r.dt.getHours()*60+r.dt.getMinutes(),unusual=withinNight(mins,nightFrom,nightTo);
      const nearbyCalls=calls.filter(x=>x.cdrNo===r.cdrNo&&Math.abs(x.dt-r.dt)<=callWindow);
      const nearbyIds=idChanges.filter(x=>x.msisdn===r.cdrNo&&Math.abs(x.at-r.dt)<=idWindow);
      let b=brands.get(bi.key);
      if(!b)b={key:bi.key,label:bi.label,category:bi.category,senderIds:new Set(),count:0,first:null,last:null,days:new Set(),unusual:0,subjects:new Set(),towers:new Set(),nearCalls:0,nearIds:0};
      b.senderIds.add(r.bparty);b.count++;b.days.add(localDateKey(r.dt));if(unusual)b.unusual++;if(r.cdrNo)b.subjects.add(r.cdrNo);if(r.firstCellId||r.firstAddress)b.towers.add(r.firstCellId||r.firstAddress);b.nearCalls+=nearbyCalls.length;b.nearIds+=nearbyIds.length;
      if(!b.first||r.dt<b.first)b.first=r.dt;if(!b.last||r.dt>b.last)b.last=r.dt;brands.set(bi.key,b);
      timeline.push({record:r,brand:bi.label,category:bi.category,senderId:r.bparty,basis:smsRecordBasis(r),unusual,nearbyCalls:nearbyCalls.length,nearbyIds:nearbyIds.length});
    }
    const categories=new Map();
    for(const b of brands.values()){
      let x=categories.get(b.category);if(!x)x={category:b.category,count:0,brands:new Set(),senderIds:new Set(),first:null,last:null,unusual:0};
      x.count+=b.count;x.brands.add(b.label);for(const s of b.senderIds)x.senderIds.add(s);x.unusual+=b.unusual;
      if(!x.first||b.first<x.first)x.first=b.first;if(!x.last||b.last>x.last)x.last=b.last;categories.set(b.category,x);
    }
    return {brands:[...brands.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label)),categories:[...categories.values()].sort((a,b)=>b.count-a.count),timeline,callWindowMin:callWindow/60000,idWindowMin:idWindow/60000};
  }

  function requestIdentifier(v){
    const raw=String(v??'').trim(),digits=raw.replace(/\D/g,'');
    if(isServiceSender(raw))return '';
    if(/^91\d{10}$/.test(digits)||/^0\d{10}$/.test(digits))return digits.slice(-10);
    if(/^\d{10}$/.test(digits))return digits;
    if(/^\d{15}$/.test(digits))return digits;
    return '';
  }
  function parseCdrDeviceMetadata(manufacturerRaw,deviceTypeRaw=''){
    const raw=String(manufacturerRaw??'').trim(),fallbackType=String(deviceTypeRaw??'').trim();
    if(!raw)return {manufacturer:'',model:'',deviceType:fallbackType,os:''};
    const parts=raw.split('|').map(x=>x.trim()).filter(Boolean);
    const head=parts[0]||raw;
    let manufacturer=head,model='';
    const comma=head.indexOf(',');
    if(comma>0){manufacturer=head.slice(0,comma).trim();model=head.slice(comma+1).trim();}
    const deviceType=parts[1]||fallbackType;
    const os=parts[2]||'';
    // Several provider exports repeat the marketing model later in the descriptor.
    if(!model){
      const candidates=[parts[5],parts[3]].filter(Boolean);
      model=candidates.find(x=>!/^android$|^ios$|^smartphone$/i.test(x))||'';
    }
    return {manufacturer,model,deviceType,os};
  }
  function imeiDigits(v){return String(v??'').replace(/\D/g,'');}
  function luhnValidImei(v){
    const d=imeiDigits(v);if(d.length!==15)return null;
    let sum=0;
    for(let i=0;i<15;i++){
      let n=+d[i];
      if(i%2===1){n*=2;if(n>9)n-=9;}
      sum+=n;
    }
    return sum%10===0;
  }
  function imeiStructure(v){
    const d=imeiDigits(v);
    if(![14,15,16].includes(d.length))return {digits:d,format:'Invalid / unsupported',tac:'',reportingBody:'',modelIdentifier:'',serial:'',checkDigit:'',svn:'',luhn:null};
    const tac=d.slice(0,8),serial=d.slice(8,14);
    if(d.length===16)return {digits:d,format:'IMEISV (16 digits)',tac,reportingBody:tac.slice(0,2),modelIdentifier:tac.slice(2,8),serial,checkDigit:'',svn:d.slice(14,16),luhn:null};
    if(d.length===15)return {digits:d,format:'IMEI (15 digits)',tac,reportingBody:tac.slice(0,2),modelIdentifier:tac.slice(2,8),serial,checkDigit:d[14],svn:'',luhn:luhnValidImei(d)};
    return {digits:d,format:'IMEI body (14 digits)',tac,reportingBody:tac.slice(0,2),modelIdentifier:tac.slice(2,8),serial,checkDigit:'',svn:'',luhn:null};
  }
  function tacFromImei(v){const d=imeiDigits(v);return d.length>=14&&d.length<=16?d.slice(0,8):'';}
  const BUILTIN_TAC_MAP={
    '35856015':{tac:'35856015',manufacturer:'Apple',model:'iPhone 15 Pro Max',deviceType:'A3106',source:'Built-in verified TAC mapping'},
    '35499663':{tac:'35499663',manufacturer:'Samsung',model:'Galaxy A05',deviceType:'SM-A055F/DS (2023)',source:'Built-in verified TAC mapping'},
    '35738339':{tac:'35738339',manufacturer:'Samsung',model:'Galaxy A05',deviceType:'SM-A055F/DS (2023)',source:'Built-in verified TAC mapping'},
    '35733077':{tac:'35733077',manufacturer:'Apple',model:'iPhone 17',deviceType:'Smartphone',source:'Built-in verified TAC mapping'},
    '35170735':{tac:'35170735',manufacturer:'Nothing',model:'Phone (3a)',deviceType:'A059',source:'Built-in verified TAC mapping'},
    '35836178':{tac:'35836178',manufacturer:'Apple',model:'iPhone 17 Pro Max',deviceType:'A3526',source:'Built-in verified TAC mapping'},
    '35613774':{tac:'35613774',manufacturer:'Samsung',model:'Galaxy A17',deviceType:'SM-A176B/DS',source:'Built-in verified TAC mapping'},
    '35498230':{tac:'35498230',manufacturer:'GAMMA',model:'K2',deviceType:'',source:'Built-in verified TAC mapping'},
    '86984307':{tac:'86984307',manufacturer:'OPPO',model:'A3X 5G',deviceType:'CPH2681',source:'Built-in verified TAC mapping'},
    '86204606':{tac:'86204606',manufacturer:'Xiaomi / Redmi',model:'Redmi Note 13 5G',deviceType:'2312DRAABI (India model)',source:'Built-in verified TAC mapping'},
    '35090343':{tac:'35090343',manufacturer:'Apple',model:'iPhone 16 Pro',deviceType:'A3293',source:'Built-in verified TAC mapping'},
    '86710406':{tac:'86710406',manufacturer:'vivo',model:'X100',deviceType:'V2308',source:'Built-in verified TAC mapping'},
    '86738808':{tac:'86738808',manufacturer:'vivo',model:'Y11 5G',deviceType:'Smartphone',source:'Built-in verified TAC mapping'},
    '86056407':{tac:'86056407',manufacturer:'vivo',model:'T3 Lite 5G',deviceType:'V2356',source:'Built-in verified TAC mapping'}
  };
  function seedBuiltinTacMappings(){
    let changed=false;
    for(const [tac,entry] of Object.entries(BUILTIN_TAC_MAP)){
      const current=state.tacCache[tac];
      const weak=!current||current.source==='CDR metadata'||(!current.manufacturer&&!current.model);
      if(!weak)continue;
      state.tacCache[tac]={...current,...entry,updatedAt:new Date().toISOString()};
      changed=true;
    }
    if(changed)saveTacCache();else updateTacStatus();
  }

  function normalizeTacEntry(tac,manufacturer,model,deviceType,source='Imported'){
    const t=String(tac??'').replace(/\D/g,'').slice(0,8);if(!/^\d{8}$/.test(t))return null;
    const mfr=String(manufacturer??'').trim(),mdl=String(model??'').trim(),typ=String(deviceType??'').trim();
    if(!mfr&&!mdl&&!typ)return null;
    return {tac:t,manufacturer:mfr,model:mdl,deviceType:typ,source:String(source||'Imported'),updatedAt:new Date().toISOString()};
  }
  function saveTacCache(){persistLocal('cdrAnalyzer:tacCache',JSON.stringify(state.tacCache));updateTacStatus();}
  function updateTacStatus(){if($('tacCacheStatus'))$('tacCacheStatus').textContent=`TAC cache: ${fmtInt(Object.keys(state.tacCache||{}).length)} entries`;}
  function learnTacFromRecords(data=state.records){
    let changed=false;
    for(const r of data){
      const tac=tacFromImei(r.imei);if(!tac)continue;
      const mfr=String(r.manufacturer||'').trim(),model=String(r.model||'').trim(),deviceType=String(r.deviceType||'').trim();
      if(!mfr&&!model&&!deviceType)continue;
      const current=state.tacCache[tac]||{};
      // Do not overwrite imported or built-in mappings with weaker CDR metadata.
      if(current.source&&current.source!=='CDR metadata')continue;
      const next=normalizeTacEntry(tac,mfr,model,deviceType,'CDR metadata');
      if(next&&(!state.tacCache[tac]||JSON.stringify({...state.tacCache[tac],updatedAt:''})!==JSON.stringify({...next,updatedAt:''}))){state.tacCache[tac]=next;changed=true;}
    }
    if(changed)saveTacCache();else updateTacStatus();
  }
  function resolveDevice(imei,fallbackManufacturer='',fallbackModel=''){
    const tac=tacFromImei(imei),entry=tac?state.tacCache[tac]:null;
    const manufacturer=String(entry?.manufacturer||fallbackManufacturer||'').trim();
    const model=String(entry?.model||entry?.deviceType||fallbackModel||'').trim();
    let status='Unknown TAC';
    if(!tac)status='Invalid/unsupported IMEI';
    else if(entry)status=`Resolved • ${entry.source||'TAC cache'}`;
    else if(manufacturer||model)status='CDR metadata only';
    return {tac,manufacturer,model,status,source:entry?.source||''};
  }
  function tacField(row,names){
    const keys=Object.keys(row||{}),norm=names.map(normalize);
    const k=keys.find(x=>norm.includes(normalize(x)))||keys.find(x=>norm.some(n=>normalize(x).includes(n)||n.includes(normalize(x))));
    return k?row[k]:'';
  }
  async function importTacDatabase(file){
    let rows=[];
    if(file.name.toLowerCase().endsWith('.json')){
      const j=JSON.parse(await file.text());rows=Array.isArray(j)?j:Array.isArray(j.entries)?j.entries:Object.values(j||{});
    }else{
      if(typeof XLSX==='undefined')throw new Error('Excel library unavailable');
      const wb=XLSX.read(await file.arrayBuffer(),{type:'array'}),ws=wb.Sheets[wb.SheetNames[0]];
      rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
    }
    let added=0,updated=0,skipped=0;
    for(const row of rows){
      const e=normalizeTacEntry(
        tacField(row,['tac','type allocation code','imei tac']),
        tacField(row,['manufacturer','brand','make','oem']),
        tacField(row,['model','model name','device model','marketing name']),
        tacField(row,['device type','type','category']),
        file.name
      );
      if(!e){skipped++;continue;}
      if(state.tacCache[e.tac])updated++;else added++;
      state.tacCache[e.tac]={...state.tacCache[e.tac],...e};
    }
    saveTacCache();renderDevices();
    showStatus(`TAC import complete: ${added} added, ${updated} updated, ${skipped} skipped.`,'ok');
  }
  function exportTacCache(){
    const rows=Object.values(state.tacCache||{}).sort((a,b)=>a.tac.localeCompare(b.tac));
    download('cdr_analyzer_tac_cache.json',JSON.stringify({version:1,exportedAt:new Date().toISOString(),entries:rows},null,2),'application/json');
  }

  function updateCdrRequestCount(){if($('cdrRequestCount'))$('cdrRequestCount').textContent=fmtInt(state.requestSelected.size);}
  function defaultCdrRequestDates(){
    const dates=state.filtered.filter(r=>r.dt).map(r=>r.dt).sort((a,b)=>a-b);
    if(!$('cdrRequestFrom')||!dates.length)return;
    if(!$('cdrRequestFrom').value)$('cdrRequestFrom').value=localDateKey(dates[0]);
    if(!$('cdrRequestTo').value)$('cdrRequestTo').value=localDateKey(dates[dates.length-1]);
  }


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

  function showStatus(msg,type){const el=$('loadStatus');el.textContent=msg;el.className='status show'+(type?` ${type}`:'');}
  function renderFileList(){$('fileList').innerHTML=state.files.map(f=>`<div class="file-item"><b title="${escapeHtml(f.name)}">${escapeHtml(f.name)}</b><span>${f.inferredCdr?escapeHtml(f.inferredCdr)+' • ':''}${escapeHtml(f.sheet)} • ${fmtInt(f.rows)} <button class="file-remove" data-remove-file="${f.id}" title="Remove file">×</button></span></div>`).join('');}
  function uniq(key){return [...new Set(state.records.map(r=>r[key]).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));}
  function fillSelect(id,items,label){const el=$(id),cur=el.value;el.innerHTML=`<option value="">${label}</option>`+items.map(x=>`<option>${escapeHtml(x)}</option>`).join('');if(items.includes(cur))el.value=cur;}
  function subjectEventScopedRecords(data=state.records){
    const subject=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    return data.filter(r=>(!subject||r.cdrNo===subject)&&(!eventType||r.callType===eventType));
  }
  function installViewScopeToolbars(){
    document.querySelectorAll('.view').forEach(view=>{
      if(view.id==='dashboard'||view.querySelector(':scope > .view-scope-toolbar'))return;
      const bar=document.createElement('div');
      bar.className='panel no-print view-scope-toolbar';
      bar.style.padding='10px 12px';
      const bpartyField=view.id==='records'?'<div class="field" style="min-width:220px"><label>B Party</label><input class="view-scope-bparty" placeholder="Search connected number / sender ID"></div>':'';
      const clearLabel=view.id==='records'?'Clear quick filters':'Clear subject/event';
      bar.innerHTML='<div class="subtoolbar" style="margin:0"><div class="field" style="min-width:240px"><label>Subject / MSISDN</label><select class="view-scope-subject"><option value="">All subjects</option></select></div><div class="field" style="min-width:210px"><label>Event type</label><select class="view-scope-event"><option value="">All event types</option></select></div>'+bpartyField+'<button class="btn secondary small view-scope-clear" type="button">'+clearLabel+'</button><span class="tiny view-scope-status"></span></div>';
      view.insertBefore(bar,view.firstChild);
    });
  }
  function syncViewScopeControls(rebuild=false){
    const subjects=uniq('cdrNo'),events=uniq('callType'),subject=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    const fill=(el,items,label,value)=>{
      if(!el)return;
      if(rebuild||el.options.length!==items.length+1){
        el.innerHTML='<option value="">'+label+'</option>'+items.map(x=>'<option value="'+escAttr(x)+'">'+escapeHtml(x)+'</option>').join('');
      }
      el.value=items.includes(value)?value:'';
    };
    document.querySelectorAll('.view-scope-subject').forEach(el=>fill(el,subjects,'All subjects',subject));
    document.querySelectorAll('.view-scope-event').forEach(el=>fill(el,events,'All event types',eventType));
    document.querySelectorAll('.view-scope-bparty').forEach(el=>{if(el.value!==($('bparty')?.value||''))el.value=$('bparty')?.value||'';});
    fill($('dashboardCdr'),subjects,'All subjects',subject);
    fill($('dashboardEventType'),events,'All event types',eventType);
    // Keep the older tab-specific subject controls aligned so they cannot silently narrow to a different subject.
    if($('movementCdr')){fill($('movementCdr'),subjects,'All subjects',subject);}
    if($('smsIntelCdr')){fill($('smsIntelCdr'),subjects,'All subjects',subject);}
    const scopeText=(subject||'All subjects')+' • '+(eventType||'All event types')+' • '+fmtInt(state.filtered.length)+' filtered records';
    document.querySelectorAll('.view-scope-status').forEach(el=>el.textContent=scopeText);
  }
  function setSubjectEventScope(subject,eventType){
    if($('cdrNo'))$('cdrNo').value=subject||'';
    if($('callType'))$('callType').value=eventType||'';
    applyFilters();
  }

  function refreshSelectors(){
    fillSelect('callType',uniq('callType'),'All event types');
    fillSelect('cdrNo',uniq('cdrNo'),'All CDR numbers');
    fillSelect('sourceFile',uniq('sourceFile'),'All files');
    const mc=uniq('cdrNo');
    fillSelect('movementCdr',mc,'All subjects');
    fillSelect('dashboardCdr',mc,'All subjects');
    fillSelect('dashboardEventType',uniq('callType'),'All event types');
    fillSelect('smsIntelCdr',mc,'All subjects');
    installViewScopeToolbars();
    syncViewScopeControls(true);
  }

  function matchesSmartQuery(r,q){
    q=String(q||'').trim();if(!q)return true;const tokens=q.match(/"[^"]*"|\S+/g)||[];
    for(let token of tokens){token=token.replace(/^"|"$/g,'');const p=token.indexOf(':');
      if(p>0){const key=normalize(token.slice(0,p)),v=normalize(token.slice(p+1));
        if(key==='imei'&&!normalize(r.imei).includes(v))return false;if(key==='imsi'&&!normalize(r.imsi).includes(v))return false;
        if(key==='tower'&&!normalize((r.firstAddress||'')+' '+(r.firstCellId||'')).includes(v))return false;
        if(key==='name'&&!normalize(contactLabel(r.bparty)).includes(v))return false;if(key==='tag'&&!normalize(contactTag(r.bparty)).includes(v))return false;
        if(key==='after'){const d=new Date(v);if(!r.dt||isNaN(d)||r.dt<d)return false;}if(key==='before'){const d=new Date(v+'T23:59:59');if(!r.dt||isNaN(d)||r.dt>d)return false;}
      }else{const hay=normalize(r.search+' '+contactLabel(r.bparty)+' '+(contactTag(r.bparty)));if(!hay.includes(normalize(token)))return false;}
    }return true;
  }
  function withinNight(mins,start,end){if(start===null||end===null||mins===null)return true; return start<=end?(mins>=start&&mins<=end):(mins>=start||mins<=end);}
  function activeFilterCount(){
    const ids=['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','cellId','tower','city','subcity','roaming','imei','imsi','provider','operator'];
    let n=ids.filter(id=>String($(id)?.value||'').trim()).length;
    n+=['callType','cdrNo','sourceFile'].filter(id=>$(id)?.value).length;
    n+=['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders'].filter(id=>$(id)?.checked).length;
    if(state.exactIncidentRange)n++;
    return n;
  }
  function updateFilterCount(){if($('activeFilterCount'))$('activeFilterCount').textContent=activeFilterCount();}
  function setFilterDrawer(open){$('filterSidebar')?.classList.toggle('open',open);$('filterBackdrop')?.classList.toggle('show',open);$('mobileFiltersBtn')?.setAttribute('aria-expanded',String(open));$('filterSidebar')?.setAttribute('aria-hidden',String(window.innerWidth<=1100?!open:false));}
  function applyFilters(){
    const f={q:normalize($('q').value),dateFrom:$('dateFrom').value?new Date($('dateFrom').value+'T00:00:00'):null,dateTo:$('dateTo').value?new Date($('dateTo').value+'T23:59:59'):null,
      timeFrom:timeMins($('timeFrom').value),timeTo:timeMins($('timeTo').value),bparty:normalize($('bparty').value),durMin:$('durMin').value===''?null:+$('durMin').value,durMax:$('durMax').value===''?null:+$('durMax').value,
      callType:$('callType').value,callsOnly:$('callsOnly').checked,smsOnly:$('smsOnly').checked,nightOnly:$('nightOnly').checked,weekendOnly:$('weekendOnly').checked,excludeServiceSenders:$('excludeServiceSenders').checked,nightFrom:timeMins($('nightFrom').value),nightTo:timeMins($('nightTo').value),
      cellId:normalize($('cellId').value),tower:normalize($('tower').value),city:normalize($('city').value),subcity:normalize($('subcity').value),roaming:normalize($('roaming').value),imei:normalize($('imei').value),imsi:normalize($('imsi').value),provider:normalize($('provider').value),operator:normalize($('operator').value),cdrNo:$('cdrNo').value,sourceFile:$('sourceFile').value};
    state.filtered=state.records.filter(r=>{
      if(state.exactIncidentRange&&(!r.dt||r.dt<state.exactIncidentRange.start||r.dt>state.exactIncidentRange.end))return false;
      if(f.q && !matchesSmartQuery(r,$('q').value))return false; if(f.dateFrom && (!r.dt||r.dt<f.dateFrom))return false; if(f.dateTo && (!r.dt||r.dt>f.dateTo))return false;
      const mins=r.dt?r.dt.getHours()*60+r.dt.getMinutes():timeMins(r.time); if(f.timeFrom!==null&&f.timeTo!==null&&!withinNight(mins,f.timeFrom,f.timeTo))return false; else {if(f.timeFrom!==null&&f.timeTo===null&&mins<f.timeFrom)return false;if(f.timeTo!==null&&f.timeFrom===null&&mins>f.timeTo)return false;}
      if(f.bparty&&!normalize(r.bparty).includes(f.bparty))return false;if(f.durMin!==null&&r.duration<f.durMin)return false;if(f.durMax!==null&&r.duration>f.durMax)return false;if(f.callType&&r.callType!==f.callType)return false;
      const typ=normalize(r.callType);if(f.callsOnly&&!typ.includes('call'))return false;if(f.smsOnly&&!typ.includes('sms'))return false;if(f.excludeServiceSenders&&isServiceSender(r.bparty))return false;if(f.nightOnly&&!withinNight(mins,f.nightFrom,f.nightTo))return false;if(f.weekendOnly&&(!r.dt||![0,6].includes(r.dt.getDay())))return false;
      if(f.cellId&&!normalize(`${r.firstCellId} ${r.lastCellId}`).includes(f.cellId))return false;if(f.tower&&!normalize(`${r.firstAddress} ${r.lastAddress}`).includes(f.tower))return false;if(f.city&&!normalize(r.mainCity).includes(f.city))return false;if(f.subcity&&!normalize(r.subCity).includes(f.subcity))return false;if(f.roaming&&!normalize(r.roaming).includes(f.roaming))return false;
      if(f.imei&&!normalize(r.imei).includes(f.imei))return false;if(f.imsi&&!normalize(r.imsi).includes(f.imsi))return false;if(f.provider&&!normalize(r.provider).includes(f.provider))return false;if(f.operator&&!normalize(r.operator).includes(f.operator))return false;if(f.cdrNo&&r.cdrNo!==f.cdrNo)return false;if(f.sourceFile&&r.sourceFile!==f.sourceFile)return false;return true;
    });
    state.page=1;updateFilterCount();syncViewScopeControls(false);renderAll();window.dispatchEvent(new Event('cdr:updated'));
  }
  function resetFilters(){state.exactIncidentRange=null;if($('exactIncidentStatus'))$('exactIncidentStatus').textContent='Uses the incident date/time entered at the top.';['q','dateFrom','dateTo','timeFrom','timeTo','bparty','durMin','durMax','cellId','tower','city','subcity','roaming','imei','imsi','provider','operator'].forEach(id=>$(id).value='');['callType','cdrNo','sourceFile'].forEach(id=>$(id).selectedIndex=0);['callsOnly','smsOnly','nightOnly','weekendOnly','excludeServiceSenders'].forEach(id=>$(id).checked=false);$('nightFrom').value='20:00';$('nightTo').value='06:00';applyFilters();}

  function aggregateContacts(data=state.filtered){
    const m=new Map(); for(const r of data){if(!r.bparty)continue;const k=r.bpartyKey||phoneKey(r.bparty);let x=m.get(k);if(!x)x={key:k,bparty:r.bparty,aliases:new Set(),records:0,calls:0,in:0,out:0,sms:0,duration:0,first:null,last:null,towers:new Set(),providers:new Set(),cdrs:new Set()};x.aliases.add(r.bparty);x.records++;const t=normalize(r.callType);if(t.includes('call')){x.calls++;x.duration+=r.duration;if(t.includes('in'))x.in++;if(t.includes('out'))x.out++;}if(t.includes('sms'))x.sms++;if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;if(r.firstCellId)x.towers.add(r.firstCellId);if(r.provider)x.providers.add(r.provider);if(r.cdrNo)x.cdrs.add(r.cdrNo);m.set(k,x);}return [...m.values()].sort((a,b)=>b.records-a.records||b.duration-a.duration);
  }
  function locationTowerKey(r){const cell=String(r?.firstCellId||'').trim(),op=normalize(r?.operator||'');if(cell)return (op?op+'|':'cell|')+cell;return r?.firstAddress||`${r?.lat||''},${r?.lng||''}`;}
  function aggregateLocations(data=state.filtered){const m=new Map();for(const r of data){const k=locationTowerKey(r);if(!k)continue;let x=m.get(k);if(!x)x={key:k,cellId:r.firstCellId,address:r.firstAddress,lat:r.lat,lng:r.lng,az:r.azimuth,records:0,duration:0,contacts:new Set(),first:null,last:null,cdrs:new Set(),roaming:new Set(),dates:new Set(),operators:new Set()};x.records++;x.duration+=r.duration;if(r.bparty)x.contacts.add(r.bparty);if(r.cdrNo)x.cdrs.add(r.cdrNo);if(r.roaming)x.roaming.add(r.roaming);if(r.operator)x.operators.add(r.operator);if(r.dt){x.dates.add(localDateKey(r.dt));if(!x.first||r.dt<x.first)x.first=r.dt;if(!x.last||r.dt>x.last)x.last=r.dt;}m.set(k,x);}return [...m.values()].sort((a,b)=>b.records-a.records);}
  function aggregateDevices(data=state.filtered){
    const m=new Map();
    for(const r of data){
      const k=`${r.imei||'—'}|${r.imsi||'—'}`;if(k==='—|—')continue;
      let x=m.get(k);
      if(!x){
        const d=resolveDevice(r.imei,r.manufacturer,r.model);
        x={imei:r.imei,imsi:r.imsi,tac:d.tac,manufacturer:d.manufacturer,model:d.model,deviceType:r.deviceType,os:r.os||'',lookupStatus:d.status,records:0,contacts:new Set(),towers:new Set(),cdrs:new Set(),first:null,last:null};
      }
      x.records++;if(r.bparty)x.contacts.add(r.bparty);if(r.firstCellId)x.towers.add(r.firstCellId);if(r.cdrNo)x.cdrs.add(r.cdrNo);if(r.dt&&(!x.first||r.dt<x.first))x.first=r.dt;if(r.dt&&(!x.last||r.dt>x.last))x.last=r.dt;m.set(k,x);
    }
    return [...m.values()].sort((a,b)=>b.records-a.records);
  }

  function renderAll(){const active=document.querySelector('.tab.active')?.dataset.tab||'dashboard';if(active==='dashboard')renderDashboard();else if(active==='records')renderRecords();else if(active==='contacts')renderContacts();else if(active==='locations')renderLocations();else if(active==='devices')renderDevices();else if(active==='smsintel')renderSmsIntelligence();else if(active==='incident')renderIncident();else if(active==='days')renderDaySummary();else if(active==='patterns')renderPatterns();else if(active==='quality')renderDataQuality();else if(active==='movement')renderMovement();else if(active==='leads')renderLeads();else if(active==='network')requestAnimationFrame(renderNetwork);else if(active==='compare')renderCompare();else if(active==='chronology')renderChronology();else if(active==='flags')renderFlags();}
  function caseSnapshots(){try{return JSON.parse(localStorage.getItem('cdrAnalyzer:caseSnapshots')||'[]')||[]}catch{return []}}
  function renderCaseSnapshots(){const rows=caseSnapshots();const el=$('caseSnapshots');if(!el)return;el.innerHTML=rows.length?rows.map((x,i)=>`<div class="file-item"><b>${escapeHtml(x.caseNo||x.title||'Untitled case')}</b><span>${escapeHtml(x.title||'')} • ${escapeHtml(x.station||'')} • ${escapeHtml(x.incidentDate||'')} <button class="btn secondary small load-case-snapshot" data-i="${i}">Open</button> <button class="file-remove delete-case-snapshot" data-i="${i}">×</button></span></div>`).join(''):'No case snapshots saved yet.';}
  function saveCaseSnapshot(){const rows=caseSnapshots();rows.unshift({title:$('caseTitle').value,caseNo:$('caseNo').value,station:$('station').value,analyst:$('analyst').value,incidentDate:$('incidentDate').value,incidentTime:$('incidentTime').value,savedAt:new Date().toISOString()});persistLocal('cdrAnalyzer:caseSnapshots',JSON.stringify(rows.slice(0,50)));renderCaseSnapshots();}
  function renderDashboard(){
    renderCaseSnapshots();
    const selected=$('cdrNo')?.value||'',eventType=$('callType')?.value||'';
    const d=state.filtered;
    if($('dashboardScopeText')){
      const subjectText=selected?selected:'All subjects',eventText=eventType||'All event types';
      $('dashboardScopeText').textContent=`${subjectText} • ${eventText} • ${fmtInt(d.length)} records within current filters.`;
    }
    const contacts=aggregateContacts(d), locs=aggregateLocations(d), devs=aggregateDevices(d), calls=d.filter(r=>normalize(r.callType).includes('call')), sms=d.filter(r=>normalize(r.callType).includes('sms')), duration=calls.reduce((s,r)=>s+r.duration,0), dates=d.filter(r=>r.dt).map(r=>r.dt);
    const min=dates.length?new Date(Math.min(...dates)):null,max=dates.length?new Date(Math.max(...dates)):null; const uniqueImei=new Set(d.map(r=>r.imei).filter(Boolean)).size, uniqueImsi=new Set(d.map(r=>r.imsi).filter(Boolean)).size;
    const k=[['Dashboard records',fmtInt(d.length),[selected?`Subject ${selected}`:'All subjects',eventType||'All event types'].join(' • ')],['Unique contacts',fmtInt(contacts.length),`${fmtInt(calls.length)} call records`],['Total call duration',fmtDur(duration),`${fmtInt(sms.length)} SMS records`],['Unique towers',fmtInt(locs.length),min&&max?`${dateFmt(min)} – ${dateFmt(max)}`:'—'],['Unique devices (IMEI)',fmtInt(uniqueImei),'Handset identifiers'],['Unique SIMs (IMSI)',fmtInt(uniqueImsi),'SIM / subscription identities'],['CDR numbers',fmtInt(new Set(d.map(r=>r.cdrNo).filter(Boolean)).size),`${fmtInt(state.files.length)} file(s)`]];
    $('kpis').innerHTML=k.map(x=>`<div class="kpi"><div class="v">${x[1]}</div><div class="l">${x[0]}</div><div class="s">${x[2]}</div></div>`).join(''); $('topContactBadge').textContent=contacts.length;
    renderCharts(d,contacts);
    $('dashLocations').innerHTML=locs.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr><th>Cell ID / location</th><th>Records</th><th>Contacts</th></tr></thead><tbody>${locs.slice(0,8).map(x=>`<tr><td><a href="#" class="link dashboard-location-filter" data-cell="${escAttr(x.cellId||'')}" data-tower="${escAttr(x.address||'')}" title="Open matching CDR records">${escapeHtml(x.cellId||x.address||'—')}</a>${x.cellId&&x.address?`<div class="tiny">${escapeHtml(x.address)}</div>`:''}</td><td>${fmtInt(x.records)}</td><td>${fmtInt(x.contacts.size)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
    $('dashDevices').innerHTML=devs.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr><th>Model</th><th>IMEI</th><th>IMSI</th><th>Records</th></tr></thead><tbody>${devs.slice(0,8).map(x=>`<tr><td><a href="#" class="link dashboard-device-filter" data-imei="${escAttr(x.imei||'')}" data-imsi="${escAttr(x.imsi||'')}" title="Open this device / SIM analysis">${escapeHtml([x.manufacturer,x.model].filter(Boolean).join(' ')||'Unknown model')}</a></td><td>${escapeHtml(x.imei||'—')}</td><td>${escapeHtml(x.imsi||'—')}</td><td>${fmtInt(x.records)}</td></tr>`).join('')}</tbody></table></div>`:'<div class="empty">No matching data</div>';
  }
  function simpleTable(headers,rows){return rows.length?`<div class="tablewrap" style="max-height:350px"><table class="table"><thead><tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:`<div class="empty">No matching data</div>`;}
  function newChart(id,config){if(state.charts[id])state.charts[id].destroy(); if(typeof Chart==='undefined')return; state.charts[id]=new Chart($(id),config);}
  function renderCharts(data,contacts){
    const top=contacts.slice(0,12);newChart('contactsChart',{type:'bar',data:{labels:top.map(x=>contactLabel(x.bparty)),datasets:[{label:'Records',data:top.map(x=>x.records)}]},options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',onClick:(evt,els)=>{if(!els.length)return;const x=top[els[0].index];if(x)contactFilter(x.bparty);},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{display:false}},scales:{x:{beginAtZero:true}}}});
    const hours=Array(24).fill(0);data.forEach(r=>{if(r.dt)hours[r.dt.getHours()]++;else{const t=parseTime(r.time);if(t)hours[t.h]++;}});newChart('hourChart',{type:'bar',data:{labels:hours.map((_,i)=>String(i).padStart(2,'0')),datasets:[{label:'Records',data:hours}]},options:{responsive:true,maintainAspectRatio:false,onClick:(evt,els)=>{if(!els.length)return;const h=String(els[0].index).padStart(2,'0');$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
    const tm={};data.forEach(r=>{const k=r.callType||'Unknown';tm[k]=(tm[k]||0)+1});
    const entries=Object.entries(tm).sort((a,b)=>b[1]-a[1]).slice(0,10);
    const eventColor=(label,i)=>{
      const n=normalize(label).replace(/\s+/g,'_');
      if(n.includes('call_in')||(n.includes('call')&&n.includes('in')))return '#31f7a8';
      if(n.includes('call_out')||(n.includes('call')&&n.includes('out')))return '#33ddff';
      if(n.includes('sms_in')||(n.includes('sms')&&n.includes('in')))return '#a78bfa';
      if(n.includes('sms_out')||(n.includes('sms')&&n.includes('out')))return '#ffb454';
      const palette=['#ff5d78','#4ade80','#60a5fa','#f472b6','#facc15','#22d3ee','#c084fc','#fb7185','#34d399','#f97316'];
      return palette[i%palette.length];
    };
    const typeColors=entries.map((x,i)=>eventColor(x[0],i));
    newChart('typeChart',{type:'doughnut',data:{labels:entries.map(x=>x[0]),datasets:[{
      data:entries.map(x=>x[1]),
      backgroundColor:typeColors,
      borderColor:'#07111d',
      borderWidth:3,
      hoverBorderColor:'#e7fbff',
      hoverBorderWidth:3,
      hoverOffset:8
    }]},options:{responsive:true,maintainAspectRatio:false,cutout:'56%',onClick:(evt,els)=>{if(!els.length)return;const x=entries[els[0].index];if(!x)return;$('callType').value=x[0];applyFilters();switchTab('records');},onHover:(evt,els)=>{evt.native.target.style.cursor=els.length?'pointer':'default';},plugins:{legend:{position:'bottom',labels:{boxWidth:12,boxHeight:12,usePointStyle:true,pointStyle:'rectRounded',padding:12,color:'#9fc6d6',font:{size:10}}},tooltip:{callbacks:{label:ctx=>` ${ctx.label}: ${fmtInt(ctx.raw)}`}}}}});
  }

  function sortData(arr){const {key,dir}=state.sort;const mul=dir==='asc'?1:-1;return [...arr].sort((a,b)=>{let x=a[key],y=b[key];if(key==='dt'){x=x?.getTime?.()||0;y=y?.getTime?.()||0;}else if(key==='duration'){x=+x||0;y=+y||0;}else{x=String(x??'').toLowerCase();y=String(y??'').toLowerCase();}return x<y?-mul:x>y?mul:0;});}
  function typePill(t){const n=normalize(t);const cls=n.includes('sms')?'sms':n.includes('in')?'in':n.includes('out')?'out':'';return `<span class="pill ${cls}">${escapeHtml(t||'—')}</span>`;}
  function jumpToRecord(rec){return recordsModule?.jumpToRecord(rec);}
  function renderRecords(){return recordsModule?.render();}
  function renderContacts(){return contactsModule?.render();}
  function selectRequestContacts(){
    for(const x of aggregateContacts()){const id=requestIdentifier(x.bparty);if(id)state.requestSelected.add(id);}
    renderContacts();showStatus(`${state.requestSelected.size} numeric contact(s) selected for CDR request.`,'ok');
  }
  function openCdrRequestGenerator(){
    if(!state.requestSelected.size){showStatus('Select at least one numeric contact for the CDR request.','error');return;}
    const from=$('cdrRequestFrom').value,to=$('cdrRequestTo').value;
    if(from&&to&&from>to){showStatus('CDR request From date cannot be later than To date.','error');return;}
    const entries=[];
    for(const number of state.requestSelected){
      const rows=state.records.filter(r=>requestIdentifier(r.bparty)===number),raw=rows[0]?.bparty||number;
      const relation=[contactTag(raw),contactName(raw)].filter(Boolean).join(' - ')||'CDR Contact';
      const dates=rows.filter(r=>r.dt).map(r=>r.dt).sort((a,b)=>a-b);
      entries.push({number,relation,fromDate:from||(dates.length?localDateKey(dates[0]):''),toDate:to||(dates.length?localDateKey(dates[dates.length-1]):'')});
    }
    const draft={version:1,source:'cdr-analyzer',createdAt:new Date().toISOString(),case:{title:$('caseTitle').value||'',caseNo:$('caseNo').value||'',station:$('station').value||'',analyst:$('analyst').value||''},entries};
    localStorage.setItem('cdrAnalyzer:requestDraftV1',JSON.stringify(draft));
    window.open('/policedocuments/cdr_request_generator.html?from=cdr-analyzer','_blank','noopener');
  }

  function renderContactProfile(num){return contactsModule?.renderProfile(num);}
  function mapLink(x){return locationsModule?.mapLink(x)||'';}
  function renderLocationMatchSubjects(){return locationsModule?.renderLocationMatchSubjects();}
  function locationPairEvents(data,windowMin){return locationsModule?.locationPairEvents(data,windowMin)||[];}
  function locationEpisodes(events,episodeGapMin){return locationsModule?.locationEpisodes(events,episodeGapMin)||[];}
  function multiSubjectSameCellMatches(data,subjects,windowMin){return locationsModule?.multiSubjectSameCellMatches(data,subjects,windowMin)||[];}
  function locationSharedSummary(episodes){return locationsModule?.locationSharedSummary(episodes)||[];}
  function renderLocationMatches(){return locationsModule?.renderLocationMatches();}
  function renderLocations(){return locationsModule?.renderLocations();}

  function analyzeIdentifiers(data=state.filtered){return devicesModule?.analyzeIdentifiers(data)||{byMsisdn:new Map(),byImsi:new Map(),byImei:new Map(),events:[],msisdnNewImsi:[],imsiNewImei:[],imeiMultiImsi:[],imsiCrossCdr:[],repeatedSwaps:[]};}
  function renderDevices(){return devicesModule?.renderDevices();}

  function movementDateRange(){return movementModule?.movementDateRange()||{from:'',to:'',valid:true};}
  function movementDateMatch(r){return movementModule?.movementDateMatch(r)??false;}
  function movementRows(){return movementModule?.movementRows()||[];}

  function renderSmsIntelligence(){return analysisModule?.renderSmsIntelligence();}
  function renderIncident(){return analysisModule?.renderIncident();}
  function renderDaySummary(){return analysisModule?.renderDaySummary();}
  function renderPatterns(){return analysisModule?.renderPatterns();}
  function renderDataQuality(){return analysisModule?.renderDataQuality();}
  function renderMovementMap(rows,attempt=0){return movementModule?.renderMovementMap(rows,attempt);}
  function updateMovementPlayback(i,openPopup=true,pan=true){return movementModule?.updateMovementPlayback(i,openPopup,pan);}
  function stopMovementPlayback(){return movementModule?.stopMovementPlayback();}
  function scheduleMovementPlayback(){return movementModule?.scheduleMovementPlayback();}
  function toggleMovementPlayback(){return movementModule?.toggleMovementPlayback();}
  function shiftLocalDateKey(key,days){return movementModule?.shiftLocalDateKey(key,days)||key;}
  function displayLocalDateKey(key){return movementModule?.displayLocalDateKey(key)||key||'—';}
  function nightStayAnalysis(){return movementModule?.nightStayAnalysis()||{rows:[],start:1200,end:360,wrap:true,recurring:null,totalEvents:0,distinctMain:0};}
  function renderMovement(){return movementModule?.renderMovement();}

  function findBursts(data,mins,minCount){return analysisModule?.findBursts(data,mins,minCount)||[];}
  function identifierUsage(cdr,field){return analysisModule?.identifierUsage(cdr,field)||[];}
  function deviceChangeDetailsHtml(cdr){return analysisModule?.deviceChangeDetailsHtml(cdr)||'';}
  function buildLeads(){return analysisModule?.buildLeads()||{high:[],p95:0,bursts:[],night:[],longCalls:[],cf:[],deviceChanges:[],identifierAnalysis:analyzeIdentifiers([]),roam:{},incident:[],inc:null};}
  function renderLeads(){return analysisModule?.renderLeads();}

  function renderNetwork(){return networkModule?.renderNetwork();}
  function colocationEvents(data=state.filtered,windowMin=30){return networkModule?.colocationEvents(data,windowMin)||[];}
  function colocationEpisodes(data=state.filtered,windowMin=30,episodeGapMin=60){return networkModule?.colocationEpisodes(data,windowMin,episodeGapMin)||[];}
  function colocationMatches(data=state.filtered,windowMin=30){return networkModule?.colocationMatches(data,windowMin)||[];}
  function renderCompare(){return networkModule?.renderCompare();}

  function renderFlags(){const rows=state.filtered.filter(r=>state.flags.has(r.id));$('flagList').innerHTML=rows.length?rows.map(r=>`<div class="note-card"><div class="record-summary"><b title="${escAttr(contactTitle(r.bparty))}">${escapeHtml(contactLabel(r.bparty))}</b> • ${escapeHtml(dtFmt(r.dt)||`${r.date} ${r.time}`)} • ${escapeHtml(r.callType)} • ${fmtDur(r.duration)} <button class="lead-action lead-view-record" data-id="${r.id}">View record</button><br>${escapeHtml(r.firstAddress||r.firstCellId||'')}</div><textarea class="row-note" data-id="${r.id}" placeholder="Note for this record…">${escapeHtml(state.notes[r.id]||'')}</textarea><div style="margin-top:6px"><button class="btn secondary small add-chronology" data-id="${r.id}">Add to chronology</button> <button class="btn secondary small unflag" data-id="${r.id}">Remove flag</button></div></div>`).join(''):`<div class="empty">No records flagged yet.</div>`;}

  function renderChronology(){const allowed=new Set(subjectEventScopedRecords(state.records).map(r=>r.id));const rows=state.chronology.filter(x=>x.source==='Manual'||!x.recordId||allowed.has(x.recordId)).sort((a,b)=>a.time-b.time);$('chronologyTable').innerHTML=`<thead><tr><th>Date/time</th><th>Source</th><th>Event</th><th>Reference</th><th></th></tr></thead><tbody>${rows.map(x=>`<tr><td>${dtFmt(new Date(x.time))}</td><td>${escapeHtml(x.source)}</td><td class="details">${escapeHtml(x.text)}</td><td>${escapeHtml(x.reference||'')}</td><td><button class="file-remove remove-chronology" data-id="${x.id}">×</button></td></tr>`).join('')}</tbody>`;}
  function switchTab(id){document.querySelectorAll('.view').forEach(v=>{v.setAttribute('role','tabpanel');v.classList.toggle('hidden',v.id!==id)});document.querySelectorAll('.tab').forEach(t=>{const active=t.dataset.tab===id;t.classList.toggle('active',active);t.setAttribute('aria-selected',String(active));});if(id==='dashboard')renderDashboard();else if(id==='records')renderRecords();else if(id==='contacts')renderContacts();else if(id==='locations')renderLocations();else if(id==='devices')renderDevices();else if(id==='smsintel')renderSmsIntelligence();else if(id==='incident')renderIncident();else if(id==='days')renderDaySummary();else if(id==='patterns')renderPatterns();else if(id==='quality')renderDataQuality();else if(id==='movement'){requestAnimationFrame(()=>renderMovement());setTimeout(()=>movementModule?.invalidateMap(),300);}else if(id==='leads')renderLeads();else if(id==='network')requestAnimationFrame(renderNetwork);else if(id==='compare')renderCompare();else if(id==='relationship'){window.CDRRelationship?.render?.();}else if(id==='chronology')renderChronology();else if(id==='flags')renderFlags();}
  function contactFilter(num){$('bparty').value=num;applyFilters();switchTab('records');}
  function csvCell(v){return reportsModule?.csvCell(v)??String(v??'');}
  function download(name,text,type='text/plain;charset=utf-8'){return reportsModule?.download(name,text,type);}
  function exportCsv(records,name){return reportsModule?.exportCsv(records,name);}
  function exportWorkbook(){return reportsModule?.exportWorkbook();}

  function safeName(s){return String(s||'cdr_case').replace(/[^a-z0-9_-]+/gi,'_').replace(/^_+|_+$/g,'').slice(0,60)||'cdr_case';}

  function filterSnapshot(){return workspaceModule?.filterSnapshot()||{};}
  function applyFilterSnapshot(f){return workspaceModule?.applyFilterSnapshot(f);}
  function workspacePayload(){return workspaceModule?.workspacePayload()||{};}
  function saveWorkspace(){return workspaceModule?.saveWorkspace();}
  function restorePendingWorkspace(){return workspaceModule?.restorePendingWorkspace();}
  function loadWorkspaceObject(obj){return workspaceModule?.loadWorkspaceObject(obj);}
  function clearLoaded(){return workspaceModule?.clearLoaded();}
  function applyIncidentWindow(){return workspaceModule?.applyIncidentWindow();}

  function reportTable(headers,rows){return reportsModule?.reportTable(headers,rows)||'';}
  function reportSection(on,title,body){return reportsModule?.reportSection(on,title,body)||'';}
  function exportCaseReport(){return reportsModule?.exportCaseReport();}

  $('exportDirectoryBtn').onclick=()=>download('cdr_contact_directory.json',JSON.stringify({version:2,exportedAt:new Date().toISOString(),contactTags:state.globalContactTags,contactNames:state.globalContactNames},null,2),'application/json');
  $('importDirectoryBtn').onclick=()=>$('directoryInput').click();
  $('directoryInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{const d=JSON.parse(await f.text());state.globalContactTags={...state.globalContactTags,...(d.contactTags||{})};state.globalContactNames={...state.globalContactNames,...(d.contactNames||{})};persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));renderAll();showStatus('Contact directory imported.','ok');}catch(err){showStatus('Directory import failed: '+err.message,'error');}e.target.value='';});
  recordsModule=window.CDRRecordsFactory?.({
    $,state,sortData,typePill,escapeHtml,escAttr,fmtInt,fmtDur,dtFmt,contactTitle,contactLabel,localDateKey,applyFilters,switchTab
  })||null;
  recordsModule?.bind();

  contactsModule=window.CDRContactsFactory?.({
    $,state,aggregateContacts,aggregateLocations,identityStore,defaultCdrRequestDates,updateCdrRequestCount,requestIdentifier,
    escAttr,escapeHtml,contactTitle,contactLabel,contactTag,serviceSenderType,fmtInt,fmtDur,dtFmt,simpleTable
  })||null;

  locationsModule=window.CDRLocationsFactory?.({
    $,state,uniq,escAttr,escapeHtml,localDateKey,locationTowerKey,fmtInt,dtFmt,aggregateLocations,fmtDur
  })||null;
  locationsModule?.bind();

  devicesModule=window.CDRDevicesFactory?.({
    $,state,learnTacFromRecords,updateTacStatus,aggregateDevices,fmtInt,escapeHtml,dtFmt,imeiStructure,resolveDevice
  })||null;

  movementModule=window.CDRMovementFactory?.({
    $,state,localDateKey,haversineKm,fmtInt,fmtDur,dtFmt,dateFmt,escapeHtml,escAttr,mapLink,newChart,
    incidentDateTime,contactLabel,showStatus,timeMins,withinNight
  })||null;
  movementModule?.bind();

  networkModule=window.CDRNetworkFactory?.({
    $,state,aggregateContacts,contactLabel,phoneKey,localDateKey,simpleTable,escapeHtml,escAttr,contactTitle,fmtInt,dtFmt,fmtDur
  })||null;
  networkModule?.bind();

  analysisModule=window.CDRAnalysisFactory?.({
    $,state,smsIntelRows,smsSenderIntelligence,senderBrandInfo,fmtInt,escapeHtml,dtFmt,
    incidentDateTime,subjectEventScopedRecords,localDateKey,aggregateContacts,simpleTable,
    escAttr,contactLabel,contactTitle,typePill,fmtDur,normalize,analyzeIdentifiers,percentile,
    setSubjectEventScope
  })||null;
  analysisModule?.bind();

  reportsModule=window.CDRReportsFactory?.({
    $,state,dtFmt,contactLabel,aggregateContacts,aggregateLocations,aggregateDevices,
    contactTag,serviceSenderType,imeiStructure,resolveDevice,analyzeIdentifiers,
    smsSenderIntelligence,movementRows,colocationEpisodes,incidentDateTime,showStatus,
    safeName,buildLeads,escapeHtml,fmtInt,fmtDur,localDateKey
  })||null;

  workspaceModule=window.CDRWorkspaceFactory?.({
    $,state,download,dtFmt,applyFilters,incidentDateTime,refreshSelectors,renderAll,renderFileList,
    safeName,showStatus,stableKey
  })||null;

  $('chooseBtn').onclick=()=>$('fileInput').click();$('fileInput').onchange=e=>loadFiles([...e.target.files]); const dz=$('dropZone');['dragenter','dragover'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.add('drag')}));['dragleave','drop'].forEach(ev=>dz.addEventListener(ev,e=>{e.preventDefault();dz.classList.remove('drag')}));dz.addEventListener('drop',e=>loadFiles([...e.dataTransfer.files]));
  $('mobileFiltersBtn').onclick=()=>setFilterDrawer(true);$('closeFiltersBtn').onclick=()=>setFilterDrawer(false);$('filterBackdrop').onclick=()=>setFilterDrawer(false);
  $('privateSessionBtn').onclick=()=>{state.privateSession=!state.privateSession;updatePrivacyUi();showStatus(state.privateSession?'Private Session enabled. New local persistence is paused.':'Private Session disabled. Local persistence is enabled.','ok');};
  $('clearLocalDataBtn').onclick=()=>{if(!confirm('Clear locally saved CDR Analyzer case metadata, contact names/tags and case snapshots from this browser? Loaded CDR rows in the current session will remain open.'))return;for(const k of Object.keys(localStorage)){if(k.startsWith('cdrAnalyzer:'))localStorage.removeItem(k);}state.contactTags={};state.contactNames={};state.globalContactTags={};state.globalContactNames={};['caseTitle','caseNo','station','analyst','incidentDate','incidentTime','generalNote'].forEach(id=>{if($(id))$(id).value='';});renderCaseSnapshots();renderAll();showStatus('Local case data cleared from this browser.','ok');};
  installViewScopeToolbars();syncViewScopeControls(true);
    updatePrivacyUi();updateFilterCount();
  $('addChronologyManualBtn').onclick=()=>{const t=$('chronologyText').value.trim();if(!t)return;const d=$('chronologyDt').value?new Date($('chronologyDt').value):new Date();state.chronology.push({id:'m'+Date.now(),time:+d,source:'Manual',text:t,reference:''});$('chronologyText').value='';renderChronology();};$('saveCaseSnapshotBtn').onclick=saveCaseSnapshot;$('applyBtn').onclick=()=>{applyFilters();if(window.innerWidth<=1100)setFilterDrawer(false);};$('resetBtn').onclick=resetFilters;$('printBtn').onclick=()=>window.print();$('reportBtn').onclick=exportCaseReport;$('saveWorkspaceBtn').onclick=saveWorkspace;$('loadWorkspaceBtn').onclick=()=>$('workspaceInput').click();$('clearFilesBtn').onclick=clearLoaded;$('focusIncidentBtn').onclick=applyIncidentWindow;$('importTacBtn').onclick=()=>$('tacInput').click();
  $('exportTacBtn').onclick=exportTacCache;
  $('tacInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{await importTacDatabase(f);}catch(err){showStatus('TAC import failed: '+err.message,'error');}e.target.value='';});
  $('exportBtn').onclick=()=>exportCsv(state.filtered,`${safeName($('caseNo').value||$('caseTitle').value)}_filtered_cdr.csv`);$('exportFlagsBtn').onclick=()=>exportCsv(state.records.filter(r=>state.flags.has(r.id)),`${safeName($('caseNo').value||$('caseTitle').value)}_flagged_cdr.csv`);$('exportXlsxBtn').onclick=exportWorkbook;
  $('exportNotesBtn').onclick=()=>{const payload={case:{title:$('caseTitle').value,caseNo:$('caseNo').value,station:$('station').value,analyst:$('analyst').value},generalNote:$('generalNote').value,recordNotes:state.notes,flagged:[...state.flags]};download(`${safeName($('caseNo').value||$('caseTitle').value)}_notes.json`,JSON.stringify(payload,null,2),'application/json');};
  $('workspaceInput').addEventListener('change',async e=>{const f=e.target.files?.[0];if(!f)return;try{loadWorkspaceObject(JSON.parse(await f.text()));}catch(err){showStatus('Workspace load failed: '+err.message,'error');}e.target.value='';});
  $('tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(b)switchTab(b.dataset.tab)});$('tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;const tabs=[...document.querySelectorAll('.tab')],cur=tabs.indexOf(document.activeElement);if(cur<0)return;e.preventDefault();let n=e.key==='Home'?0:e.key==='End'?tabs.length-1:e.key==='ArrowRight'?(cur+1)%tabs.length:(cur-1+tabs.length)%tabs.length;tabs[n].focus();switchTab(tabs[n].dataset.tab);});document.addEventListener('click',e=>{const j=e.target.closest('[data-jump]');if(j)switchTab(j.dataset.jump);const lr=e.target.closest('.location-records-filter');if(lr){e.preventDefault();$('cellId').value=lr.dataset.cell||'';$('tower').value=lr.dataset.tower||'';$('operator').value=lr.dataset.operator||'';applyFilters();switchTab('records');}const lm=e.target.closest('.location-movement');if(lm){e.preventDefault();$('cdrNo').value=lm.dataset.subject||'';$('cellId').value='';$('tower').value='';$('operator').value='';applyFilters();syncViewScopeControls(false);if($('movementCdr'))$('movementCdr').value=lm.dataset.subject||'';switchTab('movement');}const dl=e.target.closest('.dashboard-location-filter');if(dl){e.preventDefault();$('cellId').value=dl.dataset.cell||'';$('tower').value=dl.dataset.tower||'';applyFilters();switchTab('records');}const dd=e.target.closest('.dashboard-device-filter');if(dd){e.preventDefault();$('imei').value=dd.dataset.imei||'';$('imsi').value=dd.dataset.imsi||'';applyFilters();switchTab('devices');}const c=e.target.closest('.contact-filter');if(c){e.preventDefault();contactFilter(c.dataset.num);}const f=e.target.closest('.flag-btn');if(f){const id=f.dataset.id;state.flags.has(id)?state.flags.delete(id):state.flags.add(id);renderRecords();renderFlags();}const u=e.target.closest('.unflag');if(u){state.flags.delete(u.dataset.id);renderRecords();renderFlags();}const cp=e.target.closest('.contact-profile-btn');if(cp){e.preventDefault();renderContactProfile(cp.dataset.num);$('contactProfilePanel').scrollIntoView({behavior:'smooth',block:'start'});}const lcr=e.target.closest('.lead-contact-records');if(lcr){e.preventDefault();contactFilter(lcr.dataset.num);}const lvr=e.target.closest('.lead-view-record');if(lvr){e.preventDefault();jumpToRecord(state.records.find(r=>r.id===lvr.dataset.id));}const fl=e.target.closest('.contact-first-last');if(fl){const rr=state.records.filter(r=>samePhone(r.bparty,fl.dataset.num)&&r.dt).sort((a,b)=>a.dt-b.dt);jumpToRecord(fl.dataset.which==='last'?rr[rr.length-1]:rr[0]);}const cs=e.target.closest('.load-case-snapshot');if(cs){const x=caseSnapshots()[+cs.dataset.i];if(x){$('caseTitle').value=x.title||'';$('caseNo').value=x.caseNo||'';$('station').value=x.station||'';$('analyst').value=x.analyst||'';$('incidentDate').value=x.incidentDate||'';$('incidentTime').value=x.incidentTime||'';renderIncident();}}const cd=e.target.closest('.delete-case-snapshot');if(cd){const rows=caseSnapshots();rows.splice(+cd.dataset.i,1);persistLocal('cdrAnalyzer:caseSnapshots',JSON.stringify(rows));renderCaseSnapshots();}const df=e.target.closest('.day-filter');if(df){$('dateFrom').value=df.dataset.date;$('dateTo').value=df.dataset.date;applyFilters();switchTab('records');}const ph=e.target.closest('.pattern-hour-filter');if(ph){const h=String(+ph.dataset.hour).padStart(2,'0');$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const phd=e.target.closest('.pattern-hour-date-filter');if(phd){const h=String(+phd.dataset.hour).padStart(2,'0');$('dateFrom').value=phd.dataset.date;$('dateTo').value=phd.dataset.date;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pch=e.target.closest('.pattern-contact-hour-filter');if(pch){const h=String(+pch.dataset.hour).padStart(2,'0');$('bparty').value=pch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();switchTab('records');}const pwch=e.target.closest('.pattern-weekday-contact-hour-filter');if(pwch){const h=String(+pwch.dataset.hour).padStart(2,'0'),w=+pwch.dataset.weekday;$('bparty').value=pwch.dataset.num;$('timeFrom').value=h+':00';$('timeTo').value=h+':59';applyFilters();state.filtered=state.filtered.filter(r=>r.dt&&r.dt.getDay()===w);state.page=1;switchTab('records');showStatus('Showing '+['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][w]+' records for '+contactLabel(pwch.dataset.num)+' during '+h+':00–'+h+':59.','ok');}const ns=e.target.closest('.night-stay-filter');if(ns){e.preventDefault();const startKey=ns.dataset.night,endKey=shiftLocalDateKey(startKey,1);$('cdrNo').value=ns.dataset.subject||'';$('dateFrom').value=startKey;$('dateTo').value=(timeMins($('nightFrom').value)>timeMins($('nightTo').value))?endKey:startKey;$('nightOnly').checked=true;$('cellId').value='';$('tower').value='';if(ns.dataset.cell)$('cellId').value=ns.dataset.cell;else if(ns.dataset.tower)$('tower').value=ns.dataset.tower;applyFilters();switchTab('records');showStatus('Showing records for the selected subject, night window and main recorded tower.','ok');}const ac=e.target.closest('.add-chronology');if(ac){const r=state.records.find(x=>x.id===ac.dataset.id);if(r&&!state.chronology.some(x=>x.recordId===r.id)){state.chronology.push({id:'r'+r.id,recordId:r.id,time:+(r.dt||new Date()),source:'CDR',text:`${contactLabel(r.bparty)} • ${r.callType} • ${fmtDur(r.duration)}`,reference:`${r.sourceFile} / ${r.sourceSheet} / row ${r.rowNumber}`});}switchTab('chronology');}const rc=e.target.closest('.remove-chronology');if(rc){state.chronology=state.chronology.filter(x=>x.id!==rc.dataset.id);renderChronology();}const rm=e.target.closest('[data-remove-file]');if(rm){const id=+rm.dataset.removeFile;state.records=state.records.filter(r=>r.fileId!==id);state.files=state.files.filter(f=>f.id!==id);refreshSelectors();renderFileList();applyFilters();showStatus('File removed from this browser session.','ok');}});
  $('flagList').addEventListener('input',e=>{if(e.target.classList.contains('row-note'))state.notes[e.target.dataset.id]=e.target.value;});
  document.addEventListener('change',e=>{
    if(e.target.classList.contains('view-scope-subject')){setSubjectEventScope(e.target.value,$('callType')?.value||'');}
    else if(e.target.classList.contains('view-scope-event')){setSubjectEventScope($('cdrNo')?.value||'',e.target.value);}
    else if(e.target.classList.contains('view-scope-bparty')){$('bparty').value=e.target.value||'';applyFilters();}
  });
  document.addEventListener('keydown',e=>{if(e.target.classList.contains('view-scope-bparty')&&e.key==='Enter'){e.preventDefault();$('bparty').value=e.target.value||'';applyFilters();}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('.view-scope-clear');if(!b)return;
    if(b.closest('#records'))$('bparty').value='';
    setSubjectEventScope('','');
  });
  $('dashboardCdr').onchange=e=>setSubjectEventScope(e.target.value,$('callType')?.value||'');
  $('dashboardEventType').onchange=e=>setSubjectEventScope($('cdrNo')?.value||'',e.target.value);
  $('selectRequestContactsBtn').onclick=selectRequestContacts;
  $('clearRequestContactsBtn').onclick=()=>{state.requestSelected.clear();renderContacts();};
  $('openCdrRequestBtn').onclick=openCdrRequestGenerator;
  $('identityScope').onchange=renderContacts;
  $('contactsTable').addEventListener('change',e=>{
    if(e.target.classList.contains('cdr-request-check')){e.target.checked?state.requestSelected.add(e.target.dataset.num):state.requestSelected.delete(e.target.dataset.num);updateCdrRequestCount();return;}
    if(e.target.classList.contains('contact-tag')){
      const v=e.target.value==='Unclassified'?'':e.target.value,store=identityStore('tag');store[e.target.dataset.num]=v;
      if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
      renderContacts();
    }
    if(e.target.classList.contains('contact-name')){
      const store=identityStore('name');store[e.target.dataset.num]=e.target.value.trim();
      if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));
      renderAll();switchTab('contacts');
    }
  });
  $('contactsTable').addEventListener('input',e=>{if(e.target.classList.contains('contact-name')){const store=identityStore('name');store[e.target.dataset.num]=e.target.value;if($('identityScope').value==='global')persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));}});

  window.addEventListener('resize',()=>{const n=document.getElementById('network');if(n&&!n.classList.contains('hidden'))renderNetwork();});
  try{state.globalContactTags=JSON.parse(localStorage.getItem('cdrAnalyzer:globalContactTags')||localStorage.getItem('cdrAnalyzer:contactTags')||'{}')||{};}catch{state.globalContactTags={};}
  try{state.tacCache=JSON.parse(localStorage.getItem('cdrAnalyzer:tacCache')||'{}')||{};}catch{state.tacCache={};}
  seedBuiltinTacMappings();
  try{state.globalContactNames=JSON.parse(localStorage.getItem('cdrAnalyzer:globalContactNames')||localStorage.getItem('cdrAnalyzer:contactNames')||'{}')||{};}catch{state.globalContactNames={};}
  state.contactTags={};state.contactNames={};
  if(!localStorage.getItem('cdrAnalyzer:globalContactTags')&&Object.keys(state.globalContactTags).length)persistLocal('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
  if(!localStorage.getItem('cdrAnalyzer:globalContactNames')&&Object.keys(state.globalContactNames).length)persistLocal('cdrAnalyzer:globalContactNames',JSON.stringify(state.globalContactNames));
  ['caseTitle','caseNo','station','analyst','incidentDate','incidentTime','incidentWindowHours','generalNote'].forEach(id=>{const el=$(id);const key='cdrAnalyzer:'+id;el.value=localStorage.getItem(key)||'';el.addEventListener('input',()=>persistLocal(key,el.value));});
  document.querySelectorAll('.view').forEach(v=>v.setAttribute('role','tabpanel'));document.querySelectorAll('.tab').forEach(t=>t.setAttribute('tabindex',t.classList.contains('active')?'0':'-1'));
  if(typeof XLSX==='undefined')showStatus('The local XLSX library did not load. Refresh the analyzer files.','error');
  if('serviceWorker' in navigator){navigator.serviceWorker.register('/cdranalysis/sw.js',{updateViaCache:'none'}).then(r=>r.update()).catch(()=>{});}
  window.CDRApp={
    getRecords:()=>state.records,
    getFilteredRecords:()=>state.filtered,
    currentSubject:()=>$('cdrNo')?.value||'',
    formatDateTime:dtFmt,
    formatDuration:fmtDur,
    contactLabel,
    switchTab,
    openPairRecords:(subject,other)=>{if($('cdrNo'))$('cdrNo').value=subject||'';if($('bparty'))$('bparty').value=other||'';applyFilters();switchTab('records');},
    refresh:()=>{refreshSelectors();applyFilters();}
  };
  renderAll();
  window.dispatchEvent(new Event('cdr:updated'));
})();
