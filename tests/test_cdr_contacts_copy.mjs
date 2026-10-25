import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const source=readFileSync(new URL('../cdranalysis/js/contacts.js',import.meta.url),'utf8');

function harness(selected,{clipboard=null,legacyResult=true}={}){
  const notifications=[];
  const fields=[];
  let legacyCalls=0;
  const document={
    body:{appendChild(input){input.appended=true;}},
    createElement(tag){
      assert.equal(tag,'textarea');
      const input={value:'',style:{},setAttribute(){},select(){this.selected=true;},remove(){this.removed=true;}};
      fields.push(input);
      return input;
    },
    execCommand(command){assert.equal(command,'copy');legacyCalls++;return legacyResult;}
  };
  const window={};
  runInNewContext(source,{window,document,navigator:{clipboard}},{filename:'contacts.js'});
  const instance=window.CDRContactsFactory({
    state:{requestSelected:new Set(selected)},
    showStatus:(message,kind)=>notifications.push({message,kind})
  });
  return {instance,notifications,fields,get legacyCalls(){return legacyCalls;}};
}

test('copies selected numeric identifiers only, uniquely, on separate lines',async()=>{
  const written=[];
  const h=harness(['9123456789','9876543210','9123456789','123456789012345','SENDER'],{
    clipboard:{async writeText(value){written.push(value);}}
  });
  await h.instance.copySelectedContacts();
  assert.deepEqual(written,['9123456789\n9876543210\n123456789012345']);
  assert.deepEqual(h.notifications,[{message:'3 selected numbers copied to clipboard.',kind:'ok'}]);
  assert.equal(h.legacyCalls,0);
});

test('empty selection cannot copy',async()=>{
  let calls=0;
  const h=harness([],{clipboard:{async writeText(){calls++;}}});
  await h.instance.copySelectedContacts();
  assert.equal(calls,0);
  assert.equal(h.notifications[0].kind,'error');
  assert.match(h.notifications[0].message,/Select at least one/);
});

test('uses local textarea fallback when clipboard is unavailable',async()=>{
  const h=harness(['9123456789']);
  await h.instance.copySelectedContacts();
  assert.equal(h.legacyCalls,1);
  assert.equal(h.fields[0].value,'9123456789');
  assert.equal(h.fields[0].selected,true);
  assert.equal(h.fields[0].removed,true);
  assert.equal(h.notifications[0].kind,'ok');
});

test('clipboard denial uses fallback and reports failure if both methods fail',async()=>{
  const h=harness(['9123456789'],{
    clipboard:{async writeText(){throw new Error('denied');}},
    legacyResult:false
  });
  await h.instance.copySelectedContacts();
  assert.equal(h.legacyCalls,1);
  assert.equal(h.fields[0].removed,true);
  assert.equal(h.notifications[0].kind,'error');
  assert.match(h.notifications[0].message,/Could not copy numbers/);
});

test('Contacts toolbar and event wiring expose the copy action',()=>{
  const html=readFileSync(new URL('../cdranalysis/index.html',import.meta.url),'utf8');
  const ui=readFileSync(new URL('../cdranalysis/js/ui.js',import.meta.url),'utf8');
  const app=readFileSync(new URL('../cdranalysis/js/app.js',import.meta.url),'utf8');
  assert.match(html,/id="copySelectedContactsBtn"/);
  assert.match(ui,/\$\('copySelectedContactsBtn'\)\.onclick=copySelectedContacts/);
  assert.match(app,/function copySelectedContacts\(\)\{return contactsModule\?\.copySelectedContacts\(\);\}/);
});
