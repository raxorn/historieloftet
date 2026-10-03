export type RecordItem = {id:string; source:string; title:string; year:string; creator:string; kind:string; url:string; image?:string; access:string; accessGroup?:string; digital?:boolean; publicDomain?:boolean; open:boolean; rights:string; description:string};
export const str=(v:unknown):string=>Array.isArray(v)?v.map(str).join(', '):typeof v==='string'?v:typeof v==='number'?String(v):'';
export function nbItem(x:any):RecordItem {
 const m=x.metadata||{}, a=x.accessInfo||{}; const kind=str(m.mediaTypes);
 const open=a.isDigital===true&&a.accessAllowedFrom==='EVERYWHERE'&&a.viewability==='ALL';
 const accessGroup=a.isDigital===false?'offline':open?'open':a.accessAllowedFrom==='NORWAY'?'norway':a.isDigital&&a.accessAllowedFrom&&a.accessAllowedFrom!=='EVERYWHERE'?'restricted':'unknown';
 const access=({offline:'Ikke digitalisert',open:'Fritt tilgjengelig',norway:'Kan åpnes fra Norge',restricted:'Krever særskilt tilgang',unknown:'Tilgang ikke avklart'} as any)[accessGroup];
 const thumb=x._links?.thumbnail_custom?.href?.replace('{width}','600').replace('{height}','')||x._links?.thumbnail_large?.href;
 return {id:x.id,source:'nb',title:str(m.title)||'Uten tittel',year:str(m.originInfo?.issued)||str(m.dateCreated),creator:str(m.creators),kind:kind.includes('avis')?'Aviser':kind.includes('bøker')?'Bøker':kind.includes('bilde')||kind.includes('foto')?'Bilder':kind.includes('lyd')||kind.includes('musikk')?'Lyd':kind||'Katalog',url:'https://www.nb.no/items/'+encodeURIComponent(x.id),image:a.isPublicDomain&&open?thumb:undefined,access,accessGroup,digital:a.isDigital,publicDomain:a.isPublicDomain===true,open,rights:a.isPublicDomain?'Public domain':a.license==='bokhylla'?'Bokhylla-avtalen':a.license?'Kildens lisens: '+a.license:'Gjenbruksrettigheter ikke oppgitt',description:[m.originInfo?.publisher,m.geographic?.city,m.pageCount?m.pageCount+(m.pageCount===1?' side':' sider'):''].filter(Boolean).join(' · ')};
}
export function iaItem(x:any):RecordItem {
 const restricted=String(x['access-restricted-item'])==='true';
 return {id:x.identifier,source:'ia',title:str(x.title)||x.identifier,year:str(x.year)||str(x.date).slice(0,10),creator:str(x.creator),kind:x.mediatype==='audio'?'Lyd':x.mediatype==='image'?'Bilder':x.mediatype==='texts'?'Bøker':'Katalog',url:'https://archive.org/details/'+encodeURIComponent(x.identifier),access:restricted?'Krever lån / innlogging':'Digitalt materiale · sjekk tilgang',accessGroup:restricted?'restricted':'unknown',digital:true,open:false,rights:str(x.licenseurl)||str(x.rights)||'Gjenbruksrettigheter ikke oppgitt',description:str(x.description).replace(/<[^>]*>/g,' ').slice(0,700)};
}
export async function json(url:string):Promise<any>{const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});if(!r.ok)throw Error('Kilden svarte '+r.status);return r.json();}
export const literal=(s:string)=>'"'+s.replace(/[\\"\x00-\x1f]/g,' ')+'"';


