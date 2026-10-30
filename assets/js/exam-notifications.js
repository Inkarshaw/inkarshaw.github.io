(async function () {
  'use strict';
  const {json,escape,link,formatDate,notificationHTML,notificationPlaceholderHTML} = window.ClearExams;
  const area = document.getElementById('notices');
  try {
    const [catalog,data] = await Promise.all([json('data/exams/exam-catalog.json'),json('data/exams/exam-notifications.json')]);
    const status = document.getElementById('checkedOn');
    status.textContent = 'Loading board-by-board review dates. Always verify official amendments.';
    try {
      const policy = await json('data/exams/review-schedule.json');
      const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      const ageDays = stamp => /^\d{4}-\d{2}-\d{2}$/.test(stamp||'') ? Math.floor((Date.parse(today+'T00:00:00Z')-Date.parse(stamp+'T00:00:00Z'))/86400000) : Infinity;
      const reviews = Object.entries(policy.boards||{});
      const overview = reviews.map(([key,board]) => board.name+': '+(board.lastReviewed ? formatDate(board.lastReviewed) : 'not verified'));
      const due = reviews.filter(([key,board]) => ageDays(board.lastReviewed)>Number(policy.cadenceDays?.[key]||7)).map(([,board])=>board.name);
      status.textContent = 'Recorded source review dates — '+overview.join(' · ')+'. '+(due.length?'REVIEW OVERDUE: '+due.join(', ')+'. ':'')+'These dates are not proof that all notices are current. Always confirm official amendments.';
    } catch {
      status.textContent = 'Board review records unavailable. Check the individual notice sources and verification dates before applying.';
    }
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
