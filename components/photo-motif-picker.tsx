'use client';
import type {MappedPhoto} from '../hooks/use-local-photo-facets';

export default function PhotoMotifPicker({city,items,selected,onSelect,loading,error}:{city:string;items:MappedPhoto[];selected:string;onSelect:(value:string)=>void;loading:boolean;error:string}){
 const groups=[...items.reduce((map,photo)=>map.set(photo.group,(map.get(photo.group)||0)+1),new Map<string,number>())].sort((a,b)=>a[0].localeCompare(b[0],'nb'));
 return <section className="photo-motif-picker" aria-label="Filtrer bilder etter motiv"><div className="eyebrow">MOTIV I {city.toLocaleUpperCase('nb-NO')}</div><p className="small">Kartlagte bilder fra Nasjonalbiblioteket i valgt periode. Gruppene er delvis foreløpige.</p>{loading?<p className="small" role="status">Henter motivgrupper …</p>:error?<p className="small" role="alert">{error}</p>:<div className="motif-options"><button aria-pressed={!selected} className={!selected?'active':''} onClick={()=>onSelect('')}>Alle motiver <span>{items.length}</span></button>{groups.map(([name,count])=><button key={name} aria-pressed={selected===name} className={selected===name?'active':''} onClick={()=>onSelect(name)}>{name}<span>{count}</span></button>)}</div>}</section>;
}
