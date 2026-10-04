import fs from 'node:fs';

const catalog=JSON.parse(fs.readFileSync('data/city-photo-catalog.json','utf8'));
const placeCandidates=JSON.parse(fs.readFileSync('data/place-candidates.json','utf8'));
const matchAlias=(value,alias)=>new RegExp(`(^|[^\\p{L}])${alias.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}($|[^\\p{L}])`,'iu').test(value);
const matchesPlace=(value,aliases)=>aliases.some(alias=>matchAlias(value,alias));

const allIds=new Set();
const cities=catalog.cities.map(city=>{
 const photos=city.decades.flatMap(row=>JSON.parse(fs.readFileSync(`public/city-photos/${city.city.toLowerCase()}-${row.decade}.json`,'utf8')));
 for(const photo of photos)allIds.add(photo.id);
 const groupCounts=Object.entries(photos.reduce((counts,photo)=>{counts[photo.group]=(counts[photo.group]||0)+1;return counts},{})).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
 const namedPlaces=placeCandidates[city.city].map(({name,aliases})=>{
  const titleMatches=photos.filter(photo=>matchesPlace(photo.title||'',aliases));
  const archiveMatches=photos.filter(photo=>matchesPlace([photo.title,photo.description,photo.location?.label].filter(Boolean).join(' '),aliases));
  return {name,count:archiveMatches.length,titleMatches:titleMatches.length,locationOnly:archiveMatches.length-titleMatches.length,visuallyReviewed:archiveMatches.filter(photo=>photo.reviewed).length};
 }).filter(place=>place.count>0).sort((a,b)=>b.titleMatches-a.titleMatches||b.count-a.count);
 return {city:city.city,total:photos.length,visuallyReviewed:photos.filter(photo=>photo.reviewed).length,unresolved:photos.filter(photo=>photo.group==='Uavklart motiv'||photo.group==='Flyfoto · uavklart motiv').length,unresolvedFlyPhotos:photos.filter(photo=>photo.group==='Flyfoto · uavklart motiv').length,sourceOnly:photos.filter(photo=>!photo.inlineReadable||!photo.image).length,groupCounts,namedPlaces};
});
const report={id:'city-coverage-audit-v2',catalogFetchedAt:catalog.fetchedAt,method:'Full opptelling av de lagrede katalogpostene for Sarpsborg og Fredrikstad før 2000. Gruppene er blanding av pilotgjennomgang og automatiske forslag fra arkivmetadata; ikke alle er visuelt bekreftet. Navngitte steder er navnetreff i arkivtittel eller steds-/beskrivelsesfelt, ikke verifisert motiv, historisk betydning eller GPS. Kategorier kan overlappe.',total:cities.reduce((n,city)=>n+city.total,0),uniquePhotos:allIds.size,visuallyReviewed:cities.reduce((n,city)=>n+city.visuallyReviewed,0),unresolved:cities.reduce((n,city)=>n+city.unresolved,0),cities};
fs.writeFileSync('data/city-coverage-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,visuallyReviewed:report.visuallyReviewed,unresolved:report.unresolved,cities:cities.map(city=>({city:city.city,total:city.total,visuallyReviewed:city.visuallyReviewed,unresolved:city.unresolved,namedPlaces:city.namedPlaces}))},null,2));
