(async function () {
  'use strict';
  const {json,escape,link,syllabusURL,notificationHTML,formatDate} = window.ClearExams;
  const host = document.getElementById('content');
  try {
    const catalog = await json('data/exam-catalog.json');
    const id = new URLSearchParams(location.search).get('exam') || 'tnpsc-group-4';
    const exam = Object.values(catalog).flatMap(body=>body.items).find(item=>item.id===id);
    if (!exam) {
      document.getElementById('examTitle').textContent = 'Choose an examination';
      host.innerHTML = '<section class="panel"><h2>That examination was not found</h2><p>Use an exam category to choose a preparation page.</p>' + Object.entries(catalog).map(([key,body])=>link(body.name,'exam-posts.html?exam='+key)).join(' ') + '</section>';
      return;
    }
    const body = catalog[exam.category], group4 = id === 'tnpsc-group-4';
    document.title = exam.title + ' Preparation | ClearExams';
    document.getElementById('examTitle').textContent = exam.title;
    document.getElementById('examIntro').textContent = exam.description;
    document.getElementById('categoryName').textContent = body.name + ' · Preparation guide';
    const back = document.getElementById('backLink');back.href='exam-posts.html?exam='+exam.category;back.textContent='← All '+body.name+' examinations';
    const syllabus = group4 ? '<div id="group4Reader"></div>' : `<p>${exam.syllabus ? 'Read the syllabus for this examination, organised by stage and subject. The syllabus page identifies its official source and available PDF.' : 'The scheme depends on the specific post, trade or recruitment notice. Use the official website to select this examination and read its syllabus.'}</p><div class="actions">${link(exam.syllabus?'Read this exam’s syllabus':'Official syllabus / recruitment notice ↗',syllabusURL(exam),'button')}</div>`;
    host.innerHTML = `<nav class="jump-links" aria-label="On this page"><a href="#eligibility">Posts & qualifications</a><a href="#syllabus">Syllabus</a><a href="#notes">Study notes</a><a href="#practice">Daily quiz</a><a href="#papers">Previous papers</a><a href="#notifications">Notifications</a></nav>
      <section class="panel" id="eligibility"><h2>Posts and services</h2><ul>${exam.roles.map(role=>`<li>${escape(role)}</li>`).join('')}</ul><h3>Minimum educational qualification</h3><p>${escape(exam.qualification)}</p><p class="source">${escape(exam.qualificationNote)}</p>${exam.source?link(exam.source.label+' ↗',exam.source.url):link('Official post qualifications ↗',exam.official)}<div id="postQualifications"></div><h3>Selection process</h3><p>${escape(exam.selection.join(' · '))}</p>${group4?'<p class="muted">Forest posts include the notified physical standards and endurance requirements. The 2026 notice will determine that cycle’s vacancies and selection conditions.</p>':''}</section>
      <section class="panel" id="syllabus"><h2>${escape(exam.title)} syllabus</h2>${group4?'<div class="stats"><div class="stat"><strong>75</strong><span>General Studies questions</span></div><div class="stat"><strong>25</strong><span>Aptitude & Mental Ability</span></div><div class="stat"><strong>100</strong><span>Language questions</span></div></div><p class="muted">Single paper at SSLC standard · syllabus code 496. Part names below follow the syllabus document.</p>':''}${syllabus}</section>
      <section class="panel" id="notes"><h2>Study notes and revision</h2><p>Use these foundation resources alongside this exam’s syllabus. Work through the listed topics and record mistakes after each practice set.</p><div class="grid"><article class="resource"><h3>Arithmetic essentials</h3><p>Percentage = part ÷ whole × 100. Simple interest = principal × annual rate × years ÷ 100. For annual compounding, amount = principal × (1 + rate ÷ 100)<sup>years</sup>.</p><p>For time and work, convert each worker’s completion time into work per day before adding rates. Keep units consistent in area and volume problems.</p></article>${group4?'<article class="resource" lang="ta"><h3>தமிழ் இலக்கணம் — மீள்பார்வை</h3><p>குறில்: அ, இ, உ, எ, ஒ. நெடில்: ஆ, ஈ, ஊ, ஏ, ஐ, ஓ, ஔ. ல / ள / ழ, ர / ற, ந / ண / ன வேறுபாடுகளுக்குச் சொல் எடுத்துக்காட்டுகளை எழுதிப் பயிற்சி செய்யுங்கள்.</p><p>திருக்குறளின் பாடத்திட்டத்தில் உள்ள 20 அதிகாரங்களையும் தனிப் பட்டியலாக வைத்துப் படியுங்கள். ஒவ்வொரு தவறுக்கும் சரியான சொல் மற்றும் அதன் பொருளைக் குறித்துவையுங்கள்.</p></article>':'<article class="resource"><h3>Build a revision notebook</h3><p>Use one page per syllabus topic. Write key terms, formulas and a worked example. After practice, add the reason for each mistake and revisit those questions before starting the next topic.</p></article>'}<article class="resource"><h3>Indian Polity</h3><p>Topic notes and practice for constitutional concepts. Useful for the General Studies component where prescribed.</p>${link('Read Polity topics','tnpsc/indian_polity.html')}</article><article class="resource"><h3>NCERT textbooks</h3><p>Official textbooks for science, social science and mathematics. Select the class and subject that match the required exam standard.</p>${link('Open official textbooks ↗','https://ncert.nic.in/textbook.php')}</article></div><p class="muted">These are starting resources. Specialist, technical and banking papers also require their own subject material.</p></section>
      <section class="panel" id="practice"><h2>Daily quiz and topic practice</h2><p>Start with today’s 10-question Indian Polity set. Every option has an explanation. This is shared topic practice; it is not a full mock test for ${escape(exam.title)}.</p><div class="actions">${link('Start today’s Polity quiz','daily-quiz.html?topic=Indian%20Polity','button')}${link('Article-wise Polity practice','exam/indian_polity/all_articles.html')}${link('Prehistoric India practice','exam/history/prehistoric_india.html')}</div></section>
      <section class="panel" id="papers"><h2>Previous-year question papers</h2>${papers(exam)}</section>
      <section class="panel" id="notifications"><h2>Notifications and application dates</h2><div id="notificationList"><p role="status">Loading dated notices…</p></div><div class="actions">${link('All '+body.name+' notifications','exam-notifications.html?category='+exam.category)}${link('Official recruitment updates ↗',exam.official)}</div></section>`;
    const tasks = [loadNotifications(exam)];
    if (group4) {
      tasks.push(window.mountGroup4Syllabus(document.getElementById('group4Reader')));
      tasks.push(loadGroup4Posts());
    }
    await Promise.all(tasks);
    // Honour links directly to a resource after async content has established its position.
    const anchor = location.hash.slice(1);
    if (['eligibility','syllabus','notes','practice','papers','notifications'].includes(anchor)) document.getElementById(anchor).scrollIntoView();
  } catch (error) {
    host.innerHTML = '<section class="panel"><h2>Exam resources could not load</h2><p>Please reload the page or <a href="exam-posts.html?exam=tnpsc">choose an exam</a>. The <a href="syllabus.html">syllabus directory</a> is also available.</p></section>';
  }
  function papers(exam) {
    if (exam.id === 'tnpsc-group-4') return '<p>Official TNPSC papers from the examination held on 12 July 2025. The specimen booklets contain tentative ticks; use the final key to review answers.</p><div class="actions">' + link('2025 Tamil + General Studies paper ↗','https://www.tnpsc.gov.in/Tentative/Document/07_2025_GENEAL_TAMIL_GS.pdf') + link('2025 permitted English + GS paper ↗','https://www.tnpsc.gov.in/Tentative/Document/07_2025_GENEARAL_ENGLISH_GS.pdf') + link('2025 final answer key ↗','https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_2025_CCSE_IV_FINAL_ANSWER_KEY.pdf') + link('Other years: TNPSC archive ↗','https://www.tnpsc.gov.in/English/answerkeys.aspx') + '</div>';
    if (exam.category === 'tnpsc') return '<p>Select the exact group, stage and examination year in TNPSC’s question-paper archive.</p>' + link('TNPSC official question-paper archive ↗','https://www.tnpsc.gov.in/English/answerkeys.aspx');
    if (exam.category === 'upsc') return '<p>Select Civil Services Preliminary or Civil Services Main for the required year. These services use the Civil Services Examination papers.</p>' + link('UPSC official previous question papers ↗','https://upsc.gov.in/examinations/previous-question-papers');
    if (exam.category === 'tnusrb') return '<p>Choose the recruitment and year. Police Constable papers and SI papers have different requirements.</p>' + link('TNUSRB paper collection','tnusrb/previous_year_questions.html') + ' ' + link('TNUSRB official notices ↗',exam.official);
    return '<p>No downloaded past-paper set is currently listed here for this examination. Check the official recruitment website for released question papers, response sheets, answer keys or information handouts. Some are available only during a limited access window.</p>' + link('Official papers / answer-key notices ↗',exam.official);
  }
  async function loadGroup4Posts() {
    const area = document.getElementById('postQualifications');
    try {
      const data = await json('data/group4-posts.json');
      area.innerHTML = `<h3>Post-wise qualifications · 2025 reference</h3><p class="source">${escape(data.reference)}</p><div class="table-scroll"><table class="post-table"><caption class="muted">Educational and technical requirements by post code</caption><thead><tr><th scope="col">Post / service</th><th scope="col">Minimum qualification and conditions</th></tr></thead><tbody>${data.rows.map(([name,codes,qualification,page])=>`<tr><td>${escape(name)}<small>Post codes: ${escape(codes)}</small></td><td>${escape(qualification)}<small><a href="${escape(data.source)}#page=${page}" target="_blank" rel="noopener noreferrer">Official notice · page ${page} ↗</a></small></td></tr>`).join('')}</tbody></table></div><p class="notice">${escape(data.note)}</p>`;
    } catch (error) { area.innerHTML = '<p role="alert">The post-wise table could not load. Use the official qualification notice linked above.</p>'; }
  }
  async function loadNotifications(exam) {
    const area = document.getElementById('notificationList');
    try {
      const data = await json('data/exam-notifications.json');
      const entries = data.entries.filter(item=>item.exams.includes(exam.id));
      area.innerHTML = `<p class="source">Dates checked on ${formatDate(data.checkedOn)}. Notices are updated manually; official amendments take priority.</p>` + (entries.length ? entries.map(notificationHTML).join('') : '<p>No dated notice has been added to this page for this examination. Open the official recruitment updates below to check current application dates.</p>');
    } catch (error) { area.innerHTML = '<p role="alert">Dates could not load. Use the official recruitment updates below.</p>'; }
  }
})();
