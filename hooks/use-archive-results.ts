import {useEffect,useRef,useState} from 'react';
import type {RecordItem} from '../lib/archive';
import {compareItems} from '../lib/chronology';
type Stream={source:string;items:RecordItem[];hasMore?:boolean;nextParams?:Record<string,string>;error?:string;[key:string]:any};
type Run={streams:Stream[];items:RecordItem[];controller:AbortController;busy:boolean;initialized:boolean};
export default function useArchiveResults(search:Record<string,string|number|boolean>){
 const [data,setData]=useState<Stream[]>([]),[items,setItems]=useState<RecordItem[]>([]),[loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[error,setError]=useState(''),[hasMore,setHasMore]=useState(false),[loadedSearch,setLoadedSearch]=useState<typeof search|null>(null);
 const automatic=useRef(false),state=useRef<Run>({streams:[],items:[],controller:new AbortController(),busy:false,initialized:false});
 async function request(current:Run,extra:Record<string,string>={}){const p=new URLSearchParams(Object.entries(search).map(([k,v])=>[k,String(v)]));for(const [k,v]of Object.entries(extra))p.set(k,v);const r=await fetch('/api/search?'+p,{signal:current.controller.signal});const d:any=await r.json();if(d.error)throw Error(d.error);return d.sources as Stream[]}
 async function batch(current:Run){
 // Copy queues so failed requests cannot consume records or advance cursors.
 let streams=current.streams.map(s=>({...s,items:[...s.items]}));if(!current.initialized)streams=await request(current);
 const added:RecordItem[]=[],seen=new Set(current.items.map(i=>i.source+':'+i.id));
 while(added.length<24){
 streams=await Promise.all(streams.map(async s=>{if(s.error&&s.source!=='dm'){const retry=(await request(current,{source:s.source,...s.nextParams}))[0];return retry}if(!s.items.length&&s.hasMore)return (await request(current,{source:s.source,...s.nextParams}))[0];return s}));
 const failed=streams.find(s=>s.error&&s.source!=='dm');if(failed)throw Error(failed.error);
 // A source crossing a year boundary may return an empty page. Resolve its head
 // before emitting another source's later record.
 if(streams.some(s=>!s.items.length&&s.hasMore))continue;
 const heads=streams.filter(s=>s.items.length).sort((a,b)=>compareItems(a.items[0],b.items[0],String(search.order||'oldest')));if(!heads.length)break;
 const item=heads[0].items.shift()!,key=item.source+':'+item.id;if(!seen.has(key)){seen.add(key);added.push(item)}
 }
 if(current.controller.signal.aborted)return [];
 current.streams=streams;current.initialized=true;current.items=[...current.items,...added];setData(streams);setItems([...current.items]);setHasMore(streams.some(s=>s.items.length||s.hasMore));return added;
 }
 useEffect(()=>{state.current.controller.abort();automatic.current=false;const current:Run={streams:[],items:[],controller:new AbortController(),busy:true,initialized:false};state.current=current;setItems([]);setData([]);setLoading(true);setLoadingMore(false);setError('');setHasMore(false);
 batch(current).catch(e=>{if(!current.controller.signal.aborted)setError(e.message||'Søket kunne ikke lastes.')}).finally(()=>{current.busy=false;if(!current.controller.signal.aborted){setLoading(false);setLoadedSearch(search)}});return()=>current.controller.abort()},[search]);
 async function loadMore(photosOnly=false):Promise<RecordItem|undefined>{const current=state.current;if(current.busy)return;current.busy=true;automatic.current=photosOnly;setLoadingMore(true);setError('');try{do{const added=await batch(current);const photo=added.find(i=>i.kind==='Bilder');if(photo||!photosOnly||!current.streams.some(s=>s.items.length||s.hasMore))return photo}while(automatic.current&&!current.controller.signal.aborted)}catch(e:any){if(!current.controller.signal.aborted)setError(e.message||'Kunne ikke hente flere treff. Prøv igjen.')}finally{current.busy=false;if(!current.controller.signal.aborted)setLoadingMore(false)}}
 return {data,items,loading:loading||loadedSearch!==search,loadingMore,error,hasMore,loadMore,cancelMore:()=>{automatic.current=false}};
}
