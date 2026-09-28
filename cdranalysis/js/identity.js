(() => {
  'use strict';
  window.CDRIdentityFactory = function(ctx){
    const {
      $,state,normalize,analyzeIdentifiers,download,fmtInt,localDateKey,renderDevices,showStatus,
      subjectEventScopedRecords,timeMins,withinNight
    }=ctx;

  function contactName(num){const n=String(num??'').trim();return String(state.contactNames[n]??state.globalContactNames[n]??'').trim();}
  function contactTag(num){const n=String(num??'').trim();return String(state.contactTags[n]??state.globalContactTags[n]??'').trim();}
  function contactLabel(num){const n=String(num??'').trim();const name=contactName(n);return name||n||'—';}
  function contactTitle(num){const n=String(num??'').trim();const name=contactName(n),tag=contactTag(n);return [name&&n?name+' • '+n:(name||n||'—'),tag].filter(Boolean).join(' • ');}
  function identityStore(kind){const global=$('identityScope')?.value==='global';return kind==='name'?(global?state.globalContactNames:state.contactNames):(global?state.globalContactTags:state.contactTags);}

  function persistLocal(key,value){if(!state.privateSession)localStorage.setItem(key,value);}
  function smsSenderOverrideKey(v){return String(v??'').trim().toUpperCase().replace(/\s+/g,'');}
  function loadSmsSenderOverrides(){
    try{state.smsSenderOverrides=JSON.parse(localStorage.getItem('cdrAnalyzer:smsSenderOverrides')||'{}')||{};}catch{state.smsSenderOverrides={};}
    return state.smsSenderOverrides;
  }
  function saveSmsSenderOverrides(){persistLocal('cdrAnalyzer:smsSenderOverrides',JSON.stringify(state.smsSenderOverrides||{}));}
  function getSmsSenderOverride(raw){return state.smsSenderOverrides?.[smsSenderOverrideKey(raw)]||null;}
  function setSmsSenderOverride(raw,patch={}){
    const key=smsSenderOverrideKey(raw);if(!key)return null;
    const current=state.smsSenderOverrides[key]||{};
    const next={
      raw:String(raw??'').trim(),
      label:String(patch.label??current.label??'').trim(),
      category:String(patch.category??current.category??'').trim(),
      recognition:String(patch.recognition??current.recognition??'Manual').trim()||'Manual',
      updatedAt:new Date().toISOString()
    };
    if(!next.label&&!next.category){delete state.smsSenderOverrides[key];saveSmsSenderOverrides();return null;}
    state.smsSenderOverrides[key]=next;saveSmsSenderOverrides();return next;
  }
  function clearSmsSenderOverride(raw){const key=smsSenderOverrideKey(raw);if(key&&state.smsSenderOverrides[key]){delete state.smsSenderOverrides[key];saveSmsSenderOverrides();return true;}return false;}
  loadSmsSenderOverrides();
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
    if(has('PAYTM','PHONEPE','GPAY','GOOGLEPAY','MOBIKWIK','FREECHARGE','BHIM','NPCI','UPI'))return 'Payments / Wallet';
    if(has('SWIGGY','ZOMATO'))return 'Food Delivery';
    if(has('RAPIDO','UBER','OLA','NAMMAYATRI'))return 'Ride-hailing / Transport';
    if(has('AIRTEL','BHARTIAIRTEL','JIO','RELIANCEJIO','VODAFONE','IDEA','VODAFONEIDEA','VIINDIA','BSNL')||key==='VI')return 'SIM / Telecom';
    if(has('AMAZON','FLIPKART','MYNTRA','MEESHO','AJIO','SNAPDEAL'))return 'E-commerce';
    if(has('DELHIVERY','BLUEDART','DTDC','EKART','XPRESSBEES','ECOMEXPRESS','SHIPROCKET','INDIAPOST'))return 'Logistics / Courier';
    if(has('IRCTC','INDIGO','AIRINDIA','AKASA','SPICEJET','MAKEMYTRIP','GOIBIBO','CLEARTRIP','REDBUS','ABHIBUS'))return 'Travel / Booking';
    if(has('APOLLO','PHARMEASY','NETMEDS','TATA1MG','1MG','PRACTO','MEDIBUDDY'))return 'Healthcare';
    if(has('LIC','HDFCLIFE','ICICIPRU','SBI LIFE','SBILIFE','STARHEALTH','POLICYBAZAAR'))return 'Insurance';
    if(has('BYJUS','UNACADEMY','VEDANTU','COURSE','EDUCATION','COLLEGE','SCHOOL'))return 'Education';
    if(has('TNEB','TANGEDCO','ELECTRICITY','EBBILL','GAS','WATER','FASTAG'))return 'Utilities';
    if(has('WHATSAPP','FACEBOOK','INSTAGRAM','META','TELEGRAM','GOOGLE','MICROSOFT','APPLE'))return 'Internet / Social';
    if(has('AADHAAR','UIDAI','DIGILOCKER','EPFO','INCOMETAX','GST','GOVT','GOVERNMENT'))return 'Government / Public Service';
    return 'Other / Unclassified';
  }
  function senderBrandInfo(v){
    const raw=String(v??'').trim();if(!raw||!/[A-Za-z]/.test(raw))return null;
    const override=getSmsSenderOverride(raw);
    const compact=raw.toUpperCase().replace(/\s+/g,'');
    let brand='';
    const parts=compact.split(/[-_]/).filter(Boolean);
    if(parts.length>1)brand=parts.slice(1).join('');
    else{
      brand=compact.replace(/[^A-Z0-9]/g,'');
      if(/^[A-Z]{2}[A-Z0-9]{3,12}$/.test(brand)&&serviceSenderType(raw))brand=brand.slice(2);
    }
    brand=brand.replace(/[^A-Z0-9]/g,'');
    if(!brand||brand.length<2)return null;
    const autoLabel=brand.length<=4?brand:brand.charAt(0)+brand.slice(1).toLowerCase();
    const autoCategory=senderServiceCategory(brand,raw);
    const structured=/^[A-Z]{2,3}[-_][A-Z0-9]{3,12}$/.test(compact);
    const autoRecognition=autoCategory!=='Other / Unclassified'?(structured?'Recognized':'Probable'):'Unclassified';
    return {
      raw,
      key:brand,
      label:override?.label||autoLabel,
      category:override?.category||autoCategory,
      recognition:override?'Manual':autoRecognition,
      classificationBasis:override?'Manual sender dictionary':(autoCategory!=='Other / Unclassified'?`Sender-ID token “${brand}” matched the category dictionary`:`Sender-ID token “${brand}” parsed; no category dictionary match`),
      override:override||null
    };
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
  function smsEventSignature(r){
    return [String(r?.cdrNo||''),String(r?.bparty||''),r?.dt instanceof Date&&!isNaN(r.dt)?Math.round(r.dt.getTime()/1000):String(r?.date||'')+' '+String(r?.time||''),Number(r?.duration)||0,String(r?.callType||'').toLowerCase(),String(r?.firstCellId||''),String(r?.imei||''),String(r?.imsi||'')].join('|');
  }
  function dedupeSmsRows(data=[]){
    const seen=new Set(),unique=[],duplicates=[];
    for(const r of data){const k=smsEventSignature(r);if(seen.has(k)){duplicates.push(r);continue;}seen.add(k);unique.push(r);}
    return {unique,duplicates,rawCount:data.length,uniqueCount:unique.length};
  }
  function smsSenderIntelligence(data=smsIntelRows()){
    const dedupe=dedupeSmsRows(data),uniqueData=dedupe.unique;
    const callWindow=(+$('smsIntelCallMins')?.value||10)*60000,idWindow=(+$('smsIntelIdMins')?.value||60)*60000;
    const nightFrom=timeMins($('smsIntelNightFrom')?.value||'22:00'),nightTo=timeMins($('smsIntelNightTo')?.value||'06:00');
    const calls=state.records.filter(r=>r.dt&&normalize(r.callType).includes('call')).sort((a,b)=>a.dt-b.dt);
    const idChanges=analyzeIdentifiers(state.records).events;
    const brands=new Map(),timeline=[];
    for(const r of uniqueData){
      const bi=senderBrandInfo(r.bparty);if(!bi)continue;
      const mins=r.dt.getHours()*60+r.dt.getMinutes(),unusual=withinNight(mins,nightFrom,nightTo);
      const nearbyCalls=calls.filter(x=>x.cdrNo===r.cdrNo&&Math.abs(x.dt-r.dt)<=callWindow);
      const nearbyIds=idChanges.filter(x=>x.msisdn===r.cdrNo&&Math.abs(x.at-r.dt)<=idWindow);
      let b=brands.get(bi.key);
      if(!b)b={key:bi.key,label:bi.label,category:bi.category,recognition:bi.recognition,senderIds:new Set(),count:0,first:null,last:null,days:new Set(),unusual:0,subjects:new Set(),towers:new Set(),nearCalls:0,nearIds:0};
      b.label=bi.label;b.category=bi.category;b.recognition=bi.recognition;b.senderIds.add(r.bparty);b.count++;b.days.add(localDateKey(r.dt));if(unusual)b.unusual++;if(r.cdrNo)b.subjects.add(r.cdrNo);if(r.firstCellId||r.firstAddress)b.towers.add(r.firstCellId||r.firstAddress);b.nearCalls+=nearbyCalls.length;b.nearIds+=nearbyIds.length;
      if(!b.first||r.dt<b.first)b.first=r.dt;if(!b.last||r.dt>b.last)b.last=r.dt;brands.set(bi.key,b);
      timeline.push({record:r,brand:bi.label,brandKey:bi.key,category:bi.category,recognition:bi.recognition||'Unclassified',classificationBasis:bi.classificationBasis||'',senderId:r.bparty,basis:smsRecordBasis(r),unusual,nearbyCalls:nearbyCalls.length,nearbyIds:nearbyIds.length});
    }
    const categories=new Map();
    for(const b of brands.values()){
      let x=categories.get(b.category);if(!x)x={category:b.category,count:0,brands:new Set(),senderIds:new Set(),first:null,last:null,unusual:0};
      x.count+=b.count;x.brands.add(b.label);for(const s of b.senderIds)x.senderIds.add(s);x.unusual+=b.unusual;
      if(!x.first||b.first<x.first)x.first=b.first;if(!x.last||b.last>x.last)x.last=b.last;categories.set(b.category,x);
    }
    return {brands:[...brands.values()].sort((a,b)=>b.count-a.count||a.label.localeCompare(b.label)),categories:[...categories.values()].sort((a,b)=>b.count-a.count),timeline,callWindowMin:callWindow/60000,idWindowMin:idWindow/60000,rawCount:dedupe.rawCount,uniqueCount:dedupe.uniqueCount,duplicateCount:dedupe.duplicates.length,duplicateRows:dedupe.duplicates};
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




    return {
      contactName,contactTag,contactLabel,contactTitle,identityStore,persistLocal,updatePrivacyUi,
      phoneKey,samePhone,serviceSenderType,isServiceSender,senderServiceCategory,senderBrandInfo,
      smsSenderOverrideKey,loadSmsSenderOverrides,getSmsSenderOverride,setSmsSenderOverride,clearSmsSenderOverride,
      smsRecordBasis,isSmsRecord,smsIntelRows,smsEventSignature,dedupeSmsRows,smsSenderIntelligence,requestIdentifier,
      parseCdrDeviceMetadata,imeiDigits,luhnValidImei,imeiStructure,tacFromImei,seedBuiltinTacMappings,
      normalizeTacEntry,saveTacCache,updateTacStatus,learnTacFromRecords,resolveDevice,tacField,
      importTacDatabase,exportTacCache,updateCdrRequestCount,defaultCdrRequestDates
    };
  };
})();
