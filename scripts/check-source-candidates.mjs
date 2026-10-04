import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const report=read('data/source-coverage-report.json');
for(const row of report.cities){
 const catalog=read(`data/source-candidates/${row.city.toLowerCase()}.json`);
 assert.equal(catalog.city,row.city);
 assert.equal(catalog.records.length,row.candidateCounts.exactSourceIdUnique);
 assert.equal(new Set(catalog.records.map(item=>item.workKey)).size,catalog.records.length);
 assert.equal(catalog.records.reduce((sum,item)=>sum+item.occurrences.length,0),row.candidateCounts.sourceOccurrences);
 assert.equal(catalog.records.filter(item=>item.knownInPhotoCatalog).length,row.candidateCounts.knownInExistingNbPhotoCatalog);
 for(const item of catalog.records){
  assert.ok(item.workKey&&item.occurrences.length);
  for(const occurrence of item.occurrences){
   assert.ok(occurrence.source&&occurrence.sourceId&&occurrence.url);
   if(occurrence.source==='Europeana'&&item.workKey.startsWith('dimu:'))assert.match(occurrence.originUrl,/digitaltmuseum/);
  }
 }
}
console.log('Kildekandidatene stemmer med dekningstallene for begge byer.');
