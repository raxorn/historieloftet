import fs from 'node:fs';

const audit=JSON.parse(fs.readFileSync('data/city-coverage-report.json','utf8'));
const selected={Sarpsborg:['Hafslund','Borregaard','Sarpsfossen','Borgarsyssel'],Fredrikstad:['Gamlebyen','Kongsten','Kråkerøy','Fredrikstad domkirke']};
const topics=audit.cities.flatMap(city=>city.namedPlaces.filter(place=>selected[city.city].includes(place.name)).map(place=>({city:city.city,name:place.name,photos:place.count})));

async function search(name,media){
 const url=new URL('https://api.nb.no/catalog/v1/items');
 url.searchParams.set('q',media==='bøker'?`title:"${name}"`:`"${name}"`);
 url.searchParams.append('filter','mediatype:'+media);
 if(media==='aviser')url.searchParams.append('filter','year:[1800 TO 1999]');
 url.searchParams.set('size',media==='bøker'?'30':'1');
 for(let attempt=0;attempt<3;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000),headers:{Accept:'application/json'}});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   return await response.json();
  }catch(error){if(attempt===2)throw Error(`${name} ${media}: ${error.message}`);await new Promise(resolve=>setTimeout(resolve,1000*(attempt+1)))}
 }
}

const results=[];
for(const topic of topics){
 const [books,newspapers]=await Promise.all([search(topic.name,'bøker'),search(topic.name,'aviser')]);
 const candidates=(books._embedded?.items||[]).filter(item=>String(item.metadata?.title||'').toLocaleLowerCase('nb-NO').includes(topic.name.toLocaleLowerCase('nb-NO'))).slice(0,8).map(item=>({id:item.id,title:item.metadata.title,year:String(item.metadata?.originInfo?.issued||item.metadata?.dateCreated||''),url:`https://www.nb.no/items/${item.id}`,evidence:'Navnet finnes i katalogtittelen. Innholdet og koblingen til enkeltbilder er ikke kontrollert.'}));
 const row={...topic,bookTitleHits:books.page?.totalElements??null,bookExamples:candidates,newspaperSearchHits:newspapers.page?.totalElements??null,bookSearchUrl:`https://www.nb.no/search?mediatype=bøker&q=${encodeURIComponent(topic.name)}`,newspaperSearchUrl:`https://www.nb.no/search?mediatype=aviser&q=${encodeURIComponent(topic.name)}`};
 results.push(row);
 console.error(JSON.stringify({city:topic.city,name:topic.name,photos:topic.photos,bookTitleHits:row.bookTitleHits,newspaperSearchHits:row.newspaperSearchHits,bookExamples:candidates.length}));
}
const output={id:'topic-source-discovery-v1',fetchedAt:new Date().toISOString(),method:'Stikkprøve i Nasjonalbibliotekets åpne katalog for åtte navngitte steder. Boktall er søketreff med navnet i tittelen; utvalgte katalogposter er ikke innholdskontrollert. Avistall er søketreff i avisutgaver fra 1800–1999 og er verken antall artikler eller bekreftede forbindelser til fotografier. Søkene dekker ett navneoppslag per sted og kan mangle stavevarianter. Ingen avisutgaver er automatisk knyttet til enkeltbilder.',topics:results};
fs.writeFileSync('data/topic-source-discovery.json',JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({topics:results.length,output:'data/topic-source-discovery.json'}));
