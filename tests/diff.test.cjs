const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');

// Run the page's actual script with just the DOM and storage methods it uses.
const html=readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.match(/<script>([\s\S]*?)<\/script>/u)[1];
const historyKey='draft.history.v1';
function createLocks(){
 let pending=Promise.resolve();
 return {request:(name,callback)=>{
  assert.equal(name,historyKey);
  const result=pending.then(callback);
  pending=result.catch(()=>{});
  return result;
 }};
}
function createStorage(items=[]){
 const data=new Map([[historyKey,JSON.stringify(items)]]);
 return {data,locks:createLocks(),getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
}
function createApp(storage=createStorage()){
 const elements=new Map(),listeners=new Map();
 const app={storage,confirmed:true,element:id=>elements.get(id)};
 function node(tag){
  let text='';
  return {tag,children:[],value:'',hidden:false,attributes:{},
   get textContent(){return text+this.children.map(child=>child.textContent).join('');},
   set textContent(value){text=String(value);this.children=[];},
   append(...children){this.children.push(...children.flatMap(child=>child.tag==='#fragment'?child.children:[child]));},
   replaceChildren(...children){text='';this.children=[];this.append(...children);},
   setAttribute(name,value){this.attributes[name]=value;},
   focus(){app.focused=this;}
  };
 }
 for(const match of html.matchAll(/<(\w+)\b([^>]*\bid="([^"]+)"[^>]*)>/gu)){
  const element=node(match[1]);element.hidden=/\bhidden\b/u.test(match[2]);elements.set(match[3],element);
 }
 const document={getElementById:app.element,createElement:node,createDocumentFragment:()=>node('#fragment'),createTextNode:text=>{const result=node('#text');result.textContent=text;return result;}};
 const window={addEventListener:(type,listener)=>listeners.set(type,listener)};
 app.diff=runInNewContext(`${source}\ndiff`,{document,window,localStorage:storage,navigator:{locks:storage.locks},confirm:()=>app.confirmed});
 app.storageEvent=(key=historyKey,storageArea=storage)=>listeners.get('storage')?.({key,storageArea});
 app.click=id=>app.element(id).onclick();
 app.compare=(original,revised='revision')=>{
  if(app.element('editor').hidden)app.click('toggle');
  app.element('original').value=original;app.element('revised').value=revised;return app.click('update');
 };
 app.rows=()=>app.element('history-list').children;
 return app;
}
const saved=storage=>JSON.parse(storage.data.get(historyKey)||'[]');
const entry=(original,revised='revision')=>({original,revised,savedAt:Date.now()});
const {diff}=createApp();
const parts=(a,b)=>JSON.parse(JSON.stringify(diff(a,b).parts));

function assertDrafts(original,revised){
 const result=diff(original,revised);
 assert.equal(result.parts.filter(p=>p.type!=='ins').map(p=>p.text).join(''),original);
 assert.equal(result.parts.filter(p=>p.type!=='del').map(p=>p.text).join(''),revised);
 return result;
}

test('consecutive changed words form one replacement',()=>{
 assert.deepEqual(parts('The quick brown fox.','The slow red fox.'),[
  {type:'same',text:'The '},
  {type:'del',text:'quick brown'},
  {type:'ins',text:'slow red'},
  {type:'same',text:' fox.'}
 ]);
});

test('unchanged words and line breaks separate change groups',()=>{
 const result=parts('old first\nold second stays old third','new alpha\nnew beta stays new gamma');
 assert.deepEqual(result.filter(p=>p.type==='del').map(p=>p.text),['old first','old second','old third']);
 assert.deepEqual(result.filter(p=>p.type==='ins').map(p=>p.text),['new alpha','new beta','new gamma']);
 assert.deepEqual(result.filter(p=>p.type==='same').map(p=>p.text),['\n',' stays ']);
});

test('both drafts survive grouping with exact whitespace, punctuation, and Unicode',()=>{
 const drafts=['','same','old words','new phrase','a\rb',' a  b\tç!\r\nnext line\n',' a  d\té?\r\nnew row\n','你好 世界 👋','你好 地球 🌎','<script>alert("text")</script>'];
 for(const original of drafts)for(const revised of drafts)assertDrafts(original,revised);
});

test('mixed insertions and deletions preserve both drafts',()=>{
 let seed=42;
 const tokens=['one','two','three',' ','  ','\t','\r','\n','\r\n','é','!'];
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 const draft=()=>Array.from({length:random()%25},()=>tokens[random()%tokens.length]).join('');
 for(let i=0;i<300;i++)assertDrafts(draft(),draft());
});

test('large comparisons retain the responsive fallback and both drafts',()=>{
 const result=assertDrafts('start '+('old '.repeat(2000))+'end','start '+('new '.repeat(2000))+'end');
 assert.equal(result.coarse,true);
 assert.equal(result.parts.filter(p=>p.type==='del').length,1);
 assert.equal(result.parts.filter(p=>p.type==='ins').length,1);
});

test('history saves exact drafts and restores them after reload',async()=>{
 const storage=createStorage(),app=createApp(storage);
 await app.compare('Original\n  text','Revised\ttext');
 assert.equal(saved(storage)[0].original,'Original\n  text');
 assert.equal(saved(storage)[0].revised,'Revised\ttext');
 const reloaded=createApp(storage);
 reloaded.rows()[0].children[0].onclick();
 assert.equal(reloaded.element('original').value,'Original\n  text');
 assert.equal(reloaded.element('revised').value,'Revised\ttext');
 assert.equal(reloaded.element('editor').hidden,false);
 assert.equal(reloaded.element('wordcounts').textContent,'Original: 2 words → Revised: 2 words');
 assert.equal(saved(storage).length,1);
});

test('history does not replace unsaved edits when restore is canceled',()=>{
 const app=createApp(createStorage([entry('saved')]));
 app.element('original').value='unsaved';app.confirmed=false;
 app.rows()[0].children[0].onclick();
 assert.equal(app.element('original').value,'unsaved');
 app.confirmed=true;app.rows()[0].children[0].onclick();
 assert.equal(app.element('original').value,'saved');
});

test('history skips empty comparisons, deduplicates, and retains the newest 20',async()=>{
 const app=createApp();
 await app.compare('','');assert.equal(saved(app.storage).length,0);
 for(let i=0;i<22;i++)await app.compare('original '+i,'revision '+i);
 await app.compare('original 5','revision 5');
 assert.equal(saved(app.storage).length,20);
 assert.equal(saved(app.storage)[0].original,'original 5');
 assert.equal(saved(app.storage)[19].original,'original 2');
 assert.equal(app.rows().length,20);
});

test('history saves and deletes against the latest storage from other tabs',async()=>{
 const storage=createStorage(),first=createApp(storage),second=createApp(storage);
 await first.compare('first');await second.compare('second');
 assert.deepEqual(saved(storage).map(item=>item.original),['second','first']);
 await first.rows()[0].children[1].onclick();
 assert.deepEqual(saved(storage).map(item=>item.original),['second']);
 await second.rows()[0].children[1].onclick();
 assert.deepEqual(saved(storage),[]);
});

test('storage events refresh history after another tab saves, deletes, or clears',async()=>{
 const storage=createStorage([entry('saved')]),first=createApp(storage),second=createApp(storage);
 second.element('history').open=true;
 second.element('original').value='unsaved original';
 second.element('revised').value='unsaved revision';
 const reading=second.element('reading').textContent;
 await first.compare('new');second.storageEvent();
 assert.equal(second.rows().length,2);
 assert.equal(second.element('history-count').textContent,'2');
 await first.rows()[0].children[1].onclick();second.storageEvent();
 assert.equal(second.rows().length,1);
 assert.match(second.rows()[0].children[0].textContent,/^saved →/u);
 assert.equal(second.element('history-count').textContent,'1');
 await first.click('clear-history');second.storageEvent();
 assert.equal(second.rows().length,0);
 assert.equal(second.element('history-count').textContent,'0');
 assert.equal(second.element('history-empty').hidden,false);
 assert.equal(second.element('clear-history').hidden,true);
 assert.equal(second.element('history').open,true);
 assert.equal(second.element('original').value,'unsaved original');
 assert.equal(second.element('revised').value,'unsaved revision');
 assert.equal(second.element('reading').textContent,reading);
});

test('history refreshes on storage clear and ignores unrelated storage events',()=>{
 const storage=createStorage([entry('saved')]),app=createApp(storage);
 storage.data.clear();
 app.storageEvent('unrelated');
 assert.equal(app.rows().length,1);
 app.storageEvent(historyKey,createStorage());
 assert.equal(app.rows().length,1);
 app.storageEvent(null);
 assert.equal(app.rows().length,0);
 assert.equal(app.element('history-count').textContent,'0');
});

test('overlapping tab saves retain both comparisons',async()=>{
 const storage=createStorage(),first=createApp(storage),second=createApp(storage);
 const getItem=storage.getItem;
 let interleave,secondSave;
 storage.getItem=key=>{
  const value=getItem(key);
  if(interleave){const run=interleave;interleave=null;run();}
  return value;
 };
 // The second tab starts saving after the first tab has read its snapshot.
 interleave=()=>{secondSave=second.compare('second');};
 await first.compare('first');await secondSave;
 assert.deepEqual(saved(storage).map(item=>item.original),['second','first']);
});

test('queued saves capture each comparison without delaying the editor',async()=>{
 const app=createApp();
 const first=app.compare('first'),second=app.compare('second');
 assert.equal(app.element('editor').hidden,true);
 assert.equal(app.element('original').value,'second');
 await Promise.all([first,second]);
 assert.deepEqual(saved(app.storage).map(item=>item.original),['second','first']);
});

test('queued saves, deletes, and clears use the same history lock',async()=>{
 const storage=createStorage([entry('old')]),first=createApp(storage),second=createApp(storage);
 await Promise.all([first.compare('first'),second.rows()[0].children[1].onclick()]);
 assert.deepEqual(saved(storage).map(item=>item.original),['first']);
 await Promise.all([first.compare('second'),second.click('clear-history'),first.compare('third')]);
 assert.deepEqual(saved(storage).map(item=>item.original),['third']);
});

test('unavailable or rejected locks warn without overwriting saved history',async()=>{
 for(const locks of [undefined,{request:()=>Promise.reject(new Error('blocked'))}]){
  const storage=createStorage([entry('saved')]);storage.locks=locks;
  const app=createApp(storage);
  await app.compare('new');
  assert.deepEqual(saved(storage).map(item=>item.original),['saved']);
  assert.equal(app.rows().length,1);
  assert.match(app.element('history-note').textContent,/could not be saved/u);
  assert.equal(app.element('editor').hidden,true);
  assert.ok(app.element('reading').textContent.includes('new'));
 }
});

test('failed saves never appear as saved history or disappear on a later delete',async()=>{
 const storage=createStorage(),app=createApp(storage);
 await app.compare('A');
 storage.setItem=()=>{throw new Error('quota');};
 await app.compare('B');
 assert.match(app.element('history-note').textContent,/could not be saved/u);
 assert.equal(app.rows().length,1);
 assert.match(app.rows()[0].children[0].textContent,/^A →/u);
 assert.equal(app.element('original').value,'B');
 assert.ok(app.element('reading').textContent.includes('B'));
 await app.rows()[0].children[1].onclick();
 assert.deepEqual(saved(storage),[]);
 assert.equal(app.rows().length,0);
 assert.equal(app.element('original').value,'B');
});

test('clearing history removes other tabs’ entries and stale saves do not resurrect them',async()=>{
 const storage=createStorage(),first=createApp(storage),second=createApp(storage);
 await first.compare('first');await second.compare('second');
 await first.click('clear-history');
 assert.deepEqual(saved(storage),[]);
 await second.compare('third');
 assert.deepEqual(saved(storage).map(item=>item.original),['third']);
});

test('clear history honors cancellation and keeps the current drafts',async()=>{
 const app=createApp();await app.compare('current original','current revised');
 app.confirmed=false;await app.click('clear-history');
 assert.equal(saved(app.storage).length,1);
 app.confirmed=true;await app.click('clear-history');
 assert.equal(saved(app.storage).length,0);
 assert.equal(app.rows().length,0);
 assert.equal(app.element('original').value,'current original');
 assert.equal(app.element('revised').value,'current revised');
 assert.equal(app.element('history-empty').hidden,false);
});

test('oversized comparisons still render but are excluded from saved history',async()=>{
 const app=createApp();await app.compare('small','draft');
 await app.compare('x'.repeat(100001),'y'.repeat(100000));
 assert.equal(saved(app.storage).length,1);
 assert.equal(saved(app.storage)[0].original,'small');
 assert.equal(app.rows().length,1);
 assert.match(app.element('history-note').textContent,/too large/u);
 assert.equal(app.element('reading').textContent.length,200001);
});

test('history enforces the combined text budget on load and save',async()=>{
 const large=entry('x'.repeat(60000),'y'.repeat(60000));
 const app=createApp(createStorage([entry('z'.repeat(200001)),large,{...large,original:'a'.repeat(60000)},entry('small')]));
 assert.equal(app.rows().length,2);
 await app.compare('n'.repeat(50000),'m'.repeat(50000));
 const items=saved(app.storage);
 assert.equal(items.length,2);
 assert.equal(items[0].original.length,50000);
 assert.equal(items[1].original,'small');
 assert.ok(items.reduce((size,item)=>size+item.original.length+item.revised.length,0)<=200000);
 await app.compare('a'.repeat(100000),'b'.repeat(100000));
 assert.equal(saved(app.storage).length,1);
 assert.equal(saved(app.storage)[0].original.length+saved(app.storage)[0].revised.length,200000);
});

test('invalid history is handled and valid entries remain usable',async()=>{
 for(const invalid of ['{broken','{}']){
  const storage=createStorage();storage.data.set(historyKey,invalid);
  const app=createApp(storage);
  assert.equal(app.rows().length,0);
  assert.match(app.element('history-note').textContent,/could not be loaded/u);
  await app.compare('recovered','text');assert.equal(saved(storage).length,1);
 }
 const reloaded=createApp(createStorage([null,entry(42),{...entry('invalid date'),savedAt:1e300},entry('valid')]));
 assert.equal(reloaded.rows().length,1);
 assert.match(reloaded.element('history-note').textContent,/could not be read/u);
});

test('storage failures preserve saved history while comparisons and restores still work',async()=>{
 const storage=createStorage([entry('saved')]),app=createApp(storage);
 storage.setItem=()=>{throw new Error('quota');};
 await app.compare('new','text');
 assert.match(app.element('history-note').textContent,/could not be saved/u);
 assert.equal(saved(storage)[0].original,'saved');
 app.rows()[0].children[0].onclick();
 assert.equal(app.element('original').value,'saved');
 storage.removeItem=()=>{throw new Error('blocked');};
 await app.click('clear-history');
 assert.equal(app.rows().length,1);
 assert.equal(saved(storage).length,1);
 assert.match(app.element('history-note').textContent,/could not be saved/u);
 const blocked=createStorage();
 blocked.getItem=blocked.setItem=()=>{throw new Error('blocked');};
 const offline=createApp(blocked);
 assert.match(offline.element('history-note').textContent,/could not be loaded/u);
 await offline.compare('available','comparison');
 assert.ok(offline.element('reading').textContent.includes('comparison'));
 assert.equal(offline.rows().length,0);
 assert.match(offline.element('history-note').textContent,/could not be saved/u);
});
