import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const base=path.join(root,'data','quizzes','cds-gk');
const idx=JSON.parse(fs.readFileSync(path.join(base,'index.json'),'utf8'));
assert.equal(idx.schemaVersion,1);assert.equal(idx.exam,'UPSC CDS');
assert.equal(idx.gradingEnabled,false);assert.equal(idx.officialAnswerKeyMapped,false);
assert.equal(idx.sourceUploadedPapers,16);assert.equal(idx.paperStatuses.length,16);
const seen=new Set();let stems=0,options=0,scans=0;
for(const entry of idx.paperStatuses){
 assert.ok(!seen.has(entry.id),'Duplicate CDS source paper id');seen.add(entry.id);
 assert.match(entry.id,/^cds-(i|ii)-20\d\d-gk$/);
 assert.ok(Number.isInteger(entry.textStems)&&entry.textStems<=120);
 assert.ok(Number.isInteger(entry.provisionalFourOptionSets)&&entry.provisionalFourOptionSets<=entry.textStems);
 assert.equal(entry.textStems+0,entry.textStems);
 const p=JSON.parse(fs.readFileSync(path.join(base,entry.output),'utf8'));
 assert.equal(p.id,entry.id);assert.equal(p.section,'General Knowledge');assert.equal(p.exam,'UPSC CDS');
 assert.equal(p.year,entry.year);assert.equal(p.session,entry.session);assert.equal(p.grading,'disabled');
 assert.equal(p.officialAnswerKeyChecked,false);assert.equal(p.officialOriginalConfirmed,false);
 assert.equal(p.originalQuestionCountExpected,120);assert.equal(p.questions.length,120);
 assert.equal(p.stats.textStems,entry.textStems);assert.equal(p.stats.provisionalFourOptionSets,entry.provisionalFourOptionSets);
 assert.equal(p.unresolvedQuestionNumbers.length,entry.unresolvedPositions);
 assert.equal(entry.textStems,p.questions.filter(q=>q.text.trim()).length,entry.id+' actual recovered stems must match index');
 assert.equal(entry.provisionalFourOptionSets,p.questions.filter(q=>q.extraction==='provisional-four-options').length,entry.id+' actual complete text sets must match index');
 assert.equal(entry.unresolvedPositions,p.questions.filter(q=>q.extraction!=='provisional-four-options').length,entry.id+' actual unresolved positions must match index');
 for(let n=1;n<=120;n++){
  const q=p.questions[n-1];assert.equal(q.number,n);assert.equal(q.scoreEligible,false);assert.equal(q.correctAnswer,null);assert.equal(q.ungraded,true);
  for(const L of 'ABCD')assert.equal(typeof q.options[L],'string');
 }
 if(/scan/i.test(p.textExtractionMethod))scans++;
 stems+=entry.textStems;options+=entry.provisionalFourOptionSets;
}
assert.equal(scans,7);assert.equal(idx.paperStatuses.length-scans,9);
const reviewed=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2019-gk.json'),'utf8'));
assert.deepEqual(reviewed.questions.slice(0,27).map(q=>q.number),Array.from({length:27},(_,i)=>i+1));
for(const q of reviewed.questions.slice(0,27)){
 assert.equal(q.extraction,'provisional-four-options','Source-checked question should have all four printed alternatives');
 assert.equal(q.sourceMethod,'manual-uploaded-scan-transcription-unverified');
 assert.ok(q.text.length>17);
 assert.equal(q.correctAnswer,null);
 assert.equal(q.scoreEligible,false);
 assert.equal(q.ungraded,true);
 assert.equal(q.issues.some(x=>/answer key/i.test(x)),true);
 assert.equal(q.sourcePages.length,1);
 assert.equal(q.sourcePages[0],q.number<=7?3:q.number<=13?5:q.number<=20?7:9);
 assert.ok('ABCD'.split('').every(l=>q.options[l].trim().length>0));
}
assert.match(reviewed.questions[0].text,/motto of NCC/);
assert.equal(reviewed.questions[0].options.A,'Unity and Discipline');
assert.match(reviewed.questions[7].text,/National Institute of Ayurveda/,'Matching alternatives must retain list definitions');
assert.match(reviewed.questions[8].text,/National Investment Promotion and Facilitation Agency/);
assert.match(reviewed.questions[12].text,/Italian Open Women/);
assert.match(reviewed.questions[20].text,/Vernacular Press Act/);
assert.match(reviewed.questions[26].text,/Mediterranean climate/);
assert.equal(reviewed.stats.provisionalFourOptionSets,33);
assert.equal(reviewed.stats.textStems,61);
assert.equal(reviewed.unresolvedQuestionNumbers.length,87);
assert.equal(idx.paperStatuses.find(x=>x.id===reviewed.id).provisionalFourOptionSets,33);

