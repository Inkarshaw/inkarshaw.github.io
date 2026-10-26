(async function () {
  'use strict';
  const {json,escape,link,formatDate,notificationHTML,notificationPlaceholderHTML} = window.ClearExams;
  const area = document.getElementById('notices');
  try {
    const [catalog,data] = await Promise.all([json('data/exams/exam-catalog.json'),json('data/exams/exam-notifications.json')]);
    document.getElementById('checkedOn').textContent = 'TNPSC official records updated ' + formatDate(data.tnpscUpdatedOn || data.checkedOn) + '. Other exam boards last manually reviewed ' + formatDate(data.checkedOn) + '. Reviews are not automatic confirmations of deadlines; always check official notices.';
    try{const policy=await json('data/exams/review-schedule.json');const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());const asDate=s=>Date.parse(s+'T00:00:00Z'),due=Object.entries(policy.boards||{}).filter(([key,v])=>Number.isFinite(asDate(v.lastReviewed))&&Math.floor((Date.parse(today+'T00:00:00Z')-asDate(v.lastReviewed))/86400000)>Number(policy.cadenceDays?.[key]||7)).map(([,v])=>v.name);if(due.length)document.getElementById('checkedOn').textContent+=' REVIEW OVERDUE: '+due.join(', ')+'.';}catch{document.getElementById('checkedOn').textContent+=' Review schedule unavailable.';}
    const filter = document.getElementById('categoryFilter');
    Object.entries(catalog).forEach(([key,body])=> {const option=document.createElement('option');option.value=key;option.textContent=body.name;filter.appendChild(option);});
    const initial = new URLSearchParams(location.search).get('category');
    const savedTarget = localStorage.getItem('clearexamsTargetExamV1') || '';
    if (initial && catalog[initial]) filter.value = initial;
    else if (catalog[savedTarget]) filter.value = savedTarget;
    function render() {
      const selected = filter.value;
      const entries = data.entries.filter(item=>selected==='all'||item.category===selected);
      const sources = Object.entries(catalog).filter(([key])=>selected==='all'||key===selected);
      const placeholders = sources.filter(([key])=>!entries.some(item=>item.category===key));
      area.innerHTML = entries.map(notificationHTML).join('') + placeholders.map(([,body])=>notificationPlaceholderHTML(body.name)).join('');
      document.getElementById('officialSources').innerHTML = sources.map(([key,body])=>`<article class="resource"><h3>${escape(body.name)}</h3><div class="actions">${link('Official notifications ↗',body.notices)}${key==='banking'?link('SBI Careers ↗','https://sbi.co.in/web/careers/current-openings')+link('RBI Opportunities ↗','https://opportunities.rbi.org.in/Scripts/Vacancies.aspx'):''}${link('Explore exams','exam-posts.html?exam='+key)}</div></article>`).join('');
    }
    filter.addEventListener('change',()=> {const url=new URL(location.href);url.searchParams.set('category',filter.value);history.replaceState(null,'',url);render();});
    render();
  } catch (error) {area.innerHTML='<p role="alert">Notifications could not load. Please reload, or check <a href="https://tnpsc.gov.in/web/examdashboard/index.aspx">TNPSC</a> and <a href="https://ssc.gov.in/">SSC</a> directly.</p>';}
})();
