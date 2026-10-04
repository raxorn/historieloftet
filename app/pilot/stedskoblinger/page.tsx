'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import sarpsborg from '../../../data/place-link-pilot/sarpsborg.json';
import fredrikstad from '../../../data/place-link-pilot/fredrikstad.json';
import report from '../../../data/place-link-pilot/report.json';

type Item=(typeof sarpsborg.items)[number]|(typeof fredrikstad.items)[number];
const all=[...sarpsborg.items,...fredrikstad.items] as Item[];
const confidenceLabel:{[key:string]:string}={high:'Flere metadatafelt',medium:'Navn i tittelen',low:'Svakere navnetreff'};
const number=(value:number)=>value.toLocaleString('nb-NO');

export default function PlaceLinkPilot(){
 const [city,setCity]=useState('Sarpsborg');
 const [source,setSource]=useState('');
 const [status,setStatus]=useState('');
 const [place,setPlace]=useState('');
 const [selectedKey,setSelectedKey]=useState<string|null>(null);
 const cityData=city==='Sarpsborg'?sarpsborg:fredrikstad;
 const places=cityData.relatedSources.map(row=>row.place);
 const shown=useMemo(()=>all.filter(item=>item.city===city&&(!source||item.source===source)&&(!status||(status==='none'?!item.matches.length:item.matches.some(match=>match.confidence===status)))&&(!place||item.matches.some(match=>match.place===place))),[city,source,status,place]);
 const selected=shown.find(item=>item.key===selectedKey)||null;
 const selectedIndex=selected?shown.indexOf(selected):-1;
 const sources=selected?cityData.relatedSources.filter(row=>selected.matches.some(match=>match.place===row.place)&&row.records.length):[];
 const pickCity=(value:string)=>{setCity(value);setPlace('');setSelectedKey(null)};
 return <><header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/kartlegging">Kartlegging</Link></header>
 <main className="coverage-main place-pilot-main"><Link className="pilot-back" href="/kartlegging"><ArrowLeft size={16}/> Tilbake til kartleggingen</Link><div className="eyebrow">NY PILOT · 400 BILDER FRA TO ARKIVER</div><h1>Hvilke steder hører bildene til?</h1><p className="coverage-lead">100 nye bilder fra Nasjonalbiblioteket og 100 fra DigitaltMuseum per by. Forslagene bygger på arkivtittel, emneord og stedsfelt. Ingen av disse 400 bildene er visuelt kontrollert i denne piloten.</p>
 <div className="place-pilot-stats">{report.cities.map(row=><div key={row.city}><b>{row.city}</b><span>{row.selected} bilder · {row.withPlaceSuggestion} med stedforslag · {row.withoutPlaceSuggestion} uten</span></div>)}</div>
 <section className="place-pilot-controls" aria-label="Filtrer stedspiloten"><label>By<select value={city} onChange={event=>pickCity(event.target.value)}><option>Sarpsborg</option><option>Fredrikstad</option></select></label><label>Kilde<select value={source} onChange={event=>{setSource(event.target.value);setSelectedKey(null)}}><option value="">Begge kilder</option><option>Nasjonalbiblioteket</option><option>DigitaltMuseum</option></select></label><label>Forslag<select value={status} onChange={event=>{setStatus(event.target.value);setSelectedKey(null)}}><option value="">Alle vurderinger</option><option value="high">Flere metadatafelt</option><option value="medium">Navn i tittelen</option><option value="low">Svakere navnetreff</option><option value="none">Uten stedforslag</option></select></label><label>Sted<select value={place} onChange={event=>{setPlace(event.target.value);setSelectedKey(null)}}><option value="">Alle steder</option>{places.map(name=><option key={name}>{name}</option>)}</select></label></section>
 <p className="pilot-result-count" role="status">{number(shown.length)} av 200 bilder i {city} med disse filtrene.</p>
 <div className="place-pilot-layout"><section className="place-pilot-grid" aria-label="Bilder til vurdering">{shown.map(item=><button className="place-pilot-card" key={item.key} onClick={()=>setSelectedKey(item.key)} aria-pressed={selectedKey===item.key}><img src={item.image} alt="" loading="lazy"/><span className="place-pilot-card-body"><small>{item.source} · {item.year}</small><strong>{item.title}</strong><span>{item.matches.length?item.matches.map(match=>match.place).join(' · '):'Uten stedforslag'}</span></span></button>)}</section>
 <aside className="place-pilot-detail">{selected?<><div className="place-pilot-navigation"><button disabled={selectedIndex<1} onClick={()=>setSelectedKey(shown[selectedIndex-1].key)}>← Forrige</button><span>{selectedIndex+1} / {shown.length}</span><button disabled={selectedIndex>=shown.length-1} onClick={()=>setSelectedKey(shown[selectedIndex+1].key)}>Neste →</button></div><img className="place-pilot-large" src={selected.image} alt=""/><h2>{selected.title}</h2><p>{selected.source} · {selected.year}</p><a href={selected.url} target="_blank" rel="noopener noreferrer">Åpne original og kildeopplysninger <ExternalLink size={14}/></a><h3>Stedforslag</h3>{selected.matches.length?selected.matches.map(match=><div className="place-pilot-match" key={match.place}><b>{match.place}</b><span>{confidenceLabel[match.confidence]}</span><small>Grunnlag: {match.evidence.map(e=>({title:'tittel',description:'lengre beskrivelse',place:'stedsfelt',subject:'emneord'} as Record<string,string>)[e.field]||e.field).join(' + ')}</small><small>{match.context}</small></div>):<p>Ingen av de kjente stedsnavnene ble funnet i metadata. Bildet kan likevel høre til et sted.</p>}<p className="small">{selected.coordinateStatus}. Forslagene trenger menneskelig kontroll av selve motivet.</p>{sources.length>0&&<><h3>Mulige kilder om stedene</h3>{sources.map(group=><div key={group.place}><h4>{group.place}</h4>{group.records.slice(0,5).map(record=><p key={record.key}><a href={record.url} target="_blank" rel="noopener noreferrer">{record.title} <ExternalLink size={13}/></a><br/><small>{record.type==='book'?'Bok':'Lokalhistorisk oppslag'} · navnet står i tittelen. Innholdet er ikke kontrollert mot bildet.</small></p>)}</div>)}</>}</>:<><h2>Velg et bilde</h2><p>Se hvilket stedsnavn som ble funnet, hvorfor det ble foreslått og eventuelle bok- eller artikkelkandidater.</p></>}</aside></div>
 <details className="pilot-method"><summary>Metode og begrensninger</summary><p>{report.selection}</p><p>{report.method}</p><p>«Flere metadatafelt» er sterkere dokumentasjon i katalogen, men ingen garanti for avbildet sted. Et navn langt ute i en beskrivelse regnes som svakere treff. Koordinater fra arkivet kan vise registrert sted, ikke kameraets posisjon. Bok- og artikkelforslag er bare tittelmatch; avisartikler er ikke koblet i denne piloten.</p></details></main></>;
}
