import {json,nbItem} from './archive';
// Enumerate indexed years, then use the same ID cursor within each year.
// The ordinary date-sorted endpoint has a page ceiling; this traversal does not.
export async function nbChronological(base:URL,p:URLSearchParams){
 const direction=p.get('order')==='newest'?-1:1,scope=p.get('year')||'';
 const agg=new URL(base);agg.pathname='/catalog/v1/items';agg.searchParams.delete('searchAfterId');agg.searchParams.set('size','1');agg.searchParams.set('page','0');agg.searchParams.set('aggs','year:1200:termasc');
 const summary=await json(agg.href),total=summary.page?.totalElements||0;
 const years:number[]=(summary._embedded?.aggregations?.find((a:any)=>a.name==='year')?.buckets||[]).map((b:any)=>Number(b.key)).filter(Number.isFinite).sort((a:number,b:number)=>direction*(a-b));
 const requested=p.get('nbYear');let current=requested||(scope==='undated'?'undated':years.length?String(years[0]):'undated');
 if(current!=='undated'&&!/^\d{4}$/.test(current))throw Error('Invalid year cursor');
 const u=new URL(base);u.searchParams.append('filter',current==='undated'?'NOT year:[* TO *]':'year:'+current);u.searchParams.set('page','0');
 const d=await json(u.href),raw=d._embedded?.items||[],offset=Math.max(0,Number(p.get('nbOffset'))||0),within=raw.length>0&&offset+raw.length<(d.page?.totalElements||0);
 const index=years.indexOf(Number(current)),nextYear=current==='undated'?undefined:index>=0&&index<years.length-1?String(years[index+1]):!scope?'undated':undefined;
 const nextParams=within?{nbYear:current,nbAfter:raw.at(-1).id,nbOffset:String(offset+raw.length)}:nextYear?{nbYear:nextYear,nbAfter:'',nbOffset:'0'}:undefined;
 return {source:'nb',items:raw.map((x:any)=>({...nbItem(x),sortYear:current==='undated'?null:Number(current)})),total,hasMore:!!nextParams,nextParams};
}