const repaired2019=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2019-gk.json'),'utf8'));
assert.equal(repaired2019.stats.textStems,120);
assert.equal(repaired2019.stats.provisionalFourOptionSets,120);
assert.deepEqual(repaired2019.unresolvedQuestionNumbers,[]);
assert.match(repaired2019.questions[2].text,/Damin-i-Koh/,'Column-order repair must not replace Q3 with Q46');
assert.match(repaired2019.questions[45].text,/United Nations multidimensional peace keeping/,'Q46 must remain correctly numbered');
assert.ok(repaired2019.questions[8].text.includes('amending powers of the Parliament'),'Q9 must retain numbered statement text');
assert.deepEqual(repaired2019.questions[69].options,{A:'Colombia',B:'Venezuela',C:'Brazil',D:'Guyana'});
assert.equal(repaired2019.questions[61].extraction,'provisional-four-options','Q62 mathematical source transcription must be present but ungraded');
assert.ok('ABCD'.split('').every(l=>repaired2019.questions[61].options[l].trim()),'Q62 mathematical options must be present');
assert.ok(repaired2019.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));

// Guard against two-column source mixing that previously replaced question stems
// with unrelated questions from other pages or columns.
for(const [id,guards] of Object.entries({
 'cds-i-2018-gk':[[1,/atomic clocks/],[2,/water content of the blood/],[3,/gases dissolves in water/],[4,/formation of chlorophyll/]],
 'cds-i-2017-gk':[[2,/DNA into RNA/]],
 'cds-ii-2016-gk':[[1,/released mostly from landfills/],[2,/sensitive to environmental change/],[3,/largest source of electricity/],[4,/weakens the immunity/]],
 'cds-ii-2017-gk':[[1,/‘Blue Mountains’/],[2,/primate city/],[3,/islands is the largest/],[4,/Tiger Reserves/]]
})){
 const p=JSON.parse(fs.readFileSync(path.join(base,id+'.json'),'utf8'));
 for(const [n,expected] of guards){
  const q=p.questions[n-1];assert.match(q.text,expected,id+' Q'+n+' source-order text changed');
  assert.ok('ABCD'.split('').every(c=>q.options[c].trim().length>1),id+' Q'+n+' printed choices missing');
  assert.equal(q.correctAnswer,null);
  assert.equal(q.scoreEligible,false);
 }
}

