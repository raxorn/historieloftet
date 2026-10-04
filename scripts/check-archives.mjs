import assert from 'node:assert/strict';
import {nbItem,iaItem,literal} from '../lib/archive.ts';
import {nbFilters,iaAccessQuery} from '../lib/search-filters.ts';
const record={id:'example',metadata:{title:'Bergen',dateCreated:'1900',mediaTypes:['bilder']},_links:{thumbnail_large:{href:'https://example.org/image.jpg'}}};
const open={isDigital:true,accessAllowedFrom:'EVERYWHERE',viewability:'ALL',isPublicDomain:true};
assert.equal(nbItem({...record,accessInfo:open}).open,true);
assert.equal(nbItem({...record,accessInfo:open}).year,'1900');
assert.ok(nbItem({...record,accessInfo:open}).image);
for(const patch of [{accessAllowedFrom:'NORWAY'},{viewability:'NONE'},{isDigital:false}])assert.equal(nbItem({...record,accessInfo:{...open,...patch}}).open,false);
assert.equal(nbItem({...record,accessInfo:{...open,isPublicDomain:false}}).image,undefined);
assert.equal(nbItem(record).open,false);
assert.equal(iaItem({identifier:'example',mediatype:'audio',licenseurl:'https://creativecommons.org/publicdomain/zero/1.0/'}).open,false);
assert.equal(literal('Bergen" OR *:*'),'"Bergen  OR *:*"');
assert.deepEqual(nbFilters('available',false),['digital:Ja','contentClasses:(public OR bokhylla)']);
assert.deepEqual(nbFilters('open',true),['digital:Ja','contentClasses:public']);
assert.deepEqual(nbFilters('norway',false),['digital:Ja','contentClasses:bokhylla']);
assert.deepEqual(nbFilters('restricted',false),['digital:Ja','contentClasses:restricted']);
assert.deepEqual(nbFilters('offline',false),['digital:(NOT Ja)']);
assert.deepEqual(nbFilters('all',true),[]);
assert.ok(iaAccessQuery('available').includes('NOT access-restricted-item:true'));
assert.equal(iaAccessQuery('norway'),null);
assert.equal(nbItem({...record,accessInfo:{isDigital:false}}).access,'Ikke digitalisert');
assert.equal(nbItem({...record,accessInfo:{...open,accessAllowedFrom:'NORWAY'}}).accessGroup,'norway');
console.log('Access mapping, unknown rights, photo dates, and literal query checks passed.');

for(const license of ['ccby','ccbync','ccbysa','cc0']){
 const item=nbItem({...record,accessInfo:{...open,isPublicDomain:false,license}});
 assert.equal(item.inlineReadable,true); assert.ok(item.licenseUrl); assert.ok(item.image);
 assert.equal(nbItem({...record,accessInfo:{...open,isPublicDomain:false,license,accessAllowedFrom:'NORWAY'}}).inlineReadable,false);
}
for(const license of ['bokhylla','unknown'])assert.equal(nbItem({...record,accessInfo:{...open,isPublicDomain:false,license}}).inlineReadable,false);
assert.equal(nbItem({...record,metadata:{...record.metadata,originInfo:{issued:'19500828'}}}).year,'28.08.1950');

import {parsePeriod,periodFilter,periodLabel} from '../lib/period.ts';
assert.equal(periodFilter('1900-1999'),'year:[1900 TO 1999]');
assert.equal(periodFilter('1910-1919'),'year:[1910 TO 1919]');
assert.equal(periodFilter('1913'),'year:1913');
assert.equal(periodFilter('undated'),'NOT year:[* TO *]');
assert.equal(periodFilter(''),'');
for(const value of ['1919-1910','1900 OR *:*','19','2100','1900-'])assert.equal(parsePeriod(value),null);
assert.equal(periodLabel('1900'),'1900');
assert.equal(periodLabel('1900-1999'),'1900-tallet (1900–1999)');
console.log('Century, decade, exact year, undated and invalid period checks passed.');

import {compareItems,itemYear,yearHeading} from '../lib/chronology.ts';
const dated=(year,source='nb',id=year)=>({year,source,id});
assert.equal(itemYear(dated('06.06.1996')),1996);
assert.equal(itemYear(dated('1900–1930')),1900);
assert.equal(itemYear({...dated('1900'),sortYear:null}),null);
assert.equal(yearHeading(dated('')), 'Udatert');
for(const order of ['oldest','newest']){
 const items=[dated(''),dated('1996'),dated('1900','ia'),dated('1900','nb')].sort((a,b)=>compareItems(a,b,order));
 assert.equal(items.at(-1).year,'');
 assert.deepEqual(items.slice(0,3).map(itemYear),order==='oldest'?[1900,1900,1996]:[1996,1900,1900]);
}
console.log('Chronological direction, full dates, ties and undated-last checks passed.');

import {comparePlaces,placeHeading} from '../lib/chronology.ts';
assert.deepEqual(['Sarpsborg','','Halden','Aremark'].sort(comparePlaces),['Aremark','Halden','Sarpsborg','']);
assert(compareItems({...dated('1900'),sortPlace:'Halden'},{...dated('1900'),sortPlace:'Sarpsborg'},'newest')<0);
assert(compareItems({...dated('1900'),sortPlace:'Sarpsborg'},{...dated('1901'),sortPlace:'Aremark'},'oldest')<0);
assert.equal(placeHeading(dated('1900')),'Uten registrert by / kommune');
console.log('Year then place ordering and missing-place grouping checks passed.');
