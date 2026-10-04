import fs from 'node:fs';
import {nbItem} from '../lib/archive.ts';
import {nbPhotoDetails} from '../lib/photo-details.ts';
const input=process.argv[2];
if(!input)throw Error('Pass the downloaded NB metadata snapshot path');
const raw=JSON.parse(fs.readFileSync(input,'utf8').replace(/^\uFEFF/,''));
const all=[...new Map(raw.map(x=>[x.id,x])).values()].filter(x=>nbItem(x).image&&/^192[0-9]/.test(String(x.metadata.dateCreated))&&!/_bak\]?$/i.test(String(x.metadata.title))).sort((a,b)=>String(a.metadata.dateCreated).localeCompare(String(b.metadata.dateCreated))||a.id.localeCompare(b.id));
if(all.length<200)throw Error('Not enough eligible photos');
const selected=Array.from({length:200},(_,i)=>all[Math.floor(i*(all.length-1)/199)]);
const items=selected.map((raw,i)=>{
 const item=nbItem(raw),m=raw.metadata,t=item.title.toLowerCase();
 const group=/kirke|kapell/.test(t)?'Kirker og kirkehistorie':/bro|jernbane|station/.test(t)?'Broer og samferdsel':/festning|vold|porten|gamlebyen/.test(t)?'Gamlebyen og festningsverk':/hank|fjord|båt|kutter|skib/.test(t)?'Kyst og sjøliv':/gaard|gård|herregård/.test(t)?'Gårder og bygninger':/fabrik|verk|industri/.test(t)?'Industri':'Byliv og landskap';
 return {...item,pilotNumber:i+1,sortYear:Number(String(m.dateCreated).slice(0,4)),sortPlace:'Fredrikstad',facts:nbPhotoDetails(m),group,metadataGroup:group,subgroup:m.title,visualNote:'',reviewed:false,groupBasis:'Foreløpig forslag fra arkivtittel og stedsopplysninger.',location:{label:m.geographic?.placeString?.split(';').filter(Boolean).join(' · ')||'Fredrikstad',status:'Ikke koordinatfestet',lat:null,lon:null,radiusMeters:null},sourceDate:m.dateCreated};
});
const data={id:'fredrikstad-1920-1929-v1',title:'Fredrikstad 1920–1929',fetchedAt:new Date().toISOString(),sourceTotal:raw.length,selection:'200 unike, åpne enkeltbilder fra Nasjonalbiblioteket, jevnt fordelt i en liste sortert på arkivdato og ID. Baksider av fotografier og udaterte poster er utelatt. Utvalget er ikke tilfeldig eller representativt.',method:'Arkivopplysninger og visuell gjennomgang i Codex. Ingen sammenligning av eksterne modeller er kjørt.',items};
fs.mkdirSync('data',{recursive:true});fs.writeFileSync('data/fredrikstad-pilot.json',JSON.stringify(data,null,2));
const review=`<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#ddd;font:14px Arial}.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px}.cell{background:white;height:225px;overflow:hidden}img{width:100%;height:185px;object-fit:contain}b{display:block}header{height:35px}</style><header><button onclick="go(-1)">Forrige</button><span id="pos"></span><button onclick="go(1)">Neste</button></header><div class="grid" id="grid"></div><script>const items=${JSON.stringify(items.map(x=>({n:x.pilotNumber,title:x.title,image:x.image})))};let page=Number(new URL(location).searchParams.get('page')||0);function show(){document.getElementById('pos').textContent='Gruppe '+(page+1)+' av 10';document.getElementById('grid').innerHTML=items.slice(page*20,page*20+20).map(x=>'<div class="cell"><img src="'+x.image+'"><b>'+x.n+' '+x.title+'</b></div>').join('')}function go(d){page=Math.max(0,Math.min(9,page+d));show()}show()</script>`;
fs.writeFileSync(input.replace(/[^/\\]+$/,'pilot-review.html'),review);
console.log(JSON.stringify({eligible:all.length,selected:items.length,groups:Object.fromEntries([...new Set(items.map(x=>x.group))].map(g=>[g,items.filter(x=>x.group===g).length]))}));

