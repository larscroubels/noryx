import type { marketing as en } from "../en/marketing";

export const marketing: typeof en = {
  meta: {
    title: "NORYX — Het bedrijfsplatform voor beautyprofessionals",
    description:
      "NORYX brengt afspraken, personeel, klanten en online boeken samen in één elegant platform voor kapsalons, barbiers en beautystudio's.",
  },
  nav: {
    features: "Functies",
    booking: "Online boeken",
    forYou: "Voor wie",
    pricing: "Prijzen",
    faq: "Veelgestelde vragen",
    help: "Hulp",
  },
  footer: {
    tagline:
      "Het bedrijfsplatform voor kapsalons, barbiers en beautyprofessionals. Ontworpen in België voor Europese ondernemers.",
    product: "Product",
    account: "Account",
    createAccount: "Account aanmaken",
  },
  hero: {
    badge: "Probeer Pro 14 dagen gratis",
    titleStart: "Jouw salon,",
    titleEmphasis: "prachtig",
    titleEnd: "georganiseerd.",
    lead: "NORYX brengt online boeken, je agenda, je team en je klanten samen in één rustige, elegante werkruimte — gemaakt voor kappers, barbiers en beautyprofessionals.",
    primary: "Maak je account aan",
    secondary: "Ontdek het platform",
    bullets: [
      "Binnen enkele minuten klaar",
      "Geen betaalgegevens nodig",
      "Gemaakt voor Europese salons",
    ],
  },
  demo: {
    caption:
      "Geanimeerd voorbeeld: de salon rondt een afspraak af terwijl een klant op de gsm een nieuwe afspraak boekt, die meteen in de agenda verschijnt.",
    url: "noryx.app/app",
    nav: ["Overzicht", "Agenda", "Klanten", "Behandelingen", "Medewerkers"],
    weekday: "DONDERDAG",
    greeting: "Goedemorgen, Lena",
    stats: ["Vandaag", "Deze week", "Nieuwe klanten"],
    rows: [
      { time: "09:30", name: "Sofie J.", service: "Balayage" },
      { time: "11:00", name: "Lucas D.", service: "Herenknipbeurt" },
      { time: "13:30", name: "Emma V.", service: "Knippen & föhnen" },
      { time: "15:00", name: "Nora P.", service: "Gelmanicure" },
    ],
    newRow: { time: "15:45", name: "Mila D.", service: "Gelmanicure", badge: "Nieuw · online" },
    popover: {
      service: "Balayage",
      detail: "Sofie Janssens · 09:30–12:00",
      confirmed: "Bevestigd",
      completed: "Afgerond",
      action: "Markeer als afgerond",
    },
    phone: {
      salon: "Atelier Noor",
      chooseService: "KIES EEN DIENST",
      services: [
        { name: "Knippen & föhnen", meta: "1 u", price: "€ 58" },
        { name: "Balayage", meta: "2 u 30 min", price: "€ 165" },
        { name: "Gelmanicure", meta: "45 min", price: "€ 42" },
      ],
      pickTime: "KIES EEN TIJDSTIP",
      days: [
        { weekday: "DI", day: "21" },
        { weekday: "WO", day: "22" },
        { weekday: "DO", day: "23" },
        { weekday: "VR", day: "24" },
        { weekday: "ZA", day: "25" },
      ],
      slots: ["09:30", "11:00", "14:15", "15:45", "16:30", "17:00"],
      confirm: "Boeking bevestigen",
      successTitle: "Je bent geboekt",
      successWhen: "wo 22 okt · 15:45",
      successDetail: "Gelmanicure · Amir",
      addToCalendar: "Zet in agenda",
    },
  },
  features: {
    eyebrow: "Alles op één plek",
    title: "Minder administratie. Meer tijd voor je klanten.",
    lead: "Vervang de papieren agenda, de spreadsheets en de berichtjes 's avonds laat door één platform waar je hele team graag mee werkt.",
    items: [
      {
        title: "Je eigen boekingspagina",
        text: "Een mooie pagina met je behandelingen, prijzen, team en openingsuren, waar klanten 24/7 boeken vanop hun gsm.",
      },
      {
        title: "Een agenda die vooruitdenkt",
        text: "Dag-, week- en maandweergave per medewerker. Werkuren, pauzes, buffers en verlof worden automatisch gerespecteerd.",
      },
      {
        title: "Klantgegevens die ertoe doen",
        text: "Bezoekgeschiedenis, privénotities en contactgegevens op één plek, met zoeken, exporteren en privacytools ingebouwd.",
      },
      {
        title: "Behandelingen en prijzen",
        text: "Orden behandelingen in categorieën, stel promotieprijzen in en geef elke medewerker een eigen prijs of duur.",
      },
      {
        title: "Planning voor je team",
        text: "Deeltijdse uren, gesplitste diensten, vakantie en ziekte — elke wijziging past je online beschikbaarheid meteen aan.",
      },
      {
        title: "De juiste toegang voor iedereen",
        text: "Eigenaars, managers en medewerkers zien elk wat ze nodig hebben. Je omzet blijft privé, tenzij jij anders beslist.",
      },
      {
        title: "Verkoop & click-and-collect",
        text: "Volg je voorraad met een volledige historiek en laat klanten producten online reserveren om af te halen en te betalen in de salon.",
      },
      {
        title: "Betalingen & uitgaven in één oogopslag",
        text: "Registreer hoe klanten betaalden, noteer je kosten en zie de omzet per behandeling, medewerker en betaalmethode — met CSV-export.",
      },
    ],
  },
  booking: {
    eyebrow: "Online boeken",
    title: "Volgeboekt, zonder de telefoon op te nemen.",
    lead: "Klanten zien alleen de tijdstippen die echt kunnen — berekend op basis van je openingsuren, de planning van elke medewerker, bestaande afspraken en de buffers die je ertussen nodig hebt.",
    points: [
      {
        title: "Geen dubbele boekingen",
        text: "Elke boeking wordt opnieuw gecontroleerd op de server, en overlappende afspraken zijn onmogelijk in de database.",
      },
      {
        title: "Jouw regels",
        text: "Minimale voorafgaande termijn, boekingshorizon, annuleringstermijn, keuze van medewerker en optionele manuele goedkeuring.",
      },
      {
        title: "Mobile first",
        text: "Een boekingsflow ontworpen voor de gsm in de hand van je klant, met een knop om de afspraak in de agenda te zetten.",
      },
    ],
    preview: {
      title: "Kies een datum en tijdstip",
      days: [
        ["di", "14"],
        ["wo", "15"],
        ["do", "16"],
        ["vr", "17"],
      ],
      morning: "Voormiddag",
      confirm: "Boeking bevestigen",
    },
  },
  team: {
    eyebrow: "Team & klanten",
    title: "Gemaakt voor de manier waarop salons samenwerken.",
    items: [
      {
        title: "Elke medewerker een eigen planning",
        text: "Gesplitste diensten, deeltijdse weken, vakantie en losse pauzes — met eigen prijzen en duur waar nodig.",
      },
      {
        title: "Privacy van bij het ontwerp",
        text: "De gegevens van elke salon zijn strikt gescheiden van alle andere salons. Privénotities over klanten vragen een eigen recht.",
      },
      {
        title: "Een duidelijke status voor elk bezoek",
        text: "In afwachting, bevestigd, afgerond, geannuleerd of niet opgedaagd — met een volledige historiek van elke wijziging.",
      },
      {
        title: "Privacyverzoeken in één klik",
        text: "Exporteer of wis de gegevens van een klant op verzoek, terwijl geanonimiseerde gegevens voor je boekhouding bewaard blijven.",
      },
    ],
  },
  forYou: {
    eyebrow: "Voor wie",
    title: "Van één stoel tot een druk salonteam.",
    types: [
      "Kapsalons",
      "Barbershops",
      "Schoonheidssalons",
      "Nagelstudio's",
      "Wimper- & wenkbrauwstudio's",
      "Huidverzorging & esthetiek",
      "Zelfstandige professionals",
    ],
  },
  roadmap: {
    eyebrow: "Wat komt er",
    title: "Op weg naar je volledige bedrijfsplatform.",
    lead: "Deze modules zijn in ontwikkeling en nog niet beschikbaar. De salons die NORYX vandaag gebruiken, helpen ze vorm te geven.",
    badge: "In ontwikkeling",
    items: [
      {
        title: "Online betalen & voorschotten",
        text: "Veilige betalingen en voorschotten via een betrouwbare betaalprovider.",
      },
      {
        title: "Herinneringen via e-mail & sms",
        text: "Automatische bevestigingen en herinneringen om no-shows te beperken.",
      },
      {
        title: "Klantaccounts",
        text: "Klanten bekijken hun geschiedenis en verplaatsen of annuleren online.",
      },
      {
        title: "Meerdere vestigingen",
        text: "Aparte planningen, voorraad en rapporten per vestiging.",
      },
      { title: "Apps voor iOS & Android", text: "Je salon op zak, voor jou en je team." },
    ],
  },
  faq: {
    eyebrow: "Veelgestelde vragen",
    title: "Je vragen, beantwoord.",
    metaTitle: "Veelgestelde vragen",
    lead: "Korte antwoorden over NORYX, onze abonnementen en hoe boeken werkt. Stap-voor-stapuitleg vind je in het hulpcentrum.",
    helpTitle: "Op zoek naar stap-voor-stapuitleg?",
    helpText: "Het hulpcentrum heeft korte cursussen met screenshots voor elk onderdeel van NORYX.",
    helpLink: "Naar het hulpcentrum",
    items: [
      {
        q: "Wat kost NORYX?",
        a: "NORYX heeft twee abonnementen: Basic en Pro. De prijzen worden bekendgemaakt vóór de lancering. Je kunt Pro 14 dagen gratis proberen, zonder betaalgegevens.",
      },
      {
        q: "Wat is het verschil tussen Basic en Pro?",
        a: "Basic is het boekingssysteem — online boeken, agenda, behandelingen en roosters — voor tot 250 klanten. Pro voegt onbeperkt klanten, betalingen en financiën, voorraad, een webshop en je eigen huisstijl op je boekingspagina toe.",
      },
      {
        q: "Wat gebeurt er na de proefperiode van 14 dagen?",
        a: "Je kiest Basic of Pro. Kies je niets, dan werkt je zaak verder met Basic. Er wordt niets automatisch aangerekend: betalen via NORYX is nog niet mogelijk.",
      },
      {
        q: "Kunnen klanten boeken zonder account?",
        a: "Ja. Klanten kiezen een behandeling, medewerker en tijdstip, en laten hun naam, e-mailadres en telefoonnummer achter. Geen wachtwoord nodig.",
      },
      {
        q: "Kunnen twee klanten hetzelfde tijdstip boeken?",
        a: "Nee. De beschikbaarheid wordt op het moment van boeken opnieuw gecontroleerd op de server, en de database zelf weigert overlappende afspraken voor dezelfde professional.",
      },
      {
        q: "Zien mijn medewerkers mijn omzet?",
        a: "Niet standaard. Medewerkers zien hun eigen afspraken en klanten. Jij beslist wie de cijfers ziet of instellingen beheert.",
      },
      {
        q: "Waar worden mijn gegevens bewaard?",
        a: "NORYX is gebouwd voor Europese ondernemingen. De gegevens van elke salon zijn strikt gescheiden, en je kunt de persoonsgegevens van een klant op verzoek exporteren of wissen.",
      },
      {
        q: "Stuurt NORYX bevestigingsmails?",
        a: "Nog niet. Boekingen en bestellingen worden op het scherm bevestigd en klanten kunnen afspraken in hun agenda zetten. Meldingen via e-mail en sms zijn in ontwikkeling.",
      },
      {
        q: "Kunnen klanten online betalen?",
        a: "Nog niet. Je registreert betalingen in de salon, en shopbestellingen worden betaald bij het afhalen. Online betalen komt er via een betrouwbare betaalprovider.",
      },
      {
        q: "Is NORYX beschikbaar in het Nederlands en het Frans?",
        a: "Ja. NORYX is beschikbaar in het Nederlands, het Frans en het Engels — wissel bovenaan elke pagina.",
      },
    ],
  },
  finalCta: {
    title: "Klaar wanneer je klanten het zijn.",
    lead: "Maak je account aan, voeg je behandelingen toe en deel vandaag nog je boekingspagina.",
    primary: "Aan de slag",
    secondary: "Inloggen",
  },
};
