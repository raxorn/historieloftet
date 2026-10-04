import fs from 'node:fs';

const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const authority=read('data/place-candidates.json');
const cityCatalog=read('data/city-photo-catalog.json');
const normalize=value=>String(value||'').toLocaleLowerCase('nb-NO').normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
const contains=(text,alias)=>` ${normalize(text)} `.includes(` ${normalize(alias)} `);
const usedAcrossCities=new Set();
const result={createdAt:new Date().toISOString(),method:'Automatiske forslag fra arkivmetadata. Ingen visuell modell eller uavhengig manuell kontroll av dette utvalget er kjørt. Høy sikkerhet betyr at flere metadatafelt støtter samme sted, ikke at fotografiet visuelt er stedfestet.',selection:'100 nye NB-bilder og 100 bilder fra DigitaltMuseum per by, spredt over daterte tiår. NB-bilder i tidligere 200/1000-piloter er utelatt. Utvalget er ikke statistisk representativt.',cities:[]};

function sampleAcrossDecades(input,count){
 const buckets=new Map();
 for(const item of input){const decade=Math.floor(item.year/10)*10;if(!buckets.has(decade))buckets.set(decade,[]);buckets.get(decade).push(item)}
 for(const bucket of buckets.values())bucket.sort((a,b)=>a.key.localeCompare(b.key));
 const decades=[...buckets.keys()].sort((a,b)=>a-b);
 const selected=[];let index=0;
 while(selected.length<count&&decades.length){
  const decade=decades[index%decades.length];
  const bucket=buckets.get(decade);
  const position=Math.floor(bucket.length/2);
  selected.push(bucket.splice(position,1)[0]);
  if(!bucket.length)decades.splice(index%decades.length,1);else index++;
 }
 if(selected.length<count)throw Error(`Only ${selected.length} eligible records`);
 return selected.sort((a,b)=>a.year-b.year||a.key.localeCompare(b.key));
}

for(const city of ['Sarpsborg','Fredrikstad']){
 const slug=city.toLowerCase();
 const prior=new Set([
  ...read(`data/${slug}-pilot.json`).items.map(item=>item.id),
  ...(city==='Sarpsborg'?read('data/sarpsborg-1000.json').items.map(item=>item.id):[])
 ]);
 const cityInfo=cityCatalog.cities.find(item=>item.city===city);
 const nb=cityInfo.decades.flatMap(({decade})=>read(`public/city-photos/${slug}-${decade}.json`))
  .filter(item=>item.image&&item.inlineReadable&&!prior.has(item.id)&&Number.isInteger(item.sortYear)&&item.sortYear<=2000)
  .map(item=>({key:`nb:${item.id}`,source:'Nasjonalbiblioteket',sourceId:item.id,title:item.title,year:item.sortYear,image:item.image,url:item.url,place:item.facts?.find(fact=>fact.label==='Sted')?.value||'',subjects:[],rights:item.rights||null,coordinate:null}));
 const dm=read(`data/source-harvest/${slug}-digitaltmuseum.json`)
  .filter(item=>item.type==='Photograph'&&item.image&&Number.isInteger(item.year)&&item.year<=2000)
  .map(item=>({key:`dimu:${item.id}`,source:'DigitaltMuseum',sourceId:item.id,title:item.title,year:item.year,image:item.image,url:item.url,place:item.place||'',subjects:item.subjects||[],rights:item.license||[],coordinate:item.coordinate||null}));
 const chosen=[...sampleAcrossDecades(nb,100),...sampleAcrossDecades(dm,100)].sort((a,b)=>a.year-b.year||a.key.localeCompare(b.key));
 const items=chosen.map(item=>{
  if(usedAcrossCities.has(item.key))throw Error(`Same source record selected for both cities: ${item.key}`);
  usedAcrossCities.add(item.key);
  const matches=authority[city].flatMap(place=>{
   const evidence=[];
   for(const alias of place.aliases){
    if(contains(item.title.slice(0,160),alias)&&!evidence.some(e=>e.field==='title'))evidence.push({field:'title',value:alias});
    else if(!contains(item.title.slice(0,160),alias)&&contains(item.title,alias)&&!evidence.some(e=>e.field==='description'))evidence.push({field:'description',value:alias});
    if(contains(item.place,alias)&&!evidence.some(e=>e.field==='place'))evidence.push({field:'place',value:alias});
    if(item.subjects.some(subject=>contains(subject,alias))&&!evidence.some(e=>e.field==='subject'))evidence.push({field:'subject',value:alias});
   }
   if(!evidence.length)return [];
   const title=evidence.some(e=>e.field==='title');
   return [{place:place.name,confidence:title&&evidence.length>1?'high':title?'medium':'low',evidence}];
  }).sort((a,b)=>({high:0,medium:1,low:2}[a.confidence]-{high:0,medium:1,low:2}[b.confidence])||a.place.localeCompare(b.place,'nb'));
  return {...item,city,matches,reviewStatus:'needs-human-review',coordinateStatus:item.coordinate?'Arkivets koordinat; posisjon for motivet ikke kontrollert':'Ikke koordinatfestet'};
 });
 const candidateCatalog=read(`data/source-candidates/${slug}.json`).records;
 const relatedSources=authority[city].map(place=>({place:place.name,records:candidateCatalog.filter(record=>['book','article'].includes(record.type)&&place.aliases.some(alias=>contains(record.title,alias))).map(record=>({key:record.workKey,type:record.type,title:record.title,year:record.year,url:record.occurrences[0].url,relation:'Stedsnavnet står i katalog- eller artikkeltittelen; omtale av et bestemt bilde er ikke kontrollert.'}))}));
 const summary={city,selected:items.length,bySource:{Nasjonalbiblioteket:100,DigitaltMuseum:100},withPlaceSuggestion:items.filter(item=>item.matches.length).length,withoutPlaceSuggestion:items.filter(item=>!item.matches.length).length,highMetadataEvidence:items.filter(item=>item.matches.some(match=>match.confidence==='high')).length,mediumMetadataEvidence:items.filter(item=>item.matches.some(match=>match.confidence==='medium')).length,lowMetadataEvidence:items.filter(item=>item.matches.some(match=>match.confidence==='low')).length,withSourceCoordinate:items.filter(item=>item.coordinate).length};
 fs.mkdirSync('data/place-link-pilot',{recursive:true});
 fs.writeFileSync(`data/place-link-pilot/${slug}.json`,JSON.stringify({city,summary,items,relatedSources})+'\n');
 result.cities.push(summary);
}
fs.writeFileSync('data/place-link-pilot/report.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.cities,null,2));
