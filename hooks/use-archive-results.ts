import {useEffect,useRef,useState} from 'react';
import type {RecordItem} from '../lib/archive';
const blend=(sources:any[]):RecordItem[]=>Array.from({length:12},(_,i)=>sources.map(s=>s.items?.[i]).filter(Boolean)).flat();
export default function useArchiveResults(search:Record<string,string|number|boolean>){
 const [data,setData]=useState<any[]>([]),[items,setItems]=useState<RecordItem[]>([]),[loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[error,setError]=useState('');
 const [loadedSearch,setLoadedSearch]=useState<typeof search|null>(null),automatic=useRef(false);
 const state=useRef<{sources:any[];items:RecordItem[];pages:Record<string,number>;controller:AbortController;busy:boolean}>({sources:[],items:[],pages:{},controller:new AbortController(),busy:false});
 useEffect(()=>{const current={sources:[] as any[],items:[] as RecordItem[],pages:{} as Record<string,number>,controller:new AbortController(),busy:false};state.current.controller.abort();state.current=current;setLoading(true);setLoadingMore(false);setItems([]);setData([]);setError('');
 fetch('/api/search?'+new URLSearchParams(Object.entries(search).map(([k,v])=>[k,String(v)])),{signal:current.controller.signal}).then(r=>r.json()).then((d:any)=>{if(current.controller.signal.aborted)return;if(d.error)throw Error(d.error);current.sources=d.sources||[];current.items=blend(current.sources);for(const s of current.sources)current.pages[s.source]=s.error?0:1;setData(current.sources);setItems(current.items)}).catch(e=>{if(e.name!=='AbortError')setError(e.message||'Søket kunne ikke lastes.')}).finally(()=>{if(!current.controller.signal.aborted){setLoading(false);setLoadedSearch(search)}});return()=>current.controller.abort()},[search]);
 async function loadMore(photosOnly=false):Promise<RecordItem|undefined>{
 const current=state.current;if(current.busy||loading)return;current.busy=true;automatic.current=photosOnly;setLoadingMore(true);setError('');
 try {do {
 const active=current.sources.filter(s=>s.hasMore||(s.error&&s.source!=='dm'));if(!active.length)return;
 const results=await Promise.all(active.map(async s=>{const params=new URLSearchParams(Object.entries(search).map(([k,v])=>[k,String(v)]));params.set('source',s.source);params.set('page',String(current.pages[s.source]||0));if(s.source==='nb'&&s.nextCursor)params.set('nbAfter',s.nextCursor);const r=await fetch('/api/search?'+params,{signal:current.controller.signal});const d:any=await r.json();if(d.error)throw Error(d.error);return d.sources[0]}));
 if(current.controller.signal.aborted)return;
 const failed=results.find((s:any)=>s.error);if(failed)throw Error(failed.error);
 const seen=new Set(current.items.map(i=>i.source+':'+i.id)),added=blend(results).filter(i=>!seen.has(i.source+':'+i.id));
 for(const s of results){current.pages[s.source]=(current.pages[s.source]||0)+1;current.sources=current.sources.map(old=>old.source===s.source?s:old)}
 current.items=[...current.items,...added];setData([...current.sources]);setItems([...current.items]);
 const photo=added.find(i=>i.kind==='Bilder');if(photo||!photosOnly)return photo;
 }while(automatic.current&&!current.controller.signal.aborted);
 }catch(e:any){if(e.name!=='AbortError')setError(e.message||'Flere treff kunne ikke lastes. Prøv igjen.')}finally{current.busy=false;if(!current.controller.signal.aborted){setLoadingMore(false)}}
 }
 return {data,items,loading:loading||loadedSearch!==search,cancelMore:()=>{automatic.current=false},loadingMore,error,loadMore,hasMore:data.some(s=>s.hasMore||(s.error&&s.source!=='dm'))};
}
