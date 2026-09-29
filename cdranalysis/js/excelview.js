(() => {
  'use strict';
  window.CDRExcelViewFactory=function(ctx){
    const {$,state,escapeHtml,escAttr,fmtInt,phoneKey,showStatus}=ctx;
    let page=1;

    const subjectKey=v=>phoneKey?phoneKey(v):String(v??'').trim();
    const selectedSubject=()=>$('excelViewSubject')?.value||'';
    const selectedSource=()=>$('excelViewSource')?.value||'';
    const searchText=()=>String($('excelViewSearch')?.value||'').trim().toLowerCase();
    const pageSize=()=>Math.max(25,+$('excelViewPageSize')?.value||100);

    function sourceKey(r){return String(r.fileId)+'|'+String(r.sourceSheet||'');}
    function subjectRows(){
      const subject=selectedSubject(),key=subjectKey(subject);if(!key)return [];
      return state.records.filter(r=>subjectKey(r.cdrNo)===key);
    }
    function scopedRows(){
      let rows=subjectRows(),src=selectedSource(),q=searchText();
      if(src)rows=rows.filter(r=>sourceKey(r)===src);
      if(q)rows=rows.filter(r=>Object.values(r.rawRow||{}).some(v=>String(v??'').toLowerCase().includes(q))||String(r.rowNumber||'').includes(q));
      return rows.sort((a,b)=>(a.fileId-b.fileId)||(String(a.sourceSheet||'').localeCompare(String(b.sourceSheet||'')))||((a.rowNumber||0)-(b.rowNumber||0)));
    }
    function headersFor(rows){
      const out=[],seen=new Set();
      for(const r of rows){for(const h of Object.keys(r.rawRow||{})){if(!seen.has(h)){seen.add(h);out.push(h);}}}
      return out;
    }
    function refreshSelectors(){
      const subjectEl=$('excelViewSubject'),sourceEl=$('excelViewSource');if(!subjectEl||!sourceEl)return;
      const current=subjectEl.value,subjects=[...new Map(state.records.filter(r=>r.cdrNo).map(r=>[subjectKey(r.cdrNo),r.cdrNo])).values()].sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
      subjectEl.innerHTML='<option value="">Select number</option>'+subjects.map(x=>`<option value="${escAttr(x)}">${escapeHtml(x)}</option>`).join('');
      if(subjects.includes(current))subjectEl.value=current;else if(subjects.length===1)subjectEl.value=subjects[0];

      const rows=subjectRows(),curSrc=sourceEl.value,sources=[...new Map(rows.map(r=>[sourceKey(r),{key:sourceKey(r),label:(r.sourceFile||'')+' / '+(r.sourceSheet||'')}])).values()];
      sourceEl.innerHTML='<option value="">All source worksheets</option>'+sources.map(x=>`<option value="${escAttr(x.key)}">${escapeHtml(x.label)}</option>`).join('');
      if(sources.some(x=>x.key===curSrc))sourceEl.value=curSrc;
    }
    function render(){
      refreshSelectors();
      const table=$('excelViewTable'),scope=$('excelViewScope'),pager=$('excelViewPager');if(!table||!scope||!pager)return;
      const subject=selectedSubject();if(!subject){
        scope.textContent='Select one loaded CDR / A-party number.';
        table.innerHTML='<tbody><tr><td class="empty" style="padding:28px;text-align:center">Select a number to display its original Excel rows.</td></tr></tbody>';pager.innerHTML='';return;
      }
      const all=scopedRows(),withRaw=all.filter(r=>r.rawRow&&Object.keys(r.rawRow).length);
      if(!withRaw.length){
        scope.textContent=`Number ${subject} • ${fmtInt(all.length)} matching record(s)`;
        table.innerHTML='<tbody><tr><td class="empty" style="padding:28px;text-align:center"><b>Original Excel row data is not available for these records.</b><br><span class="tiny">Re-import the source CDR file with the current analyzer version to enable Excel View.</span></td></tr></tbody>';pager.innerHTML='';return;
      }
      const headers=headersFor(withRaw),size=pageSize(),pages=Math.max(1,Math.ceil(withRaw.length/size));if(page>pages)page=pages;if(page<1)page=1;
      const rows=withRaw.slice((page-1)*size,page*size);
      const sourceLabel=selectedSource()?($('excelViewSource')?.selectedOptions?.[0]?.textContent||'Selected worksheet'):'All source worksheets';
      scope.textContent=`${subject} • ${sourceLabel} • ${fmtInt(withRaw.length)} original row(s) • ${fmtInt(headers.length)} source column(s)`;

      table.innerHTML=`<thead><tr><th>Source Row</th>${headers.map(h=>`<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><td><b>${fmtInt(r.rowNumber)}</b><div class="tiny">${escapeHtml(r.sourceFile||'')}<br>${escapeHtml(r.sourceSheet||'')}</div></td>${headers.map(h=>`<td class="details">${escapeHtml(r.rawRow?.[h]??'')}</td>`).join('')}</tr>`).join('')}</tbody>`;
      pager.innerHTML=`<span class="tiny">Rows ${fmtInt((page-1)*size+1)}–${fmtInt(Math.min(page*size,withRaw.length))} of ${fmtInt(withRaw.length)}</span><button class="btn secondary small" id="excelViewPrev" ${page<=1?'disabled':''}>Previous</button><span class="badge">Page ${fmtInt(page)} / ${fmtInt(pages)}</span><button class="btn secondary small" id="excelViewNext" ${page>=pages?'disabled':''}>Next</button>`;
    }
    function csvCell(v){const s=String(v??'');return /[",\n\r]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s;}
    function exportCsv(){
      const rows=scopedRows().filter(r=>r.rawRow&&Object.keys(r.rawRow).length);if(!rows.length){showStatus?.('No original Excel rows available to export.','error');return;}
      const headers=headersFor(rows),lines=[['Source File','Source Sheet','Source Row',...headers].map(csvCell).join(',')];
      for(const r of rows)lines.push([r.sourceFile,r.sourceSheet,r.rowNumber,...headers.map(h=>r.rawRow?.[h]??'')].map(csvCell).join(','));
      const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download='excel_view_'+String(selectedSubject()).replace(/[^0-9A-Za-z_-]+/g,'_')+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }
    function bind(){
      $('excelViewSubject')?.addEventListener('change',()=>{page=1;refreshSelectors();render();});
      $('excelViewSource')?.addEventListener('change',()=>{page=1;render();});
      $('excelViewSearch')?.addEventListener('input',()=>{page=1;render();});
      $('excelViewPageSize')?.addEventListener('change',()=>{page=1;render();});
      $('excelViewExport')?.addEventListener('click',exportCsv);
      document.addEventListener('click',e=>{
        if(e.target.closest('#excelViewPrev')){page=Math.max(1,page-1);render();return;}
        if(e.target.closest('#excelViewNext')){page++;render();return;}
      });
      window.addEventListener('cdr:updated',()=>{refreshSelectors();if(document.querySelector('.tab.active')?.dataset.tab==='excelview')render();});
    }
    return {render,refreshSelectors,exportCsv,bind};
  };
})();