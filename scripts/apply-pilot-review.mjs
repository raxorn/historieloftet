import fs from 'node:fs';
const path='data/sarpsborg-pilot.json',data=JSON.parse(fs.readFileSync(path)),review=JSON.parse(fs.readFileSync('data/sarpsborg-visual-review.json'));
const notes={
 'Foss og elvelandskap':'Foss eller strømmende elv er et fremtredende motiv. Broer og industri kan også være synlige.',
 'Kirkeinventar og detaljer':'Avgrenset gjenstand, utsmykning eller bygningsdetalj, fremfor et oversiktsbilde av kirken.',
 'Kirker utvendig':'Kirkebyggets eksteriør og omgivelser er synlige.',
 'Kirkeinteriør':'Kirkerom med benker, tak, alter eller andre romlige kjennetegn er synlig.',
 'Gravminner':'Gravstein, minnetavle eller gravplass er hovedmotivet; tolkningen må kontrolleres.',
 'Gårder og bygninger':'Bolig, gårdsbygning eller tun er et fremtredende motiv.',
 'Gårdsinteriør og redskaper':'Innvendig uthusmiljø med utstyr eller redskaper er synlig.',
 'Gater og byliv':'Gate eller torg med bebyggelse og eventuelt mennesker.',
 'Parker og alleer':'Trær langs en tydelig gang eller allé er hovedmotivet.',
 'Ruiner og kulturminner':'Landskap med bygningsrester; arkivtittelen støtter tolkningen av kulturminne.',
 'Jernbane og broer':'Stasjonsbygning eller bro er et fremtredende motiv.',
 'By- og landskapsutsikt':'Oversikt over bebyggelse og landskap på avstand.',
 'Industri utvendig':'Fabrikkbygninger, piper eller industriområde sett utenfra.',
 'Industri ved elven':'Fabrikkbygninger og elv eller foss er synlige sammen.',
 'Industriinteriør og maskiner':'Innvendig industrimiljø med maskiner, ovner eller produksjonsutstyr.',
 'Tømmer og elvelager':'Elvebredd eller lageranlegg. Arkivtittelen angir tømmeropplag eller lager.',
 'Amundsenfestlighetene':'Folkesamling, seremoni eller monument. Hendelsesnavnet kommer fra arkivet, ikke ansiktsgjenkjenning.',
 'Uavklart motiv':'Forhåndsvisningen er for uklar til en forsvarlig motivgruppe.'
};
const unclear=new Set([14,22,26,31,59,61,62,72,81,96,106,108,117,126,127,135,144,148]);
for(const item of data.items){
 const group=review.groups[item.pilotNumber];if(!group||!notes[group])throw Error('Missing visual review '+item.pilotNumber);
 item.group=group;item.reviewed=true;item.needsReview=unclear.has(item.pilotNumber);item.visualNote=notes[group];
 item.groupBasis='Arkivtittel og stedsopplysninger, kombinert med visuell vurdering av forhåndsvisningen i Codex. Ikke uavhengig bekreftet.';
 const t=item.title;item.subgroup=/sarpsfoss|sarpefoss|NB_NLB_125_05/i.test(t)?'Sarpsfossen':/borreg|NB_NLB_125_09/i.test(t)?'Borregaard':/hafslund.*(karbid|carbid)|havslund/i.test(t)?'Hafslund karbidfabrikk':/hafslund gaard/i.test(t)?'Hafslund hovedgård':/hafslund panorama/i.test(t)?'Hafslund industriområde':/sarpsborg, torvet/i.test(t)?'Sarpsborg torg':/nestle/i.test(t)?'Nestlé melkefabrikk':/amundsen/i.test(t)?'Amundsenfestlighetene':/greaaker|greaker/i.test(t)?'Greåker':t.replace(/, (interiør|inventar|gravminner|prekestol|døpefont|Hans Nielsen Hauges stol).*$/i,'').replace(/, (Skjeberg|Sarpsborg)$/,'');
 item.location.status='Arkivsted – GPS ikke verifisert';
}
data.review=review.method;data.gpsStatus='Ingen GPS-punkter er bekreftet. Stedsnavn er hentet fra arkivet; verken motivpunkt eller fotografens ståsted er fastslått.';
fs.writeFileSync(path,JSON.stringify(data,null,2));
console.log(JSON.stringify({photos:data.items.length,groups:new Set(data.items.map(x=>x.group)).size,needsReview:data.items.filter(x=>x.needsReview).length}));
