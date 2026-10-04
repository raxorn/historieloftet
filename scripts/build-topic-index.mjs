import fs from 'node:fs';

const filenames=fs.readdirSync('public/city-photos').filter(name=>/^(sarpsborg|fredrikstad)-\d{4}\.json$/.test(name));
const photos=[...new Map(filenames.flatMap(name=>JSON.parse(fs.readFileSync('public/city-photos/'+name,'utf8'))).map(photo=>[photo.id,photo])).values()];
const topics=[
 {id:'borregaard',name:'Borregaard',type:'Virksomhet og område',description:'Bilder der arkivtittelen nevner Borregaard, Borregård eller Borggaard. Fabrikker, hovedgård, tømmerlager og nærområde kan være ulike motiver.'},
 {id:'sarpsfossen',name:'Sarpsfossen',type:'Foss og landskap',description:'Bilder der arkivtittelen nevner Sarpsfossen eller en navnevariant. Fotoene kan vise ulike utsnitt, bredder og tidspunkter.'}
];
const patterns={borregaard:/borregaard|borregård|borggaard/i,sarpsfossen:/sarps?foss|sarpfoss|sarpefoss/i};
const photoTopics=photos.flatMap(photo=>topics.filter(topic=>patterns[topic.id].test(photo.title)).map(topic=>({photoId:photo.id,topicId:topic.id,basis:'Navnet forekommer i Nasjonalbibliotekets arkivtittel.'})));
const ids=new Set(photos.map(photo=>photo.id));
if(ids.size!==photos.length)throw Error('Duplicate photo IDs');
if(photoTopics.some(link=>!ids.has(link.photoId)))throw Error('Invalid photo link');
const data={id:'topic-index-v2',method:'Foreløpig motivindeks fra arkivtitler i de kartlagte Sarpsborg- og Fredrikstad-postene før 2000. Den omfatter ikke alle bilder i Nasjonalbibliotekets samling. En navnelikhet er ikke en bekreftet identifikasjon av en bestemt bygning eller hendelse.',topics,photoTopics};
fs.writeFileSync('data/topic-index.json',JSON.stringify(data,null,2)+'\n');
fs.mkdirSync('data/topic-photos',{recursive:true});
for(const topic of topics)fs.writeFileSync('data/topic-photos/'+topic.id+'.json',JSON.stringify(photos.filter(photo=>patterns[topic.id].test(photo.title)))+'\n');
console.log(JSON.stringify(Object.fromEntries(topics.map(topic=>[topic.id,new Set(photoTopics.filter(link=>link.topicId===topic.id).map(link=>link.photoId)).size]))));
