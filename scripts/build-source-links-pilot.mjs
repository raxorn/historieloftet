import fs from 'node:fs';

const photos=JSON.parse(fs.readFileSync('data/sarpsborg-1000.json','utf8')).items;
const byNumber=new Map(photos.map(photo=>[photo.pilotNumber,photo]));
const topics=[
 {id:'borregaard',name:'Borregaard fabrikker',kind:'Industriområde og virksomhet',aliases:['Borregaard Fabriker','Borregård fabrikker'],description:'Bildene er knyttet til Borregaard gjennom Nasjonalbibliotekets arkivtittel. Dette er en kobling til virksomheten eller området, ikke en påstand om en bestemt hendelse.'},
 {id:'sarpsfossen',name:'Sarpsfossen',kind:'Foss og landskap',aliases:['Sarpfossen','Sarpefossen'],description:'Bildene er knyttet til Sarpsfossen gjennom arkivtittelen. Ulike ståsteder og år gir ikke samme motivutsnitt eller hendelse.'}
];
const photoNumbers={
 borregaard:[74,86,114,136,233,236,352,450,459,464,476,492,514,531,575,591,601,624,814,955,456],
 sarpsfossen:[3,29,95,137,180,187,194,225,229,237,245,266,353,456,460,469,512,578,681,908]
};
const photoLinks=Object.entries(photoNumbers).flatMap(([topicId,numbers])=>numbers.map(number=>{
 const photo=byNumber.get(number);
 if(!photo)throw Error(`Missing photo ${number}`);
 const match=topicId==='borregaard'?/borregaard|borregård|borggaard/i:/sarps?foss|sarpfoss|sarpefoss/i;
 if(!match.test(photo.title))throw Error(`No title evidence for ${number} / ${topicId}`);
 return {photoId:photo.id,pilotNumber:number,topicId,relation:'motiv eller sted nevnt i arkivtittel',basis:`Arkivtittel: ${photo.title}`,status:'arkivbasert forslag'};
}));
const nb=id=>`https://www.nb.no/items/${id}`;
const sources=[
 {id:'dd7d43613bb8feacc5a34abff3198ff9',topicId:'borregaard',kind:'bok',title:'A/S Borregaard : bedriften vår i Sarpsborg',published:'1956',url:nb('dd7d43613bb8feacc5a34abff3198ff9'),access:'Kan leses fra Norge',relation:'bok om virksomheten',evidence:'Nasjonalbibliotekets katalogtittel og emneord navngir Borregaard. Ingen bestemt side er kontrollert.',status:'emnekobling'},
 {id:'2473ea58eb03df54a9a27d081840a244',topicId:'borregaard',kind:'bok',title:'Foredlet virke : historien om Borregaard 1889–1989',published:'1989',url:nb('2473ea58eb03df54a9a27d081840a244'),access:'Kan leses fra Norge',relation:'historisk oversikt',evidence:'Nasjonalbibliotekets katalogtittel navngir Borregaard og perioden. Ingen bestemt side er kontrollert.',status:'emnekobling'},
 {id:'1e639ebfaa62e97ef856924d2156ff1d',topicId:'sarpsfossen',kind:'bok',title:'Sarpsfossen i dikt og virkelighet',published:'1944',url:nb('1e639ebfaa62e97ef856924d2156ff1d'),access:'Kan leses fra Norge',relation:'bok om fossen',evidence:'Nasjonalbibliotekets katalogtittel navngir Sarpsfossen. Ingen bestemt side er kontrollert.',status:'emnekobling'},
 {id:'9ee1afac60488d0c283f8b9717422600',topicId:'sarpsfossen',kind:'bok',title:'Elektrisitet fra Sarpsfossen : gjennom 100 år, 1892–1992',published:'1992',url:nb('9ee1afac60488d0c283f8b9717422600'),access:'Kan leses fra Norge',relation:'historisk oversikt om kraftutbygging',evidence:'Nasjonalbibliotekets katalogtittel navngir Sarpsfossen. Ingen bestemt side er kontrollert.',status:'emnekobling'},
 {id:'85e3c8ea6390f0ec8f6f72ba770b9c73',topicId:'borregaard',kind:'avis',title:'Glommen',published:'14.12.1925',url:nb('85e3c8ea6390f0ec8f6f72ba770b9c73'),access:'Les hos Nasjonalbiblioteket; gjenbruk er begrenset',relation:'ordtreff i avisutgave',evidence:'NBs OCR-søk fant «Borregaard» på side 1. Artikkelens innhold og relevans for bildene er ikke kontrollert.',status:'må kontrolleres',page:'1'},
 {id:'46338b848965a422d1e498ef6b5b3ecc',topicId:'borregaard',kind:'avis',title:'Glommen',published:'04.07.1928',url:nb('46338b848965a422d1e498ef6b5b3ecc'),access:'Les hos Nasjonalbiblioteket; gjenbruk er begrenset',relation:'ordtreff i avisutgave',evidence:'NBs OCR-søk fant «Borregaard» på side 1 og 2. Artikkelens innhold og relevans for bildene er ikke kontrollert.',status:'må kontrolleres',page:'1–2'},
 {id:'d48e171722c056bda78b9ce0500c2299',topicId:'sarpsfossen',kind:'avis',title:'Glommen',published:'10.01.1925',url:nb('d48e171722c056bda78b9ce0500c2299'),access:'Les hos Nasjonalbiblioteket; gjenbruk er begrenset',relation:'ordtreff i avisutgave',evidence:'NBs OCR-søk fant «Sarpsfossen» på side 1. Artikkelens innhold og relevans for bildene er ikke kontrollert.',status:'må kontrolleres',page:'1'},
 {id:'b257b91210de4784d4576e9d527bb155',topicId:'sarpsfossen',kind:'avis',title:'Glommen',published:'07.12.1928',url:nb('b257b91210de4784d4576e9d527bb155'),access:'Les hos Nasjonalbiblioteket; gjenbruk er begrenset',relation:'ordtreff i avisutgave',evidence:'NBs OCR-søk fant «Sarpsfossen» på side 2. Artikkelens innhold og relevans for bildene er ikke kontrollert.',status:'må kontrolleres',page:'2'}
];
const data={id:'sarpsborg-source-links-v1',createdAt:new Date().toISOString(),method:'Kilde-ID-er, titler og tilgang fra Nasjonalbibliotekets katalog. Foto–motiv-koblinger bygger på arkivtitler. Bokkoblinger gjelder emnet, ikke en bestemt boksidestekst. Avisutgaver har bare verifisert OCR-ordtreff; artikkel og bildekobling er ikke kontrollert.',topics,photoLinks,sources};
if(new Set(photoLinks.map(x=>x.photoId)).size!==40)throw Error('Expected 40 unique photos');
fs.writeFileSync('data/sarpsborg-source-links.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({photos:new Set(photoLinks.map(x=>x.photoId)).size,photoLinks:photoLinks.length,books:sources.filter(x=>x.kind==='bok').length,newspapers:sources.filter(x=>x.kind==='avis').length}));
