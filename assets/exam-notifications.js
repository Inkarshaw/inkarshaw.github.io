(async function () {
  'use strict';
  const {json,escape,link,formatDate,notificationHTML} = window.ClearExams;
  const area = document.getElementById('notices');
  try {
    const [catalog,data] = await Promise.all([json('data/exam-catalog.json'),json('data/exam-notifications.json')]);
    document.getElementById('checkedOn').textContent = 'Checked on ' + formatDate(data.checkedOn) + '. Manually maintained reference; this is not a live vacancy feed. Planned and archived entries are labelled separately.';
    const filter = document.getElementById('categoryFilter');
    Object.entries(catalog).forEach(([key,body])=> {const option=document.createElement('option');option.value=key;option.textContent=body.name;filter.appendChild(option);});
    const initial = new URLSearchParams(location.search).get('category');
    if (initial && catalog[initial]) filter.value = initial;
    function render() {
      const selected = filter.value;
      const entries = data.entries.filter(item=>selected==='all'||item.category===selected);
      area.innerHTML = entries.length ? entries.map(notificationHTML).join('') : '<p>No dated notices have been added for this category. Check its official recruitment websites below.</p>';
      const sources = Object.entries(catalog).filter(([key])=>selected==='all'||key===selected);
      document.getElementById('officialSources').innerHTML = sources.map(([key,body])=>`<article class="resource"><h3>${escape(body.name)}</h3><div class="actions">${link('Official notifications ↗',body.notices)}${key==='banking'?link('SBI Careers ↗','https://sbi.co.in/web/careers/current-openings')+link('RBI Opportunities ↗','https://opportunities.rbi.org.in/Scripts/Vacancies.aspx'):''}${link('Explore exams','exam-posts.html?exam='+key)}</div></article>`).join('');
    }
    filter.addEventListener('change',()=> {const url=new URL(location.href);url.searchParams.set('category',filter.value);history.replaceState(null,'',url);render();});
    render();
  } catch (error) {area.innerHTML='<p role="alert">Notifications could not load. Please reload, or check <a href="https://tnpsc.gov.in/web/examdashboard/index.aspx">TNPSC</a> and <a href="https://ssc.gov.in/">SSC</a> directly.</p>';}
})();