// Recovered fourteen fully numbered CDS 2008 I/II, 2010 I/II, 2011 II, 2012 I/II, 2013 II, 2016 II, 2017 I/II, 2018 I/II and 2019 I provisional paper transcriptions.
// All 1680 A-D positions are still ungraded source drafts, NOT official certifications.
for(const id of ['cds-i-2008-gk','cds-ii-2008-gk','cds-i-2010-gk','cds-ii-2010-gk','cds-ii-2011-gk','cds-i-2012-gk','cds-ii-2012-gk','cds-ii-2013-gk','cds-ii-2016-gk','cds-i-2017-gk','cds-ii-2017-gk','cds-i-2018-gk','cds-ii-2018-gk','cds-i-2019-gk']){
 const p=JSON.parse(fs.readFileSync(path.join(base,id+'.json'),'utf8'));
 const status=idx.paperStatuses.find(e=>e.id===id);
 assert.deepEqual(p.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
 assert.equal(p.unresolvedQuestionNumbers.length,0);
 assert.equal(status.textStems,120);assert.equal(status.provisionalFourOptionSets,120);assert.equal(status.unresolvedPositions,0);
 assert.ok(p.questions.every(q=>q.text.trim()&&'ABCD'.split('').every(l=>q.options[l].trim())));
 assert.ok(p.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));
 assert.equal(p.grading,'disabled');assert.equal(p.officialOriginalConfirmed,false);assert.equal(p.officialAnswerKeyChecked,false);
}
const sourceI2008=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2008-gk.json'),'utf8'));
assert.equal(sourceI2008.questions.length,120);
assert.deepEqual(sourceI2008.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceI2008.unresolvedQuestionNumbers,[]);
assert.equal(sourceI2008.grading,'disabled');assert.equal(sourceI2008.officialOriginalConfirmed,false);assert.equal(sourceI2008.officialAnswerKeyChecked,false);
assert.ok(sourceI2008.questions.every((q,i)=>q.number===i+1&&q.text?.trim()&&'ABCD'.split('').every(k=>q.options[k]?.trim())&&q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));
assert.match(sourceI2008.questions[1].text,/peaks is the highest/,'Q2 must reflect uploaded source rather than Parliament committee text');
assert.match(sourceI2008.questions[3].text,/pairs is correctly matched/,'Q4 original country-currency question');
assert.match(sourceI2008.questions[6].text,/South-West Monsoon/,'Q7 numbered statements must remain');
assert.equal(sourceI2008.questions[6].options.C,'1 and 3','Q7 source coded choices recovered');
assert.match(sourceI2008.questions[10].text,/Jallianwala Bagh Massacre/,'Q11 original events and four chronological codes');
assert.deepEqual(sourceI2008.questions[16].options,{A:'1',B:'6',C:'7',D:'10'});
assert.equal(sourceI2008.questions[20].options.B,'Rays of light are scattered by the fog droplets','Q21 directions must not bleed into options');
for(const n of [22,23,24,25])assert.deepEqual(sourceI2008.questions[n-1].options,sourceI2008.questions[21].options,'Q22-25 original shared Assertion-Reason choices');
assert.match(sourceI2008.questions[24].text,/before any court/,'Q25 source-copy restoration recorded');
assert.match(sourceI2008.questions[41].text,/Bhortal Nritya/,'Q42 printed matching list');
assert.match(sourceI2008.questions[43].text,/National Institute of Siddha/,'Q44 printed list definitions must be separate');
assert.match(sourceI2008.questions[89].text,/Ninth Schedule/,'Q90 constitutional schedule table remains present');
assert.match(sourceI2008.questions[97].text,/Conjunctivitis/,'Q98 disease/body-part matching list');
assert.equal(sourceI2008.questions[113].options.C,'Both 1 and 2','Q114 study-source printing anomaly recorded');
assert.match(sourceI2008.questions[119].text,/easily digestible source of protein/,'Q120 original final question');
assert.ok(!sourceI2008.questions[119].text.includes('ANSWERS'),'Printed study-paper answer table must not be attached to last question');

const sourceII2008=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2008-gk.json'),'utf8'));
assert.equal(sourceII2008.questions.length,120);
assert.deepEqual(sourceII2008.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceII2008.unresolvedQuestionNumbers,[]);
assert.equal(sourceII2008.grading,'disabled');assert.equal(sourceII2008.officialOriginalConfirmed,false);assert.equal(sourceII2008.officialAnswerKeyChecked,false);
assert.ok(sourceII2008.questions.every((q,i)=>q.number===i+1&&q.text?.trim()&&'ABCD'.split('').every(k=>q.options[k]?.trim())&&q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));
assert.match(sourceII2008.questions[0].text,/DNA fingerprint/,'Q1 original source stem');
assert.deepEqual(sourceII2008.questions[0].options,{A:'ELISA',B:'RIA',C:'Northern Blotting',D:'Southern Blotting'},'Q1 original third/fourth reprint labels were duplicated');
assert.deepEqual(sourceII2008.questions[4].options,{A:'Red Phosphorus',B:'White Phosphorus',C:'Phosphorus Trioxide (PP3)',D:'Black Phosphorus'},'Q5 malformed printed fourth label');
assert.match(sourceII2008.questions[8].text,/Sarkaria Commission/,'Q9 missing source question restored');
assert.equal(sourceII2008.questions[7].options.D,'Density','Q8 previously had Q9 stem mixed into option D');
assert.match(sourceII2008.questions[17].text,/Jeev Milkha Singh/,'Q18 sports matching-list definition');
for(const n of [41,42,43,44,45])assert.deepEqual(sourceII2008.questions[n-1].options,sourceII2008.questions[40].options,'Assertion–Reason code shared by Q41–45');
assert.equal(sourceII2008.questions[39].options.B,'Non-Cooperation Movement—Civil Disobedience Movement—Quit India Movement','Q40 shared directions must not bleed into options');
assert.match(sourceII2008.questions[40].text,/Equatorial regions bulge/,'Q41 full assertion should be in text, not option A');
assert.equal(sourceII2008.questions[75].options.D,'Neither 1 nor 2','Q76 source annotations must not override choices');
assert.match(sourceII2008.questions[98].text,/Ranganathittu/,'Q99 independent source original position');
assert.match(sourceII2008.questions[100].text,/Aurangabad/,'Q101 matching-list definitions');
assert.match(sourceII2008.questions[119].text,/Treaty of Amritsar/,'Q120 last numbered question, exclude source answer sheet');
assert.deepEqual(sourceII2008.questions[119].options,{A:'Lord Cornwallis',B:'Lord Dalhousie',C:'Lord Hastings',D:'Lord Minto'});

