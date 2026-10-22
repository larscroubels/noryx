import type { staff as en } from "../en/staff";

export const staff: typeof en = {
  metaTitle: "Collaborateurs",
  description: "Vos collaborateurs, leurs plannings et les prestations qu'ils réalisent.",
  add: "Ajouter un collaborateur",
  emptyTitle: "Aucun collaborateur pour l'instant",
  emptyText:
    "Ajoutez les personnes qui prennent des rendez-vous. Chacune a ses propres heures de travail et prestations.",
  emptyAction: "Ajouter un collaborateur",
  professional: "Collaborateur",
  notBookable: "Non réservable en ligne",
  hasLogin: "A un accès",
  services: "Prestations",
  worksOn: "Jours de travail",
  noHours: "Aucun horaire défini",
  newTitle: "Ajouter un collaborateur",
  newDescription:
    "Il démarre avec vos heures d'ouverture — ajustez son planning à l'écran suivant.",
  created: "Collaborateur ajouté",
  createdText: "Vérifiez ses heures de travail et choisissez les prestations qu'il réalise.",
  profile: "Profil",
  profileDescription: "Le nom, la fonction et la bio apparaissent sur votre page de réservation.",
  servicesDescription: (name) =>
    `Choisissez ce que réalise ${name}, avec des prix et des durées personnalisés si besoin.`,
  form: {
    displayName: "Nom affiché aux clients",
    jobTitlePlaceholder: "p. ex. Coloriste",
    bio: "Courte bio",
    bioHint: "Affichée sur votre page de réservation.",
    privateHint: "Privé — jamais affiché aux clients.",
    bookable: "Réservable en ligne",
    bookableHint: "Les clients peuvent choisir ce collaborateur sur la page de réservation.",
    activeHint:
      "Désactivez les membres de l'équipe qui sont partis ; leur historique de rendez-vous est conservé.",
    saveProfile: "Enregistrer le profil",
  },
  servicesForm: {
    none: "Aucune prestation pour l'instant.",
    create: "Créez d'abord une prestation",
    first: "",
    defaultsHint:
      "Laissez le prix ou la durée vide pour utiliser la valeur par défaut de la prestation.",
    ownPrice: "Prix personnalisé",
    ownDuration: "Durée personnalisée",
    submit: "Enregistrer les prestations",
    check: "Vérifiez les valeurs personnalisées signalées.",
    saved: "Prestations enregistrées.",
  },
  hours: {
    title: "Heures de travail",
    description:
      "Les clients ne peuvent réserver que pendant ces heures. Ajoutez une pause pour scinder une journée.",
    submit: "Enregistrer les heures de travail",
    check: "Vérifiez les heures de travail.",
    saved: "Heures de travail enregistrées. Les disponibilités en ligne sont mises à jour.",
  },
  timeOff: {
    title: "Absences",
    description:
      "Les congés, jours de maladie et pauses ponctuelles bloquent la réservation en ligne pendant cette période.",
    remove: "Supprimer l'absence",
    none: "Aucune absence prévue.",
    from: "Du",
    until: "Au",
    startTime: "Heure de début",
    endTime: "Heure de fin",
    type: "Type",
    note: "Note",
    notePlaceholder: "Visible uniquement par votre équipe",
    submit: "Ajouter une absence",
    added: "Absence ajoutée. Ces heures ne sont plus réservables.",
    kinds: {
      holiday: "Congé",
      sick: "Maladie",
      break: "Pause",
      training: "Formation",
      other: "Autre",
    },
  },
  mySchedule: {
    title: "Mon planning",
    description:
      "Vos heures de travail et vos absences. Les modifications mettent immédiatement à jour les disponibilités en ligne.",
    noProfile: "Aucun profil de collaborateur lié",
    noProfileText:
      "Demandez au propriétaire du salon de lier votre compte à votre profil de collaborateur pour gérer vos horaires.",
  },
  errors: {
    manage: "Vous n'avez pas l'autorisation de gérer les collaborateurs.",
    schedule: "Vous n'avez pas l'autorisation de modifier ce planning.",
    services: "Vous n'avez pas l'autorisation de modifier les prestations attribuées.",
  },
  profileSaved: "Profil enregistré.",
};
