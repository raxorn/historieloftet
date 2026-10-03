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
