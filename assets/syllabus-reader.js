(function () {
  'use strict';
  window.mountGroup4Syllabus = async function (host) {
    const {json,escape} = window.ClearExams;
    host.innerHTML = '<p role="status">Loading the complete Group IV syllabus…</p>';
    try {
      const [en,ta] = await Promise.all([json('data/group4-english.json'),json('data/group4-tamil.json')]);
      host.classList.add('syllabus-reader');
      host.innerHTML = `<p class="source">Full syllabus · TNPSC code 496 · dated 12 December 2024. Read against the original bilingual PDF.</p><div class="reader-note">Reading language changes the General Studies and Aptitude text. Tamil is the eligibility-cum-scoring subject; General English is included for the differently abled candidates permitted by the notification. This selector does not change exam eligibility.</div><div class="reader-toolbar"><label>Reading language / படிக்கும் மொழி<select data-language><option value="en">English</option><option value="ta">தமிழ்</option></select></label><label class="search-label">Search the full syllabus<input type="search" data-search placeholder="Try polity, percentage, திருக்குறள்" autocomplete="off"></label></div><div class="reader-controls"><button class="button secondary" type="button" data-expand>Expand all units</button><button class="button secondary" type="button" data-collapse>Collapse all units</button><a class="button" href="syllabus-pdfs/tnpsc-group-4-official-syllabus.pdf" download>Download official PDF</a></div><p class="reader-results" role="status" aria-live="polite"></p><div data-parts></div>`;
      const language = host.querySelector('[data-language]'), search = host.querySelector('[data-search]'), content = host.querySelector('[data-parts]'), results = host.querySelector('.reader-results');
      let expandAll = false;
      function render() {
        const tamil = language.value === 'ta', data = tamil ? ta : en, term = search.value.trim().toLocaleLowerCase();
        const parts = [
          {title: tamil ? 'பகுதி அ: பொது அறிவு · 75 கேள்விகள்' : 'Part A: General Studies · 75 questions',lang:tamil?'ta':'en',units:data.general},
          {title: tamil ? 'பகுதி ஆ: திறனறிவும் மனக்கணக்கு நுண்ணறிவும் · 25 கேள்விகள்' : 'Part B: Aptitude and Mental Ability · 25 questions',lang:tamil?'ta':'en',units:data.aptitude},
          {title:'பகுதி இ: தமிழ் தகுதி மற்றும் மதிப்பீட்டுத் தேர்வு · 100 கேள்விகள்',lang:'ta',units:ta.tamil},
          {title:'Part C alternative: General English · 100 questions · for permitted differently abled candidates',lang:'en',units:en.english}
        ];
        let count = 0;
        content.innerHTML = parts.map(part => {
          const units = part.units.filter(unit => !term || unit.join(' ').toLocaleLowerCase().includes(term));
          if (!units.length) return '';
          count += units.length;
          return `<section class="reader-part" lang="${part.lang}"><h3>${escape(part.title)}</h3>${units.map((unit,index) => `<details class="reader-unit" ${term || expandAll || index === 0 ? 'open' : ''}><summary>${escape(unit[0])}</summary><div class="unit-text">${unit.slice(1).map(p=>`<p>${escape(p)}</p>`).join('')}</div></details>`).join('')}</section>`;
        }).join('');
        results.textContent = count ? `${count} of 22 units shown. Both language-paper syllabi are included; candidates take only the permitted paper.` : 'No matching units. Try another word or clear the search.';
      }
      language.addEventListener('change', render);
      search.addEventListener('input', render);
      host.querySelector('[data-expand]').addEventListener('click', () => {expandAll = true; content.querySelectorAll('details').forEach(d=>d.open=true);});
      host.querySelector('[data-collapse]').addEventListener('click', () => {expandAll = false; content.querySelectorAll('details').forEach(d=>d.open=false);});
      render();
    } catch (error) {
      host.innerHTML = '<p role="alert">The syllabus text could not load. <a href="syllabus-pdfs/tnpsc-group-4-official-syllabus.pdf">Open the complete official PDF</a> or <button type="button" class="button secondary" data-retry>Retry loading text</button>.</p>';
      host.querySelector('[data-retry]').addEventListener('click', () => window.mountGroup4Syllabus(host));
    }
  };
})();
