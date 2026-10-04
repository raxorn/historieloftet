import fs from 'node:fs';
const path='data/fredrikstad-pilot.json';
const data=JSON.parse(fs.readFileSync(path,'utf8'));
const review=JSON.parse(fs.readFileSync('data/fredrikstad-visual-review.json','utf8'));
const assignments=review.pages.flat();
if(assignments.length!==200)throw Error(`Expected 200 visual assignments, got ${assignments.length}`);
const uncertain=new Set(review.needsReview);
const notes={
 'Kirkeinteriør':'Kirkerommet er hovedmotivet.',
 'Kirkeinventar og detaljer':'En avgrenset gjenstand eller bygningsdetalj i kirken er hovedmotivet.',
 'Kirker utvendig':'Kirkebygget og omgivelsene er synlige utenfra.',
 'By- og landskapsutsikt':'Bebyggelse eller landskap sees fra avstand.',
 'Gater og byliv':'Gate og bebyggelse er hovedmotivet.',
 'Parker og hager':'Park, hageanlegg eller allé er hovedmotivet.',
 'Havn og fartøy':'Båter, seilskuter, havn eller brygge er hovedmotivet.',
 'Kystlandskap':'Kyst, øy eller fjordlandskap er hovedmotivet.',
 'Strand og badeliv':'Mennesker ved badested eller strand er synlige.',
 'Festningsverk og porter':'Mur, bastion eller portanlegg er hovedmotivet.',
 'Bygninger og institusjoner':'En særskilt offentlig, kommersiell eller annen bygning er hovedmotivet.',
 'Gårder og herregårder':'Gårdsanlegg eller herregård med omgivelser er hovedmotivet.',
 'Broer og jernbane':'Bro eller jernbaneanlegg er hovedmotivet.',
 'Industri og fabrikker':'Fabrikkanlegg er hovedmotivet.',
 'Botanikk og vegetasjon':'Vegetasjon eller en botanisk detalj er hovedmotivet.',
 'Natur og terreng':'Terreng, skog eller vann uten tydelig bymotiv er hovedmotivet.',
 'Torg og monumenter':'Torg, minnesmerke eller et samlet byrom er hovedmotivet.'
};
function context(item){
 const t=item.title.toLowerCase();
 if(/kirkeparken/.test(t))return 'Fredrikstad parker';
 if(/kirke.gat/.test(t))return 'Fredrikstad sentrum · gater';
 if(/onsøy kirke/.test(t))return 'Onsøy kirke';
 if(/rolvsøy kirke/.test(t))return 'Rolvsøy kirke';
 if(/glemm.*kirke/.test(t))return 'Glemmen kirke';
 if(/gresvik|græsvik/.test(t))return 'Gressvik';
 if(/torsnes kirke|holm kirke/.test(t))return 'Torsnes kirke';
 if(/kirke/.test(t))return 'Fredrikstad kirker';
 if(/hankø|hankö|hankø|kariviken|lyngholmen|missingen|omski|flateskjær|flateskjer|hankosund/.test(t))return 'Hankø og øyene';
 if(/onsø|onso|onsøy/.test(t))return 'Onsøy';
 if(/kongsten|festning|voldgrav|voldparti|voldport|kongeport|ravelin/.test(t))return 'Gamlebyen og festningen';
 if(/gamlebyen|fredriksstad ø/.test(t))return 'Gamlebyen';
 if(/storgat|nygaardsgat|nygårdsgat|kirke.gat|welhavens gate|jernbanegat|færgeportgat|toldbodgat|raadhusgat/.test(t))return 'Fredrikstad sentrum · gater';
 if(/jernbane|vindebru|broen over/.test(t))return 'Broer og jernbane';
 if(/badeliv|bad|strand|fjord/.test(t))return 'Kysten og badestedene';
 if(/trara/.test(t))return 'Trara';
 if(/kjølberg/.test(t))return 'Kjølberg';
 if(/elingård/.test(t))return 'Elingård';
 if(/haugethun|greaa?ker/.test(t))return 'Greåker';
 return 'Fredrikstad og omegn';
}
for(const item of data.items){
 const code=assignments[item.pilotNumber-1];
 const group=review.legend[code];
 if(!group||!notes[group])throw Error(`Missing group for ${item.pilotNumber}`);
 item.group=group;
 item.subgroup=context(item);
 item.visualNote=notes[group];
 item.reviewed=true;
 item.needsReview=uncertain.has(item.pilotNumber);
 item.groupBasis='Arkivtittel og stedsopplysninger, kombinert med visuell vurdering av forhåndsvisningen i Codex. Ikke uavhengig bekreftet.';
 item.location.status='Arkivsted – GPS ikke verifisert';
 if(/^\d{6}$/.test(String(item.year)))item.year=String(item.sortYear);
}
data.review=review.method;
data.gpsStatus='Ingen GPS-punkter er bekreftet. Stedsnavn er hentet fra arkivet; verken motivpunkt eller fotografens ståsted er fastslått.';
fs.writeFileSync(path,JSON.stringify(data,null,2));
console.log(JSON.stringify({photos:data.items.length,groups:new Set(data.items.map(x=>x.group)).size,needsReview:data.items.filter(x=>x.needsReview).length}));
