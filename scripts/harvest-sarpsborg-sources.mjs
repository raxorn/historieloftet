import fs from 'node:fs';
import path from 'node:path';
const cityArg=process.argv.indexOf('--city');
const city=cityArg<0?'Sarpsborg':process.argv[cityArg+1];
if(!['Sarpsborg','Fredrikstad'].includes(city))throw Error('Bruk --city Sarpsborg eller --city Fredrikstad');
const slug=city.toLocaleLowerCase('nb-NO');

const destination='data/source-harvest';
fs.mkdirSync(destination,{recursive:true});
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function getJson(url){
 for(let attempt=0;attempt<4;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000),headers:{'User-Agent':'Historieloftet/0.1 (Sarpsborg source research)'}});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   return await response.json();
  }catch(error){if(attempt===3)throw error;await pause(500*(attempt+1))}
 }
}
async function pages(total,pageSize,load){
 const result=[];
 for(let start=0;start<total;start+=pageSize){
  const batch=await load(start,pageSize);
  if(!batch.length)break;
  result.push(...batch);
  if(start>0&&start%(pageSize*20)===0)console.error(`Fetched ${result.length}/${total}`);
 }
 return result;
}
function save(name,records){fs.writeFileSync(path.join(destination,`${slug}-${name}.json`),JSON.stringify(records)+'\n');console.error(`${city} ${name}: ${records.length} saved`)}

async function digitaltMuseum(){
 const apiKey=process.env.DIMU_API_KEY||'demo';
 const demo=apiKey==='demo';
 const queries=[['photographs','Photograph'],['fineart','Fineart'],['architecture','Architecture'],['buildings','Building']];
 const all=[];const counts={};
 for(const [label,type] of queries){
  const makeUrl=(start,rows)=>{const url=new URL('https://api.dimu.org/api/solr/select');url.searchParams.set('q',city);url.searchParams.set('fq',`artifact.type:${type}`);url.searchParams.set('wt','json');url.searchParams.set('rows',String(rows));url.searchParams.set('start',String(start));url.searchParams.set('api.key',apiKey);return url};
  const first=await getJson(makeUrl(0,1));const total=first.response?.numFound||0;
  // Demo responses contain at most ten records. Sample at 100-record intervals;
  // with a full key, traverse every page instead.
  const records=await pages(total,100,async(start,size)=>{
   const body=await getJson(makeUrl(start,demo?10:size));
   return (body.response?.docs||[]).map(doc=>({id:doc['artifact.uniqueId']||`${doc['identifier.owner']}:${doc['identifier.id']}`,owner:doc['identifier.owner'],type:doc['artifact.type'],title:doc['artifact.ingress.title']||'',year:doc['artifact.ingress.production.fromYear']||null,place:doc['artifact.ingress.production.place']||'',subjects:doc['artifact.ingress.subjects']||[],coordinate:doc['artifact.coordinate']||null,license:doc['artifact.ingress.license']||[],image:doc['artifact.defaultMediaIdentifier']?`https://ems.dimu.org/image/${doc['artifact.defaultMediaIdentifier']}?dimension=800x800`:null,url:`https://digitaltmuseum.no/${doc['artifact.uniqueId']||''}`}));
  });
  counts[label]={reported:total,saved:records.length,mode:demo?'sampled':'full'};all.push(...records);
 }
 const unique=[...new Map(all.map(row=>[row.id,row])).values()];save('digitaltmuseum',unique);return {counts,totalUnique:unique.length};
}

async function nationalLibrary(){
 const queries=[['photos_title','bilder',`title:${city}`],['books_title','bøker',`title:${city}`],['books_subject','bøker',`subject:${city}`],['maps_title','kart',`title:${city}`]];
 const out={};const counts={};
 for(const [label,media,q] of queries){
  const makeUrl=(page,size)=>{const url=new URL('https://api.nb.no/catalog/v1/items');url.searchParams.set('q',q);url.searchParams.set('size',String(size));url.searchParams.set('page',String(page));url.searchParams.append('filter',`mediatype:${media}`);return url};
  const first=await getJson(makeUrl(0,1));const total=first.page?.totalElements||0;
  const records=await pages(total,50,async(start,size)=>{
   const body=await getJson(makeUrl(start/size,size));
   return (body._embedded?.items||[]).map(item=>({id:item.id,title:item.metadata?.title||'',year:item.metadata?.originInfo?.issued||item.metadata?.dateCreated||null,media,url:`https://www.nb.no/items/${item.id}`}));
  });
  counts[label]={reported:total,saved:records.length};out[label]=records;
 }
 const books=[...new Map([...out.books_title,...out.books_subject].map(row=>[row.id,row])).values()];
 save('nb-books',books);save('nb-maps',out.maps_title);save('nb-photos-title',out.photos_title);
 return {counts,uniqueBooks:books.length};
}

async function culturalHeritage(){
 const makeUrl=offset=>{const url=new URL('https://api.ra.no/brukerminner/collections/brukerminner/items');url.searchParams.set('f','json');url.searchParams.set('limit','1000');url.searchParams.set('offset',String(offset));url.searchParams.set('filter',`kommune='${city}'`);return url};
 const first=await getJson(makeUrl(0));const total=first.numberMatched||0;
 const features=[...first.features];
 for(let offset=features.length;offset<total;offset+=1000){const body=await getJson(makeUrl(offset));features.push(...body.features);if(!body.features.length)break}
 const records=[...new Map(features.map(item=>[item.id,{id:item.id,title:item.properties?.tittel||'',description:item.properties?.beskrivelse||'',municipality:item.properties?.kommune||'',coordinates:item.geometry?.coordinates||null,images:(item.properties?.bilder||[]).map(image=>({url:image.url,license:image.lisens,credit:image.fotograf})),url:item.properties?.linkkulturminnesok||''}])).values()].filter(item=>item.municipality===city);
 save('kulturminnesok',records);return {reported:total,saved:records.length,withImages:records.filter(item=>item.images.length).length};
}

async function commons(){
 const records=[];let offset=0,total=0;
 while(true){
  const url=new URL('https://commons.wikimedia.org/w/api.php');url.searchParams.set('action','query');url.searchParams.set('list','search');url.searchParams.set('srsearch',city);url.searchParams.set('srnamespace','6');url.searchParams.set('srlimit','500');url.searchParams.set('sroffset',String(offset));url.searchParams.set('format','json');
  const body=await getJson(url);total=body.query?.searchinfo?.totalhits||total;
  const batch=(body.query?.search||[]).map(item=>({id:item.pageid,title:item.title,url:`https://commons.wikimedia.org/wiki/${encodeURIComponent(item.title.replaceAll(' ','_'))}`}));
  records.push(...batch);offset+=batch.length;if(!body.continue||!batch.length)break;
 }
 save('commons',records);return {reported:total,saved:records.length};
}

const summary={fetchedAt:new Date().toISOString(),scope:`${city}; metadata only, no media files downloaded. Search result does not prove that a work depicts the city.`,sources:{}};
for(const [name,task] of [['digitaltmuseum',digitaltMuseum],['nb',nationalLibrary],['kulturminnesok',culturalHeritage],['commons',commons]]){
 try{summary.sources[name]=await task()}catch(error){summary.sources[name]={error:String(error)};console.error(`${name}: ${error}`)}
 fs.writeFileSync(path.join(destination,`${slug}-summary.json`),JSON.stringify(summary,null,2)+'\n');
}
console.log(JSON.stringify(summary));