const sourceI2010=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2010-gk.json'),'utf8'));
assert.equal(sourceI2010.questions.length,120);
assert.deepEqual(sourceI2010.unresolvedQuestionNumbers,[]);
assert.deepEqual(sourceI2010.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceI2010.unresolvedSourceVisualNumbers,[92]);
assert.deepEqual(idx.paperStatuses.find(x=>x.id==='cds-i-2010-gk').unresolvedSourceVisualNumbers,[92]);
assert.equal(sourceI2010.questions[91].diagramRequired,true);
assert.equal(sourceI2010.questions[91].diagramStatus,'unresolved-original-figure');
assert.equal(sourceI2010.questions[91].sourceVisualVerified,false);
assert.match(sourceI2010.questions[3].text,/coil in a heater/,'Q4 must retain original source question not corrupted Tata Steel Q80');
assert.match(sourceI2010.questions[20].text,/current global economic crisis/,'Q21 must contain full original statements');
assert.match(sourceI2010.questions[41].text,/Hydrosphere/,'Q42 source matching table must remain in the stem');
assert.deepEqual(sourceI2010.questions[52].options,{A:'4 3 2 1',B:'1 2 3 4',C:'4 2 3 1',D:'1 3 2 4'},'Q53 original code alternatives');
assert.match(sourceI2010.questions[77].text,/Cotton|crops/,'Q78 source order');
assert.match(sourceI2010.questions[96].text,/year 2008/,'Q97 source correction from 2020 PDF reprint error');
assert.ok(!sourceI2010.questions[96].text.includes('Rohit Sharma'));
assert.match(sourceI2010.questions[99].text,/aircraft carrier/,'Q100 original aircraft-carrier item restored');
assert.match(sourceI2010.questions[109].text,/organic farming/,'Q110 original true-false table');
assert.match(sourceI2010.questions[110].text,/CFL lamp/,'Q111 full source table');
assert.match(sourceI2010.questions[113].text,/Solder/,'Q114 alloys table');
assert.equal(sourceI2010.questions[119].options.C,'45°');
assert.ok(sourceI2010.questions.every(q=>q.text.trim()&&'ABCD'.split('').every(k=>q.options[k].trim())));
assert.ok(sourceI2010.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));
assert.equal(sourceI2010.grading,'disabled');assert.equal(sourceI2010.officialOriginalConfirmed,false);assert.equal(sourceI2010.officialAnswerKeyChecked,false);

const sourceII2010=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2010-gk.json'),'utf8'));
assert.equal(sourceII2010.questions.length,120);
assert.deepEqual(sourceII2010.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceII2010.unresolvedQuestionNumbers,[]);
assert.deepEqual(sourceII2010.transcribedLanguages,['English']);
assert.deepEqual(sourceII2010.unresolvedSourceLanguages,['Hindi'],'Original scanned booklet Hindi remains untyped');
assert.deepEqual(idx.paperStatuses.find(x=>x.id==='cds-ii-2010-gk').unresolvedSourceLanguages,['Hindi']);
assert.match(sourceII2010.questions[0].text,/Mauritius/,'Q1 original source order must not be replaced by later cloud computing item');
assert.match(sourceII2010.questions[1].text,/Super phosphate of lime/,'Q2 original Statement I and Statement II');
assert.deepEqual(sourceII2010.questions.slice(0,6).map(q=>q.options),Array(6).fill(sourceII2010.questions[0].options),'Original Q1–6 share same Statement I/II code');
assert.match(sourceII2010.questions[6].text,/Armed Forces \(Special Powers\) Act/,'Q7 original source question');
assert.match(sourceII2010.questions[15].text,/cartoon character/,'Q16 source passage');
assert.match(sourceII2010.questions[19].options.D,/internet-based service/,'Q20 cloud computing should be numbered correctly');
assert.match(sourceII2010.questions[40].text,/Cellulose/,'Q41 sugar matching table');
assert.deepEqual(sourceII2010.questions[40].options,{A:'3 1 4 2',B:'3 4 1 2',C:'2 1 4 3',D:'2 4 1 3'});
for(const n of [58,59,60,64,65,66])assert.ok(sourceII2010.questions[n-1].text.length>700,'Original shared source passage must be present on Q'+n);
assert.match(sourceII2010.questions[77].text,/Inter-State Council/,'Q78 Council question belongs here, not Q2');
assert.match(sourceII2010.questions[92].text,/Santhal rebellion/,'Q93 chronology source number');
assert.match(sourceII2010.questions[95].text,/Selvas/,'Q96 matching list');
assert.match(sourceII2010.questions[103].text,/Industrial policy/,'Q104 source table');
assert.match(sourceII2010.questions[119].text,/Russian revolutionaries/,'Q120 final source position');
assert.ok(sourceII2010.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true),'No official key inferred for CDS II 2010');
assert.equal(sourceII2010.grading,'disabled');assert.equal(sourceII2010.officialOriginalConfirmed,false);assert.equal(sourceII2010.officialAnswerKeyChecked,false);

