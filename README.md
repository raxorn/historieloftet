# Historieloftet

En privat nettside for å oppdage historie fra Nasjonalbiblioteket, Internet Archive og DigitaltMuseum.

## Kjøring

Node 22.13+ og npm. Installer med `npm ci`, bygg med `npm run build`, og start med `npm start`. `npm run dev` starter utviklingsversjonen. I miljøer med en feilkonfigurert npm-shim kan npm kjøres via den installerte `npm-cli.js`.

## Kilder og tilgang

### Europeana-test

Opprett `.env.local` i prosjektmappen og legg inn `EUROPEANA_API_KEY=din_nye_nøkkel`. Filen er ignorert av Git; ikke legg nøkkelen i kildekoden eller kommandolinjen. Kjør `npm run harvest:europeana` for et første uttrekk på 100 Sarpsborg-treff. `npm run harvest:europeana -- --query Fredrikstad --limit 200` bruker et annet søk. Resultatet lagres lokalt i `data/source-harvest/europeana-<søkeord>.json`, som også ignoreres av Git. Skriptet henter katalogmetadata, ikke bildefiler, og treffene må kontrolleres før de knyttes til et sted eller publiseres. Nøkkelen sendes i `X-Api-Key`-headeren.

### Kildekandidater for Sarpsborg og Fredrikstad

`node scripts/build-place-link-pilot.mjs` velger 100 NB-bilder som ikke inngikk i de tidligere pilotene og 100 DigitaltMuseum-bilder for hver by, fordelt over daterte tiår. Den foreslår steder fra arkivtittel, stedsfelt og emneord, og finner mulige bøker og lokalhistoriske oppslag når stedsnavnet står i tittelen. `node scripts/check-place-link-pilot.mjs` kontrollerer utvalget og datakoblingene. Resultatet kan filtreres på `/pilot/stedskoblinger`. Dette er metadataforslag til menneskelig vurdering, ikke visuell stedfesting eller bekreftede bilde–bok-koblinger.

`node scripts/harvest-sarpsborg-sources.mjs --city Fredrikstad` henter katalogmetadata fra Nasjonalbiblioteket, et utvalg fra DigitaltMuseum med demo-tilgang, kommuneavgrensede registreringer i Kulturminnesøk og filnavntreff fra Wikimedia Commons. Bruk `--city Sarpsborg` for å oppdatere den andre byen. Europeana hentes separat med lokal nøkkel:

```
npm run harvest:europeana -- --query Sarpsborg --limit 5000
npm run harvest:europeana -- --query proxy_dc_title:Sarpsborg --limit 5000
npm run harvest:europeana -- --query Fredrikstad --limit 5000
npm run harvest:europeana -- --query proxy_dc_title:Fredrikstad --limit 5000
node scripts/harvest-localhistory.mjs
node scripts/build-source-candidates.mjs
node scripts/check-source-candidates.mjs
```

Byggeskriptet skriver en normalisert kandidatfil per by i `data/source-candidates/` og en kompakt rapport i `data/source-coverage-report.json`. Europeana-uttrekkene og nøkkelen er ignorert av Git, mens de normaliserte kandidatene og dekningstallene versjoneres. Lokalhistoriewiki-uttrekket gir mulige historiske oppslag, ikke nye bilder. Europeana og DigitaltMuseum slås bare sammen når originalens eksakte objekt-ID kan leses fra lenken. Resten kan fortsatt være dubletter. Verken katalogtreff, rettighetsfelt eller stedsnavn er en kontroll av hva et bilde faktisk viser. Ingen bildefiler lastes ned av disse skriptene.

- Nasjonalbibliotekets katalog: levende søk, medie- og årsfiltre, tilgangsmerking. Kun forhåndsvisninger merket public domain og fri nettilgang vises.
- Internet Archive: levende søk og tilgangssjekk mot metadata og filens HEAD-respons. Lydavspilling krever en tilgjengelig MP3 og en oppgitt Creative Commons-lisens. Originalen er alltid lenket.
- DigitaltMuseum: direkte søkelenker fungerer uten nøkkel. Serveradapteren er klargjort for `DIMU_API_KEY`, men er ikke testet med en ordinær nøkkel. Testnøkkelen brukes ikke i produksjon. Sett nøkkelen som en hemmelig miljøvariabel i Sites før adapteren aktiveres.

Tilgang er ikke det samme som gjenbrukstillatelse. Ukjent tilgang fremstilles aldri som åpen. Ingen arkivfiler lagres eller kopieres inn i prosjektet. Feil hos én kilde påvirker ikke de andre. Tilgangsfiltrene sendes til kildekatalogene og gjelder hele søket. Standardvisningen viser NB-gruppene public eller bokhylla, og IA uten lånebegrensning. NB bruker digital:Ja, contentClasses:public/bokhylla/restricted, og digital:(NOT Ja) for ikke-digitalisert materiale. Norge-filteret dekker Bokhylla; Internet Archive har ikke Norge- eller ikke-digitalisert-grupper. IA-filtilgang kontrolleres ved åpning. Katalogposter er av som standard.

