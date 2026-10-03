import {json,nbItem} from '../../../lib/archive';
const allowed=(value:unknown)=>{try{const u=new URL(String(value));return u.protocol==='https:'&&u.hostname==='www.nb.no'&&u.pathname.startsWith('/services/image/resolver/')?u.href:undefined}catch{return undefined}};
export async function GET(req:Request){
 const id=new URL(req.url).searchParams.get('id')||'';
 if(!/^[a-f0-9]{32}$/.test(id))return Response.json({error:'Ugyldig identifikator'},{status:400});
 try{
 const raw=await json('https://api.nb.no/catalog/v1/items/'+id),item=nbItem(raw);
 if(!item.open||!item.publicDomain)return Response.json({item,pages:[]});
 const manifest=await json('https://api.nb.no/catalog/v1/iiif/'+id+'/manifest');
 const pages=(manifest.sequences?.[0]?.canvases||[]).slice(0,3000).flatMap((canvas:any)=>{
 const resource=canvas.images?.[0]?.resource,service=allowed(resource?.service?.['@id']);
 if(!service)return [];
 const width=Number(canvas.width)||1800,height=Number(canvas.height)||1800;
 return [{label:String(canvas.label||''),width,height,url:service+'/full/'+Math.min(width,1800)+',/0/native.jpg',large:service+'/full/'+Math.min(width,3600)+',/0/native.jpg'}];
 });
 return Response.json({item,pages},{headers:{'Cache-Control':'private, max-age=300'}});
 }catch{return Response.json({error:'Den store visningen kunne ikke lastes. Prøv igjen eller åpne hos Nasjonalbiblioteket.'},{status:502});}
}
