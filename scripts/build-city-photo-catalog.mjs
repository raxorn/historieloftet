import fs from 'node:fs/promises';
import path from 'node:path';
import {nbItem} from '../lib/archive.ts';

const input=path.resolve(process.argv[2]||'../../work/city-photos');
const output=new URL('../public/city-photos/',import.meta.url);
await fs.mkdir(output,{recursive:true});
const inventories=JSON.parse(await fs.readFile(new URL('../data/city-photo-inventory.json',import.meta.url),'utf8')).counts;
const pilotFiles=['sarpsborg-pilot.json','sarpsborg-1000.json','fredrikstad-pilot.json'];
const pilotItems=(await Promise.all(pilotFiles.map(async file=>JSON.parse(await fs.readFile(new URL('../data/'+file,import.meta.url),'utf8')).items))).flat();
const previous=new Map(pilotItems.map(item=>[item.id,item]));
const ruleSets=[
 ['Kirker og gravplasser',/kirke|kapell|kirkeg[åa]rd|gravlund|gravminne|gravstein/],
 ['Industriinteriør og maskiner',/maskin|produksjonslinje|fabrikkinteriør|fabrikinteriør|maskinhall/],
 ['Sarpsfossen og Glomma',/sarps?foss|sarpefoss|glomma|fossen|fossefall/],
 ['Broer, jernbane og veier',/jernbane|stasjon|station|broen|broa|broer|bru|viadukt|motorvei|veien|vegen/],
 ['Havn, brygger og fartøy',/havn|brygge|skib|skip|skute|båt|baat|ferje|færge|kai|kaien/],
 ['Industri og arbeidsliv',/borregaard|borregård|borggaard|fabrik|fabrikk|industri|karbid|carbid|sagbruk|glassverk|bryggeri|verksted|papir|papp|kraftverk/],
 ['Gårder og boliger',/gaard|gård|herregård|villa|bolig|husmann|tunet|hovedgård/],
 ['Bygninger og institusjoner',/bygning|skole|sykehus|rådhus|kommunehus|bank|teater|hotell/],
 ['Museum og kulturminner',/borgarsyssel|museum|ruin|fortidsminne|kulturminne|helleristning|festning|gamlebyen/],
 ['Torg, parker og monumenter',/torvet|torg|plassen|monument|statue|park|all[eé]|kulås/],
 ['Gater og byliv',/gate|gaten|gata|sentrum|bybild|butikk|forretning/],
 ['Mennesker og hendelser',/gruppe|fest|jubileum|korps|amundsen|17\. mai|1\. mai|portrett|musikk|konsert/],
 ['Natur og landskap',/utsikt|udsigt|panorama|oversikt|parti fra|landskap|skog|fjord|elv/]
];
function classify(raw){
 const title=String(raw.metadata?.title||'');
 const subjects=[...(raw.metadata?.subject?.topics||[]),...(raw.metadata?.subject?.subjects||[])].join(' ');
 const text=(title+' '+subjects).toLowerCase();
 const fly=/flyfoto|fjellanger widerøe|widerøe flyveselskaps/.test(text);
 if(fly){
  const named=ruleSets.find(([,pattern])=>pattern.test(text));
  return named?{group:'Flyfoto · '+named[0].toLowerCase(),basis:'Automatisk forslag fra arkivtittel og emneord; flyfotoet er ikke visuelt kontrollert.'}:{group:'Flyfoto · uavklart motiv',basis:'Arkivet identifiserer flyfotoserien, men tittelen oppgir ikke et sikkert motiv. Krever visuell gjennomgang.'};
 }
 const named=ruleSets.find(([,pattern])=>pattern.test(text));
 return named?{group:named[0],basis:'Automatisk forslag fra arkivtittel og emneord. Bildet er ikke visuelt kontrollert.'}:{group:'Uavklart motiv',basis:'Arkivtittel og emneord beskriver ikke motivet tilstrekkelig. Krever visuell gjennomgang.'};
}
const rows=[];
for(const city of ['Sarpsborg','Fredrikstad']){
 const rawFiles=inventories.filter(row=>row.city===city&&row.count);
 const raw=(await Promise.all(rawFiles.map(row=>fs.readFile(path.join(input,`${city.toLowerCase()}-${row.start}.json`),'utf8').then(JSON.parse)))).flat();
 const unique=[...new Map(raw.map(item=>[item.id,item])).values()];
 const withoutBack=unique.filter(item=>!/_bak\]?$/i.test(String(item.metadata?.title||'')));
 const items=withoutBack.map(rawItem=>{
  const old=previous.get(rawItem.id);
  if(old)return {...old,sortPlace:city};
  const item=nbItem(rawItem);
  const year=Number(String(rawItem.metadata?.dateCreated||rawItem.metadata?.originInfo?.issued||'').slice(0,4));
  const guess=classify(rawItem);
  const place=rawItem.metadata?.geographic?.placeString?.split(';').filter(Boolean).join(' · ')||city;
  return {...item,sortYear:year,sortPlace:city,group:guess.group,metadataGroup:guess.group,subgroup:rawItem.metadata?.geographic?.city||city,visualNote:'',reviewed:false,needsReview:guess.group.includes('uavklart'),groupBasis:guess.basis,sourceDate:rawItem.metadata?.dateCreated||rawItem.metadata?.originInfo?.issued||'',location:{label:place,status:'Arkivsted – GPS ikke verifisert',lat:null,lon:null,radiusMeters:null}};
 });
 const byDecade=new Map();
 for(const item of items){
  const decade=Math.floor(item.sortYear/10)*10;
  if(!byDecade.has(decade))byDecade.set(decade,[]);
  byDecade.get(decade).push(item);
 }
 for(const [decade,group] of byDecade){
  group.sort((a,b)=>a.sortYear-b.sortYear||a.title.localeCompare(b.title,'nb')||a.id.localeCompare(b.id));
  await fs.writeFile(new URL(`${city.toLowerCase()}-${decade}.json`,output),JSON.stringify(group));
 }
 const summary={city,catalogHits:raw.length,unique:unique.length,excludedBacks:unique.length-withoutBack.length,items:items.length,alreadyInPilots:items.filter(item=>previous.has(item.id)).length,newItems:items.filter(item=>!previous.has(item.id)).length,displayable:items.filter(item=>item.inlineReadable&&item.image).length,sourceOnly:items.filter(item=>!item.inlineReadable||!item.image).length,unresolvedFlyPhotos:items.filter(item=>item.group==='Flyfoto · uavklart motiv').length,unresolvedOther:items.filter(item=>item.group==='Uavklart motiv').length,visuallyReviewed:items.filter(item=>item.reviewed).length,decades:[...byDecade].map(([decade,group])=>({decade,count:group.length})).sort((a,b)=>a.decade-b.decade)};
 rows.push(summary);
 console.log(JSON.stringify(summary));
}
await fs.writeFile(new URL('../data/city-photo-catalog.json',import.meta.url),JSON.stringify({id:'city-photo-catalog-v1',fetchedAt:new Date().toISOString(),source:'Nasjonalbibliotekets åpne fotokatalog',method:'Katalogposter for Sarpsborg og Fredrikstad datert før 2000, hentet per tiår. Dubletter og egne baksideposter er fjernet. Eksisterende pilotkategorier er beholdt. Nye motivgrupper er automatiske forslag fra arkivtittel og emneord; flyfoto med serienummer uten motivtekst er merket uavklart. Stedsnavn er arkivregistrering, ikke verifisert fotomotiv eller GPS-posisjon. Kildens tilgang og lisens avgjør om bildet kan vises her eller bare lenkes til katalogen.',cities:rows},null,2)+'\n');
