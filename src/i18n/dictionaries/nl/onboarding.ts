import type { onboarding as en } from "../en/onboarding";

export const onboarding: typeof en = {
  metaTitle: "Je zaak instellen",
  stepOf: (step, total) => `Stap ${step} van ${total}`,
  progress: "Voortgang van de installatie",
  welcome: "Welkom bij NORYX",
  steps: [
    {
      title: "Vertel ons over je zaak",
      description: "Dit duurt ongeveer drie minuten. Je kunt alles later nog aanpassen.",
    },
    {
      title: "Waar vinden klanten je?",
      description: "Je adres en contactgegevens verschijnen op je boekingspagina.",
    },
    {
      title: "Wanneer ben je open?",
      description: "Klanten kunnen alleen binnen je openingsuren boeken.",
    },
    {
      title: "Voeg je eerste behandelingen toe",
      description: "Begin met een paar populaire behandelingen — de rest kun je later toevoegen.",
    },
    {
      title: "Wie neemt afspraken aan?",
      description: "Voeg jezelf toe als medewerker, of sla over als je de salon alleen beheert.",
    },
    {
      title: "Klaar om klanten te ontvangen",
      description: "Zet je boekingspagina nu online, of houd ze privé tot alles klaar is.",
    },
  ],
  saveContinue: "Opslaan en verder",
  skip: "Later doen",
  business: {
    name: "Naam van je zaak",
    type: "Soort zaak",
    chooseOne: "Kies er één",
    address: "Adres van je boekingspagina",
    addressHint: "Klanten boeken online via deze link. Je zet de pagina op het einde online.",
    submit: "Mijn zaak aanmaken",
    slugTaken: "Dit adres is al in gebruik.",
    chooseAnother: "Kies een ander boekingsadres.",
    maxBusinesses: "Je hebt het maximumaantal zaken voor één account bereikt.",
  },
  location: {
    name: "Naam van de vestiging",
    nameHint: "Zichtbaar voor klanten, bv. de naam van je salon of de wijk.",
    email: "Contact-e-mail",
    emailHint: "Ontvangt meldingen van nieuwe boekingen.",
  },
  hours: { check: "Controleer de openingsuren." },
  services: {
    already: "Je hebt al behandelingen toegevoegd. Voeg er hier meer toe of ga verder.",
    name: "Naam van de behandeling",
    placeholder: "bv. Gelmanicure",
    examples: ["Knippen & brushen dames", "Knippen heren"],
    check: "Controleer de gemarkeerde behandelingen.",
  },
  team: {
    question: "Neem je zelf afspraken aan?",
    yes: "Ja, klanten kunnen bij mij een afspraak boeken",
    yesHint:
      "We maken je medewerkersprofiel aan met de openingsuren en behandelingen die je net hebt toegevoegd.",
    no: "Nee, ik beheer alleen de zaak",
    noHint: "Je kunt je team toevoegen via de pagina Medewerkers.",
    displayName: "Naam zichtbaar voor klanten",
    jobTitlePlaceholder: "bv. Senior stylist",
    checkDetails: "Controleer je gegevens.",
  },
  publish: {
    label: "Mijn online boekingspagina publiceren",
    before: "Klanten kunnen boeken op",
    after: ". Je kunt dit altijd uitzetten bij Instellingen.",
    submit: "Naar mijn dashboard",
  },
};
