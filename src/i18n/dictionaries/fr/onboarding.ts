import type { onboarding as en } from "../en/onboarding";

export const onboarding: typeof en = {
  metaTitle: "Configurer votre établissement",
  stepOf: (step, total) => `Étape ${step} sur ${total}`,
  progress: "Progression de la configuration",
  welcome: "Bienvenue sur NORYX",
  steps: [
    {
      title: "Parlez-nous de votre établissement",
      description: "Cela prend environ trois minutes. Tout peut être modifié par la suite.",
    },
    {
      title: "Où vos clients peuvent-ils vous trouver ?",
      description: "Votre adresse et vos coordonnées figurent sur votre page de réservation.",
    },
    {
      title: "Quand êtes-vous ouvert ?",
      description: "Les clients ne peuvent réserver que pendant vos heures d'ouverture.",
    },
    {
      title: "Ajoutez vos premières prestations",
      description:
        "Commencez par quelques soins populaires — vous pourrez ajouter les autres plus tard.",
    },
    {
      title: "Qui prend les rendez-vous ?",
      description:
        "Ajoutez-vous comme collaborateur, ou passez cette étape si vous gérez uniquement le salon.",
    },
    {
      title: "Prêt à accueillir vos clients",
      description:
        "Publiez votre page de réservation maintenant, ou gardez-la privée le temps de terminer la configuration.",
    },
  ],
  saveContinue: "Enregistrer et continuer",
  skip: "Passer pour l'instant",
  business: {
    name: "Nom de l'établissement",
    type: "Type d'établissement",
    chooseOne: "Faites un choix",
    address: "Adresse de la page de réservation",
    addressHint:
      "Vos clients utilisent ce lien pour réserver en ligne. Vous pourrez publier la page à la fin.",
    submit: "Créer mon établissement",
    slugTaken: "Cette adresse est déjà prise.",
    chooseAnother: "Choisissez une autre adresse de réservation.",
    maxBusinesses: "Vous avez atteint le nombre maximal d'établissements pour un compte.",
  },
  location: {
    name: "Nom du lieu",
    nameHint: "Affiché aux clients, p. ex. le nom de votre salon ou de votre quartier.",
    email: "E-mail de contact",
    emailHint: "Reçoit les notifications de nouvelles réservations.",
  },
  hours: { check: "Vérifiez les heures d'ouverture." },
  services: {
    already: "Vous avez déjà ajouté des prestations. Ajoutez-en d'autres ici ou continuez.",
    name: "Nom de la prestation",
    placeholder: "p. ex. Manucure gel",
    examples: ["Coupe & brushing femme", "Coupe homme"],
    check: "Vérifiez les prestations signalées.",
  },
  team: {
    question: "Prenez-vous vous-même des rendez-vous ?",
    yes: "Oui, les clients peuvent prendre rendez-vous avec moi",
    yesHint:
      "Nous créerons votre profil de collaborateur avec les heures d'ouverture et les prestations que vous venez d'ajouter.",
    no: "Non, je gère uniquement l'établissement",
    noHint: "Vous pouvez ajouter votre équipe depuis la page Collaborateurs.",
    displayName: "Nom affiché aux clients",
    jobTitlePlaceholder: "p. ex. Coiffeuse senior",
    checkDetails: "Vérifiez vos informations.",
  },
  publish: {
    label: "Publier ma page de réservation en ligne",
    before: "Les clients peuvent réserver sur",
    after: ". Vous pouvez désactiver cela à tout moment dans les Paramètres.",
    submit: "Aller à mon tableau de bord",
  },
};
