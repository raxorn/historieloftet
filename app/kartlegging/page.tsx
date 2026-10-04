import Link from 'next/link';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import audit from '../../data/city-coverage-report.json';
import sources from '../../data/topic-source-discovery.json';

const number=(value:number)=>value.toLocaleString('nb-NO');
const establishedPages:Record<string,string>={Borregaard:'/utforsk/borregaard',Sarpsfossen:'/utforsk/sarpsfossen'};

export default function CoveragePage(){
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/utforsk">Utforsk steder</Link></header>
  <main className="coverage-main">
   <Link className="pilot-back" href="/"><ArrowLeft size={16}/> Tilbake til bildene</Link>
   <div className="eyebrow">KARTLEGGING · SARPSBORG OG FREDRIKSTAD</div><h1>Hvor langt har vi kommet?</h1>
   <p className="coverage-lead">Alle de lagrede bildekatalogpostene før 2000 er telt opp. Motivet i mange bilder er ennå ikke kontrollert visuelt, og kildesøkene gir kandidater som må vurderes før de kan kobles til et bestemt bilde.</p>
   <div className="coverage-stats"><div><b>{number(audit.total)}</b><span>poster i bysamlingene ({number(audit.uniquePhotos)} unike bilder)</span></div><div><b>{number(audit.visuallyReviewed)}</b><span>med visuell gjennomgang registrert</span></div><div><b>{number(audit.unresolved)}</b><span>med uavklart motivgruppe</span></div></div>
   {audit.cities.map(city=><section className="coverage-city" key={city.city}><div className="coverage-city-head"><div><h2>{city.city}</h2><p>{number(city.total)} fotoposter · {number(city.visuallyReviewed)} visuelt gjennomgått · {number(city.unresolved)} uavklarte</p></div><Link href={'/samling/'+city.city.toLowerCase()}>Se alle bildene</Link></div><h3>Største arkivgrupper</h3><div className="coverage-groups">{city.groupCounts.slice(0,8).map(group=><span key={group.name}>{group.name} <b>{number(group.count)}</b></span>)}</div><h3>Navngitte steder som kan bli temasider</h3><div className="coverage-topics">{city.namedPlaces.filter(place=>place.count>=10).map(place=>{const found=sources.topics.find(topic=>topic.city===city.city&&topic.name===place.name);return <article key={place.name}><h4>{establishedPages[place.name]?<Link href={establishedPages[place.name]}>{place.name}</Link>:place.name}</h4><p>{number(place.count)} bilder med navnet i arkivopplysningene. {number(place.visuallyReviewed)} har registrert visuell gjennomgang.</p>{found&&<><p>{number(found.bookTitleHits||0)} mulige boktreff på navnet i tittelen. Dette er ikke bekreftede bok–bilde-koblinger.</p><div className="coverage-links"><a href={found.bookSearchUrl} target="_blank" rel="noopener noreferrer">Søk bøker hos NB <ExternalLink size={14}/></a><a href={found.newspaperSearchUrl} target="_blank" rel="noopener noreferrer">Søk avisutgaver hos NB <ExternalLink size={14}/></a></div></>}</article>})}</div></section>)}
   <section className="coverage-next"><h2>Hva gjenstår før en full bildekobling?</h2><ol><li>Kontrollere motivet i de uavklarte bildene, særlig flyfoto, med bildeanalyse og stikkprøver.</li><li>Skille sted, motiv og kameravinkel. Et stedsnavn i arkivet er ikke en bekreftet GPS-posisjon.</li><li>Gå gjennom bokkapitler og avisartikler. Søketreff i en avisutgave er ikke bevis for at den omtaler bildet.</li><li>Lagre kilde, metode og sikkerhet for hver kobling, slik at feil kan rettes.</li></ol><p className="small">Denne gjennomgangen bruker lagrede NB-katalogposter. Den omfatter ikke alle fotografier som eksisterer hos NB, DigitaltMuseum eller andre arkiver. Ingen ny betalt bildeanalyse er kjørt i denne gjennomgangen.</p></section>
  </main>
 </>;
}
