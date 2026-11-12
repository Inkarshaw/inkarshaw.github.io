/* ClearExams TNUSRB SI 2019 recruitment / 2020 exam.
   Positional final-key comparisons are NOT equivalent-question mappings. */
(async function(){
  'use strict';
  const $=id=>document.getElementById(id);
  const make=(tag,text)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=String(text);return e};
  const validTokens=new Set(['A','B','C','D','ALL','A/D','A/B','A/C','A/B/D']);
  let rows=[];
  const fetchJSON=async url=>{
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw Error('Source unavailable: '+url);
    return r.json();
  };
  const check=(condition,message)=>{if(!condition)throw Error(message)};
  function verify(matrix,seriesC,crosswalk){
    check(matrix?.schemaVersion===1&&matrix?.series?.join(',')==='A,B,C,D','Series label integrity failure');
    check(crosswalk?.schemaVersion===1&&crosswalk?.noAutomaticSeriesCOriginalSubstitution===true,'Crosswalk may not substitute C originals');
    check(crosswalk?.psychologyMappings?.length===60&&crosswalk?.existingStemMatches===57,'All 60 Psychology positions required');
    check(crosswalk?.candidateUnverifiedMappings===3&&crosswalk?.sourceSeriesDCandidateQuestions?.length===3,'Three study-only candidates required');
    check(crosswalk?.sourceFinalKey===matrix.source,'Source provenance differs from verified final key');
    const uniqueC=new Set(),uniqueD=new Set();
    let verified=0,provisional=0;
    for(const m of crosswalk.psychologyMappings){
      const {seriesCNumber:c,seriesDNumber:d,verification:v}=m;
      check(Number.isInteger(c)&&c>=81&&c<=140&&Number.isInteger(d)&&d>=81&&d<=140,'Psychology crosswalk number out of range');
      check(!uniqueC.has(c)&&!uniqueD.has(d),'Crosswalk positions must be bijective');
      uniqueC.add(c);uniqueD.add(d);
      check(matrix.positionKeys[c-1].C===matrix.positionKeys[d-1].D,'Crosswalk answer key disagreement for C '+c);
      if(v==='stem_compared_against_existing_c_and_key_agrees'){
        check(seriesC.questions.some(q=>q.number===c),'Claimed matched C stem not in original bank');
        verified++;
      }else{
        check(v==='candidate_by_elimination_not_original_c'&&[114,115,116].includes(c),'Only original C gaps can be inferred');
        provisional++;
      }
    }
    check(verified===57&&provisional===3,'Psychology verification totals changed');
    const candidates=crosswalk.sourceSeriesDCandidateQuestions;
    check(candidates.every(x=>[114,115,116].includes(x.seriesCPositionHypothesis)&&[107,108,109].includes(x.seriesDPrintedNumber)&&!x.scoringAllowed&&!x.originalSeriesCStemVerified&&!x.originalSeriesCOptionsVerified),'Candidates may never be certified or graded');
    for(const x of candidates){
      const m=crosswalk.psychologyMappings.find(y=>y.seriesCNumber===x.seriesCPositionHypothesis);
      check(m?.seriesDNumber===x.seriesDPrintedNumber,'Candidate and crosswalk number mismatch');
      check(x.seriesCFinalKey===matrix.positionKeys[x.seriesCPositionHypothesis-1].C&&x.seriesDFinalKey===matrix.positionKeys[x.seriesDPrintedNumber-1].D,'Candidate answer proof failed');
      check(Object.keys(x.seriesDSourceOptions).join(',')==='A,B,C,D','Four D source options required');
    }
    check(matrix?.positionKeys?.length===140,'140 original key rows required');
    check(seriesC?.bookletSeries==='C'&&seriesC?.answerKey?.answers?.length===140,'Series C question bank incomplete');
    check(matrix?.unresolvedSeriesCOriginalPositions?.join(',')==='114,115,116','C source holes changed');
    check(seriesC?.missingNumbers?.join(',')==='114,115,116','Missing original C positions not in sync');
    check(matrix.noOtherSeriesQuestionTextAutoSubstituted===true,'Cross-series option provenance unsafe');
    for(let i=0;i<140;i++){
      const r=matrix.positionKeys[i];
      check(r.number===i+1,'Question numbers not sequential');
      for(const series of matrix.series)check(validTokens.has(r[series]),'Invalid final-key token at '+r.number);
      check(r.C===seriesC.answerKey.answers[i],'Series C key mismatch at '+r.number);
    }
    for(const n of [114,115,116]){
      check(!seriesC.questions.some(q=>q.number===n),'C printed question not yet recovered: '+n);
      check(matrix.proofRows.some(r=>r.cNumber===n&&r.keyC===matrix.positionKeys[n-1].C),'C missing-key proof failed');
    }
    check(matrix.knownSeriesDToCMatches?.length===8,'Reviewed matching positions changed');
    const matched=new Set();
    for(const item of matrix.knownSeriesDToCMatches){
      check(item.c>=1&&item.c<=140&&item.d>=1&&item.d<=140,'Mapped number outside booklet range');
      check(!matched.has(item.c),'Duplicate mapped C question');
      check(seriesC.questions.some(q=>q.number===item.c),'Known C question unavailable');
      matched.add(item.c);
    }
    return matrix.positionKeys;
  }
  const keyDisplay=key=>key==='ALL'?'All correct':key.replaceAll('/',' or ');
  function renderKeys(selected){
    $('rows').replaceChildren();
    const subset=selected?rows.filter(r=>selected.includes(r.number)):rows;
    for(const r of subset){
      const tr=make('tr');tr.dataset.current=String([114,115,116].includes(r.number));
      const label=make('th',r.number);label.setAttribute('scope','row');tr.append(label);
      for(const series of ['A','B','C','D']){
        const cell=make('td',keyDisplay(r[series]));cell.className='key'+(series==='C'?' c':'');
        tr.append(cell);
      }
      $('rows').append(tr);
    }
    $('selectionStatus').textContent=selected?'Showing printed booklet row'+(selected.length===1?'':'s')+' '+selected.join(', ')+'. Same row number across series is NOT the same question.':'Showing all 140 position-key rows. Do not interpret equal numbers as question equivalence.';
  }
  function renderMatches(matches){
    const body=$('knownMatches');body.replaceChildren();
    for(const m of matches){
      const tr=make('tr');
      tr.append(make('th','Q'+m.c),make('td','Q'+m.d));
      const cell=make('td',m.verification+' · '+(m.grade==='ungraded'?'Ungraded study comparison':'Only the Series C key is provisionally used'));
      tr.append(cell);body.append(tr);
    }
  }
  function renderPsychologyCrosswalk(crosswalk){
    const body=$('psychologyRows');body.replaceChildren();
    for(const m of [...crosswalk.psychologyMappings].sort((a,b)=>a.seriesCNumber-b.seriesCNumber)){
      const tr=make('tr');
      tr.append(make('th','C Q'+m.seriesCNumber),make('td','D Q'+m.seriesDNumber));
      tr.append(make('td',m.verification==='candidate_by_elimination_not_original_c'?'Inferred only · C original unverified':'Compared source stem + matching final key'));
      body.append(tr);
    }
  }
  function renderStudyCandidates(crosswalk){
    const root=$('candidateCards');root.replaceChildren();
    for(const x of crosswalk.sourceSeriesDCandidateQuestions){
      const article=make('article');article.className='candidate';
      article.append(make('h3','Possible C Q'+x.seriesCPositionHypothesis+' ← printed Series D Q'+x.seriesDPrintedNumber));
      article.append(make('p',x.seriesDSourceQuestion));
      const list=make('ul');
      for(const letter of ['A','B','C','D'])list.append(make('li',letter+'. '+x.seriesDSourceOptions[letter]));
      article.append(list);
      article.append(make('p','Official final-key positions: Series C '+x.seriesCFinalKey+' / Series D '+x.seriesDFinalKey+'. UNGRADED: these are Series D source options, not certified Series C options.'));
      const note=make('p',x.caution);note.className='small';article.append(note);
      root.append(article);
    }
  }
  function renderGaps(gaps){
    const div=$('gapCards');div.replaceChildren();
    for(const gap of gaps){
      const card=make('div');card.className='gap';
      card.append(make('strong','Series C Q'+gap.cNumber));
      card.append(make('p','Final-key C-series letter: '+gap.keyC+'. Original C question and options absent.'));
      card.append(make('p','Same numbered rows: A '+keyDisplay(gap.keyA)+' · B '+keyDisplay(gap.keyB)+' · D '+keyDisplay(gap.keyD)+'. These are different booklet questions.'));
      div.append(card);
    }
  }
  $('jump').addEventListener('click',()=>{
    if(!rows.length)return;
    const n=Number($('number').value);
    if(!Number.isInteger(n)||n<1||n>140){
      $('selectionStatus').textContent='Enter a whole number between 1 and 140.';return;
    }
    renderKeys([n]);
    $('rows').scrollIntoView({block:'nearest'});
  });
  $('number').addEventListener('keydown',event=>{if(event.key==='Enter')$('jump').click()});
  $('showAll').addEventListener('click',()=>{if(rows.length)renderKeys(null)});
  try{
    const [matrix,cBank,crosswalk]=await Promise.all([
      fetchJSON('data/quizzes/tnusrb-si-2020-cross-series-keys.json'),
      fetchJSON('data/quizzes/tnusrb-si-2020-series-c.json'),
      fetchJSON('data/quizzes/tnusrb-si-2020-psychology-crosswalk.json')
    ]);
    rows=verify(matrix,cBank,crosswalk);
    renderPsychologyCrosswalk(crosswalk);
    renderStudyCandidates(crosswalk);
    renderGaps(matrix.proofRows);
    renderMatches(matrix.knownSeriesDToCMatches);
    renderKeys([114,115,116]);
    $('status').textContent='140 booklet-position keys verified. In Psychology, 57 of 60 C↔D content matches also agree on final-key letters; three remaining D questions are study-only candidates, NOT verified original C text. C Q114–116 remain missing and ungraded.';
  }catch(error){
    $('status').textContent='Comparison could not be verified against the current Series C bank. Do not rely on these positions until the source files are checked.';
    $('selectionStatus').textContent=String(error.message||error);
  }
})();