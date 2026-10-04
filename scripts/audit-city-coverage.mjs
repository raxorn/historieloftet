import fs from 'node:fs';

const catalog=JSON.parse(fs.readFileSync('data/city-photo-catalog.json','utf8'));
const placeTerms={
 Sarpsborg:[['Hafslund',/\bhafslund\b/i],['Borregaard',/\b(?:borregaard|borregård|borggaard)\b/i],['Sarpsfossen',/\b(?:sarpfoss|sarpsfoss|sarpefoss)(?:en)?\b/i],['Kulås',/\bkulås\b/i],['Borgarsyssel',/\bborgarsyssel\b/i]],
 Fredrikstad:[['Gamlebyen',/\bgamlebyen\b/i],['Kongsten',/\bkongsten\b/i],['Kråkerøy',/\bkråkerøy\b/i],['Fredrikstad domkirke',/\bfredrikstad domkirke\b/i]]
};

const allIds=new Set();
const cities=catalog.cities.map(city=>{
 const photos=city.decades.flatMap(row=>JSON.parse(fs.readFileSync(`public/city-photos/${city.city.toLowerCase()}-${row.decade}.json`,'utf8')));
 for(const photo of photos)allIds.add(photo.id);
 const groupCounts=Object.entries(photos.reduce((counts,photo)=>{counts[photo.group]=(counts[photo.group]||0)+1;return counts},{})).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
 const namedPlaces=placeTerms[city.city].map(([name,pattern])=>{
  const matches=photos.filter(photo=>pattern.test([photo.title,photo.description,photo.location?.label,...(photo.facts||[]).map(fact=>fact.value)].filter(Boolean).join(' ')));
  return {name,count:matches.length,visuallyReviewed:matches.filter(photo=>photo.reviewed).length};
 });
 return {city:city.city,total:photos.length,visuallyReviewed:photos.filter(photo=>photo.reviewed).length,unresolved:photos.filter(photo=>photo.group==='Uavklart motiv'||photo.group==='Flyfoto · uavklart motiv').length,unresolvedFlyPhotos:photos.filter(photo=>photo.group==='Flyfoto · uavklart motiv').length,sourceOnly:photos.filter(photo=>!photo.inlineReadable||!photo.image).length,groupCounts,namedPlaces};
});
const report={id:'city-coverage-audit-v1',catalogFetchedAt:catalog.fetchedAt,method:'Full opptelling av de lagrede katalogpostene for Sarpsborg og Fredrikstad før 2000. Gruppene er blanding av pilotgjennomgang og automatiske forslag fra arkivmetadata; ikke alle er visuelt bekreftet. Navngitte steder er teksttreff i arkivopplysninger, ikke verifisert GPS eller motiv.',total:cities.reduce((n,city)=>n+city.total,0),uniquePhotos:allIds.size,visuallyReviewed:cities.reduce((n,city)=>n+city.visuallyReviewed,0),unresolved:cities.reduce((n,city)=>n+city.unresolved,0),cities};
fs.writeFileSync('data/city-coverage-report.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({total:report.total,visuallyReviewed:report.visuallyReviewed,unresolved:report.unresolved,cities:cities.map(city=>({city:city.city,total:city.total,visuallyReviewed:city.visuallyReviewed,unresolved:city.unresolved,namedPlaces:city.namedPlaces}))},null,2));
