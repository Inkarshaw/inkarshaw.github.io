/* My Cases Case History UI v1 */
(function(global){
  function renderCaseHistory(caseId,container){
    const box=document.querySelector(container);
    if(!box||!global.MyCasesAudit)return;
    const items=global.MyCasesAudit.getCaseHistory(caseId)||[];
    if(!items.length){
      box.innerHTML='<div class="helper">No change history recorded yet.</div>';
      return;
    }
    box.innerHTML=items.slice().reverse().map(h=>`
      <div class="timeline-item">
        <strong>${h.field||h.action||'Update'}</strong>
        <div class="timeline-meta">${new Date(h.createdAt).toLocaleString()}</div>
        <div class="timeline-text">${h.oldValue||''} → ${h.newValue||''}</div>
      </div>`).join('');
  }
  global.MyCasesHistory={renderCaseHistory};
})(window);
