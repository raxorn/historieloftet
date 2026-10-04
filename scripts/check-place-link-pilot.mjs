import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const report=read('data/place-link-pilot/report.json');
const places=read('data/place-candidates.json');
const normalize=value=>String(value||'').toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const contains=(text,alias)=>` ${normalize(text)} `.includes(` ${normalize(alias)} `);
const allKeys=new Set();
for(const summary of report.cities){
 const data=read(`data/place-link-pilot/${summary.city.toLowerCase()}.json`);
 assert.equal(data.city,summary.city);
 assert.equal(data.items.length,200);
 assert.equal(data.items.filter(item=>item.source==='Nasjonalbiblioteket').length,100);
 assert.equal(data.items.filter(item=>item.source==='DigitaltMuseum').length,100);
 assert.equal(data.items.filter(item=>item.matches.length).length,summary.withPlaceSuggestion);
 const prior=new Set([...read(`data/${summary.city.toLowerCase()}-pilot.json`).items.map(item=>item.id),...(summary.city==='Sarpsborg'?read('data/sarpsborg-1000.json').items.map(item=>item.id):[])]);
 const dmTitles=new Map();
 for(const item of data.items){
  assert.ok(!allKeys.has(item.key),`duplicate source ID ${item.key}`);
  allKeys.add(item.key);
  assert.ok(item.image&&item.url&&item.year<=2000);
  if(item.source==='Nasjonalbiblioteket')assert.ok(!prior.has(item.sourceId),`previous NB pilot record ${item.sourceId}`);
  if(item.source==='DigitaltMuseum'){
   assert.ok(contains(item.title,summary.city)||places[summary.city].some(place=>place.aliases.some(alias=>contains(item.title,alias))),`unrelated DigitaltMuseum title ${item.title}`);
   const title=normalize(item.title);dmTitles.set(title,(dmTitles.get(title)||0)+1);
   assert.ok(dmTitles.get(title)<=2,`repeated DigitaltMuseum title ${item.title}`);
  }
  assert.equal(item.reviewStatus,'needs-human-review');
  for(const match of item.matches){
   assert.ok(match.evidence.length);
   assert.ok(['high','medium','low'].includes(match.confidence));
  }
 }
 for(const group of data.relatedSources){
  for(const record of group.records){assert.ok(['book','article'].includes(record.type));assert.ok(record.url)}
 }
}
assert.equal(allKeys.size,400);
console.log('400 nye, unike pilotbilder med sporbare forslag og uten tidligere NB-pilotbilder.');
