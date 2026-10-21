import type { help as en } from "../en/help";

export const help: typeof en = {
  title: "Hulpcentrum",
  eyebrow: "Cursussen & antwoorden",
  lead: "Korte, praktische cursussen met screenshots die tonen hoe elk onderdeel van NORYX werkt.",
  searchLabel: "Zoeken in het hulpcentrum",
  searchPlaceholder: "Zoek, bv. “annuleren”, “openingsuren” of “uitnodigen”",
  noResults: "Geen cursussen gevonden. Probeer een ander woord.",
  courses: "Cursussen",
  steps: (count) => `${count} ${count === 1 ? "stap" : "stappen"}`,
  minutes: (count) => `${count} min`,
  audience: { owner: "Voor eigenaars", team: "Voor je team", everyone: "Voor iedereen" },
  faq: "Veelgestelde vragen",
  courseFaq: "Vragen over deze cursus",
  contents: "In deze cursus",
  step: (number) => `Stap ${number}`,
  tip: "Tip",
  next: "Volgende cursus",
  all: "Alle cursussen",
  start: "Start de cursus",
  screenshotNote: "De screenshots tonen de demosalon van NORYX.",
};
