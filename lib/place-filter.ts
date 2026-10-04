import places from './places.json';
export {places};
const quote=(s:string)=>'"'+s.replace(/[\\"\x00-\x1f]/g,' ')+'"';
export function resolvePlace(value:string){if(!value)return {label:'Alle steder',names:[] as string[]};if(value==='NO')return {label:'Norge',names:['Norge','Norway']};const county=places.find(f=>f.id===value||f.municipalities.some(k=>k.id===value));if(!county)return null;const municipality=county.municipalities.find(k=>k.id===value);return {label:municipality?.name||county.name,names:municipality?.names||[county.name,...county.municipalities.flatMap(k=>k.names)],county:county.id,municipality:municipality?.id}}
export function nbPlaceFilter(value:string){const p=resolvePlace(value);return p?.names.length?'subjectgeographic:('+p.names.map(quote).join(' OR ')+')':''}
export function iaPlaceFilter(value:string){const p=resolvePlace(value);if(!p?.names.length)return '';const terms='('+p.names.map(quote).join(' OR ')+')';return '(coverage:'+terms+' OR subject:'+terms+' OR title:'+terms+')'}
