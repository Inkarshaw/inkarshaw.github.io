importScripts('/cdranalysis/vendor/xlsx.full.min.js');

function norm(v){return String(v??'').trim().toLowerCase().replace(/[^a-z0-9]+/g,'');}
const HEADER_GROUPS=[
  ['cdrno','cdrnumber','aparty','apartymsisdn','msisdn'],
  ['bparty','bpartynumber','connectednumber','callednumber','callingnumber'],
  ['date','calldate','eventdate'],
  ['time','calltime','eventtime'],
  ['duration','callduration'],
  ['calltype','eventtype','type'],
  ['firstcellid','cellid'],
  ['firstcellidaddress','toweraddress','celladdress'],
  ['imei'],
  ['imsi']
];
function headerScore(row){
  const vals=(row||[]).map(norm).filter(Boolean);
  let score=0;
  for(const group of HEADER_GROUPS){
    if(vals.some(v=>group.some(a=>v===a||v.includes(a)||a.includes(v))))score++;
  }
  return score;
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
  let rowCount=0;
  if(ref){const r=XLSX.utils.decode_range(ref);rowCount=r.e.r-r.s.r+1;}
  const headerRow=detectHeaderRow(ws);
  const preview=rowsFromSheet(ws,headerRow).slice(0,8);
  const headers=preview.length?Object.keys(preview[0]):[];
  return {name,rowCount,headerRow,headers,preview};
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