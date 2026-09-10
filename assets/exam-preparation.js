(async function () {
  'use strict';
  const {json,escape,link,syllabusURL,notificationHTML,formatDate} = window.ClearExams;
  const host = document.getElementById('content');

  try {
    const catalog = await json('data/exam-catalog.json');
    const id = new URLSearchParams(location.search).get('exam') || 'tnpsc-group-4';
    const exam = Object.values(catalog).flatMap(body => body.items).find(item => item.id === id);

    if (!exam) {
      document.getElementById('examTitle').textContent = 'Choose an examination';
      host.innerHTML = '<section class="panel"><h2>That examination was not found</h2><p>Choose an exam category to continue.</p>' + Object.entries(catalog).map(([key,body]) => link(body.name,'exam-posts.html?exam='+key)).join(' ') + '</section>';
      return;
    }

    const body = catalog[exam.category];
    const group4 = id === 'tnpsc-group-4';
    document.title = exam.title + ' Preparation | ClearExams';
    document.getElementById('examTitle').textContent = exam.title;
    document.getElementById('examIntro').textContent = 'Follow the preparation path from syllabus to practice, previous papers and mock-test readiness.';
    document.getElementById('categoryName').textContent = body.name + ' · Preparation path';
    const back = document.getElementById('backLink');
    back.href = 'exam-posts.html?exam=' + exam.category;
    back.textContent = '← All ' + body.name + ' examinations';

    const syllabusBlock = group4
      ? '<div id="group4Reader"></div>'
      : `<p>${exam.syllabus ? 'Read the syllabus for this examination, organised by stage and subject.' : 'The exact syllabus depends on the current recruitment notice. Use the official source below.'}</p><div class="actions">${link(exam.syllabus ? 'Read this exam’s syllabus' : 'Official syllabus / notice ↗', syllabusURL(exam), 'button')}</div>`;

    const mockBlock = group4
      ? `<p>The TNPSC Group IV mock series is now available. Mock Test 1 includes 25 questions, a 30-minute timer, question palette, mark-for-review, detailed results and explanations. Your best score is saved on this device.</p><div class="actions">${link('Open TNPSC Group IV Mock Series','tnpsc-group4-mocks.html','button')}${link('Start Mock Test 1','tnpsc-group4-mock-1.html')}</div><p class="source">Mock Test 1 is a shorter ClearExams practice mock. Additional practice mocks and a full-length simulation are planned.</p>`
      : `<p>A dedicated full-length ${escape(exam.title)} mock-test series is not yet published on ClearExams. Until it is added, use this sequence:</p><ol><li>Finish one full syllabus revision.</li><li>Complete topic quizzes without notes.</li><li>Solve an official previous-year paper under the real time limit.</li><li>Record score, weak topics and time lost.</li><li>Revise only the weak areas and repeat another paper.</li></ol><div class="actions">${link('Practise Daily Quiz','daily-quiz.html','button')}${link('Go to PYQs','#papers')}</div><p class="source">Dedicated exam-wise mock tests are coming soon.</p>`;

    host.innerHTML = `
      <section class="panel" aria-labelledby="path-title"><p class="eyebrow">Your study roadmap</p><h2 id="path-title">6-step preparation path</h2><div class="grid">
        ${pathCard('1','Syllabus','Know exactly what to study.','#syllabus')}
        ${pathCard('2','Study materials','Build concepts topic by topic.','#notes')}
        ${pathCard('3','Topic quiz','Practise and learn from explanations.','#practice')}
        ${pathCard('4','PYQs','Understand the real exam pattern.','#papers')}
        ${pathCard('5','Mock tests',group4 ? 'Open the mock series and track your best score.' : 'Test speed and accuracy.','#mocks')}
        ${pathCard('6','Notification','Track the next application cycle.','#notifications')}
      </div></section>

      <nav class="jump-links" aria-label="On this page"><a href="#eligibility">Eligibility</a><a href="#syllabus">Syllabus</a><a href="#notes">Study materials</a><a href="#practice">Topic quiz</a><a href="#papers">PYQs</a><a href="#mocks">Mock tests</a><a href="#notifications">Notifications</a></nav>

      <section class="panel" id="eligibility"><p class="eyebrow">Before you start</p><h2>Eligibility & selection</h2><h3>Posts and services</h3><ul>${exam.roles.map(role=>`<li>${escape(role)}</li>`).join('')}</ul><h3>Minimum educational qualification</h3><p>${escape(exam.qualification)}</p><p class="source">${escape(exam.qualificationNote)}</p>${exam.source ? link(exam.source.label+' ↗',exam.source.url) : link('Official post qualifications ↗',exam.official)}<div id="postQualifications"></div><h3>Selection process</h3><p>${escape(exam.selection.join(' · '))}</p></section>

      <section class="panel" id="syllabus"><p class="eyebrow">Step 1</p><h2>${escape(exam.title)} syllabus</h2>${group4 ? '<div class="stats"><div class="stat"><strong>75</strong><span>General Studies</span></div><div class="stat"><strong>25</strong><span>Aptitude</span></div><div class="stat"><strong>100</strong><span>Language</span></div></div><p class="muted">Single paper at SSLC standard · syllabus code 496.</p>' : ''}${syllabusBlock}</section>

      <section class="panel" id="notes"><p class="eyebrow">Step 2</p><h2>Study materials & revision</h2><p>Study the syllabus topic by topic. Keep one revision page for every topic and add mistakes from practice sessions.</p><div class="grid"><article class="resource"><h3>Indian Polity</h3><p>Constitution, institutions, rights, governance and article-wise revision.</p>${link('Open Polity study material','tnpsc/indian_polity.html')}</article><article class="resource"><h3>Current Affairs</h3><p>Daily exam-ready PDF revision material.</p>${link('Open Current Affairs','current-affairs/')}</article><article class="resource"><h3>NCERT foundation</h3><p>Use official school textbooks for science, social science and mathematics fundamentals.</p>${link('Official NCERT textbooks ↗','https://ncert.nic.in/textbook.php')}</article><article class="resource"><h3>Revision method</h3><p>Write definitions, formulas, dates and one worked example per syllabus topic. Revisit errors before starting the next set.</p></article></div></section>

      <section class="panel" id="practice"><p class="eyebrow">Step 3</p><h2>Topic quiz</h2><p>Use short topic-wise quizzes for active recall. Every answer should teach you why the correct option is right and the other options are wrong.</p><div class="actions">${link('Start Daily 10-question Quiz','daily-quiz.html','button')}${link('Article-wise Polity Practice','exam/indian_polity/all_articles.html')}${link('Prehistoric India Practice','exam/history/prehistoric_india.html')}</div></section>

      <section class="panel" id="papers"><p class="eyebrow">Step 4</p><h2>Previous-year questions (PYQs)</h2>${papers(exam)}</section>

      <section class="panel" id="mocks"><p class="eyebrow">Step 5</p><h2>${group4 ? 'TNPSC Group IV mock tests' : 'Mock-test readiness'}</h2>${mockBlock}</section>

      <section class="panel" id="notifications"><p class="eyebrow">Step 6</p><h2>Notifications & application dates</h2><div id="notificationList"><p role="status">Loading dated notices…</p></div><div class="actions">${link('All '+body.name+' notifications','exam-notifications.html?category='+exam.category)}${link('Official recruitment updates ↗',exam.official)}</div></section>`;

    const tasks = [loadNotifications(exam)];
    if (group4) {
      tasks.push(window.mountGroup4Syllabus(document.getElementById('group4Reader')));
      tasks.push(loadGroup4Posts());
    }
    await Promise.all(tasks);

    const anchor = location.hash.slice(1);
    if (['eligibility','syllabus','notes','practice','papers','mocks','notifications'].includes(anchor)) document.getElementById(anchor).scrollIntoView();
  } catch (error) {
    host.innerHTML = '<section class="panel"><h2>Exam resources could not load</h2><p>Please reload or <a href="exam-posts.html">choose an exam</a>. The <a href="syllabus.html">syllabus directory</a> is also available.</p></section>';
  }

  function pathCard(number,title,text,href) {return `<article class="resource"><span class="status-tag open">Step ${number}</span><h3>${escape(title)}</h3><p>${escape(text)}</p><div class="actions"><a class="button secondary" href="${href}">Open step</a></div></article>`;}

  function papers(exam) {
    if (exam.id === 'tnpsc-group-4') return '<p>Use official TNPSC papers and final answer keys to learn the real question style.</p><div class="actions">' + link('2025 Tamil + General Studies paper ↗','https://www.tnpsc.gov.in/Tentative/Document/07_2025_GENEAL_TAMIL_GS.pdf') + link('2025 permitted English + GS paper ↗','https://www.tnpsc.gov.in/Tentative/Document/07_2025_GENEARAL_ENGLISH_GS.pdf') + link('2025 final answer key ↗','https://www.tnpsc.gov.in/Document/Answerkeyfinalresult/07_2025_CCSE_IV_FINAL_ANSWER_KEY.pdf') + link('TNPSC archive ↗','https://www.tnpsc.gov.in/English/answerkeys.aspx') + '</div>';
    if (exam.category === 'tnpsc') return '<p>Select the exact group, stage and year in TNPSC’s official question-paper archive.</p>' + link('TNPSC question-paper archive ↗','https://www.tnpsc.gov.in/English/answerkeys.aspx');
    if (exam.category === 'upsc') return '<p>Select the relevant examination and year from UPSC’s official previous-question-paper collection.</p>' + link('UPSC previous question papers ↗','https://upsc.gov.in/examinations/previous-question-papers');
    if (exam.category === 'tnusrb') return '<p>Choose the recruitment and year. Police Constable and SI papers have different patterns.</p>' + link('TNUSRB PYQ collection','tnusrb/previous_year_questions.html') + ' ' + link('TNUSRB official notices ↗',exam.official);
    return '<p>No downloaded past-paper collection is listed here yet. Check the recruiting body for question papers, answer keys, response sheets or information handouts.</p>' + link('Official papers / answer-key notices ↗',exam.official);
  }

  async function loadGroup4Posts() {
    const area = document.getElementById('postQualifications');
    try {const data = await json('data/group4-posts.json');area.innerHTML = `<h3>Post-wise qualifications · reference</h3><p class="source">${escape(data.reference)}</p><div class="table-scroll"><table class="post-table"><thead><tr><th>Post / service</th><th>Minimum qualification</th></tr></thead><tbody>${data.rows.map(([name,codes,qualification,page])=>`<tr><td>${escape(name)}<small>Post codes: ${escape(codes)}</small></td><td>${escape(qualification)}<small><a href="${escape(data.source)}#page=${page}" target="_blank" rel="noopener noreferrer">Official notice · page ${page} ↗</a></small></td></tr>`).join('')}</tbody></table></div><p class="notice">${escape(data.note)}</p>`;} catch (error) {area.innerHTML = '<p role="alert">The post-wise table could not load. Use the official qualification notice above.</p>';}
  }

  async function loadNotifications(exam) {
    const area = document.getElementById('notificationList');
    try {const data = await json('data/exam-notifications.json');const entries = data.entries.filter(item => item.exams.includes(exam.id));area.innerHTML = `<p class="source">Dates checked on ${formatDate(data.checkedOn)}. Official amendments take priority.</p>` + (entries.length ? entries.map(notificationHTML).join('') : '<p>No dated notice has been added for this examination. Use the official recruitment link below.</p>');} catch (error) {area.innerHTML = '<p role="alert">Dates could not load. Use the official recruitment updates below.</p>';}
  }
})();