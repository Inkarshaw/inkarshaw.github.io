(function(){
 'use strict';
 const Core=window.MyCasesCore;
 const $=q=>document.querySelector(q);
 const $$=q=>Array.from(document.querySelectorAll(q));
 const escapeHtml=value=>String(value==null?'':value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
 let caseId='', caseData=null, entries=[], selectedId='', dirty=false, pendingTimer=null;
 const PRESET_WORK=[
  'Prepared Observation Mahazar',
  'Prepared Rough Sketch',
  'Prepared Seizure Mahazar',
  'Witnesses Examined'
 ];
 const today=()=>{
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Asia/Kolkata',day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date()).split('/');
  return parts.length===3?parts.reverse().join('-'):new Date().toISOString().slice(0,10);
 };
 const dateDisplay=date=>{
  if(!date)return '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(date)){
   const p=date.split('-');return p[2]+'-'+p[1]+'-'+p[0];
  }
  return date;
 };
 const identity=c=>{
  const no=String(c.crimeNo||'').trim();
  return no+(no&&!no.includes('/')&&c.crimeYear?'/'+c.crimeYear:'');
 };
 function blankEntry(c,previous){
  const works=PRESET_WORK.map(label=>({id:Core.uid(),label,details:'',done:false}));
  return {
   id:Core.uid(),createdAt:Core.now(),updatedAt:Core.now(),
   policeStation:String(c.policeStation||''),district:String(c.district||''),
   crimeReference:identity(c),
   occurrenceDateTime:dateDisplay(c.dateOccurrence||''),
   placeOccurrence:String(c.sceneOfCrime||''),sections:String(c.sections||''),
   cdDate:today(),reportDateTime:'',
   complainant:String(c.complainant||''),
   accused:String(c.accused||((c.accusedPersons||[]).map(p=>p.name).filter(Boolean).join(', '))),
   propertyStolen:'',propertyRecovered:'',
   lastCdDate:previous?.cdDate||'',stage:String(c.stage||'Under Investigation'),
   briefContent:'',reasonUI:'',ioName:String(c.ioName||''),
   ioRank:'',ioNumber:'',signatureNote:'',performance:works
  };
 }
 function current(){return entries.find(x=>String(x.id)===String(selectedId))||null}
 function safeEntries(data){
  return (Array.isArray(data)?data:[]).filter(x=>x&&x.id).map(x=>({
   ...x,performance:Array.isArray(x.performance)?x.performance.filter(w=>w&&typeof w==='object'):[]
  }));
 }
 function orderEntries(){entries.sort((a,b)=>String(b.cdDate||'').localeCompare(String(a.cdDate||''))||String(b.createdAt||'').localeCompare(String(a.createdAt||'')))}
 function renderSelection(){
  orderEntries();
  const sel=$('#entrySelect');
  sel.innerHTML=entries.map((x,i)=>'<option value="'+escapeHtml(x.id)+'">'+
   escapeHtml('CD '+(entries.length-i)+' · '+dateDisplay(x.cdDate||'Undated')+(x.reportDateTime?' · '+x.reportDateTime:''))+
   '</option>').join('');
  if(!current()&&entries.length)selectedId=entries[0].id;
  sel.value=selectedId;
  const disabled=!current();
  ['#saveEntry','#saveBottom','#deleteEntry','#previewEntry','#printEntry','#printBottom'].forEach(s=>$(s).disabled=disabled);
 }
 function renderWork(){
  const e=current();
  $('#performanceList').innerHTML=(e?.performance||[]).map((item,i)=>
   '<div class="work">'+
    '<input type="checkbox" aria-label="Work done" data-work-id="'+escapeHtml(item.id)+'" data-work-field="done" '+(item.done?'checked':'')+'>'+
    '<input type="text" aria-label="Work item" placeholder="Work performed" data-work-id="'+escapeHtml(item.id)+'" data-work-field="label" value="'+escapeHtml(item.label||'')+'">'+
    '<input type="text" class="details" aria-label="Details" placeholder="Names / reference (optional)" data-work-id="'+escapeHtml(item.id)+'" data-work-field="details" value="'+escapeHtml(item.details||'')+'">'+
    '<button type="button" aria-label="Remove work item" title="Remove" data-remove-work="'+escapeHtml(item.id)+'">×</button>'+
   '</div>').join('');
 }
 function renderForm(){
  const entry=current();
  $$('[data-diary]').forEach(el=>{el.value=entry?String(entry[el.dataset.diary]||''):'';el.disabled=!entry});
  $('#addWork').disabled=!entry;
  renderWork();renderSelection();
  dirty=false;$('#saveStatus').textContent='Saved entries: '+entries.length;
  $('#saveMessage').textContent=entry?'Editing diary dated '+dateDisplay(entry.cdDate)+'. Records are saved in this case.':'Create the first Case Diary entry to begin.';
 }
 function absorbForm(){
  const entry=current();if(!entry)return;
  $$('[data-diary]').forEach(el=>{entry[el.dataset.diary]=el.value});
 }
 function markDirty(){
  if(!current())return;
  dirty=true;$('#saveStatus').textContent='Unsaved changes';
  clearTimeout(pendingTimer);pendingTimer=setTimeout(()=>saveCurrent(false),1200);
 }
 function saveCurrent(userInitiated){
  clearTimeout(pendingTimer);pendingTimer=null;
  if(!caseId||!current())return false;
  absorbForm();
  const entry=current();entry.updatedAt=Core.now();
  // Re-read the case to avoid overwriting unrelated edits in other My Cases tabs.
  const fresh=Core.getCase(caseId);
  if(!fresh||fresh.deletedAt){$('#saveMessage').textContent='Cannot save: case unavailable or deleted.';return false}
  const saved=Core.saveCase({...fresh,caseDiaryEntries:entries},{queue:true,touch:true});
  caseData=saved;entries=safeEntries(saved.caseDiaryEntries);
  dirty=false;
  $('#saveStatus').textContent='Saved locally';
  $('#saveMessage').textContent=Core.token()?'Saved locally; cloud sync queued.':'Saved on this device. Sign in to cloud from My Cases for cross-device sync.';
  if(Core.token()&&navigator.onLine){
   Core.processQueue().then(()=>{
    if(!dirty&&Core.pendingCount()===0)$('#saveMessage').textContent='Saved locally and cloud sync completed.';
   }).catch(()=>{});
  }
  if(userInitiated)renderSelection();
  return true;
 }
 function newEntry(){
  if(dirty)saveCurrent(false);
  if(!caseData)return;
  const last=entries.slice().sort((a,b)=>String(b.cdDate||'').localeCompare(String(a.cdDate||'')))[0];
  const entry=blankEntry(Core.getCase(caseId)||caseData,last);
  entries.push(entry);selectedId=entry.id;
  renderForm();saveCurrent(true);
  $('[data-diary="cdDate"]').focus();
 }
 function removeEntry(){
  const entry=current();if(!entry)return;
  if(!confirm('Delete this Case Diary entry dated '+dateDisplay(entry.cdDate)+'? This removes it from the case and queued cloud record.'))return;
  clearTimeout(pendingTimer);
  entries=entries.filter(x=>x.id!==entry.id);
  selectedId=entries[0]?.id||'';
  const fresh=Core.getCase(caseId);
  if(!fresh)return;
  caseData=Core.saveCase({...fresh,caseDiaryEntries:entries},{queue:true,touch:true});
  renderForm();
  $('#saveMessage').textContent='Diary entry removed from this case.';
  if(Core.token())Core.processQueue().catch(()=>{});
 }
 function printPair(label,value){
  return '<tr><th>'+escapeHtml(label)+'</th><td dir="auto">'+(value?escapeHtml(value):'—')+'</td></tr>';
 }
 function printMarkup(entry){
  const performed=(entry.performance||[]).filter(w=>w.done&&(w.label||w.details));
  const work=performed.length?'<ol class="print-work">'+performed.map(w=>
   '<li><span dir="auto">'+escapeHtml(w.label||'Work performed')+'</span>'+
   (w.details?' — <span dir="auto">'+escapeHtml(w.details)+'</span>':'')+'</li>'
  ).join('')+'</ol>':'<div>—</div>';
  return '<section class="print-page first">'+
   '<div class="department">TAMIL NADU POLICE</div>'+
   '<h1>Case Diary</h1><div class="case-num">Cr. No. '+escapeHtml(entry.crimeReference||'—')+'</div>'+
   '<table class="print-info"><tbody>'+
    printPair('Police Station',entry.policeStation)+
    printPair('District',entry.district)+
    printPair('D / O & Time',entry.occurrenceDateTime)+
    printPair('Place of Occurrence',entry.placeOccurrence)+
    printPair('Section of Law',entry.sections)+
    printPair('Date of CD',dateDisplay(entry.cdDate))+
    printPair('1. Date & Time of Report',entry.reportDateTime)+
    printPair('2. Complainant',entry.complainant)+
    printPair('3. Accused',entry.accused)+
    printPair('4. Total Property Stolen',entry.propertyStolen)+
    printPair('5. Total Property Recovered/Seized',entry.propertyRecovered)+
    printPair('6. Last CD Date',dateDisplay(entry.lastCdDate))+
    printPair('7. Stage',entry.stage)+
   '</tbody></table>'+
   '<div class="print-rule"></div><div class="print-section">PERFORMANCE FOR THE DAY</div>'+work+
   '</section>'+
   '<section class="print-page second">'+
   '<h1>Brief Content of Case Diary</h1>'+
   '<div class="print-content" dir="auto">'+escapeHtml(entry.briefContent||'')+'</div>'+
   '<div class="print-section">Reason for UI</div><div class="print-content" dir="auto">'+escapeHtml(entry.reasonUI||'—')+'</div>'+
   '<div class="print-footer">SIGNATURE OF THE I.O.'+
   '<small>I.O.: '+escapeHtml(entry.ioName||'—')+'</small>'+
   '<small>Rank: '+escapeHtml(entry.ioRank||'—')+(entry.ioNumber?' &nbsp; No.: '+escapeHtml(entry.ioNumber):'')+'</small>'+
   (entry.signatureNote?'<small>'+escapeHtml(entry.signatureNote)+'</small>':'')+
   '</div></section>';
 }
 function preview(){
  if(dirty)saveCurrent(false);
  const entry=current();if(!entry)return false;
  $('#printPreview').innerHTML=printMarkup(entry);
  return true;
 }
 function printEntry(){
  if(!current())return;
  if(!saveCurrent(true))return;
  if(!preview())return;
  window.print();
 }
 function init(){
  if(!Core){$('#missing').style.display='block';return}
  Core.init();
  const qs=new URLSearchParams(location.search);
  caseId=qs.get('id')||Core.getHandoff()?.id||'';
  caseData=Core.getCase(caseId);
  if(!caseData||caseData.deletedAt){
   $('#missing').style.display='block';
   $('#diaryForm').style.display='none';
   $('#newEntry').disabled=true;$('#entrySelect').disabled=true;
   ['#saveEntry','#saveBottom','#deleteEntry','#previewEntry','#printEntry','#printBottom'].forEach(s=>$(s).disabled=true);
   $('#caseTitle').textContent='Case not found';return;
  }
  const title=(caseData.policeStation||'Police Station')+' · Cr. No. '+(identity(caseData)||'—');
  $('#caseTitle').textContent=title;
  $('#editorLink').href='/mycases/edit/?id='+encodeURIComponent(caseId)+'&v=2';
  entries=safeEntries(caseData.caseDiaryEntries);
  orderEntries();selectedId=entries[0]?.id||'';
  renderForm();
  $('#diaryForm').addEventListener('submit',e=>e.preventDefault());
  $('#newEntry').addEventListener('click',newEntry);
  $('#deleteEntry').addEventListener('click',removeEntry);
  $('#addWork').addEventListener('click',()=>{
   const e=current();if(!e)return;
   e.performance.push({id:Core.uid(),label:'',details:'',done:true});
   renderWork();markDirty();
  });
  $('#entrySelect').addEventListener('change',event=>{
   if(dirty)saveCurrent(false);
   selectedId=event.target.value;renderForm();
   $('#printPreview').classList.remove('open');
  });
  $('#diaryForm').addEventListener('input',event=>{
   const el=event.target;
   if(el.dataset.diary){
    const e=current();if(e)e[el.dataset.diary]=el.value;
    if(el.dataset.diary==='cdDate')renderSelection();
    markDirty();return;
   }
   const workId=el.dataset.workId,key=el.dataset.workField;
   if(workId&&key){
    const w=current()?.performance.find(x=>x.id===workId);
    if(w){w[key]=key==='done'?Boolean(el.checked):el.value;markDirty()}
   }
  });
  $('#diaryForm').addEventListener('change',event=>{
   if(event.target.dataset.workField==='done'){
    const w=current()?.performance.find(x=>x.id===event.target.dataset.workId);
    if(w){w.done=event.target.checked;markDirty()}
   }
  });
  $('#diaryForm').addEventListener('click',event=>{
   const b=event.target.closest('[data-remove-work]');if(!b)return;
   const e=current();if(!e)return;
   e.performance=e.performance.filter(w=>w.id!==b.dataset.removeWork);
   renderWork();markDirty();
  });
  ['#saveEntry','#saveBottom'].forEach(s=>$(s).addEventListener('click',()=>saveCurrent(true)));
  ['#printEntry','#printBottom'].forEach(s=>$(s).addEventListener('click',printEntry));
  $('#previewEntry').addEventListener('click',()=>{
   if(preview()){
    const show=!$('#printPreview').classList.contains('open');
    $('#printPreview').classList.toggle('open',show);
    if(show)$('#printPreview').scrollIntoView({behavior:'smooth'});
   }
  });
  window.addEventListener('beforeprint',()=>{if(current())preview()});
  window.addEventListener('pagehide',()=>{if(dirty)saveCurrent(false)});
  window.addEventListener('mycases:sync',()=>{if(!dirty&&Core.pendingCount()===0&&Core.token())$('#saveMessage').textContent='Saved locally and cloud sync completed.'});
 }
 document.addEventListener('DOMContentLoaded',init);
})();