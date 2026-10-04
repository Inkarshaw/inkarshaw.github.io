importScripts('/cdranalysis/vendor/xlsx.full.min.js');

function norm(v){return String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');}
const HEADER_GROUPS=[
  ['cdrno','cdrnumber','aparty','apartymsisdn','msisdn','subscribernumber','mobilenumber'],
  ['bparty','bpartynumber','otherparty','connectednumber','callednumber','callingnumber'],
  ['date','calldate','eventdate'],
  ['time','calltime','eventtime'],
  ['duration','callduration','durationsec','durationseconds'],
  ['calltype','eventtype','direction','type'],
  ['firstcellid','cellid','firstcell'],
  ['firstcellidaddress','firsttoweraddress','toweraddress','celladdress'],
  ['imei'],
  ['imsi']
];
const CORE_GROUP_INDEXES=[0,1,2,3,5];

function groupHit(vals,group){
  return vals.some(v=>group.some(a=>v===a||v.includes(a)||a.includes(v)));
}
function headerScore(row){
  const vals=(row||[]).map(norm).filter(Boolean);
  let score=0;
  for(const group of HEADER_GROUPS)if(groupHit(vals,group))score++;
  return score;
}
function compatibleHeaders(headers){
  const vals=(headers||[]).map(norm).filter(Boolean);
  let hits=0;
  for(const i of CORE_GROUP_INDEXES)if(groupHit(vals,HEADER_GROUPS[i]))hits++;
  return hits>=2;
}
function detectHeaderRow(ws){
  const ref=ws&&ws['!ref'];if(!ref)return 0;
  const rr=XLSX.utils.decode_range(ref);
  const endRow=Math.min(rr.e.r,rr.s.r+11);
  const sample=XLSX.utils.sheet_to_json(ws,{header:1,defval:'',raw:false,blankrows:false,range:{s:{r:rr.s.r,c:rr.s.c},e:{r:endRow,c:rr.e.c}}});
  let bestIndex=0,bestScore=-1;
  sample.forEach((row,i)=>{const score=headerScore(row);if(score>bestScore){bestScore=score;bestIndex=i;}});
  return bestScore>=2?rr.s.r+bestIndex:rr.s.r;
}
function rowsFromSheet(ws,headerRow){
  return XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:headerRow||0});
}
function sheetInfo(wb,name){
  const ws=wb.Sheets[name],ref=ws&&ws['!ref'];
  let rowCount=0,rr=null;
  if(ref){rr=XLSX.utils.decode_range(ref);rowCount=rr.e.r-rr.s.r+1;}
  const headerRow=detectHeaderRow(ws);
  let preview=[];
  if(rr){
    const endRow=Math.min(rr.e.r,headerRow+8);
    preview=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:{s:{r:headerRow,c:rr.s.c},e:{r:endRow,c:rr.e.c}}}).slice(0,8);
  }
  const headers=preview.length?Object.keys(preview[0]):[];
  return {name,rowCount,headerRow,headers,preview,compatible:compatibleHeaders(headers),score:headerScore(headers)};
}
function inspectAndParseCdr(wb){
  const sheets=wb.SheetNames.map(n=>sheetInfo(wb,n));
  let compatible=sheets.filter(s=>s.compatible);
  if(!compatible.length){
    const mapping=sheets.find(s=>norm(s.name)==='mapping');
    if(mapping)compatible=[mapping];
  }
  const parsedSheets=compatible.map(info=>({
    sheetName:info.name,
    headerRow:info.headerRow,
    rows:rowsFromSheet(wb.Sheets[info.name],info.headerRow)
  }));
  return {sheets,parsedSheets};
}

self.onmessage=e=>{
  const {id,buffer,name,action='inspect',sheetNames=[],headerRows={}}=e.data||{};
  try{
    const wb=XLSX.read(buffer,{type:'array',cellDates:true});
    if(action==='inspect'){
      const sheets=wb.SheetNames.map(n=>sheetInfo(wb,n));
      self.postMessage({id,ok:true,name,sheets});
      return;
    }
    if(action==='inspectParseCdr'){
      const out=inspectAndParseCdr(wb);
      self.postMessage({id,ok:true,name,...out});
      return;
    }
    const wanted=(sheetNames&&sheetNames.length?sheetNames:wb.SheetNames).filter(n=>wb.Sheets[n]);
    const sheets=wanted.map(sheetName=>{
      const ws=wb.Sheets[sheetName];
      const headerRow=Number.isInteger(headerRows?.[sheetName])?headerRows[sheetName]:detectHeaderRow(ws);
      return {sheetName,headerRow,rows:rowsFromSheet(ws,headerRow)};
    });
    self.postMessage({id,ok:true,name,sheets});
  }catch(err){
    self.postMessage({id,ok:false,name,error:err&&err.message?err.message:String(err)});
  }
};
