const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {runInNewContext}=require('node:vm');

// Exercise the actual diff code while keeping index.html usable as one offline file.
const html=readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const source=html.slice(html.indexOf('const tokenize='),html.indexOf('const words='));
const diff=runInNewContext(`${source}\ndiff`);
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
 const drafts=['','same','old words','new phrase',' a  b\tç!\r\nnext line\n',' a  d\té?\r\nnew row\n','你好 世界 👋','你好 地球 🌎','<script>alert("text")</script>'];
 for(const original of drafts)for(const revised of drafts)assertDrafts(original,revised);
});

test('mixed insertions and deletions preserve both drafts',()=>{
 let seed=42;
 const tokens=['one','two','three',' ','  ','\t','\n','\r\n','é','!'];
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
