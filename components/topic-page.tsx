'use client';

import {useState} from 'react';
import Link from 'next/link';
import {Archive, ArrowLeft, ExternalLink} from 'lucide-react';
import ArchiveViewer from './archive-viewer';
import borregaardPhotos from '../data/topic-photos/borregaard.json';
import sarpsfossenPhotos from '../data/topic-photos/sarpsfossen.json';
import index from '../data/topic-index.json';
import sourceLinks from '../data/sarpsborg-source-links.json';
import type {RecordItem} from '../lib/archive';
import {topicFacets,topicFacetFor} from '../lib/topic-facets';

type TopicPhoto=RecordItem & {sortYear:number;group:string;reviewed:boolean};
const allPhotos=[...borregaardPhotos,...sarpsfossenPhotos] as TopicPhoto[];
const byId=new Map(allPhotos.map(photo=>[photo.id,photo]));

export default function TopicPage({topicId}:{topicId:'borregaard'|'sarpsfossen'}){
 const topic=index.topics.find(value=>value.id===topicId)!;
 const topicPhotoIds=new Set(index.photoTopics.filter(link=>link.topicId===topicId).map(link=>link.photoId));
 const photos=[...topicPhotoIds].map(id=>byId.get(id)).filter((photo):photo is TopicPhoto=>!!photo);
 const decades=[...new Set(photos.map(photo=>Math.floor(photo.sortYear/10)*10))].sort((a,b)=>a-b);
 const [decade,setDecade]=useState('all');
 const [group,setGroup]=useState('');
 const [order,setOrder]=useState<'oldest'|'newest'>('oldest');
 const [selectedId,setSelectedId]=useState('');
 const [viewer,setViewer]=useState(false);
 const periodPhotos=photos.filter(photo=>decade==='all'||Math.floor(photo.sortYear/10)*10===Number(decade));
 const visible=periodPhotos.filter(photo=>!group||topicFacetFor(photo.group)===group).sort((a,b)=>(order==='oldest'?1:-1)*(a.sortYear-b.sortYear)||a.title.localeCompare(b.title,'nb')||a.id.localeCompare(b.id));
 const selected=visible.find(photo=>photo.id===selectedId)||visible[0];
 const selectedBasis=index.photoTopics.find(link=>link.photoId===selected?.id&&link.topicId===topicId)?.basis;
 const position=visible.findIndex(photo=>photo.id===selected?.id);
 const books=sourceLinks.sources.filter(source=>source.topicId===topicId&&source.kind==='bok');
 const newspapers=sourceLinks.sources.filter(source=>source.topicId===topicId&&source.kind==='avis');
 const sourceCard=(source:(typeof sourceLinks.sources)[number])=><article className="topic-source" key={source.id}><div className="source-link-meta">{source.kind==='bok'?'BOK':'AVISUTGAVE'} · {source.published}</div><h3><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={15}/></a></h3><p>{source.evidence}</p><small>{source.access}</small></article>;
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/utforsk">Utforsk steder og bygninger</Link></header>
  <main className="topic-main">
   <Link className="pilot-back" href="/utforsk"><ArrowLeft size={16}/> Steder og bygninger</Link>
   <div className="eyebrow">{topic.type}</div><h1>{topic.name}</h1><p className="topic-intro">{topic.description}</p>
   <p className="topic-scope">{photos.length} bilder i Historieloftets kartlagte bysamlinger fram til 2000. Dette er ikke alle bilder som finnes hos Nasjonalbiblioteket.</p>
   <div className="topic-columns">
    <section className="topic-gallery" aria-label={'Bilder av '+topic.name}>
     <div className="topic-toolbar">
      <label>Årti<select value={decade} onChange={event=>{setDecade(event.target.value);setGroup('');setSelectedId('')}}><option value="all">Alle år</option>{decades.map(value=><option key={value} value={value}>{value}–{value+9}</option>)}</select></label>
      <label>Sortering<select value={order} onChange={event=>setOrder(event.target.value as 'oldest'|'newest')}><option value="oldest">Eldste først</option><option value="newest">Nyeste først</option></select></label>
      <span>{visible.length} av {periodPhotos.length} bilder</span>
     </div>
     <nav className="topic-group-filter" aria-label="Filtrer etter motiv"><strong>Motiv</strong><div><button aria-pressed={!group} onClick={()=>{setGroup('');setSelectedId('')}}>Alle bilder <span>{periodPhotos.length}</span></button>{topicFacets.map(facet=>{const count=periodPhotos.filter(photo=>topicFacetFor(photo.group)===facet.id).length;return count>0?<button key={facet.id} aria-pressed={group===facet.id} onClick={()=>{setGroup(facet.id);setSelectedId('')}}>{facet.label} <span>{count}</span></button>:null})}</div><small>Beslektede arkivkategorier er samlet. De opprinnelige, foreløpige motivgruppene vises ved hvert bilde.</small></nav>
     {visible.length?<div className="topic-photo-grid">{visible.map(photo=><button key={photo.id} className="topic-photo-card" aria-pressed={selected?.id===photo.id} onClick={()=>setSelectedId(photo.id)}><img src={photo.image} alt="" loading="lazy"/><span><b>{photo.title}</b><small>{photo.sortYear} · {photo.group}</small></span></button>)}</div>:<p className="topic-empty">Ingen bilder i denne kombinasjonen av årti og motiv. Velg et annet motiv eller «Alle år».</p>}
    </section>
    <aside className="topic-sidebar">
     {selected&&<section className="topic-selected"><button onClick={()=>setViewer(true)} aria-label={'Se stort bilde: '+selected.title}><img src={selected.image} alt={selected.title}/></button><div><div className="eyebrow">VALGT BILDE · {selected.sortYear}</div><h2>{selected.title}</h2><p>Motivgruppe: {selected.group} · {selected.reviewed?'Forhåndsvisning gjennomgått':'Gruppert etter arkivtekst'}</p><p>{selectedBasis} Dette er ikke alene en visuell bekreftelse på hva bildet viser.</p><a href={selected.url} target="_blank" rel="noopener noreferrer">Original og opplysninger hos NB <ExternalLink size={15}/></a></div></section>}
     <section className="topic-sources"><h2>Utvalgte bøker om {topic.name}</h2><p className="source-caution">Dette er {books.length} eksempler fra Nasjonalbiblioteket, ikke en fullstendig oversikt.</p>{books.map(sourceCard)}<h2>Mulige avistreff</h2><p className="source-caution">Dette er {newspapers.length} eksempler på avisutgaver med OCR-treff på navnet. Vi har ikke bekreftet konkrete artikler eller at de omtaler fotografiene.</p>{newspapers.map(sourceCard)}<a className="topic-more-sources" href={'https://www.nb.no/search?q='+encodeURIComponent(topic.name)} target="_blank" rel="noopener noreferrer">Søk etter flere kilder hos Nasjonalbiblioteket <ExternalLink size={15}/></a></section>
    </aside>
   </div>
   <details className="source-method"><summary>Om koblingene og avgrensningen</summary><p>{index.method}</p><p>Motivfilteret bruker bildenes lagrede, foreløpige kategori. Noen kategorier bygger bare på arkivtekst. Det første koblingsforsøket gjennomgikk 40 bilder. De øvrige bildene på denne temasiden er hentet inn fordi navnet finnes i arkivtittelen eller arkivets steds- og motivopplysninger. Bøkene handler om motivet som tema; en bestemt boksidestekst er ikke knyttet til hvert bilde. Avisene er kun ordtreff og krever videre kontroll. Ingen konkret bygning eller GPS-posisjon er verifisert.</p></details>
  </main>
  {viewer&&selected&&<ArchiveViewer item={selected} photoIndex={position} photoCount={visible.length} onClose={()=>setViewer(false)} onPrevious={position>0?()=>setSelectedId(visible[position-1].id):undefined} onNext={position<visible.length-1?()=>setSelectedId(visible[position+1].id):undefined} pilotInfo={<section className="pilot-analysis"><h3>{topic.name}</h3><p>{selectedBasis} Motivgruppe: {selected.group}. {selected.reviewed?'Forhåndsvisning gjennomgått.':'Gruppert etter arkivtekst.'}</p><p>Bøkene gir bakgrunn. Avisutgavene er ubekreftede ordtreff.</p></section>}/>}
 </>;
}
