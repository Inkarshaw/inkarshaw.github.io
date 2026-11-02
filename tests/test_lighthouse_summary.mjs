import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('../scripts/lighthouse_summary.mjs',import.meta.url));
const dir=mkdtempSync(join(tmpdir(),'clearexams-lighthouse-'));
const pages=['home','daily-quiz','tn-school-book','ncert-school-book','current-affairs'];
const data={
  categories:{
    performance:{score:0.88},accessibility:{score:0.97},
    'best-practices':{score:0.96},seo:{score:0.93}
  },
  audits:{
    'largest-contentful-paint':{numericValue:2200},
    'cumulative-layout-shift':{numericValue:0.02}
  }
};
try{
  for(const page of pages)writeFileSync(join(dir,page+'.json'),JSON.stringify(data));
  let result=spawnSync(process.execPath,[script,dir],{encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  const summary=readFileSync(join(dir,'summary.md'),'utf8');
  assert.match(summary,/home \| 88 \| 97 \| 96 \| 93 \| 2200 \| 0.020/);
  assert.match(summary,/real-user INP/);
  assert.match(summary,/production and real-user results are \*\*not\*\* certified/);
  data.categories.performance.score=0.55;
  data.audits['largest-contentful-paint'].numericValue=5100;
  writeFileSync(join(dir,'home.json'),JSON.stringify(data));
  result=spawnSync(process.execPath,[script,dir],{encoding:'utf8'});
  assert.equal(result.status,0,'Poor lab scores must be reported, not concealed or misrepresented as a collection error');
  assert.match(readFileSync(join(dir,'summary.md'),'utf8'),/home: performance 55 < target 85/);
  assert.match(readFileSync(join(dir,'summary.md'),'utf8'),/5100ms > 2500ms/);
  delete data.categories.seo;
  writeFileSync(join(dir,'home.json'),JSON.stringify(data));
  result=spawnSync(process.execPath,[script,dir],{encoding:'utf8'});
  assert.notEqual(result.status,0,'Missing measurements must fail the report');
  assert.match(result.stderr,/missing seo score/);
  console.log('PASS Lighthouse report summary, honest warnings and missing-data failure');
}finally{rmSync(dir,{recursive:true,force:true})}
