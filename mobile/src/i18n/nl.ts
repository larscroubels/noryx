import type { en } from "./en";

export const nl: typeof en = {
  common: {
    retry: "Opnieuw proberen",
    close: "Sluiten",
    loading: "Laden…",
    loadFailed: "We konden dit niet laden. Controleer je verbinding en probeer opnieuw.",
    signOut: "Afmelden",
  },
  tabs: {
    today: "Vandaag",
    calendar: "Agenda",
    clients: "Klanten",
    clock: "Klok",
    more: "Meer",
  },
  language: {
    title: "Taal",
    salon: "Taal van de salon",
  },
  auth: {
    signUpLead:
      "Eén account om te boeken bij je salons, en voor je werk als je in het team van een salon zit.",
    sessionEnded: "Je bent afgemeld. Meld je opnieuw aan.",
    notConfigured: "Deze versie van de app is nog niet met NORYX verbonden.",
    termsLabel: "Ik ga akkoord met de algemene voorwaarden en het privacybeleid",
    readTerms: "Voorwaarden lezen",
    readPrivacy: "Privacybeleid lezen",
  },
  side: {
    pickTitle: "Waar wil je beginnen?",
    pickLead: "Je werkt in een salon en je bent ook klant. Je kunt altijd wisselen in je profiel.",
    salon: "Mijn werk in de salon",
    client: "Mijn afspraken als klant",
    switchToSalon: "Naar mijn werk in de salon",
    switchToClient: "Naar mijn klantkant",
  },
  clientSoon: {
    title: "Boeken in de app komt eraan",
    text: "Binnenkort koppel je hier je salons met hun code en boek je in een paar tikken. Tot dan boek je via de boekingspagina van je salon.",
    runSalon: "Heb je een salon? Stel die in op noryx",
  },
  profile: {
    title: "Profiel",
    open: "Open je profiel",
    deviceLanguage: "Taal van je telefoon",
    business: "Zaak",
    deleted: "Je account is verwijderd.",
  },
  more: {
    lead: "Deze onderdelen van je werkruimte openen op de NORYX-website, al aangemeld.",
    failed:
      "We konden deze pagina niet aangemeld openen. Controleer je verbinding en probeer opnieuw.",
  },
  client: {
    salons: {
      title: "Gekoppelde salons",
      linked: "Je salons",
      previous: "Ontkoppeld",
      add: "Salon toevoegen",
      addService: "Dienst toevoegen",
      replace: "Vervangen",
      unlink: "Ontkoppelen",
      code: "Salon-code",
      services: "Diensten",
      save: "Koppelen",
      unlinkTitle: (name: string) => `${name} ontkoppelen?`,
      unlinkText:
        "Je kunt dan niet meer bij deze salon boeken in de app. Er wordt niets geannuleerd: je geschiedenis en geplande afspraken blijven bij Afspraken staan.",
      unlinkConfirm: "Salon ontkoppelen",
      added: (name: string) => `${name} is gekoppeld.`,
      replaced: (name: string) => `${name} vervangt de vorige salon.`,
      unlinked: (name: string) => `${name} is ontkoppeld.`,
    },
    appointments: {
      upcoming: "Gepland",
      history: "Geschiedenis",
      previousSalons: "Vorige salons",
      previousText:
        "Salons die je ontkoppeld hebt. Je geschiedenis blijft hier staan en geplande afspraken kun je nog annuleren.",
      empty: "Nog geen afspraken",
      emptyText: "Boek bij een van je salons via de tab hieronder.",
      cancelTitle: "Deze afspraak annuleren?",
      cancelText: (name: string) => `Het tijdstip komt weer vrij bij ${name}.`,
      cancelConfirm: "Afspraak annuleren",
      cancelled: "Je afspraak is geannuleerd.",
      tooLate: (name: string) => `Annuleren in de app kan niet meer. Neem contact op met ${name}.`,
    },
    tabs: { book: "Boeken", appointments: "Afspraken" },
    chooseSalon: (category: string) => `Welke salon voor ${category.toLowerCase()}?`,
    onboarding: {
      welcomeTitle: "Welkom bij NORYX",
      welcomeText: "Koppel de salons waar je komt en boek er in een paar tikken.",
      start: "Aan de slag",
      servicesTitle: "Welke diensten gebruik je?",
      servicesText: "Kies er één of meer. Je kunt dit later aanpassen.",
      next: "Volgende",
      codesTitle: "Vul de codes van je salons in",
      codesText:
        "Vraag elke salon naar zijn NORYX-code. Doet één salon meerdere diensten? Gebruik dan dezelfde code.",
      codeLabel: (category: string) => `Code voor ${category}`,
      link: "Salons koppelen",
      linked: (name: string) => `Gekoppeld: ${name}`,
      resend: "Bevestigingsmail opnieuw sturen",
      resent:
        "We hebben de bevestigingsmail opnieuw gestuurd. Open hem en koppel daarna hier je salons.",
      resendFailed: "We konden de mail niet sturen. Probeer het over een minuut opnieuw.",
      done: "Beginnen met boeken",
    },
    linkErrors: {
      too_many_attempts: "Te veel codes geprobeerd. Wacht 15 minuten en probeer opnieuw.",
      connection_code_invalid: "We herkennen deze code niet. Vraag ze na bij je salon.",
      categories_required: "Kies minstens één dienst voor deze salon.",
      customer_already_linked:
        "Je klantgegevens bij deze salon zijn al aan een ander account gekoppeld. Neem contact op met de salon.",
      client_link_required: "Koppel deze salon opnieuw met de code voor je boekt.",
    },
  },
};
