import fs from 'node:fs';
const base='data/source-harvest/';
const read=name=>JSON.parse(fs.readFileSync(`${base}sarpsborg-${name}.json`,'utf8'));
const dm=read('digitaltmuseum'),nbBooks=read('nb-books'),nbMaps=read('nb-maps'),nbPhotos=read('nb-photos-title'),heritage=read('kulturminnesok'),commons=read('commons'),names=read('kartverket-names');
const harvest=read('summary');
const counts=items=>Object.entries(items.reduce((result,item)=>{result[item]=(result[item]||0)+1;return result},{})).sort((a,b)=>b[1]-a[1]).map(([name,count])=>({name,count}));
const sample=(items,amount=8)=>items.filter(item=>item.title).slice(0,amount).map(item=>({title:item.title,url:item.url}));
const report={
 fetchedAt:new Date().toISOString(),
 scope:'Sarpsborg – innsamlet katalogmetadata, ikke ferdig koblet til bilder eller stedssider. Treff fra forskjellige kilder kan overlappe.',
 sourceStatus:{
  nationalLibrary:{photosWithSarpsborgInTitle:nbPhotos.length,booksWithSarpsborgInTitleOrSubject:nbBooks.length,mapsWithSarpsborgInTitle:nbMaps.length,newspaperArticles:'Ikke hentet. Avisutgaver/ordtreff er ikke det samme som verifiserte artikler.',examples:{books:sample(nbBooks),maps:sample(nbMaps)}},
  digitaltMuseum:{catalogPhotoSearchHits:harvest.sources.digitaltmuseum.counts.photographs.reported,recordsSampled:dm.length,photosSampled:dm.filter(item=>item.type==='Photograph').length,artworksSampled:dm.filter(item=>item.type==='Fineart').length,withMedia:dm.filter(item=>item.image).length,explicitSarpsborgPlace:dm.filter(item=>String(item.place).toLocaleLowerCase('nb-NO').includes('sarpsborg')).length,licenses:counts(dm.flatMap(item=>item.license||[])).slice(0,12),owners:counts(dm.map(item=>item.owner)).slice(0,12),complete:false,limitation:'Demo-nøkkelen returnerer maksimalt ti poster per forespørsel. Uttrekket er et spredt utvalg av søkeresultatene, ikke alle 15 530 fototreffene. Full innhenting krever egnet API-nøkkel og kontroll av søkerelevans.',examples:{photographs:sample(dm.filter(item=>item.type==='Photograph')),artworks:sample(dm.filter(item=>item.type==='Fineart'))}},
  kulturminnesok:{municipalityMatches:heritage.length,withImages:heritage.filter(item=>item.images.length).length,imageReferences:heritage.reduce((sum,item)=>sum+item.images.length,0),examples:sample(heritage)},
  commons:{fileTitleMatches:commons.length,licenseMetadataCollected:commons.filter(item=>item.license).length,limitation:'Filene er søketreff på navnet. Lisens og avbildet sted må kontrolleres for hvert verk før visning eller kobling.',examples:sample(commons)},
  kartverket:{uniqueNamesRetrieved:names.length,withCoordinates:names.filter(item=>item.representasjonspunkt).length,limitation:'Stedsnavn og koordinater hjelper identifikasjon, men et registrert punkt er ikke fotografiets kamerastandpunkt.',examples:names.filter(item=>['By','Tettsted','Foss','Fabrikk','Bru'].includes(item.navneobjekttype)).slice(0,12).map(item=>({title:item.skrivemåte,type:item.navneobjekttype}))},
  europeana:{status:'API-nøkkel kreves før bulk-uttak. Ikke hentet.'},
  digitalarkivet:{status:'Ingen egnet offentlig API for bulk-uttak av bildesøket er bekreftet. Ikke hentet.'}
 },
 next:'Normaliser stedsnavn, dedupliser mellom kilder, vurder avbildet sted og rettigheter, og koble konkrete bokpassasjer og avisartikler til steder. Ingen av disse koblingene er verifisert av dette uttrekket.'
};
fs.writeFileSync(`${base}sarpsborg-report.json`,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({nb:report.sourceStatus.nationalLibrary,dm:{sampled:dm.length,licenses:report.sourceStatus.digitaltMuseum.licenses},heritage:report.sourceStatus.kulturminnesok.municipalityMatches,commons:commons.length,names:names.length},null,2));
