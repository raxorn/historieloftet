import fs from 'node:fs/promises';
import path from 'node:path';

const inventory=JSON.parse(await fs.readFile(new URL('../data/city-photo-inventory.json',import.meta.url),'utf8'));
const outputDir=path.resolve(process.argv[2]||'../../work/city-photos');
await fs.mkdir(outputDir,{recursive:true});
async function fetchPage(row,page){
 const url=new URL('https://api.nb.no/catalog/v1/items');
 url.searchParams.set('q','*');
 url.searchParams.set('size','100');
 url.searchParams.set('page',String(page));
 for(const filter of ['mediatype:bilder',`subjectgeographic:${row.city}`,'contentClasses:public',`year:[${row.start} TO ${row.end}]`])url.searchParams.append('filter',filter);
 for(let attempt=0;attempt<5;attempt++){
  try{
   const response=await fetch(url,{signal:AbortSignal.timeout(30000)});
   if(!response.ok)throw Error(`HTTP ${response.status}`);
   return await response.json();
  }catch(error){
   if(attempt===4)throw new Error(`${row.city} ${row.start} page ${page}: ${error.message}`);
   await new Promise(resolve=>setTimeout(resolve,800*(attempt+1)));
  }
 }
}
const jobs=inventory.counts.filter(row=>row.count>0);
let next=0;
await Promise.all(Array.from({length:4},async()=>{while(next<jobs.length){
 const row=jobs[next++],filename=path.join(outputDir,`${row.city.toLowerCase()}-${row.start}.json`);
 try{const existing=JSON.parse(await fs.readFile(filename,'utf8'));if(existing.length===row.count){console.error(`reuse ${row.city} ${row.start}: ${existing.length}`);continue;}}catch{}
 if(row.count>5000)throw Error(`Partition exceeds 5000: ${row.city} ${row.start}`);
 const pages=Array(Math.ceil(row.count/100));
 let cursor=0;
 await Promise.all(Array.from({length:4},async()=>{while(cursor<pages.length){const n=cursor++;const response=await fetchPage(row,n);pages[n]=response._embedded?.items||[];}}));
 const items=pages.flat();
 if(items.length!==row.count)throw Error(`Count changed for ${row.city} ${row.start}: expected ${row.count}, got ${items.length}`);
 await fs.writeFile(filename,JSON.stringify(items));
 console.error(`saved ${row.city} ${row.start}: ${items.length}`);
}}));
console.log(JSON.stringify({partitions:jobs.length,total:jobs.reduce((sum,row)=>sum+row.count,0),outputDir}));
