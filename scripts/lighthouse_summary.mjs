import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';

const PAGES=['home','daily-quiz','tn-school-book','ncert-school-book','current-affairs'];
const scores=['performance','accessibility','best-practices','seo'];
const targets={'performance':85,'accessibility':95,'best-practices':95,'seo':90};
const directory=process.argv[2]||'.qa/lighthouse';
const format=n=>typeof n==='number'&&Number.isFinite(n)?String(Math.round(n)):'n/a';
const fail=message=>{console.error('Lighthouse summary error: '+message);process.exit(1)};
const lines=[
'# ClearExams mobile Lighthouse lab audit',
'',
'These scores are from automated simulated mobile visits to a local GitHub Actions build, **not** production Core Web Vitals or real-user INP.',
'',
'| Page | Performance | Accessibility | Best Practices | SEO | LCP (ms) | CLS |',
'| --- | ---: | ---: | ---: | ---: | ---: | ---: |'
];
const warnings=[];
for(const page of PAGES){
  const path=join(directory,page+'.json');
  if(!existsSync(path))fail('Missing report: '+path);
  let report;
  try{report=JSON.parse(readFileSync(path,'utf8'))}catch(error){fail(path+': '+error.message)}
  if(!report||!report.categories||!report.audits)fail(path+': incomplete Lighthouse report');
  const values={};
  for(const category of scores){
    const value=report.categories[category]?.score;
    if(typeof value!=='number'||value<0||value>1)fail(path+': missing '+category+' score');
    values[category]=Math.round(value*100);
    if(values[category]<targets[category])warnings.push(page+': '+category+' '+values[category]+' < target '+targets[category]);
  }
  const lcp=report.audits['largest-contentful-paint']?.numericValue;
  const cls=report.audits['cumulative-layout-shift']?.numericValue;
  if(typeof lcp==='number'&&lcp>2500)warnings.push(page+': lab LCP '+format(lcp)+'ms > 2500ms');
  if(typeof cls==='number'&&cls>0.1)warnings.push(page+': lab CLS '+cls.toFixed(3)+' > 0.1');
  lines.push('| '+page+' | '+scores.map(category=>values[category]).join(' | ')+
    ' | '+format(lcp)+' | '+(typeof cls==='number'?cls.toFixed(3):'n/a')+' |');
}
lines.push('','## Targets (aspirational)',...Object.entries(targets).map(([key,value])=>'- '+key+': '+value+'+'),'- Lab LCP: <=2500ms; lab CLS: <=0.1. Measure **field INP** separately with real-user telemetry.','','## Findings');
lines.push(...(warnings.length?warnings.map(x=>'- ⚠ '+x):['- All sampled lab scores meet the targets; production and real-user results are **not** certified.']));
const markdown=lines.join('\n')+'\n';
writeFileSync(join(directory,'summary.md'),markdown);
if(process.env.GITHUB_STEP_SUMMARY)writeFileSync(process.env.GITHUB_STEP_SUMMARY,markdown,{flag:'a'});
console.log(markdown);
