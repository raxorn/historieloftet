import fs from 'node:fs';

const path='data/sarpsborg-1000.json';
const data=JSON.parse(fs.readFileSync(path,'utf8'));
// Numbered thumbnail contact sheets were inspected at 20 images per page.
// This is broad motif recognition, not identification of an exact site or GPS.
const groups={
 'Sarpsfossen og Glomma':'5 7 14 21 46 57 59 62 76 92 96 123 135 144 148 270 289 316 341 552 554 896 898',
 'Elv og vannlandskap':'6 12 15 32 33 38 45 75 77 91 107 124 129 130 133 149 151 156 158 170 178 179 202 205 208 209 215 220 221 255 473 483 486 490 501 535 904',
 'Tømmer og elvearbeid':'35 39 85 110 139 442 443',
 'Industri og arbeidsliv':'37 44 66 280 302 319 334 339 345',
 'By- og landskapsutsikt':'10 25 26 56 67 88 89 94 101 116 125 128 131 141 145 265 272 319 339 345 533 534 535 657 906',
 'Torg, parker og monumenter':'11 22 34 36 49 58 68 69 70 78 82 104 113 118 122 126 127 138 142 150 285 300 441 444 467 468 485 496 505 509 510 513 519 523 530 553 555 558 559 561 562 564 658 683 685 687 688 691 692',
 'Kirker og gravplasser':'20 40 83 134 153',
 'Gater og byliv':'24 30 54 60 64 79 84 93 97 99 100 102 115 117 121 146 159 212 213 214 273 278 333 438',
 'Broer, jernbane og veier':'17 51 55 72 105 140 143 148 261 268 472 515 536',
 'Bygninger og institusjoner':'4 28 31 47 50 61 65 73 87 109 111 112 119 186 193 210 274 295 298 320 367 370 384 393 396 397 401 409 410 411 416 417 493 518 521 525 527 542 560 564 589 680 686 688 897 936 970 971',
 'Havn, brygger og fartøy':'43 256 288',
 'Strand og badeliv':'253 656 905',
 'Museum og kulturminner':'284 296 318 335 347 350 368 376 381 383 388 394 398 400 405 406 414 436 437',
 'Mennesker og hendelser':'2 53 154 155 162 255 256 438 439 440 465 471 474 480 979 980 981 982 983 984 985 986 987 988 989 990 991 992 993 994 995 996 997 998 999 1000',
 'Natur og friluftsliv':'157 161 174 211 300 445 446 467 468 472 485 558 561',
};
const assignments=new Map();
for(const [group,numbers] of Object.entries(groups))for(const text of numbers.split(/\s+/)){
 const number=Number(text);
 if(assignments.has(number))continue;
 assignments.set(number,group);
}
const unclear=data.items.filter(x=>x.group==='Uavklart motiv');
const expected=new Set(unclear.map(x=>x.pilotNumber));
const extraneous=[...assignments.keys()].filter(n=>!expected.has(n));
const missing=[...expected].filter(n=>!assignments.has(n));
if(extraneous.length||missing.length)throw Error(`Extraneous: ${extraneous.join(', ')}; missing: ${missing.join(', ')}`);
for(const item of unclear){
 item.group=assignments.get(item.pilotNumber);
 item.reviewed=true;
 item.needsReview=false;
 item.visualNote='Motivet er sortert etter en visuell gjennomgang av arkivets forhåndsvisning. Gruppen er et foreløpig forslag.';
 item.groupBasis='Visuelt gjennomgått på arkivets forhåndsvisning og sammenholdt med arkivopplysningene. Ingen bildeanalysemodell, OCR eller GPS-stedfesting er brukt.';
}
data.id='sarpsborg-1000-v2';
data.method='Alle 1000 fikk et automatisk gruppeforslag fra arkivtittel, beskrivelse og emneord. 297 bilder med uklart motiv i metadata ble deretter visuelt gjennomgått på forhåndsvisninger og plassert i brede motivgrupper. De øvrige 703 er ennå ikke visuelt kontrollert. Dette er forslag, ikke menneskelig godkjenning av hvert motiv. Ingen betalt bildeanalysemodell er brukt.';
data.review='297 forhåndsvisninger visuelt gjennomgått; 703 foreløpig gruppert etter arkivtekst.';
fs.writeFileSync(path,JSON.stringify(data,null,2)+'\n');
console.log(JSON.stringify({total:data.items.length,visuallyReviewed:data.items.filter(x=>x.reviewed).length,groups:Object.fromEntries([...new Set(data.items.map(x=>x.group))].map(g=>[g,data.items.filter(x=>x.group===g).length]))}));
