(() => {
  'use strict';
  window.CDRContactsExtras=function(ctx){
    const {$,state,aggregateContacts,analysisRecords,recordsIgnoringDateTimeFilters,phoneKey,contactName,contactLabel,contactTag,requestIdentifier,identityStore,persistLocal,download,dtFmt,escapeHtml,escAttr,fmtInt,showStatus,audit,localDateKey,simpleTable}=ctx;
    const core=window.CDRContactsInsights;
    if(!(state.contactShortlist instanceof Set))state.contactShortlist=new Set();
    const keyOf=r=>r.bpartyKey||(phoneKey?phoneKey(r.bparty):String(r.bparty||''));
    const history=()=>recordsIgnoringDateTimeFilters();
    const global=()=>core&&analysisRecords?core.build(analysisRecords(),phoneKey||String):new Map();
    const scoped=()=>core?core.build(history(),phoneKey||String):new Map();
    let cachedGlobal=null;
    function sharedIndex(){return cachedGlobal||(cachedGlobal=global());}
    function visibleRows(){
      cachedGlobal=null;
      const data=$('contactsDataScope')?.value==='history'?history():state.filtered;
      const q=String($('contactsSearch')?.value||'').trim().toLowerCase();
      const tag=$('contactsTagFilter')?.value||'';
      const min=Math.max(0,Number($('contactsMinCalls')?.value)||0);
      const shared=!!$('contactsSharedOnly')?.checked;
      const shortlisted=!!$('contactsShortlistOnly')?.checked;
      const globalMap=shared?sharedIndex():null;
      return aggregateContacts(data).filter(x=>{
        const label=[x.bparty,contactLabel(x.bparty),contactName(x.bparty),contactTag(x.bparty),...(x.aliases||[]),...(x.cdrs||[])].join(' ').toLowerCase();
        return (!q||label.includes(q))&&(!tag||contactTag(x.bparty)===tag)&&x.calls>=min&&(!shared||(globalMap.get(x.key)?.subjects.size||0)>=2)&&(!shortlisted||state.contactShortlist.has(requestIdentifier(x.bparty)));
      });
    }
    function details(){return scoped();}
    function commonCount(key){return sharedIndex().get(key)?.subjects.size||0;}
    function compareButton(key){
      const n=commonCount(key);
      return '<button class="btn secondary small contact-compare-subjects" type="button" data-key="'+escAttr(key)+'">Compare subjects'+(n>1?' ('+n+')':'')+'</button>';
    }
    function shortlistMarker(raw){return state.contactShortlist.has(requestIdentifier(raw))?' <span title="In investigation shortlist">★</span>':'';}
    function onRender(rows){
      if($('contactsShowingCount'))$('contactsShowingCount').textContent=rows.length+' shown • '+state.requestSelected.size+' checked • '+state.contactShortlist.size+' shortlisted';
    }
    const selected=()=>[...state.requestSelected].filter(x=>/^(?:\d{10}|\d{15})$/.test(x));
    function selectedAliases(){
      const ids=new Set(selected()),aliases=new Set(ids);
      if(analysisRecords)for(const r of analysisRecords())if(ids.has(requestIdentifier(r.bparty)))aliases.add(r.bparty);
      return aliases;
    }
    function tagSelected(){
      const choice=$('contactsBulkTag')?.value||'';
      if(!choice){showStatus('Choose a tag first.','error');return;}
      const nums=selected();if(!nums.length){showStatus('Select numeric contacts first.','error');return;}
      const value=choice==='Unclassified'?'':choice,store=identityStore('tag');
      for(const raw of selectedAliases())store[raw]=value;
      if($('identityScope')?.value==='global')persistLocal?.('cdrAnalyzer:globalContactTags',JSON.stringify(state.globalContactTags));
      audit?.('Contacts bulk-tagged',nums.length+' numbers');
      showStatus(nums.length+' contacts tagged '+(value||'Unclassified')+'.','ok');ctx.render?.();
    }
    function changeShortlist(add){
      const nums=selected();if(!nums.length){showStatus('Select numeric contacts first.','error');return;}
      for(const n of nums){if(add)state.contactShortlist.add(n);else state.contactShortlist.delete(n);}
      audit?.('Contacts shortlist changed',(add?'Add ':'Remove ')+nums.length+' numbers');
      ctx.render?.();showStatus(nums.length+' contact(s) '+(add?'added to':'removed from')+' shortlist.','ok');
    }
    function exportSelected(){
      const nums=selected();if(!nums.length){showStatus('Select numeric contacts first.','error');return;}
      const all=global(),lookup=new Map();
      if(analysisRecords)for(const r of analysisRecords()){const id=requestIdentifier(r.bparty);if(id&&!lookup.has(id))lookup.set(id,r.bparty);}
      const headers=['Number','Contact name','Tag','Shortlisted','First voice call','First incoming','First outgoing','Last voice call','Last event','CDR subjects'];
      const value=x=>dtFmt(core?.date(x))||'';
      const rows=nums.map(id=>{const raw=lookup.get(id)||id,summary=all.get(phoneKey?phoneKey(raw):raw);return [id,contactName(raw),contactTag(raw),state.contactShortlist.has(id)?'Yes':'No',value(summary?.firstCall),value(summary?.firstIncoming),value(summary?.firstOutgoing),value(summary?.lastCall),value(summary?.lastEvent),[...(summary?.subjects.keys()||[])].join('; ')];});
      if(!core){showStatus('CSV tools not loaded. Refresh the page.','error');return;}
      download('cdr_selected_contacts.csv','\uFEFF'+core.csv(headers,rows),'text/csv;charset=utf-8');
      showStatus(nums.length+' selected contacts exported to a local CSV file.','ok');
    }
    function comparison(key){
      const panel=$('contactsComparisonPanel');if(!panel)return;
      const subjectMap=global().get(key);
      if(!subjectMap){panel.innerHTML='<div class="tiny">No matching contact in loaded CDR records.</div>';return;}
      const rows=[...subjectMap.subjects.values()].sort((a,b)=>b.calls-a.calls||b.records-a.records);
      panel.innerHTML='<div class="panel" style="box-shadow:none"><div class="panel-title"><h3>Contact across CDR subjects: '+escapeHtml(key)+'</h3><button type="button" class="btn secondary small contacts-close-comparison">Close</button></div><p class="tiny">Comparison uses all loaded subjects in the selected analysis/deduplication mode, regardless of current filters. Shared communication does not establish wrongdoing or an association by itself.</p>'+simpleTable(['Subject CDR','Events','Voice calls','First event','Last event'],rows.map(v=>[escapeHtml(v.subject),fmtInt(v.records),fmtInt(v.calls),dtFmt(core.date(v.first))||'—',dtFmt(core.date(v.last))||'—']))+'</div>';
      panel.scrollIntoView?.({behavior:'smooth',block:'nearest'});
    }
    function timelineFor(raw){
      if(!core||!analysisRecords)return '';
      const key=phoneKey?phoneKey(raw):raw;
      const all=analysisRecords(),t=core.timeline(all,key,phoneKey||String,localDateKey),info=core.build(all,phoneKey||String).get(key);
      if(!info)return '';
      const val=v=>dtFmt(core.date(v))||'—';
      const rows=t.days.slice(-45),max=Math.max(1,...rows.map(d=>d.calls));
      const chart=rows.map(d=>{
        const width=Math.round(d.calls*100/max);
        return '<div style="display:flex;align-items:center;gap:8px;margin:4px 0"><span style="width:85px">'+escapeHtml(d.day)+'</span><div style="min-width:50px;flex:1;height:12px;background:#e5e7eb;border-radius:3px"><div style="height:100%;width:'+width+'%;background:#0e7490;border-radius:3px"></div></div><span style="min-width:110px">'+fmtInt(d.calls)+' calls · '+fmtInt(d.sms)+' SMS</span></div>';
      }).join('');
      return '<h3>Call dates and communication timeline</h3><p>First incoming: '+val(info.firstIncoming)+' • First outgoing: '+val(info.firstOutgoing)+' • Last call: '+val(info.lastCall)+' • Last event: '+val(info.lastEvent)+'</p><p class="tiny">Last 45 active days in full loaded history, independent of the current date/time filters. '+fmtInt(t.voiceCalls)+' voice calls; longest observed gap between consecutive calls: '+t.largestGapDays.toFixed(1)+' days. Gaps can reflect incomplete CDR coverage.</p>'+(chart||'<p class="tiny">No dated events for timeline.</p>');
    }
    function bind(){
      for(const id of ['contactsSearch','contactsMinCalls'])$(id)?.addEventListener('input',()=>ctx.render?.());
      for(const id of ['contactsTagFilter','contactsSharedOnly','contactsShortlistOnly','contactsDataScope'])$(id)?.addEventListener('change',()=>ctx.render?.());
      $('contactsSelectVisible')?.addEventListener('click',()=>{
        for(const x of visibleRows()){const num=requestIdentifier(x.bparty);if(num)state.requestSelected.add(num);}
        ctx.render?.();showStatus('Visible numeric contacts added to selection.','ok');
      });
      $('contactsBulkTagApply')?.addEventListener('click',tagSelected);
      $('contactsShortlistAdd')?.addEventListener('click',()=>changeShortlist(true));
      $('contactsShortlistRemove')?.addEventListener('click',()=>changeShortlist(false));
      $('contactsExportSelected')?.addEventListener('click',exportSelected);
      $('contactsTable')?.addEventListener('click',e=>{
        const target=e.target.closest('.contact-compare-subjects');
        if(target){e.preventDefault();comparison(target.dataset.key);}
      });
      $('contactsComparisonPanel')?.addEventListener('click',e=>{
        if(e.target.closest('.contacts-close-comparison'))$('contactsComparisonPanel').innerHTML='';
      });
    }
    return {visibleRows,details,commonCount,compareButton,shortlistMarker,onRender,bind,timelineFor,comparison,exportSelected,changeShortlist,tagSelected};
  };
})();
