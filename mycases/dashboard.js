(function(){
  'use strict';
  const Core=window.MyCasesCore;
  const $=s=>document.querySelector(s);
  const $$=s=>[...document.querySelectorAll(s)];
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const fmt=v=>{if(!v)return'—';const d=new Date(v+'T00:00:00');return Number.isNaN(d.getTime())?v:d.toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'})};
  const days=v=>{if(!v)return null;const d=new Date(v+'T00:00:00'),t=new Date();t.setHours(0,0,0,0);return Math.round((d-t)/86400000)};
  let showDeleted=false;

  function isDisposed(c){return Boolean(c.finalResult)||/^(convicted|acquitted|discharged|compounded|abated|case disposed)$/i.test(String(c.stage||''))}
  function all(){return Core.listCases({includeDeleted:true})}
  function active(){return all().filter(c=>!c.deletedAt)}
  function filtered(){
    const q=$('#search')?.value.trim().toLowerCase()||'';
    const stage=$('#stageFilter')?.value||'';
    const source=showDeleted?all().filter(c=>c.deletedAt):active();
    return source.filter(c=>{
      const hay=(JSON.stringify(c)||'').toLowerCase();
      return (!q||hay.includes(q))&&(!stage||c.stage===stage);
    }).sort((a,b)=>String(b.updatedAt||'').localeCompare(String(a.updatedAt||'')));
  }
  function stats(){
    const a=active();
    const upcoming=a.filter(c=>{const n=days(c.nextHearing);return n!==null&&n>=0&&n<=7&&!isDisposed(c)}).length;
    const overdue=a.filter(c=>{const n=days(c.nextHearing);return n!==null&&n<0&&!isDisposed(c)}).length;
    $('#statTotal').textContent=a.length;
    $('#statActive').textContent=a.filter(c=>!isDisposed(c)).length;
    $('#statUpcoming').textContent=upcoming;
    $('#statOverdue').textContent=overdue;
    $('#statDeleted').textContent=all().filter(c=>c.deletedAt).length;
    $('#pendingSync').textContent=Core.pendingCount();
    const last=Core.lastSync();
    $('#lastSync').textContent=last?new Date(last).toLocaleString('en-IN'):'Never';
  }
  function renderList(){
    const box=$('#caseList'),data=filtered();
    $('#listTitle').textContent=showDeleted?'Deleted Cases':'Cases';
    if(!data.length){
      box.innerHTML='<div class="empty">'+(showDeleted?'No deleted cases.':'No cases found.')+'</div>';
      stats();return;
    }
    box.innerHTML=data.map(c=>{
      const ref=(c.caseType||'Case')+' '+(c.crimeNo||'—')+(c.crimeYear?'/'+c.crimeYear:'');
      const meta=[c.policeStation||'Police Station not set',c.stage||'Investigation',c.nextHearing?'Next '+fmt(c.nextHearing):'No hearing date'];
      const actions=showDeleted
        ? '<button data-restore="'+esc(c.id)+'">Restore</button><button class="danger" data-permanent="'+esc(c.id)+'">Delete Permanently</button>'
        : '<button data-view="'+esc(c.id)+'">View</button><button data-edit="'+esc(c.id)+'">Edit</button><button data-docs="'+esc(c.id)+'">Documents</button><button class="danger" data-delete="'+esc(c.id)+'">Delete</button>';
      return '<article class="case-card"><div><div class="case-title">'+esc(ref)+'</div><div class="case-meta">'+meta.map(esc).join(' · ')+'</div><div class="case-sub">Sections: '+esc(c.sections||'—')+' · Accused: '+esc(c.accused||((c.accusedPersons||[]).map(x=>x.name).filter(Boolean).join(', ')||'—'))+'</div></div><div class="case-actions">'+actions+'</div></article>';
    }).join('');
    stats();
  }
  function section(title,html){
    if(!html)return'';
    return '<section class="view-section"><h3>'+esc(title)+'</h3>'+html+'</section>';
  }
  function kv(label,value){
    return '<div class="kv"><span>'+esc(label)+'</span><strong>'+esc(value||'—')+'</strong></div>';
  }
  function renderView(c){
    if(!c)return;
    $('#viewTitle').textContent=(c.caseType||'Case')+' '+(c.crimeNo||'')+(c.crimeYear?'/'+c.crimeYear:'');
    const overview=[
      ['Police Station / Unit',c.policeStation],['Head',c.caseType],['Sections',c.sections],
      ['Date of Occurrence',fmt(c.dateOccurrence)],['Date of Registration',fmt(c.dateRegistration)],
      ['Scene of Crime',c.sceneOfCrime],['Complainant',c.complainant],['Investigating Officer',c.ioName],
      ['Priority',c.priority],['Stage',c.stage],['Next Hearing',fmt(c.nextHearing)],['Next Action',c.nextAction],
      ['Notes',c.notes]
    ].map(x=>kv(x[0],x[1])).join('');
    const accused=(c.accusedPersons||[]).map(p=>'<div class="read-card"><strong>'+esc(p.name||'Unnamed accused')+'</strong><span>'+esc(p.alias?' @ '+p.alias:'')+'</span><div>'+esc(p.status||'Accused')+(p.age?' · Age '+esc(p.age):'')+(p.phone?' · '+esc(p.phone):'')+'</div><small>'+esc(p.address||'')+'</small></div>').join('') || '<div class="muted">'+esc(c.accused||'No accused details')+'</div>';
    const court=[
      ['Court Complex',c.courtComplex],['Court',c.court],['Case Type',c.courtCaseType],['Court Case No.',c.courtCaseNo],
      ['Accused Present',c.accusedPresentDetails],['NBW Status',c.nbwStatus],['FS Status',c.fsStatus],['Final Result',c.finalResult]
    ].map(x=>kv(x[0],x[1])).join('');
    const hearings=(c.hearings||[]).map(h=>'<div class="read-card"><strong>'+esc(fmt(h.date))+(h.purpose?' · '+esc(h.purpose):'')+'</strong><div>'+esc(h.proceedings||h.witness||'')+'</div><small>Next: '+esc(fmt(h.next))+(h.result?' · '+esc(h.result):'')+'</small></div>').join('')||'<div class="muted">No hearing history</div>';
    const tasks=(c.tasks||[]).map(t=>'<div class="read-card"><strong>'+(t.done?'✓ ':'')+esc(t.text||'Task')+'</strong><small>'+esc(t.due?fmt(t.due):'No due date')+'</small></div>').join('')||'<div class="muted">No tasks</div>';
    const investigation=(c.investigationChecklist||[]).map(x=>'<div class="read-card"><strong>'+(x.done?'✓ ':'○ ')+esc(x.label||'')+'</strong><small>'+esc(x.date?fmt(x.date):'')+'</small></div>').join('')||'<div class="muted">No investigation checklist</div>';
    const timeline=(c.timeline||[]).slice().sort((a,b)=>String(b.date||b.createdAt).localeCompare(String(a.date||a.createdAt))).map(x=>'<div class="read-card"><strong>'+esc(x.type||'Update')+'</strong><div>'+esc(x.text||'')+'</div><small>'+esc(x.date?fmt(x.date):new Date(x.createdAt||Date.now()).toLocaleString('en-IN'))+'</small></div>').join('')||'<div class="muted">No timeline entries</div>';
    const docs=(c.attachments||[]).map(a=>'<div class="read-card"><strong>'+esc(a.name||a.type||'Document')+'</strong><small>'+esc(a.type||'')+(a.sizeLabel?' · '+esc(a.sizeLabel):'')+'</small></div>').join('')||'<div class="muted">No documents</div>';
    const requests=c.requests?'<pre>'+esc(JSON.stringify(c.requests,null,2))+'</pre>':'';
    $('#viewBody').innerHTML=section('Overview','<div class="kv-grid">'+overview+'</div>')+
      section('Accused',accused)+section('Court','<div class="kv-grid">'+court+'</div>'+hearings)+
      section('Tasks',tasks)+section('Investigation',investigation)+section('Timeline',timeline)+section('Documents',docs)+
      (requests?section('Linked Requests',requests):'');
    $('#viewPanel').classList.add('open');
    $('#viewPanel').scrollTop=0;
  }
  function openEditor(id){
    const c=Core.getCase(id);if(c)Core.setHandoff(c);
    location.href='/mycases/edit/?id='+encodeURIComponent(id)+'&v=2';
  }
  function newCase(){location.href='/mycases/edit/?new=1&v=2'}
  function openDocs(id){
    const c=Core.getCase(id);if(!c)return;
    Core.setHandoff(c);
    location.href='/policedocuments/?case='+encodeURIComponent(c.id);
  }
  function toast(msg){
    const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2200);
  }
  function updateCloud(){
    const connected=Boolean(Core.token());
    $('#cloudState').textContent=connected?'Cloud connected':'Local only';
    $('#cloudBtn').textContent=connected?'Sync Now':'Cloud Login';
  }
  async function syncNow(){
    if(!Core.token()){ $('#loginDialog').classList.add('open');return }
    $('#cloudBtn').disabled=true;
    try{await Core.processQueue();await Core.syncFromCloud();await Core.processQueue();toast('Cloud sync complete.')}
    catch(e){toast('Cloud sync pending: '+e.message)}
    finally{$('#cloudBtn').disabled=false;renderList();updateCloud()}
  }
  async function login(){
    const p=$('#cloudPassword').value;if(!p)return;
    $('#loginSubmit').disabled=true;
    try{await Core.login(p);$('#loginDialog').classList.remove('open');$('#cloudPassword').value='';await Core.processQueue();await Core.syncFromCloud();toast('Cloud connected.');renderList()}
    catch(e){toast(e.message)}
    finally{$('#loginSubmit').disabled=false;updateCloud()}
  }

  document.addEventListener('click',async e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.view)renderView(Core.getCase(b.dataset.view));
    else if(b.dataset.edit)openEditor(b.dataset.edit);
    else if(b.dataset.docs)openDocs(b.dataset.docs);
    else if(b.dataset.delete){
      const c=Core.getCase(b.dataset.delete);if(c&&confirm('Delete '+(c.caseType||'Case')+' '+(c.crimeNo||'')+'?\n\nIt can be restored later.')){
        Core.softDelete(c.id);renderList();Core.processQueue();
      }
    }else if(b.dataset.restore){Core.restore(b.dataset.restore);renderList();Core.processQueue()}
    else if(b.dataset.permanent){
      if(confirm('Permanently delete this case? This cannot be undone.')){Core.permanentlyDelete(b.dataset.permanent);renderList()}
    }
  });

  async function init(){
    Core.init();
    const stages=[...new Set(active().map(c=>c.stage).filter(Boolean))].sort();
    $('#stageFilter').innerHTML='<option value="">All Stages</option>'+stages.map(s=>'<option>'+esc(s)+'</option>').join('');
    $('#search').addEventListener('input',renderList);
    $('#stageFilter').addEventListener('change',renderList);
    $('#newCaseBtn').addEventListener('click',newCase);
    $('#deletedBtn').addEventListener('click',()=>{showDeleted=!showDeleted;$('#deletedBtn').classList.toggle('active',showDeleted);renderList()});
    $('#closeView').addEventListener('click',()=>$('#viewPanel').classList.remove('open'));
    $('#cloudBtn').addEventListener('click',syncNow);
    $('#loginSubmit').addEventListener('click',login);
    $('#loginCancel').addEventListener('click',()=>$('#loginDialog').classList.remove('open'));
    $('#cloudPassword').addEventListener('keydown',e=>{if(e.key==='Enter')login()});
    window.addEventListener('mycases:changed',renderList);
    window.addEventListener('mycases:sync',stats);
    renderList();updateCloud();
    const session=await Core.checkSession();
    updateCloud();
    if(session){
      try{await Core.processQueue();await Core.syncFromCloud();await Core.processQueue();renderList()}catch(e){}
    }
  }
  document.addEventListener('DOMContentLoaded',init);
})();