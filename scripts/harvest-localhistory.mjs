import fs from 'node:fs';

const cities=['Sarpsborg','Fredrikstad'];
for(const city of cities){
 const records=[];
 let offset=0;
 let total=0;
 do{
  const url=new URL('https://lokalhistoriewiki.no/api.php');
  url.search=new URLSearchParams({action:'query',list:'search',srsearch:`intitle:${city}`,srlimit:'100',sroffset:String(offset),format:'json',formatversion:'2'}).toString();
  const response=await fetch(url,{headers:{'User-Agent':'Historieloftet/1.0 (historieloftet source discovery)'}});
  if(!response.ok)throw new Error(`${city}: ${response.status}`);
  const data=await response.json();
  if(data.error)throw new Error(`${city}: ${JSON.stringify(data.error)}`);
  total=data.query.searchinfo.totalhits;
  for(const item of data.query.search)records.push({pageId:item.pageid,title:item.title,url:`https://lokalhistoriewiki.no/wiki/${encodeURIComponent(item.title.replaceAll(' ','_'))}`,matchBasis:`Lokalhistoriewiki-søk intitle:${city}; stedstilknytning er ikke kontrollert`});
  offset=data.continue?.sroffset??total;
 }while(offset<total);
 const path=`data/source-harvest/${city.toLowerCase()}-lokalhistoriewiki.json`;
 fs.writeFileSync(path,JSON.stringify({city,query:`intitle:${city}`,reportedHits:total,records},null,2)+'\n');
 console.log(`${city}: ${records.length} av ${total} oppslag lagret i ${path}`);
}
