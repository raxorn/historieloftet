import snapshot from '../data/sarpsborg-pilot.json';
import fredrikstadSnapshot from '../data/fredrikstad-pilot.json';
import sarpsborg1000Snapshot from '../data/sarpsborg-1000.json';
import type {RecordItem} from './archive';
export type PilotItem=RecordItem & {pilotNumber:number;sortYear:number;group:string;metadataGroup:string;subgroup:string;visualNote:string;reviewed:boolean;needsReview:boolean;groupBasis:string;sourceDate:string;location:{label:string;status:string;lat:number|null;lon:number|null;radiusMeters:number|null}};
export const pilot={...snapshot,items:snapshot.items as PilotItem[]};
export const fredrikstadPilot={...fredrikstadSnapshot,items:fredrikstadSnapshot.items as PilotItem[]};
export const sarpsborg1000Pilot={...sarpsborg1000Snapshot,items:sarpsborg1000Snapshot.items as PilotItem[]};
export type PilotFilters={method:string;group:string;place:string;year:string;status:string;order:string};
export const groupFor=(item:PilotItem,method:string)=>method==='metadata'?item.metadataGroup:item.group;
export function filterPilot(items:PilotItem[],f:PilotFilters){
 return items.filter(x=>(!f.group||groupFor(x,f.method)===f.group)&&(!f.place||x.subgroup===f.place)&&(!f.year||String(x.sortYear)===f.year)&&(!f.status||(f.status==='uncertain'?x.needsReview:f.status==='reviewed'?x.reviewed:!x.reviewed))).sort((a,b)=>groupFor(a,f.method).localeCompare(groupFor(b,f.method),'nb')||a.subgroup.localeCompare(b.subgroup,'nb')||(f.order==='newest'?-1:1)*(a.sortYear-b.sortYear)||a.id.localeCompare(b.id));
}
