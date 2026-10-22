import type { services as en } from "../en/services";

export const services: typeof en = {
  title: "Behandelingen",
  description:
    "Je behandelingen, duur en prijzen. Wijzigingen verschijnen meteen op je boekingspagina.",
  new: "Nieuwe behandeling",
  other: "Andere behandelingen",
  all: "Alle behandelingen",
  saved: (name) => `“${name}” is opgeslagen.`,
  deleted: "De behandeling is verwijderd. Eerdere afspraken behouden hun gegevens.",
  empty: "Nog geen behandelingen",
  emptyText:
    "Voeg de behandelingen toe die je aanbiedt, zodat klanten ze kunnen boeken en je team ze kan inplannen.",
  addFirst: "Je eerste behandeling toevoegen",
  notOnline: "Niet online",
  noStaff: "Geen medewerker toegewezen",
  professionals: (count) => `${count} ${count === 1 ? "medewerker" : "medewerkers"}`,
  editTitle: "Behandeling bewerken",
  editDescription: "Bewerk de gegevens, prijzen en wie deze behandeling uitvoert.",
  deleteTitle: (name) => `“${name}” verwijderen?`,
  deleteText:
    "Ze verdwijnt van je boekingspagina. Eerdere en geplande afspraken behouden hun gegevens. Wil je ze tijdelijk verbergen? Zet ze dan op inactief.",
  deleteConfirm: "Behandeling verwijderen",
  newDescription: "Voeg een behandeling toe die klanten kunnen boeken.",
  form: {
    details: "Gegevens van de behandeling",
    detailsText: "Klanten zien de naam, beschrijving, duur en prijs wanneer ze boeken.",
    namePlaceholder: "bv. Balayage",
    noCategory: "Geen categorie",
    newCategory: "Nieuwe categorie",
    newCategoryHint: "bv. Kleuren, Knippen, Nagels",
    createCategory: "Een nieuwe categorie aanmaken",
    chooseCategory: "Een bestaande categorie kiezen",
    descriptionHint: "Optioneel. Leg uit wat inbegrepen is.",
    promo: "Actieprijs",
    buffer: "Buffer achteraf",
    bufferHint: "Tijd om op te ruimen of voor te bereiden.",
    activeHint:
      "Inactieve behandelingen kunnen niet geboekt worden maar blijven in je geschiedenis.",
    online: "Online boekbaar",
    onlineHint: "Toon deze behandeling op je publieke boekingspagina.",
    who: "Wie voert deze behandeling uit?",
    whoText:
      "Alleen deze medewerkers kunnen ervoor geboekt worden. Stel eigen prijzen in op elk medewerkersprofiel.",
    noStaffYet: "Je hebt nog geen medewerkers toegevoegd.",
    addStaff: "Voeg een medewerker toe",
    toMakeBookable: "om deze behandeling boekbaar te maken.",
    create: "Behandeling aanmaken",
  },
  errors: {
    manage: "Je hebt geen toestemming om behandelingen te beheren.",
    gone: "Deze behandeling bestaat niet meer.",
    staffSync:
      "De behandeling is opgeslagen, maar de toegewezen medewerkers konden niet bijgewerkt worden.",
  },
};
