export type RecordItem = {id:string; sortYear?:number|null; source:string; title:string; year:string; creator:string; kind:string; url:string; image?:string; access:string; accessGroup?:string; digital?:boolean; publicDomain?:boolean; inlineReadable?:boolean; licenseUrl?:string; nonCommercial?:boolean; open:boolean; rights:string; description:string};
// This personal history site is non-commercial. Unknown licenses remain source-only.
const nbLicenses:Record<string,string>={cc0:'CC0',ccby:'CC BY',ccbysa:'CC BY-SA',ccbynd:'CC BY-ND',ccbync:'CC BY-NC',ccbyncsa:'CC BY-NC-SA',ccbyncnd:'CC BY-NC-ND'};
export const str=(v:unknown):string=>Array.isArray(v)?v.map(str).join(', '):typeof v==='string'?v:typeof v==='number'?String(v):'';
export function nbItem(x:any):RecordItem {
 const m=x.metadata||{}, a=x.accessInfo||{}; const kind=str(m.mediaTypes);
 const open=a.isDigital===true&&a.accessAllowedFrom==='EVERYWHERE'&&a.viewability==='ALL';
 const accessGroup=a.isDigital===false?'offline':open?'open':a.accessAllowedFrom==='NORWAY'?'norway':a.isDigital&&a.accessAllowedFrom&&a.accessAllowedFrom!=='EVERYWHERE'?'restricted':'unknown';
 const access=({offline:'Ikke digitalisert',open:'Fritt tilgjengelig',norway:'Kan åpnes fra Norge',restricted:'Krever særskilt tilgang',unknown:'Tilgang ikke avklart'} as any)[accessGroup];
 const thumb=x._links?.thumbnail_custom?.href?.replace('{width}','600').replace('{height}','')||x._links?.thumbnail_large?.href;
 const license=typeof a.license==='string'?nbLicenses[a.license]:undefined,inlineReadable=open&&(a.isPublicDomain===true||!!license);
 const date=str(m.originInfo?.issued)||str(m.dateCreated),year=/^\d{8}$/.test(date)?`${date.slice(6,8)}.${date.slice(4,6)}.${date.slice(0,4)}`:date;
 const creator=str(m.creators)||str((m.people||[]).map((p:any)=>p.name))||str((m.corporates||[]).map((p:any)=>p.name));
 return {id:x.id,source:'nb',title:str(m.title)||'Uten tittel',year,creator,kind:kind.includes('avis')?'Aviser':kind.includes('bøker')?'Bøker':kind.includes('bilde')||kind.includes('foto')?'Bilder':kind.includes('lyd')||kind.includes('musikk')?'Lyd':kind||'Katalog',url:'https://www.nb.no/items/'+encodeURIComponent(x.id),image:inlineReadable?thumb:undefined,access,accessGroup,digital:a.isDigital,publicDomain:a.isPublicDomain===true,inlineReadable,licenseUrl:license?'https://www.nb.no/tilgang/lisens/':undefined,nonCommercial:!!license&&a.license.includes('nc'),open,rights:a.isPublicDomain?'Public domain':license|| (a.license==='bokhylla'?'Bokhylla-avtalen':a.license?'Kildens lisens: '+a.license:'Gjenbruksrettigheter ikke oppgitt'),description:[m.originInfo?.publisher,m.geographic?.city,m.pageCount?m.pageCount+(m.pageCount===1?' side':' sider'):''].filter(Boolean).join(' · ')};
}
export function iaItem(x:any):RecordItem {
 const restricted=String(x['access-restricted-item'])==='true';
 return {id:x.identifier,source:'ia',title:str(x.title)||x.identifier,year:str(x.year)||str(x.date).slice(0,10),creator:str(x.creator),kind:x.mediatype==='audio'?'Lyd':x.mediatype==='image'?'Bilder':x.mediatype==='texts'?'Bøker':'Katalog',url:'https://archive.org/details/'+encodeURIComponent(x.identifier),access:restricted?'Krever lån / innlogging':'Digitalt materiale · sjekk tilgang',accessGroup:restricted?'restricted':'unknown',digital:true,open:false,rights:str(x.licenseurl)||str(x.rights)||'Gjenbruksrettigheter ikke oppgitt',description:str(x.description).replace(/<[^>]*>/g,' ').slice(0,700)};
}
export async function json(url:string):Promise<any>{const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});if(!r.ok)throw Error('Kilden svarte '+r.status);return r.json();}
export const literal=(s:string)=>'"'+s.replace(/[\\"\x00-\x1f]/g,' ')+'"';


