importScripts('/cdranalysis/vendor/xlsx.full.min.js');
function detectSheet(wb){
  if(wb.Sheets.Mapping)return 'Mapping';
  let best=wb.SheetNames[0],max=0;
  for(const n of wb.SheetNames){
    const ws=wb.Sheets[n],ref=ws&&ws['!ref'];
    if(ref){const r=XLSX.utils.decode_range(ref),rows=r.e.r-r.s.r+1;if(rows>max){max=rows;best=n;}}
  }
  return best;
}
self.onmessage=e=>{
  const {id,buffer,name}=e.data||{};
  try{
    const wb=XLSX.read(buffer,{type:'array',cellDates:true});
    const sheetName=detectSheet(wb),ws=wb.Sheets[sheetName];
    const rows=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false});
    self.postMessage({id,ok:true,name,sheetName,rows});
  }catch(err){
    self.postMessage({id,ok:false,name,error:err&&err.message?err.message:String(err)});
  }
};