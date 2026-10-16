(function () {
  'use strict';
  window.mountGroup4Syllabus = async function (host) {
    const {json,escape} = window.ClearExams;
    host.innerHTML = '<p role="status">Loading the complete Group IV syllabus…</p>';
    try {
      const [en,ta] = await Promise.all([json('data/quizzes/group4-english.json'),json('data/quizzes/group4-tamil.json')]);
      host.classList.add('syllabus-reader');
      host.innerHTML = `<p class="source">Full syllabus · TNPSC code 496 · dated 12 December 2024. Read against the original bilingual PDF.</p><div class="reader-note">Reading language changes the General Studies and Aptitude text. Tamil is the eligibility-cum-scoring subject; General English is included for the differently abled candidates permitted by the notification. This selector does not change exam eligibility.</div><div class="reader-toolbar"><label>Reading language / படிக்கும் மொழி<select data-language><option value="en">English</option><option value="ta">தமிழ்</option></select></label><label class="search-label">Search the full syllabus<input type="search" data-search placeholder="Try polity, percentage, திருக்குறள்" autocomplete="off"></label></div><div class="reader-controls"><button class="button secondary" type="button" data-expand>Expand all units</button><button class="button secondary" type="button" data-collapse>Collapse all units</button><a class="button" href="resources/syllabus/pdfs/tnpsc-group-4-official-syllabus.pdf" download>Download official PDF</a></div><p class="reader-results" role="status" aria-live="polite"></p><div data-parts></div>`;
      const language = host.querySelector('[data-language]'), search = host.querySelector('[data-search]'), content = host.querySelector('[data-parts]'), results = host.querySelector('.reader-results');
      // Curated syllabus topic -> published textbook chapter -> quiz links; only verified chapter routes are listed.
      const generalStudyLinks=[[{"topic_en":"Measurement of physical quantities","topic_ta":"இயற்பியல் அளவீடுகள்","chapter_en":"Class 6 Science · Term I · Measurements","chapter_ta":"6ஆம் வகுப்பு அறிவியல் · முதல் பருவம் · அளவீடுகள்","href":"textbook-play.html?class=6&subject=science&term=1&unit=1&quiz=1"},{"topic_en":"Force and motion","topic_ta":"விசையும் இயக்கமும்","chapter_en":"Class 6 Science · Term I · Force and Motion","chapter_ta":"6ஆம் வகுப்பு அறிவியல் · முதல் பருவம் · விசையும் இயக்கமும்","href":"textbook-play.html?class=6&subject=science&term=1&unit=2&quiz=1"},{"topic_en":"Electricity","topic_ta":"மின்னியல்","chapter_en":"Class 6 Science · Term II · Electricity","chapter_ta":"6ஆம் வகுப்பு அறிவியல் · இரண்டாம் பருவம் · மின்னியல்","href":"textbook-play.html?class=6&subject=science&term=2&unit=2&quiz=1"}],[{"topic_en":"Earth's physical features","topic_ta":"புவியின் இயற்கை அமைவுகள்","chapter_en":"Class 7 Social Science · Term I · Interior of the Earth","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · புவியின் உள்ளமைப்பு","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=5&quiz=1"},{"topic_en":"Landforms","topic_ta":"நிலத்தோற்றங்கள்","chapter_en":"Class 7 Social Science · Term I · Landforms","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · நிலத்தோற்றங்கள்","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=6&quiz=1"}],[{"topic_en":"Indus Valley Civilisation","topic_ta":"சிந்துவெளி நாகரிகம்","chapter_en":"Class 6 Social Science · Term I · Indus Civilisation","chapter_ta":"6ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · சிந்துவெளி நாகரிகம்","href":"textbook-play.html?class=6&subject=social-science&term=1&unit=3&quiz=1"},{"topic_en":"Delhi Sultanate","topic_ta":"தில்லி சுல்தானியம்","chapter_en":"Class 7 Social Science · Term I · The Delhi Sultanate","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · தில்லி சுல்தானியம்","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=4&quiz=1"}],[{"topic_en":"Political parties","topic_ta":"அரசியல் கட்சிகள்","chapter_en":"Class 7 Social Science · Term I · Political Parties","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · அரசியல் கட்சிகள்","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=9&quiz=1"},{"topic_en":"Equality and rights","topic_ta":"சமத்துவம் மற்றும் உரிமைகள்","chapter_en":"Class 7 Social Science · Term I · Equality","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · சமத்துவம்","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=8&quiz=1"}],[{"topic_en":"Production and economic activity","topic_ta":"உற்பத்தியும் பொருளாதார நடவடிக்கையும்","chapter_en":"Class 7 Social Science · Term I · Production","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · உற்பத்தி","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=10&quiz=1"}],[{"topic_en":"South Indian history: Later Cholas and Pandyas","topic_ta":"தென்னிந்திய வரலாறு: பிற்காலச் சோழர்கள், பாண்டியர்கள்","chapter_en":"Class 7 Social Science · Term I · Later Cholas and Pandyas","chapter_ta":"7ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · பிற்காலச் சோழர்கள், பாண்டியர்கள்","href":"textbook-play.html?class=7&subject=social-science&term=1&unit=3&quiz=1"},{"topic_en":"Ancient Tamil towns","topic_ta":"பண்டைய தமிழக நகரங்கள்","chapter_en":"Class 6 Social Science · Term I · Ancient Cities of Tamilagam","chapter_ta":"6ஆம் வகுப்பு சமூக அறிவியல் · முதல் பருவம் · பண்டைய தமிழக நகரங்கள்","href":"textbook-play.html?class=6&subject=social-science&term=1&unit=4&quiz=1"}]];
      function mappedChapters(part,originalIndex,tamil){
        if(part.key!=='general')return '';
        const entries=generalStudyLinks[originalIndex]||[];
        return entries.length?'<div class="mapped-chapters"><strong>'+(tamil?'இந்தப் பாடத்திட்டத் தலைப்புகளுக்கான பாடநூல் பயிற்சி':'Textbook practice for these syllabus topics')+'</strong><ul>'+
          entries.map(e=>'<li><span>'+escape(tamil?e.topic_ta:e.topic_en)+'</span> → <a href="'+escape(e.href)+'">'+escape(tamil?e.chapter_ta:e.chapter_en)+'</a></li>').join('')+
          '</ul><small>'+(tamil?'தேர்ந்தெடுத்த தொடர்புகள் மட்டுமே; முழுப் பாடத்திட்டத்திற்கான இணைப்புகள் அல்ல.':'Selected verified chapter matches, not complete syllabus coverage.')+'</small></div>':'';
      }
      if(!document.getElementById('group4-chapter-mapping-css')){
        const style=document.createElement('style');style.id='group4-chapter-mapping-css';
        style.textContent='.mapped-chapters{margin:14px 0;padding:13px 16px;border:1px solid #cdddf0;border-radius:12px;background:#f0f6ff}.mapped-chapters ul{margin:8px 0;padding-left:20px}.mapped-chapters li{margin:6px 0}.mapped-chapters a{font-weight:800;color:#1559ca}.mapped-chapters small{color:#52677f}';
        document.head.appendChild(style);
      }
      let expandAll = false;
      function render() {
        const tamil = language.value === 'ta', data = tamil ? ta : en, term = search.value.trim().toLocaleLowerCase();
        const parts = [
          {key:'general',title: tamil ? 'பகுதி அ: பொது அறிவு · 75 கேள்விகள்' : 'Part A: General Studies · 75 questions',lang:tamil?'ta':'en',units:data.general},
          {key:'aptitude',title: tamil ? 'பகுதி ஆ: திறனறிவும் மனக்கணக்கு நுண்ணறிவும் · 25 கேள்விகள்' : 'Part B: Aptitude and Mental Ability · 25 questions',lang:tamil?'ta':'en',units:data.aptitude},
          {title:'பகுதி இ: தமிழ் தகுதி மற்றும் மதிப்பீட்டுத் தேர்வு · 100 கேள்விகள்',lang:'ta',units:ta.tamil},
          {title:'Part C alternative: General English · 100 questions · for permitted differently abled candidates',lang:'en',units:en.english}
        ];
        let count = 0;
        content.innerHTML = parts.map(part => {
          const units = part.units.map((unit,index)=>({unit,index})).filter(({unit}) => !term || unit.join(' ').toLocaleLowerCase().includes(term));
          if (!units.length) return '';
          count += units.length;
          return `<section class="reader-part" lang="${part.lang}"><h3>${escape(part.title)}</h3>${units.map(({unit,index}) => `<details class="reader-unit" ${term || expandAll || index === 0 ? 'open' : ''}><summary>${escape(unit[0])}</summary><div class="unit-text">${unit.slice(1).map(p=>`<p>${escape(p)}</p>`).join('')}</div>${mappedChapters(part,index,tamil)}</details>`).join('')}</section>`;
        }).join('');
        results.textContent = count ? `${count} of 22 units shown. Both language-paper syllabi are included; candidates take only the permitted paper.` : 'No matching units. Try another word or clear the search.';
      }
      language.addEventListener('change', render);
      search.addEventListener('input', render);
      host.querySelector('[data-expand]').addEventListener('click', () => {expandAll = true; content.querySelectorAll('details').forEach(d=>d.open=true);});
      host.querySelector('[data-collapse]').addEventListener('click', () => {expandAll = false; content.querySelectorAll('details').forEach(d=>d.open=false);});
      render();
    } catch (error) {
      host.innerHTML = '<p role="alert">The syllabus text could not load. <a href="resources/syllabus/pdfs/tnpsc-group-4-official-syllabus.pdf">Open the complete official PDF</a> or <button type="button" class="button secondary" data-retry>Retry loading text</button>.</p>';
      host.querySelector('[data-retry]').addEventListener('click', () => window.mountGroup4Syllabus(host));
    }
  };
})();
