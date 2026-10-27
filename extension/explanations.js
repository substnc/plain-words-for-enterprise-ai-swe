/*
 * Plain Words for Enterprise AI SWE: alla förklaringar.
 *
 * PW_CONFIG säger hur tillägget ska bete sig på portal.azure.com.
 * PW_EXPLANATIONS är listan med förklaringar. Varje förklaring har:
 *   key        en intern kod (används bara av programmet och testerna)
 *   name       vad saken heter på sajten (visas i grått överst i bubblan).
 *              Portalen finns på svenska och engelska. Namnet skrivs som det
 *              står på svenska, med det engelska i parentes när det skiljer sig.
 *   text       vad saken är, med vardagliga ord, max två korta meningar
 *   use        när man har nytta av den, börjar med "När", visas under rubriken Nytta
 *   obvious    true i stället för use när saken är nästan självklar.
 *              Då visas bara namnet och första raden.
 *
 * Helt självklara saker (Logga ut, Uppdatera, Stäng) får ingen bubbla alls. De
 * står i PW_SKIPPED längst ner, så att svepet räknar dem som medvetet utan.
 *
 * Och ett eller flera sätt att känna igen saken på sidan. Programmet provar
 * dem i den här ordningen: ids, aria (aria-label, title, placeholder, alt),
 * href (länkens adress utan ?-del), selectors (CSS) och sist texts (synlig text).
 * Siffror, parenteser och kolon tas bort före jämförelsen, och allt jämförs
 * med små bokstäver. En sträng måste stämma exakt, ett /mönster/ räcker att det matchar.
 *
 * Azure-portalen:
 * - Sidan står efter # i adressen. href fungerar därför inte (den hoppar över
 *   #-länkar). Adresser känns igen med selectors, till exempel
 *   a[href$="itemId/resourcegroups"], och page jämförs mot delen efter #.
 * - Portalens egna klassnamn fxs-* (skalet), fxc-* (kontroller) och azc-*
 *   (verktygsraden) är skrivna för hand och samma på alla språk. De används
 *   före aria-label och text. Id som _weave_e_7 och menur1i byts vid varje
 *   laddning och används aldrig.
 * - Mycket ritas i ramar från sandbox-N.reactblade.portal.azure.net. Samma
 *   filer körs där. Förklaringar för ramarna står i ett eget avsnitt.
 *
 * Valfria begränsningar:
 *   tags       bara de här elementtyperna för texts, t.ex. ["a"] eller ["button"]
 *   within     måste ligga inuti något som matchar den här CSS-väljaren
 *   notWithin  får inte ligga inuti något som matchar den här CSS-väljaren
 *   page       adressen efter # måste matcha det här mönstret
 *   hasText    hela texten i elementet måste matcha mönstret (även lång text)
 *   host       sajtens eller ramens värdnamn måste matcha mönstret, t.ex. /^ai\.azure\.com$/
 * Förklaringar med within eller page provas före andra.
 */
