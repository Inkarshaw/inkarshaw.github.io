(function(){
  'use strict';
  const Core=window.MyCasesCore;
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>{if(!v)return'—';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?v:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})};
  const STAGES=['Investigation','FIR Registered','Notice / Enquiry','Accused Search','Arrested','Remand','Bail','Property / FSL Pending','Charge Sheet Preparation','Charge Sheet Filed','Cognizance','Summons','Charge Framing','Prosecution Evidence','Witness Examination','Cross Examination','Defence Evidence','Arguments','Judgment Reserved','Convicted','Acquitted','Discharged','Compounded','Abated','Appeal Pending','Stayed','Adjourned','Split-up Case','PT Warrant Pending','NBW Pending','Case Disposed','Further Investigation','Other'];
  const BASE_INVESTIGATION=['Complainant examined','Witnesses examined','Scene of crime inspected','CCTV footage collected','CDR / SDR obtained','Bank records obtained','Property seized','Property sent to FSL','FSL report received','Accused identified','Accused arrested','Accused remanded / bail status updated','Documents / records collected','Final report / charge sheet prepared','Final report / charge sheet filed'];
  const HEAD_STEPS={
    'NDPS':['Seizure mahazar completed','Sampling / inventory completed','Drug weight and seal particulars verified','FSL / chemical analysis follow-up','NDPS compliance documents verified'],
    'Theft':['Property list prepared','CCTV / route footage checked','Stolen property tracing completed','Pawn / resale checks completed'],
    'Robbery':['Weapon / property recovery follow-up','CCTV / route footage checked','Victim identification proceedings completed'],
    'Chain Snatching':['CCTV route mapping completed','Vehicle / registration tracing completed','Property recovery follow-up'],
    'Missing Person':['CCTV / travel trail checked','Phone / CDR tracing completed','Hospitals / shelters checked','Missing person tracing result recorded'],
    'Cyber Crime':['Bank / wallet trail obtained','IP / platform records requested','Beneficiary account analysis completed','Device / digital evidence preserved'],
    'Murder':['Post-mortem documents collected','Weapon recovery / FSL follow-up','Motive and last-seen witnesses examined'],
    'Road Accident':['Vehicle inspection report obtained','Accident scene sketch / photos completed','Medical / post-mortem documents collected']
  };
  let state=null,baseline=null,autosaveTimer=null,saveBusy=false;

  function defaults(){
    const t=Core.now();
    return Core.normalizeCase({id:Core.uid(),crimeNo:'',crimeYear:String(new Date().getFullYear()),policeStation:'',caseType:'',dateOccurrence:'',dateRegistration:'',sceneOfCrime:'',sections:'',complainant:'',accused:'',ioName:'',priority:'Medium',courtComplex:'',court:'',courtCaseType:'',courtCaseNo:'',stage:'Investigation',accusedPresentDetails:'',nbwStatus:'',fsStatus:'',finalResult:'',nextHearing:'',nextAction:'',notes:'',createdAt:t,updatedAt:t,accusedPersons:[],investigationChecklist:BASE_INVESTIGATION.map((label,i)=>({id:'inv-'+i,label,done:false,date:''})),propertyItems:[],tasks:[],hearings:[],timeline:[],attachments:[]});
  }
  const clone=v=>JSON.parse(JSON.stringify(v));

  function ensureChecklist(){
    if(!Array.isArray(state.investigationChecklist)||!state.investigationChecklist.length){
      state.investigationChecklist=BASE_INVESTIGATION.map((label,i)=>({id:'inv-'+i,label,done:false,date:''}));
    }
    const extras=HEAD_STEPS[state.caseType]||[];
    extras.forEach(label=>{
      if(!state.investigationChecklist.some(x=>String(x.label||'').toLowerCase()===label.toLowerCase())){
        state.investigationChecklist.push({id:'head-'+Core.uid(),label,done:false,date:''});
      }
    });
  }
  function bindFields(){
    $$('[data-field]').forEach(el=>{el.value=state[el.dataset.field]??''});
  }
  function collectFields(){
    $$('[data-field]').forEach(el=>{state[el.dataset.field]=el.value.trim()});
    state.accused=(state.accusedPersons||[]).map(x=>x.name).filter(Boolean).join(', ')||state.accused||'';
    return state;
  }
  function status(){
    const ref=(state.caseType||'Case')+' '+(state.crimeNo||'New')+(state.crimeYear?'/'+state.crimeYear:'');
    $('#caseRef').textContent=ref;
    $('#caseMeta').textContent=(state.policeStation||'Police station not set')+' · '+(state.stage||'Investigation')+(state.nextHearing?' · Next '+fmt(state.nextHearing):'');
    const done=(state.investigationChecklist||[]).filter(x=>x.done).length,total=(state.investigationChecklist||[]).length;
    $('#casePills').innerHTML='<span>Investigation '+(total?Math.round(done*100/total):0)+'%</span><span>'+((state.tasks||[]).filter(x=>!x.done).length)+' pending tasks</span><span>'+((state.accusedPersons||[]).length)+' accused</span><span>'+((state.propertyItems||[]).length)+' properties</span>';
  }
  function setSave(text,kind='local'){
    const el=$('#saveState');el.textContent=text;el.dataset.state=kind;
  }
  function toast(msg){
    const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200);
  }
  function setTab(name){
    $$('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===name));
    $$('[data-panel]').forEach(p=>p.classList.toggle('active',p.dataset.panel===name));
    try{sessionStorage.setItem('myCasesEditorTab',name)}catch(e){}
  }

  function renderChecklist(){
    ensureChecklist();
    const done=state.investigationChecklist.filter(x=>x.done).length,total=state.investigationChecklist.length;
    $('#investigationProgress').textContent=done+'/'+total+' completed';
    $('#checklist').innerHTML=state.investigationChecklist.map(x=>'<div class="check-row '+(x.done?'done':'')+'"><input type="checkbox" data-check="'+esc(x.id)+'" '+(x.done?'checked':'')+'><div>'+esc(x.label)+'</div><input type="date" data-check-date="'+esc(x.id)+'" value="'+esc(x.date||'')+'"></div>').join('');
  }
  function propertySeized(){
    const step=(state.investigationChecklist||[]).find(x=>String(x.label||'').toLowerCase()==='property seized');
    return Boolean(step&&step.done)||Boolean((state.propertyItems||[]).length);
  }
  function newProperty(){
    return {id:Core.uid(),description:'',category:'',quantity:'',seizureDate:new Date().toISOString().slice(0,10),seizurePlace:'',photo:'',custodyLocation:'Police Station',courtSubmissionRequired:'',courtSubmissionStatus:'Pending',courtSentDate:'',courtName:'',propertyNumberReceived:'',propertyNumber:'',propertyNumberDate:'',fslRequired:'',fslStatus:'',disposalStatus:'In Custody',remarks:''};
  }
  function renderProperties(){
    if(!Array.isArray(state.propertyItems))state.propertyItems=[];
    const register=$('#propertyRegister'),box=$('#propertyList'),summary=$('#propertySummary');
    register.classList.remove('hidden');
    const pending=state.propertyItems.filter(p=>p.courtSubmissionRequired==='Yes'&&p.courtSubmissionStatus!=='Sent').length;
    const sent=state.propertyItems.filter(p=>p.courtSubmissionStatus==='Sent').length;
    const prPending=state.propertyItems.filter(p=>p.courtSubmissionRequired==='Yes'&&p.courtSubmissionStatus==='Sent'&&p.propertyNumberReceived!=='Yes').length;
    summary.textContent=state.propertyItems.length+' item(s) · '+pending+' court submission pending · '+sent+' sent · '+prPending+' Property/PR No. pending';
    if(!state.propertyItems.length){box.innerHTML='<div class="empty small">No property details recorded. Use “Add Property” to add seized, recovered or case property.</div>';return}
    box.innerHTML=state.propertyItems.map((p,i)=>{
      const courtRequired=p.courtSubmissionRequired==='Yes';
      const sent=p.courtSubmissionStatus==='Sent';
      const numberReceived=p.propertyNumberReceived==='Yes';
      const fslRequired=p.fslRequired==='Yes';
      return '<article class="property-card" data-property-id="'+esc(p.id)+'">'+
        '<div class="property-photo">'+(p.photo?'<img src="'+esc(p.photo)+'" alt="Seized property photo">':'<div class="placeholder">📦</div>')+
        '<button type="button" data-property-photo="'+i+'">'+(p.photo?'Change Photo':'Add Photo')+'</button></div>'+
        '<div class="property-fields">'+
          '<input class="wide" value="'+esc(p.description||'')+'" data-property-field="description" data-pi="'+i+'" placeholder="Property description *">'+
          '<select data-property-field="category" data-pi="'+i+'"><option value="">Property type</option>'+['Cash','Jewellery','Vehicle','Mobile / Electronic','Weapon','Drug / Contraband','Document','Stolen Property','Other'].map(v=>'<option '+(p.category===v?'selected':'')+'>'+v+'</option>').join('')+'</select>'+
          '<input value="'+esc(p.quantity||'')+'" data-property-field="quantity" data-pi="'+i+'" placeholder="Quantity / weight / value">'+
          '<input type="date" value="'+esc(p.seizureDate||'')+'" data-property-field="seizureDate" data-pi="'+i+'" title="Seizure date">'+
          '<input value="'+esc(p.seizurePlace||'')+'" data-property-field="seizurePlace" data-pi="'+i+'" placeholder="Place of seizure">'+
          '<input class="wide" value="'+esc(p.custodyLocation||'')+'" data-property-field="custodyLocation" data-pi="'+i+'" placeholder="Present custody / storage location">'+
          '<div class="property-status">'+
            '<select data-property-field="courtSubmissionRequired" data-pi="'+i+'"><option value="">Send to court?</option><option '+(p.courtSubmissionRequired==='Yes'?'selected':'')+'>Yes</option><option '+(p.courtSubmissionRequired==='No'?'selected':'')+'>No</option></select>'+
            '<select data-property-field="courtSubmissionStatus" data-pi="'+i+'" '+(!courtRequired?'disabled':'')+'><option '+(p.courtSubmissionStatus==='Pending'?'selected':'')+'>Pending</option><option '+(p.courtSubmissionStatus==='Sent'?'selected':'')+'>Sent</option><option '+(p.courtSubmissionStatus==='Returned by Court'?'selected':'')+'>Returned by Court</option><option '+(p.courtSubmissionStatus==='Not required'?'selected':'')+'>Not required</option></select>'+
            '<input type="date" value="'+esc(p.courtSentDate||'')+'" data-property-field="courtSentDate" data-pi="'+i+'" title="Sent to court date" '+(!sent?'disabled':'')+'>'+
            '<input value="'+esc(p.courtName||'')+'" data-property-field="courtName" data-pi="'+i+'" placeholder="Court / receiving authority" '+(!courtRequired?'disabled':'')+'>'+
            '<select data-property-field="propertyNumberReceived" data-pi="'+i+'" '+(!sent?'disabled':'')+'><option value="">Property/PR No. received?</option><option '+(p.propertyNumberReceived==='Yes'?'selected':'')+'>Yes</option><option '+(p.propertyNumberReceived==='No'?'selected':'')+'>No</option></select>'+
            '<input value="'+esc(p.propertyNumber||'')+'" data-property-field="propertyNumber" data-pi="'+i+'" placeholder="Property / PR Number" '+(!numberReceived?'disabled':'')+'>'+
            '<input type="date" value="'+esc(p.propertyNumberDate||'')+'" data-property-field="propertyNumberDate" data-pi="'+i+'" title="Property number received date" '+(!numberReceived?'disabled':'')+'>'+
            '<select data-property-field="fslRequired" data-pi="'+i+'"><option value="">FSL / expert test?</option><option '+(p.fslRequired==='Yes'?'selected':'')+'>Yes</option><option '+(p.fslRequired==='No'?'selected':'')+'>No</option></select>'+
            '<select data-property-field="fslStatus" data-pi="'+i+'" '+(!fslRequired?'disabled':'')+'><option value="">FSL status</option><option '+(p.fslStatus==='Pending dispatch'?'selected':'')+'>Pending dispatch</option><option '+(p.fslStatus==='Sent'?'selected':'')+'>Sent</option><option '+(p.fslStatus==='Report awaited'?'selected':'')+'>Report awaited</option><option '+(p.fslStatus==='Report received'?'selected':'')+'>Report received</option></select>'+
            '<select data-property-field="disposalStatus" data-pi="'+i+'"><option '+(p.disposalStatus==='In Custody'?'selected':'')+'>In Custody</option><option '+(p.disposalStatus==='With Court'?'selected':'')+'>With Court</option><option '+(p.disposalStatus==='Returned to Owner'?'selected':'')+'>Returned to Owner</option><option '+(p.disposalStatus==='Disposed'?'selected':'')+'>Disposed</option><option '+(p.disposalStatus==='Confiscated'?'selected':'')+'>Confiscated</option></select>'+
          '</div>'+
          '<textarea class="textarea wide" data-property-field="remarks" data-pi="'+i+'" placeholder="Property remarks / mahazar reference / seal details">'+esc(p.remarks||'')+'</textarea>'+
          '<div class="property-actions"><button type="button" data-property-delete="'+i+'">Remove Property</button></div>'+
        '</div></article>';
    }).join('');
  }

  function renderAccused(){
    const box=$('#accusedList');
    if(!state.accusedPersons.length){box.innerHTML='<div class="empty small">No accused added.</div>';return}
    box.innerHTML=state.accusedPersons.map((p,i)=>'<article class="person-card" data-person="'+esc(p.id)+'">'+
      '<div class="person-photo">'+(p.photo?'<img src="'+esc(p.photo)+'" alt="Accused photo">':'<span>👤</span>')+'</div>'+
      '<div class="person-fields">'+
      '<input value="'+esc(p.name||'')+'" data-person-field="name" data-i="'+i+'" placeholder="Name">'+
      '<input value="'+esc(p.alias||'')+'" data-person-field="alias" data-i="'+i+'" placeholder="Alias">'+
      '<input type="date" value="'+esc(p.dob||'')+'" data-person-field="dob" data-i="'+i+'" title="DOB">'+
      '<select data-person-field="status" data-i="'+i+'">'+['Accused','Arrested','Absconding','Remand','Bail','Discharged'].map(v=>'<option '+(p.status===v?'selected':'')+'>'+v+'</option>').join('')+'</select>'+
      '<input value="'+esc(p.age||'')+'" data-person-field="age" data-i="'+i+'" placeholder="Age">'+
      '<input value="'+esc(p.phone||'')+'" data-person-field="phone" data-i="'+i+'" placeholder="Phone">'+
      '<input value="'+esc(p.idProof||'')+'" data-person-field="idProof" data-i="'+i+'" placeholder="ID proof">'+
      '<input type="date" value="'+esc(p.arrestDate||'')+'" data-person-field="arrestDate" data-i="'+i+'" title="Arrest date">'+
      '<input class="wide" value="'+esc(p.address||'')+'" data-person-field="address" data-i="'+i+'" placeholder="Address">'+
      '<input class="wide" value="'+esc(p.remarks||'')+'" data-person-field="remarks" data-i="'+i+'" placeholder="Remarks">'+
      '</div><div class="person-actions"><button type="button" data-photo="'+i+'">Photo</button><button type="button" class="danger" data-person-delete="'+i+'">Remove</button></div></article>').join('');
  }
  function renderHearings(){
    const box=$('#hearingList');
    if(!state.hearings.length){box.innerHTML='<div class="empty small">No hearing history.</div>';return}
    box.innerHTML=state.hearings.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(h=>'<article class="list-card"><div><strong>'+esc(fmt(h.date))+(h.purpose?' · '+esc(h.purpose):'')+'</strong><p>'+esc(h.proceedings||h.witness||'')+'</p><small>'+(h.next?'Next: '+esc(fmt(h.next)):'No next hearing')+(h.result?' · '+esc(h.result):'')+'</small></div><button type="button" class="danger" data-hearing-delete="'+esc(h.id)+'">Delete</button></article>').join('');
  }
  function renderTasks(){
    const box=$('#taskList');
    if(!state.tasks.length){box.innerHTML='<div class="empty small">No tasks.</div>';return}
    box.innerHTML=state.tasks.map(t=>'<article class="list-card '+(t.done?'done':'')+'"><label><input type="checkbox" data-task-check="'+esc(t.id)+'" '+(t.done?'checked':'')+'> <strong>'+esc(t.text||'Task')+'</strong><small>'+esc(t.due?fmt(t.due):'No due date')+'</small></label><button type="button" class="danger" data-task-delete="'+esc(t.id)+'">Delete</button></article>').join('');
  }
  function renderTimeline(){
    const box=$('#timelineList');
    if(!state.timeline.length){box.innerHTML='<div class="empty small">No timeline entries.</div>';return}
    box.innerHTML=state.timeline.slice().sort((a,b)=>String(b.date||b.createdAt).localeCompare(String(a.date||a.createdAt))).map(x=>'<article class="list-card"><div><strong>'+esc(x.type||'Update')+'</strong><p>'+esc(x.text||'')+'</p><small>'+esc(x.date?fmt(x.date):new Date(x.createdAt||Date.now()).toLocaleString('en-IN'))+'</small></div><button type="button" class="danger" data-timeline-delete="'+esc(x.id)+'">Delete</button></article>').join('');
  }
  function renderAttachments(){
    const box=$('#attachmentList');
    if(!state.attachments.length){box.innerHTML='<div class="empty small">No documents attached.</div>';return}
    box.innerHTML=state.attachments.map(a=>'<article class="list-card"><div><strong>'+esc(a.name||a.type||'Document')+'</strong><p>'+esc(a.type||'')+(a.sizeLabel?' · '+esc(a.sizeLabel):'')+'</p></div><div class="row-btns">'+((a.url||a.data)?'<button type="button" data-attachment-open="'+esc(a.id)+'">Open</button>':'')+'<button type="button" class="danger" data-attachment-delete="'+esc(a.id)+'">Delete</button></div></article>').join('');
  }
  function renderAll(){
    bindFields();renderChecklist();renderProperties();renderAccused();renderHearings();renderTasks();renderTimeline();renderAttachments();status();
  }
  function addAudit(before,after){
    if(!before){
      after.timeline.push({id:Core.uid(),type:'Case',text:'Case created',date:new Date().toISOString().slice(0,10),createdAt:Core.now(),auto:true});
      return;
    }
    const labels={policeStation:'Police Station',caseType:'Head',crimeNo:'Crime No.',crimeYear:'Year',sections:'Sections',complainant:'Complainant',ioName:'Investigating Officer',priority:'Priority',court:'Court',courtCaseNo:'Court Case No.',stage:'Stage',nextHearing:'Next Hearing',nextAction:'Next Action',finalResult:'Final Result'};
    const changed=Object.keys(labels).filter(k=>String(before[k]??'')!==String(after[k]??''));
    if(changed.length)after.timeline.push({id:Core.uid(),type:'Edit',text:'Updated: '+changed.map(k=>labels[k]).join(', '),date:new Date().toISOString().slice(0,10),createdAt:Core.now(),auto:true});
  }
  function scheduleAutosave(){
    collectFields();status();setSave('Saving locally…','saving');clearTimeout(autosaveTimer);
    autosaveTimer=setTimeout(()=>{
      if(!state.crimeNo){setSave('Not saved yet','local');return}
      state=Core.saveCase(state,{queue:true,touch:true});
      setSave('✓ Saved locally','local');
      if(Core.token())Core.processQueue().then(ok=>setSave(ok?'☁ Synced':'⚠ Cloud pending',ok?'cloud':'error')).catch(()=>setSave('⚠ Cloud pending','error'));
    },700);
  }
  async function explicitSave(openDocs=false){
    clearTimeout(autosaveTimer);collectFields();
    if(!state.crimeNo){toast('Crime / CSR / UDR No. is required.');$('[data-field="crimeNo"]').focus();return false}
    if(saveBusy)return false;saveBusy=true;$('#saveBtn').disabled=true;
    try{
      addAudit(baseline,state);
      state=Core.saveCase(state,{queue:true,touch:true});
      baseline=clone(state);
      renderTimeline();status();setSave('✓ Saved locally','local');
      let synced=false;
      if(Core.token()){
        setSave('Saving to cloud…','saving');
        synced=await Core.processQueue();
        setSave(synced?'☁ Synced':'⚠ Saved locally · cloud pending',synced?'cloud':'error');
      }else setSave('✓ Saved locally · cloud login on dashboard','local');
      toast('Case saved.');
      if(openDocs){Core.setHandoff(state);location.href='/policedocuments/?case='+encodeURIComponent(state.id)}
      return true;
    }catch(e){
      console.error(e);setSave('⚠ Save error: '+e.message,'error');toast('Save error: '+e.message);return false;
    }finally{saveBusy=false;$('#saveBtn').disabled=false}
  }
  function leave(){
    clearTimeout(autosaveTimer);collectFields();
    if(state.crimeNo)state=Core.saveCase(state,{queue:true,touch:true});
    location.href='/mycases/?v=2';
  }
  function fileToData(file){
    return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file)});
  }
  async function setPersonPhoto(index,file){
    if(!file||!file.type.startsWith('image/')||!state.accusedPersons[index])return;
    const raw=await fileToData(file);
    const img=new Image();
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=raw});
    const max=640,scale=Math.min(1,max/Math.max(img.width,img.height)),cv=document.createElement('canvas');
    cv.width=Math.round(img.width*scale);cv.height=Math.round(img.height*scale);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    state.accusedPersons[index].photo=cv.toDataURL('image/jpeg',.7);renderAccused();scheduleAutosave();
  }

  async function setPropertyPhoto(index,file){
    if(!file||!file.type.startsWith('image/')||!state.propertyItems[index])return;
    const raw=await fileToData(file);
    const img=new Image();
    await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=raw});
    const max=900,scale=Math.min(1,max/Math.max(img.width,img.height)),cv=document.createElement('canvas');
    cv.width=Math.round(img.width*scale);cv.height=Math.round(img.height*scale);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);
    state.propertyItems[index].photo=cv.toDataURL('image/jpeg',.68);
    renderProperties();scheduleAutosave();
  }

  document.addEventListener('input',e=>{
    if(e.target.matches('[data-field]'))scheduleAutosave();
    const i=Number(e.target.dataset.i),key=e.target.dataset.personField;
    if(key&&state.accusedPersons[i]){state.accusedPersons[i][key]=e.target.value;scheduleAutosave()}
    const pi=Number(e.target.dataset.pi),pkey=e.target.dataset.propertyField;
    if(pkey&&state.propertyItems[pi]){state.propertyItems[pi][pkey]=e.target.value;scheduleAutosave()}
  });
  document.addEventListener('change',e=>{
    if(e.target.matches('[data-field]')){
      if(e.target.dataset.field==='caseType'){collectFields();ensureChecklist();renderChecklist()}
      if(e.target.dataset.field==='finalResult'&&e.target.value){
        const map={'Committed to Higher Court':'Case Disposed','Other Disposal':'Case Disposed'};
        state.stage=map[e.target.value]||e.target.value;$('[data-field="stage"]').value=state.stage;
      }
      scheduleAutosave();
    }
    const i=Number(e.target.dataset.i),key=e.target.dataset.personField;
    if(key&&state.accusedPersons[i]){state.accusedPersons[i][key]=e.target.value;scheduleAutosave()}
    if(e.target.dataset.check){
      const x=state.investigationChecklist.find(v=>v.id===e.target.dataset.check);if(x){x.done=e.target.checked;if(x.done&&!x.date)x.date=new Date().toISOString().slice(0,10);renderChecklist();renderProperties();scheduleAutosave()}
    }
    if(e.target.dataset.checkDate){
      const x=state.investigationChecklist.find(v=>v.id===e.target.dataset.checkDate);if(x){x.date=e.target.value;scheduleAutosave()}
    }
    if(e.target.dataset.taskCheck){
      const t=state.tasks.find(v=>v.id===e.target.dataset.taskCheck);if(t){t.done=e.target.checked;t.completedAt=t.done?Core.now():'';renderTasks();scheduleAutosave()}
    }
    const pi=Number(e.target.dataset.pi),pkey=e.target.dataset.propertyField;
    if(pkey&&state.propertyItems[pi]){
      const p=state.propertyItems[pi],before=p[pkey]||'',after=e.target.value;p[pkey]=after;
      if(pkey==='courtSubmissionRequired'&&after==='No'){p.courtSubmissionStatus='Not required';p.courtSentDate='';p.propertyNumberReceived='';p.propertyNumber='';p.propertyNumberDate=''}
      if(pkey==='courtSubmissionRequired'&&after==='Yes'&&p.courtSubmissionStatus==='Not required')p.courtSubmissionStatus='Pending';
      if(pkey==='courtSubmissionStatus'&&after==='Sent'&&!p.courtSentDate)p.courtSentDate=new Date().toISOString().slice(0,10);
      if(pkey==='courtSubmissionStatus'&&after==='Sent'&&before!=='Sent')state.timeline.push({id:Core.uid(),type:'Property',text:'Property sent to court: '+(p.description||'Seized property'),date:p.courtSentDate||new Date().toISOString().slice(0,10),createdAt:Core.now(),auto:true});
      if(pkey==='propertyNumberReceived'&&after==='Yes'&&!p.propertyNumberDate)p.propertyNumberDate=new Date().toISOString().slice(0,10);
      if(pkey==='propertyNumberReceived'&&after==='Yes'&&before!=='Yes')state.timeline.push({id:Core.uid(),type:'Property',text:'Property / PR Number received for '+(p.description||'seized property'),date:p.propertyNumberDate||new Date().toISOString().slice(0,10),createdAt:Core.now(),auto:true});
      renderProperties();renderTimeline();scheduleAutosave();
    }
  });
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.tab){setTab(b.dataset.tab);return}
    if(b.dataset.propertyDelete!==undefined){state.propertyItems.splice(Number(b.dataset.propertyDelete),1);renderProperties();scheduleAutosave()}
    else if(b.dataset.propertyPhoto!==undefined){
      const input=document.createElement('input');input.type='file';input.accept='image/*';input.capture='environment';input.onchange=()=>setPropertyPhoto(Number(b.dataset.propertyPhoto),input.files[0]);input.click();
    }
    else if(b.dataset.personDelete!==undefined){state.accusedPersons.splice(Number(b.dataset.personDelete),1);renderAccused();scheduleAutosave()}
    else if(b.dataset.photo!==undefined){
      const input=document.createElement('input');input.type='file';input.accept='image/*';input.capture='environment';input.onchange=()=>setPersonPhoto(Number(b.dataset.photo),input.files[0]);input.click();
    }else if(b.dataset.hearingDelete){state.hearings=state.hearings.filter(x=>x.id!==b.dataset.hearingDelete);renderHearings();scheduleAutosave()}
    else if(b.dataset.taskDelete){state.tasks=state.tasks.filter(x=>x.id!==b.dataset.taskDelete);renderTasks();scheduleAutosave()}
    else if(b.dataset.timelineDelete){state.timeline=state.timeline.filter(x=>x.id!==b.dataset.timelineDelete);renderTimeline();scheduleAutosave()}
    else if(b.dataset.attachmentDelete){state.attachments=state.attachments.filter(x=>x.id!==b.dataset.attachmentDelete);renderAttachments();scheduleAutosave()}
    else if(b.dataset.attachmentOpen){
      const a=state.attachments.find(x=>x.id===b.dataset.attachmentOpen);if(a?.url)window.open(a.url,'_blank','noopener');else if(a?.data)window.open(a.data,'_blank','noopener');
    }
  });

  async function init(){
    Core.init();
    $('#stage').innerHTML=STAGES.map(s=>'<option>'+esc(s)+'</option>').join('');
    const params=new URLSearchParams(location.search),id=params.get('id'),isNew=params.get('new')==='1'||!id;
    if(isNew)state=defaults();
    else{
      state=Core.getCase(id);
      const h=Core.getHandoff();
      if(h&&String(h.id)===String(id))state=Core.mergeCase(state,h);
      if(!state){toast('Case not found.');setTimeout(leave,700);return}
    }
    ensureChecklist();baseline=isNew?null:clone(state);renderAll();
    $('#editorTitle').textContent=isNew?'New Case':'Edit Case';
    $('#saveBtn').textContent=isNew?'Create Case':'Save Changes';

    $$('.tabs button').forEach(b=>b.addEventListener('click',()=>setTab(b.dataset.tab)));
    $('#saveBtn').addEventListener('click',()=>explicitSave(false));
    $('#saveDocsBtn').addEventListener('click',()=>explicitSave(true));
    $('#dashboardBtn').addEventListener('click',leave);
    $('#addProperty').addEventListener('click',()=>{
      const step=state.investigationChecklist.find(x=>String(x.label||'').toLowerCase()==='property seized');
      if(step){step.done=true;if(!step.date)step.date=new Date().toISOString().slice(0,10)}
      state.propertyItems.push(newProperty());renderChecklist();renderProperties();scheduleAutosave();
    });
    $('#addAccused').addEventListener('click',()=>{state.accusedPersons.push({id:Core.uid(),name:'',alias:'',dob:'',status:'Accused',photo:'',age:'',phone:'',address:'',idProof:'',arrestDate:'',hsCategory:'',remarks:''});renderAccused();scheduleAutosave()});
    $('#addHearing').addEventListener('click',()=>{
      const date=$('#hearingDate').value;if(!date){$('#hearingDate').focus();return}
      const h={id:Core.uid(),date,purpose:$('#hearingPurpose').value.trim(),witness:$('#hearingWitness').value.trim(),proceedings:$('#hearingProceedings').value.trim(),next:$('#hearingNext').value,result:$('#hearingResult').value.trim(),createdAt:Core.now()};
      state.hearings.push(h);if(h.next){state.nextHearing=h.next;$('[data-field="nextHearing"]').value=h.next}
      ['hearingDate','hearingPurpose','hearingWitness','hearingProceedings','hearingNext','hearingResult'].forEach(id=>$('#'+id).value='');renderHearings();scheduleAutosave();
    });
    $('#addTask').addEventListener('click',()=>{const text=$('#taskText').value.trim();if(!text)return;state.tasks.push({id:Core.uid(),text,due:$('#taskDue').value,done:false,createdAt:Core.now()});$('#taskText').value='';$('#taskDue').value='';renderTasks();scheduleAutosave()});
    $('#addTimeline').addEventListener('click',()=>{const text=$('#timelineText').value.trim();if(!text)return;state.timeline.push({id:Core.uid(),type:$('#timelineType').value,text,date:$('#timelineDate').value||new Date().toISOString().slice(0,10),createdAt:Core.now()});$('#timelineText').value='';renderTimeline();scheduleAutosave()});
    $('#addLink').addEventListener('click',()=>{const url=$('#attachmentLink').value.trim();if(!url)return;try{new URL(url)}catch(e){toast('Enter a valid link.');return}state.attachments.push({id:Core.uid(),type:$('#attachmentType').value,name:'Linked document',url,sizeLabel:'Link',addedAt:Core.now()});$('#attachmentLink').value='';renderAttachments();scheduleAutosave()});
    $('#addFile').addEventListener('click',async()=>{const file=$('#attachmentFile').files[0];if(!file){$('#attachmentFile').click();return}if(file.size>750000){toast('For files above 750 KB, use a private Drive link.');return}const data=await fileToData(file);state.attachments.push({id:Core.uid(),type:$('#attachmentType').value,name:file.name,mime:file.type,size:file.size,sizeLabel:Math.round(file.size/1024)+' KB',data,addedAt:Core.now()});$('#attachmentFile').value='';renderAttachments();scheduleAutosave()});
    $('#timelineDate').value=new Date().toISOString().slice(0,10);
    const savedTab=sessionStorage.getItem('myCasesEditorTab')||'overview';setTab(savedTab);
    const session=await Core.checkSession();
    $('#cloudState').textContent=session?'Cloud connected':'Local-first';
    if(session){Core.processQueue().catch(()=>{})}
  }
  document.addEventListener('DOMContentLoaded',init);
})();