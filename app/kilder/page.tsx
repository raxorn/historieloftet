import Link from 'next/link';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import report from '../../data/source-coverage-report.json';

const number=(value:number)=>value.toLocaleString('nb-NO');
const sourceLinks=[
 {name:'Nasjonalbiblioteket',url:'https://www.nb.no/search'},
 {name:'DigitaltMuseum',url:'https://digitaltmuseum.no/'},
 {name:'Europeana',url:'https://www.europeana.eu/en/search'},
 {name:'Kulturminnesøk',url:'https://www.kulturminnesok.no/'},
 {name:'Wikimedia Commons',url:'https://commons.wikimedia.org/wiki/Main_Page'},
];

export default function SourcesPage(){
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/kartlegging">Kartlegging</Link></header>
  <main className="coverage-main">
   <Link className="pilot-back" href="/kartlegging"><ArrowLeft size={16}/> Tilbake til kartleggingen</Link>
   <div className="eyebrow">KILDEINNSAMLING · SARPSBORG OG FREDRIKSTAD</div><h1>Hva finnes i arkivene?</h1>
   <p className="coverage-lead">Vi har samlet katalogopplysninger fra åpne søk etter bilder, kunst, bøker, kart og kulturminner. Tallene er søketreff og kandidater, ikke ferdig kontrollerte verk. De samme bildene kan ligge i flere arkiver, og et stedsnavn i en tittel beviser ikke at bildet viser stedet.</p>
   {report.cities.map(city=><section className="coverage-city" key={city.city}>
    <div className="coverage-city-head"><div><h2>{city.city}</h2><p>{number(city.sourceCounts.existingNbPhotoCatalog)} bilder i Historieløftets eksisterende NB-katalog</p></div>{city.city==='Sarpsborg'&&<Link href="/kilder/sarpsborg">Se detaljert Sarpsborg-uttrekk</Link>}</div>
    <div className="coverage-stats"><div><b>{number(city.candidateCounts.sourceOccurrences)}</b><span>kildeposter i nye søkeuttrekk</span></div><div><b>{number(city.candidateCounts.exactSourceIdUnique)}</b><span>kandidater etter sammenslåing på eksakt kilde-ID</span></div><div><b>{number(city.candidateCounts.knownInExistingNbPhotoCatalog)}</b><span>NB-poster som allerede finnes i bildekatalogen</span></div></div>
    <div className="coverage-topics">
     <article><h4>Nasjonalbiblioteket</h4><p>{number(city.sourceCounts.nbTitlePhotos)} bildetitler · {number(city.sourceCounts.nbBooks)} bokposter · {number(city.sourceCounts.nbMaps)} kart</p><p>Disse søkene er avgrenset til bynavn i tittel, eller tittel/emne for bøker. Årstaller og rettigheter må vurderes per post.</p></article>
     <article><h4>DigitaltMuseum</h4><p>{number(city.sourceCounts.digitaltMuseumReportedPhotographs)} rapporterte fototreff · {number(city.sourceCounts.digitaltMuseumSampledPhotos)} i lokalt utvalg</p><p>{number(city.sourceCounts.digitaltMuseumReportedArt)} rapporterte kunsttreff · {number(city.sourceCounts.digitaltMuseumSampledArt)} i lokalt utvalg. Demo-tilgangen gir bare et spredt utvalg, ikke komplette samlinger.</p></article>
     <article><h4>Europeana</h4><p>{number(city.sourceCounts.europeanaTitleHits)} titteltreff · {number(city.sourceCounts.europeanaBroadHits)} brede treff</p><p>{number(city.sourceCounts.europeanaTitleLinksToDigitaltMuseum)} av titteltreffene peker til DigitaltMuseum. Brede treff kan omtale byen uten å vise den.</p></article>
     <article><h4>Kulturminnesøk</h4><p>{number(city.sourceCounts.kulturminnesokRecords)} registreringer · {number(city.sourceCounts.kulturminnesokWithImages)} med bilder</p><p>Registreringene er knyttet til kommunen, men de er ikke automatisk gamle bilder av byen.</p></article>
     <article><h4>Wikimedia Commons</h4><p>{number(city.sourceCounts.commonsFileSearchHits)} filnavntreff</p><p>Avbildet sted og filens egen lisens er ennå ikke kontrollert.</p></article>
    </div>
   </section>)}
   <section className="coverage-next"><h2>Hva betyr «nye kandidater»?</h2><p>Kandidatene er lagret med kilde-ID, original-lenke, tittel, type, datering og oppgitt rettighetsinformasjon. Vi slår sammen poster som peker til nøyaktig samme kilde-ID. Ulike skanninger og kopier av samme motiv kan fortsatt stå hver for seg. Vi har ikke vist disse som nye bilder på forsiden, og vi har ikke verifisert avisartikler eller bilde–bok-koblinger.</p><p>Høyeste prioritet videre er å kontrollere motiv og rettigheter, hente resten av DigitaltMuseums resultater med egnet tilgang og undersøke lokale samlinger som bare delvis ligger på nett.</p><div className="coverage-links">{sourceLinks.map(source=><a href={source.url} key={source.name} target="_blank" rel="noopener noreferrer">{source.name} <ExternalLink size={14}/></a>)}</div></section>
   <section className="coverage-next"><h2>Lokale samlinger vi må avklare tilgang til</h2><p><a href="https://sarpsborg.arena.axiell.com/-/sarpsborg-kommunes-fotosamling" target="_blank" rel="noopener noreferrer">Sarpsborg kommunes fotosamling <ExternalLink size={14}/></a> oppgir rundt 12 000 bilder, hvorav 7 500 er søkbare i DigitaltMuseum. <a href="https://ostfoldmuseene.no/ofb/om" target="_blank" rel="noopener noreferrer">Østfold fylkes billedarkiv <ExternalLink size={14}/></a> opplyser at bare en liten del av samlingen er søkbar der. <a href="https://ostfoldmuseene.no/fredrikstad/aktiviteter/kulturpunkt/stangebyesamlingen" target="_blank" rel="noopener noreferrer">Stangebye-samlingen <ExternalLink size={14}/></a> knytter malerier og fotografier til steder i Fredrikstad.</p><p>Dette er lovende kilder, men vi har ennå ikke fått et komplett datauttrekk fra dem. Bilder og metadata utenfor åpne kataloger krever avklart tilgang og bruksrett.</p></section>
  </main>
 </>;
}
