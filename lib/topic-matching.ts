import type {Fact} from './photo-details';

export type TopicId='borregaard'|'sarpsfossen';
const patterns:Record<TopicId,RegExp>={
 borregaard:/\b(?:borregaard|borregård|borggaard)\b/i,
 sarpsfossen:/\b(?:sarpfoss|sarpsfoss|sarpefoss)(?:en)?\b/i
};
type PhotoEvidence={title?:string;description?:string;location?:{label?:string};facts?:Fact[]};
export function topicBasis(topicId:TopicId,photo:PhotoEvidence):string{
 const pattern=patterns[topicId];
 if(pattern.test(photo.title||''))return 'Navnet står i arkivtittelen.';
 const evidence=[photo.description,photo.location?.label,...(photo.facts||[]).filter(fact=>['Sted','Motiv / beskrivelse','Emneord'].includes(fact.label)).map(fact=>fact.value)].filter(Boolean).join(' ');
 return pattern.test(evidence)?'Navnet står i arkivets steds- eller motivopplysninger.':'';
}
