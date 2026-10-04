import fs from 'node:fs';

const read=(file)=>JSON.parse(fs.readFileSync(file,'utf8'));
const sourcePath='data/source-harvest/';
const cities=['Sarpsborg','Fredrikstad'];
const photoCatalog=read('data/city-photo-catalog.json');
const existingPhotos=new Map(photoCatalog.cities.flatMap(city=>city.decades.flatMap(decade=>read(`public/city-photos/${city.city.toLowerCase()}-${decade.decade}.json`).map(photo=>[photo.id,photo]))));
const existingIds=new Set(existingPhotos.keys());
const result={createdAt:new Date().toISOString(),method:'Katalogkandidater fra lokale søkeuttrekk. Eksakt kilde-ID kobler Europeana til originalen der dette er mulig. Andre visuelle dubletter, faktisk motiv, rettigheter og avisartikler er ikke kontrollert.',cities:[]};

function sourceKey(url){
 if(!url)return null;
 try{
  const parsed=new URL(url);
  const host=parsed.hostname.toLowerCase();
  const parts=parsed.pathname.split('/').filter(Boolean);
  if(host==='digitaltmuseum.no'||host==='digitaltmuseum.org'||host==='digitaltmuseum.se'){
   const id=parts.find(part=>/^\d{8,}$/.test(part));
   if(id)return `dimu:${id}`;
  }
  if(host==='nb.no'||host==='www.nb.no'){
   const index=parts.indexOf('items');
   if(index>=0&&parts[index+1])return `nb:${parts[index+1].toLowerCase()}`;
  }
 }catch{}
 return null;
}

