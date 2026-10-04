import assert from 'node:assert/strict';
import fs from 'node:fs';
const data=JSON.parse(fs.readFileSync('data/sarpsborg-pilot.json'));
assert.equal(data.items.length,200);
assert.equal(new Set(data.items.map(x=>x.id)).size,200);
assert.equal(new Set(data.items.map(x=>x.pilotNumber)).size,200);
for(const x of data.items){assert.ok(x.sortYear>=1920&&x.sortYear<=1929);assert.ok(x.location.label.includes('Sarpsborg'));assert.ok(x.image&&x.open&&x.inlineReadable);assert.ok(x.reviewed&&x.visualNote&&x.groupBasis);assert.equal(x.location.lat,null);assert.equal(x.location.lon,null)}
// The actual content must distinguish exterior, room, and isolated object photos of the same church.
const find=n=>data.items.find(x=>x.pilotNumber===n);
assert.equal(find(5).group,'Kirker utvendig');
assert.equal(find(16).group,'Kirkeinteriør');
assert.equal(find(17).group,'Kirkeinventar og detaljer');
assert.equal(find(5).metadataGroup,find(16).metadataGroup);
assert.equal(find(126).group,'Uavklart motiv');
assert.equal(find(126).needsReview,true);
console.log('200 unique Sarpsborg photos, decade, source availability, provenance and visual distinctions verified.');
