import type { help as en } from "../en/help";

export const help: typeof en = {
  title: "Centre d'aide",
  eyebrow: "Cours & réponses",
  lead: "Des cours courts et pratiques, avec captures d'écran, qui montrent comment fonctionne chaque partie de NORYX.",
  searchLabel: "Rechercher dans le centre d'aide",
  searchPlaceholder: "Recherchez, p. ex. « annuler », « heures d'ouverture » ou « inviter »",
  noResults: "Aucun cours ne correspond à votre recherche. Essayez un autre mot.",
  courses: "Cours",
  steps: (count) => `${count} ${count === 1 ? "étape" : "étapes"}`,
  minutes: (count) => `${count} min`,
  audience: { owner: "Pour les propriétaires", team: "Pour votre équipe", everyone: "Pour tous" },
  faq: "Questions fréquentes",
  courseFaq: "Questions sur ce cours",
  contents: "Dans ce cours",
  step: (number) => `Étape ${number}`,
  tip: "Astuce",
  next: "Cours suivant",
  all: "Tous les cours",
  start: "Commencer le cours",
  screenshotNote: "Les captures d'écran montrent le salon de démonstration NORYX.",
};
