/* Class 10 Social Science mixed mock: pure, testable helpers. */
(function(root){
  'use strict';
  const sections=['History','Geography','Civics','Economics'];
  const quotas={
    20:{History:8,Geography:5,Civics:4,Economics:3},
    50:{History:20,Geography:13,Civics:9,Economics:8},
    100:{History:40,Geography:25,Civics:18,Economics:17}
  };
  function assert(ok,message){if(!ok)throw Error(message)}
  function validateIndex(index){
    assert(index&&Array.isArray(index.units)&&index.units.length===27,'The 27-chapter catalogue is unavailable.');
    assert(index.meta&&index.meta.class===10&&index.meta.subject==='Social Science','Incorrect Class 10 Social Science catalogue.');
    const ids=new Set();
    for(const u of index.units){
      assert(Number.isInteger(u.id)&&u.id>=1&&u.id<=27&&!ids.has(u.id),'Invalid chapter identifier in catalogue.');
      ids.add(u.id);
      assert(u.ready===true&&u.total===20&&u.path==='unit-'+u.id+'.json','A starter chapter is missing or unpublished.');
      assert(sections.includes(u.section_en),'Unknown Social Science section.');
    }
    for(const [section,count] of [['History',10],['Geography',7],['Civics',5],['Economics',5]]){
      assert(index.units.filter(u=>u.section_en===section).length===count,'Unexpected chapter distribution: '+section);
    }
    return index.units;
  }
  function assemble(units,documents){
    assert(Array.isArray(units)&&Array.isArray(documents)&&units.length===27&&documents.length===27,'Incomplete question-bank download.');
    const result=[],seen=new Set();
    for(let i=0;i<units.length;i++){
      const u=units[i],d=documents[i];
      assert(d&&d.meta&&d.meta.unit===u.id&&Array.isArray(d.questions)&&d.questions.length===20,'Invalid question bank for chapter '+u.id);
      for(const q of d.questions){
        assert(q&&typeof q.id==='string'&&!seen.has(q.id),'Duplicate or absent question ID.');
        seen.add(q.id);
        assert(typeof q.q_en==='string'&&q.q_en.trim()&&typeof q.q_ta==='string'&&q.q_ta.trim(),'Incomplete bilingual question '+q.id);
        assert(Array.isArray(q.opts_en)&&Array.isArray(q.opts_ta)&&q.opts_en.length===4&&q.opts_ta.length===4,'Incomplete options '+q.id);
        assert(q.opts_en.every(s=>typeof s==='string'&&s.trim())&&q.opts_ta.every(s=>typeof s==='string'&&s.trim()),'Empty option '+q.id);
        assert(Number.isInteger(q.correct)&&q.correct>=0&&q.correct<4,'Invalid correct option '+q.id);
        assert(typeof q.exp_en==='string'&&q.exp_en.trim()&&typeof q.exp_ta==='string'&&q.exp_ta.trim(),'Missing bilingual explanation '+q.id);
        result.push({...q,unitId:u.id,sectionEn:u.section_en,sectionTa:u.section_ta,unitEn:u.unit_en,unitTa:u.unit_ta});
      }
    }
    assert(result.length===540,'The question set is incomplete.');
    return result;
  }
  function shuffle(input,rng){
    const a=input.slice();
    for(let i=a.length-1;i>0;i--){
      const r=Number(rng());
      assert(Number.isFinite(r)&&r>=0&&r<1,'Invalid random number.');
      const j=Math.floor(r*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function draw(bank,count,rng=Math.random){
    assert(Object.prototype.hasOwnProperty.call(quotas,count),'Choose 20, 50 or 100 questions.');
    assert(Array.isArray(bank),'Question bank unavailable.');
    const picked=[];
    for(const section of sections){
      const n=quotas[count][section],pool=bank.filter(q=>q.sectionEn===section);
      assert(pool.length>=n,'Not enough '+section+' questions.');
      picked.push(...shuffle(pool,rng).slice(0,n));
    }
    const mixed=shuffle(picked,rng);
    assert(mixed.length===count&&new Set(mixed.map(q=>q.id)).size===count,'Mock selection failed.');
    return mixed;
  }
  function grade(questions,answers){
    assert(Array.isArray(questions)&&Array.isArray(answers)&&questions.length===answers.length,'Invalid answer sheet.');
    const breakdown=Object.fromEntries(sections.map(s=>[s,{total:0,correct:0,wrong:0,blank:0}]));
    let correct=0,wrong=0,blank=0;
    questions.forEach((q,i)=>{
      const a=answers[i],group=breakdown[q.sectionEn];
      assert(group,'Invalid mock subject.');
      group.total++;
      if(a===null||a===undefined){blank++;group.blank++}
      else if(a===q.correct){correct++;group.correct++}
      else{wrong++;group.wrong++}
    });
    return {total:questions.length,correct,wrong,blank,percent:questions.length?Math.round(correct/questions.length*100):0,breakdown};
  }
  root.Class10SocialMockCore={sections,quotas,validateIndex,assemble,draw,grade};
})(typeof window!=='undefined'?window:globalThis);
