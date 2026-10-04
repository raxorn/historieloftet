import fs from 'node:fs';
import {topicBasis} from '../lib/topic-matching.ts';

const filenames=fs.readdirSync('public/city-photos').filter(name=>/^(sarpsborg|fredrikstad)-\d{4}\.json$/.test(name));
const photos=[...new Map(filenames.flatMap(name=>JSON.parse(fs.readFileSync('public/city-photos/'+name,'utf8'))).map(photo=>[photo.id,photo])).values()];
const topics=[
 {id:'borregaard',name:'Borregaard',type:'Virksomhet og område',description:'Bilder der arkivtittel eller stedsopplysninger nevner Borregaard, Borregård eller Borggaard. Fabrikker, hovedgård, tømmerlager og nærområde kan være ulike motiver.'},
 {id:'sarpsfossen',name:'Sarpsfossen',type:'Foss og landskap',description:'Bilder der arkivtittel eller stedsopplysninger nevner Sarpsfossen, Sarpefossen eller en navnevariant. Fotoene kan vise ulike utsnitt, bredder og tidspunkter.'}
];
const photoTopics=photos.flatMap(photo=>topics.map(topic=>({photoId:photo.id,topicId:topic.id,basis:topicBasis(topic.id,photo)})).filter(link=>link.basis));
const ids=new Set(photos.map(photo=>photo.id));
if(ids.size!==photos.length)throw Error('Duplicate photo IDs');
if(photoTopics.some(link=>!ids.has(link.photoId)))throw Error('Invalid photo link');
const data={id:'topic-index-v3',method:'Foreløpig motivindeks fra arkivtitler og registrerte steds- og motivopplysninger i de kartlagte Sarpsborg- og Fredrikstad-postene før 2000. Den omfatter ikke alle bilder i Nasjonalbibliotekets samling. Et stedsnavn i arkivet er ikke en visuelt bekreftet identifikasjon av en bestemt bygning eller hendelse.',topics,photoTopics};
fs.writeFileSync('data/topic-index.json',JSON.stringify(data,null,2)+'\n');
fs.mkdirSync('data/topic-photos',{recursive:true});
for(const topic of topics){const ids=new Set(photoTopics.filter(link=>link.topicId===topic.id).map(link=>link.photoId));fs.writeFileSync('data/topic-photos/'+topic.id+'.json',JSON.stringify(photos.filter(photo=>ids.has(photo.id)))+'\n')}
console.log(JSON.stringify(Object.fromEntries(topics.map(topic=>[topic.id,new Set(photoTopics.filter(link=>link.topicId===topic.id).map(link=>link.photoId)).size]))));
