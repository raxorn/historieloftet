# Historieloftet

En privat nettside for å oppdage historie fra Nasjonalbiblioteket, Internet Archive og DigitaltMuseum.

## Kjøring

Node 22.13+ og npm. Installer med `npm ci`, bygg med `npm run build`, og start med `npm start`. `npm run dev` starter utviklingsversjonen. I miljøer med en feilkonfigurert npm-shim kan npm kjøres via den installerte `npm-cli.js`.

## Kilder og tilgang

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
