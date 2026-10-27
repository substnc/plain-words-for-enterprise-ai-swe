# Plain Words for Enterprise AI SWE

Microsofts moln- och AI-verktyg förklarade med vanliga ord, på svenska: Azure-portalen, Foundry, Copilot Studio och Power Automate.

Ett webbläsartillägg för Chrome som förklarar knappar, flikar och menyer i Azure-portalen, Foundry, Copilot Studio och Power Automate med vardagliga ord. Håll musen still över något i en halv sekund så dyker en pratbubbla upp. Den säger vad saken är, och under rubriken Nytta när du har användning av den.

**Så installerar du det:** läs [LASMIG.md](LASMIG.md).

## Mappar

- `extension/` själva tillägget. `explanations.js` innehåller alla förklaringar.
- `tests/check-texts.js` kollar att varje förklaring följer reglerna. Kör `node tests/check-texts.js`.
- `tests/sweep-in-browser.js` letar efter knappar som saknar förklaring, i din egen inloggade webbläsare.
- `tests/sweep-frames.js` gör samma sak i Azure-portalens ramar, med svephjälpen `extension/sweep-frame.js` (bara i utvecklarversionen).
- `tests/sweep-log.txt` är loggen över svepen: vad som förklaras, ankarna och siffrorna.
- `store/` allt till Chrome Web Store utom zip-filen. `docs/beslut.md` förklarar valen.
- `tools/bygg-zip.sh` packar zip-filen till butiken. `tools/make_store_images.py` ritar butiksbilderna.
- `tools/make_icons.py` ritar ikonerna.
- `bygg-safari.sh` gör om tillägget till en Safari-app på en Mac.

Av Anthon Bäckström. MIT-licens.
