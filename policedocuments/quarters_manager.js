/* Police Quarters In-Charge Manager: browser-session management and workbook-contained records. */
(function(){
"use strict";
const UNIT_SHEET="Q_Units", EVENT_SHEET="Q_Events", AUDIT_SHEET="Q_Audit";
const UNIT_HEAD=["Unit ID","Source sheet","Source row","Location","Category","Block","Floor","Door","Status override","Occupant override","Rank override","Allotment order","Verification date","Remarks","Last updated","Updated by"];
const EVENT_HEAD=["Event ID","Unit ID","Event type","Event date","Person / officer","Reference","Details","Assigned to","Due date","Progress","Priority","Notes","Recorded at","Recorded by"];
const AUDIT_HEAD=["Time","Operator (entered)","Unit ID","Action","Previous value","New value"];
const STATES=["Occupied","Vacant","Allotted not occupied","Under repair","Damaged","Uninhabitable","Reserved / other","Unconfirmed"];
const TYPES=["Allotment","Occupation","Vacation / handover","Transfer / retention","Maintenance","EB / water","Inspection","Correspondence"];
const PROGRESS=["Open","In progress","Waiting","Completed","Closed"];
let unitEntries=[], metadata=new Map(), events=[], audit=[], selectedId="", activeTab="dashboard", edits=0, managedFile=false, lastAlerts=[];
const byId=id=>document.getElementById(id);
const core=()=>window.QuartersCore;
const esc=v=>String(v==null?"":v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const str=v=>String(v==null?"":v).trim();
const norm=v=>str(v).toLowerCase().replace(/[\s._-]+/g," ");
const now=()=>new Date().toISOString();
const localDay=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")};
function statusMessage(message,warning){
 const x=byId("qmMessage");if(!x)return;
 x.textContent=message;x.classList.toggle("warning",!!warning);
}
function actor(){return str(byId("qmActor").value)}
function mandatoryActor(){
 if(actor())return true;
 statusMessage("Enter the operator name before saving. This is an entered name, not an authenticated identity.",true);
 byId("qmActor").focus();return false;
}
function createUnitId(row,heads){
 const col=names=>findHeader(heads,names);
 const block=str(row.values[col(["Block"])]),floor=str(row.values[col(["Floor"])]),door=str(row.values[col(["Quarters No","Door No"])]);
 if(!row.section||!block||!floor||!door)return null;
 if(!/^\d{1,4}[a-zA-Z]?$/.test(door))return null;
 return ["G3",row.section,norm(block).toUpperCase(),norm(floor).toUpperCase(),norm(door).toUpperCase()].join("-");
}
function findHeader(heads,names){
 for(const name of names){const i=heads.findIndex(h=>norm(h)===norm(name));if(i>=0)return i}
 return -1;
}
function cell(row,heads,names){
 const i=findHeader(heads,names);return i>=0?str(row.values[i]):"";
}
function effective(unit){
 const meta=metadata.get(unit.id);
 return meta&&meta.statusOverride?meta.statusOverride:unit.sourceStatus;
}
function displayPerson(unit){
 const m=metadata.get(unit.id);
 return m&&m.personOverride?m.personOverride:unit.person;
}
function displayRank(unit){
 const m=metadata.get(unit.id);
 return m&&m.rankOverride?m.rankOverride:unit.rank;
}
function sourceRows(){
 const cc=core();if(!cc||!cc.getWorkbook())return [];
 const heads=cc.getHeaders(),rows=cc.getRows();
 const seen=new Set(),out=[];
 for(const row of rows){
  const id=createUnitId(row,heads);
  if(!id)continue;
  const block=cell(row,heads,["Block"]),floor=cell(row,heads,["Floor"]),door=cell(row,heads,["Quarters No","Door No"]);
  const rec={id,rowNumber:row.row,sourceSheet:cc.getSheet(),group:row.group||"Police quarters",
   section:row.section||"",groupId:row.mgmtGroup||"",location:row.location||"",
   block,floor,door,sourceStatus:row.status||"Unconfirmed",
   person:cell(row,heads,["EMPLOYEE NAME"]),rank:cell(row,heads,["Rank No","Rank"]),
   service:cell(row,heads,["Police No"]),
   allocation:cell(row,heads,["Date of Allotment"]),
   occupiedDate:cell(row,heads,["Date of Occupy"]),
   sourceRemark:cell(row,heads,["damge","damage"])||""};
  if(seen.has(id)){rec.duplicate=true}
  seen.add(id);out.push(rec);
 }
 return out;
}
function decodeRows(name,headers){
 const wb=core()&&core().getWorkbook();if(!wb||!wb.Sheets[name])return [];
 return XLSX.utils.sheet_to_json(wb.Sheets[name],{header:1,defval:"",raw:false}).slice(1)
  .filter(a=>a.some(x=>str(x))).map(a=>Object.fromEntries(headers.map((h,i)=>[h,str(a[i])])));
}
function loadWorkbookRecords(){
 const mm=new Map();
 decodeRows(UNIT_SHEET,UNIT_HEAD).forEach(r=>{if(r["Unit ID"])mm.set(r["Unit ID"],{
  id:r["Unit ID"],sheet:r["Source sheet"],row:r["Source row"],location:r["Location"],
  category:r["Category"],block:r["Block"],floor:r["Floor"],door:r["Door"],
  statusOverride:r["Status override"],personOverride:r["Occupant override"],rankOverride:r["Rank override"],
  allotment:r["Allotment order"],verified:r["Verification date"],notes:r["Remarks"],
  modified:r["Last updated"],operator:r["Updated by"]})});
 metadata=mm;
 events=decodeRows(EVENT_SHEET,EVENT_HEAD).map((r,i)=>({
  id:r["Event ID"]||"import-"+i,unitId:r["Unit ID"],type:r["Event type"],
  date:r["Event date"],person:r["Person / officer"],reference:r["Reference"],
  details:r["Details"],assigned:r["Assigned to"],due:r["Due date"],
  progress:r["Progress"]||"Open",priority:r["Priority"]||"Normal",
  notes:r["Notes"],recorded:r["Recorded at"],operator:r["Recorded by"]}));
 audit=decodeRows(AUDIT_SHEET,AUDIT_HEAD).map(r=>({
  at:r["Time"],operator:r["Operator (entered)"],unitId:r["Unit ID"],
  action:r["Action"],before:r["Previous value"],after:r["New value"]}));
 edits=0;managedFile=true;
}
function refreshFromCore(){
 if(!core()||!core().getWorkbook()){unitEntries=[];renderAll();return}
 unitEntries=sourceRows();
 const ids=new Set(unitEntries.map(u=>u.id));
 if(selectedId&&!ids.has(selectedId))selectedId="";
 if(!selectedId&&unitEntries.length)selectedId=unitEntries[0].id;
 renderAll();
 updateMonthlyReport();
}
function showTab(tab){
 activeTab=tab;
 document.querySelectorAll("[data-qm-tab]").forEach(b=>b.classList.toggle("is-active",b.dataset.qmTab===tab));
 document.querySelectorAll("[data-qm-pane]").forEach(p=>p.hidden=p.dataset.qmPane!==tab);
}
function count(type){return unitEntries.filter(u=>effective(u)===type).length}
function incompleteReportRows(){
 const cc=core();if(!cc||!cc.getWorkbook())return [];
 const mapped=new Set(unitEntries.map(u=>u.rowNumber));
 return cc.getRows().filter(r=>!mapped.has(r.row)&&
  ["Vacant","Allotted not occupied","Damaged","Reserved / other"].includes(r.status));
}
function currentAlerts(){
 const alerts=[],today=localDay();
 for(const r of incompleteReportRows())alerts.push({unitId:"",excelRow:r.row,
  reason:"Verify block / floor / door in Excel source row "+r.row,due:"",level:"Incomplete"});
 for(const u of unitEntries){
  const st=effective(u);
  if(st==="Allotted not occupied")alerts.push({unitId:u.id,reason:"Allotted but not occupied",due:"",level:"Review"});
  if(["Damaged","Under repair","Uninhabitable"].includes(st))alerts.push({unitId:u.id,reason:st,due:"",level:"Repair"});
 }
 for(const e of events){
  if(["Completed","Closed"].includes(e.progress))continue;
  const overdue=!!e.due&&e.due<today;
  if(overdue)alerts.push({unitId:e.unitId,reason:e.type+": "+(e.details||e.reference||"follow-up"),due:e.due,level:"Overdue"});
  else if(e.due&&e.due<=localDayPlus(7))alerts.push({unitId:e.unitId,reason:e.type+": "+(e.details||e.reference||"follow-up"),due:e.due,level:"Upcoming"});
 }
 return alerts;
}
function localDayPlus(days){
 const dt=new Date();dt.setDate(dt.getDate()+days);
 return [dt.getFullYear(),String(dt.getMonth()+1).padStart(2,"0"),String(dt.getDate()).padStart(2,"0")].join("-");
}
function metric(label,val,style){return '<div class="qm-metric '+(style||"")+'"><strong>'+val+'</strong><span>'+esc(label)+'</span></div>'}
function renderDashboard(){
 const counts=STATES.map(s=>count(s));
 lastAlerts=currentAlerts();
 byId("qmMetrics").innerHTML=
  metric("Total mapped units",unitEntries.length)+metric("Occupied",counts[0])+
  metric("Vacant",counts[1],"positive")+metric("Allotted / unused",counts[2],"attention")+
  metric("Repair / damage",counts[3]+counts[4]+counts[5],"attention")+
  metric("Open follow-ups",events.filter(e=>!["Closed","Completed"].includes(e.progress)).length)+
  metric("Action alerts",lastAlerts.length,"attention")+
  metric("Incomplete vacancy rows",incompleteReportRows().length,"attention");
 byId("qmSummaryText").textContent=!managedFile?"Upload Excel to start the Quarters In-Charge dashboard.":
  unitEntries.length+" physical units mapped from "+str(core().getSheet())+". Manual status overrides and actions remain in memory until you export the edited Excel.";
 byId("qmAttentionBody").innerHTML=lastAlerts.slice(0,12).map(a=>{
  const u=unitEntries.find(x=>x.id===a.unitId);
  return '<tr><td>'+esc(u?unitName(u):a.excelRow?"Excel row "+a.excelRow:a.unitId)+'</td><td>'+esc(a.reason)+'</td><td>'+esc(a.due||"—")+'</td><td>'+
  (a.unitId?'<button class="qm-link" data-qm-select="'+esc(a.unitId)+'">Open</button>':
   '<a href="#excelRegister" class="qm-link">Review Excel</a>')+'</td></tr>';
 }).join("")||'<tr><td colspan="4">No alert records yet.</td></tr>';
 byId("qmAuditBody").innerHTML=audit.slice(-8).reverse().map(a=>
  '<tr><td>'+esc(a.at.slice(0,16).replace("T"," "))+'</td><td>'+esc(a.action)+'</td><td>'+esc(a.unitId)+'</td><td>'+esc(a.operator)+'</td></tr>').join("")||
  '<tr><td colspan="4">No in-session changes recorded.</td></tr>';
}
function unitName(u){return (u.group||"Quarters")+" · "+u.block+"/"+u.floor+"/"+u.door}
function unitMatches(u,q,s){
 if(s&&effective(u)!==s)return false;
 if(!q)return true;
 return norm([u.id,u.group,u.location,u.block,u.floor,u.door,displayPerson(u),displayRank(u),effective(u)].join(" ")).includes(norm(q));
}
function renderUnits(){
 const q=byId("qmUnitSearch").value,s=byId("qmUnitFilter").value;
 const matched=unitEntries.filter(u=>unitMatches(u,q,s));
 byId("qmUnitListCount").textContent=matched.length+" / "+unitEntries.length+" mapped units";
 byId("qmUnitRows").innerHTML=matched.slice(0,350).map(u=>
  '<tr><td>'+esc(u.group)+'</td><td>'+esc(u.block)+'</td><td>'+esc(u.floor)+'</td><td>'+esc(u.door)+'</td>'+
  '<td>'+esc(displayPerson(u)||"—")+'</td><td>'+esc(effective(u))+'</td><td><button class="qm-link" data-qm-select="'+esc(u.id)+'">Manage</button></td></tr>'
 ).join("")||'<tr><td colspan="7">No matching units. Check the uploaded worksheet.</td></tr>';
 byId("qmUnitLimit").textContent=matched.length>350?"Showing first 350 matches. Narrow the search to find other quarters.":"";
}
function renderProfile(){
 const u=unitEntries.find(x=>x.id===selectedId);
 byId("qmProfileWrap").hidden=!u;
 if(!u){byId("qmProfileEmpty").hidden=false;return}
 byId("qmProfileEmpty").hidden=true;
 const meta=metadata.get(u.id)||{};
 byId("qmUnitId").textContent=u.id;
 byId("qmUnitTitle").textContent=unitName(u);
 byId("qmUnitSource").textContent="Excel worksheet: "+u.sourceSheet+" · row "+u.rowNumber+
  " · source status: "+u.sourceStatus;
 byId("qmStatus").value=meta.statusOverride||"";
 byId("qmPerson").value=meta.personOverride||"";
 byId("qmRank").value=meta.rankOverride||"";
 byId("qmAllotment").value=meta.allotment||"";
 byId("qmVerified").value=meta.verified||"";
 byId("qmUnitNotes").value=meta.notes||"";
 byId("qmEventUnit").value=u.id;
 byId("qmEventDate").value=localDay();
 renderHistory();
}
function renderHistory(){
 const list=events.filter(e=>e.unitId===selectedId).slice().sort((a,b)=>
  (b.date||"").localeCompare(a.date||"")||(b.recorded||"").localeCompare(a.recorded||""));
 byId("qmHistoryCount").textContent=list.length+" recorded actions";
 byId("qmHistoryRows").innerHTML=list.map(e=>
  '<tr><td>'+esc(e.date)+'</td><td>'+esc(e.type)+'</td><td>'+esc(e.reference||"—")+'</td>'+
  '<td>'+esc(e.details)+'</td><td>'+esc(e.progress)+'</td><td>'+esc(e.due||"—")+'</td></tr>'
 ).join("")||'<tr><td colspan="6">No recorded history for this unit. Import an earlier exported Excel to restore previous actions.</td></tr>';
}
function showUnit(id){
 const u=unitEntries.find(x=>x.id===id);
 if(!u){statusMessage("This unit could not be found in the selected worksheet.",true);return}
 selectedId=id;
 showTab("profile");renderProfile();
 byId("quarters-management").scrollIntoView({behavior:"smooth",block:"start"});
}
function recordSourceEdit(change){
 if(!managedFile)return;
 const u=unitEntries.find(x=>x.rowNumber===change.row&&x.sourceSheet===change.sheet);
 const id=u?u.id:change.sheet+"!"+change.row;
 audit.push({at:now(),operator:actor()||"Operator not entered",unitId:id,
  action:"Excel source "+change.header+" ("+change.column+")",
  before:str(change.oldValue),after:str(change.value)});
 edits++;
 renderDashboard();
 if(core())core().refreshEditStatus();
}
function addAudit(unitId,action,before,after){
 audit.push({at:now(),operator:actor(),unitId,action,before:str(before),after:str(after)});
}
function changed(){edits++;renderDashboard();renderUnits();renderProfile();renderEvents();renderAlerts();updateMonthlyReport();const c=core();if(c)c.refreshEditStatus();}
function saveProfile(){
 if(!unitEntries.length||!mandatoryActor())return;
 const u=unitEntries.find(x=>x.id===selectedId);if(!u)return;
 const prior=metadata.get(u.id)||{};
 const next={
  id:u.id,sheet:u.sourceSheet,row:u.rowNumber,location:u.location,category:u.group,block:u.block,floor:u.floor,door:u.door,
  statusOverride:byId("qmStatus").value,personOverride:str(byId("qmPerson").value),
  rankOverride:str(byId("qmRank").value),allotment:str(byId("qmAllotment").value),
  verified:str(byId("qmVerified").value),notes:str(byId("qmUnitNotes").value),
  modified:now(),operator:actor()
 };
 const diff=[];
 for(const k of ["statusOverride","personOverride","rankOverride","allotment","verified","notes"]){
  if(str(prior[k])!==str(next[k]))diff.push([k,str(prior[k]),str(next[k])]);
 }
 if(!diff.length){statusMessage("No unit-profile changes to save.",false);return}
 metadata.set(u.id,next);
 diff.forEach(d=>addAudit(u.id,"Unit "+d[0],d[1],d[2]));
 changed();
 statusMessage("Unit profile updated in this session. Export Edited Excel to retain the changes.",false);
}
function defaultEventStatus(type){
 if(type==="Allotment")return "Allotted not occupied";
 if(type==="Occupation")return "Occupied";
 if(type==="Vacation / handover")return "Vacant";
 if(type==="Maintenance")return "Under repair";
 return "";
}
function saveEvent(){
 if(!unitEntries.length||!selectedId||!mandatoryActor())return;
 const date=byId("qmEventDate").value,type=byId("qmEventType").value,description=str(byId("qmEventDetails").value);
 if(!date||!description){statusMessage("Enter an event date and description to save the action.",true);return}
 const evt={
  id:"QE-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,7),
  unitId:selectedId,type,date,person:str(byId("qmEventPerson").value),
  reference:str(byId("qmEventReference").value),details:description,
  assigned:str(byId("qmEventOwner").value),due:byId("qmEventDue").value,
  progress:byId("qmEventProgress").value,priority:byId("qmEventPriority").value,
  notes:str(byId("qmEventNotes").value),recorded:now(),operator:actor()
 };
 events.push(evt);addAudit(selectedId,"New "+type+" action","",description);
 const newState=byId("qmAutoStatus").checked?defaultEventStatus(type):"";
 if(newState){
  const u=unitEntries.find(x=>x.id===selectedId);
  const m=metadata.get(selectedId)||{id:selectedId,sheet:u.sourceSheet,row:u.rowNumber,
   category:u.group,location:u.location,block:u.block,floor:u.floor,door:u.door};
  const previous=m.statusOverride||u.sourceStatus;
  m.statusOverride=newState;m.modified=now();m.operator=actor();
  if(evt.person&&["Allotment","Occupation"].includes(type))m.personOverride=evt.person;
  metadata.set(selectedId,m);
  addAudit(selectedId,"Status override by "+type,previous,newState);
 }
 byId("qmEventDetails").value="";byId("qmEventReference").value="";
 byId("qmEventDue").value="";byId("qmEventNotes").value="";
 byId("qmEventPerson").value="";
 changed();
 statusMessage("Action recorded. Export Edited Excel to save the action and its history.",false);
}
function renderEvents(){
 const q=byId("qmActionSearch").value,kind=byId("qmActionTypeFilter").value;
 const matched=events.filter(e=>(!kind||e.type===kind)&&(!q||
  norm([e.unitId,e.type,e.person,e.reference,e.details,e.assigned,e.progress,e.notes].join(" ")).includes(norm(q))));
 byId("qmActionCount").textContent=matched.length+" actions";
 byId("qmActionRows").innerHTML=matched.slice().sort((a,b)=>(b.date||"").localeCompare(a.date||"")).slice(0,400).map(e=>
  '<tr><td><button class="qm-link" data-qm-select="'+esc(e.unitId)+'">'+esc(e.unitId)+'</button></td>'+
  '<td>'+esc(e.date)+'</td><td>'+esc(e.type)+'</td><td>'+esc(e.details)+'</td>'+
  '<td>'+esc(e.assigned||"—")+'</td><td>'+esc(e.due||"—")+'</td>'+
  '<td><select aria-label="Progress for '+esc(e.id)+'" data-qm-progress="'+esc(e.id)+'">'+
  PROGRESS.map(p=>'<option '+(p===e.progress?'selected':'')+'>'+esc(p)+'</option>').join("")+'</select></td></tr>'
 ).join("")||'<tr><td colspan="7">No action entries. Add an action from a unit profile.</td></tr>';
}
function setProgress(id,newProgress){
 const event=events.find(x=>x.id===id);if(!event||event.progress===newProgress||!mandatoryActor())return;
 const old=event.progress;event.progress=newProgress;
 addAudit(event.unitId,"Action progress "+event.type,old,newProgress);changed();
 statusMessage("Action progress updated. Export the Excel file to retain it.",false);
}
function renderAlerts(){
 lastAlerts=currentAlerts();
 byId("qmAlertCount").textContent=lastAlerts.length+" alerts";
 byId("qmAlertRows").innerHTML=lastAlerts.slice(0,300).map(a=>{
  const u=unitEntries.find(x=>x.id===a.unitId);
  return '<tr><td>'+(a.unitId?'<button class="qm-link" data-qm-select="'+esc(a.unitId)+'">'+esc(u?unitName(u):a.unitId)+'</button>':
  '<a href="#excelRegister" class="qm-link">Excel row '+esc(a.excelRow)+'</a>')+'</td>'+
  '<td>'+esc(a.level)+'</td><td>'+esc(a.reason)+'</td><td>'+esc(a.due||"—")+'</td></tr>';
 }).join("")||'<tr><td colspan="4">No action alerts.</td></tr>';
}
function renderAll(){
 const ready=!!(core()&&core().getWorkbook());
 byId("qmOffline").hidden=ready;byId("qmAvailable").hidden=!ready;
 if(!ready){byId("qmMetrics").innerHTML="";return}
 renderDashboard();renderUnits();renderProfile();renderEvents();renderAlerts();
}
function reportState(state){
 if(state==="Under repair"||state==="Uninhabitable")return "Damaged";
 if(["Vacant","Allotted not occupied","Damaged","Reserved / other"].includes(state))return state;
 return null;
}
function updateMonthlyReport(){
 const cc=core();if(!cc||!cc.getWorkbook())return;
 let base;
 try{base=cc.parseReport()}catch(e){return}
 const byRow=new Map(base.map(r=>[r.sourceRow,{...r}]));
 const previousFlags=new Map(cc.getReport().map(r=>[r.sourceRow,r.include]));
 for(const u of unitEntries){
  const m=metadata.get(u.id);
  if(!m||!m.statusOverride)continue;
  const desired=reportState(m.statusOverride);
  if(!desired){byRow.delete(u.rowNumber);continue}
  const current=byRow.get(u.rowNumber)||{
   id:u.rowNumber+"-"+u.groupId,sourceRow:u.rowNumber,group:u.groupId||"pc",
   section:u.section,category:u.group,location:u.location,block:u.block,
   floor:u.floor,door:u.door,statusRaw:"Manual quarters update",
   damage:u.sourceRemark||"NIL",needsReview:!u.block||!u.floor||!u.door,
   include:!!(u.block&&u.floor&&u.door)
  };
  current.status=desired;current.damage=m.statusOverride==="Under repair"?"Under repair":
   m.statusOverride==="Uninhabitable"?"Uninhabitable":current.damage;
  current.include=previousFlags.has(u.rowNumber)?previousFlags.get(u.rowNumber):current.include;
  byRow.set(u.rowNumber,current);
 }
 const final=[...byRow.values()].sort((a,b)=>a.sourceRow-b.sourceRow);
 cc.applyReport(final);
}
function summaryForExport(){
 const cc=core();return cc&&cc.getWorkbook()?cc.getWorkbook():null;
}
function writeSheet(wb,name,heads,rows){
 const ws=XLSX.utils.aoa_to_sheet([heads,...rows]);
 ws["!cols"]=heads.map((h,i)=>({wch:i===0?30:i===6||i===7||i===11?32:20}));
 ws["!freeze"]={xSplit:0,ySplit:1};
 if(wb.Sheets[name])wb.Sheets[name]=ws;
 else XLSX.utils.book_append_sheet(wb,ws,name);
}
function writeToExcel(){
 const wb=summaryForExport();if(!wb||!managedFile)return;
 // Only create new management sheets if the user has made a change or the file already contains them.
 if(!edits&&!wb.Sheets[UNIT_SHEET]&&!wb.Sheets[EVENT_SHEET]&&!wb.Sheets[AUDIT_SHEET])return;
 writeSheet(wb,UNIT_SHEET,UNIT_HEAD,[...metadata.values()].map(m=>
  [m.id,m.sheet,m.row,m.location,m.category,m.block,m.floor,m.door,m.statusOverride||"",
   m.personOverride||"",m.rankOverride||"",m.allotment||"",m.verified||"",m.notes||"",m.modified||"",m.operator||""]));
 writeSheet(wb,EVENT_SHEET,EVENT_HEAD,events.map(e=>
  [e.id,e.unitId,e.type,e.date,e.person,e.reference,e.details,e.assigned,e.due,e.progress,e.priority,e.notes,e.recorded,e.operator]));
 writeSheet(wb,AUDIT_SHEET,AUDIT_HEAD,audit.map(a=>
  [a.at,a.operator,a.unitId,a.action,a.before,a.after]));
}
function exportFollowups(){
 const heads=["Unit ID","Location","Block","Floor","Door","Status","Event type","Description","Assigned to","Due date","Progress","Priority"];
 const rows=events.filter(e=>!["Closed","Completed"].includes(e.progress)).map(e=>{
  const u=unitEntries.find(x=>x.id===e.unitId);
  return [e.unitId,u?u.location:"",u?u.block:"",u?u.floor:"",u?u.door:"",
   u?effective(u):"",e.type,e.details,e.assigned,e.due,e.progress,e.priority]
 });
 const quote=x=>'"'+String(x==null?"":x).replace(/"/g,'""')+'"';
 const csv=[heads,...rows].map(a=>a.map(quote).join(",")).join("\r\n");
 const b=new Blob(["\uFEFF",csv],{type:"text/csv;charset=utf-8"});
 const url=URL.createObjectURL(b),a=document.createElement("a");
 a.href=url;a.download="quarters_pending_actions_"+localDay()+".csv";a.click();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function init(){
 for(const tab of ["dashboard","units","profile","actions","alerts"]){
  byId("qmTab"+tab).addEventListener("click",()=>showTab(tab));
 }
 byId("qmUnitSearch").addEventListener("input",renderUnits);
 byId("qmUnitFilter").addEventListener("change",renderUnits);
 byId("qmActionSearch").addEventListener("input",renderEvents);
 byId("qmActionTypeFilter").addEventListener("change",renderEvents);
 byId("qmProfileSave").addEventListener("click",saveProfile);
 byId("qmEventSave").addEventListener("click",saveEvent);
 byId("qmExportActions").addEventListener("click",exportFollowups);
 byId("quarters-management").addEventListener("click",e=>{
  const target=e.target.closest("[data-qm-select]");
  if(target){e.preventDefault();showUnit(target.dataset.qmSelect)}
 });
 byId("qmActionRows").addEventListener("change",e=>{
  const inp=e.target;if(inp.dataset.qmProgress)setProgress(inp.dataset.qmProgress,inp.value);
 });
 byId("qmEventType").addEventListener("change",()=>{
  byId("qmEventTypeHint").textContent={
   "Allotment":"Record order reference and proposed occupant. May set status to Allotted but not occupied.",
   "Occupation":"Record actual occupation date, occupant and keys acknowledgement.",
   "Vacation / handover":"Record date, keys, fixtures and meter readings in notes.",
   "Transfer / retention":"Record order reference, due-vacate date, and follow-up responsibility.",
   "Maintenance":"Record defect, work order, priority, assigned engineer and target date.",
   "EB / water":"Record service number, pending bills, meter reading and issue.",
   "Inspection":"Record physical verification findings and corrective action.",
   "Correspondence":"Record outgoing letter, reference number, recipient and follow-up date."
  }[byId("qmEventType").value]||"";
 });
 const options=STATES.map(s=>'<option value="'+esc(s)+'">'+esc(s)+'</option>').join("");
 byId("qmStatus").innerHTML='<option value="">Use source Excel status</option>'+options;
 byId("qmUnitFilter").innerHTML='<option value="">All statuses</option>'+options;
 byId("qmActionTypeFilter").innerHTML='<option value="">All action types</option>'+
  TYPES.map(s=>'<option>'+esc(s)+'</option>').join("");
 byId("qmEventType").innerHTML=TYPES.map(s=>'<option>'+esc(s)+'</option>').join("");
 byId("qmEventProgress").innerHTML=PROGRESS.map(s=>'<option>'+esc(s)+'</option>').join("");
 byId("qmEventPriority").innerHTML=["Normal","High","Urgent"].map(s=>'<option>'+s+'</option>').join("");
 byId("qmEventDate").value=localDay();
 byId("qmEventType").dispatchEvent(new Event("change"));
 showTab("dashboard");renderAll();
}
window.addEventListener("quarters:workbook-uploaded",()=>loadWorkbookRecords());
window.addEventListener("quarters:change",()=>refreshFromCore());
window.addEventListener("quarters:before-export",writeToExcel);
window.addEventListener("quarters:reset",()=>{metadata.clear();events=[];audit=[];edits=0;selectedId="";managedFile=false});
window.QuartersManager={changeCount:()=>edits,exportSheets:writeToExcel,refresh:refreshFromCore,recordSourceEdit};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);
else init();
})();