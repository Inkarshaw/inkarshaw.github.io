(async function () {
  'use strict';
  const {json,escape,link,prepURL,syllabusURL}=window.ClearExams;
  const posts=document.getElementById('posts');
  try {
    const bodies=await json('data/exam-catalog.json');
    const requested=new URLSearchParams(location.search).get('exam');
    const selected=Object.hasOwn(bodies,requested)?requested:'upsc',body=bodies[selected];
    document.getElementById('tabs').innerHTML=Object.entries(bodies).map(([key,item])=>`<a class="tab${key===selected?' active':''}" ${key===selected?'aria-current="page"':''} href="exam-posts.html?exam=${key}">${escape(item.name)}</a>`).join('');
    document.title=`${body.name} Posts & Details | ClearExams`;
    document.getElementById('bodyName').textContent=body.name;document.getElementById('pageTitle').textContent=body.title;document.getElementById('intro').textContent=body.intro;
    document.getElementById('syllabusLink').href='syllabus.html';document.getElementById('officialLink').href=body.notices;
    document.getElementById('summary').innerHTML=`<div class="summary-card"><strong>${body.items.length}</strong><span>${selected==='upsc'?'Services / service groups':'Recruitment routes'}</span></div><div class="summary-card"><strong>Per exam</strong><span>Posts and qualifications</span></div><div class="summary-card"><strong>Prepare</strong><span>Syllabus, notes, quiz and papers</span></div>`;
    posts.innerHTML=body.items.map((exam,index)=>`<details class="post" id="${exam.id}" ${index===0?'open':''}><summary><div class="post-head"><div><h2>${escape(exam.title)}</h2><p class="short">${escape(exam.description)}</p></div><span class="arrow" aria-hidden="true">+</span></div></summary><div class="post-body"><h3>Posts and services</h3><ul>${exam.roles.map(item=>`<li>${escape(item)}</li>`).join('')}</ul><h3>Minimum educational qualification</h3><p>${escape(exam.qualification)}</p><h3>Selection process</h3><p>${escape(exam.selection.join(' · '))}</p><p class="qualification-source">${escape(exam.qualificationNote)}</p>${exam.source?`<p><a href="${escape(exam.source.url)}" target="_blank" rel="noopener noreferrer">${escape(exam.source.label)} ↗</a></p>`:''}<div class="actions">${link('Open preparation page',prepURL(exam),'button')}${link(exam.syllabus?'Syllabus':'Official syllabus ↗',syllabusURL(exam))}${link('Study notes',prepURL(exam)+'#notes')}${link('Daily quiz','daily-quiz.html?topic=Indian%20Polity')}${link('Previous papers',prepURL(exam)+'#papers')}</div></div></details>`).join('');
    const anchored=body.items.find(exam=>exam.id===location.hash.slice(1));
    if(anchored){const card=document.getElementById(anchored.id);card.open=true;card.scrollIntoView();}
  } catch (error) {posts.innerHTML='<div class="empty" role="alert">Exam details could not load. Please reload this page. You can also <a href="syllabus.html">open the syllabus directory</a>.</div>';}
})();
