'use client';
import {Fragment,useState} from 'react';
import {Archive,ArrowLeft,Camera} from 'lucide-react';
import ArchiveViewer from '../../../components/archive-viewer';
import {sarpsborg1000Pilot as pilot,filterPilot,groupFor,type PilotFilters} from '../../../lib/pilot';

const initial:PilotFilters={method:'visual',group:'',place:'',year:'',status:'',order:'oldest'};
const PAGE_SIZE=80;
export default function Sarpsborg1000(){
 const [filters,setFilters]=useState(initial),[selectedId,setSelectedId]=useState<string|null>(null),[limit,setLimit]=useState(PAGE_SIZE);
 const update=(patch:Partial<PilotFilters>)=>{setSelectedId(null);setLimit(PAGE_SIZE);setFilters(f=>({...f,...patch}))};
 const shown=filterPilot(pilot.items,filters),visible=shown.slice(0,limit),index=shown.findIndex(x=>x.id===selectedId),selected=shown[index];
 const groups=[...new Set(pilot.items.map(x=>groupFor(x,filters.method)))].sort((a,b)=>a.localeCompare(b,'nb'));
 const places=[...new Set(pilot.items.map(x=>x.subgroup))].sort((a,b)=>a.localeCompare(b,'nb'));
 const years=[...new Set(pilot.items.map(x=>x.sortYear))].sort((a,b)=>a-b);
 const groupCount=(g:string)=>filterPilot(pilot.items,{...filters,group:g}).length;
 const reset=()=>{setSelectedId(null);setLimit(PAGE_SIZE);setFilters(initial)};
 return <><header className="top"><a href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></a><a href="/">Til arkivet</a></header>
 <main className="pilot-main"><a className="pilot-back" href="/"><ArrowLeft size={16}/> Tilbake til alle arkivtreff</a><a className="pilot-companion" href="/pilot">Se den første Sarpsborg-piloten</a><a className="pilot-companion" href="/utforsk">Utforsk steder og bygninger</a><div className="eyebrow">PILOTSAMLING · SARPSBORG</div><h1>Sarpsborg <em>1890–1979</em></h1><p className="pilot-lead">1000 nye bilder fra Nasjonalbiblioteket. Motivgruppene er lagret og kan utforskes her.</p>
 <div className="pilot-stats"><span><b>1000</b> faste bilder</span><span><b>{groups.length}</b> motivgrupper</span><span><b>297</b> visuelt gjennomgått</span><span><b>703</b> bare arkivtekst</span><span><b>0</b> bekreftede GPS-punkter</span></div>
 <details className="pilot-method"><summary>Hvordan er bildene valgt og kategorisert?</summary><p>{pilot.selection}</p><p>{pilot.method}</p><p>Sted er arkivets geografiske registrering, ikke nødvendigvis det som vises i bildet. Datering kan være omtrentlig. Den visuelle gjennomgangen gjelder bare arkivets forhåndsvisninger, så detaljmotiver og konkrete steder kan fortsatt være feil.</p><p>{pilot.gpsStatus} Originalbildene hentes fra Nasjonalbiblioteket når siden vises; vi har lagret referanser, metadata og kategorier i nettstedets datasamling, ikke kopier av bildefilene.</p><p>Hentet {new Date(pilot.fetchedAt).toLocaleDateString('nb-NO')} fra {pilot.sourceTotal} NB-treff. Utvalget overlapper ikke de første 200 Sarpsborg-bildene.</p></details>
 <section className="pilot-filters" aria-label="Filtrer 1000 bilder">
 <label>Gruppering<select value={filters.method} onChange={e=>update({method:e.target.value,group:''})}><option value="visual">Beste foreløpige kategori</option><option value="metadata">Bare arkivopplysninger</option></select></label>
 <label>Sted / sammenheng<select value={filters.place} onChange={e=>update({place:e.target.value})}><option value="">Alle steder</option>{places.map(p=><option key={p}>{p}</option>)}</select></label>
 <label>År<select value={filters.year} onChange={e=>update({year:e.target.value})}><option value="">Hele 1890–1979</option>{years.map(y=><option key={y}>{y}</option>)}</select></label>
 <label>Gjennomgang<select value={filters.status} onChange={e=>update({status:e.target.value})}><option value="">Alle</option><option value="reviewed">Forhåndsvisning gjennomgått</option><option value="pending">Bare arkivtekst</option></select></label>
 <label>År innen gruppen<select value={filters.order} onChange={e=>update({order:e.target.value})}><option value="oldest">Eldste først</option><option value="newest">Nyeste først</option></select></label>
 <button className="pilot-reset" onClick={reset}>Nullstill filtre</button></section>
 <nav className="pilot-groups" aria-label="Motivgrupper"><button aria-pressed={!filters.group} onClick={()=>update({group:''})}>Alle grupper <span>{filterPilot(pilot.items,{...filters,group:''}).length}</span></button>{groups.map(g=><button key={g} aria-pressed={filters.group===g} onClick={()=>update({group:g})}>{g} <span>{groupCount(g)}</span></button>)}</nav>
 <p className="pilot-result-count" role="status">{shown.length} treff · {visible.length} vist · Bildepiler følger valgt gruppe, år og rekkefølge.</p>
 <section className="cards pilot-cards" aria-label="Bilder i pilotsamlingen">{visible.map((item,i)=>{const group=groupFor(item,filters.method);return <Fragment key={item.id}>{(i===0||groupFor(visible[i-1],filters.method)!==group)&&<h2 className="pilot-group-heading">{group}<small>{shown.filter(x=>groupFor(x,filters.method)===group).length} bilder</small></h2>}{(i===0||groupFor(visible[i-1],filters.method)!==group||visible[i-1].subgroup!==item.subgroup)&&<h3 className="place-heading">{item.subgroup}</h3>}<button className="card" onClick={()=>setSelectedId(item.id)}><div className="card-visual"><span className="catalog-label">UTVALG / {String(item.pilotNumber).padStart(4,'0')}</span><img src={item.image} alt="" loading="lazy" onError={e=>{e.currentTarget.style.display='none'}}/><span className="date-label">{item.year}</span></div><div className="card-body"><div className="card-source">Nasjonalbiblioteket</div><h3>{item.title}</h3><p className="creator">{item.creator}</p><span className="pilot-status">{item.reviewed?'Forhåndsvisning gjennomgått':'Gruppert etter arkivtekst'}</span><span className="card-action">Se bilde og grunnlag <Camera size={16}/></span></div></button></Fragment>})}</section>
 {limit<shown.length&&<button className="pilot-load-more" onClick={()=>setLimit(x=>x+PAGE_SIZE)}>Vis flere bilder ({Math.min(PAGE_SIZE,shown.length-limit)} neste)</button>}
 {!shown.length&&<div className="empty"><h2>Ingen bilder med disse filtrene</h2><button onClick={reset}>Vis alle 1000</button></div>}
 <footer>Fast utvalg · Kategorier og metadata er lagret her; originalbildene ligger hos Nasjonalbiblioteket.</footer></main>
 {selected&&<ArchiveViewer item={selected} photoIndex={index} photoCount={shown.length} onClose={()=>setSelectedId(null)} onPrevious={index>0?()=>setSelectedId(shown[index-1].id):undefined} onNext={index<shown.length-1?()=>setSelectedId(shown[index+1].id):undefined} pilotInfo={<section className="pilot-analysis" aria-label="Kategorisering"><div className="eyebrow">BILDE {selected.pilotNumber} / 1000</div><h3>{groupFor(selected,filters.method)}</h3><p><b>Foreløpig kategori:</b> {selected.group}</p><p>{selected.visualNote}</p><p><b>Arkivtekst alene:</b> {selected.metadataGroup}</p><p><b>Sted / sammenheng:</b> {selected.subgroup}</p><p className="small">{selected.groupBasis}</p><details><summary>Stedfesting og GPS</summary><p>{selected.location.label}</p><p>{selected.location.status}. Ingen koordinater eller nøyaktig fotografposisjon er fastslått.</p></details></section>}/>}
 </>;
}
