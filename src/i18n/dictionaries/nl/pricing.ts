import type { pricing as en } from "../en/pricing";

export const pricing: typeof en = {
  metaTitle: "Prijzen",
  metaDescription:
    "NORYX Basic en Pro, met extra opties. Probeer Pro 14 dagen gratis — geen betaalgegevens nodig.",
  eyebrow: "Prijzen",
  title: "Twee abonnementen. Begin met 14 dagen Pro, gratis.",
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
  },
  soonBadge: "In ontwikkeling",
  addOns: {
    title: "Extra opties",
    lead: "Voeg ze toe aan je abonnement.",
    newsletter: {
      name: "Nieuwsbrief van je salon",
      text: "Stuur je eigen nieuwsbrief naar klanten die toestemming gaven voor marketingberichten.",
      price: (amount) => `+ ${amount} per maand`,
      note: "Bij elk abonnement.",
    },
    customSite: {
      name: "Eigen domein en custom webpagina",
      text: "Je salon op een eigen domeinnaam (hairsalonsylvie.be in plaats van noryx.be/hairsalonsylvie), met een onepage-website die het NORYX-team voor je opzet: boeken, webshop en cadeaubonnen erin verwerkt.",
      price: (amount) => `+ ${amount} eenmalig`,
      note: "Alleen bij Pro. Het NORYX-team zet je domein en webpagina op.",
    },
  },
  compare: {
    title: "De abonnementen vergelijken",
    feature: "Functie",
    included: "Inbegrepen",
    notIncluded: "Niet inbegrepen",
    rows: [
      { label: "Online boekingspagina", basic: true, pro: true },
      { label: "Agenda, behandelingen en roosters", basic: true, pro: true },
      { label: "Teamlogins met rollen", basic: true, pro: true },
      { label: "Cadeaubonnen", basic: true, pro: true },
      { label: "Klanten", basic: "Tot 250", pro: "Onbeperkt" },
      { label: "Betalingen & financiën", basic: false, pro: true },
      { label: "Producten & voorraad", basic: false, pro: true },
      { label: "Webshop (click & collect)", basic: false, pro: true },
      { label: "Prikklok", basic: false, pro: true },
      { label: "Eigen huisstijl op je boekingspagina", basic: false, pro: true },
      { label: "Eigen rechten per teamlid", basic: false, pro: true },
      { label: "Eigen domein en custom webpagina", basic: false, pro: "Extra optie" },
    ],
  },
  trial: {
    title: "Zo werkt de gratis proefperiode",
    steps: [
      { title: "Maak je account aan", text: "Registreer in enkele minuten. Geen betaalgegevens nodig." },
      { title: "Gebruik Pro 14 dagen", text: "Alle functies van Pro zijn open tijdens je proefperiode." },
      {
        title: "Kies je abonnement",
        text: "Kies Basic of Pro. Kies je niets, dan werkt je zaak verder met Basic.",
      },
    ],
  },
  billingNote:
    "Betalen via NORYX is nog niet mogelijk, dus niemand betaalt iets. De prijzen worden aangekondigd voor er iets verandert.",
  questions: "Nog vragen?",
  faqLink: "Lees de veelgestelde vragen",
};
