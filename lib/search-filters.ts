export type AccessFilter='all'|'available'|'open'|'norway'|'restricted'|'offline';
// IA can label an audiobook plus cover art as mediatype:image. Require image
// formats and exclude audiovisual formats upstream so totals/pagination agree.
// quotedTerm is escaped with literal() by the caller, never raw user input.
export function iaPhotoQuery(quotedTerm:string){
 const topic=quotedTerm?`(title:${quotedTerm} OR subject:${quotedTerm} OR coverage:${quotedTerm})`:'*:*';
 return topic+' AND mediatype:image AND format:(JPEG OR PNG OR TIFF OR GIF OR "JPEG 2000") AND NOT format:("VBR MP3" OR "Ogg Vorbis" OR MP3 OR Flac OR WAVE OR MPEG4 OR "Ogg Video")';
}
export function nbFilters(access:AccessFilter,includeCatalog:boolean){
 const filters:string[]=[];
 if(access==='offline')return ['digital:(NOT Ja)'];
 if(!includeCatalog||access!=='all')filters.push('digital:Ja');
 const classes={available:'(public OR bokhylla)',open:'public',norway:'bokhylla',restricted:'restricted'};
 if(access in classes)filters.push('contentClasses:'+classes[access as keyof typeof classes]);
 return filters;
}
export function iaAccessQuery(access:AccessFilter){
 if(access==='norway'||access==='offline')return null;
 if(access==='open'||access==='available')return ' AND NOT access-restricted-item:true';
 if(access==='restricted')return ' AND access-restricted-item:true';
 return '';
}
