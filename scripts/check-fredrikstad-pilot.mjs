import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data/fredrikstad-pilot.json','utf8'));
const sarpsborg=JSON.parse(fs.readFileSync('data/sarpsborg-pilot.json','utf8'));
assert.equal(data.items.length,200);
assert.equal(new Set(data.items.map(x=>x.id)).size,200);
assert.equal(new Set(data.items.map(x=>x.pilotNumber)).size,200);
const prior=new Set(sarpsborg.items.map(x=>x.id));
for(const x of data.items){
 assert.ok(!prior.has(x.id),`Already in Sarpsborg pilot: ${x.id}`);
 assert.ok(x.sortYear>=1920&&x.sortYear<=1929);
 assert.ok(!/_bak\]?$/i.test(x.title),`Back of photo selected: ${x.title}`);
 assert.ok(x.image&&x.open&&x.inlineReadable);
 assert.ok(x.reviewed&&x.group&&x.metadataGroup&&x.subgroup&&x.visualNote&&x.groupBasis);
 assert.equal(x.location.lat,null);assert.equal(x.location.lon,null);
}
const byNumber=n=>data.items.find(x=>x.pilotNumber===n);
assert.equal(byNumber(1).group,'Kirkeinteriør');
assert.equal(byNumber(5).group,'Kirkeinventar og detaljer');
assert.equal(byNumber(144).group,'Industri og fabrikker');
assert.equal(byNumber(197).group,'Havn og fartøy');
assert.ok(data.items.filter(x=>x.needsReview).length>0);
console.log('200 new Fredrikstad photos, distinct from Sarpsborg, with dated fronts and reviewed groups.');
