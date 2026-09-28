importScripts('/cdranalysis/vendor/xlsx.full.min.js');

function sheetInfo(wb,name){
  const ws=wb.Sheets[name],ref=ws&&ws['!ref'];
  let rowCount=0;
  if(ref){const r=XLSX.utils.decode_range(ref);rowCount=r.e.r-r.s.r+1;}
  const preview=XLSX.utils.sheet_to_json(ws,{defval:'',raw:false,range:0}).slice(0,8);
  const headers=preview.length?Object.keys(preview[0]):[];
  return {name,rowCount,headers,preview};
}

self.onmessage=e=>{
  const {id,buffer,name,action='inspect',sheetNames=[]}=e.data||{};
  try{
    const wb=XLSX.read(buffer,{type:'array',cellDates:true});
    if(action==='inspect'){
      const sheets=wb.SheetNames.map(n=>sheetInfo(wb,n));
      self.postMessage({id,ok:true,name,sheets});
      return;
    }
    const wanted=(sheetNames&&sheetNames.length?sheetNames:wb.SheetNames).filter(n=>wb.Sheets[n]);
    const sheets=wanted.map(sheetName=>({
      sheetName,
      rows:XLSX.utils.sheet_to_json(wb.Sheets[sheetName],{defval:'',raw:false})
    }));
    self.postMessage({id,ok:true,name,sheets});
  }catch(err){
    self.postMessage({id,ok:false,name,error:err&&err.message?err.message:String(err)});
  }
};