(function () {
  globalThis.PW_CONFIG = {
    // Rubriken över nyttan i bubblan.
    useLabel: "Nytta",
    // Varje nytta ska börja så här. Kollas av tests/check-texts.js.
    useStartsWith: "När ",
    // Text som människor själva har skrivit. Där jämförs aldrig knapptext.
    userContent: "article p, blockquote, pre, code, textarea, [contenteditable]",
    sameSiteHosts: [],
    // Azure-portalen visar sidan efter # i adressen. De andra sajterna gör inte det.
    pageFromHash: ["portal.azure.com"],
    // Där bubblan läggs bredvid saken i stället för under: menyer, listor och
    // lodräta verktygsfält.
    sidePlacement:
      '[role="menu"], [role="listbox"], [role="tree"], .fxs-sidebar, .fxc-menu-item, .fxs-settings-menu-item, #mectrl_main_body, [role="menuitem"]'
  };

  // Länkar i menyerna. Adressen står efter #, och slutet är samma för alla resurser.
  function menuEnd(end) {
    return 'a.fxc-menu-item[href$="/' + end + '"]';
  }
  // Knappar i verktygsraden högst upp på en sida. De har bara text.
  var TOOLBAR = ".azc-toolbarButton-container, .fxs-commandBar-item, .azc-toolbar-item";
  var HOME = ".fxs-home-container";
  // Startsidan för den som redan har skapat något.
  var RETURNING = '[data-testid="freHomeContainer-returningPage"]';

  // Microsoft Foundry (ai.azure.com). Länkarna har ofta ?tid=... på slutet.
  var FOUNDRY = /^ai\.azure\.com$/;
  // Copilot Studio och Power Automate (Power Platform). Sidan står efter /environments/<miljö>/.
  var STUDIO = /^copilotstudio\.microsoft\.com$/;
  var AUTOMATE = /^make\.powerautomate\.com$/;
  function tid(id) {
    return '[data-testid="' + id + '"]';
  }
  function auto(id) {
    return '[data-automation-id="' + id + '"]';
  }
  function envLink(seg) {
    return ['a[href$="/' + seg + '"]', 'a[href*="/' + seg + '?"]'];
  }
  function fLink(seg) {
    return ['a[href$="/' + seg + '"]', 'a[href*="/' + seg + '?"]'];
  }

  var SIDEBAR = "a.fxs-sidebar-item-link";
  // Verktygsrader inne i ramarna (Microsofts komponentbibliotek Fluent).
  var FRAME_TOOLBAR = '[role="toolbar"], [role="menubar"]';
  // Små filterknappar ovanför listorna i ramarna.
  var FRAME_FILTER = '[id^="fui-InteractionTag"]';
  // Kategorierna till vänster i Skapa en resurs.
  var CREATE_CATEGORIES = ["ai-apps-and-agents", "ai-plus-machine-learning", "analytics", "blockchain", "compute", "databases", "developer-tools", "devops", "identity", "integration", "internet-of-things", "it-and-management-tools", "media", "migration", "mixed-reality", "monitoring-and-diagnostics", "security", "web", "collaboration", "Commerce", "compliance-and-legal", "customer-service", "finance", "geolocation", "human-resources", "marketing", "operations-and-supply-chain", "productivity", "Sales", "task-and-project-management"].map(function (id) {
    return 'div[role="button"][data-testid="' + id + '"]';
  });

  globalThis.PW_EXPLANATIONS = [
    /* ---------------- Toppfältet ---------------- */
    {
      key: "topbar-portal-menu",
      name: "Portalmenyn (Portal menu)",
      text: "Öppnar menyn till vänster med genvägar till allt i portalen: skapa, startsidan, alla tjänster och dina favoriter.",
      use: "När du vill hitta en tjänst eller dina resurser utan att söka.",
      selectors: [".fxs-topbar-sidebar-collapse-button"]
    },
    {
      key: "topbar-cloud-menu",
      name: "Microsoft Cloud-menyn",
      text: "En meny med länkar till Microsofts andra molntjänster, till exempel Microsoft 365 och administrationen för din organisation.",
      use: "När du vill hoppa till en annan Microsoft-tjänst med samma inloggning.",
      ids: ["cloud-menu-button"],
      selectors: [".fxs-topbar-wafflemenu"]
    },
    {
      key: "topbar-home",
      name: "Microsoft Azure",
      text: "Tar dig tillbaka till startsidan, var du än är i portalen.",
      obvious: true,
      selectors: ["a.fxs-topbar-home"]
    },
    {
      key: "topbar-search",
      name: "Sök (Search)",
      text: "Sökrutan för hela Azure. Den hittar tjänster, sådant du har skapat och Microsofts hjälptexter.",
      use: "När du vet vad saken heter men inte var den finns. Tryck G och sedan / för att hoppa hit.",
      selectors: [".fxs-topbar-search input", "input.fxs-search", ".fxs-topbar-search"]
    },
    {
      key: "topbar-copilot",
      name: "Copilot",
      text: "Microsofts AI-assistent i portalen. Du kan fråga om dina resurser och hur man gör saker, på svenska eller engelska.",
      use: "När du inte vet hur du gör något och vill ha förslag. Läs svaret noga innan du ändrar något.",
      selectors: [".fxs-topbar-copilot"]
    },
    {
      key: "topbar-cloud-shell",
      name: "Cloud Shell",
      text: "Ett kommandofönster i webbläsaren, där du skriver kommandon i stället för att klicka. Datorn som kör dem står hos Microsoft.",
      use: "När en guide säger att du ska köra ett kommando, till exempel az. Första gången väljer du Bash eller PowerShell.",
      selectors: [".fxs-topbar-console"]
    },
    {
      key: "topbar-notifications",
      name: "Meddelanden (Notifications)",
      text: "Klockan visar vad som har hänt nyss, till exempel att något har skapats klart eller att det blev fel.",
      use: "När du har startat något som tar tid och vill se om det är färdigt.",
      aria: ["meddelanden", "notifications", /^\d* ?nya meddelanden/, /^\d* ?new notifications/],
      within: ".fxs-topbar"
    },
    {
      key: "topbar-settings",
      name: "Inställningar (Settings)",
      text: "Inställningar för portalen: språk, utseende och vilka organisationer och prenumerationer du ser.",
      use: "När du vill byta språk eller organisation, eller saknar en prenumeration.",
      selectors: [".fxs-topbar-settings"]
    },
    {
      key: "topbar-help",
      name: "Support och felsökning (Help)",
      text: "Hjälp från Microsoft: guider, svar på vanliga problem och sätt att kontakta deras support.",
      use: "När något inte fungerar och du vill hitta orsaken eller fråga Microsoft.",
      aria: ["support och felsökning", "support + troubleshooting", "help", "hjälp", "hjälp och support", "help + support"],
      within: ".fxs-topbar"
    },
    {
      key: "topbar-feedback",
      name: "Feedback",
      text: "Skickar dina åsikter om portalen till Microsoft. Det påverkar inte ditt konto.",
      obvious: true,
      selectors: [".fxs-topbar-feedback"]
    },
    {
      key: "topbar-account",
      name: "Kontomenyn (Account)",
      text: "Visar vem du är inloggad som och i vilken organisation (katalog). Här byter du konto eller katalog.",
      use: "När du har flera konton eller organisationer och vill kolla att du är på rätt ställe.",
      ids: ["fxs-avatarmenu-button"],
      selectors: [".fxs-menu-account"]
    },

    /* ---------------- Kontomenyn ---------------- */
    {
      key: "account-view",
      name: "Visa konto (View account)",
      text: "Öppnar ditt Microsoft-konto i en ny flik, med lösenord, säkerhet och profil.",
      obvious: true,
      ids: ["mectrl_viewAccount"]
    },
    {
      key: "account-switch-directory",
      name: "Växla katalog (Switch directory)",
      text: "Byter organisation. En katalog (directory) är en organisation hos Microsoft, med egna användare och prenumerationer.",
      use: "När du jobbar för flera företag och ska se ett annat företags saker i Azure.",
      ids: ["mectrl_switchdirectory"],
      selectors: ['a[href="#menu/directory"]', 'a[href="#settings/directory"]']
    },
    {
      key: "account-more",
      name: "Fler alternativ (More options)",
      text: "Fler val för ditt konto.",
      obvious: true,
      ids: ["mectrl_moreCommands_trigger"]
    },
    {
      key: "account-permissions",
      name: "Mina behörigheter (My permissions)",
      text: "Visar vad du har lov att göra i prenumerationen, alltså vilken roll du har.",
      use: "När en knapp är grå eller du får åtkomst nekad och vill veta varför.",
      ids: ["mectrl_mypermissions"]
    },
    {
      key: "account-bill",
      name: "Visa min faktura (View my bill)",
      text: "Öppnar fakturorna för ditt konto.",
      use: "När du vill se vad Azure har kostat och vad du ska betala.",
      ids: ["mectrl_billing"]
    },
    {
      key: "account-contact",
      name: "Mina kontaktuppgifter (My contact info)",
      text: "Dina kontaktuppgifter hos Microsoft, som används för fakturor och viktiga meddelanden.",
      obvious: true,
      ids: ["mectrl_contactinfo"]
    },

    /* ---------------- Portalmenyn till vänster ---------------- */
    {
      key: "menu-create",
      name: "Skapa en resurs (Create a resource)",
      text: "Startar flödet för att skapa något nytt i Azure, som en webbapp, en databas eller en virtuell dator. Allt du skapar kallas en resurs.",
      use: "När du ska bygga något. Du väljer tjänst och fyller i ett formulär, och inget skapas förrän du klickar Skapa sist.",
      selectors: [".fxs-sidebar-create", 'a[href="#create/hub"]']
    },
    {
      key: "menu-home",
      name: "Start (Home)",
      text: "Tillbaka till startsidan.",
      obvious: true,
      selectors: [".fxs-sidebar-home"]
    },
    {
      key: "menu-dashboard",
      name: "Instrumentpanel (Dashboard)",
      text: "En egen sida där du samlar rutor med det du vill hålla koll på, som grafer och genvägar.",
      use: "När du vill se det viktigaste på ett ställe varje gång du loggar in.",
      selectors: [".fxs-sidebar-dashboard"]
    },
    {
      key: "menu-all-services",
      name: "Alla tjänster (All services)",
      text: "En lista över alla Azures tjänster, sorterade i grupper som beräkning, lagring och nätverk.",
      use: "När du letar efter en tjänst och vill se vad som finns. Stjärnan lägger den i menyn.",
      selectors: [".fxs-sidebar-browse", 'a[href="#allservices/category/All"]', 'a[href^="#allservices"]']
    },
    {
      key: "menu-favorites",
      name: "Favoriter (Favorites)",
      text: "Dina genvägar. Du lägger till fler med stjärnan bredvid en tjänst.",
      obvious: true,
      selectors: [".fxs-sidebar-myfavorites", ".fxs-sidebar-favorites-section"]
    },
    {
      key: "menu-app-templates",
      name: "Programmallar (App templates)",
      text: "Färdiga paket med flera resurser som hör ihop, till exempel en webbsida med databas.",
      use: "När du vill komma igång snabbt och slippa bygga allt från början.",
      selectors: [SIDEBAR + '[href*="CuratedWorkloads"]']
    },
    {
      key: "all-resources",
      name: "Alla resurser (All resources)",
      text: "En lista över allt du har skapat i Azure, oavsett sort, i de prenumerationer du ser.",
      use: "När du vill se allt du har på ett ställe, eller leta efter något som kostar pengar.",
      selectors: ['a:not(.fxc-menu-item)[href$="itemId/browseAll"]', 'a:not(.fxc-menu-item)[href$="/browseAll"]'],
      texts: ["alla resurser", "all resources"],
      within: SIDEBAR + ", .fxc-menu-item"
    },
    {
      key: "resource-groups",
      name: "Resursgrupper (Resource groups)",
      text: "En resursgrupp är en mapp för resurser som hör ihop, till exempel allt till en webbsida. Varje resurs ligger i exakt en grupp.",
      use: "När du startar ett nytt projekt, eller vill ta bort allt som hör till ett projekt på en gång.",
      selectors: ['a:not(.fxc-menu-item)[href$="itemId/resourcegroups"]', 'a:not(.fxc-menu-item)[href$="/resourcegroups"]'],
      texts: ["resursgrupper", "resource groups"],
      within: SIDEBAR + ", .fxc-menu-item"
    },
    {
      key: "service-app-service",
      name: "App Services",
      text: "Tjänsten där du lägger upp webbsidor och webbappar utan att sköta någon server själv.",
      use: "När du ska publicera en webbsida eller ett API.",
      selectors: [SIDEBAR + '[href$="resourceType/Microsoft.Web%2Fsites"]']
    },
    {
      key: "service-function-app",
      name: "Funktionsapp (Function App)",
      text: "Små bitar kod som körs bara när något händer, till exempel när en fil laddas upp. Du betalar bara när koden körs.",
      use: "När du vill automatisera något litet utan en hel server.",
      selectors: [SIDEBAR + '[href$="kind/functionapp"]']
    },
    {
      key: "service-sql",
      name: "Azure SQL Database",
      text: "En databas i molnet, alltså ett ställe där en app sparar uppgifter i tabeller. Microsoft sköter servern åt dig.",
      use: "När din app behöver spara uppgifter som användare, ordrar eller texter.",
      selectors: [SIDEBAR + '[href*="AzureSqlHub"]', SIDEBAR + '[href*="Microsoft.Sql%2F"]']
    },
    {
      key: "service-cosmos",
      name: "Azure Cosmos DB",
      text: "En annan sorts databas, för uppgifter som inte passar i tabeller och för appar med användare över hela världen.",
      use: "När din app sparar data som JSON eller behöver svara snabbt överallt.",
      selectors: [SIDEBAR + '[href*="Microsoft.DocumentDb"]', SIDEBAR + '[href*="Microsoft.DocumentDB"]']
    },
    {
      key: "service-vm",
      name: "Virtuella datorer (Virtual machines)",
      text: "En hel dator som du hyr i Microsofts datacenter, med Windows eller Linux. Du sköter den själv och betalar medan den är igång.",
      use: "När du behöver full kontroll över en dator i molnet. Stäng av den när du inte använder den.",
      selectors: [SIDEBAR + '[href*="virtualMachinesBrowse"]', SIDEBAR + '[href*="Microsoft.Compute%2FVirtualMachines"]']
    },
    {
      key: "service-load-balancer",
      name: "Lastbalanserare (Load balancers)",
      text: "Fördelar besökare mellan flera servrar så att ingen av dem blir överbelastad.",
      use: "När du har flera servrar som gör samma sak. Behövs sällan i början.",
      selectors: [SIDEBAR + '[href$="itemId/loadBalancers"]']
    },
    {
      key: "service-storage",
      name: "Lagringskonton (Storage accounts)",
      text: "Ett förråd i molnet för filer, bilder, säkerhetskopior och enkla tabeller.",
      use: "När du behöver spara filer som en app eller du själv ska kunna hämta senare.",
      selectors: [SIDEBAR + '[href*="StorageAccountsBrowse"]']
    },
    {
      key: "service-vnet",
      name: "Virtuellt nätverk (Virtual network)",
      text: "Ett privat nätverk i Azure där dina resurser kan prata med varandra utan att synas på internet.",
      use: "När du bygger något med flera delar som ska vara skyddade från omvärlden.",
      selectors: [SIDEBAR + '[href$="itemId/virtualnetworks"]']
    },
    {
      key: "service-entra",
      name: "Microsoft Entra ID",
      text: "Microsofts register över användare och grupper i din organisation. Här styr du vem som kan logga in.",
      use: "När du ska lägga till en kollega eller se vilka som har konto.",
      selectors: [SIDEBAR + '[href*="Microsoft_AAD_IAM/ActiveDirectoryMenuBlade"]']
    },
    {
      key: "service-monitor",
      name: "Övervaka (Monitor)",
      text: "Samlar mätvärden, loggar och larm från dina resurser på ett ställe.",
      use: "När du vill veta om något går långsamt, kraschar eller används mycket.",
      selectors: [SIDEBAR + '[href*="AzureMonitoringBrowseBlade"]']
    },
    {
      key: "service-advisor",
      name: "Advisor",
      text: "Azures egna råd om hur du kan spara pengar, öka säkerheten och få saker att gå snabbare.",
      use: "När du vill veta vad du borde ändra. Titta hit någon gång i månaden.",
      selectors: [SIDEBAR + '[href*="AdvisorMenuBlade"]', menuEnd("advisorRecommendations"), 'a.fxc-menu-item[href$="~/costrecommendations"]']
    },
    {
      key: "service-defender",
      name: "Microsoft Defender för molnet (Defender for Cloud)",
      text: "Säkerhetsvakten för dina resurser. Den letar efter svagheter och varnar för angrepp.",
      use: "När du vill kolla att det du har byggt inte står öppet för angrepp.",
      selectors: [SIDEBAR + '[href*="Microsoft_Azure_Security/SecurityMenuBlade"]']
    },
    {
      key: "service-cost-billing",
      name: "Kostnadshantering + fakturering (Cost Management + Billing)",
      text: "Allt om pengar: vad Azure kostar just nu, vad du har betalat och dina fakturor.",
      use: "När du vill se vad Azure kostar dig, eller sätta en budget som varnar i tid.",
      selectors: [SIDEBAR + '[href*="ModernBillingMenuBlade"]']
    },
    {
      key: "service-help",
      name: "Hjälp och support (Help + support)",
      text: "Microsofts hjälp och support, samma som frågetecknet uppe till höger.",
      obvious: true,
      selectors: [SIDEBAR + '[href*="HelpAndSupportBlade"]']
    },

    /* ---------------- Startsidan ---------------- */
    {
      key: "home-create-heading",
      name: "Skapa en resurs (Create a resource)",
      text: "Genvägar till de tjänster som nybörjare oftast börjar med. Ett klick öppnar formuläret, inget skapas än.",
      obvious: true,
      texts: ["skapa en resurs", "create a resource"],
      tags: ["h2", "h3"],
      within: HOME
    },
    {
      key: "home-vm",
      name: "Virtuell dator (Virtual machine)",
      text: "Öppnar formuläret för en virtuell dator, en hel dator med Windows eller Linux som du hyr hos Microsoft.",
      use: "När du behöver en egen server. Den kostar medan den är igång, så stäng av den efteråt.",
      aria: ["virtuell dator", "virtual machine"],
      texts: [/^virtuell dator\b/, /^virtual machine\b/],
      within: HOME
    },
    {
      key: "home-storage",
      name: "Lagringskonto (Storage account)",
      text: "Öppnar formuläret för ett lagringskonto, ett förråd i molnet för filer, bilder och säkerhetskopior.",
      use: "När en app eller du själv behöver spara filer. Det är en av de billigaste resurserna att prova med.",
      aria: ["lagringskonto", "storage account"],
      texts: [/^lagringskonto\b/, /^storage account\b/],
      within: HOME
    },
    {
      key: "home-sql",
      name: "SQL Database",
      text: "Öppnar formuläret för en SQL-databas, ett ställe där en app sparar uppgifter i tabeller.",
      use: "När din app behöver spara uppgifter. Välj den minsta storleken när du provar.",
      aria: ["sql database"],
      texts: [/^sql database\b/],
      within: HOME
    },
    {
      key: "home-container-apps",
      name: "Behållarappar (Container Apps)",
      text: "Kör program som är packade i behållare (containers), ett sätt att paketera en app med allt den behöver.",
      use: "När du har en app i en container och inte vill sköta servrar själv.",
      aria: ["behållarappar", "container apps", "container app"],
      texts: [/^behållarappar\b/, /^container apps?\b/],
      within: HOME
    },
    {
      key: "home-function-app",
      name: "Funktionsapp (Function App)",
      text: "Öppnar formuläret för en funktionsapp: små bitar kod som körs bara när något händer.",
      use: "När du vill automatisera något litet och bara betala när koden faktiskt körs.",
      aria: ["funktionsapp", "function app"],
      texts: [/^funktionsapp\b/, /^function app\b/],
      within: HOME
    },
    {
      key: "home-web-app",
      name: "Webbapp (Web App)",
      text: "Öppnar formuläret för en webbapp, en plats där din webbsida eller ditt API ligger uppe på internet.",
      use: "När du ska publicera en webbsida. Det finns en gratisnivå (Free) att prova med.",
      aria: ["webbapp", "web app"],
      texts: [/^webbapp\b/, /^web app\b/],
      within: HOME
    },
    {
      key: "home-more-ways",
      name: "Fler sätt att skapa (More ways to create)",
      text: "Andra vägar in än formulären: AI-verktyg och kommandon.",
      obvious: true,
      texts: ["fler sätt att skapa", "more ways to create"],
      tags: ["h2", "h3"],
      within: HOME
    },
    {
      key: "home-foundry",
      name: "Microsoft Foundry",
      text: "Microsofts verkstad för AI, där du provar och bygger med språkmodeller som GPT.",
      use: "När du vill bygga en egen AI-tjänst eller chattbot.",
      texts: [/foundry/, /populära modeller/, /popular models/],
      within: HOME
    },
    {
      key: "home-copilot-cli",
      name: "GitHub Copilot CLI",
      text: "Ett program för terminalen där en AI hjälper dig att skriva och köra kommandon mot Azure.",
      use: "När du hellre beskriver vad du vill göra och låter AI:n skriva kommandot.",
      texts: [/copilot cli/],
      within: HOME
    },

    /* ---------------- Startsidan för den som har skapat något ---------------- */
    {
      key: "home2-template",
      name: "Starta med en mall (Start with a template)",
      text: "Färdiga paket med kod och resurser för vanliga sorters appar. Ett klick visar mallarna, inget skapas än.",
      use: "När du vill komma igång snabbt och slippa bygga allt från början.",
      aria: ["starta med en mall", "start with a template"],
      within: RETURNING
    },
    {
      key: "home2-create",
      name: "Skapa en resurs (Create a resource)",
      text: "Öppnar listan över allt som går att skapa i Azure. Allt du skapar kallas en resurs.",
      use: "När du ska bygga något. Inget skapas förrän du klickar Skapa sist i formuläret.",
      aria: ["skapa en resurs", "create a resource"],
      within: RETURNING
    },
    {
      key: "home2-agent",
      name: "Skapa en AI-agent (Create an AI agent)",
      text: "Tar dig till Microsoft Foundry, där du bygger en AI-agent: en chattbot som kan göra saker åt dig, inte bara svara.",
      use: "När du vill bygga en egen AI-assistent för ett jobb eller en kund.",
      aria: ["skapa en ai-agent", "create an ai agent", "create ai agent"],
      within: RETURNING
    },
    {
      key: "home2-github",
      name: "Importera kod från GitHub (Import code from GitHub)",
      text: "Kopplar ditt GitHub-konto, så att kod du redan har kan läggas upp i Azure.",
      use: "När du har en app på GitHub som du vill publicera på internet.",
      aria: ["importera kod från github", "import code from github"],
      within: RETURNING
    },
    {
      key: "home2-alerts-config",
      name: "Konfigurera aviseringar (Configure alerts)",
      text: "Ställer in larm som säger till när något går fel eller används för mycket.",
      use: "När något du har byggt ska vara igång hela tiden och du vill veta direkt om det stannar.",
      texts: ["konfigurera aviseringar", "configure alerts", "skapa en avisering", "create an alert"],
      within: '[data-testid="alertsCard"]'
    },
    {
      key: "home2-service-issues",
      name: "Visa tjänstproblem (View service issues)",
      text: "Visar om Microsoft själva har driftstörningar som påverkar dina resurser.",
      use: "När något slutar fungera utan att du har ändrat något. Då kan felet ligga hos Microsoft.",
      texts: ["visa tjänstproblem", "view service issues"],
      within: '[data-testid="alertsCard"]'
    },
    {
      key: "home2-alerts-card",
      name: "Aviseringar och tjänstproblem (Alerts and service issues)",
      text: "Rutan som visar dina larm och om Microsoft har driftstörningar just nu.",
      obvious: true,
      selectors: ['[data-testid="alertsCard"]']
    },
    {
      key: "home2-view-costs",
      name: "Visa kostnader (View costs)",
      text: "Öppnar kostnadsanalysen, med diagram över vad Azure har kostat.",
      use: "När du vill se vad som kostar och om det är på väg uppåt.",
      selectors: ['[data-testid="costCard.viewCostButton"]'],
      texts: ["visa kostnader", "view costs"],
      within: '[data-testid="costCard"]'
    },
    {
      key: "home2-cost-card",
      name: "Kostnader (Costs)",
      text: "Vad Azure har kostat hittills den här månaden. Betala per användning betyder att du bara betalar för det du använder.",
      use: "När du vill ha koll på pengarna. Titta här varje gång du loggar in.",
      selectors: ['[data-testid="costCard"]']
    },
    {
      key: "home2-resources-row",
      name: "Resurs (Resource)",
      text: "Något du har skapat eller tittat på nyss. Klicka för att öppna dess sida.",
      obvious: true,
      selectors: ['[data-testid="resourcesCard"] a']
    },
    {
      key: "home2-resources-tabs",
      name: "Nyligen visade / Favoriter (Recent / Favorites)",
      text: "Växlar mellan det du har tittat på senast och det du har stjärnmärkt.",
      obvious: true,
      texts: ["nyligen visade", "favoriter", "recent", "favorites"],
      within: '[data-testid="resourcesCard"]'
    },
    {
      key: "home2-resources-all",
      name: "Visa alla senaste resurser (See all recent resources)",
      text: "Öppnar hela listan över det du har tittat på senast.",
      obvious: true,
      texts: ["visa alla senaste resurser", "see all recent resources", "visa alla resurser", "see all resources"],
      within: '[data-testid="resourcesCard"]'
    },
    {
      key: "home2-resources-column",
      name: "Kolumnrubrik (Column)",
      text: "Rubriken på en kolumn. Klicka för att sortera listan efter den.",
      obvious: true,
      texts: ["resursnamn", "typ", "aviseringar", "senast visat", "name", "type", "alerts", "last viewed"],
      within: '[data-testid="resourcesCard"]'
    },
    {
      key: "home2-resources-card",
      name: "Resurser (Resources)",
      text: "Det du har skapat i Azure och tittat på nyss, så att du hittar tillbaka snabbt.",
      obvious: true,
      selectors: ['[data-testid="resourcesCard"]']
    },

    /* ---------------- Ramen runt varje sida (bladet) ---------------- */
    {
      key: "blade-breadcrumb",
      name: "Brödsmulor (Breadcrumbs)",
      text: "Vägen du har gått för att komma hit. Varje ord är en sida du kan klicka tillbaka till.",
      use: "När du har klickat dig djupt in och vill tillbaka ett eller två steg.",
      selectors: ['[data-testid="breadcrumb-item"]']
    },
    {
      key: "blade-pin",
      name: "Fäst (Pin to dashboard)",
      text: "Lägger en ruta med den här sidan på din instrumentpanel.",
      use: "När du vill nå sidan direkt från instrumentpanelen nästa gång.",
      selectors: ["button.fxs-blade-pin"]
    },
    {
      key: "blade-favorite",
      name: "Lägg till i favoriter (Add to favorites)",
      text: "Sparar den här resursen bland dina favoriter, så att du hittar den snabbt.",
      obvious: true,
      selectors: ["button.fxs-blade-favorite"]
    },
    {
      key: "blade-more",
      name: "Fler innehållsåtgärder (More content actions)",
      text: "Fler val för sidan, till exempel att öppna den i en ny flik eller dela länken.",
      obvious: true,
      aria: [/^fler innehållsåtgärder/, /^more content actions/]
    },
    {
      key: "blade-copilot-prompts",
      name: "Förslag från Copilot",
      text: "Frågor som Copilot föreslår om sidan du är på. Ett klick skickar frågan till Copilot, inget ändras.",
      use: "När du inte vet var du ska börja på en sida och vill ha en förklaring.",
      selectors: ['[data-testid="firstIconButton"]', '[data-testid="firstIconMenuButton"]', '[data-testid^="visibleButton-"]', '[data-testid="overflowMenuButton"]']
    },
    {
      key: "blade-search",
      name: "Sökruta (Search)",
      text: "Filtrerar det som syns just nu, till exempel menyn eller listan på sidan.",
      obvious: true,
      selectors: ['input.azc-input[role="searchbox"]', "input.ms-SearchBox-field"],
      aria: ["sökruta", "s&#246;kruta", "search", "search box"]
    },
    {
      key: "blade-essentials",
      name: "Information (Essentials)",
      text: "Grunduppgifterna om saken: namn, id, status och var den finns.",
      obvious: true,
      selectors: [".fxc-essentials-accordion-toggle", ".fxc-essentials-accordion-title"]
    },
    {
      key: "blade-row-menu",
      name: "Snabbmeny (...)",
      text: "Det du kan göra med just den raden, samma meny som när du högerklickar.",
      obvious: true,
      aria: [/^fler åtgärder/, /^more actions/],
      selectors: [".fxc-gc-contextmenushortcut"]
    },
    {
      key: "blade-filter",
      name: "Filter",
      text: "Ett filter som styr vad listan visar. Klicka för att ändra det.",
      use: "När listan visar för mycket eller för lite, eller saknar något du vet finns.",
      selectors: [".fxc-pill-content", ".fxc-pill-collection-item"]
    },
    {
      key: "blade-add-filter",
      name: "Lägg till filter (Add filter)",
      text: "Lägger till ett nytt filter på listan, till exempel på plats eller typ.",
      obvious: true,
      selectors: [".fxc-pill-collection-add-button", ".fxc-pill-collection-add"],
      texts: ["lägg till filter", "add filter"]
    },

    /* ---------------- Verktygsraden högst upp på en sida ---------------- */
    {
      key: "toolbar-create",
      name: "Lägg till / Skapa (Add / Create)",
      text: "Öppnar formuläret för att skapa en ny sak av den här sorten. Inget skapas förrän du bekräftar sist i formuläret.",
      use: "När du ska skapa något nytt, till exempel din första resursgrupp.",
      aria: ["skapa", "create", "lägg till", "add"],
      texts: ["lägg till", "skapa", "add", "create", "+ skapa", "+ create"],
      within: TOOLBAR + ", " + FRAME_TOOLBAR
    },
    {
      key: "toolbar-export-csv",
      name: "Exportera till CSV (Export to CSV)",
      text: "Sparar listan som en fil som går att öppna i Excel.",
      use: "När du vill räkna på listan eller skicka den till någon.",
      aria: ["exportera till csv", "export to csv"],
      texts: ["exportera till csv", "export to csv"],
      within: TOOLBAR + ", " + FRAME_TOOLBAR
    },
    {
      key: "toolbar-policies",
      name: "Hantera principer (Manage policies)",
      text: "Principer (policies) är regler för vad som får skapas, till exempel bara i vissa länder eller storlekar.",
      use: "När du vill hindra att någon skapar dyra eller fel saker.",
      texts: ["hantera principer", "manage policies"],
      within: TOOLBAR
    },
    {
      key: "toolbar-more",
      name: "Visa fler alternativ (See more)",
      text: "Fler knappar som inte får plats i raden.",
      obvious: true,
      aria: ["visa fler alternativ", "see more"],
      texts: ["visa fler alternativ", "see more", "more"],
      within: TOOLBAR
    },
    {
      key: "toolbar-requests",
      name: "Visa begäranden (View requests)",
      text: "Förfrågningar om nya prenumerationer som väntar på att någon godkänner dem.",
      obvious: true,
      texts: ["visa begäranden", "view requests"],
      within: TOOLBAR
    },
    {
      key: "toolbar-eligible",
      name: "Visa berättigade prenumerationer (View eligible subscriptions)",
      text: "Prenumerationer som du kan få komma åt om du först aktiverar en roll. Gäller mest stora företag.",
      obvious: true,
      texts: ["visa berättigade prenumerationer", "view eligible subscriptions"],
      within: TOOLBAR
    },
    {
      key: "toolbar-cancel-subscription",
      name: "Avbryt prenumeration (Cancel subscription)",
      text: "Stänger av hela prenumerationen. Allt i den slutar fungera och raderas efter en tid.",
      use: "När du är helt klar med Azure och inte vill betala mer. Gör det aldrig för att prova.",
      texts: ["avbryt prenumeration", "cancel subscription"],
      within: TOOLBAR
    },
    {
      key: "toolbar-change-directory",
      name: "Ändra katalog (Change directory)",
      text: "Flyttar prenumerationen till en annan organisation (katalog).",
      use: "När ett annat företag ska ta över prenumerationen. Sällan något du behöver i början.",
      texts: ["ändra katalog", "change directory"],
      within: TOOLBAR
    },
    {
      key: "toolbar-delete",
      name: "Ta bort (Delete)",
      text: "Tar bort det du har markerat i listan. Det går oftast inte att ångra.",
      use: "När du är klar med något och inte vill betala för det längre. Kolla namnet två gånger först.",
      texts: ["ta bort", "delete", "ta bort resursgrupp", "delete resource group"],
      within: TOOLBAR
    },
    {
      key: "toolbar-columns",
      name: "Hantera vyn (Manage view)",
      text: "Väljer vilka kolumner listan visar och hur den sorteras.",
      obvious: true,
      aria: ["hantera vy", "hantera vyn", "manage view"],
      texts: ["hantera vyn", "hantera vy", "manage view", "redigera kolumner", "edit columns"],
      within: TOOLBAR + ", " + FRAME_TOOLBAR
    },

    /* ---------------- Menyn på varje resurs sida ---------------- */
    {
      key: "cost-overview",
      name: "Översikt (Overview)",
      text: "En sammanfattning av kostnaderna just nu och vad månaden väntas kosta.",
      obvious: true,
      selectors: ['a.fxc-menu-item[href*="CostManagement/Menu/~/overview"]']
    },
    {
      key: "cost-access",
      name: "Åtkomstkontroll (Access control)",
      text: "Vem som får se och ändra kostnader och budgetar.",
      obvious: true,
      selectors: ['a.fxc-menu-item[href*="CostManagement/Menu/~/access"]']
    },
    {
      key: "res-overview",
      name: "Översikt (Overview)",
      text: "Startsidan för den här resursen, med de viktigaste uppgifterna och genvägar.",
      obvious: true,
      selectors: [menuEnd("overview"), 'a.fxc-menu-item[href$="~/Overview"]']
    },
    {
      key: "res-activity-log",
      name: "Aktivitetslogg (Activity log)",
      text: "En logg över allt som har gjorts med resursen: vem som skapade, ändrade eller tog bort något, och när.",
      use: "När något har ändrats och du vill veta vem som gjorde det.",
      selectors: [menuEnd("eventlogs"), menuEnd("activitylog")]
    },
    {
      key: "res-iam",
      name: "Åtkomstkontroll (IAM)",
      text: "Här bestämmer du vem som får göra vad med resursen. IAM betyder identitets- och åtkomsthantering.",
      use: "När en kollega ska få se eller ändra något. Ge så lite behörighet som möjligt.",
      selectors: [menuEnd("users"), menuEnd("iam")]
    },
    {
      key: "res-tags",
      name: "Taggar (Tags)",
      text: "Etiketter du sätter på resurser, till exempel projekt=webbsida. De ändrar inget i sig själva.",
      use: "När du vill kunna se kostnaderna per projekt eller per kund.",
      selectors: [menuEnd("tags")],
      texts: ["taggar", "tags"],
      within: ".fxc-menu-item"
    },
    {
      key: "res-troubleshoot",
      name: "Diagnosticera och lösa problem (Diagnose and solve problems)",
      text: "Automatiska kontroller som letar efter vanliga fel och föreslår lösningar.",
      use: "När något inte fungerar och du vill ha ett första svar själv.",
      selectors: [menuEnd("troubleshoot"), 'a.fxc-menu-item[href$="~/Diagnose"]']
    },
    {
      key: "res-security",
      name: "Säkerhet (Security)",
      text: "Säkerhetsråd från Defender för just det här stället.",
      use: "När du vill se om något står öppet eller saknar skydd.",
      selectors: [menuEnd("security")]
    },
    {
      key: "res-visualizer",
      name: "Resursvisualiserare (Resource visualizer)",
      text: "En karta som visar hur resurserna hänger ihop med varandra.",
      use: "När du vill förstå vad som hör till vad i ett projekt.",
      selectors: [menuEnd("resourcevisualizer")]
    },
    {
      key: "res-events",
      name: "Händelser (Events)",
      text: "Skickar ett meddelande till en annan tjänst när något händer, till exempel när en resurs skapas.",
      use: "När du vill att något ska ske automatiskt som svar på en ändring.",
      selectors: [menuEnd("events")]
    },
    {
      key: "res-resource-groups",
      name: "Resursgrupper (Resource groups)",
      text: "Resursgrupperna i den här prenumerationen. En resursgrupp är en mapp för resurser som hör ihop.",
      use: "När du vill se vilka projekt som finns i prenumerationen.",
      selectors: [menuEnd("resourceGroups")]
    },
    {
      key: "res-resources",
      name: "Resurser (Resources)",
      text: "Allt som ligger här, i den här prenumerationen eller gruppen.",
      use: "När du vill se vad som finns och vad som kan kosta pengar.",
      selectors: [menuEnd("resources")]
    },
    {
      key: "cost-analysis",
      name: "Kostnadsanalys (Cost analysis)",
      text: "Diagram över vad det har kostat, uppdelat på resurser, dagar eller tjänster.",
      use: "När du vill se vad som kostar mest, eller varför fakturan blev högre.",
      selectors: [menuEnd("costByResource"), 'a.fxc-menu-item[href$="~/costanalysis"]']
    },
    {
      key: "cost-alerts",
      name: "Kostnadsaviseringar (Cost alerts)",
      text: "Varningar när kostnaderna går över en gräns du har satt, eller ser ovanliga ut.",
      use: "När du vill få veta i tid om något börjar kosta för mycket.",
      selectors: [menuEnd("costAlerts"), 'a.fxc-menu-item[href$="~/costalerts"]', 'a.fxc-menu-item[href$="~/alerts"]']
    },
    {
      key: "cost-budgets",
      name: "Budgetar (Budgets)",
      text: "En budget är en gräns för vad du vill betala per månad. Azure mejlar dig när du närmar dig den, men stänger inte av något.",
      use: "När du börjar bygga. Sätt en låg budget direkt, så slipper du överraskningar.",
      selectors: [menuEnd("budgets"), 'a.fxc-menu-item[href$="~/budgets"]']
    },
    {
      key: "res-invoices",
      name: "Fakturor (Invoices)",
      text: "Fakturorna från Microsoft för det här.",
      obvious: true,
      selectors: [menuEnd("invoices"), 'a.fxc-menu-item[href$="~/invoices"]']
    },
    {
      key: "res-marketplace",
      name: "Programdistribution (Marketplace)",
      text: "Program från Marketplace, Microsofts butik för färdiga tjänster, som är kopplade hit.",
      obvious: true,
      selectors: [menuEnd("marketplace")]
    },
    {
      key: "res-billing-properties",
      name: "Faktureringsegenskaper (Billing properties)",
      text: "Uppgifter om vem som betalar och hur.",
      obvious: true,
      selectors: [menuEnd("billingProperties")]
    },
    {
      key: "res-preview",
      name: "Förhandsversionsfunktioner (Preview features)",
      text: "Nya funktioner som Microsoft testar och som du kan slå på innan de är färdiga.",
      use: "När en guide säger att en funktion måste aktiveras först.",
      selectors: [menuEnd("previewfeatures"), 'a.fxc-menu-item[href$="~/PreviewHub"]', 'a.fxc-menu-item[href$="~/tryperview"]']
    },
    {
      key: "res-quotas",
      name: "Användning och kvoter (Usage + quotas)",
      text: "Gränser för hur mycket du får skapa, till exempel antal processorer i ett land.",
      use: "När du får ett fel om att en gräns (quota) är nådd.",
      selectors: [menuEnd("quotas")]
    },
    {
      key: "res-policies",
      name: "Principer (Policies)",
      text: "Regler för vad som får skapas här, till exempel bara i vissa länder eller storlekar.",
      use: "När du vill hindra att någon skapar dyra eller fel saker.",
      selectors: [menuEnd("policies")]
    },
    {
      key: "res-my-access",
      name: "Mina behörigheter (My permissions)",
      text: "Visar vad du har lov att göra här, alltså vilken roll du har.",
      use: "När en knapp är grå eller du får åtkomst nekad och vill veta varför.",
      selectors: [menuEnd("access")]
    },
    {
      key: "res-providers",
      name: "Resursleverantörer (Resource providers)",
      text: "Varje sorts tjänst i Azure har en leverantör som måste vara påslagen i prenumerationen. De flesta slås på av sig själva.",
      use: "När du får ett fel om att en provider inte är registrerad.",
      selectors: [menuEnd("resourceproviders")]
    },
    {
      key: "res-deployments",
      name: "Distributioner (Deployments)",
      text: "En historik över allt som har skapats med formulär och mallar, med status för varje försök.",
      use: "När ett skapande misslyckades och du vill läsa felet.",
      selectors: [menuEnd("subdeployments"), menuEnd("deployments")]
    },
    {
      key: "res-stacks",
      name: "Distributionsstackar (Deployment stacks)",
      text: "Ett sätt att sköta många resurser som en enhet, när de har skapats från samma mall.",
      obvious: true,
      selectors: [menuEnd("stacks")]
    },
    {
      key: "res-locks",
      name: "Resurslås (Locks)",
      text: "Ett lås som hindrar att något tas bort eller ändras av misstag.",
      use: "När något viktigt aldrig får raderas av misstag.",
      selectors: [menuEnd("locks")]
    },
    {
      key: "res-metrics",
      name: "Mått (Metrics)",
      text: "Grafer med siffror från resursen, som belastning eller antal anrop.",
      use: "När du vill se hur mycket något används eller om det går långsamt.",
      selectors: [menuEnd("metrics")]
    },
    {
      key: "res-diagnostics",
      name: "Diagnostikinställningar (Diagnostic settings)",
      text: "Bestämmer vart loggarna skickas, till exempel till ett lagringskonto.",
      use: "När du vill spara loggar längre eller analysera dem.",
      selectors: [menuEnd("diagnostics")]
    },
    {
      key: "res-support",
      name: "Support och felsökning (Support + troubleshooting)",
      text: "Skapar ett ärende hos Microsofts support om just det här.",
      obvious: true,
      selectors: [menuEnd("supportrequest"), 'a.fxc-menu-item[href$="~/support"]']
    },

    /* ---------------- Kostnadshantering + fakturering ---------------- */
    {
      key: "billing-scopes",
      name: "Faktureringsomfattningar (Billing scopes)",
      text: "Dina faktureringskonton, alltså vem som får fakturan.",
      use: "När du har flera konton och vill välja vilket du tittar på.",
      selectors: ['a.fxc-menu-item[href$="~/BillingAccounts"]']
    },
    {
      key: "billing-cost-management",
      name: "Cost Management",
      text: "Microsofts verktyg för att följa och styra kostnader: analys, budgetar och råd.",
      use: "När du vill se vart pengarna går.",
      selectors: ['a.fxc-menu-item[href$="~/CostManagement"]']
    },
    {
      key: "billing-management-groups",
      name: "Hanteringsgrupper (Management groups)",
      text: "Mappar för prenumerationer, ett steg över resursgrupper. Används av företag med många prenumerationer.",
      obvious: true,
      selectors: ['a.fxc-menu-item[href$="~/ManagementGroups"]']
    },
    {
      key: "cost-scope",
      name: "Ändra omfång (Change scope)",
      text: "Väljer vad kostnaderna gäller: en prenumeration, en resursgrupp eller ett faktureringskonto.",
      use: "När siffrorna verkar fel. Kolla först att du tittar på rätt omfång.",
      selectors: ['a.fxc-menu-item[href$="~/changescope"]']
    },
    {
      key: "cost-exports",
      name: "Exporter (Exports)",
      text: "Sparar kostnaderna som fil automatiskt, varje dag eller månad.",
      obvious: true,
      selectors: ['a.fxc-menu-item[href$="~/exports"]']
    },

    /* ---------------- Inställningar (kugghjulet) ---------------- */
    {
      key: "settings-directories",
      name: "Kataloger + prenumerationer (Directories + subscriptions)",
      text: "Väljer vilken organisation (katalog) och vilka prenumerationer portalen visar.",
      use: "När en resurs eller prenumeration saknas i listorna. Ofta är den bara bortfiltrerad här.",
      texts: ["kataloger + prenumerationer", "directories + subscriptions"],
      within: ".fxs-settings-menu-item"
    },
    {
      key: "settings-advanced-filters",
      name: "Avancerade filter (Advanced filters)",
      text: "Egna regler för vilka prenumerationer som visas i portalen.",
      obvious: true,
      aria: ["avancerade filter", "advanced filters"],
      texts: ["avancerade filter", "advanced filters", "avancerat filter", "advanced filter", "ändra avancerade filter", "modify advanced filters"]
    },
    {
      key: "settings-my-info",
      name: "Min information (My information)",
      text: "Din e-post för meddelanden från Microsoft och vad du delar med dem.",
      obvious: true,
      texts: ["min information", "my information"],
      within: ".fxs-settings-menu-item"
    },
    {
      key: "settings-signout",
      name: "Loggar ut + meddelanden (Signing out + notifications)",
      text: "Hur länge du är inloggad innan portalen loggar ut dig, och vilka popuprutor som visas.",
      obvious: true,
      texts: ["loggar ut + meddelanden", "signing out + notifications"],
      within: ".fxs-settings-menu-item"
    },
    {
      key: "settings-admin",
      name: "Gå till administratörskontroller (Go to admin controls)",
      text: "Inställningar som en administratör gör för hela organisationen.",
      obvious: true,
      texts: ["gå till administratörskontroller", "go to admin controls"]
    },
    /* ---------------- Inne i ramarna: listorna ---------------- */
    {
      key: "frame-assign-tags",
      name: "Koppla taggar (Assign tags)",
      text: "Sätter etiketter (taggar) på raderna du har markerat, till exempel projekt=webbsida.",
      use: "När du vill kunna se kostnaderna per projekt eller kund.",
      aria: ["koppla taggar", "assign tags"],
      texts: ["koppla taggar", "assign tags"],
      within: FRAME_TOOLBAR
    },
    {
      key: "frame-more-items",
      name: "Fler objekt (More items)",
      text: "Fler knappar som inte får plats i raden.",
      obvious: true,
      aria: [/^fler objekt/, /^more items/],
      within: FRAME_TOOLBAR
    },
    {
      key: "frame-group-by",
      name: "Gruppera efter (Group by)",
      text: "Delar upp listan i grupper, till exempel per typ, plats eller resursgrupp.",
      obvious: true,
      aria: [/^gruppera efter/, /^group by/],
      texts: [/^gruppera efter/, /^group by/]
    },
    {
      key: "frame-filter-input",
      name: "Filtrera (Filter)",
      text: "Skriv ett ord här, så visas bara raderna som innehåller det.",
      obvious: true,
      aria: [/^filtrera efter valfritt fält/, /^filter for any field/]
    },
    {
      key: "frame-filter-remove",
      name: "Ta bort filter (Remove)",
      text: "Tar bort filtret, så att listan visar allt igen. Inget i Azure tas bort.",
      obvious: true,
      aria: ["ta bort", "remove", "dismiss"],
      within: FRAME_FILTER
    },
    {
      key: "frame-filter",
      name: "Filter",
      text: "Ett filter som styr vad listan visar, till exempel bara en prenumeration. Klicka för att ändra det.",
      use: "När listan visar för mycket eller för lite, eller saknar något du vet finns.",
      texts: [/ är lika med /, / equals /, / är inte lika med /, / not equals /],
      within: FRAME_FILTER
    },
    {
      key: "grid-column",
      name: "Kolumnrubrik (Column)",
      text: "Rubriken på en kolumn i listan. Klicka för att sortera listan efter den.",
      obvious: true,
      selectors: ['[role="columnheader"]']
    },
    {
      key: "grid-row-name",
      name: "Namn på raden",
      text: "Namnet på saken på raden. Klicka för att öppna dess egen sida.",
      obvious: true,
      selectors: ['[role="gridcell"] a']
    },
    {
      key: "frame-new-browse",
      name: "Ny bläddringsupplevelse (New browse experience)",
      text: "Växlar mellan den nya och den gamla listvyn. Det ändrar bara utseendet.",
      obvious: true,
      texts: ["ny bläddringsupplevelse", "new browse experience"]
    },

    /* ---------------- Inne i ramarna: Programmallar ---------------- */
    {
      key: "app-template",
      name: "Programmall (App template)",
      text: "Ett färdigt paket med kod och resurser för en vanlig sorts app. Ett klick visar vad som ingår, inget skapas än.",
      use: "När du vill komma igång snabbt och se hur en riktig app är uppbyggd.",
      selectors: ['div[role="button"]'],
      hasText: /\b(appmall|guidad distribution|app template|guided deployment|självstudie|snabbstart|tutorial|quickstart)\b/,
      notWithin: '[role="article"], [data-testid]'
    },
    {
      key: "app-template-featured",
      name: "Utvald mall (Featured template)",
      text: "En av mallarna som Microsoft lyfter fram just nu. Ett klick visar vad som ingår, inget skapas än.",
      use: "När du vill prova något populärt, till exempel en webbapp med databas.",
      selectors: ['div[role="button"][aria-label]'],
      hasText: /\b(azure|copilot)\b/,
      notWithin: '[role="article"], [data-testid], [role="toolbar"], [role="menubar"], .fxs-topbar, .fxs-sidebar'
    },

    /* ---------------- Inne i ramarna: Skapa en resurs ---------------- */
    {
      key: "create-get-started",
      name: "Kom igång (Get started)",
      text: "De vanligaste tjänsterna att börja med.",
      obvious: true,
      selectors: ['div[role="button"][data-testid="home"]']
    },
    {
      key: "create-recent",
      name: "Nyligen skapade (Recently created)",
      text: "Det du har skapat senast, så att du lätt kan skapa något likadant igen.",
      obvious: true,
      selectors: ['div[role="button"][data-testid="recentlyCreated"]']
    },
    {
      key: "create-category",
      name: "Kategori (Category)",
      text: "Visar allt som går att skapa inom ett område, till exempel databaser eller webben.",
      obvious: true,
      selectors: CREATE_CATEGORIES
    },
    {
      key: "create-search",
      name: "Sök tjänster och Marketplace",
      text: "Sökrutan för allt som går att skapa: Azures egna tjänster och färdiga produkter från andra företag.",
      use: "När du vet vad du vill skapa, till exempel ordet databas eller WordPress.",
      aria: ["sök tjänster och marketplace", "search services and marketplace", "search the marketplace", "sök på marketplace"]
    },
    {
      key: "create-quickstart",
      name: "Snabbstartscenter (Quickstart Center)",
      text: "Guider steg för steg för vanliga första projekt, som en webbsida eller en databas.",
      use: "När du vill bli guidad genom ditt första projekt.",
      texts: ["prova vårt snabbstartscenter", "try our quickstart center", "snabbstartscenter", "quickstart center"]
    },
    {
      key: "create-popular-services",
      name: "Populära Azure-tjänster (Popular Azure services)",
      text: "Microsofts egna tjänster som flest skapar.",
      obvious: true,
      texts: ["populära azure-tjänster", "popular azure services"],
      tags: ["h2", "h3"]
    },
    {
      key: "create-see-more",
      name: "Visa mer (See more)",
      text: "Öppnar hela listan, i Alla tjänster eller på Marketplace.",
      obvious: true,
      texts: ["visa mer i alla tjänster", "see more in all services", "visa mer på marketplace", "see more in marketplace"]
    },
    {
      key: "create-marketplace",
      name: "Marketplace",
      text: "Microsofts butik med färdiga produkter från andra företag, som Ubuntu eller SendGrid. Många kostar extra utöver Azure.",
      use: "När du vill använda något färdigt i stället för att bygga själv. Läs priset först.",
      texts: ["populära marketplace-produkter", "popular marketplace products"],
      tags: ["h2", "h3"]
    },
    {
      key: "create-product-create",
      name: "Skapa (Create)",
      text: "Öppnar formuläret för just den här tjänsten. Inget skapas förrän du klickar Skapa sist i formuläret.",
      use: "När du har bestämt dig för vad du vill bygga.",
      selectors: ['[role="article"] [role="link"]', '[role="article"] button'],
      hasText: /^(skapa|create)$/
    },
    {
      key: "create-product-subscribe",
      name: "Konfigurera + prenumerera (Subscribe)",
      text: "Startar köpet av en produkt från ett annat företag. Det kan kosta pengar.",
      use: "När du har läst priset och villkoren och vill använda produkten.",
      selectors: ['[role="article"] [role="link"]', '[role="article"] button'],
      hasText: /^(konfigurera \+ prenumerera|subscribe|configure \+ subscribe|prenumerera)$/
    },
    {
      key: "create-product-info",
      name: "Mer information (Learn more)",
      text: "Läs om produkten, vad den kostar och vem som gör den, innan du väljer den.",
      obvious: true,
      selectors: ['[role="article"] [role="link"]', '[role="article"] button'],
      hasText: /^(mer information|learn more|more info)$/
    },
    {
      key: "create-product-name",
      name: "Tjänst eller produkt",
      text: "Öppnar en sida om tjänsten: vad den gör och vad den kostar. Inget skapas.",
      obvious: true,
      selectors: ['[role="article"] [role="link"]']
    },

    /* ---------------- Inne i ramarna: kostnadsanalysen ---------------- */
    {
      key: "cost-all-views",
      name: "Alla vyer (All views)",
      text: "Färdiga sätt att se kostnaderna, till exempel per resurs, per dag eller per tjänst.",
      use: "När du vill se kostnaderna på ett annat sätt än det som visas nu.",
      texts: ["alla vyer", "all views", "bläddra i alla vyer", "browse all views"]
    },
    {
      key: "cost-recent",
      name: "Senaste (Recent)",
      text: "Vyerna du har öppnat senast.",
      obvious: true,
      texts: ["senaste", "recent"],
      within: '[role="tablist"]'
    },
    {
      key: "cost-settings-tab",
      name: "Inställningar (Settings)",
      text: "Inställningar för kostnadsanalysen, till exempel valuta och vad som visas först.",
      obvious: true,
      texts: ["inställningar", "settings"],
      within: '[role="tablist"]'
    },
    {
      key: "cost-new-tab",
      name: "Ny flik (New tab)",
      text: "Öppnar en ny vy i en egen flik, så att du kan jämföra två vyer.",
      obvious: true,
      aria: ["ny flik", "new tab"],
      texts: ["ny flik", "new tab"]
    },
    {
      key: "cost-billing-account",
      name: "Gå till faktureringskonto (Go to billing account)",
      text: "Byter till faktureringskontot, där du ser alla kostnader och fakturor samlat.",
      obvious: true,
      texts: ["gå till faktureringskonto", "go to billing account"]
    },
    {
      key: "cost-preview",
      name: "Testa förhandsversionen (Try preview)",
      text: "Visar en ny version av kostnadsanalysen som Microsoft testar.",
      obvious: true,
      aria: ["testa förhandsversionen", "try preview"],
      texts: ["testa förhandsversionen", "try preview"]
    },
    {
      key: "cost-help",
      name: "Hjälp (Help)",
      text: "Guider och svar om kostnadsanalysen.",
      obvious: true,
      aria: ["hjälp", "help"],
      within: FRAME_TOOLBAR
    },

    /* ---------------- Inne i ramarna: Copilot-panelen ---------------- */
    {
      key: "copilot-history",
      name: "Navigeringsfönstret (Copilot)",
      text: "Visar dina tidigare chattar med Copilot.",
      obvious: true,
      aria: ["öppna navigeringsfönstret för copilot", "open copilot navigation pane", "stäng navigeringsfönstret för copilot", "close copilot navigation pane"]
    },
    {
      key: "copilot-actions",
      name: "Åtgärder i Azure Copilot",
      text: "Fler val för Copilot, till exempel inställningar och hjälp.",
      obvious: true,
      aria: ["åtgärder i azure copilot", "azure copilot actions"]
    },
    {
      key: "copilot-new-chat",
      name: "Ny chatt (New chat)",
      text: "Startar en ny konversation med Copilot. Den gamla sparas.",
      obvious: true,
      selectors: ['[data-testid="agent-header-new-chat-button"]']
    },
    {
      key: "copilot-agents",
      name: "Starta en ny chatt med (Agents)",
      text: "Väljer vilken agent du chattar med. En agent är en Copilot som är bra på en sak, till exempel felsökning eller kostnader.",
      use: "När du har en bestämd uppgift och vill ha svar från den agent som kan den bäst.",
      selectors: ['[data-testid="agent-header-menu-button"]', '[data-testid="dai-discover-dropdown"]']
    },
    {
      key: "copilot-context",
      name: "Bifoga kontext (Add context)",
      text: "Lägger till en resurs eller fil som Copilot ska titta på när den svarar.",
      use: "När frågan gäller en viss resurs och du vill ha svar om just den.",
      selectors: ['[data-testid="copilot-add-context-button"]']
    },
    {
      key: "copilot-message",
      name: "Meddela Copilot (Message Copilot)",
      text: "Här skriver du din fråga till Copilot, på svenska eller engelska.",
      use: "När du vill veta hur man gör något. Skriv vad du vill uppnå, inte bara ett ord.",
      aria: ["meddela copilot", "message copilot", "fråga copilot", "ask copilot"]
    },
    {
      key: "copilot-new-experience",
      name: "Ny upplevelse (New experience)",
      text: "Slår på Copilots nya utseende. Det ändrar inget i dina resurser.",
      obvious: true,
      aria: ["ny upplevelse", "new experience"],
      texts: ["ny upplevelse", "new experience"]
    },
    {
      key: "copilot-suggestion",
      name: "Förslag på fråga",
      text: "En fråga som Copilot föreslår. Ett klick skickar den till Copilot, inget ändras i dina resurser.",
      use: "När du inte vet vad du ska fråga. Förslagen visar vad Copilot klarar av.",
      selectors: ['[aria-label="Azure Copilot"] [role="feed"] button']
    },

    /* ---------------- Cloud Shell (ramen från ux.console.azure.com) ---------------- */
    {
      key: "shell-welcome",
      name: "Välkommen till Azure Cloud Shell",
      text: "Första gången väljer du vilket kommandospråk du vill skriva i. Du kan byta när som helst.",
      obvious: true,
      texts: [/^välkommen till azure cloud shell/, /^welcome to azure cloud shell/],
      host: /^ux\.console\.azure\.com$/
    },
    {
      key: "shell-bash",
      name: "Bash",
      text: "Ett kommandospråk från Linux. De flesta guider för kommandot az är skrivna för Bash.",
      use: "När du följer en guide med kommandon som börjar med az. Välj Bash om du är osäker.",
      texts: ["bash"],
      aria: ["bash"],
      host: /^ux\.console\.azure\.com$/
    },
    {
      key: "shell-powershell",
      name: "PowerShell",
      text: "Microsofts eget kommandospråk, vanligt på Windows. Kommandona ser ut som Get-AzVM.",
      use: "När guiden du följer visar kommandon med bindestreck, som New-AzResourceGroup.",
      texts: ["powershell"],
      aria: ["powershell"],
      host: /^ux\.console\.azure\.com$/
    },

    /* ---------------- Microsoft Foundry (ai.azure.com) ---------------- */
    {
      key: "f-project",
      name: "Projekt (Project)",
      text: "Visar vilket projekt du jobbar i. Ett projekt är en mapp i Foundry för agenter, modeller och data som hör ihop.",
      use: "När du har flera projekt och vill byta, eller skapa ett nytt.",
      selectors: ['header button.fui-MenuButton'],
      host: FOUNDRY
    },
    {
      key: "f-new-foundry",
      name: "Nya Foundry (New Foundry)",
      text: "Växlar mellan nya och gamla Foundry. Det ändrar bara utseende och menyer, inte dina projekt.",
      use: "När en guide visar menyer som du inte hittar. Guiden kan vara gjord för den andra versionen.",
      selectors: ['input[role="switch"][id^="switch-"]'],
      texts: ["nya foundry", "new foundry"],
      host: FOUNDRY
    },
    {
      key: "f-search",
      name: "Sök (Search)",
      text: "Söker bland modeller, agenter, verktyg och dokumentation i Foundry.",
      obvious: true,
      aria: ["sök", "search"],
      within: "header",
      host: FOUNDRY
    },
    {
      key: "f-notifications",
      name: "Aviseringar (Notifications)",
      text: "Meddelanden om sådant som har hänt, till exempel att en modell är klar att använda.",
      obvious: true,
      aria: ["aviseringar", "notifications"],
      within: "header",
      host: FOUNDRY
    },
    {
      key: "f-profile",
      name: "Mina profilinställningar (Profile)",
      text: "Ditt konto, språk och utseende i Foundry.",
      obvious: true,
      aria: ["mina profilinställningar", "my profile settings", "profile settings"],
      host: FOUNDRY
    },
    {
      key: "f-menu",
      name: "Meny (Menu)",
      text: "Öppnar huvudmenyn med Foundrys delar: Upptäck, Version, Administrera, Hantera och Dokument.",
      obvious: true,
      aria: ["meny", "menu"],
      host: FOUNDRY
    },
    {
      key: "f-logo",
      name: "Microsoft Foundry",
      text: "Tillbaka till startsidan i ditt projekt.",
      obvious: true,
      selectors: ['header a[href$="/home"]', 'header a[href*="/home?"]'],
      host: FOUNDRY
    },
    {
      key: "f-nav-home",
      name: "Start (Home)",
      text: "Startsidan i ditt projekt.",
      obvious: true,
      selectors: fLink("home"),
      host: FOUNDRY
    },
    {
      key: "f-nav-discover",
      name: "Upptäck (Discover)",
      text: "Katalogen över allt du kan använda: AI-modeller, färdiga agenter, verktyg och mallar.",
      use: "När du letar efter en modell att bygga med, till exempel GPT eller Claude.",
      selectors: fLink("discover"),
      host: FOUNDRY
    },
    {
      key: "f-nav-build",
      name: "Version (Build)",
      text: "Här bygger du. Ordet Version är Microsofts översättning av Build, alltså bygga: agenter, modeller, kunskap och data.",
      use: "När du ska skapa eller ändra en agent, eller göra en modell redo att använda.",
      selectors: fLink("build"),
      host: FOUNDRY
    },
    {
      key: "f-nav-operate",
      name: "Administrera (Operate)",
      text: "Driften: hur dina agenter mår, vad de kostar och om något larmar.",
      use: "När något du har byggt är igång och du vill se att det fungerar.",
      selectors: fLink("operate"),
      host: FOUNDRY
    },
    {
      key: "f-nav-manage",
      name: "Hantera (Manage)",
      text: "Inställningar för projektet och resursen: kvoter, användare och nycklar.",
      use: "När en kollega ska få tillgång, eller du behöver projektets adress och nyckel.",
      selectors: fLink("manage"),
      host: FOUNDRY
    },
    {
      key: "f-nav-docs",
      name: "Dokument (Docs)",
      text: "Microsofts dokumentation för Foundry.",
      obvious: true,
      selectors: fLink("docs"),
      host: FOUNDRY
    },
    {
      key: "f-d-overview",
      name: "Översikt (Overview)",
      text: "En sammanfattning av det som är nytt och populärt i katalogen.",
      obvious: true,
      selectors: fLink("discover/overview"),
      host: FOUNDRY
    },
    {
      key: "f-d-models",
      name: "Modeller (Models)",
      text: "Katalogen över AI-modeller från Microsoft, OpenAI, Anthropic och andra. En modell är själva AI:n som läser och skriver.",
      use: "När du ska välja vilken AI din agent eller app ska använda. Jämför pris och kvalitet.",
      selectors: fLink("discover/models"),
      host: FOUNDRY
    },
    {
      key: "f-d-agents",
      name: "Agenter (Agents)",
      text: "Färdiga agenter som andra har byggt och som du kan utgå från.",
      use: "När du vill se exempel på vad en agent kan göra.",
      selectors: fLink("discover/agents"),
      host: FOUNDRY
    },
    {
      key: "f-d-tools",
      name: "Verktyg (Tools)",
      text: "Sådant en agent kan använda, till exempel webbsökning, kodkörning eller SharePoint.",
      use: "När din agent ska kunna göra något, inte bara prata.",
      selectors: fLink("discover/tools"),
      host: FOUNDRY
    },
    {
      key: "f-d-knowledge",
      name: "Kunskap (Knowledge)",
      text: "Källor med text som en agent kan läsa och svara utifrån, som dokument eller ett sökindex.",
      use: "När agenten ska svara utifrån era egna dokument.",
      selectors: fLink("discover/knowledge"),
      host: FOUNDRY
    },
    {
      key: "f-d-services",
      name: "Tjänster (Services)",
      text: "Färdiga AI-tjänster för en sak var, som tal till text, översättning eller att läsa dokument.",
      obvious: true,
      selectors: fLink("discover/services"),
      host: FOUNDRY
    },
    {
      key: "f-d-templates",
      name: "Lösningsmallar (Solution templates)",
      text: "Färdiga paket med kod och resurser för vanliga AI-lösningar.",
      use: "När du vill komma igång snabbt med ett helt exempel.",
      selectors: fLink("discover/solutiontemplates"),
      host: FOUNDRY
    },
    {
      key: "f-b-agents",
      name: "Agenter (Agents)",
      text: "En agent är en AI som följer dina instruktioner och kan använda verktyg, till exempel söka eller skicka mejl. Här skapar och ändrar du dina.",
      use: "När du ska bygga en egen AI-assistent.",
      selectors: fLink("build/agents"),
      host: FOUNDRY
    },
    {
      key: "f-b-models",
      name: "Modeller (Models)",
      text: "Modellerna som är distribuerade i projektet, alltså gjorda redo att använda.",
      use: "När du vill se vilka modeller din kod kan anropa och vad de kostar.",
      selectors: fLink("build/models"),
      host: FOUNDRY
    },
    {
      key: "f-b-services",
      name: "Tjänster (Services)",
      text: "AI-tjänsterna i projektet, som tal och översättning.",
      obvious: true,
      selectors: fLink("build/services"),
      host: FOUNDRY
    },
    {
      key: "f-b-tools",
      name: "Verktyg (Tools)",
      text: "Verktygen som dina agenter får använda.",
      obvious: true,
      selectors: fLink("build/tools"),
      host: FOUNDRY
    },
    {
      key: "f-b-knowledge",
      name: "Kunskap (Knowledge)",
      text: "Dokument och källor som dina agenter kan svara utifrån.",
      use: "När agenten ska kunna svara på frågor om ert eget material.",
      selectors: fLink("build/knowledge"),
      host: FOUNDRY
    },
    {
      key: "f-b-memory",
      name: "Minne (Memory)",
      text: "Det agenten kommer ihåg mellan samtal, till exempel vad en användare har sagt förut.",
      obvious: true,
      selectors: fLink("build/memory"),
      host: FOUNDRY
    },
    {
      key: "f-b-guardrails",
      name: "Räcken (Guardrails)",
      text: "Skyddsregler som stoppar olämpliga frågor och svar, till exempel hat eller personuppgifter.",
      use: "När agenten ska användas av andra och inte får säga fel saker.",
      selectors: fLink("build/guardrails"),
      host: FOUNDRY
    },
    {
      key: "f-b-data",
      name: "Data",
      text: "Filer och datamängder som du laddar upp för att testa eller träna.",
      obvious: true,
      selectors: fLink("build/data"),
      host: FOUNDRY
    },
    {
      key: "f-b-evaluations",
      name: "Utvärderingar (Evaluations)",
      text: "Automatiska prov som mäter hur bra agenten eller modellen svarar.",
      use: "När du har ändrat något och vill se att svaren blev bättre, inte sämre.",
      selectors: fLink("build/evaluations"),
      host: FOUNDRY
    },
    {
      key: "f-b-finetune",
      name: "Finjustera (Fine-tune)",
      text: "Tränar en modell vidare på dina egna exempel så att den svarar mer som du vill. Det kostar och är sällan första steget.",
      use: "När instruktioner och kunskap inte räcker. Prova dem först.",
      selectors: fLink("build/fine-tune"),
      host: FOUNDRY
    },
    {
      key: "f-b-routines",
      name: "Rutiner (Routines)",
      text: "Agenter som körs av sig själva på en viss tid eller när något händer, utan att någon chattar.",
      obvious: true,
      selectors: fLink("build/agents/routines"),
      host: FOUNDRY
    },
    {
      key: "f-b-workflows",
      name: "Arbetsflöden (Workflows)",
      text: "Flera agenter som jobbar i tur och ordning för att lösa en större uppgift.",
      obvious: true,
      selectors: fLink("build/agents/workflows"),
      host: FOUNDRY
    },
    {
      key: "f-new-agent",
      name: "Ny agent (New agent)",
      text: "Startar en ny agent. Du ger den ett namn, väljer modell och skriver instruktioner.",
      use: "När du vill bygga din första agent. Den sparas först när du själv sparar.",
      texts: ["ny agent", "new agent", "skapa en agent", "create an agent", "create agent"],
      host: FOUNDRY
    },
    {
      key: "f-from-code",
      name: "Börja från kod (Start from code)",
      text: "Visar hur du bygger agenten med kod i stället för klick, med exempel att kopiera.",
      obvious: true,
      texts: ["börja från kod", "start from code", "start with code"],
      host: FOUNDRY
    },
    {
      key: "f-deployments",
      name: "Visa distributioner (View deployments)",
      text: "Visar modellerna du har distribuerat. Att distribuera betyder att göra en modell redo att använda i projektet.",
      use: "När du vill se vilka modeller som är igång och vad de heter i din kod.",
      texts: ["visa distributioner", "view deployments"],
      host: FOUNDRY
    },
    {
      key: "f-api-key",
      name: "API-nyckel (API key)",
      text: "Projektets nyckel. Den fungerar som ett lösenord som låter en app använda dina modeller, och det kostar pengar.",
      use: "När din egen kod ska prata med Foundry. Dela den aldrig och lägg den aldrig i kod som blir publik.",
      selectors: ['input[type="password"]'],
      texts: ["kopiera api-nyckel", "copy api key", "visa api-nyckel", "show api key"],
      aria: ["kopiera api-nyckel", "copy api key", "visa api-nyckel", "show api key"],
      host: FOUNDRY
    },
    {
      key: "f-endpoint",
      name: "Slutpunkt (Endpoint)",
      text: "Adressen som din kod skickar frågor till. Den är inte hemlig som nyckeln.",
      obvious: true,
      texts: [/slutpunkt/, /endpoint/],
      aria: [/slutpunkt/, /endpoint/],
      host: FOUNDRY
    },
    {
      key: "f-info",
      name: "Information (i)",
      text: "Visar en kort förklaring från Microsoft om saken bredvid.",
      obvious: true,
      selectors: ['button.fui-InfoButton'],
      host: FOUNDRY
    },
    {
      key: "f-playground",
      name: "Testplats (Playground)",
      text: "En chatt där du provar en modell eller agent innan du bygger något med den.",
      use: "När du vill se hur en modell svarar på dina frågor. Varje fråga kostar lite.",
      selectors: ['button', 'a'],
      hasText: /^(testa på testplats|try in playground|testplats|playground)\b/,
      host: FOUNDRY
    },
    {
      key: "f-explore-models",
      name: "Utforska modeller (Explore models)",
      text: "Öppnar katalogen med alla modeller.",
      obvious: true,
      selectors: ['button', 'a'],
      hasText: /^(utforska modeller|explore models|visa alla modeller|view all models)\b/,
      host: FOUNDRY
    },
    {
      key: "f-compare-models",
      name: "Jämför modeller (Compare models)",
      text: "Ställer modeller bredvid varandra med kvalitet, fart och pris.",
      use: "När du ska välja mellan två modeller och vill ha siffror, inte gissningar.",
      selectors: ['button', 'a'],
      hasText: /^(jämför modeller|compare models|gå till rankningslista|go to leaderboard)\b/,
      host: FOUNDRY
    },
    {
      key: "f-model-card",
      name: "Modell (Model)",
      text: "En AI-modell. Klicka för att se vad den kan, vad den kostar och för att distribuera den.",
      obvious: true,
      selectors: ['a[href*="/discover/models/"]', '[role="row"] button', '[role="gridcell"] button'],
      host: FOUNDRY
    },
    {
      key: "f-model-card-btn",
      name: "Modell (Model)",
      text: "En AI-modell. Klicka för att se vad den kan, vad den kostar och för att distribuera den.",
      obvious: true,
      selectors: ['button'],
      hasText: /(chatten har slutförts|meddelanden|text till bild|chat completion|messages|text to image|svar)\b/,
      host: FOUNDRY
    },
    {
      key: "f-provider",
      name: "Leverantör (Provider)",
      text: "Visar modellerna från det företaget.",
      obvious: true,
      texts: ["openai", "anthropic", "microsoft", "meta", "mistral ai", "deepseek", "xai", "cohere"],
      tags: ["button"],
      notWithin: "a",
      host: FOUNDRY
    },
    {
      key: "f-collection",
      name: "Modellsamling (Collection)",
      text: "En samling modeller: direkt från Azure, experiment från Microsoft, eller modeller du kör på din egen dator.",
      obvious: true,
      selectors: ['button'],
      hasText: /^(direct from azure|foundry labs|foundry local)\b/,
      host: FOUNDRY
    },
    {
      key: "f-leaderboard",
      name: "Modelltopplista (Leaderboard)",
      text: "En rankning av modeller efter kvalitet, säkerhet, fart och pris.",
      obvious: true,
      texts: ["modelltopplista", "model leaderboard", "leaderboard"],
      host: FOUNDRY
    },
    {
      key: "f-metric-quality",
      name: "Kvalitetsindex (Quality index)",
      text: "Hur bra modellen svarar i Microsofts prov. Högre är bättre.",
      obvious: true,
      selectors: ['[role="columnheader"]', 'div[role="button"]'],
      hasText: /^(kvalitetsindex|quality index)\b/,
      host: FOUNDRY
    },
    {
      key: "f-metric-safety",
      name: "Säkerhet (Safety)",
      text: "Hur ofta modellen ger skadliga svar i prov. Lägre är bättre.",
      obvious: true,
      selectors: ['[role="columnheader"]', 'div[role="button"]'],
      hasText: /^(säkerhet lägre|safety lower)\b/,
      host: FOUNDRY
    },
    {
      key: "f-metric-speed",
      name: "Dataflöde (Throughput)",
      text: "Hur fort modellen skriver, i token per sekund. En token är ungefär en stavelse.",
      obvious: true,
      selectors: ['[role="columnheader"]', 'div[role="button"]'],
      hasText: /^(dataflöde|throughput)\b/,
      host: FOUNDRY
    },
    {
      key: "f-metric-cost",
      name: "Kostnad (Cost)",
      text: "Ungefärlig kostnad i provet. Lägre är billigare.",
      obvious: true,
      selectors: ['[role="columnheader"]', 'div[role="button"]'],
      hasText: /^(prestandamåttskostnad|benchmark cost|cost)\b/,
      host: FOUNDRY
    },
    {
      key: "f-section-heading",
      name: "Avsnitt",
      text: "En rubrik för en del av sidan.",
      obvious: true,
      texts: ["aktuella modeller", "utforska modeller från populära leverantörer", "bläddra bland våra modellsamlingar", "utvalda verktyg", "aktuella lösningsmallar", "senaste arbete", "utbildning och resurser", "val av modell", "utveckla en agent", "använda en modell", "featured models", "recent work", "models built by microsoft foundry", "experimentera med förinställda tjänster", "skapa din första agent.", "projektinformation", "det finns inga aviseringar att visa", "optimera dina affärsprocesser", "byt miljö"],
      tags: ["h2", "h3"],
      host: FOUNDRY
    },
    {
      key: "f-view-all",
      name: "Visa alla (View all)",
      text: "Öppnar hela listan.",
      obvious: true,
      texts: [/^visa alla /, /^view all /],
      host: FOUNDRY
    },
    {
      key: "f-o-overview",
      name: "Översikt (Overview)",
      text: "Översikt över driften: larm, körningar och kostnad.",
      obvious: true,
      selectors: fLink("operate/overview"),
      host: FOUNDRY
    },
    {
      key: "f-o-assets",
      name: "Tillgångar (Assets)",
      text: "Allt du har i drift: agenter, modeller och verktyg, med status.",
      obvious: true,
      selectors: fLink("operate/assets"),
      host: FOUNDRY
    },
    {
      key: "f-o-compliance",
      name: "Efterlevnad (Compliance)",
      text: "Kontroll av att agenterna följer reglerna ni har satt, som skydd och säkerhet.",
      obvious: true,
      selectors: fLink("operate/compliance"),
      host: FOUNDRY
    },
    {
      key: "f-o-filter",
      name: "Filter",
      text: "Väljer vilka prenumerationer, projekt eller dagar siffrorna gäller.",
      obvious: true,
      aria: [/^välj (prenumerationer|ett projekt)/, /^select (subscriptions|a project)/, /^open välj/],
      host: FOUNDRY
    },
    {
      key: "f-o-tokens",
      name: "Tokenanvändning (Token usage)",
      text: "Hur mycket text modellerna har läst och skrivit. Du betalar per token, ungefär en stavelse.",
      use: "När du vill förstå vad som driver kostnaden.",
      texts: ["tokenanvändning", "token usage"],
      host: FOUNDRY
    },
    {
      key: "f-o-cost",
      name: "Uppskattad kostnad (Estimated cost)",
      text: "Vad dina agenter ungefär har kostat under perioden.",
      obvious: true,
      texts: ["uppskattad kostnad", "estimated cost"],
      host: FOUNDRY
    },
    {
      key: "f-o-stats",
      name: "Agentstatistik",
      text: "Siffror om hur ofta dina agenter körs och hur ofta de lyckas.",
      obvious: true,
      texts: [/^(agenter som körs|agenten lyckades|volym för agentkörning|framgångsfrekvens|trender för framgångsfrekvens|aktiva aviseringar)/, /^(running agents|agent success|agent run volume|success rate)/],
      host: FOUNDRY
    },
    {
      key: "f-m-quota",
      name: "Kvot (Quota)",
      text: "Hur mycket du får använda modellerna per minut. När kvoten tar slut får appen vänta.",
      use: "När du får felet 429 eller ett meddelande om att gränsen är nådd.",
      selectors: fLink("manage/quota"),
      host: FOUNDRY
    },
    {
      key: "f-m-gateway",
      name: "AI Gateway",
      text: "En port framför dina modeller som styr vem som får använda dem och hur mycket.",
      obvious: true,
      selectors: fLink("manage/gateway"),
      host: FOUNDRY
    },
    {
      key: "f-m-resource",
      name: "Resursinformation (Resource details)",
      text: "Uppgifter om Foundry-resursen i Azure: namn, plats och nycklar. Resursen är det som syns på fakturan.",
      obvious: true,
      selectors: ['a[href*="/manage/resources/resourceDetai"]'],
      host: FOUNDRY
    },
    {
      key: "f-m-project",
      name: "Projektinformation (Project details)",
      text: "Projektets namn, adress och vem som har tillgång.",
      obvious: true,
      selectors: ['a[href*="/manage/resources/projectDetail"]'],
      notWithin: "[role=\"tablist\"], nav[aria-label=\"Navigering i projekt\"]",
      host: FOUNDRY
    },
    {
      key: "f-m-users",
      name: "Användare (Users)",
      text: "Vilka som har tillgång till projektet och vilken roll de har.",
      use: "När en kollega ska kunna bygga tillsammans med dig.",
      texts: ["användare", "users"],
      within: "[role=\"tablist\"], nav",
      host: FOUNDRY
    },
    {
      key: "f-m-connected",
      name: "Anslutna resurser (Connected resources)",
      text: "Andra Azure-resurser som projektet får använda, som lagring eller sökning.",
      obvious: true,
      texts: ["anslutna resurser", "connected resources"],
      host: FOUNDRY
    },
    {
      key: "f-m-admin-models",
      name: "Administratörsanslutna modeller",
      text: "Modeller som en administratör har kopplat in åt alla projekt.",
      obvious: true,
      texts: ["administratörsanslutna modeller", "admin-connected models"],
      host: FOUNDRY
    },
    {
      key: "f-m-add-user",
      name: "Lägg till användare (Add user)",
      text: "Ger en person tillgång till projektet. Du väljer vilken roll hen får.",
      use: "När du ska samarbeta. Välj den minsta roll som räcker.",
      texts: ["lägg till användare", "add user"],
      host: FOUNDRY
    },
    {
      key: "f-m-my-access",
      name: "Min behörighet (My access)",
      text: "Vilken roll du själv har i projektet.",
      obvious: true,
      texts: ["min behörighet", "my access"],
      host: FOUNDRY
    },
    {
      key: "f-m-open-portal",
      name: "Öppna i Azure-portalen (Open in Azure portal)",
      text: "Öppnar samma sak i Azure-portalen, där du ser kostnad och behörigheter.",
      obvious: true,
      selectors: ['a[href^="https://portal.azure.com"]'],
      host: FOUNDRY
    },

    {
      key: "f-learn",
      name: "Lär dig mer",
      text: "Länkar till Microsofts dokumentation, kodexempel på GitHub och forumet på Discord.",
      obvious: true,
      selectors: ["button", "a"],
      hasText: /^(dokument|github|discord|documentation)\b/,
      host: FOUNDRY
    },
    {
      key: "f-tool-card",
      name: "Verktyg (Tool)",
      text: "Ett verktyg som en agent kan använda, till exempel för att läsa mejl eller söka i GitHub. MCP är ett vanligt sätt att koppla in sådana verktyg.",
      use: "När din agent ska kunna hämta eller göra något i ett annat system.",
      selectors: ["button"],
      hasText: /\b(mcp|enables agents|access github)\b/,
      host: FOUNDRY
    },
    {
      key: "f-service-card",
      name: "AI-tjänst (Service)",
      text: "En färdig AI-tjänst för en uppgift, som tal, översättning eller att läsa dokument. Klicka för att se och prova den.",
      obvious: true,
      selectors: ["button"],
      hasText: /^azure-(speech|translator|language|ai)-/,
      host: FOUNDRY
    },
    {
      key: "f-solution-template",
      name: "Lösningsmall (Solution template)",
      text: "Ett färdigt paket med kod och resurser för en hel AI-lösning. Ett klick visar vad som ingår, inget skapas än.",
      use: "När du vill se hur en riktig AI-app är uppbyggd innan du bygger din egen.",
      selectors: [".fui-CarouselCard > button", ".fui-CarouselCard button"],
      host: FOUNDRY
    },
    {
      key: "f-register-asset",
      name: "Registrera tillgång (Register asset)",
      text: "Lägger till en agent eller modell som körs någon annanstans, så att du kan följa den här.",
      obvious: true,
      texts: ["registrera tillgång", "register asset"],
      host: FOUNDRY
    },
    {
      key: "f-period",
      name: "Period",
      text: "Vilka dagar siffrorna gäller. Klicka för att välja en annan period.",
      obvious: true,
      texts: [/^[-\s]+$/],
      host: FOUNDRY
    },
    {
      key: "f-parent",
      name: "Gå till överordnad resurs (Go to parent resource)",
      text: "Går till Foundry-resursen som projektet ligger i.",
      obvious: true,
      aria: ["gå till överordnad resurs", "go to parent resource"],
      host: FOUNDRY
    },
    {
      key: "f-search-list",
      name: "Sök (Search)",
      text: "Filtrerar listan på sidan.",
      obvious: true,
      aria: ["sök", "search"],
      notWithin: "header",
      host: FOUNDRY
    },

    /* ---------------- Copilot Studio (copilotstudio.microsoft.com) ---------------- */
    {
      key: "s-nav-home",
      name: "Startsida (Home)",
      text: "Startsidan i Copilot Studio, med genvägar till det du kan bygga.",
      obvious: true,
      selectors: [tid("nav-home")],
      host: STUDIO
    },
    {
      key: "s-nav-agents",
      name: "Agenter (Agents)",
      text: "Dina agenter. En agent är en chattbot som svarar utifrån det du ger den och kan utföra uppgifter, till exempel skapa ett ärende.",
      use: "När du vill bygga en egen chattbot, till exempel för kundtjänst eller intern hjälp.",
      selectors: [tid("nav-agents")],
      host: STUDIO
    },
    {
      key: "s-nav-workflows",
      name: "Arbetsflöden (Workflows)",
      text: "Automatiska flöden som gör saker steg för steg, ofta med AI. Samma sorts flöden som i Power Automate.",
      use: "När något ska hända av sig självt, till exempel när ett mejl kommer.",
      selectors: [tid("nav-workflows")],
      host: STUDIO
    },
    {
      key: "s-nav-apps",
      name: "Appar (Apps)",
      text: "Enkla appar med formulär och listor, byggda utan kod.",
      obvious: true,
      selectors: [tid("nav-apps")],
      host: STUDIO
    },
    {
      key: "s-env",
      name: "Växla miljö (Environment)",
      text: "En miljö (environment) är en egen avdelning i Power Platform med sina egna agenter, flöden och data. Default är den som alla i organisationen delar.",
      use: "När du inte hittar en agent. Den kan ligga i en annan miljö.",
      selectors: [tid("env-picker-trigger"), '[data-testid^="env-picker-option-"]'],
      host: STUDIO
    },
    {
      key: "s-env-search",
      name: "Sök miljöer",
      text: "Söker bland miljöerna du har tillgång till.",
      obvious: true,
      selectors: [tid("env-picker-search"), tid("env-picker-filter-toggle")],
      host: STUDIO
    },
    {
      key: "s-env-pin",
      name: "Fäst miljö (Pin)",
      text: "Lägger miljön överst i listan så att du hittar den snabbt.",
      obvious: true,
      selectors: ['[data-testid^="env-picker-pin-"]'],
      host: STUDIO
    },
    {
      key: "s-env-all",
      name: "Alla miljöer (All environments)",
      text: "Alla miljöer du har tillgång till.",
      obvious: true,
      selectors: [tid("env-picker-group-all-header")],
      host: STUDIO
    },
    {
      key: "s-account",
      name: "Kontomenyn (Account)",
      text: "Vem du är inloggad som. Här loggar du ut.",
      obvious: true,
      selectors: [tid("account-profile-button-trigger")],
      host: STUDIO
    },
    {
      key: "s-more",
      name: "Fler alternativ (More)",
      text: "Länkar till nyheter, lösningar, administration och utbildning.",
      obvious: true,
      selectors: [tid("advanced-settings-more")],
      host: STUDIO
    },
    {
      key: "s-whats-new",
      name: "Visa nyheter (What's new)",
      text: "Microsofts lista över nya funktioner i Copilot Studio.",
      obvious: true,
      selectors: [tid("advanced-settings-whats-new")],
      host: STUDIO
    },
    {
      key: "s-solutions",
      name: "Lösningar (Solutions)",
      text: "En lösning är ett paket med agenter, flöden och appar som hör ihop, så att de kan flyttas till en annan miljö tillsammans.",
      use: "När något du har byggt ska flyttas från test till skarp drift.",
      selectors: [tid("advanced-settings-solutions")],
      host: STUDIO
    },
    {
      key: "s-classic",
      name: "Öppna den klassiska upplevelsen (Classic)",
      text: "Byter till det gamla utseendet i Copilot Studio.",
      use: "När en guide visar menyer som du inte hittar. Guiden kan vara gjord för det gamla utseendet.",
      selectors: [tid("advanced-settings-open-classic-experience"), '[data-testid^="advanced-settings-open-classic"]'],
      host: STUDIO
    },
    {
      key: "s-admin",
      name: "Power Platform-administrationscenter",
      text: "Där administratörer styr miljöer, säkerhet och licenser för hela organisationen.",
      obvious: true,
      selectors: [tid("advanced-settings-admin-center")],
      host: STUDIO
    },
    {
      key: "s-learning",
      name: "Utbildningsresurser (Learning)",
      text: "Microsofts kurser och guider för Copilot Studio.",
      obvious: true,
      selectors: [tid("advanced-settings-learning-resources")],
      host: STUDIO
    },
    {
      key: "s-session",
      name: "Sessionsdetaljer (Session details)",
      text: "Tekniska uppgifter om din inloggning, som supporten kan be om.",
      obvious: true,
      selectors: [tid("advanced-settings-session-details")],
      host: STUDIO
    },
    {
      key: "s-suggest-agent",
      name: "Agent",
      text: "Börjar bygga en agent: du beskriver vad den ska göra, och Copilot hjälper dig att sätta upp den. Inget publiceras förrän du själv publicerar.",
      use: "När du vill ha en chattbot som svarar på frågor eller gör saker åt dig.",
      selectors: [tid("suggestion-agent")],
      host: STUDIO
    },
    {
      key: "s-suggest-workflow",
      name: "AI-arbetsflöde (AI workflow)",
      text: "Börjar bygga ett flöde som gör saker steg för steg, med AI där det behövs.",
      use: "När en återkommande uppgift ska skötas automatiskt.",
      selectors: [tid("suggestion-workflow")],
      host: STUDIO
    },
    {
      key: "s-suggest-app",
      name: "App (förhandsversion)",
      text: "Börjar bygga en enkel app med formulär och listor.",
      obvious: true,
      selectors: [tid("advanced-app-builder")],
      host: STUDIO
    },
    {
      key: "s-github-copilot",
      name: "GitHub Copilot",
      text: "Bygger agenter med kod i GitHub Copilot i stället för med klick.",
      obvious: true,
      aria: ["github copilot"],
      host: STUDIO
    },
    {
      key: "s-other-ways",
      name: "Andra sätt att skapa (Other ways to build)",
      text: "Fler vägar in, till exempel att utgå från en mall.",
      obvious: true,
      selectors: [tid("homepage-fy26-other-ways-to-build")],
      host: STUDIO
    },
    {
      key: "s-apps-search",
      name: "Sök efter appar",
      text: "Söker bland dina appar efter namn.",
      obvious: true,
      selectors: [tid("apps-search"), tid("apps-ownership-filter")],
      host: STUDIO
    },
    {
      key: "s-apps-new",
      name: "Nytt program (New app)",
      text: "Börjar bygga en ny app. Den sparas först när du själv sparar.",
      obvious: true,
      selectors: [tid("my-work-create-app")],
      texts: ["nytt program", "new app"],
      host: STUDIO
    },
    {
      key: "s-env-teaching",
      name: "Tips från Microsoft",
      text: "En kort ruta som visar var något finns. Stäng den när du har läst.",
      obvious: true,
      selectors: ['[data-testid^="fn-nav-rail-env-picker-teaching-popover"] h2'],
      host: STUDIO
    },

    /* ---------------- Power Automate (make.powerautomate.com) ---------------- */
    {
      key: "a-nav-home",
      name: "Start (Home)",
      text: "Startsidan i Power Automate.",
      obvious: true,
      selectors: envLink("home"),
      within: "[role=\"menubar\"], [aria-label=\"Huvud\"], nav",
      host: AUTOMATE
    },
    {
      key: "a-nav-create",
      name: "Skapa (Create)",
      text: "Här startar du ett nytt flöde. Ett flöde är en automatisk kedja: när något händer, gör det här.",
      use: "När du vill att datorn ska sköta en återkommande uppgift åt dig.",
      selectors: envLink("create"),
      host: AUTOMATE
    },
    {
      key: "a-nav-templates",
      name: "Mallar (Templates)",
      text: "Färdiga flöden för vanliga uppgifter, som att spara bilagor eller skicka påminnelser.",
      use: "När du vill komma igång snabbt. Du ändrar mallen efter dina behov.",
      selectors: envLink("templates"),
      host: AUTOMATE
    },
    {
      key: "a-nav-flows",
      name: "Mina flöden (My flows)",
      text: "Alla flöden du har skapat, med status och historik.",
      use: "När du vill se om ett flöde har körts och om det gick bra.",
      selectors: envLink("flows"),
      notWithin: '[role="tab"], [role="tablist"], main',
      host: AUTOMATE
    },
    {
      key: "a-nav-approvals",
      name: "Godkännanden (Approvals)",
      text: "Förfrågningar som väntar på att någon säger ja eller nej, till exempel en semesteransökan i ett flöde.",
      obvious: true,
      selectors: envLink("approvals/received"),
      host: AUTOMATE
    },
    {
      key: "a-nav-solutions",
      name: "Lösningar (Solutions)",
      text: "En lösning är ett paket med flöden, appar och agenter som hör ihop, så att de kan flyttas till en annan miljö tillsammans.",
      use: "När något du har byggt ska flyttas från test till skarp drift.",
      selectors: envLink("solutions"),
      host: AUTOMATE
    },
    {
      key: "a-nav-monitor",
      name: "Automatiseringscenter (Automation center)",
      text: "Överblick över alla flöden: vilka som körs, vilka som misslyckas och varför.",
      use: "När ett flöde har slutat fungera och du vill hitta felet.",
      selectors: envLink("monitor/automations"),
      host: AUTOMATE
    },
    {
      key: "a-nav-process",
      name: "Processutvinning (Process mining)",
      text: "Analyserar hur ett arbete faktiskt går till, utifrån loggar, för att hitta vad som tar tid.",
      obvious: true,
      selectors: envLink("processadvisor/home"),
      host: AUTOMATE
    },
    {
      key: "a-nav-ai",
      name: "AI-nav (AI hub)",
      text: "AI-funktioner som flöden kan använda, till exempel att läsa fakturor eller sammanfatta text.",
      obvious: true,
      selectors: envLink("aibuilder/hub"),
      host: AUTOMATE
    },
    {
      key: "a-nav-more",
      name: "Mer (More)",
      text: "Fler delar av Power Automate, som anslutningar och data.",
      obvious: true,
      aria: ["mer", "more"],
      texts: ["mer", "more"],
      tags: ["button"],
      host: AUTOMATE
    },
    {
      key: "a-nav-platform",
      name: "Power Platform",
      text: "Länkar till Microsofts andra verktyg i samma familj, som Power Apps och Copilot Studio.",
      obvious: true,
      aria: ["power platform"],
      texts: ["power platform"],
      tags: ["button"],
      host: AUTOMATE
    },
    {
      key: "a-search",
      name: "Sök (Search)",
      text: "Söker bland flöden, mallar och hjälp i Power Automate.",
      obvious: true,
      aria: [/^sökruta/, /^search box/],
      host: AUTOMATE
    },
    {
      key: "a-env",
      name: "Miljö (Environment)",
      text: "En miljö (environment) är en egen avdelning i Power Platform med sina egna agenter, flöden och data. Default är den som alla i organisationen delar.",
      use: "När du inte hittar ett flöde. Det kan ligga i en annan miljö.",
      selectors: ['button'],
      hasText: /^(miljöer|miljö|environments?)\b/,
      host: AUTOMATE
    },
    {
      key: "a-settings",
      name: "Inställningar (Settings)",
      text: "Inställningar för Power Automate: språk, anslutningar och administration.",
      obvious: true,
      aria: ["inställningar", "settings"],
      host: AUTOMATE
    },
    {
      key: "a-help",
      name: "Hjälp (Help)",
      text: "Guider och support för Power Automate.",
      obvious: true,
      aria: ["hjälp", "help"],
      host: AUTOMATE
    },
    {
      key: "a-account",
      name: "Kontohanterare (Account)",
      text: "Vem du är inloggad som. Här loggar du ut.",
      obvious: true,
      aria: [/^kontohanterare/, /^account manager/],
      host: AUTOMATE
    },
    {
      key: "a-waffle",
      name: "Appfönstret (App launcher)",
      text: "Genvägar till Microsofts andra appar, som Outlook och Teams.",
      obvious: true,
      aria: ["appfönstret", "app launcher"],
      host: AUTOMATE
    },
    {
      key: "a-scratch",
      name: "Skapa från början (Start from blank)",
      text: "Börjar ett tomt flöde. Du väljer först en utlösare (trigger), alltså det som får flödet att starta.",
      use: "När du vet exakt vad som ska hända och vill bygga själv.",
      aria: [/^skapa från början/, /^start from blank/],
      host: AUTOMATE
    },
    {
      key: "a-template",
      name: "Börja med en mall (Start from a template)",
      text: "Börjar från ett färdigt flöde som du ändrar efter dina behov.",
      use: "När du är ny. Mallen visar hur ett fungerande flöde ser ut.",
      aria: [/^börja med en mall/, /^start from a template/],
      host: AUTOMATE
    },
    {
      key: "a-copilot",
      name: "Skapa med Copilot (Create with Copilot)",
      text: "Du beskriver uppgiften med egna ord, och Copilot föreslår ett flöde som du kan granska och ändra.",
      use: "När du inte vet vilka steg flödet behöver.",
      aria: [/^skapa (med|från) copilot/, /^create (with|from) copilot/],
      host: AUTOMATE
    },
    {
      key: "a-auto-flow",
      name: "Automatiserat molnflöde (Automated cloud flow)",
      text: "Ett flöde som startar av sig självt när något händer, till exempel när ett mejl kommer.",
      use: "När något ska ske varje gång en viss sak händer.",
      texts: ["automatiserat molnflöde", "automated cloud flow"],
      host: AUTOMATE
    },
    {
      key: "a-instant-flow",
      name: "Direkt molnflöde (Instant cloud flow)",
      text: "Ett flöde som du startar själv med en knapp, i appen eller på mobilen.",
      use: "När du vill kunna sätta igång något med ett tryck.",
      texts: ["direkt molnflöde", "instant cloud flow"],
      host: AUTOMATE
    },
    {
      key: "a-scheduled-flow",
      name: "Schemalagt molnflöde (Scheduled cloud flow)",
      text: "Ett flöde som körs på bestämda tider, till exempel varje måndag klockan åtta.",
      use: "När något ska hända regelbundet, som en veckorapport.",
      texts: ["schemalagt molnflöde", "scheduled cloud flow"],
      host: AUTOMATE
    },
    {
      key: "a-describe-flow",
      name: "Beskriv det för att designa det (Describe it)",
      text: "Du skriver vad flödet ska göra, och Copilot bygger ett förslag.",
      obvious: true,
      texts: [/^beskriv det för att designa det/, /^describe it to design it/],
      host: AUTOMATE
    },
    {
      key: "a-desktop-flow",
      name: "Datorflöde (Desktop flow)",
      text: "Ett flöde som styr program på din egen dator, som om någon klickade. Kräver ett program installerat på datorn.",
      use: "När ett gammalt program saknar koppling och någon annars måste klicka manuellt.",
      texts: ["datorflöde", "desktop flow"],
      host: AUTOMATE
    },
    {
      key: "a-process-card",
      name: "Processutvinning (Process mining)",
      text: "Analyserar hur ett arbete faktiskt går till, för att hitta vad som tar tid.",
      obvious: true,
      texts: ["processutvinning", "process mining"],
      within: "main",
      host: AUTOMATE
    },
    {
      key: "a-template-card",
      name: "Mall (Template)",
      text: "Ett färdigt flöde. Ett klick visar vad det gör och vilka konton det behöver, inget skapas än.",
      obvious: true,
      selectors: ['[data-automation-id^="templateCardLink-"]'],
      host: AUTOMATE
    },
    {
      key: "a-template-tab",
      name: "Mallkategori",
      text: "Visar mallar för ett område, som e-post eller godkännanden.",
      obvious: true,
      selectors: ['main [role="tablist"] button[role="tab"]'],
      host: AUTOMATE
    },
    {
      key: "a-template-search",
      name: "Sök i alla mallar",
      text: "Söker bland Microsofts färdiga flöden.",
      obvious: true,
      aria: [/^sök i alla mallar/, /^search all templates/],
      host: AUTOMATE
    },
    {
      key: "a-install",
      name: "Installationsmeny (Install)",
      text: "Hämtar Power Automate till datorn eller mobilen.",
      obvious: true,
      selectors: [auto("flowInstallButton")],
      host: AUTOMATE
    },
    {
      key: "a-new-flow",
      name: "Nytt flöde (New flow)",
      text: "Börjar ett nytt flöde. Du väljer sort först: automatiserat, direkt eller schemalagt.",
      use: "När du vill bygga en ny automatisering.",
      selectors: [auto("flowMenu_new_flow_menu")],
      host: AUTOMATE
    },
    {
      key: "a-import",
      name: "Importera (Import)",
      text: "Hämtar in ett flöde som någon har exporterat som fil.",
      obvious: true,
      selectors: [auto("flowCommand-importMenu")],
      host: AUTOMATE
    },
    {
      key: "a-activity",
      name: "Molnflödesaktivitet (Cloud flow activity)",
      text: "Visar vilka flöden som har körts nyss och om något gick fel.",
      use: "När du undrar om ett flöde har gjort det det skulle.",
      selectors: [auto("flowCommand-cloudFlowsActivity")],
      host: AUTOMATE
    },
    {
      key: "a-tab-cloud",
      name: "Molnflöden (Cloud flows)",
      text: "Flöden som körs hos Microsoft, även när din dator är avstängd.",
      obvious: true,
      selectors: [auto("personalCloudFlowsTab")],
      host: AUTOMATE
    },
    {
      key: "a-tab-desktop",
      name: "Datorflöden (Desktop flows)",
      text: "Flöden som styr program på din egen dator.",
      obvious: true,
      selectors: [auto("desktopFlowsTab"), auto("desktopFlowTestsTab"), auto("desktopFlowTemplatesTab")],
      host: AUTOMATE
    },
    {
      key: "a-tab-shared",
      name: "Delat med mig (Shared with me)",
      text: "Flöden som andra har delat med dig.",
      obvious: true,
      selectors: [auto("sharedCloudFlowsTab")],
      host: AUTOMATE
    },
    {
      key: "a-flow-name",
      name: "Flöde (Flow)",
      text: "Ett av dina flöden. Klicka för att se när det har körts och om det gick bra.",
      obvious: true,
      selectors: ['main a[href*="/flows/"].ms-Link'],
      host: AUTOMATE
    },
    {
      key: "a-edit",
      name: "Redigera (Edit)",
      text: "Öppnar flödet i redigeraren, där du ser och ändrar stegen. Inget ändras förrän du sparar.",
      obvious: true,
      selectors: [auto("flowCommand-editV3"), '[data-automation-id^="flowCommand-edit"]'],
      host: AUTOMATE
    },
    {
      key: "a-share",
      name: "Dela (Share)",
      text: "Ger en kollega rätt att se eller ändra flödet.",
      use: "När någon annan ska kunna sköta flödet om du är borta.",
      selectors: [auto("flowCommand-share")],
      host: AUTOMATE
    },
    {
      key: "a-overflow",
      name: "Fler kommandon (More commands)",
      text: "Fler val för flödet, som att stänga av, kopiera eller ta bort det.",
      obvious: true,
      selectors: [auto("actionMenuOverflowButton")],
      host: AUTOMATE
    },
    {
      key: "a-learning",
      name: "Utbildning för alla nivåer",
      text: "Kurser från Microsoft om Power Automate.",
      obvious: true,
      texts: ["utbildning för alla nivåer", "learning for every level"],
      host: AUTOMATE
    },
    {
      key: "a-more-explore",
      name: "Mer att utforska i Power Automate",
      text: "Länkar till priser, forum och dokumentation.",
      obvious: true,
      texts: ["mer att utforska i power automate", "more to explore in power automate"],
      host: AUTOMATE
    },

    {
      key: "a-nav-learn",
      name: "Läs (Learn)",
      text: "Microsofts guider och kurser för Power Automate.",
      obvious: true,
      aria: ["läs", "learn"],
      host: AUTOMATE
    },
    {
      key: "a-course",
      name: "Kurs (Learning module)",
      text: "En kurs från Microsoft Learn, som öppnas i en ny flik.",
      obvious: true,
      selectors: ["a.ms-LinkTile"],
      host: AUTOMATE
    },
    {
      key: "a-site-links",
      name: "Länk till Microsoft",
      text: "Öppnar en sida hos Microsoft: priser, forum, guider eller felsökning.",
      obvious: true,
      texts: ["jämför planer", "delta i diskussionen", "utveckla dina kunskaper", "dela ett förslag", "felsök", "compare plans", "join the discussion", "build your skills", "share an idea", "troubleshoot"],
      host: AUTOMATE
    },
    {
      key: "a-connector",
      name: "Koppling (Connector)",
      text: "En koppling låter ett flöde prata med en annan tjänst, som Outlook, Teams eller SharePoint. Första gången loggar du in i tjänsten.",
      use: "När ditt flöde ska läsa eller skicka något i en annan app. Kolla att kopplingen inte är Premium, som kostar extra.",
      selectors: ['a[href*="/connectors/shared_"]'],
      host: AUTOMATE
    },
    {
      key: "a-all-connectors",
      name: "Alla kopplingar (All connectors)",
      text: "Listan över alla tjänster som flöden kan kopplas till, flera hundra stycken.",
      obvious: true,
      selectors: ['a[href$="/connectors"]', 'a[href*="/connectors?"]'],
      host: AUTOMATE
    },

    /* ---------------- Fler saker som svepet hittade i portalen ---------------- */
    { key: "rm-menu-root", name: "Resource Manager", text: "Azures system för att skapa och hålla ordning på resurser. Här finns listorna över allt du har.", obvious: true, texts: ["resource manager"], within: ".fxc-menu-item" },
    { key: "rm-menu-favorites", name: "Favoritresurser (Favorite resources)", text: "Resurserna du har stjärnmärkt.", obvious: true, texts: ["favoritresurser", "favorite resources"], within: ".fxc-menu-item" },
    { key: "rm-menu-recent", name: "Senaste resurser (Recent resources)", text: "Resurserna du har tittat på senast.", obvious: true, texts: ["senaste resurser", "recent resources"], within: ".fxc-menu-item" },
    { key: "toolbar-analyze", name: "Analysera (Analyze)", text: "Öppnar en analys av de prenumerationer du har markerat i listan.", obvious: true, texts: ["analysera", "analyze"], within: TOOLBAR },
    { key: "frame-open-query", name: "Öppen fråga (Open query)", text: "Öppnar listan som en fråga i Resource Graph, ett sökspråk för resurser.", obvious: true, aria: ["öppen fråga", "open query"], texts: ["öppen fråga", "open query"] },
    { key: "grid-type", name: "Typ (Type)", text: "Vilken sorts resurs det är. Klicka för att öppna tjänstens sida, med alla resurser av samma sort.", obvious: true, selectors: ['[role="gridcell"] button'] },
    { key: "page-size", name: "Rader per sida", text: "Hur många rader listan visar på varje sida.", obvious: true, selectors: [".fxc-group-dropdown-arrow"], aria: [/^skriv för att filtrera resultat/, /^type to filter results/] },
    {
      key: "sub-spend",
      name: "Utgiftshastighet och prognos (Spending rate and forecast)",
      text: "Hur fort pengarna går just nu och vad hela månaden väntas kosta.",
      use: "När du vill veta om du håller budgeten innan fakturan kommer.",
      texts: ["utgiftshastighet och prognos", "spending rate and forecast"],
      tags: ["h2", "h3", "h4"]
    },
    { key: "sub-cost-by-resource", name: "Kostnader efter resurs (Costs by resource)", text: "Vilka resurser som har kostat mest.", obvious: true, texts: ["kostnader efter resurs", "costs by resource"], tags: ["h2", "h3", "h4"] },
    { key: "sub-top-products", name: "Främsta produkter (Top products)", text: "Vilka sorters tjänster du har flest av.", obvious: true, texts: ["främsta produkter efter antal resurser", "top products by resource count"], tags: ["h2", "h3", "h4"] },
    { key: "sub-defender", name: "Azure Defender-täckning (Defender coverage)", text: "Hur många av dina resurser som skyddas av Defender, Microsofts säkerhetsvakt.", obvious: true, texts: ["azure defender-täckning", "azure defender coverage", "defender-täckning", "defender coverage"], tags: ["h2", "h3", "h4"] },
    {
      key: "sub-upgrade-defender",
      name: "Uppgradera täckning (Upgrade coverage)",
      text: "Slår på betalt säkerhetsskydd från Defender för fler resurser. Det kostar pengar varje månad.",
      use: "När du har något i drift som är viktigt att skydda. Läs priset först.",
      texts: ["uppgradera täckning", "upgrade coverage"]
    },
    { key: "sub-view-resources", name: "Visa resurser (View resources)", text: "Öppnar listan över resurserna i prenumerationen.", obvious: true, texts: ["visa resurser", "view resources"] },
    { key: "cost-recommended", name: "Rekommenderat (Recommended)", text: "Vyer som Microsoft föreslår att du börjar med.", obvious: true, texts: ["rekommenderat", "recommended"], tags: ["h2", "h3", "h4"] },
    {
      key: "cost-view-accumulated",
      name: "Ackumulerade kostnader (Accumulated costs)",
      text: "Ett diagram där kostnaden läggs ihop dag för dag under månaden, med en prognos för resten.",
      use: "När du vill se om månaden är på väg mot en högre summa än du tänkt.",
      selectors: ['div[role="button"]'],
      hasText: /^(ackumulerade kostnader|accumulated costs)\b/
    },
    {
      key: "cost-view-daily",
      name: "Dagliga kostnader (Daily costs)",
      text: "Vad varje dag har kostat, en stapel per dag.",
      use: "När du vill hitta dagen då något började kosta mer.",
      selectors: ['div[role="button"]'],
      hasText: /^(dagliga kostnader|daily costs)\b/
    },
    {
      key: "cost-view-rg",
      name: "Resursgrupper (Resource groups)",
      text: "Kostnaden uppdelad på resursgrupper, alltså ungefär per projekt.",
      use: "När du vill se vilket projekt som kostar mest.",
      selectors: ['div[role="button"]'],
      hasText: /^(resursgrupper|resource groups)\b/
    },
    { key: "cost-view-subs", name: "Prenumerationer (Subscriptions)", text: "Kostnaden uppdelad per prenumeration.", obvious: true, selectors: ['div[role="button"]'], hasText: /^(prenumerationer|subscriptions)\b/ },
    { key: "cost-alert-rules", name: "Aviseringsregler (Alert rules)", text: "Reglerna som bestämmer när du får en kostnadsvarning.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/alertrules"]'] },
    { key: "cost-reservations", name: "Reservationer + Hybrid-förmån (Reservations)", text: "Rabatt om du lovar att använda en tjänst i ett eller tre år. Passar inte när du provar.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/reservations"]'] },
    { key: "cost-savings-plans", name: "Besparingsprenumerationer (Savings plans)", text: "Rabatt om du lovar att betala ett visst belopp per timme i ett eller tre år.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/savingsplans"]'] },
    { key: "cost-allocation", name: "Kostnadsallokering (Cost allocation)", text: "Fördelar delade kostnader mellan avdelningar eller kunder.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/costallocation"]'] },
    { key: "cost-config", name: "Konfiguration (Configuration)", text: "Inställningar för hur kostnaderna räknas och visas.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/config"]'] },
    {
      key: "cost-payment",
      name: "Betalningssätt (Payment methods)",
      text: "Kortet eller kontot som Azure drar pengarna från.",
      use: "När ditt kort har gått ut eller du vill byta hur du betalar.",
      selectors: ['a.fxc-menu-item[href$="~/paymentmethods"]']
    },
    { key: "cost-subscriptions", name: "Azure-prenumerationer (Azure subscriptions)", text: "Prenumerationerna som hör till det här faktureringskontot.", obvious: true, selectors: ['a.fxc-menu-item[href$="~/subscriptions"]'] }
  ];

  /*
   * Självklara saker som medvetet INTE får någon bubbla. Tillägget läser inte
   * listan, svepet gör det. Kör node tests/sync-skipped.js efter varje ändring.
   */
  globalThis.PW_SKIPPED = [
    { selectors: ["#mectrl_body_signOut", "#mectrl_signInItem", "#mectrl_feedback"] },
    { selectors: ["button.fxs-sidebar-hamburger", "button.fxs-blade-close", "button.fxs-blade-collapser", "button.fxs-bladecontent-collapser"] },
    { selectors: ["h2.fxs-blade-title-titleText", "button.fxc-menu-expandall", "button.azc-listView-groupheader", ".fxc-menu-favorite"] },
    { selectors: ["button.fxs-toast-close", ".fxs-settings-close-button", ".fxc-copyablelabel-copybutton", ".azc-dockedballoon-anchor"] },
    { selectors: [".fxc-section-tab-item", ".fxs-settings-feedback-link", ".fxs-settings-leavedirectories"] },
    { texts: ["uppdatera", "refresh", "feedback", "ge feedback", "give feedback", "byt namn", "rename", "välj alla objekt", "select all items"] },
    { texts: ["< föregående", "nästa >", "< previous", "next >", "utseende", "appearance", "språk + region", "language + region"] },
    { texts: ["läs mer", "learn more", "läs mer om kataloger.", "learn more about directories.", "mer information"] },
    { aria: ["uppdatera", "refresh", "välj alla rader", "markera rad", "select all rows", "select row", "växla till helskärmsläge", "stäng copilot-hubben", "föregående sida", "nästa sida", "ge feedback"] },
    { texts: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "här", "klicka här", "here", "click here"] },
    { texts: ["läs mer om inställningar", "säkra url:er", "microsoft partner network", "sekretesspolicy", "fler azure-resurser", "learn more about settings", "safe urls", "privacy policy", "more azure resources"] },
    { selectors: [".fxc-essentials-value", ".fxc-menu-collapseexpandall"], aria: ["feedback", "avbryt", "cancel"] },
    { aria: ["dölj vänster navigering", "visa vänster navigering", "hide left navigation", "show left navigation", "tidigare modeller", "nästa modeller", "föregående bild", "nästa bild", "previous slide", "next slide"], texts: ["kopiera", "copy", "villkor", "sekretess", "terms", "privacy"] },
    { selectors: ['[role="tab"].fui-CarouselNavButton', 'h3[id^="left-nav-"]'] },
    { selectors: ['[data-testid="account-profile-card-sign-out"]', '[data-testid="skip-to-main-content-link"]', '#PPUXOfficeHeaderSkipButton', '[data-testid="fn-nav-rail-header"]', '[data-automation-id="FeedbackSmileyButton"]', '#shell-Feedback'] },
    { aria: ["skicka feedback", "send feedback", "stäng meddelande", "dismiss", "jag förstår", "got it", "föregående", "nästa", "previous", "next"], texts: ["visa alla", "see all", "jag förstår", "got it"] },
    { selectors: ['button[role="tab"][aria-label^="Objekt"]', 'button[role="tab"][aria-label^="Item"]'] },
    { aria: ["vänstra navigeringspanelen", "left navigation pane", "öppna", "open", "kopiera", "copy"] }
  ];
})();
