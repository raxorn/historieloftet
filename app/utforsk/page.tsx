import {Archive,ArrowLeft} from 'lucide-react';
import Link from 'next/link';
import index from '../../data/topic-index.json';
import photos from '../../data/sarpsborg-1000.json';
import catalog from '../../data/city-photo-catalog.json';

const images:{[key:string]:number}={borregaard:74,sarpsfossen:95};
export default function Explore(){
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/">Til arkivet</Link></header>
  <main className="explore-main">
   <Link className="pilot-back" href="/"><ArrowLeft size={16}/> Til arkivet</Link>
   <div className="eyebrow">UTFORSK</div><h1>Steder og bygninger</h1><p>Gå fra et motiv til bildene som er knyttet til det, og videre til bøker og mulige avistreff.</p>
   <div className="explore-grid">{index.topics.map(topic=>{const count=new Set(index.photoTopics.filter(link=>link.topicId===topic.id).map(link=>link.photoId)).size;const photo=photos.items.find(item=>item.pilotNumber===images[topic.id]);return <Link className="explore-card" key={topic.id} href={'/utforsk/'+topic.id}><div className="explore-card-image">{photo?.image&&<img src={photo.image} alt=""/>}</div><div className="explore-card-body"><span className="eyebrow">{topic.type}</span><h2>{topic.name}</h2><p>{topic.description}</p><b>{count} bilder · bøker og mulige avistreff</b></div></Link>})}</div>
   <p className="explore-note">Dette er starten på en motivindeks. Bildekoblingene bygger på arkivtitler; noen kan trenge korrigering. Kildeinnholdet ligger hos Nasjonalbiblioteket.</p>
   <section className="explore-collections"><h2>Hele bysamlingene</h2><p>Utforsk katalogkartleggingen fram til 2000. Velg tiår og foreløpig motivgruppe, og bla gjennom bildene.</p><div>{catalog.cities.map(city=><Link key={city.city} href={'/samling/'+city.city.toLowerCase()}><strong>{city.city}</strong><span>{city.items.toLocaleString('nb-NO')} fotoposter</span></Link>)}</div></section>
  </main>
 </>;
}