const sourceII2011=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2011-gk.json'),'utf8'));
assert.equal(sourceII2011.questions.length,120);
assert.deepEqual(sourceII2011.unresolvedQuestionNumbers,[]);
assert.equal(sourceII2011.stats.provisionalFourOptionSets,120);
assert.deepEqual(sourceII2011.transcribedLanguages,['English']);
assert.deepEqual(sourceII2011.unresolvedSourceLanguages,['Hindi'],'Bilingual scanned source has untranslated Hindi portion');
assert.deepEqual(idx.paperStatuses.find(x=>x.id==='cds-ii-2011-gk').unresolvedSourceLanguages,['Hindi']);
assert.match(sourceII2011.questions[0].text,/El Nino/,'Q1 must reflect original scan rather than cross-column CCTNS text');
assert.match(sourceII2011.questions[1].text,/Anticyclone/);
assert.deepEqual(sourceII2011.questions.slice(0,7).map(q=>q.options),Array(7).fill(sourceII2011.questions[0].options),'Q1–7 original shared Assertion–Reason code');
assert.deepEqual(sourceII2011.questions[8].options,{A:'321 km',B:'211 km',C:'111 km',D:'91 km'},'Q9 latitude alternatives');
assert.match(sourceII2011.questions[26].text,/Chinook/,'Q27 list mappings');
assert.match(sourceII2011.questions[62].text,/drain theory/,'Q63 previously misassigned text must be restored to its source number');
assert.match(sourceII2011.questions[89].text,/Crime and Criminal Tracking Network System/,'Q90 CCTNS originally mixed into Q1');
assert.deepEqual(sourceII2011.questions[91].options,{A:'1 2 4 3',B:'1 4 2 3',C:'3 2 4 1',D:'3 4 2 1'},'Q92 plan matching codes');
assert.match(sourceII2011.questions[109].text,/Lactic acid/,'Q110 matching tables preserved');
assert.match(sourceII2011.questions[119].text,/HIV\/AIDS/,'Q120 original last position');
assert.equal(sourceII2011.grading,'disabled');
assert.ok(sourceII2011.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));

