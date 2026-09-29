(() => {
  'use strict';
  window.CDRRouterFactory = function(ctx){
    const {
      $,applyFilters,renderDashboard,renderRecords,renderExcelView,renderContacts,renderLocations,renderDevices,
      renderSmsIntelligence,renderIncident,renderDaySummary,renderPatterns,renderDataQuality,
      renderMovement,invalidateMovementMap,renderLeads,renderNetwork,renderCompare,
      renderChronology,renderFlags
    }=ctx;

    function renderView(id){
      if(id==='dashboard'){renderDashboard();renderLeads();}
      else if(id==='records')renderRecords();
      else if(id==='excelview')renderExcelView();
      else if(id==='contacts')renderContacts();
      else if(id==='locations')renderLocations();
      else if(id==='devices')renderDevices();
      else if(id==='smsintel')renderSmsIntelligence();
      else if(id==='incident')renderIncident();
      else if(id==='patterns'){renderDaySummary();renderPatterns();}
      else if(id==='quality')renderDataQuality();
      else if(id==='movement'){requestAnimationFrame(()=>renderMovement());setTimeout(()=>invalidateMovementMap?.(),300);}
      else if(id==='network')requestAnimationFrame(renderNetwork);
      else if(id==='compare')renderCompare();
      else if(id==='relationship')window.CDRRelationship?.render?.();
      else if(id==='casereview'){renderChronology();renderFlags();}
    }

    function renderAll(){
      const active=document.querySelector('.tab.active')?.dataset.tab||'dashboard';
      renderView(active);
    }

    function switchTab(id){
      document.querySelectorAll('.view').forEach(v=>{
        v.setAttribute('role','tabpanel');
        v.classList.toggle('hidden',v.id!==id);
      });
      document.querySelectorAll('.tab').forEach(t=>{
        const active=t.dataset.tab===id;
        t.classList.toggle('active',active);
        t.setAttribute('aria-selected',String(active));
      });
      renderView(id);
    }

    function contactFilter(num){
      $('bparty').value=num;
      applyFilters();
      switchTab('records');
    }

    return {renderAll,switchTab,contactFilter,renderView};
  };
})();
