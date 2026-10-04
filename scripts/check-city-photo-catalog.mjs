import fs from 'node:fs';
const catalog=JSON.parse(fs.readFileSync('data/city-photo-catalog.json','utf8'));
const topicIndex=JSON.parse(fs.readFileSync('data/topic-index.json','utf8'));
const all=[];
for(const city of catalog.cities){
 const items=city.decades.flatMap(({decade,count})=>{
  const shard=JSON.parse(fs.readFileSync(`public/city-photos/${city.city.toLowerCase()}-${decade}.json`,'utf8'));
  if(shard.length!==count)throw Error(`${city.city} ${decade}: expected ${count}, got ${shard.length}`);
  if(shard.some(item=>Math.floor(item.sortYear/10)*10!==decade))throw Error(`${city.city} ${decade}: misplaced year`);
  return shard;
 });
 if(items.length!==city.items)throw Error(`${city.city}: wrong total`);
 if(new Set(items.map(item=>item.id)).size!==items.length)throw Error(`${city.city}: duplicate ID`);
 if(items.filter(item=>item.image&&item.inlineReadable).length!==city.displayable)throw Error(`${city.city}: wrong display count`);
 all.push(...items);
}
const ids=new Set(all.map(item=>item.id));
if(topicIndex.photoTopics.some(link=>!ids.has(link.photoId)))throw Error('Topic photo missing from city catalog');
for(const topic of topicIndex.topics){
 const photos=JSON.parse(fs.readFileSync(`data/topic-photos/${topic.id}.json`,'utf8'));
 const expected=topicIndex.photoTopics.filter(link=>link.topicId===topic.id).length;
 if(photos.length!==expected)throw Error(`${topic.id}: wrong topic count`);
}
console.log(JSON.stringify({cityRecords:all.length,uniqueAcrossCities:ids.size,topicLinks:topicIndex.photoTopics.length,decades:catalog.cities.reduce((sum,city)=>sum+city.decades.length,0)}));
