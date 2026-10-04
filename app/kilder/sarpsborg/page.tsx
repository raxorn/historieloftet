import Link from 'next/link';
import {Archive,ArrowLeft,ExternalLink} from 'lucide-react';
import report from '../../../data/source-harvest/sarpsborg-report.json';

const format=(value:number)=>value.toLocaleString('nb-NO');
const sources=[
 {name:'Nasjonalbiblioteket',stat:`${format(report.sourceStatus.nationalLibrary.photosWithSarpsborgInTitle)} bildetitler · ${format(report.sourceStatus.nationalLibrary.booksWithSarpsborgInTitleOrSubject)} bøker · ${format(report.sourceStatus.nationalLibrary.mapsWithSarpsborgInTitle)} kart`,detail:'Katalogposter med Sarpsborg i tittel eller emne. Bøkene og kartene er ikke koblet til bestemte bilder.',url:'https://www.nb.no/search'},
 {name:'DigitaltMuseum',stat:`${format(report.sourceStatus.digitaltMuseum.catalogPhotoSearchHits)} fototreff · ${format(report.sourceStatus.digitaltMuseum.photosSampled)} poster i utvalget`,detail:'Søket er bredt. Demo-tilgangen ga et spredt utvalg, ikke et fullstendig uttrekk. Rettigheter varierer mellom postene.',url:'https://digitaltmuseum.no/search/?q=Sarpsborg'},
 {name:'Kulturminnesøk',stat:`${format(report.sourceStatus.kulturminnesok.municipalityMatches)} brukerregistreringer · ${format(report.sourceStatus.kulturminnesok.withImages)} med bilde`,detail:'Registreringene er knyttet til Sarpsborg kommune. Brukerinnhold er ikke i seg selv bekreftelse på vernestatus.',url:'https://www.kulturminnesok.no/'},
 {name:'Wikimedia Commons',stat:`${format(report.sourceStatus.commons.fileTitleMatches)} filnavntreff`,detail:'Søketreffene mangler kontroll av avbildet sted og filspesifikk lisens. De er ikke klare for automatisk publisering.',url:'https://commons.wikimedia.org/w/index.php?search=Sarpsborg&title=Special:MediaSearch&type=image'},
 {name:'Kartverket',stat:`${format(report.sourceStatus.kartverket.uniqueNamesRetrieved)} unike stedsnavn hentet`,detail:'Stedsnavn og koordinater kan støtte stedskobling. Punktet er ikke fotografiets kamerastandpunkt; uttrekket kan være ufullstendig.',url:'https://www.kartverket.no/api-og-data/stedsnavndata'}
];

export default function SarpsborgSourcesPage(){
 return <>
  <header className="top"><Link href="/" className="brand"><Archive size={24}/><span>Historieloftet<span className="brand-small">ET STED FOR GAMLE SPOR</span></span></Link><Link href="/kartlegging">Kartlegging</Link></header>
  <main className="coverage-main">
   <Link className="pilot-back" href="/kartlegging"><ArrowLeft size={16}/> Tilbake til kartleggingen</Link>
   <div className="eyebrow">KILDEUTTREKK · SARPSBORG</div><h1>Hva har vi funnet i andre arkiver?</h1>
   <p className="coverage-lead">Dette er lagrede katalogdata og søketreff, ikke ferdig kontrollerte bilder av Sarpsborg. Kildene overlapper. Tallene nedenfor kan derfor ikke legges sammen til ett antall historiske verk.</p>
   <div className="coverage-topics">{sources.map(source=><article key={source.name}><h4>{source.name}</h4><p><b>{source.stat}</b></p><p>{source.detail}</p><a href={source.url} target="_blank" rel="noopener noreferrer">Se kilden <ExternalLink size={14}/></a></article>)}</div>
   <section className="coverage-next"><h2>Hva mangler?</h2><p>Avisartikler er ikke hentet eller verifisert. Et ordtreff i en avisutgave beviser ikke at en artikkel handler om et sted eller et bilde. Europeana krever API-nøkkel for et større uttrekk; DigitaltMuseum krever egnet nøkkel for hele søkeresultatet. Arkivverkets bildesøk er heller ikke hentet i bulk.</p><p>Før materialet blir del av stedssidene, må vi deduplisere, kontrollere hva hvert bilde viser, lese relevante bokpassasjer og artikler, og ta vare på kilde, rettigheter og sikkerhet for hver kobling.</p></section>
  </main>
 </>;
}