const sourceI2012=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2012-gk.json'),'utf8'));
assert.deepEqual(sourceI2012.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.equal(sourceI2012.questions.length,120);
assert.deepEqual(sourceI2012.unresolvedQuestionNumbers,[]);
assert.equal(sourceI2012.grading,'disabled');assert.equal(sourceI2012.officialOriginalConfirmed,false);assert.equal(sourceI2012.officialAnswerKeyChecked,false);
assert.ok(sourceI2012.questions.every((q,i)=>q.number===i+1&&q.text.trim()&&'ABCD'.split('').every(l=>q.options[l].trim())&&q.correctAnswer===null&&q.ungraded===true&&q.scoreEligible===false));
assert.match(sourceI2012.questions[0].text,/Lack of atmosphere around the Moon/,'Q1 from uploaded original paper, not misassigned Q57 Kalinga text');
assert.match(sourceI2012.questions[3].text,/piano wires/,'Q4 must have correct stem, not legacy Q114 Kanishka material');
assert.match(sourceI2012.questions[6].text,/inflationary pressures/,'Q7 multiple-statements recovered');
assert.deepEqual(sourceI2012.questions[7].options,{A:'Maastricht Treaty',B:'Treaty of Paris',C:'Treaty of Rome',D:'Treaty of Lisbon'});
assert.deepEqual(sourceI2012.questions[22].options,{A:'4.5–5.5',B:'5.5–6.5',C:'7.5–8.0',D:'8.5–9.0'});
assert.match(sourceI2012.questions[35].text,/NIFTY/,'Q36 three numbered statements recovered');
assert.equal(sourceI2012.questions[43].options.B,'Bangladesh','Q44 longest-border source number and option order');
assert.match(sourceI2012.questions[56].text,/Kalinga Prize/,'Q57 earlier misplaced in Q1');
assert.match(sourceI2012.questions[58].text,/Bharathipura/,'Q59 original matching book list recovered');
assert.deepEqual(sourceI2012.questions[58].options,{A:'4 2 3 1',B:'1 2 3 4',C:'4 3 2 1',D:'1 3 2 4'});
assert.match(sourceI2012.questions[64].text,/Indravati/,'Q65 original Tiger Reserve list');
assert.match(sourceI2012.questions[68].text,/Third Carnatic War/,'Q69 original battle/treaty codes');
assert.match(sourceI2012.questions[72].text,/Permanent Settlement/,'Q73 four original statements');
assert.match(sourceI2012.questions[97].text,/Konkan/,'Q98 naval exercise matching lists');
assert.match(sourceI2012.questions[103].text,/Coriolis/,'Q104 original four numbered statements');
assert.match(sourceI2012.questions[110].text,/Iyothee Thass/,'Q111 original source matching list');
assert.deepEqual(sourceI2012.questions[110].options,{A:'4 2 1 3',B:'4 3 2 1',C:'4 1 2 3',D:'3 2 1 4'});
assert.equal(sourceI2012.questions[114].options.B,'reptiles','Q115 source copy dropped option B in text layer');
assert.match(sourceI2012.questions[119].text,/PRAHAR/,'Q120 correctly numbered final question');

const sourceII2012=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2012-gk.json'),'utf8'));
assert.equal(sourceII2012.questions.length,120);
assert.deepEqual(sourceII2012.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceII2012.unresolvedQuestionNumbers,[]);
assert.deepEqual(sourceII2012.unresolvedSourceVisualNumbers,[26,107,116],'Original scanned 2012 booklet has three map/diagram questions without embedded figures');
assert.deepEqual(idx.paperStatuses.find(p=>p.id==='cds-ii-2012-gk').unresolvedSourceVisualNumbers,[26,107,116]);
assert.match(sourceII2012.questions[0].text,/planet Neptune appears blue/,'Q1 must follow the uploaded original booklet, not misnumbered bus-speed text');
assert.match(sourceII2012.questions[1].text,/Comets revolve round the Sun/,'Q2 original source order');
assert.match(sourceII2012.questions[46].text,/A bus travels at a speed of 50/,'Q47 source-number recovery');
assert.match(sourceII2012.questions[102].text,/Indian Councils Act, 1892/,'Q103 original matching lists');
assert.match(sourceII2012.questions[106].text,/Copper/,'Q107 map-linked mineral codes');
assert.deepEqual(sourceII2012.questions[0].options,sourceII2012.questions[6].options,'Q1–7 printed Statement I/II answer code must be the same');
assert.equal(sourceII2012.questions[25].diagramStatus,'unresolved-original-figure');
assert.equal(sourceII2012.questions[106].diagramStatus,'unresolved-original-figure');
assert.equal(sourceII2012.questions[115].diagramStatus,'unresolved-original-figure');
assert.equal(sourceII2012.questions[106].sourceVisualVerified,false);
assert.ok(sourceII2012.questions.every(q=>q.text.trim()&&'ABCD'.split('').every(l=>q.options[l].trim())));
assert.ok(sourceII2012.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));
assert.equal(sourceII2012.grading,'disabled');assert.equal(sourceII2012.officialOriginalConfirmed,false);assert.equal(sourceII2012.officialAnswerKeyChecked,false);

const sourceII2013=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2013-gk.json'),'utf8'));
assert.equal(sourceII2013.questions.length,120,'CDS II 2013 must retain all 120 original-numbered positions');
assert.deepEqual(sourceII2013.stats,{textStems:120,provisionalFourOptionSets:120,missingOrPartialPositions:0,numberedPositions:120});
assert.deepEqual(sourceII2013.unresolvedSourceVisualNumbers,[42],'CDS II 2013 Q42 map remains unresolved');
assert.deepEqual(idx.paperStatuses.find(x=>x.id==='cds-ii-2013-gk').unresolvedSourceVisualNumbers,[42]);
assert.match(sourceII2013.questions[0].text,/Typical laterite soils/);
assert.deepEqual(sourceII2013.questions.slice(0,7).map(q=>q.options),Array(7).fill(sourceII2013.questions[0].options),'Q1–7 original shared Assertion–Reason choices');
assert.match(sourceII2013.questions[37].text,/Brassware/,'Q38 printed matching list should remain in the question');
assert.match(sourceII2013.questions[41].text,/Nagarjuna Sagar/);
assert.equal(sourceII2013.questions[41].diagramRequired,true);
assert.equal(sourceII2013.questions[41].diagramStatus,'unresolved-original-figure');
assert.equal(sourceII2013.questions[41].sourceVisualVerified,false);
assert.deepEqual(sourceII2013.questions[41].options,{A:'3 4 1 2',B:'3 1 4 2',C:'2 1 4 3',D:'2 4 1 3'});
assert.match(sourceII2013.questions[69].text,/decontrol the sugar industry/,'Q70 damaged OCR must be repaired');
assert.match(sourceII2013.questions[87].text,/Khasi and Jaintia/,'Q88 original numbered statements must remain');
assert.match(sourceII2013.questions[110].text,/Sachar Committee/,'Q111 committee matching lists recovered');
assert.match(sourceII2013.questions[119].text,/Nadal/,'Q120 final position recovered');
assert.equal(sourceII2013.questions[119].options.D,'Neither 1 nor 2');
assert.ok(sourceII2013.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true),'No study-source key used for scoring');
assert.equal(sourceII2013.grading,'disabled');
assert.equal(sourceII2013.officialAnswerKeyChecked,false);
assert.equal(sourceII2013.officialOriginalConfirmed,false);

