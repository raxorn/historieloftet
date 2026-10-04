import type {RecordItem} from './archive';
export function itemYear(item:RecordItem):number|null {if(item.sortYear!==undefined)return item.sortYear;const m=item.year.match(/(?:^|\D)([12]\d{3})(?:\D|$)/);return m?Number(m[1]):null}
export function compareItems(a:RecordItem,b:RecordItem,order:string){const x=itemYear(a),y=itemYear(b);if(x===null&&y!==null)return 1;if(y===null&&x!==null)return -1;return (x!==y?(order==='newest'?-1:1)*((x??0)-(y??0)):0)||a.source.localeCompare(b.source)||a.id.localeCompare(b.id)}
export function yearHeading(item:RecordItem){return String(itemYear(item)??'Udatert')}
