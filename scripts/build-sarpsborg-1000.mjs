import fs from 'node:fs';
import {nbItem} from '../lib/archive.ts';
import {nbPhotoDetails} from '../lib/photo-details.ts';

const input=process.argv[2];
if(!input)throw Error('Pass the downloaded NB metadata snapshot path');
const raw=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
const previous=new Set(JSON.parse(fs.readFileSync('data/sarpsborg-pilot.json','utf8')).items.map(x=>x.id));
const unique=[...new Map(raw.map(x=>[x.id,x])).values()];
const eligible=unique.filter(x=>{
 const year=Number(String(x.metadata?.dateCreated||'').slice(0,4));
 const item=nbItem(x);
 return year>=1890&&year<1980&&!previous.has(x.id)&&x.accessInfo?.isPublicDomain===true&&item.image&&item.inlineReadable&&item.kind==='Bilder'&&!/_bak\]?$/i.test(item.title);
}).sort((a,b)=>String(a.metadata.dateCreated).localeCompare(String(b.metadata.dateCreated))||a.id.localeCompare(b.id));
if(eligible.length<1000)throw Error(`Only ${eligible.length} eligible photos`);
const selected=Array.from({length:1000},(_,i)=>eligible[Math.floor(i*(eligible.length-1)/999)]);
const rules=[
 ['Kirker og gravplasser',/kirke|kapell|kirkegård|kirkegard|gravlund|gravminne|gravstein/],
 ['Sarpsfossen og Glomma',/sarps?foss|sarpefoss|glomma|fossen|fossefall|udglidning|utglidning/],
 ['Havn, brygger og fartøy',/havn|brygge|skib|skip|skute|båt|baat|ferje|færge|pellybryg|melløs-brygg/],
 ['Industri og arbeidsliv',/borregaard|fabrik|fabrikk|industri|karbid|carbid|sagbruk|glassverk|bryggeri|verksted|papir|papp|sefa|østkanten kraft|kraftfor|kraftverk/],
 ['Broer, jernbane og veier',/jernbane|stasjon|station|broen|broa|bru|brokar|viadukt|vei |veien|veg |vegen|motorvei/],
 ['Gårder og boliger',/gaard|gård|g[åa]rd|herregård|villa|bolig|husmann|tunet|hovedgård/],
 ['Strand og badeliv',/strand|badeliv|badestrand|hørsand bad|badeplass|badet/],
 ['Museum og kulturminner',/borgarsyssel|museum|olavsvoll|ruin|fortidsminne|kulturminne|helleristning/],
 ['Torg, parker og monumenter',/torvet|torvscene|torg |plassen|monument|statue|park|all[eé]|kulås/],
 ['Gater og byliv',/gate|gaten|gata|sentrum|bybild|julegate|grand hotel|hotell|restaurant|butikk|forretning/],
 ['Mennesker og hendelser',/gruppe|fest|jubileum|korps|amundsen|17\. mai|1\. mai|portrett|musikk|band|konsert|mennesker/],
 ['By- og landskapsutsikt',/utsikt|udsigt|panorama|oversigt|oversikt|parti fra|landskap|fra byen|byen fra/]
];
const flyRules=[
 ['Flyfoto · industri',/borregaard|fabrik|fabrikk|industri|bryggeri|papir|papp|verk|sefa|kraftfor|kraftverk/],
 ['Flyfoto · vann og havn',/sand[e]?sund|havn|brygge|glomma|foss|elv|fjord|strand/],
 ['Flyfoto · by og tettsteder',/sentrum|bydel|sarpsborg|opsund|lande|greåker|varteig|tune|skjeberg|alvim|sykehus|stadion|skole|kirke|gravlund/],
 ['Flyfoto · landskap',/skog|jord|åker|mark|gård|gaard|landskap|terreng/]
];
const groupNote={
 'Kirker og gravplasser':'Arkivteksten viser til kirke, kapell eller gravplass.',
 'Sarpsfossen og Glomma':'Arkivteksten viser til Sarpsfossen eller elven.',
 'Havn, brygger og fartøy':'Arkivteksten viser til havn, brygge eller fartøy.',
 'Industri og arbeidsliv':'Arkivteksten viser til fabrikk, industri eller produksjon.',
 'Broer, jernbane og veier':'Arkivteksten viser til bro, jernbane eller vei.',
 'Gårder og boliger':'Arkivteksten viser til gård, bolig eller tun.',
 'Strand og badeliv':'Arkivteksten viser til strand eller badested.',
 'Museum og kulturminner':'Arkivteksten viser til museum eller kulturminne.',
 'Torg, parker og monumenter':'Arkivteksten viser til park, torg eller monument.',
 'Gater og byliv':'Arkivteksten viser til gate eller bymiljø.',
 'Mennesker og hendelser':'Arkivteksten viser til en person, gruppe eller hendelse.',
 'By- og landskapsutsikt':'Arkivteksten viser til utsikt eller panorama.',
 'Flyfoto · industri':'Flyfotografiet er knyttet til et navngitt industriområde.',
 'Flyfoto · vann og havn':'Flyfotografiet er knyttet til vann, foss, havn eller Sandesund.',
 'Flyfoto · by og tettsteder':'Flyfotografiet er knyttet til by eller tettsted.',
 'Flyfoto · landskap':'Flyfotografiet er knyttet til landskap eller gårdsområder.',
 'Flyfoto · uavklart motiv':'Arkivet identifiserer et flyfoto, men ikke motivet nærmere.',
 'Uavklart motiv':'Arkivtittelen er for vag til en sikker motivkategori.'
};
function place(t){
 const areas=[['Sarpsfossen',/sarps?foss|sarpefoss/],['Borregaard',/borregaard/],['Sandesund',/sand[e]?sund|pellybryg/],['Hafslund',/hafslund/],['Greåker',/greåker|greaaker|greaker/],['Skjeberg',/skjeberg/],['Tune',/\btune\b/],['Varteig',/varteig/],['Kulås',/kulås/],['Opsund',/opsund/],['Lande',/\blande\b/],['Alvim',/alvim/],['Borgarsyssel',/borgarsyssel/],['Hørsand',/hørsand/],['Sarpsborg sentrum',/sentrum|torvet|storgat|mariegat/]];
 return areas.find(([,re])=>re.test(t))?.[0]||'Sarpsborg og omegn';
}
function classify(item){
 const t=`${item.title} ${item.facts.filter(f=>f.label==='Motiv / beskrivelse'||f.label==='Emneord').map(f=>f.value).join(' ')}`.toLowerCase();
 const fly=/flyfoto|fjellanger widerøe|widerøe flyveselskaps/.test(t);
 const ruleset=fly?flyRules:rules;
 const group=ruleset.find(([,re])=>re.test(t))?.[0]||(fly?'Flyfoto · uavklart motiv':'Uavklart motiv');
 return {group,subgroup:place(t),uncertain:group.toLowerCase().includes('uavklart')};
}
const items=selected.map((source,i)=>{
 const item=nbItem(source),m=source.metadata,sortYear=Number(String(m.dateCreated).slice(0,4));
 item.facts=nbPhotoDetails(m);
 const {group,subgroup,uncertain}=classify(item);
 return {...item,pilotNumber:i+1,sortYear,sortPlace:'Sarpsborg',group,metadataGroup:group,subgroup,visualNote:groupNote[group],reviewed:false,needsReview:uncertain,groupBasis:'Automatisk forslag fra arkivtittel, beskrivelse og emneord. Bildet er ikke visuelt kontrollert.',location:{label:m.geographic?.placeString?.split(';').filter(Boolean).join(' · ')||'Sarpsborg',status:'Arkivsted – GPS ikke verifisert',lat:null,lon:null,radiusMeters:null},sourceDate:m.dateCreated};
});
const data={id:'sarpsborg-1000-v1',title:'Sarpsborg 1890–1979 · 1000 nye bilder',fetchedAt:new Date().toISOString(),sourceTotal:5637,sourceRetrieved:raw.length,eligibleCount:eligible.length,selection:'1000 nye, unike, digitalt åpne bilder merket public domain fra Nasjonalbibliotekets Sarpsborg-treff, datert 1890–1979. De 200 bildene fra første Sarpsborg-pilot er utelatt. Arkivet viste 5637 treff; de første 5000 ble hentet fordi bredt søk har en grense for dyp sideinndeling. Utvalget er jevnt fordelt over de 1333 kvalifiserte treffene etter arkivdato og ID. Det er ikke representativt eller tilfeldig.',method:'Foreløpig automatisk kategorisering med arkivtittel, beskrivelse og emneord. Ingen bildeanalysemodell er brukt på alle 1000. Uklare titler er merket for kontroll. Kategorier er lagret i denne versjonerte datasamlingen.',gpsStatus:'Ingen GPS-punkter er bekreftet. Arkivets stedsnavn er søkehint, ikke motivpunkt eller fotografens ståsted.',items};
fs.writeFileSync('data/sarpsborg-1000.json',JSON.stringify(data,null,2));
console.log(JSON.stringify({eligible:eligible.length,selected:items.length,groups:Object.fromEntries([...new Set(items.map(x=>x.group))].map(g=>[g,items.filter(x=>x.group===g).length])),needsReview:items.filter(x=>x.needsReview).length}));
