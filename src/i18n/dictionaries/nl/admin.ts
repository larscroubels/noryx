import type { admin as en } from "../en/admin";

export const admin: typeof en = {
  metaTitle: "Platformbeheer",
  badge: "Platformbeheer",
  back: "Terug naar de werkruimte",
  title: "Platformoverzicht",
  description: "Gebruik over alle NORYX-zaken heen. Klantgegevens worden hier nooit getoond.",
  statsLabel: "Platformstatistieken",
  stats: {
    businesses: "Zaken",
    active: "Actief",
    new30: "Nieuw (30 dagen)",
    pagesLive: "Boekingspagina's online",
    members: "Teamleden",
    appointments30: "Afspraken (30 dagen)",
    online30: "Online boekingen (30 dagen)",
    unsent30: "Niet-verzonden meldingen (30 dagen)",
  },
  billingTitle: "Facturatie vereist een koppeling met een betaalprovider",
  billingText:
    "Abonnementen en rechten worden hier toegekend en in de database afgedwongen. Er is geen betaalprovider gekoppeld, dus niemand wordt aangerekend en er bestaan nog geen facturen.",
  businesses: "Zaken",
  columns: {
    business: "Zaak",
    owner: "Eigenaar",
    usage: "Gebruik",
    status: "Status",
    plan: "Abonnement",
    change: "Status wijzigen",
  },
  since: (date) => `sinds ${date}`,
  usage: (members, staff, bookings) =>
    `${members} ${members === 1 ? "lid" : "leden"} · ${staff} medewerkers · ${bookings} boekingen/30d`,
  pageLive: "Pagina online",
  statuses: { active: "Actief", suspended: "Opgeschort", closed: "Gesloten" },
  audit: "Auditlog",
  noEvents: "Nog geen gebeurtenissen.",
  unknownBusiness: "Onbekende zaak",
  form: {
    subscriptionStatus: "Status van het abonnement",
    trialing: "Proefperiode",
    reasonAudit: "Geef een korte reden (wordt bewaard in de auditlog).",
  },
  errors: {
    required: "Toegang als platformbeheerder vereist.",
    status: "De status kon niet gewijzigd worden.",
    plan: "Het abonnement kon niet gewijzigd worden.",
  },
  statusUpdated: "Status bijgewerkt en vastgelegd in de auditlog.",
  planUpdated: "Abonnement bijgewerkt en vastgelegd in de auditlog.",
};
