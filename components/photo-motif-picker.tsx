'use client';
import type {MappedPhoto} from '../hooks/use-local-photo-facets';
import {cityMotifFacets,cityMotifFacetFor} from '../lib/city-motif-facets';

export default function PhotoMotifPicker({city,items,selected,onSelect,loading,error}:{city:string;items:MappedPhoto[];selected:string;onSelect:(value:string)=>void;loading:boolean;error:string}){
 const counts=items.reduce((map,photo)=>map.set(cityMotifFacetFor(photo.group),(map.get(cityMotifFacetFor(photo.group))||0)+1),new Map<string,number>());
 return <section className="photo-motif-picker" aria-label="Filtrer bilder etter motiv"><div className="eyebrow">MOTIV I {city.toLocaleUpperCase('nb-NO')}</div><p className="small">Bilder fra Nasjonalbiblioteket i valgt periode. Beslektede motivgrupper er samlet; mange er foreløpige.</p>{loading?<p className="small" role="status">Henter motivgrupper …</p>:error?<p className="small" role="alert">{error}</p>:<div className="motif-options"><button aria-pressed={!selected} className={!selected?'active':''} onClick={()=>onSelect('')}>Alle bilder <span>{items.length}</span></button>{cityMotifFacets.map(facet=>{const count=counts.get(facet.id)||0;return count>0?<button key={facet.id} aria-pressed={selected===facet.id} className={selected===facet.id?'active':''} onClick={()=>onSelect(facet.id)}>{facet.label}<span>{count}</span></button>:null})}</div>}</section>;
}
