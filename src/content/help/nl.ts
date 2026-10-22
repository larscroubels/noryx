import type { HelpContent } from "./types";

export const nl: HelpContent = {
  courses: [
    {
      slug: "aan-de-slag",
      icon: "rocket",
      audience: "owner",
      minutes: 6,
      title: "Aan de slag met NORYX",
      summary:
        "Maak je account aan, stel je zaak in en zet je boekingspagina online — in ongeveer tien minuten.",
      steps: [
        {
          title: "Maak je account aan",
          body: [
            "Ga naar de startpagina en kies **Aan de slag**. Vul je naam, je e-mailadres en een wachtwoord in (minstens 10 tekens, met een letter en een cijfer) en vink de voorwaarden aan.",
            "Je krijgt een e-mail om je adres te bevestigen. Klik op de knop in die e-mail en je komt meteen in de installatie terecht.",
          ],
          image: { name: "signup", alt: "Het registratieformulier van NORYX" },
          tip: "Bovenaan elke pagina kies je met **NL | FR | EN** in welke taal je NORYX gebruikt. Je keuze wordt onthouden.",
        },
        {
          title: "Vertel ons over je zaak",
          body: [
            "Geef de naam van je zaak en het soort zaak in. NORYX stelt meteen een adres voor je boekingspagina voor, zoals **noryx.app/atelier-noor**. Je kunt dat adres aanpassen zolang het nog vrij is.",
            "Klik op **Mijn zaak aanmaken**. Alles wat je in de installatie invult, kun je later nog wijzigen bij **Instellingen**.",
          ],
          image: {
            name: "onboarding-business",
            alt: "Stap 1 van de installatie: gegevens van de zaak",
          },
        },
        {
          title: "Vul je adres en openingsuren in",
          body: [
            "In de volgende stappen vul je je adres en contactgegevens in en stel je je openingsuren per dag in. Vink een dag aan om ze open te zetten en kies het begin- en einduur.",
            "Klanten kunnen alleen binnen je openingsuren boeken, en alleen wanneer de gekozen medewerker ook werkt.",
          ],
          image: { name: "onboarding-hours", alt: "Openingsuren instellen tijdens de installatie" },
        },
        {
          title: "Voeg behandelingen en jezelf toe",
          body: [
            "Voeg je eerste behandelingen toe met hun duur en prijs. Je kunt er later altijd meer toevoegen bij **Behandelingen**.",
            "Neem je zelf afspraken aan? Kies dan **Ja, klanten kunnen bij mij een afspraak boeken**. NORYX maakt dan je medewerkersprofiel aan met je openingsuren en alle behandelingen.",
          ],
        },
        {
          title: "Zet je boekingspagina online",
          body: [
            "In de laatste stap kies je of je boekingspagina meteen online komt. Klik op **Naar mijn dashboard** om af te ronden.",
            "Op het **Overzicht** zie je daarna je afspraken van vandaag, je kerncijfers en een lijstje met wat je nog kunt instellen.",
          ],
          image: {
            name: "overview",
            alt: "Het overzicht van de werkruimte met kerncijfers en de planning van vandaag",
          },
          tip: "Deel de link van je boekingspagina op Instagram, Google of je website. Je vindt ze altijd via **Boekingspagina bekijken** rechtsboven.",
        },
      ],
      faq: [
        {
          q: "Ik heb geen bevestigingsmail gekregen. Wat nu?",
          a: "Kijk in je map met ongewenste e-mail. Vind je hem niet, registreer dan opnieuw met hetzelfde adres of gebruik **Wachtwoord vergeten?** op de inlogpagina.",
        },
        {
          q: "Kan ik meer dan één zaak beheren?",
          a: "Ja. Open het menu met je naam linksonder en kies **Nog een zaak toevoegen**. Met **Wissel van zaak** spring je tussen je zaken.",
        },
        {
          q: "Kan ik het adres van mijn boekingspagina nog wijzigen?",
          a: "Het adres kies je bij het aanmaken van je zaak. Wil je het later wijzigen, neem dan contact op met NORYX, zodat bestaande links niet ongemerkt stoppen met werken.",
        },
      ],
    },
    {
      slug: "agenda-en-afspraken",
      icon: "calendar",
      audience: "everyone",
      minutes: 7,
      title: "Agenda en afspraken",
      summary:
        "Werk met de dag-, week- en maandweergave, plan afspraken in, verplaats ze en houd de status bij.",
      steps: [
        {
          title: "Kies je weergave",
          body: [
            "Open **Agenda** in het menu. In de **Dag**-weergave krijgt elke medewerker een eigen kolom. **Week** en **Maand** geven je een overzicht van een langere periode.",
            "Met de pijltjes en **Vandaag** blader je door de tijd. Met **Alle medewerkers** toon je de agenda van één persoon.",
          ],
          image: {
            name: "calendar-week",
            alt: "De weekweergave van de agenda met afspraken per dag",
          },
          tip: "Een gestreepte balk betekent afwezigheid, zoals vakantie of ziekte. In die periode kan niemand online boeken.",
        },
        {
          title: "Plan een afspraak in",
          body: [
            "Klik op **Nieuwe afspraak**. Kies een **Bestaande klant** of maak meteen een **Nieuwe klant** aan, en kies daarna de behandeling, de medewerker, de datum en het beginuur.",
            "De duur en prijs komen van de behandeling (of van de eigen prijs van de medewerker). Overlapt de afspraak met een andere, dan krijg je een melding en wordt ze niet opgeslagen.",
          ],
          image: {
            name: "new-appointment",
            alt: "Het formulier om een nieuwe afspraak in te plannen",
          },
        },
        {
          title: "Werk de status bij",
          body: [
            "Klik op een afspraak om de details te openen. Bovenaan staan de acties die op dat moment kunnen: **Bevestigen**, **Markeren als afgerond**, **Markeren als niet opgedaagd** of **Annuleren**.",
            "Elke wijziging komt in de **Geschiedenis** van de afspraak, met datum en uur.",
          ],
          image: {
            name: "appointment-detail",
            alt: "De detailpagina van een afspraak met status, verplaatsen en betaling",
          },
        },
        {
          title: "Verplaats of annuleer",
          body: [
            "Bij **Verplaatsen** kies je een nieuwe datum, een nieuw beginuur of een andere medewerker en klik je op **Afspraak verplaatsen**.",
            "Bij **Annuleren** kun je een reden opgeven. Het tijdstip komt meteen weer vrij voor online boekingen.",
          ],
        },
        {
          title: "Keur online aanvragen goed",
          body: [
            "Heb je **Online boekingen handmatig goedkeuren** aangezet bij **Instellingen**, dan komen nieuwe boekingen binnen als ‘in afwachting’. Het tijdstip blijft intussen gereserveerd.",
            "Op het **Overzicht** verschijnt dan een melding. Klik op **Aanvragen bekijken** en bevestig of annuleer elke aanvraag.",
          ],
          image: {
            name: "requests",
            alt: "De lijst met boekingsaanvragen die op bevestiging wachten",
          },
        },
      ],
      faq: [
        {
          q: "Kan een klant twee keer op hetzelfde moment geboekt worden?",
          a: "Nee. NORYX controleert dat in de database zelf: een medewerker kan nooit twee afspraken hebben die overlappen, ook niet als twee mensen op exact hetzelfde moment boeken.",
        },
        {
          q: "Wat ziet een medewerker van de agenda?",
          a: "Met de standaardrol **Medewerker** zie je alleen je eigen afspraken en de klanten die bij jou geboekt hebben. De eigenaar kan dat per persoon aanpassen bij **Team**.",
        },
        {
          q: "Ik heb per ongeluk ‘afgerond’ aangeklikt.",
          a: "Open de afspraak opnieuw en klik op **Bevestigen**. Een afgeronde of niet-opgedaagde afspraak kun je zo terugzetten.",
        },
      ],
    },
    {
      slug: "online-boeken",
      icon: "globe",
      audience: "owner",
      minutes: 6,
      title: "Online boeken voor je klanten",
      summary:
        "Hoe je boekingspagina werkt, welke regels je instelt en hoe klanten zelf kunnen annuleren.",
      steps: [
        {
          title: "Je publieke pagina",
          body: [
            "Je boekingspagina toont je behandelingen met prijs en duur, je team, je openingsuren en je contactgegevens. Klanten hebben geen account nodig.",
            "Je logo, omslagfoto en beschrijving stel je in bij **Instellingen** › **Profiel van de zaak** en **Huisstijl**.",
          ],
          image: { name: "public-page", alt: "De publieke boekingspagina van de demosalon" },
        },
        {
          title: "Zo boekt een klant",
          body: [
            "De klant kiest een behandeling, eventueel een medewerker, en daarna een dag en een vrij tijdstip. NORYX toont alleen tijdstippen die echt kunnen: binnen je openingsuren, het rooster van de medewerker, zonder overlap en met de buffers die je instelde.",
            "Tot slot vult de klant naam, e-mail en telefoonnummer in en gaat akkoord met de boekingsvoorwaarden.",
          ],
          image: {
            name: "booking-time",
            alt: "Een klant kiest een tijdstip op de gsm",
            mobile: true,
          },
        },
        {
          title: "Stel je boekingsregels in",
          body: [
            "Ga naar **Instellingen** › **Online boeken**. Daar kies je de **Minimale termijn** (hoe ver vooraf iemand moet boeken), de **Boekingshorizon**, hoe vaak er een starttijd is en hoeveel buffer er tussen afspraken zit.",
            "Je kiest ook of klanten zelf een medewerker mogen kiezen en of je online boekingen eerst wilt goedkeuren.",
          ],
          image: { name: "settings-booking", alt: "De instellingen voor online boeken" },
        },
        {
          title: "Annuleren door de klant",
          body: [
            "Na het boeken krijgt de klant een privélink om de boeking te bekijken of te annuleren. Dat kan tot het aantal uren dat je instelde bij **Gratis annuleren tot**. Daarna verwijst de pagina naar je telefoonnummer.",
            "Zolang er geen e-mailprovider gekoppeld is, verstuurt NORYX geen bevestigingsmails. De klant ziet de link dan op het bevestigingsscherm en kan de afspraak meteen in de eigen agenda zetten.",
          ],
        },
      ],
      faq: [
        {
          q: "Kan ik online boeken tijdelijk uitzetten?",
          a: "Ja. Zet bij **Instellingen** › **Online boeken** de schakelaar **Online boekingspagina staat online** uit. Je pagina is dan verborgen en niemand kan nog online boeken.",
        },
        {
          q: "Betalen klanten online?",
          a: "Nog niet. Online betalingen en voorschotten vragen een gekoppelde betaalprovider. Tot dan betalen klanten in de salon en registreer je de betaling bij de afspraak.",
        },
        {
          q: "Waarom ziet een klant geen tijdstippen op een bepaalde dag?",
          a: "Dan is de zaak of de medewerker die dag gesloten, is alles al geboekt, valt de dag buiten de boekingshorizon of is het te kort dag volgens je minimale termijn.",
        },
      ],
    },
    {
      slug: "klanten",
      icon: "users",
      audience: "everyone",
      minutes: 5,
      title: "Klanten en privacy",
      summary:
        "Zoek klanten, bekijk hun geschiedenis, houd notities bij en behandel privacyverzoeken.",
      steps: [
        {
          title: "Je klantenlijst",
          body: [
            "Open **Klanten**. Klanten die online boeken, worden automatisch toegevoegd. Met **Klant toevoegen** maak je zelf iemand aan.",
            "Zoek op naam, e-mail of telefoonnummer en sorteer op **Nieuwste eerst** of **Naam A–Z**.",
          ],
          image: { name: "customers", alt: "De klantenlijst met zoekveld" },
        },
        {
          title: "Het klantprofiel",
          body: [
            "Klik op een klant om de geplande afspraken, de geschiedenis, het aantal afgeronde bezoeken en de waarde ervan te zien. Met **Afspraak boeken** plan je meteen een nieuwe afspraak in.",
            "Bij **Privénotities** noteer je bijvoorbeeld een kleurformule of voorkeuren. Die zijn alleen zichtbaar voor teamleden met toegang tot klantnotities.",
          ],
          image: {
            name: "customer-detail",
            alt: "Het profiel van een klant met afspraken en notities",
          },
          tip: "Noteer geen gezondheidsgegevens tenzij de klant daar uitdrukkelijk mee akkoord ging.",
        },
        {
          title: "Toestemming voor marketing",
          body: [
            "Vink **Gaf toestemming voor marketingberichten** alleen aan als de klant dat echt gevraagd heeft. Bij online boeken kiest de klant dat zelf.",
          ],
        },
        {
          title: "Inzage- en wisverzoeken (GDPR)",
          body: [
            "Vraagt een klant welke gegevens je bewaart? Klik op **Persoonsgegevens exporteren** voor een bestand met alle gegevens van die klant.",
            "Wil een klant gewist worden, kies dan **Persoonsgegevens wissen**. Naam, e-mail, telefoon en notities worden definitief verwijderd. De afspraken blijven geanonimiseerd bewaard voor je boekhouding.",
          ],
        },
      ],
      faq: [
        {
          q: "Kan ik al mijn klanten exporteren?",
          a: "Ja, met **Exporteren (CSV)** bovenaan de klantenlijst. Daarvoor heb je het recht ‘Klantgegevens aanmaken, bewerken, exporteren en verwijderen’ nodig.",
        },
        {
          q: "Een klant boekte online met een ander e-mailadres. Wordt dat een nieuwe klant?",
          a: "Ja, NORYX herkent klanten aan hun e-mailadres. Pas het adres aan in het profiel als het om dezelfde persoon gaat.",
        },
        {
          q: "Hoeveel klanten kan ik bewaren?",
          a: "In Basic tot 250 klanten, in Pro onbeperkt. Op het **Overzicht** zie je een melding wanneer je de limiet van Basic nadert.",
        },
      ],
    },
    {
      slug: "behandelingen-en-team",
      icon: "scissors",
      audience: "owner",
      minutes: 8,
      title: "Behandelingen, medewerkers en team",
      summary:
        "Beheer je behandelingen en prijzen, roosters en afwezigheden, en wie wat mag zien in je werkruimte.",
      steps: [
        {
          title: "Behandelingen en prijzen",
          body: [
            "Open **Behandelingen** en klik op **Nieuwe behandeling**. Geef een naam, categorie, duur en prijs in. Een **Actieprijs** moet lager zijn dan de gewone prijs; klanten zien dan beide.",
            "Met **Buffer achteraf** reserveer je tijd om op te ruimen. Zet **Online boekbaar** uit als een behandeling alleen via de salon geboekt mag worden.",
          ],
          image: { name: "services", alt: "De lijst met behandelingen per categorie" },
        },
        {
          title: "Wie voert wat uit?",
          body: [
            "Onderaan het formulier vink je aan welke medewerkers de behandeling uitvoeren. Alleen zij kunnen ervoor geboekt worden.",
            "Heeft iemand een eigen prijs of duur? Stel dat in op het profiel van de medewerker bij **Behandelingen**.",
          ],
          image: {
            name: "service-form",
            alt: "Een behandeling bewerken met de toegewezen medewerkers",
          },
        },
        {
          title: "Werkuren en afwezigheid",
          body: [
            "Open **Medewerkers** en kies een persoon. Bij **Werkuren** zet je per dag de uren; voeg een pauze toe om een dag in twee te splitsen.",
            "Bij **Afwezigheid** plan je vakantie, ziekte of een opleiding in. In die periode kan niemand online bij die persoon boeken.",
          ],
          image: { name: "staff-detail", alt: "Het profiel van een medewerker met werkuren" },
        },
        {
          title: "Teamleden uitnodigen",
          body: [
            "Open **Team** en vul bij **Iemand uitnodigen** het e-mailadres en de rol in. Koppel de uitnodiging aan een medewerkersprofiel, zodat die persoon de eigen agenda ziet.",
            "NORYX maakt een uitnodigingslink die 7 dagen geldig is. Zolang e-mail niet is ingesteld, deel je die link zelf, bijvoorbeeld via WhatsApp.",
          ],
          image: { name: "team", alt: "De teampagina met leden en uitnodigingen" },
        },
        {
          title: "Rollen en rechten",
          body: [
            "Er zijn drie rollen: **Eigenaar** (alles), **Manager** (dagelijkse werking, zonder omzet, instellingen en team) en **Medewerker** (eigen agenda en klanten).",
            "Met **Toegang** stel je per persoon extra rechten in of neem je er een af. Omzet en instellingen blijven privé tenzij je ze uitdrukkelijk deelt.",
          ],
        },
      ],
      faq: [
        {
          q: "Wat gebeurt er als ik een behandeling verwijder?",
          a: "Ze verdwijnt van je boekingspagina. Eerdere en geplande afspraken behouden hun gegevens. Wil je ze tijdelijk verbergen, zet ze dan op inactief.",
        },
        {
          q: "Iemand is vertrokken. Moet ik het profiel verwijderen?",
          a: "Nee, zet het profiel op inactief. De afsprakengeschiedenis blijft bewaard. Bij **Team** trek je met het verwijder-icoon de toegang tot de werkruimte in.",
        },
        {
          q: "Hoeveel medewerkers kan ik toevoegen?",
          a: "Zoveel als je wil: Basic en Pro hebben geen limiet op medewerkers of teamlogins. Eigen rechten per teamlid zitten in Pro.",
        },
      ],
    },
    {
      slug: "webshop-en-voorraad",
      icon: "shopping",
      audience: "owner",
      plan: "pro",
      minutes: 6,
      title: "Webshop en voorraad",
      summary:
        "Beheer je producten en voorraad, zet click & collect aan en verwerk bestellingen tot ze opgehaald zijn.",
      steps: [
        {
          title: "Producten en voorraad",
          body: [
            "Open **Producten** en klik op **Nieuw product**. Vul verkoopprijs, aankoopprijs (voor je marge) en het niveau voor een waarschuwing bij lage voorraad in.",
            "Producten met een lage voorraad krijgen een label en verschijnen op het **Overzicht**.",
          ],
          image: {
            name: "products",
            alt: "De productlijst met voorraad en labels voor lage voorraad",
          },
        },
        {
          title: "Voorraad bijwerken",
          body: [
            "Open een product en kies bij **Voorraad bijwerken** een reden: een levering, een retour, een verkoop in de salon, beschadigd of een correctie na telling.",
            "Elke wijziging komt in de **Voorraadgeschiedenis**, zodat je altijd ziet waar het verschil vandaan komt.",
          ],
          image: { name: "product-detail", alt: "Een product met voorraadgeschiedenis" },
        },
        {
          title: "Zet je webshop aan",
          body: [
            "Vink bij een product **Verkopen in de webshop** aan. Zet daarna bij **Instellingen** › **Webshop** de schakelaar **Webshop staat online** aan.",
            "Klanten reserveren online en betalen bij het ophalen in de salon. Online betalen is nog niet mogelijk.",
          ],
        },
        {
          title: "Bestellingen verwerken",
          body: [
            "Nieuwe bestellingen staan bij **Bestellingen**. De producten zijn op dat moment al gereserveerd in je voorraad.",
            "Open een bestelling en werk ze stap voor stap af: **Bestelling aanvaarden**, **Klaar om op te halen** en **Markeren als opgehaald**. Registreer de betaling met **Markeren als betaald**. Annuleer je een bestelling, dan gaan de producten terug naar de voorraad.",
          ],
          image: { name: "order-detail", alt: "Een webshopbestelling met de volgende stap" },
        },
      ],
      faq: [
        {
          q: "Wat als een product uitverkocht is?",
          a: "Klanten kunnen dan niet meer bestellen dan er op voorraad is. In de webshop staat het product als **Uitverkocht**.",
        },
        {
          q: "Krijgt de klant een bevestiging?",
          a: "De klant ziet het bestelnummer op het scherm. E-mailbevestigingen worden pas verstuurd zodra er een e-mailprovider gekoppeld is.",
        },
      ],
    },
    {
      slug: "financien",
      icon: "wallet",
      audience: "owner",
      plan: "pro",
      minutes: 5,
      title: "Betalingen en financiën",
      summary:
        "Registreer betalingen en uitgaven, volg je omzet en exporteer alles voor je boekhouder.",
      steps: [
        {
          title: "Een betaling registreren",
          body: [
            "Open een afspraak en vul bij **Betaling** het bedrag en de methode in, zoals Bancontact, kaart of contant. Klik op **Betaling registreren**.",
            "NORYX verwerkt zelf geen betalingen: je noteert wat de klant in de salon betaalde. Is alles betaald, dan staat er **Volledig betaald**.",
          ],
          image: { name: "appointment-payment", alt: "Een betaling registreren bij een afspraak" },
        },
        {
          title: "Je financieel overzicht",
          body: [
            "Open **Financiën** en kies een periode. Je ziet je **Geregistreerde omzet**, je **Uitgaven** en het **Resultaat**, plus de omzet per behandeling, medewerker en betaalmethode.",
            "De **Geboekte waarde** is een schatting op basis van geboekte afspraken en staat apart, zodat je ze nooit verwart met echte betalingen.",
          ],
          image: { name: "finance", alt: "Het financieel overzicht met totalen en uitsplitsingen" },
        },
        {
          title: "Uitgaven en terugbetalingen",
          body: [
            "Voeg uitgaven toe met een beschrijving, bedrag, datum, categorie en eventueel een leverancier en factuurnummer.",
            "Gaf je geld terug aan een klant? Markeer de betaling dan als terugbetaald. Ze blijft zichtbaar, maar telt niet meer mee in de omzet.",
          ],
        },
        {
          title: "Exporteren voor je boekhouder",
          body: [
            "Met **Betalingen (CSV)** en **Uitgaven (CSV)** download je alles voor de gekozen periode. Die bestanden open je in Excel of geef je aan je boekhouder.",
          ],
          tip: "NORYX is geen boekhoudpakket. Gebruik de tools van je boekhouder voor je boekhouding en btw-aangiftes.",
        },
      ],
      faq: [
        {
          q: "Wie kan de omzet zien?",
          a: "Alleen de eigenaar en teamleden aan wie je het recht ‘Omzet, uitgaven en financiële overzichten bekijken’ geeft. Managers en medewerkers zien de omzet standaard niet.",
        },
        {
          q: "Zitten de bedragen inclusief btw?",
          a: "De bedragen zijn wat je invoert. Registreer ze zoals de klant ze betaalde, dus meestal inclusief btw.",
        },
      ],
    },
    {
      slug: "instellingen",
      icon: "settings",
      audience: "owner",
      minutes: 4,
      title: "Instellingen en account",
      summary:
        "Pas je profiel, huisstijl, openingsuren en abonnement aan, en beheer je persoonlijke account.",
      steps: [
        {
          title: "Profiel en huisstijl",
          body: [
            "Bij **Instellingen** › **Profiel van de zaak** vul je je beschrijving, publieke contactgegevens, website, Instagram en een accentkleur voor je boekingspagina in.",
            "Bij **Huisstijl** upload je je logo en een omslagfoto: PNG, JPG of WebP, maximaal 2 MB. Een eigen logo, omslagfoto en accentkleur zitten in Pro.",
          ],
          image: { name: "settings", alt: "De instellingen met het profiel van de zaak" },
        },
        {
          title: "Openingsuren en vestiging",
          body: [
            "Bij **Openingsuren** kun je per dag een pauze toevoegen. Wijzigingen passen je online beschikbaarheid meteen aan.",
            "Bij **Vestiging** staan je adres en telefoonnummer zoals klanten ze zien.",
          ],
        },
        {
          title: "Je abonnement",
          body: [
            "Bij **Abonnement** zie je of je Basic of Pro gebruikt, welke functies inbegrepen zijn en hoeveel dagen je gratis proefperiode van Pro nog loopt.",
            "Na de proefperiode kies je Basic of Pro. Kies je niets, dan werkt je zaak verder met Basic. Zolang betalen via NORYX niet mogelijk is, wordt er niets aangerekend.",
          ],
        },
        {
          title: "Je persoonlijke account",
          body: [
            "Klik linksonder op je naam en kies **Accountinstellingen** om je naam, e-mailadres of wachtwoord te wijzigen. Die gegevens staan los van je zaak.",
          ],
          image: { name: "account", alt: "De accountinstellingen met naam, e-mail en wachtwoord" },
        },
      ],
      faq: [
        {
          q: "Waarom kan ik de instellingen niet openen?",
          a: "Alleen de eigenaar en teamleden met het recht om de instellingen te beheren zien dit menu. Vraag de eigenaar om je toegang aan te passen bij **Team**.",
        },
        {
          q: "Hoe wijzig ik de taal?",
          a: "Klik bovenaan op **NL**, **FR** of **EN**. Je keuze wordt een jaar lang onthouden op dat toestel.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Zijn mijn gegevens en die van mijn klanten veilig?",
      a: "Elke zaak is strikt afgeschermd: de database controleert bij elke vraag of je toegang hebt, ook als iemand een link of identificatienummer aanpast. Je team ziet alleen wat je hen toestaat.",
    },
    {
      q: "Verstuurt NORYX e-mails naar mijn klanten?",
      a: "Pas zodra er een e-mailprovider gekoppeld is. Tot dan verstuurt NORYX niets en zeggen we dat ook eerlijk op het scherm, zodat niemand op een mail wacht die niet komt.",
    },
    {
      q: "Kan NORYX betalingen verwerken?",
      a: "Nog niet. Je registreert betalingen die in de salon gebeurden. Online betalen komt pas wanneer er een betaalprovider gekoppeld is.",
    },
    {
      q: "Werkt NORYX op mijn gsm?",
      a: "Ja. De werkruimte en de boekingspagina zijn gemaakt voor zowel gsm als computer. Je hoeft niets te installeren.",
    },
  ],
};
