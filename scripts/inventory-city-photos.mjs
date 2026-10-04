import fs from 'node:fs/promises';

const cities=['Sarpsborg','Fredrikstad'];
const periods=Array.from({length:20},(_,i)=>({start:1800+i*10,end:1809+i*10}));
const queries=cities.flatMap(city=>periods.map(period=>({city,...period})));
async function count({city,start,end}){
 const url=new URL('https://api.nb.no/catalog/v1/items');
 url.searchParams.set('q','*');
 url.searchParams.set('size','1');
 for(const filter of ['mediatype:bilder',`subjectgeographic:${city}`,'contentClasses:public',`year:[${start} TO ${end}]`])url.searchParams.append('filter',filter);
 for(let attempt=0;attempt<4;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(25000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   const body=await response.json();
   return {city,start,end,count:body.page.totalElements};
  }catch(error){
   if(attempt===3)throw error;
   await new Promise(resolve=>setTimeout(resolve,400*(attempt+1)));
  }
 }
}
const result=[];
let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<queries.length){const query=queries[next++];const row=await count(query);result.push(row);console.error(`${row.city} ${row.start}–${row.end}: ${row.count}`);}}));
result.sort((a,b)=>a.city.localeCompare(b.city)||a.start-b.start);
await fs.writeFile(new URL('../data/city-photo-inventory.json',import.meta.url),JSON.stringify({fetchedAt:new Date().toISOString(),source:'Nasjonalbiblioteket',filters:['mediatype:bilder','contentClasses:public','subjectgeographic by city','year by decade'],counts:result},null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(cities.map(city=>[city,result.filter(row=>row.city===city).reduce((sum,row)=>sum+row.count,0)]))));