const sourceII2016=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2016-gk.json'),'utf8'));
assert.deepEqual(sourceII2016.questions[5].options,{A:'1 only',B:'2 only',C:'2 and 3 only',D:'1, 2 and 3'},'Q6 original enumeration must be preserved');
assert.match(sourceII2016.questions[13].text,/hypocentre/,'Q14 four earthquake statements must remain in the stem');
assert.match(sourceII2016.questions[25].text,/Mg/,'Q26 matching-list definitions must remain present');
assert.deepEqual(sourceII2016.questions[28].options,{A:'C > O > H > N',B:'O > C > H > N',C:'N > C > H > O',D:'N > C > O > H'},'Q29 damaged study-PDF options must stay source-corrected');
assert.equal(sourceII2016.questions[33].options.A,'4 2 3 1','Q34 matching-code correction');
assert.deepEqual(sourceII2016.questions[50].options,sourceII2016.questions[52].options,'Q51–53 use same shared Assertion–Reason code');
assert.deepEqual(sourceII2016.questions[75].options,{A:'1 only',B:'1 and 3',C:'2 and 4 only',D:'1, 2 and 4'},'Q76 source-truncated D option restored');
assert.equal(sourceII2016.questions[95].options.C,'1, 3 and 4','Q96 study PDF duplicated option; retain alternative print comparison');
assert.deepEqual(sourceII2016.questions[107].options,{A:'CRISIL',B:'CARE',C:'ICRA',D:'All of the above'});
assert.match(sourceII2016.questions[115].text,/Kurinchi/,'Q116 matching-list definitions must remain present');
assert.ok(sourceII2016.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));

const sourceII2017=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2017-gk.json'),'utf8'));
assert.deepEqual(sourceII2017.unresolvedSourceVisualNumbers,[82,101],'Undigitized source maps must stay explicitly flagged');
assert.deepEqual(idx.paperStatuses.find(p=>p.id===sourceII2017.id).unresolvedSourceVisualNumbers,[82,101]);
assert.match(sourceII2017.questions[15].text,/frictionless horizontal ground/,'Q16 misprinted source number must be restored');
assert.equal(sourceII2017.questions[15].sourcePages[0],3);
assert.deepEqual(sourceII2017.questions.slice(31,36).map(q=>q.options),Array(5).fill(sourceII2017.questions[31].options),'Q32–36 share original assertion-reason answer code');
assert.match(sourceII2017.questions[51].text,/NH-2/,'Q52 matching lists must not be lost to OCR');
assert.match(sourceII2017.questions[6].text,/Mitochondria/,'Q7 matching list must remain in stem');
assert.deepEqual(sourceII2017.questions[81].options,{A:'4 2 1 3',B:'3 1 2 4',C:'3 2 1 4',D:'4 1 2 3'});
for(const n of [82,101]){
 const q=sourceII2017.questions[n-1];
 assert.equal(q.diagramRequired,true);
 assert.equal(q.diagramStatus,'unresolved-original-figure');
 assert.equal(q.sourceVisualVerified,false);
 assert.ok(q.issues.some(x=>/map/i.test(x)));
 assert.ok(q.text.includes('original numbered map not digitized'));
 assert.equal(q.correctAnswer,null);assert.equal(q.scoreEligible,false);
}
assert.match(sourceII2017.questions[57].options.A,/ferromagnetic/);
assert.equal(sourceII2017.questions[57].options.A,sourceII2017.questions[57].options.B,'Do not silently rewrite duplicate options in an unverified study PDF');
const sourceI2017=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2017-gk.json'),'utf8'));
assert.match(sourceI2017.questions[1].text,/DNA into RNA/);
assert.equal(sourceI2017.questions[10].options.B,'C/7','Q11 capacitor fraction recovered from printed source');
assert.equal(sourceI2017.questions[27].options.D,'R/5','Q28 parallel-wire printed fraction must remain readable');
assert.match(sourceI2017.questions[80].text,/Rowlatt Act/,'Q81 matching-list definitions must remain inside stem');
assert.deepEqual(sourceI2017.questions[110].options,sourceI2017.questions[111].options,'Q111–112 shared Assertion–Reason options');
assert.match(sourceI2017.questions[112].options.B,/Dr\. B\. R\. Ambedkar/,'Q113 initials must not split the option');
assert.equal(sourceI2017.questions[119].options.A,'The Supreme Court of India');
assert.ok(sourceI2017.questions.every(q=>q.correctAnswer===null&&q.scoreEligible===false&&q.ungraded===true));

