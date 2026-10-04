export function parsePeriod(value:string):{start?:number;end?:number;undated?:boolean}|null {
 if(!value)return {};if(value==='undated')return {undated:true};
 const m=/^(\d{4})(?:-(\d{4}))?$/.exec(value);if(!m)return null;
 const start=Number(m[1]),end=Number(m[2]||m[1]);return start>=1000&&end<=2099&&start<=end?{start,end}:null;
}
export function periodFilter(value:string){const p=parsePeriod(value);return !p?'':p.undated?'NOT year:[* TO *]':p.start===undefined?'':p.start===p.end?'year:'+p.start:`year:[${p.start} TO ${p.end}]`}
export function periodLabel(value:string){const p=parsePeriod(value);if(!p||p.start===undefined)return p?.undated?'Udatert':'Alle år';return p.start===p.end?String(p.start):`${p.start}-tallet (${p.start}–${p.end})`}
