# Butikstext för Chrome Web Store

Språk: svenska (välj Svenska som standardspråk under Store listing).
Kontrollerat mot Chrome Web Stores krav 2026-10-27: beskrivning, ikon och
minst en skärmbild krävs, ingen nyckelordsspam (samma ord högst fem gånger
i onaturlig upprepning), inga anonyma omdömen.

## Namn (från manifest.json)

Plain Words for Enterprise AI SWE

Inget av Microsofts märken står i namnet. Microsofts regler säger att en
apps namn ska vara fritt från deras märken (se docs/beslut.md).

## Kort beskrivning (från manifest.json, max 132 tecken)

Inofficiell hjälp: håll markören över en knapp i Azure-portalen, Foundry, Copilot Studio eller Power Automate och läs vad den gör.

(130 tecken. Den går inte att ändra i butiken, bara i manifest.json, och då
måste versionen höjas.)

## Kategori

Verktyg (Tools). Alternativ: Utbildning (Education).

## Lång beskrivning (klistras in i fältet Description)

Ska du börja bygga med Microsofts moln och AI men förstår inte knapparna? Håll markören still över en knapp, så förklarar Plain Words vad den gör, med vardagliga ord på svenska.

Varje förklaring har tre delar:
• Knappens eget namn, med det engelska ordet i parentes, så att du känner igen det i guider.
• Vad saken är, i en eller två meningar.
• Nytta: när du har användning av den, till exempel "När du börjar bygga. Sätt en låg budget direkt, så slipper du överraskningar."

Självklara saker, som Uppdatera eller Logga ut, får ingen bubbla. Då slipper du läsa det du redan vet.

Det här förklaras:
• Azure-portalen: startsidan, sökfältet, portalmenyn, prenumerationer, resursgrupper, att skapa en resurs, Cloud Shell, kostnader och budgetar, inställningar och kontomenyn.
• Foundry: modellkatalogen, agenter, kunskap, verktyg, kvoter, nycklar och projektinställningar.
• Copilot Studio: agenter, arbetsflöden, appar och miljöer.
• Power Automate: att skapa flöden, mallar, kopplingar och dina flöden.

Tillägget varnar där det kan kosta pengar, till exempel när en produkt från ett annat företag ska köpas, och förklarar ord som blivit fel översatta.

Gjort för dig som aldrig har använt verktygen och vill förstå dem direkt, på svenska.

Integritet: tillägget samlar inte in något och skickar inget någonstans. Det enda som sparas är om förklaringarna är på eller av, och det sparas bara i din webbläsare. Tillägget klickar aldrig och ändrar ingenting i dina konton.

Plain Words for Enterprise AI SWE är ett fristående tillägg som fungerar med Microsoft Azure-portalen, Microsoft Foundry, Microsoft Copilot Studio och Microsoft Power Automate. Det är inte gjort av, godkänt av eller kopplat till Microsoft. Microsoft, Azure, Copilot och Power Automate är varumärken som tillhör Microsoft Corporation.

## Bilder

| Fält | Fil | Krav |
| --- | --- | --- |
| Butiksikon | `store/icon_store_128.png` | 128x128 PNG, 96x96 bild med 16 px genomskinlig kant. Krävs. |
| Skärmbild 1 | `store/screenshots/1_screenshot_schemalagt_1280x800.png` | 1280x800, minst 1, högst 5. Krävs. |
| Skärmbild 2 | `store/screenshots/2_screenshot_prenumerera_1280x800.png` | |
| Skärmbild 3 | `store/screenshots/3_screenshot_resursgrupper_1280x800.png` | |
| Skärmbild 4 | `store/screenshots/4_screenshot_version_1280x800.png` | |
| Skärmbild 5 | `store/screenshots/5_screenshot_agent_1280x800.png` | |
| Liten kampanjbild | `store/promo_small_440x280.png` | 440x280. Frivillig, men tillägg utan den visas efter dem som har den. |
| Stor kampanjbild (marquee) | ingen | 1400x560, frivillig, behövs bara för att kunna lyftas fram. |

Skärmbilderna i `store/screenshots/` visar riktiga bubblor (samma text och
utseende) utan Microsofts gränssnitt, eftersom Microsofts regler för appar
säger att bilder inte ska visa Microsofts innehåll utan licens.
Riktiga skärmbilder från verktygen ligger i `store/screenshots/ui/`, om du
hellre vill använda dem. Läs beslut 15 i docs/beslut.md först.

## Kontaktuppgifter

Mejl: den adress du verifierar i utvecklarkontot.
Webbplats: https://github.com/substnc/plain-words-for-enterprise-ai-swe
Integritetspolicy: https://substnc.github.io/plain-words-for-enterprise-ai-swe/store/document_integritetspolicy_private.html