const source2018=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2018-gk.json'),'utf8'));
assert.match(source2018.questions[11].text,/sinkhole/);
assert.match(source2018.questions[33].text,/horizon/);
assert.match(source2018.questions[34].text,/Cloud/);
assert.match(source2018.questions[76].text,/World Soil Day/);
assert.match(source2018.questions[85].text,/Sikkim/);
assert.match(source2018.questions[113].text,/Kharoshthi/);
assert.deepEqual(source2018.questions[11].options,source2018.questions[17].options,'Original Q12–18 share the printed answer code');
const sourceII2018=JSON.parse(fs.readFileSync(path.join(base,'cds-ii-2018-gk.json'),'utf8'));
assert.match(sourceII2018.questions[1].text,/How many moles of CO/,'CDS II 2018 Q2 must be correctly numbered');
assert.match(sourceII2018.questions[7].text,/two miscible liquids/);
assert.match(sourceII2018.questions[7].options.B,/ρ1/);
assert.deepEqual(sourceII2018.questions[71].options,sourceII2018.questions[74].options,'Shared printed directions must apply to Q72–75');
assert.deepEqual(sourceII2018.questions[70].options,{A:'Jowar (Hybrid)',B:'Bajra',C:'Maize',D:'Soya bean'},'Q71 must not absorb the next four questions directions');
assert.match(sourceII2018.questions[113].text,/SWAYAM/);
assert.match(sourceII2018.questions[119].text,/Haridwar Kumbh Mela/);
assert.ok(sourceII2018.questions[1].issues.some(x=>/CH3/.test(x)),'Unverified scanned chemical formula must remain flagged');
const source2019=JSON.parse(fs.readFileSync(path.join(base,'cds-i-2019-gk.json'),'utf8'));
assert.match(source2019.questions[61].text,/vectors/);
assert.match(source2019.questions[61].options.B,/>/);
assert.match(source2019.questions[61].options.C,/</);
assert.match(source2019.questions[61].options.D,/−/);

assert.match(fs.readFileSync(path.join(root,'pyq-cds.html'),'utf8'),/120 numbered positions per paper/);
const js=fs.readFileSync(path.join(root,'assets','js','pyq-cds.js'),'utf8');
assert.match(js,/correctAnswer!==null/);assert.match(js,/scoreEligible!==false/);
assert.match(js,/cacheKey/);assert.match(js,/exportResponses/);
assert.match(js,/officialAnswerKeyChecked!==false/);
assert.match(js,/diagramStatus==='unresolved-original-figure'/,'Missing maps must block answer selection');
assert.match(js,/btn.disabled=missingFigure/,'Undigitized source maps should not be answerable');
assert.match(js,/Source PDF page not yet mapped/,'Retyped source pages without precise map must not be called missing text');
console.log(`PASS: ${idx.paperStatuses.length} CDS source papers, ${stems} machine-recovered stems, ${options} provisional A-D blocks, 0 official keys and no scores`);
// Incomplete OCR positions must not count as attempted answers in the reader.
const cdsReader=fs.readFileSync(path.join(root,'assets','js','pyq-cds.js'),'utf8');
assert.ok(cdsReader.includes("btn.disabled=missingFigure||needsSourceReview(q)||!content.trim();"),'Reader must disable answers for incomplete text or missing alternatives');
assert.ok(cdsReader.includes("active.questions[Number(n)-1]?.extraction==='provisional-four-options'"),'Reader must discard locally saved answers for incomplete source positions');
