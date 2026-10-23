import type { app as en } from "../en/app";

export const app: typeof en = {
  metaTitle: "Espace de travail",
  account: "Compte",
  nav: {
    time: "Pointeuse",
    overview: "Aperçu",
    calendar: "Agenda",
    customers: "Clients",
    services: "Prestations",
    staff: "Collaborateurs",
    schedule: "Mon planning",
    products: "Produits",
    orders: "Commandes",
    finance: "Finances",
    giftCards: "Chèques-cadeaux",
    team: "Équipe",
    settings: "Paramètres",
    help: "Aide",
  },
  viewBookingPage: "Voir la page de réservation",
  bookingPage: "Page de réservation",
  readOnlyTitle: "Cet établissement est actuellement en lecture seule",
  readOnlyText: (suspended) =>
    `L'équipe NORYX a ${suspended ? "suspendu" : "fermé"} ce compte. Vous pouvez toujours consulter et exporter vos données. Contactez le support si vous pensez qu'il s'agit d'une erreur.`,
  trial: {
    running: (days) =>
      `Vous essayez NORYX Pro gratuitement — encore ${days} ${days === 1 ? "jour" : "jours"}.`,
    ended:
      "Votre essai Pro est terminé. Votre établissement continue avec Basic : le système de réservation jusqu'à 250 clients.",
    plans: "Comparer les abonnements",
  },
  overview: {
    greeting: { morning: "Bonjour", afternoon: "Bon après-midi", evening: "Bonsoir" },
    lead: (name) => `Voici ce qui se passe aujourd'hui chez ${name}.`,
    newAppointment: "Nouveau rendez-vous",
    welcomeTitle: "Votre établissement est configuré",
    welcomeText:
      "Bienvenue sur NORYX. Terminez les étapes restantes ci-dessous quand vous le souhaitez.",
    passwordUpdated: "Votre mot de passe a été mis à jour.",
    keyFigures: "Chiffres clés",
    today: "Rendez-vous aujourd'hui",
    week: "Réservés cette semaine",
    cancelledHint: (count) => `${count} annulé(s) ou absent(s)`,
    value: "Valeur réservée cette semaine",
    valueHint: "Estimation basée sur les prix réservés, pas sur les paiements",
    awaiting: "En attente de confirmation",
    newCustomers: "Nouveaux clients (30 jours)",
    schedule: "Programme du jour",
    appointments: (count) => (count === 1 ? "1 rendez-vous" : `${count} rendez-vous`),
    openCalendar: "Ouvrir l'agenda",
    emptyTitle: "Aucun rendez-vous aujourd'hui",
    emptyOnline: "Les nouvelles réservations en ligne apparaîtront ici automatiquement.",
    emptyOffline:
      "Publiez votre page de réservation pour que vos clients puissent réserver en ligne, ou ajoutez vous-même un rendez-vous.",
    addAppointment: "Ajouter un rendez-vous",
    customer: "Client",
    pending: (count) =>
      count === 1
        ? "1 réservation attend votre validation"
        : `${count} réservations attendent votre validation`,
    review: "Examiner les demandes",
    orders: (count) =>
      count === 1 ? "1 commande en ligne à préparer" : `${count} commandes en ligne à préparer`,
    viewOrders: "Voir les commandes",
    lowStock: "Stock faible",
    lowStockText: (count) =>
      count === 1 ? "1 produit à réapprovisionner" : `${count} produits à réapprovisionner`,
    left: (count) => `${count} restant(s)`,
    finish: "Terminer la configuration",
    finishProgress: (done, total) => `${done} sur ${total} terminé(s)`,
    checklist: {
      hours: "Définissez vos heures d'ouverture",
      services: "Ajoutez vos prestations et vos prix",
      staff: "Attribuez des heures de travail à au moins un collaborateur",
      publish: "Publiez votre page de réservation en ligne",
    },
    done: "(terminé)",
    todo: "(à faire)",
    yourPage: "Votre page de réservation",
    shareText: "Partagez ce lien sur Instagram, Google ou votre site web.",
    customerLimit: (count, limit) =>
      `${count} des ${limit} clients inclus dans Basic sont utilisés.`,
    customerLimitText: "Pro n'a pas de limite de clients.",
  },
};
