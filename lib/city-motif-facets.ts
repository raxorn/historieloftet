export const cityMotifFacets=[
 {id:'flyfoto',label:'Flyfoto'},
 {id:'kirker',label:'Kirker og kulturminner'},
 {id:'bebyggelse',label:'Bygninger og byliv'},
 {id:'industri',label:'Industri og maskiner'},
 {id:'samferdsel',label:'Broer, veier og tog'},
 {id:'vann',label:'Foss, elv og havn'},
 {id:'natur',label:'Natur og landskap'},
 {id:'folk',label:'Mennesker og hendelser'},
 {id:'annet',label:'Annet / uavklart'}
] as const;
export type CityMotifFacet=(typeof cityMotifFacets)[number]['id'];

export function cityMotifFacetFor(group:string):CityMotifFacet{
 if(group.startsWith('Flyfoto'))return 'flyfoto';
 if(/Kirke|Grav|Museum|Festningsverk|Ruiner/.test(group))return 'kirker';
 if(/Industri|Tømmer/.test(group))return 'industri';
 if(/Broer|Jernbane/.test(group))return 'samferdsel';
 if(/Sarpsfossen|Foss|Elv|Havn|Kyst|Strand/.test(group))return 'vann';
 if(/Gårder|Bygninger|Gater|Torg|Parker|alleer/.test(group))return 'bebyggelse';
 if(/Natur|landskap|Botanikk/.test(group))return 'natur';
 if(/Mennesker|festlighetene/.test(group))return 'folk';
 return 'annet';
}
