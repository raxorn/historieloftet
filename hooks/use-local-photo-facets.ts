import {useEffect,useState} from 'react';
import catalog from '../data/city-photo-catalog.json';
import {parsePeriod} from '../lib/period';
import type {RecordItem} from '../lib/archive';

export type MappedPhoto=RecordItem & {sortYear:number;group:string;subgroup:string;reviewed:boolean;groupBasis:string};
type Snapshot={key:string;items:MappedPhoto[];error:string};
export default function useLocalPhotoFacets(place:string,period:string,enabled:boolean){
 const city=place==='3105'?'Sarpsborg':place==='3107'?'Fredrikstad':'';
 const parsed=parsePeriod(period);
 const valid=enabled&&!!city&&!!parsed&&!parsed.undated;
 const key=valid?city+':'+period:'';
 const [snapshot,setSnapshot]=useState<Snapshot|null>(null);
 useEffect(()=>{
  if(!key)return;
  const controller=new AbortController();
  const decades=catalog.cities.find(row=>row.city===city)!.decades.filter(row=>parsed!.start===undefined||row.decade<=parsed!.end!&&row.decade+9>=parsed!.start);
  Promise.all(decades.map(async row=>{
   const response=await fetch('/city-photos/'+city.toLowerCase()+'-'+row.decade+'.json',{signal:controller.signal});
   if(!response.ok)throw Error('Kunne ikke hente kartlagte bilder');
   return response.json() as Promise<MappedPhoto[]>;
  })).then(chunks=>{
   if(controller.signal.aborted)return;
   const all=[...new Map(chunks.flat().map(photo=>[photo.id,photo])).values()];
   const items=all.filter(photo=>parsed!.start===undefined||photo.sortYear>=parsed!.start&&photo.sortYear<=parsed!.end!);
   setSnapshot({key,items,error:''});
  }).catch(error=>{if(!controller.signal.aborted)setSnapshot({key,items:[],error:error.message||'Kunne ikke hente motivgruppene.'})});
  return ()=>controller.abort();
 },[key,city,parsed?.start,parsed?.end]);
 return {available:valid,city,items:key&&snapshot?.key===key?snapshot.items:[],loading:valid&&snapshot?.key!==key,error:key&&snapshot?.key===key?snapshot.error:''};
}
