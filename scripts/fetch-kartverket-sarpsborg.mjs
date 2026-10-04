import fs from 'node:fs';
const base='https://ws.geonorge.no/stedsnavn/v1/navn';
const url=new URL(base);url.searchParams.set('knr','3105');url.searchParams.set('treffPerSide','500');url.searchParams.set('side','1');
const firstResponse=await fetch(url,{signal:AbortSignal.timeout(20000)});
if(!firstResponse.ok)throw Error(`${firstResponse.status}: ${(await firstResponse.text()).slice(0,500)}`);
const first=await firstResponse.json();
console.error(JSON.stringify({metadata:first.metadata,sample:first.navn?.[0]}));
const total=first.metadata?.totaltAntallTreff||0;
if(total>5000)throw Error(`API cap 5000, need another extraction method (${total} matches)`);
const names=[...(first.navn||[])];
for(let page=2;page<=Math.ceil(total/500);page++){
 url.searchParams.set('side',String(page));
 const body=await (await fetch(url,{signal:AbortSignal.timeout(20000)})).json();
 names.push(...(body.navn||[]));
}
fs.mkdirSync('data/source-harvest',{recursive:true});
const unique=[...new Map(names.map(item=>[`${item.stedsnummer}:${item.skrivemåte}`,item])).values()];
fs.writeFileSync('data/source-harvest/sarpsborg-kartverket-names.json',JSON.stringify(unique)+'\n');
console.log(JSON.stringify({reported:total,returned:names.length,saved:unique.length}));
