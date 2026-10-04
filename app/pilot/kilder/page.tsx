'use client';
import {useState} from 'react';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import ArchiveViewer from '../../../components/archive-viewer';
import photoSnapshot from '../../../data/sarpsborg-1000.json';
import linkSnapshot from '../../../data/sarpsborg-source-links.json';
import type {PilotItem} from '../../../lib/pilot';

const photos=photoSnapshot.items as PilotItem[];
const links=linkSnapshot.photoLinks;
const sources=linkSnapshot.sources;
const linkedPhotos=photos.filter(photo=>links.some(link=>link.photoId===photo.id)).sort((a,b)=>a.sortYear-b.sortYear||a.pilotNumber-b.pilotNumber);
const topicName=(id:string)=>linkSnapshot.topics.find(topic=>topic.id===id)?.name||id;

export default function SourceLinksPilot(){
 const [topic,setTopic]=useState('all'),[selectedId,setSelectedId]=useState(linkedPhotos[0]?.id||''),[viewer,setViewer]=useState(false);
 const visible=linkedPhotos.filter(photo=>topic==='all'||links.some(link=>link.photoId===photo.id&&link.topicId===topic));
 const selected=visible.find(photo=>photo.id===selectedId)||visible[0];
 const selectedLinks=links.filter(link=>link.photoId===selected?.id&&(topic==='all'||link.topicId===topic));
 const selectedTopics=selectedLinks.map(link=>link.topicId);
 const selectedSources=sources.filter(source=>selectedTopics.includes(source.topicId));
 const index=visible.findIndex(photo=>photo.id===selected?.id);
 const changeTopic=(value:string)=>{setTopic(value);setSelectedId('');setViewer(false)};
 const sourceList=(kind:'bok'|'avis')=><div className="source-link-list">{selectedSources.filter(source=>source.kind===kind).map(source=><article className="source-link" key={source.id}><div className="source-link-meta">{topicName(source.topicId)} · {source.published}{'page' in source&&source.page?` · side ${source.page}`:''}</div><h4><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} <ExternalLink size={15}/></a></h4><p>{source.relation}. {source.evidence}</p><small>{source.access}</small></article>)}</div>;
 const linkDetails=<div className="source-viewer-info"><h3>Relaterte kilder</h3>{selectedLinks.map(link=><p key={link.topicId}><b>{topicName(link.topicId)}:</b> {link.relation}. {link.basis}</p>)}<p>Bøker gjelder motivet som tema. Avisene har bare OCR-ordtreff, og kan være irrelevante for fotografiet.</p>{selectedSources.map(source=><p key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.kind==='bok'?'Bok':'Avis'}: {source.title} ({source.published})</a></p>)}</div>;
 return <><header className="top"><a href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></a><a href="/pilot/sarpsborg-1000">Til bildesamlingen</a></header>
 <main className="source-pilot-main"><a className="pilot-back" href="/pilot/sarpsborg-1000"><ArrowLeft size={16}/> Til 1000 Sarpsborg-bilder</a><div className="eyebrow">PRØVE · BILDER OG KILDER</div><h1>Borregaard og <em>Sarpsfossen</em></h1><p className="source-pilot-intro">40 bilder er koblet til to navngitte motiver. Utforsk bøker om motivene og mulige avisutgaver. Ingen avisartikkel er ennå bekreftet som beskrivelse av et bestemt bilde.</p><p><a href="/utforsk/borregaard">Se alle lagrede Borregaard-bilder</a> · <a href="/utforsk/sarpsfossen">Se alle lagrede Sarpsfossen-bilder</a></p>
 <div className="source-pilot-tabs" role="group" aria-label="Velg motiv"><button aria-pressed={topic==='all'} onClick={()=>changeTopic('all')}>Alle 40</button>{linkSnapshot.topics.map(entry=><button key={entry.id} aria-pressed={topic===entry.id} onClick={()=>changeTopic(entry.id)}>{entry.name} ({new Set(links.filter(link=>link.topicId===entry.id).map(link=>link.photoId)).size})</button>)}</div>
 <div className="source-pilot-layout"><section className="source-photo-list" aria-label="Bilder"><div className="source-list-head"><h2>{visible.length} bilder</h2><span>Etter arkivår · eldste først</span></div><div className="source-photo-grid">{visible.map(photo=><button className="source-photo-card" aria-pressed={selected?.id===photo.id} key={photo.id} onClick={()=>setSelectedId(photo.id)}><img src={photo.image} alt="" loading="lazy"/><span><b>{photo.title}</b><small>{photo.sortYear} · {links.filter(link=>link.photoId===photo.id).map(link=>topicName(link.topicId)).join(' + ')}</small></span></button>)}</div></section>
 {selected&&<section className="source-detail" aria-label="Bilde og relaterte kilder"><div className="source-detail-image"><button onClick={()=>setViewer(true)} aria-label={'Se stort bilde: '+selected.title}><img src={selected.image} alt={selected.title}/></button></div><div className="source-detail-body"><div className="eyebrow">NASJONALBIBLIOTEKET · {selected.sortYear}</div><h2>{selected.title}</h2><p><a href={selected.url} target="_blank" rel="noopener noreferrer">Se bilde og arkivopplysninger hos NB <ExternalLink size={15}/></a></p><h3>Hva er bildet koblet til?</h3>{selectedLinks.map(link=><div className="source-reason" key={link.topicId}><b>{topicName(link.topicId)}</b><p>{link.basis}</p><small>Arkivbasert forslag · ikke kontrollert ned til en bestemt bygning eller hendelse</small></div>)}<h3>Bøker om motivet</h3>{sourceList('bok')}<h3>Mulige avistreff</h3><p className="source-caution">NBs tekstgjenkjenning fant navnet i disse utgavene. Vi har ennå ikke kontrollert artiklene, og de er ikke koblet til datoen fotografiet ble tatt.</p>{sourceList('avis')}</div></section>}</div>
 <details className="source-method"><summary>Hvordan er koblingene laget?</summary><p>{linkSnapshot.method}</p><p>Fotografiets arkivdato, bokas utgivelsesår og avisens dato betyr ulike ting. Bøker kan gi bakgrunn om motivet selv om de ble skrevet senere. Avisene vises som mulige lesespor, ikke som dokumentasjon for fotografiet. Originaler og tilgangsvilkår ligger hos Nasjonalbiblioteket. Ingen GPS-posisjon er fastslått.</p><p>Koblingene er lagret i en versjonert datafil, slik at de kan kontrolleres og rettes før vi utvider prøven.</p></details></main>
 {viewer&&selected&&<ArchiveViewer item={selected} photoIndex={index} photoCount={visible.length} onClose={()=>setViewer(false)} onPrevious={index>0?()=>setSelectedId(visible[index-1].id):undefined} onNext={index<visible.length-1?()=>setSelectedId(visible[index+1].id):undefined} pilotInfo={linkDetails}/>}
 </>;
}
