# Fliken Privacy i Chrome Web Store

Svaren att klistra in, fält för fält. Kontrollerat mot Chrome Web Stores
krav och policyer 2026-10-27 (developer.chrome.com/docs/webstore:
program-policies, cws-dashboard-privacy, user-data-faq). Svaren skrivs på
engelska, eftersom granskarna läser engelska. Svensk översättning under
varje svar.

## Single purpose

> Shows short Swedish explanations of buttons, menus and pages when the user hovers over them in Microsoft's cloud and AI web tools: the Azure portal, Foundry, Copilot Studio, Power Automate, and the Microsoft 365 and Power Platform admin centers.

Svenska: Visar korta förklaringar på svenska av knappar, menyer och sidor när man håller musen över dem i Microsofts moln- och AI-verktyg på webben: Azure-portalen, Foundry, Copilot Studio, Power Automate och administrationscentren för Microsoft 365 och Power Platform.

Ett syfte: förklara gränssnittet. Sex sajter, men samma sak på alla.

## Behörigheter

Tillägget ber om en behörighet, `storage`, och har content scripts på åtta
adresser. Det finns inga `host_permissions`, ingen `activeTab`, `tabs` eller
`scripting`.

### storage

> Saves one setting locally: whether the explanations are switched on or off. Nothing else is stored, and nothing leaves the browser.

Svenska: Sparar en inställning lokalt: om förklaringarna är på eller av. Inget annat sparas, och inget lämnar webbläsaren.

### Host permission justification (content script-adresserna)

> The content script runs only on the six Microsoft tools it explains and on two Microsoft frame hosts that the Azure portal uses to show its pages:
> - https://portal.azure.com/* (Azure portal)
> - https://*.reactblade.portal.azure.net/* (frames inside the Azure portal that show lists, the create page and cost analysis)
> - https://ux.console.azure.com/* (the Cloud Shell frame inside the Azure portal)
> - https://ai.azure.com/* (Foundry)
> - https://copilotstudio.microsoft.com/* (Copilot Studio)
> - https://make.powerautomate.com/* (Power Automate)
> - https://admin.cloud.microsoft/* (Microsoft 365 admin center)
> - https://admin.powerplatform.microsoft.com/* (Power Platform admin center)
> It reads the labels and attributes of the site's own buttons (aria-label, data-testid, class names, link paths) to choose which explanation to show. It never stores or sends any page content, makes no network requests and never clicks anything.

Svenska: Skriptet körs bara på de sex verktyg det förklarar, och på två adresser som Azure-portalen visar sina sidor i (ramar). Det läser namnen på sajtens egna knappar för att välja förklaring. Det sparar eller skickar aldrig något från sidan, gör inga nätverksanrop och klickar aldrig.

## Varför inga fler behörigheter

| Behörighet | Behövs inte, eftersom |
| --- | --- |
| `host_permissions` | Ett content script i manifestet behöver det inte. Det räcker med `matches`. |
| `activeTab` | Den gäller först efter ett klick på ikonen. Förklaringarna ska synas direkt. |
| `tabs`, `scripting` | Tillägget öppnar inga flikar och lägger inte in skript i efterhand. |
| `<all_urls>` eller `*.azure.com` | Bara de åtta adresserna ovan har knappar att förklara. Smalast möjliga. |

`all_frames` gäller bara de två ram-adresserna, inte de sex sajterna.

## Remote code

> No, I am not using remote code.

All kod ligger i paketet. Inga skript hämtas från nätet.

## Data usage

Kryssa inte i någon datatyp. Tillägget samlar inte in:
personuppgifter, hälsa, ekonomi, autentisering, kommunikation, plats,
webbhistorik, användaraktivitet eller webbplatsinnehåll.

Varför "webbplatsinnehåll" inte kryssas: tillägget läser knappars namn i
stunden för att välja förklaring, men samlar inte in, sparar eller skickar
dem. Butikens FAQ säger att hantering lokalt också ska redovisas. Det görs
i integritetspolicyn och i Single purpose ovan. Vill du vara extra försiktig
kan du kryssa i "Website content" och skriva samma förklaring. Det ändrar
inget i granskningen åt det sämre.

Kryssa i alla tre intygen:
- I do not sell or transfer user data to third parties, outside of the approved use cases.
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose.
- I do not use or transfer user data to determine creditworthiness or for lending purposes.

## Privacy policy

https://substnc.github.io/plain-words-for-enterprise-ai-swe/store/document_integritetspolicy_private.html

Adressen fungerar först när repot är publikt med GitHub Pages påslaget
(grenen main, mappen /). Fram till dess finns ingen publik adress, och då
går tillägget inte att skicka in.
