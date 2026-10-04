'use client';
import {useState} from 'react';
import Link from 'next/link';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import ArchiveViewer from './archive-viewer';
import recent from '../data/sarpsborg-1000.json';
import first from '../data/sarpsborg-pilot.json';
import index from '../data/topic-index.json';
import sourceLinks from '../data/sarpsborg-source-links.json';
import type {PilotItem} from '../lib/pilot';

const allPhotos=[...recent.items,...first.items] as PilotItem[];
const byId=new Map(allPhotos.map(photo=>[photo.id,photo]));

export default function TopicPage({topicId}:{topicId:'borregaard'|'sarpsfossen'}){
 const topic=index.topics.find(value=>value.id===topicId)!;
 const topicPhotoIds=new Set(index.photoTopics.filter(link=>link.topicId===topicId).map(link=>link.photoId));
 const photos=[...topicPhotoIds].map(id=>byId.get(id)).filter((photo):photo is PilotItem=>!!photo);
 const decades=[...new Set(photos.map(photo=>Math.floor(photo.sortYear/10)*10))].sort((a,b)=>a-b);
 const [decade,setDecade]=useState('all'),[order,setOrder]=useState<'oldest'|'newest'>('oldest'),[selectedId,setSelectedId]=useState(''),[viewer,setViewer]=useState(false);
 const visible=photos.filter(photo=>decade==='all'||Math.floor(photo.sortYear/10)*10===Number(decade)).sort((a,b)=>(order==='oldest'?1:-1)*(a.sortYear-b.sortYear)||a.title.localeCompare(b.title,'nb')||a.id.localeCompare(b.id));
 const selected=visible.find(photo=>photo.id===selectedId)||visible[0];
 const position=visible.findIndex(photo=>photo.id===selected?.id);
 const books=sourceLinks.sources.filter(source=>source.topicId===topicId&&source.kind==='bok');
 const newspapers=sourceLinks.sources.filter(source=>source.topicId===topicId&&source.kind==='avis');
 const sourceCard=(source:(typeof sourceLinks.sources)[number])=><article className="topic-source" key={source.id}><div className="source-link-meta">{source.kind==='bok'?'BOK':'AVISUTGAVE'} · {source.published}</div><h3><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={15}/></a></h3><p>{source.evidence}</p><small>{source.access}</small></article>;
 return <><header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><a href="/utforsk">Utforsk steder og bygninger</a></header>
 <main className="topic-main"><a className="pilot-back" href="/utforsk"><ArrowLeft size={16}/> Steder og bygninger</a><div className="eyebrow">{topic.type}</div><h1>{topic.name}</h1><p className="topic-intro">{topic.description}</p><p className="topic-scope">{photos.length} bilder i Historieloftets lagrede Sarpsborg-utvalg. Dette er ikke alle bilder som finnes hos Nasjonalbiblioteket.</p>
 <div className="topic-columns"><section className="topic-gallery" aria-label={'Bilder av '+topic.name}><div className="topic-toolbar"><label>Årti<select value={decade} onChange={event=>{setDecade(event.target.value);setSelectedId('')}}><option value="all">Alle år</option>{decades.map(value=><option key={value} value={value}>{value}–{value+9}</option>)}</select></label><label>Sortering<select value={order} onChange={event=>setOrder(event.target.value as 'oldest'|'newest')}><option value="oldest">Eldste først</option><option value="newest">Nyeste først</option></select></label><span>{visible.length} bilder</span></div><div className="topic-photo-grid">{visible.map(photo=><button key={photo.id} className="topic-photo-card" aria-pressed={selected?.id===photo.id} onClick={()=>setSelectedId(photo.id)}><img src={photo.image} alt="" loading="lazy"/><span><b>{photo.title}</b><small>{photo.sortYear}{sourceLinks.photoLinks.some(link=>link.photoId===photo.id&&link.topicId===topicId)?' · med i kildeprøven':''}</small></span></button>)}</div></section>
 <aside className="topic-sidebar">{selected&&<section className="topic-selected"><button onClick={()=>setViewer(true)} aria-label={'Se stort bilde: '+selected.title}><img src={selected.image} alt={selected.title}/></button><div><div className="eyebrow">VALGT BILDE · {selected.sortYear}</div><h2>{selected.title}</h2><p>Arkivtittelen nevner {topic.name}. Det sier ikke i seg selv hvilken bygning eller hendelse bildet viser.</p><a href={selected.url} target="_blank" rel="noopener noreferrer">Original og opplysninger hos NB <ExternalLink size={15}/></a></div></section>}
 <section className="topic-sources"><h2>Bøker om {topic.name}</h2>{books.map(sourceCard)}<h2>Mulige avistreff</h2><p className="source-caution">Disse avisutgavene har OCR-treff på navnet. Vi har ikke bekreftet artiklene eller at de omtaler fotografiene.</p>{newspapers.map(sourceCard)}</section></aside></div>
 <details className="source-method"><summary>Om koblingene og avgrensningen</summary><p>{index.method}</p><p>Det første koblingsforsøket gjennomgikk 40 bilder. De øvrige bildene på denne temasiden er hentet inn fordi navnet finnes i arkivtittelen. Bøkene handler om motivet som tema; en bestemt boksidestekst er ikke knyttet til hvert bilde. Avisene er kun ordtreff og krever videre kontroll. Ingen konkret bygning eller GPS-posisjon er verifisert.</p></details></main>
 {viewer&&selected&&<ArchiveViewer item={selected} photoIndex={position} photoCount={visible.length} onClose={()=>setViewer(false)} onPrevious={position>0?()=>setSelectedId(visible[position-1].id):undefined} onNext={position<visible.length-1?()=>setSelectedId(visible[position+1].id):undefined} pilotInfo={<section className="pilot-analysis"><h3>{topic.name}</h3><p>Navnet står i arkivtittelen. Se alle bildene og de relaterte kildene på denne temasiden.</p><p>Bøker gir bakgrunn. Avisutgavene er ubekreftede ordtreff.</p></section>}/>}
 </>;
}
