'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {Archive,ArrowLeft,Camera,ChevronLeft,ChevronRight} from 'lucide-react';
import ArchiveViewer from './archive-viewer';
import manifest from '../data/city-photo-catalog.json';
import type {RecordItem} from '../lib/archive';
import {cityMotifFacets,cityMotifFacetFor} from '../lib/city-motif-facets';

type City='Sarpsborg'|'Fredrikstad';
type Photo=RecordItem & {sortYear:number;group:string;subgroup:string;reviewed:boolean;needsReview:boolean;groupBasis:string};
const pageSize=48;

export default function CityCatalog({city}:{city:City}){
 const info=manifest.cities.find(row=>row.city===city)!;
 const initialDecade=info.decades.some(row=>row.decade===1920)?1920:info.decades[0].decade;
 const [decade,setDecade]=useState(initialDecade);
 const [load,setLoad]=useState<{decade:number;items:Photo[];error:string}|null>(null);
 const [group,setGroup]=useState('');
 const [order,setOrder]=useState<'oldest'|'newest'>('oldest');
 const [page,setPage]=useState(0);
 const [selectedId,setSelectedId]=useState('');
 useEffect(()=>{
  let active=true;
  fetch('/city-photos/'+city.toLowerCase()+'-'+decade+'.json').then(response=>{if(!response.ok)throw Error('Kunne ikke hente tiåret');return response.json() as Promise<Photo[]>}).then(items=>{if(active)setLoad({decade,items,error:''})}).catch(()=>{if(active)setLoad({decade,items:[],error:'Kunne ikke hente bildene. Prøv å velge tiåret igjen.'})});
  return ()=>{active=false};
 },[city,decade]);
 const loading=!load||load.decade!==decade;
 const items=loading?[]:load.items;
 const groups=cityMotifFacets.map(facet=>({...facet,count:items.filter(photo=>cityMotifFacetFor(photo.group)===facet.id).length})).filter(facet=>facet.count>0);
 const visible=items.filter(photo=>!group||cityMotifFacetFor(photo.group)===group).sort((a,b)=>(order==='oldest'?1:-1)*(a.sortYear-b.sortYear)||a.title.localeCompare(b.title,'nb')||a.id.localeCompare(b.id));
 const selected=visible.find(photo=>photo.id===selectedId);
 const selectedIndex=visible.findIndex(photo=>photo.id===selectedId);
 const pages=Math.max(1,Math.ceil(visible.length/pageSize));
 const shown=visible.slice(page*pageSize,(page+1)*pageSize);
 function chooseDecade(value:number){setDecade(value);setLoad(null);setGroup('');setPage(0);setSelectedId('')}
 function chooseGroup(value:string){setGroup(value);setPage(0);setSelectedId('')}
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/utforsk">Utforsk steder</Link></header>
  <main className="city-main"><Link href="/utforsk" className="pilot-back"><ArrowLeft size={16}/> Tilbake til steder</Link><div className="eyebrow">BYSAMLING · NASJONALBIBLIOTEKET</div><h1>{city} <em>fram til 2000</em></h1>
   <p className="city-lead">{info.items.toLocaleString('nb-NO')} unike fotoposter, hvorav {info.newItems.toLocaleString('nb-NO')} er nye i denne kartleggingen. {info.visuallyReviewed.toLocaleString('nb-NO')} er visuelt gjennomgått; resten har foreløpige forslag fra arkivtekst.</p>
   <div className="city-stats"><span><b>{info.displayable.toLocaleString('nb-NO')}</b> kan vises her</span><span><b>{info.sourceOnly}</b> åpnes hos kilden</span><span><b>{info.unresolvedFlyPhotos.toLocaleString('nb-NO')}</b> flyfoto uten sikkert motiv</span></div>
   <details className="source-method"><summary>Hva betyr «kartlagt» her?</summary><p>{manifest.method}</p><p>Dette er en katalogkartlegging, ikke en ferdig visuell analyse av alle bildene. Særlig flyfotoseriene fra 1990-årene trenger bilde for bilde gjennomgang. Vi har ikke fastslått koordinater eller koblet disse nye postene til avisartikler.</p></details>
   <nav className="city-decades" aria-label="Velg tiår">{info.decades.map(row=><button key={row.decade} aria-pressed={decade===row.decade} onClick={()=>chooseDecade(row.decade)}>{row.decade}–{row.decade+9}<span>{row.count.toLocaleString('nb-NO')}</span></button>)}</nav>
   <div className="city-controls"><label>Motiv<select value={group} onChange={event=>chooseGroup(event.target.value)}><option value="">Alle bilder ({items.length})</option>{groups.map(facet=><option key={facet.id} value={facet.id}>{facet.label} ({facet.count})</option>)}</select></label><label>Sortering<select value={order} onChange={event=>{setOrder(event.target.value as 'oldest'|'newest');setPage(0)}}><option value="oldest">Eldste først</option><option value="newest">Nyeste først</option></select></label><p>{loading?'Henter bilder …':load.error||visible.length.toLocaleString('nb-NO')+' bilder i valgt utvalg'}</p></div>
   {!loading&&!load.error&&<><div className="city-grid">{shown.map(photo=><button key={photo.id} className="city-card" onClick={()=>setSelectedId(photo.id)}><div className="city-card-image">{photo.image?<img src={photo.image} alt="" loading="lazy"/>:<span><Camera size={32}/> Åpne hos kilden</span>}</div><div className="city-card-body"><small>{photo.sortYear} · {photo.subgroup}</small><h2>{photo.title}</h2><p>{photo.group}</p><span>{photo.reviewed?'Forhåndsvisning gjennomgått':'Forslag fra arkivtekst'}</span></div></button>)}</div>{!visible.length&&<p className="topic-empty">Ingen bilder i denne motivgruppen for valgt tiår.</p>}<nav className="city-pagination" aria-label="Bla i treff"><button disabled={page===0} onClick={()=>setPage(page-1)}><ChevronLeft size={18}/> Forrige</button><span>Side {page+1} av {pages}</span><button disabled={page>=pages-1} onClick={()=>setPage(page+1)}>Neste <ChevronRight size={18}/></button></nav></>}
  </main>
  {selected&&<ArchiveViewer item={selected} photoIndex={selectedIndex} photoCount={visible.length} onClose={()=>setSelectedId('')} onPrevious={selectedIndex>0?()=>setSelectedId(visible[selectedIndex-1].id):undefined} onNext={selectedIndex<visible.length-1?()=>setSelectedId(visible[selectedIndex+1].id):undefined} pilotInfo={<section className="pilot-analysis"><h3>Motivkartlegging</h3><p>{selected.group} · {selected.reviewed?'Forhåndsvisning gjennomgått.':'Foreløpig forslag fra arkivtekst.'}</p><p>{selected.groupBasis}</p></section>}/>}
 </>;
}
