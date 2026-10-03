export type RecordItem = {id:string; source:string; title:string; year:string; creator:string; kind:string; url:string; image?:string; access:string; open:boolean; rights:string; description:string};
export const str=(v:unknown):string=>Array.isArray(v)?v.map(str).join(', '):typeof v==='string'?v:typeof v==='number'?String(v):'';
export function nbItem(x:any):RecordItem {
 const m=x.metadata||{}, a=x.accessInfo||{}; const kind=str(m.mediaTypes);
 const open=a.isDigital===true&&a.accessAllowedFrom==='EVERYWHERE'&&a.viewability==='ALL';
 const access=!a.isDigital?'Katalogpost':open?'Fri nettilgang':a.accessAllowedFrom==='NORWAY'?'Tilgang fra Norge':a.accessAllowedFrom==='NB'?'Hos Nasjonalbiblioteket':'Begrenset / ukjent tilgang';
 return {id:x.id,source:'nb',title:str(m.title)||'Uten tittel',year:str(m.originInfo?.issued)||str(m.dateCreated),creator:str(m.creators),kind:kind.includes('avis')?'Aviser':kind.includes('bøker')?'Bøker':kind.includes('bilde')||kind.includes('foto')?'Bilder':kind.includes('lyd')||kind.includes('musikk')?'Lyd':kind||'Katalog',url:'https://www.nb.no/items/'+encodeURIComponent(x.id),image:a.isPublicDomain&&open?x._links?.thumbnail_large?.href:undefined,access,open,rights:a.isPublicDomain?'Public domain ifølge Nasjonalbiblioteket':a.license?'Kildens lisens: '+a.license:'Gjenbruksrettigheter ikke oppgitt',description:[m.originInfo?.publisher,m.geographic?.city,m.pageCount?m.pageCount+' sider':''].filter(Boolean).join(' · ')};
}
export function iaItem(x:any):RecordItem {
 return {id:x.identifier,source:'ia',title:str(x.title)||x.identifier,year:str(x.year)||str(x.date).slice(0,10),creator:str(x.creator),kind:x.mediatype==='audio'?'Lyd':x.mediatype==='image'?'Bilder':x.mediatype==='texts'?'Bøker':'Katalog',url:'https://archive.org/details/'+encodeURIComponent(x.identifier),access:'Tilgang må sjekkes',open:false,rights:str(x.licenseurl)||str(x.rights)||'Gjenbruksrettigheter ikke oppgitt',description:str(x.description).replace(/<[^>]*>/g,' ').slice(0,700)};
}
export async function json(url:string):Promise<any>{const r=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{Accept:'application/json'}});if(!r.ok)throw Error('Kilden svarte '+r.status);return r.json();}
export const literal=(s:string)=>'"'+s.replace(/[\\"\x00-\x1f]/g,' ')+'"';


