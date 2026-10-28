# Beslut

Varje viktigt val i tre rader: vad som valdes, varför, och vad du ska tänka
på om du gör om det för en annan sajt. I den ordning de gjordes, 27 oktober 2026.

## 1. Namnet: Plain Words for Enterprise AI SWE, utan Microsofts märken

- **Valt:** Först Plain Words for M|AZ SWE, sedan på ditt beslut samlingsnamnet Plain Words for Enterprise AI SWE, när tillägget blev en svit för fyra verktyg.
- **Varför:** Microsofts varumärkesregler säger att en apps namn ska vara fritt från deras märken ("Azure To Go" är deras exempel på fel). GitHub och Miro tillåter "X for Sajt", Microsoft gör det inte. Det är tillåtet att i beskrivningen sanningsenligt säga att tillägget fungerar med Microsoft Azure.
- **Tänk på:** Läs sajtens egna regler för appnamn innan du föreslår namn. Sök också efter samma namn (gh search repos och webben). "Enterprise AI" är ett allmänt begrepp och var ledigt.

## 2. Ingen Microsoft-logga, egen ikon

- **Valt:** pw på en ljusblå cirkel (#4ea8f5), samma form som GitHub- och Miro-tilläggen.
- **Varför:** Microsoft skriver att deras loggor och ikoner aldrig får användas som appens ikon. Ljusare än Azures egen blå (#0078d4) och utan deras former.
- **Tänk på:** Ta sajtens färg i en annan ton, men aldrig dess form eller logga.

## 3. Chrome i stället för den inbyggda webbläsaren

- **Valt:** Inventering och svep i din Chrome via Claude in Chrome, inte i den inbyggda webbläsaren som uppdraget först sa.
- **Varför:** Svepet testar det riktiga tillägget, och den inbyggda webbläsaren kan inte läsa in tillägg. Du valde Chrome när jag frågade.
- **Tänk på:** Krockar uppdraget med skillen: fråga, gissa inte.

## 4. Portalens egna klassnamn som huvudankare

- **Valt:** I Azure-portalen känns saker igen på klassnamn som `fxs-topbar-console` (Cloud Shell), `fxs-sidebar-create`, `fxc-menu-item` och `azc-toolbarButton-container`, och på länkarnas adresser.
- **Varför:** Portalen har nästan inga data-testid. Klassnamnen fxs-, fxc- och azc- är skrivna för hand av Microsoft, beskriver vad saken är och är samma på alla språk. Id som `_weave_e_7` byts vid varje laddning.
- **Tänk på:** Skilj på handskrivna klassnamn (läsbara ord) och genererade (`c-kLYmPV`, `_carouselCard_2njhk_29`). De första går att använda, de andra aldrig.

## 5. Svenska och engelska i varje textregel

- **Valt:** Där bara text eller aria-label finns står både det svenska och det engelska ordet. Bubblans rubrik skrivs "Resursgrupper (Resource groups)".
- **Varför:** Portalen följer webbläsarens språk. Din är på svenska, men guider och kurser är på engelska. Med båda orden känner du igen saken i guiden.
- **Tänk på:** De engelska orden är inte svepta. Att byta portalens språk hade varit en ändring i dina inställningar. Testa med ett konto på engelska om det går.

## 6. Tillägget körs också i portalens ramar

- **Valt:** Ett andra content script för `*.reactblade.portal.azure.net` och `ux.console.azure.com`, med `all_frames`.
- **Varför:** Listorna över resursgrupper och resurser, hela Skapa en resurs, kostnadsanalysen, Copilot-panelen och Cloud Shell ritas i ramar från andra adresser. Utan det fick halva portalen inga bubblor.
- **Tänk på:** Leta efter iframes i inventeringen (`document.querySelectorAll('iframe')`). En ram från en annan adress kräver en egen rad i manifestet och en egen motivering i butiken.

## 7. Svephjälp i ramarna, bara i utvecklarversionen

- **Valt:** `extension/sweep-frame.js` svarar på meddelanden från portalen och sveper inifrån ramen. `tools/bygg-zip.sh` tar bort filen ur zip-filen och manifestet.
- **Varför:** Claude in Chrome kan inte läsa in i en ram från en annan adress. Butiksversionen ska inte ha kod som bara behövs vid test.
- **Tänk på:** Allt som bara är för test ska bort vid bygget, automatiskt, så att det inte kan glömmas.

## 8. Tre små tillägg i content.js

- **Valt:** `page` kan läsa delen efter # (`pageFromHash`), `hasText` kräver att hela texten innehåller ett mönster, och `host` begränsar en regel till en sajt. `normalize` tar också bort ikontecken och normaliserar Unicode.
- **Varför:** Portalen har sidan efter #, kort med lång text saknar egna ankare, fyra sajter behöver hållas isär, och Microsofts ikonknappar har ett osynligt tecken först i texten.
- **Tänk på:** De tre är generella. För gärna in dem i skillens mall så att nästa sajt får dem gratis.

## 9. Fel bubbla är värre än ingen

- **Valt:** Svepet kollar vilken bubbla som visas, inte bara att någon visas. Två fel hittades och rättades: alla sex rader i menyn Resource Manager har samma adress och fick bubblan Resursgrupper, och fliken Molnflöden i Power Automate fick menyradens bubbla.
- **Varför:** En nybörjare lär sig fel av en fel bubbla. Svepets "found"-lista visade ×7 och ×2 där det borde stå ×1.
- **Tänk på:** Läs svepets lista med nycklar och antal. Ett oväntat högt antal betyder ofta att flera saker delar adress.

## 10. Cloud Shell öppnades, men inget valdes

- **Valt:** Panelen öppnades på ditt ja. Välkomstrutan (Bash eller PowerShell) lästes och stängdes med krysset.
- **Varför:** Första gången kan Cloud Shell be om ett lagringskonto, och det vore en ändring i kontot som kostar pengar.
- **Tänk på:** Allt som "startar något" ska frågas om först, även när det ser ofarligt ut.

## 11. Fyra sajter i samma tillägg

- **Valt:** Azure-portalen, Foundry, Copilot Studio och Power Automate i version 1.0, på ditt beslut.
- **Varför:** Samma syfte (förklara Microsofts moln- och AI-verktyg), så butikens krav på ett enda syfte håller. Ett tillägg är enklare för dig och dina läsare än fyra.
- **Tänk på:** Varje sajt är en egen inventering, ett eget svep och en egen behörighet. Räkna med ungefär lika mycket arbete per sajt.

## 12. Två skyddsnät mot fel i Chrome

- **Valt:** Kontrollera att Webbplatsåtkomst är "På alla webbplatser" efter varje omladdning, och att bubblan stängs när musen lämnar sidan eller ramen.
- **Varför:** När manifestet fick nya adresser slutade portal.azure.com få skriptet men inte ramarna. Och en bubbla i en ram blev kvar när musen flyttades ut.
- **Tänk på:** Ser du inga bubblor alls efter en omladdning: kolla Webbplatsåtkomst innan du letar fel i koden.

## 13. Behörigheter: storage och sex adresser

- **Valt:** `permissions: ["storage"]` och content scripts på exakt sex adresser. Inga `host_permissions`, ingen `activeTab`, inget `<all_urls>`.
- **Varför:** Butiken kräver smalast möjliga behörigheter. `activeTab` gäller först efter ett klick, och bubblorna ska synas direkt.
- **Tänk på:** Smalna av till de adresser som har knappar. Varje ny adress ska motiveras i `store/document_behorigheter_cws_private.md`.

## 14. Integritetspolicy trots att inget samlas in

- **Valt:** En kort policy i `store/document_integritetspolicy_private.html` som listar alla sex adresser.
- **Varför:** Butikens FAQ räknar läsning av sidans innehåll som hantering av data, även lokalt, och kräver då en policy på en publik adress.
- **Tänk på:** Policyn måste ligga publikt innan du kan skicka in. Det blir GitHub Pages, och det kräver att repot är publikt.

## 15. Butiksbilder utan Microsofts gränssnitt

- **Valt:** Fem skärmbilder där bubblorna är ritade med exakt samma text och utseende som i tillägget, på svart bakgrund. Riktiga skärmbilder från verktygen ligger som alternativ i `store/screenshots/ui/`.
- **Varför:** Microsofts regler för appar visar "Image/screenshots: No Microsoft Content Featured" som godkänt exempel. Riktiga skärmbilder visar deras gränssnitt och loggor.
- **Tänk på:** Kolla sajtens regler för bilder, inte bara för namn. Måste du använda riktiga bilder: ta bort namn, mejl och företagsnamn, som här.

## 16. Bara läsning i kontona

- **Valt:** Inga resurser, agenter eller flöden skapades. Klicken var bara menyer, flikar, att stänga tipsrutor och att neka cookies i Power Automate.
- **Varför:** Uppdraget sa bara läsa. Därför gick en agents egen sida i Copilot Studio inte att svepa. Du har ingen agent där, och att skapa en vore en ändring.
- **Tänk på:** Vill du ha bubblor på sidor som bara finns när något är skapat: skapa en testsak själv, eller ge uttryckligt ja till det.

## 17. Uppdraget jämfört med skillen /forklara-sajt

- **Valt:** Den enda verkliga krocken, inbyggd webbläsare mot Chrome, togs upp med dig innan arbetet började, och du valde Chrome. Resten stämmer med skillen: bara läsa i kontot (skillens "Aldrig"-lista säger samma sak), `store/` för allt utom zip-filen, ingen uppladdning ("Ladda aldrig upp något själv"). Installationen i Chrome (steg 5) gjorde du själv, och den ändrar inget i Azure. Steg 8 (GitHub) väntar på ditt ja.
- **Varför:** Uppdraget sa att jag skulle fråga om reglerna krockade med skillen. Jämförelsen lades fram för dig i efterhand, 2026-10-27, och du godkände den, liksom att Copilot Studio öppnades med din befintliga inloggning.
- **Tänk på:** Lägg jämförelsen mellan uppdrag och skill i en enda fråga allra först, innan något byggs, även när du tror att det bara finns en krock.

## 18. Skapa-formuläret öppnades, men fylldes aldrig i

- **Valt:** Formuläret för en ny resursgrupp öppnades bara för att läsas. Inget skrevs i fälten, och fliken stängdes utan att Granska och skapa klickades.
- **Varför:** Att öppna ett formulär skapar ingenting. Först knappen Skapa på sista sidan gör det. Formuläret var en del av punkt 1 (flödet för att skapa en resurs).
- **Tänk på:** Skilj på att öppna något och att starta något. Ett formulär är ofarligt, en panel som startar en session kan vara det inte (se 10).

## 19. Administrationscentren för Microsoft 365 och Power Platform

- **Valt:** admin.cloud.microsoft och admin.powerplatform.microsoft.com finns med i version 1.0, på ditt beslut.
- **Varför:** Du såg dem när du utforskade och ville ha dem förklarade. De hör ihop med resten: licenser, användare och miljöer styr vad du kan göra i Copilot Studio och Power Automate.
- **Tänk på:** Varje ny adress ska in i manifestet, policyn och behörighetssvaren samtidigt. Kontrollera Webbplatsåtkomst efter omladdningen (se 12).

## 20. Regler utan host kan läcka till andra sajter

- **Valt:** Portalens regel för kolumnen Typ fick `host`, eftersom den gav fel bubbla på tio meddelanden i Power Platform-centret.
- **Varför:** `[role="gridcell"] button` finns på många Microsoft-sajter men betyder olika saker. Allmänna regler (kolumnrubrik, filter) får gälla överallt, men bara om betydelsen är densamma.
- **Tänk på:** När en ny sajt läggs till: läs svepets lista efter nycklar från andra sajter. Dyker de upp, kontrollera att bubblan stämmer.

## 21. Bubblorna stänger varandra mellan sida och ramar

- **Valt:** När musen rör sig i sidan eller en ram skickar tillägget `{ pwHide: 1 }` till de andra delarna, så att deras bubblor stängs.
- **Varför:** En ram ligger i en egen process. Sidan märker inte när musen går in i ramen, så Cloud Shell-bubblan blev kvar. Meddelandet innehåller ingenting från sidan.
- **Tänk på:** Sajter med ramar från andra adresser behöver det här. Prova genom att hovra i toppfältet och gå rakt in i ramen.

## 22. En utvecklarmiljö skapades utan att någon bad om det

- **Valt:** Miljön "Anthon Bäckström" (typ Utvecklare, skapad 2026-10-27) lämnades orörd och rapporterades till dig.
- **Varför:** Den skapades troligen automatiskt när Copilot Studio öppnades via adressen ~personal under svepet. Att bara öppna en sajt räckte. Att ta bort den vore en ny ändring, och det är ditt beslut.
- **Tänk på:** Vissa Microsoft-sajter skapar saker vid första besöket. Kolla miljöer och resurser före och efter ett svep, och tala om vad som har ändrats.

## 23. Beskrivningen skrevs om efter avslag för sökordsspam

- **Valt:** Varje produktnamn nämns en gång i punktlistan. Friskrivningen säger bara "Produktnamnen ovan är varumärken som tillhör sina ägare" i stället för att räkna upp dem igen.
- **Varför:** Chrome Web Store avvisade version 1.0 (Yellow Argon) på grund av meningen där "Microsoft" stod sju gånger. Butiken räknar upprepning av samma ord, och en friskrivning räknas också.
- **Tänk på:** Räkna hur många gånger varje märke står i den långa beskrivningen. Håll det under fem, och skriv friskrivningen utan namn.
