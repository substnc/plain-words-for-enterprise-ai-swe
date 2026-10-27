# Plain Words for Enterprise AI SWE

Webbläsartillägg som förklarar Microsofts moln- och AI-verktyg med vardagliga ord
på svenska: Azure-portalen, Foundry, Copilot Studio, Power Automate och
administrationscentren för Microsoft 365 och Power Platform.
Skapat med skillen `/forklara-sajt`. Lärdomarna står i
`~/.claude/skills/forklara-sajt/referens.md`.

## Hur det körs

- Tillägget är mappen `extension/`. Det läses in i Chrome via
  `chrome://extensions`, Läs in okomprimerat tillägg. Efter en ändring:
  runda pilen på tilläggets kort, sedan ladda om sidan.
- `node tests/check-texts.js` kollar alla texter.
- `tests/sweep-in-browser.js` letar efter knappar utan förklaring, inloggat
  i Chrome. Siffrorna loggas i `tests/sweep-log.txt`.

## Regler för det här projektet

- Varje förklaring har `text` (vad saken är) och `use` (börjar med "När du").
  Max två meningar. Inga tankstreck. Skriv för någon som aldrig har kodat.
- Tre nivåer: hela bubblan, `obvious: true` (bara första raden) eller ingen
  bubbla alls (`PW_SKIPPED`, sedan `node tests/sync-skipped.js`).
- Känn igen saker på `data-testid`, `data-automation-id`, portalens klassnamn
  (fxs-, fxc-, azc-) och länkadresser. aria-label och text som reserv, på
  svenska och engelska. Aldrig på genererade id eller klassnamn (_weave_e_7,
  _r_4c_, _carouselCard_2njhk_29).
- Regler för en viss sajt får `host`, så att de inte krockar med de andra.
- Azure-portalen visar sidan efter # och ritar mycket i ramar
  (reactblade.portal.azure.net, ux.console.azure.com). Ramarna sveps med
  `tests/sweep-frames.js`.
- Skapa, ändra eller ta aldrig bort något i Anthons konton under svepet.
- Accentfärgen är #4ea8f5. Den syns bara i ikonen, sajtens namn i rutan och reglaget.
- Hellre ingen bubbla än fel bubbla.
- Avvikelse från projektskelettet: inget `src/` eller `assets/`. Chrome
  kräver att tillägget ligger samlat i en mapp, därför `extension/`.
  Butiksmaterialet ligger i `store/`, besluten i `docs/beslut.md`.
- Ny version till butiken: höj `version` i manifest.json, kör
  `bash tools/bygg-zip.sh`. Zip-filen hamnar i projektroten och är i .gitignore.
  Svephjälpen `sweep-frame.js` tas bort ur zip-filen automatiskt.
