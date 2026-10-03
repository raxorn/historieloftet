export type AccessFilter='all'|'available'|'open'|'norway'|'restricted'|'offline';
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