Bildevisningen henter IIIF-manifest fra NB og viser 1800 piksler bredde, eller 3600 ved zoom, begrenset til originalens størrelse. Den støtter panorering, fullskjerm og sidevalg for bøker/aviser. Bare fri nettilgang og public domain fra NB åpner denne leseren. Bokhylla vises i NBs egen leser. Åpne skannede IA-bøker vises gjennom kildens offisielle embed-leser med ekstern reservelenke. Lyd beholder lisens- og filtilgangskontroll.

Tilfeldig skuff velger mellom seks søkespor. Søk returnerer 12 treff per kilde per side, maksimalt 50 sider.

## Kontroll

`node scripts/check-archives.mjs` kontrollerer tilgangsmerking, ukjente rettigheter, bildedatoer og bokstavelige søkeord. `npx tsc --noEmit` kontrollerer typer. Søkeendepunktene er kontrollert lokalt med ekte svar fra Nasjonalbiblioteket og Internet Archive.

## Dokumentasjon

- https://store-search.dimu.org/docs
- https://api.nb.no/?urls.primaryName=items
- https://archive.org/developers/

Publisering følger Sites, med prosjektidentitet i `.openai/hosting.json`. Den nye nettsiden er privat for eieren.


## Tidsperioder og fortsettende bildeblading
Årfilteret støtter enkeltår, intervaller (1900-1999) og undated. Periodevelgeren bevarer det aktive søket og øvrige filtre. Arkivets indekserte år brukes; omtrentlige metadata-intervaller kan derfor ikke alltid matches ved overlapp.

NB bruker searchafter fra første forespørsel, med tom searchAfterId ved start og siste returnerte ID ved fortsettelse. Dette gir samme ID-sortering gjennom hele søket og unngår vanlig pagineringsgrense. Ikke bland relevanssorterte /items-resultater med searchafter. Hver kilde har egen sideteller; lastede resultater beholdes og duplikater fjernes. Bildeviseren henter flere grupper ved behov. Feil avanserer ikke sidetelleren, og søkebytte avbryter utdaterte forespørsler.


## Kronologi og steder
Resultater sorteres etter arkivets indekserte år, med udaterte treff sist i begge retninger. NB traverseres år for år fra årsfacetter og bruker ID-cursor innen hvert år, slik at sidegrensen ikke kutter tidslinjen. IA sorteres etter year og identifier; udaterte poster hentes separat til slutt. Klienten fletter kildekøene med ett kjent neste treff fra hver kilde før et resultat vises. Det hindrer at senere innlastinger flytter bilder bakover på tidslinjen. Kildekøene oppdateres først etter en vellykket innlasting.

Stedsvelgeren bruker Kartverkets fylke-/kommunesnapshot fra 2026-10-04, https://ws.geonorge.no/kommuneinfo/v1/fylkerkommuner. Norske og andre offisielle navn er beholdt. Stedsfilteret matcher geografiske metadata hos NB og coverage/subject/title hos IA; det er ikke en grensepolygon-test eller komplett oversetting av historiske kommunenavn. Søkeord, tidsperiode og tilgang beholdes ved stedsvalg. DigitaltMuseum er fremdeles en ekstern kilde uten direkte API-tilkobling.

Innen hvert år grupperes NB-treff alfabetisk etter registrert by/kommune. NB hentes i år- og kommunebøtter med egen ID-cursor. Treff uten slik stedfesting (blant annet IA) samles under Uten registrert by / kommune. Sted og tidsperiode har hvert sitt panel ved siden av hverandre på store skjermer. Bildeviseren beholder samme skall ved bildebytte; hele skallet med bildeopplysninger brukes i fullskjerm.


## Sarpsborg-pilot

/pilot viser et fast, versjonert utvalg på 200 av 207 åpne NB-bilder med arkivsted Sarpsborg og år 1920–1929. Utvalget er fordelt deterministisk over dato/ID-sorterte treff, ikke et representativt tilfeldig utvalg. data/sarpsborg-pilot.json beholder metadata og bildelenker. Ingen bildefiler lagres.

Alle 200 forhåndsvisningene er visuelt gjennomgått i Codex. 18 foreslåtte motivgrupper kan sammenlignes med 7 grupper fra arkivmetadata. Filtrene kombinerer motiv, sted/sammenheng, år og kontrollstatus. Bildepilene følger det filtrerte utvalget. 18 usikre bilder er merket for kontroll. Gjennomgangen er ikke uavhengig bekreftet; ingen sammenligning mellom API-modeller, OCR, bokkobling eller GPS-verifisering er utført. GPS-feltene er null.

Kjør node scripts/check-pilot.mjs for datasjekk. scripts/apply-pilot-review.mjs bruker den versjonerte visuelle gjennomgangen i data/sarpsborg-visual-review.json.

## Fredrikstad-pilot

/pilot/fredrikstad viser 200 andre NB-poster fra 1920–1929, uten ID-overlapp med Sarpsborg-piloten. Av 287 treff ble fotobaksider og udaterte poster tatt ut før et jevnt utvalg etter arkivdato og ID. Alle 200 forhåndsvisninger er visuelt vurdert i Codex; 20 er merket for ekstra kontroll. Bildeanalysen ble gjennomført i denne samtalen med GPT-6 Sol på middels nivå. Den er ikke en uavhengig kontroll av tidligere kategorier, og det er ikke utført OCR, GPS-verifisering eller bokkoblinger. Kjør `node scripts/check-fredrikstad-pilot.mjs` for integritetskontroll.