for(const city of cities){
 const slug=city.toLowerCase();
 const nbPhotos=read(`${sourcePath}${slug}-nb-photos-title.json`);
 const nbBooks=read(`${sourcePath}${slug}-nb-books.json`);
 const nbMaps=read(`${sourcePath}${slug}-nb-maps.json`);
 const dm=read(`${sourcePath}${slug}-digitaltmuseum.json`);
 const heritage=read(`${sourcePath}${slug}-kulturminnesok.json`);
 const commons=read(`${sourcePath}${slug}-commons.json`);
 const placeNames=read(`${sourcePath}${slug}-kartverket-names.json`);
 const euroTitle=read(`${sourcePath}europeana-proxy-dc-title-${slug}.json`);
 const euroBroad=read(`${sourcePath}europeana-${slug}.json`);
 const harvest=read(`${sourcePath}${slug}-summary.json`);
 const records=[];
 const add=(source,items,map)=>{for(const item of items){const row=map(item);if(row)records.push({city,source,...row})}};
 add('Nasjonalbiblioteket',nbPhotos,item=>({workKey:`nb:${item.id}`,sourceId:item.id,type:'photo',title:item.title,year:item.year,url:item.url,matchBasis:`${city} i bildets katalogtittel`,rights:existingPhotos.get(item.id)?.rights||null,mediaAvailable:existingPhotos.has(item.id)?Boolean(existingPhotos.get(item.id).image):null,place:existingPhotos.get(item.id)?.location?.label||null}));
 add('Nasjonalbiblioteket',nbBooks,item=>({workKey:`nb:${item.id}`,sourceId:item.id,type:'book',title:item.title,year:item.year,url:item.url,matchBasis:'Byen i katalogtittel eller emne',rights:null}));
 add('Nasjonalbiblioteket',nbMaps,item=>({workKey:`nb:${item.id}`,sourceId:item.id,type:'map',title:item.title,year:item.year,url:item.url,matchBasis:'Byen i kartets katalogtittel',rights:null}));
 add('DigitaltMuseum',dm,item=>({workKey:`dimu:${item.id}`,sourceId:item.id,type:item.type==='Photograph'?'photo':item.type==='Fineart'?'art':'object',title:item.title,year:item.year,url:item.url,matchBasis:'Utvalg fra bredt søk',rights:item.license,place:item.place||null,mediaAvailable:Boolean(item.image)}));
 add('Kulturminnesøk',heritage,item=>({workKey:`heritage:${item.id}`,sourceId:item.id,type:'heritage',title:item.title,year:null,url:item.url,matchBasis:'Registrert i kommunen; fotografisk motiv er ikke bekreftet',rights:item.images.map(image=>image.license).filter(Boolean),place:item.municipality,coordinates:item.coordinates,imageCount:item.images.length}));
 add('Wikimedia Commons',commons,item=>({workKey:`commons:${item.id}`,sourceId:String(item.id),type:'image',title:item.title,year:null,url:item.url,matchBasis:'Byen i søket mot filnavn; avbildet sted uavklart',rights:null}));
 add('Europeana',euroTitle.records,item=>({workKey:sourceKey(item.sourceUrl)||`europeana:${item.id}`,sourceId:item.id,type:item.type==='IMAGE'?'image':String(item.type||'other').toLowerCase(),title:item.title,year:item.year,url:item.europeanaUrl,originUrl:item.sourceUrl,matchBasis:'Byen i Europeana-tittel; avbildet sted uavklart',rights:item.rights,mediaAvailable:Boolean(item.preview)}));

 const works=new Map();
 for(const record of records){
  if(!works.has(record.workKey))works.set(record.workKey,{workKey:record.workKey,city,type:record.type,title:record.title,year:record.year,knownInPhotoCatalog:record.workKey.startsWith('nb:')&&existingIds.has(record.workKey.slice(3)),occurrences:[]});
  works.get(record.workKey).occurrences.push({source:record.source,sourceId:record.sourceId,url:record.url,originUrl:record.originUrl||null,rights:record.rights,matchBasis:record.matchBasis,mediaAvailable:record.mediaAvailable??null,imageCount:record.imageCount??null,place:record.place??null,coordinates:record.coordinates??null});
 }
 const candidates=[...works.values()].sort((a,b)=>a.workKey.localeCompare(b.workKey));
 const overlaps=candidates.filter(work=>work.occurrences.length>1);
 const europeanaLinkedToDigitaltMuseum=euroTitle.records.filter(item=>sourceKey(item.sourceUrl)?.startsWith('dimu:')).length;
 const europeanDmuInLocalSample=euroTitle.records.filter(item=>{const key=sourceKey(item.sourceUrl);return key?.startsWith('dimu:')&&dm.some(record=>key===`dimu:${record.id}`)}).length;
 const cityReport={city,sourceCounts:{
  existingNbPhotoCatalog:photoCatalog.cities.find(item=>item.city===city)?.items||0,
  nbTitlePhotos:nbPhotos.length,nbBooks:nbBooks.length,nbMaps:nbMaps.length,
  digitaltMuseumReportedPhotographs:harvest.sources.digitaltmuseum.counts.photographs.reported,
  digitaltMuseumSampledPhotos:dm.filter(item=>item.type==='Photograph').length,
  digitaltMuseumReportedArt:harvest.sources.digitaltmuseum.counts.fineart.reported,
  digitaltMuseumSampledArt:dm.filter(item=>item.type==='Fineart').length,
  kulturminnesokRecords:heritage.length,
  kulturminnesokWithImages:heritage.filter(item=>item.images.length).length,
  commonsFileSearchHits:commons.length,europeanaBroadHits:euroBroad.saved,
  europeanaTitleHits:euroTitle.saved,europeanaTitleLinksToDigitaltMuseum:europeanaLinkedToDigitaltMuseum,
  kartverketPlaceNames:placeNames.length
 },candidateCounts:{
  sourceOccurrences:records.length,exactSourceIdUnique:candidates.length,
  knownInExistingNbPhotoCatalog:candidates.filter(item=>item.knownInPhotoCatalog).length,
  exactIdOverlapGroups:overlaps.length,
  otherCandidateRecords:candidates.filter(item=>!item.knownInPhotoCatalog).length
 },notes:[
  'Andre kandidater er ikke det samme som nye unike bilder: bøker, kart, kulturminner, usikre motiv og uoppdagede visuelle dubletter er inkludert.',
  'DigitaltMuseum-tallet er antall rapporterte søkeresultater; demo-tilgangen ga bare et utvalg av postene.',
  'Europeanas brede søk brukes bare til dekningstall på grunn av mange indirekte treff. Bare titteltreff er med som katalogkandidater.',
  'Europeana-titteltreff som peker til DigitaltMuseum og finnes i DigitaltMuseum-utvalget: '+europeanDmuInLocalSample+'.'
 ]};
 fs.mkdirSync('data/source-candidates',{recursive:true});
 fs.writeFileSync(`data/source-candidates/${slug}.json`,JSON.stringify({city,method:result.method,records:candidates})+'\n');
 result.cities.push(cityReport);
}
fs.writeFileSync('data/source-coverage-report.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result.cities.map(city=>({city:city.city,...city.sourceCounts,...city.candidateCounts})),null,2));
