export const topicFacets=[
 {id:'foss',label:'Foss og elv'},
 {id:'industri',label:'Industri og maskiner'},
 {id:'broer',label:'Broer og veier'},
 {id:'flyfoto',label:'Flyfoto'},
 {id:'annet',label:'Annet / uavklart'}
] as const;

export type TopicFacet=(typeof topicFacets)[number]['id'];

export function topicFacetFor(group:string):TopicFacet{
 if(group.startsWith('Flyfoto'))return 'flyfoto';
 if(group==='Broer, jernbane og veier')return 'broer';
 if(['Sarpsfossen og Glomma','Foss og elvelandskap','Elv og vannlandskap','Natur og landskap'].includes(group))return 'foss';
 if(['Industri og arbeidsliv','Industri ved elven','Industri utvendig','Industriinteriør og maskiner','Tømmer og elvelager'].includes(group))return 'industri';
 return 'annet';
}
