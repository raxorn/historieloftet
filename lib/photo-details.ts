export type Fact={label:string;value:string};
const clean=(v:unknown):string=>typeof v==='string'?v.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim():typeof v==='number'?String(v):Array.isArray(v)?v.map(clean).filter(Boolean).join(' · '):'';
const unique=(v:unknown[])=>[...new Set(v.map(clean).filter(Boolean))].join(' · ');
export function nbPhotoDetails(m:any):Fact[]{
 const people=[...(m.people||[]),...(m.corporates||[])];
 const photographers=people.filter(p=>(p.roles||[]).some((r:any)=>String(r.name).toUpperCase()==='FTG'||/fotograf/i.test(r.description||'')));
 const place=unique([...(m.geographic?.placeString||'').split(';'),m.geographic?.city,m.geographic?.county]);
 return [
  {label:'Motiv / beskrivelse',value:clean(m.summary).replace(/^Sammendrag:\s*/i,'')},
  {label:'Fotograf / fotofirma',value:unique(photographers.map(p=>p.name))},
  {label:'Datering i arkivet',value:clean(m.dateCreated||m.originInfo?.created||m.originInfo?.issued)},
  {label:'Sted',value:place},
  {label:'Emneord',value:unique([...(m.subject?.topics||[]),...(m.subject?.names||[]).map((p:any)=>p.name)])},
  {label:'Materiale',value:unique([...(m.genres||[]),...(m.physicalDescription?.form||[]),m.physicalDescription?.extent])},
  {label:'Merknader fra arkivet',value:unique(m.notes||[])},
  {label:'Arkivreferanse',value:clean(m.identifiers?.urn||m.recordInfo?.identifier)}
 ].filter(f=>f.value).map(f=>({...f,value:f.value.slice(0,5000)}));
}
export function iaPhotoDetails(m:any):Fact[]{return [
 {label:'Beskrivelse',value:clean(m.description)},
 {label:'Opphavsperson',value:clean(m.creator)},
 {label:'Datering i arkivet',value:clean(m.date||m.year)},
 {label:'Sted',value:clean(m.coverage)},
 {label:'Emneord',value:clean(m.subject)},
 {label:'Samling',value:clean(m.collection)},
 {label:'Bidragsyter',value:clean(m.contributor)},
 {label:'Arkivreferanse',value:clean(m.identifier)}
].filter(f=>f.value).map(f=>({...f,value:f.value.slice(0,5000)}))}
