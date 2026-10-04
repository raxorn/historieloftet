import fs from 'node:fs';

const photos=[...JSON.parse(fs.readFileSync('data/sarpsborg-1000.json','utf8')).items,...JSON.parse(fs.readFileSync('data/sarpsborg-pilot.json','utf8')).items];
const topics=[
 {id:'borregaard',name:'Borregaard',type:'Virksomhet og område',description:'Bilder der arkivtittelen nevner Borregaard, Borregård eller Borggaard. Fabrikker, hovedgård, tømmerlager og nærområde kan være ulike motiver.'},
 {id:'sarpsfossen',name:'Sarpsfossen',type:'Foss og landskap',description:'Bilder der arkivtittelen nevner Sarpsfossen eller en navnevariant. Fotoene kan vise ulike utsnitt, bredder og tidspunkter.'}
];
const patterns={borregaard:/borregaard|borregård|borggaard/i,sarpsfossen:/sarps?foss|sarpfoss|sarpefoss/i};
const photoTopics=photos.flatMap(photo=>topics.filter(topic=>patterns[topic.id].test(photo.title)).map(topic=>({photoId:photo.id,topicId:topic.id,basis:'Navnet forekommer i Nasjonalbibliotekets arkivtittel.'})));
const ids=new Set(photos.map(photo=>photo.id));
if(ids.size!==photos.length)throw Error('Duplicate photo IDs');
if(photoTopics.some(link=>!ids.has(link.photoId)))throw Error('Invalid photo link');
const data={id:'topic-index-v1',method:'Foreløpig motivindeks fra arkivtitler i de 1200 lagrede Sarpsborg-bildene. Den omfatter ikke alle treff i Nasjonalbibliotekets samling, og en navnelikhet er ikke en bekreftet identifikasjon av en bestemt bygning eller hendelse.',topics,photoTopics};
fs.writeFileSync('data/topic-index.json',JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify(Object.fromEntries(topics.map(topic=>[topic.id,new Set(photoTopics.filter(link=>link.topicId===topic.id).map(link=>link.photoId)).size]))));
