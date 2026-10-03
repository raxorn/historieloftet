import {json,str} from '../../../lib/archive';
export async function GET(req:Request){
 const id=new URL(req.url).searchParams.get('id')||'';
 if(!/^[a-zA-Z0-9_.-]{1,200}$/.test(id))return Response.json({error:'Ugyldig identifikator'},{status:400});
 try{
 const d=await json('https://archive.org/metadata/'+encodeURIComponent(id)),m=d.metadata||{};
 if(!d.metadata)return Response.json({access:'Katalogpost ikke tilgjengelig',open:false});
 const restricted=!!d.is_dark||String(m['access-restricted-item'])==='true'||String(m['is_access_restricted'])==='true';
 const files=(d.files||[]).filter((f:any)=>!f.private);
 const audio=files.find((f:any)=>/\.mp3$/i.test(f.name));
 const readable=files.find((f:any)=>/\.(pdf|epub|txt)$/i.test(f.name));
 const rights=str(m.licenseurl)||str(m.rights)||'Gjenbruksrettigheter ikke oppgitt';
 const reusable=/^https?:\/\/creativecommons\.org\/(publicdomain\/|licenses\/by(?:-|\/))/i.test(str(m.licenseurl));
 const picture=files.find((f:any)=>/\.(jpe?g|png)$/i.test(f.name)&&f.source==='original');
 const candidate=audio||readable||picture;
 const fileUrl=candidate?'https://archive.org/download/'+encodeURIComponent(id)+'/'+encodeURIComponent(candidate.name):'';
 let available=false;
 if(!restricted&&fileUrl){try{const r=await fetch(fileUrl,{method:'HEAD',signal:AbortSignal.timeout(8000)});available=r.ok}catch{}}
 const scanned=files.some((f:any)=>/scandata\.xml$/i.test(f.name));
 return Response.json({open:available,access:restricted?'Krever lån / innlogging':available?'Fritt tilgjengelig':'Tilgang ikke avklart',rights,audio:available&&audio&&reusable?fileUrl:undefined,embed:!restricted&&available&&m.mediatype==='texts'&&scanned?'https://archive.org/embed/'+encodeURIComponent(id):undefined,pages:available&&picture&&candidate===picture&&reusable?[{url:fileUrl,large:fileUrl,label:'1'}]:[]});
 }catch{return Response.json({error:'Tilgangen kunne ikke sjekkes. Åpne hos Internet Archive.'},{status:502});}
}
