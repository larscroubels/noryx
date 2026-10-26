import type { CompanyText } from "@/lib/legal";

import type { LegalContent } from "./types";

/** Dutch legal texts: the reference version. */
export function nl(c: CompanyText): LegalContent {
  const contact = c.email
    ? `[${c.email}](mailto:${c.email}) of het [contactformulier](/help#contact)`
    : "het [contactformulier](/help#contact)";
  return {
    updated: (date) => `Laatst bijgewerkt op ${date}`,
    contents: "Inhoud",
    privacy: {
      metaTitle: "Privacyverklaring",
      title: "Privacyverklaring",
      lead: "Hoe NORYX omgaat met persoonsgegevens: van bezoekers van deze website, van salons en hun team, en van de klanten die bij een salon boeken.",
      sections: [
        {
          id: "who",
          title: "Wie is verantwoordelijk?",
          paragraphs: [
            `NORYX wordt uitgebaat door **${c.name}** (${c.legalForm}), ${c.address}, ondernemingsnummer ${c.enterpriseNumber}. In deze verklaring noemen we dat ‘NORYX’, ‘wij’ of ‘ons’.`,
            `Vragen over privacy stel je via ${contact}.`,
          ],
        },
        {
          id: "roles",
          title: "Twee rollen",
          paragraphs: [
            "Voor de gegevens van bezoekers van deze website en van de accounts van salons en hun teamleden zijn wij **verwerkingsverantwoordelijke**.",
            "Voor de gegevens van de klanten van een salon (boekingen, contactgegevens, notities) is de **salon** verwerkingsverantwoordelijke. NORYX verwerkt die gegevens alleen in opdracht van de salon, als **verwerker**, volgens de verwerkersovereenkomst in onze [algemene voorwaarden](/terms#processing).",
          ],
        },
        {
          id: "data",
          title: "Welke gegevens, waarvoor en op welke grond",
          paragraphs: [],
          list: [
            "**Je account**: naam, e-mailadres en wachtwoord (dat nooit leesbaar wordt opgeslagen). Nodig om je toegang tot NORYX te geven; grond: uitvoering van de overeenkomst.",
            "**Je salon**: bedrijfsgegevens, locatie, openingsuren, behandelingen, prijzen, roosters, gewerkte uren en teamleden. Nodig om de dienst te leveren; grond: uitvoering van de overeenkomst.",
            "**Het contactformulier**: naam, e-mailadres, onderwerp en je bericht. Om je vraag te beantwoorden; grond: ons gerechtvaardigd belang om vragen te behandelen, of stappen vóór een overeenkomst.",
            "**De AI-assistent op de website**: de vragen die je typt. Die sturen we naar Anthropic om een antwoord te maken; we bewaren je gesprek zelf niet. Deel er geen persoonsgegevens in. Grond: ons gerechtvaardigd belang om bezoekers snel te helpen.",
            "**Technische gegevens**, zoals je IP-adres en het tijdstip van een verzoek. Om de website veilig te houden en misbruik te beperken, bijvoorbeeld met een limiet op inlogpogingen; grond: ons gerechtvaardigd belang.",
            "**Cookies**: alleen wat nodig is om in te loggen en je taalkeuze te onthouden. Zie de [cookieverklaring](/cookies).",
          ],
        },
        {
          id: "salon-clients",
          title: "Als je bij een salon boekt",
          paragraphs: [
            "Boek je een afspraak, bestel je in de webshop of koop je een cadeaubon bij een salon die NORYX gebruikt, dan gaan je naam, e-mailadres, telefoonnummer en de details van je afspraak of bestelling naar **die salon**. De salon beslist wat ermee gebeurt en is je eerste aanspreekpunt.",
            "Via de privélink bij je boeking kun je je afspraak bekijken en binnen de termijn van de salon annuleren. Wil je je gegevens inzien of laten wissen, vraag het dan aan de salon: zij kan ze in NORYX exporteren of verwijderen. Lukt dat niet, neem dan contact met ons op, dan helpen we de salon.",
            "Maak je een klantaccount aan in de NORYX-app, dan bewaren we je naam, e-mailadres en de salons waaraan je je koppelt. Verwijder je je account, dan verdwijnt dat; salons houden hun eigen klantgegevens.",
            "Berichten over aanbiedingen van een salon krijg je alleen als je dat zelf aanvinkt bij het boeken.",
          ],
        },
        {
          id: "processors",
          title: "Wie verwerkt gegevens voor ons?",
          paragraphs: [
            "We verkopen geen persoonsgegevens en gebruiken ze niet voor advertenties. Deze dienstverleners verwerken gegevens alleen in onze opdracht:",
          ],
          list: [
            `**Supabase**: database, inloggen en bestandsopslag. Regio van de gegevens: ${c.dataRegion}.`,
            "**Vercel**: hosting van de website.",
            "**Anthropic**: de AI-assistent op de website, alleen voor de vragen die je in de assistent typt.",
          ],
        },
        {
          id: "transfers",
          title: "Gegevens buiten Europa",
          paragraphs: [
            "Supabase, Vercel en Anthropic zijn bedrijven uit de Verenigde Staten. Wanneer gegevens buiten de Europese Economische Ruimte worden verwerkt, gebeurt dat alleen met de waarborgen die de AVG vraagt, zoals het EU-VS-gegevensprivacykader of de standaardcontractbepalingen van de Europese Commissie.",
          ],
        },
        {
          id: "retention",
          title: "Hoe lang bewaren we gegevens?",
          paragraphs: [],
          list: [
            "**Accountgegevens**: zolang je account bestaat. Vraag je om verwijdering, dan wissen we ze, behalve wat we wettelijk moeten bewaren.",
            "**Gegevens van een salon en haar klanten**: zolang de salon NORYX gebruikt. De salon kan klantgegevens zelf exporteren of wissen; financiële registraties blijven dan geanonimiseerd bewaard voor de boekhouding van de salon.",
            "**Berichten via het contactformulier**: zolang nodig om je vraag te behandelen. Je kunt altijd vragen om je bericht te verwijderen.",
            "**Vragen aan de AI-assistent**: wij bewaren ze niet. Anthropic verwerkt ze om het antwoord te maken.",
            "**Technische logs**: kort, volgens de bewaartermijnen van onze hostingpartners.",
          ],
        },
        {
          id: "security",
          title: "Beveiliging",
          paragraphs: [
            "Verbindingen zijn versleuteld (HTTPS). Wachtwoorden worden nooit leesbaar opgeslagen. De gegevens van elke salon zijn in de database strikt gescheiden van die van andere salons, en teamleden zien alleen wat hun rol toelaat. Belangrijke wijzigingen worden bijgehouden in een auditlog.",
          ],
        },
        {
          id: "rights",
          title: "Je rechten",
          paragraphs: [
            `Je hebt het recht om je gegevens in te zien, te laten verbeteren of wissen, de verwerking te laten beperken, bezwaar te maken en je gegevens mee te nemen. Stuur je verzoek via ${contact}. We antwoorden binnen een maand en kunnen je vragen je identiteit te bevestigen.`,
            "Gaat het om je gegevens als klant van een salon? Richt je verzoek dan eerst aan die salon (zie [Als je bij een salon boekt](#salon-clients)).",
          ],
        },
        {
          id: "complaint",
          title: "Een klacht indienen",
          paragraphs: [
            "Ben je het niet eens met hoe we met je gegevens omgaan, laat het ons dan eerst weten. Je kunt ook een klacht indienen bij de Gegevensbeschermingsautoriteit, Drukpersstraat 35, 1000 Brussel, [contact@apd-gba.be](mailto:contact@apd-gba.be), [www.gegevensbeschermingsautoriteit.be](https://www.gegevensbeschermingsautoriteit.be/burger/acties/klacht-indienen).",
          ],
        },
        {
          id: "changes",
          title: "Wijzigingen",
          paragraphs: [
            "NORYX-accounts zijn bedoeld voor ondernemers en hun medewerkers, niet voor kinderen. Passen we deze verklaring aan, dan zie je dat aan de datum bovenaan; belangrijke wijzigingen melden we in NORYX.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Cookieverklaring",
      title: "Cookieverklaring",
      lead: "NORYX gebruikt alleen cookies die nodig zijn om de website en je werkruimte te laten werken. Geen cookies voor statistieken, advertenties of sociale media.",
      sections: [
        {
          id: "what",
          title: "Wat zijn cookies?",
          paragraphs: [
            "Cookies zijn kleine tekstbestanden die een website in je browser bewaart, bijvoorbeeld om te onthouden dat je ingelogd bent.",
          ],
        },
        {
          id: "list",
          title: "Welke cookies gebruiken we?",
          paragraphs: [],
          table: {
            headers: ["Cookie", "Waarvoor", "Hoe lang", "Soort"],
            rows: [
              [
                "sb-…-auth-token",
                "Houdt je ingelogd (Supabase). Kan in delen worden bewaard (.0, .1).",
                "Tot je uitlogt, maximaal 400 dagen",
                "Strikt noodzakelijk",
              ],
              [
                "sb-…-auth-token-code-verifier",
                "Beveiligt het bevestigen van je e-mailadres en het opnieuw instellen van je wachtwoord.",
                "Tot die stap voltooid is",
                "Strikt noodzakelijk",
              ],
              [
                "noryx_business",
                "Onthoudt in welke salon je werkt als je toegang hebt tot meerdere.",
                "Tot je de browser sluit",
                "Strikt noodzakelijk",
              ],
              ["noryx_locale", "Onthoudt de taal die je kiest (NL, FR of EN).", "1 jaar", "Functioneel, op jouw verzoek"],
              ["noryx_cookie_consent", "Onthoudt je keuze in de cookiemelding (weigeren of accepteren).", "6 maanden", "Strikt noodzakelijk"],
            ],
          },
        },
        {
          id: "consent",
          title: "Toestemming",
          paragraphs: [
            "Voor de cookies hierboven is geen toestemming nodig: ze zijn noodzakelijk of onthouden een keuze die je zelf maakt. In de cookiemelding kies je of we in de toekomst ook andere cookies, zoals voor statistieken, mogen gebruiken. Op dit moment gebruiken we er geen, dus weigeren of accepteren verandert niets aan hoe NORYX werkt. Je kunt je keuze altijd wijzigen via ‘Cookie-instellingen’ onderaan de pagina. Gaan we ooit zulke cookies gebruiken, dan laden ze alleen na je toestemming en passen we deze verklaring aan.",
          ],
        },
        {
          id: "third-parties",
          title: "Geen cookies van anderen",
          paragraphs: [
            "We laden geen scripts of inhoud van derden die cookies plaatsen: geen advertentienetwerken, geen knoppen van sociale media en geen analysediensten. Ook de lettertypes komen van onze eigen server.",
          ],
        },
        {
          id: "manage",
          title: "Cookies verwijderen",
          paragraphs: [
            "Je kunt cookies altijd wissen of blokkeren in de instellingen van je browser. Blokkeer je de cookies hierboven, dan kun je niet inloggen in NORYX.",
            `Vragen? Gebruik ${contact}. Meer over persoonsgegevens lees je in de [privacyverklaring](/privacy).`,
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Algemene voorwaarden",
      title: "Algemene voorwaarden",
      lead: "De afspraken tussen NORYX en de salons, barbiers en zelfstandigen die NORYX gebruiken.",
      sections: [
        {
          id: "scope",
          title: "Toepassing",
          paragraphs: [
            "Deze voorwaarden gelden voor elk gebruik van NORYX door een onderneming of zelfstandige (‘de klant’). Door een account aan te maken aanvaard je ze, ook namens de onderneming die je vertegenwoordigt. NORYX is bedoeld voor professioneel gebruik.",
            "Wie bij een salon boekt of bestelt, sluit die overeenkomst met de salon, niet met NORYX.",
          ],
        },
        {
          id: "service",
          title: "De dienst",
          paragraphs: [
            "NORYX is software in de browser om afspraken, klanten, team en zaak te beheren, met een publieke boekingspagina. Wat de dienst omvat, staat op de website en op de [prijzenpagina](/pricing). Functies met de vermelding ‘In ontwikkeling’ maken er nog geen deel van uit.",
            "NORYX verwerkt zelf geen betalingen en verstuurt nog geen e-mails of sms'en namens de salon. Wat in NORYX wordt geregistreerd, zoals betalingen in de salon, is een registratie en geen boekhouding of btw-aangifte.",
          ],
        },
        {
          id: "account",
          title: "Account en toegang",
          paragraphs: [],
          list: [
            "Je geeft juiste gegevens op en houdt ze up-to-date.",
            "Je houdt je inloggegevens geheim. Elk teamlid gebruikt een eigen account.",
            "Je bent verantwoordelijk voor de teamleden die je uitnodigt en de rechten die je hen geeft.",
            "Vermoed je misbruik van je account, laat het ons dan meteen weten.",
          ],
        },
        {
          id: "plans",
          title: "Proefperiode, abonnementen en prijzen",
          paragraphs: [
            "Een nieuwe zaak krijgt 14 dagen gratis toegang tot Pro, zonder betaalgegevens. Daarna gaat de zaak verder op Basic, tenzij ze een ander abonnement kiest.",
            "De maandprijzen zijn nog niet vastgelegd. Zolang betalen via NORYX niet mogelijk is, wordt niets aangerekend. We maken de prijzen bekend en vragen je akkoord voordat er iets betaald moet worden.",
            "Extra opties, zoals een eigen domein met custom webpagina (eenmalig, alleen bij Pro) of een nieuwsbrief (per maand), worden apart afgesproken en pas geleverd na je akkoord.",
          ],
        },
        {
          id: "use",
          title: "Gebruik van NORYX",
          paragraphs: ["Je gebruikt NORYX volgens de wet en deze voorwaarden. Je doet in het bijzonder niet het volgende:"],
          list: [
            "onwettige inhoud of gegevens opslaan of verspreiden;",
            "klanten berichten sturen over aanbiedingen zonder hun toestemming;",
            "proberen toegang te krijgen tot gegevens van anderen of de dienst te verstoren;",
            "de software kopiëren, doorverkopen of namaken.",
          ],
        },
        {
          id: "own-content",
          title: "Jouw verantwoordelijkheid als salon",
          paragraphs: [
            "Je bepaalt zelf je prijzen, je annulerings- en cadeaubonvoorwaarden en je communicatie met je klanten, en je zorgt dat die voldoen aan de wet. Voor de gegevens van je klanten ben je verwerkingsverantwoordelijke (zie hieronder).",
          ],
        },
        {
          id: "processing",
          title: "Verwerkersovereenkomst",
          paragraphs: [
            "Voor de persoonsgegevens van je klanten en teamleden die je in NORYX bewaart, ben jij verwerkingsverantwoordelijke en is NORYX verwerker in de zin van artikel 28 van de Algemene Verordening Gegevensbescherming (AVG). Dit artikel geldt als verwerkersovereenkomst.",
          ],
          list: [
            "**Onderwerp en duur**: het leveren van NORYX, zolang je account bestaat.",
            "**Gegevens en betrokkenen**: contactgegevens, afspraken, bestellingen, cadeaubonnen, notities en betalingsregistraties van je klanten, en gegevens van je teamleden zoals naam, e-mailadres, roosters en gewerkte uren.",
            "**Instructies**: NORYX verwerkt de gegevens alleen om de dienst te leveren en volgens jouw instructies, zoals je die via NORYX geeft.",
            "**Vertrouwelijkheid**: wie bij NORYX toegang heeft tot gegevens, is tot geheimhouding verplicht.",
            "**Beveiliging**: passende technische en organisatorische maatregelen, waaronder versleutelde verbindingen, strikte scheiding tussen salons in de database, rollen en rechten, en een auditlog.",
            "**Subverwerkers**: Supabase (database, inloggen, opslag) en Vercel (hosting). Een nieuwe subverwerker melden we vooraf; je kunt bezwaar maken.",
            "**Rechten van betrokkenen**: NORYX biedt hulpmiddelen om gegevens van een klant te exporteren of te wissen, en helpt je bij verzoeken die je ontvangt.",
            "**Datalekken**: we melden een inbreuk op persoonsgegevens zonder onnodige vertraging, met de informatie die je nodig hebt voor je eigen meldingen.",
            "**Einde**: na het einde van de overeenkomst kun je je gegevens exporteren; daarna verwijderen we ze, behalve wat we wettelijk moeten bewaren.",
            "**Controle**: we geven je de informatie die nodig is om na te gaan of we deze afspraken naleven.",
          ],
        },
        {
          id: "availability",
          title: "Beschikbaarheid en ondersteuning",
          paragraphs: [
            "We doen ons best om NORYX altijd beschikbaar te houden, maar garanderen geen ononderbroken werking. Voor onderhoud kan de dienst kort onbereikbaar zijn. Ondersteuning krijg je via de [Hulp-pagina](/help).",
          ],
        },
        {
          id: "liability",
          title: "Aansprakelijkheid",
          paragraphs: [
            "NORYX is aansprakelijk voor schade die het rechtstreekse gevolg is van een fout van NORYX. We zijn niet aansprakelijk voor onrechtstreekse schade, zoals gederfde winst of verlies van klanten, en ook niet voor schade door verkeerd gebruik, door gegevens die je zelf invoert of door storingen bij derden.",
            "Onze aansprakelijkheid is beperkt tot de bedragen die je in de twaalf maanden vóór de schade aan NORYX betaalde. Deze beperkingen gelden niet bij opzet of fraude.",
          ],
        },
        {
          id: "ip",
          title: "Intellectuele eigendom",
          paragraphs: [
            "De software, het ontwerp en de naam NORYX blijven eigendom van NORYX. Je krijgt een niet-overdraagbaar recht om NORYX te gebruiken zolang je account bestaat. Jouw gegevens en inhoud blijven van jou.",
          ],
        },
        {
          id: "termination",
          title: "Duur en beëindiging",
          paragraphs: [
            "Je kunt je account op elk moment laten stopzetten via het [contactformulier](/help#contact). Je kunt je gegevens vooraf exporteren.",
            "Bij ernstige of herhaalde schending van deze voorwaarden of bij misbruik kunnen we een account opschorten of beëindigen. Behalve in dringende gevallen laten we dat eerst weten.",
          ],
        },
        {
          id: "changes",
          title: "Wijzigingen",
          paragraphs: [
            "We kunnen deze voorwaarden aanpassen. Belangrijke wijzigingen melden we minstens 30 dagen vooraf. Gebruik je NORYX daarna verder, dan gelden de nieuwe voorwaarden.",
          ],
        },
        {
          id: "law",
          title: "Toepasselijk recht",
          paragraphs: [
            "Op deze voorwaarden is het Belgische recht van toepassing. Bij een geschil zoeken we eerst samen een oplossing; lukt dat niet, dan zijn de rechtbanken van het arrondissement van de zetel van NORYX bevoegd.",
          ],
        },
      ],
    },
    notice: {
      metaTitle: "Juridische informatie",
      title: "Juridische informatie",
      lead: "Wie NORYX uitbaat en hoe je ons bereikt.",
      sections: [
        {
          id: "operator",
          title: "Uitbater",
          paragraphs: [],
          list: [
            `Naam: ${c.name}`,
            `Rechtsvorm: ${c.legalForm}`,
            `Zetel: ${c.address}`,
            `Ondernemingsnummer (KBO): ${c.enterpriseNumber}`,
            ...(c.vatNumber ? [`Btw-nummer: ${c.vatNumber}`] : []),
          ],
        },
        { id: "contact", title: "Contact", paragraphs: [`Je bereikt ons via ${contact}.`] },
        {
          id: "hosting",
          title: "Hosting",
          paragraphs: [
            `De website wordt gehost door Vercel Inc. De gegevens worden opgeslagen bij Supabase Inc., regio ${c.dataRegion}.`,
          ],
        },
        {
          id: "documents",
          title: "Documenten",
          paragraphs: [
            "Lees ook de [privacyverklaring](/privacy), de [cookieverklaring](/cookies) en de [algemene voorwaarden](/terms).",
          ],
        },
      ],
    },
  };
}
