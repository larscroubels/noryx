import type { pricing as en } from "../en/pricing";

export const pricing: typeof en = {
  metaTitle: "Prijzen",
  metaDescription:
    "NORYX Basic, Pro en Ultra. Probeer Pro 14 dagen gratis — geen betaalgegevens nodig.",
  eyebrow: "Prijzen",
  title: "Drie abonnementen. Begin met 14 dagen Pro, gratis.",
  lead: "Probeer alle functies van Pro twee weken lang. Geen betaalgegevens nodig — daarna kies je het abonnement dat bij je salon past.",
  priceSoon: "Prijs volgt",
  priceNote: "De prijzen worden bekendgemaakt vóór de lancering.",
  trialBadge: "14 dagen gratis",
  cta: "Start je gratis proefperiode",
  plans: {
    basic: {
      name: "Basic",
      tagline: "Het boekingssysteem voor je salon.",
      features: [
        "Online boekingspagina, 24/7 open",
        "Agenda met dag-, week- en maandweergave",
        "Behandelingen, prijzen en roosters van je team",
        "Klantenbestand tot 250 klanten",
        "Teamlogins met rollen",
      ],
    },
    pro: {
      name: "Pro",
      tagline: "Alles om je salon te runnen en te laten groeien.",
      everything: "Alles uit Basic, plus:",
      features: [
        "Onbeperkt klanten",
        "Betalingen & financiën: betalingen en uitgaven registreren, omzetoverzicht, CSV-exports",
        "Producten & voorraad met waarschuwing bij lage voorraad",
        "Webshop met click & collect",
        "Prikklok voor je team",
        "Je eigen logo, omslagfoto en kleur op je boekingspagina",
        "Eigen rechten per teamlid",
      ],
      soon: "Online betalingen en voorschotten",
    },
    ultra: {
      name: "Ultra",
      tagline: "Je salon op een eigen domein, met een website op maat.",
      everything: "Alles uit Pro, plus:",
      features: [
        "Je eigen domeinnaam: hairsalonsylvie.be in plaats van noryx.be/hairsalonsylvie",
        "Een onepage-website, opgezet door het NORYX-team, met al je opties erin: boeken, webshop en cadeaubonnen",
      ],
      setupFee: (amount) => `+ eenmalig ${amount} voor je domein en website`,
      setupNote: "Start met de proefperiode van Pro; daarna zet het NORYX-team je domein en website op.",
    },
  },
  soonBadge: "In ontwikkeling",
  addOns: {
    title: "Extra's",
    lead: "Voeg deze toe aan elk abonnement.",
    newsletter: {
      name: "Nieuwsbrief van je salon",
      text: "Stuur je eigen nieuwsbrief naar klanten die toestemming gaven voor marketingberichten.",
      price: (amount) => `+ ${amount} per maand`,
    },
  },
  compare: {
    title: "De abonnementen vergelijken",
    feature: "Functie",
    included: "Inbegrepen",
    notIncluded: "Niet inbegrepen",
    rows: [
      { label: "Online boekingspagina", basic: true, pro: true, ultra: true },
      { label: "Agenda, behandelingen en roosters", basic: true, pro: true, ultra: true },
      { label: "Teamlogins met rollen", basic: true, pro: true, ultra: true },
      { label: "Cadeaubonnen", basic: true, pro: true, ultra: true },
      { label: "Klanten", basic: "Tot 250", pro: "Onbeperkt", ultra: "Onbeperkt" },
      { label: "Betalingen & financiën", basic: false, pro: true, ultra: true },
      { label: "Producten & voorraad", basic: false, pro: true, ultra: true },
      { label: "Webshop (click & collect)", basic: false, pro: true, ultra: true },
      { label: "Prikklok", basic: false, pro: true, ultra: true },
      { label: "Eigen huisstijl op je boekingspagina", basic: false, pro: true, ultra: true },
      { label: "Eigen rechten per teamlid", basic: false, pro: true, ultra: true },
      { label: "Eigen domeinnaam", basic: false, pro: false, ultra: true },
      { label: "Onepage-website op maat", basic: false, pro: false, ultra: true },
    ],
  },
  trial: {
    title: "Zo werkt de gratis proefperiode",
    steps: [
      { title: "Maak je account aan", text: "Registreer in enkele minuten. Geen betaalgegevens nodig." },
      { title: "Gebruik Pro 14 dagen", text: "Alle functies van Pro zijn open tijdens je proefperiode." },
      {
        title: "Kies je abonnement",
        text: "Kies Basic, Pro of Ultra. Kies je niets, dan werkt je zaak verder met Basic.",
      },
    ],
  },
  billingNote:
    "Betalen via NORYX is nog niet mogelijk, dus niemand betaalt iets. De prijzen worden aangekondigd voor er iets verandert.",
  questions: "Nog vragen?",
  faqLink: "Lees de veelgestelde vragen",
};
