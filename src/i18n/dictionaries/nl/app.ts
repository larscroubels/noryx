import type { app as en } from "../en/app";

export const app: typeof en = {
  metaTitle: "Werkruimte",
  account: "Account",
  nav: {
    overview: "Overzicht",
    calendar: "Agenda",
    customers: "Klanten",
    services: "Behandelingen",
    staff: "Medewerkers",
    schedule: "Mijn rooster",
    products: "Producten",
    orders: "Bestellingen",
    finance: "Financiën",
    giftCards: "Cadeaubonnen",
    team: "Team",
    settings: "Instellingen",
    help: "Hulp",
  },
  viewBookingPage: "Boekingspagina bekijken",
  bookingPage: "Boekingspagina",
  readOnlyTitle: "Deze zaak is momenteel alleen-lezen",
  readOnlyText: (suspended) =>
    `Het NORYX-team heeft dit account ${suspended ? "opgeschort" : "gesloten"}. Je kunt je gegevens nog bekijken en exporteren. Neem contact op met support als je denkt dat dit een vergissing is.`,
  trial: {
    running: (days) =>
      `Je probeert NORYX Pro gratis — nog ${days} ${days === 1 ? "dag" : "dagen"}.`,
    ended:
      "Je proefperiode van Pro is afgelopen. Je zaak werkt verder met Basic: het boekingssysteem tot 250 klanten.",
    plans: "Abonnementen vergelijken",
  },
  overview: {
    greeting: { morning: "Goedemorgen", afternoon: "Goedemiddag", evening: "Goedenavond" },
    lead: (name) => `Dit gebeurt er vandaag bij ${name}.`,
    newAppointment: "Nieuwe afspraak",
    welcomeTitle: "Je zaak is ingesteld",
    welcomeText: "Welkom bij NORYX. Rond de resterende stappen hieronder af wanneer het je past.",
    passwordUpdated: "Je wachtwoord is gewijzigd.",
    keyFigures: "Kerncijfers",
    today: "Afspraken vandaag",
    week: "Geboekt deze week",
    cancelledHint: (count) => `${count} geannuleerd of niet opgedaagd`,
    value: "Geboekte waarde deze week",
    valueHint: "Schatting op basis van geboekte prijzen, geen betalingen",
    awaiting: "Wacht op bevestiging",
    newCustomers: "Nieuwe klanten (30 dagen)",
    schedule: "Planning van vandaag",
    appointments: (count) => (count === 1 ? "1 afspraak" : `${count} afspraken`),
    openCalendar: "Agenda openen",
    emptyTitle: "Geen afspraken vandaag",
    emptyOnline: "Nieuwe online boekingen verschijnen hier automatisch.",
    emptyOffline:
      "Publiceer je boekingspagina zodat klanten online kunnen boeken, of voeg zelf een afspraak toe.",
    addAppointment: "Een afspraak toevoegen",
    customer: "Klant",
    pending: (count) =>
      count === 1
        ? "1 boeking wacht op je goedkeuring"
        : `${count} boekingen wachten op je goedkeuring`,
    review: "Aanvragen bekijken",
    orders: (count) =>
      count === 1
        ? "1 webshopbestelling klaar te maken"
        : `${count} webshopbestellingen klaar te maken`,
    viewOrders: "Bestellingen bekijken",
    lowStock: "Lage voorraad",
    lowStockText: (count) =>
      count === 1
        ? "1 product moet aangevuld worden"
        : `${count} producten moeten aangevuld worden`,
    left: (count) => `nog ${count}`,
    finish: "Rond je installatie af",
    finishProgress: (done, total) => `${done} van ${total} klaar`,
    checklist: {
      hours: "Stel je openingsuren in",
      services: "Voeg je behandelingen en prijzen toe",
      staff: "Geef minstens één medewerker werkuren",
      publish: "Publiceer je online boekingspagina",
    },
    done: "(klaar)",
    todo: "(te doen)",
    yourPage: "Je boekingspagina",
    shareText: "Deel deze link op Instagram, Google of je website.",
    customerLimit: (count, limit) => `${count} van de ${limit} klanten in Basic zijn in gebruik.`,
    customerLimitText: "Pro heeft geen limiet op het aantal klanten.",
  },
};
