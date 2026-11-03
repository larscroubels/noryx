import type { en } from "./en";

export const fr: typeof en = {
  common: {
    retry: "Réessayer",
    close: "Fermer",
    loading: "Chargement…",
    loadFailed: "Nous n'avons pas pu charger ceci. Vérifiez votre connexion et réessayez.",
    signOut: "Se déconnecter",
  },
  tabs: {
    today: "Aujourd'hui",
    calendar: "Agenda",
    clients: "Clients",
    clock: "Pointage",
    more: "Plus",
  },
  language: {
    title: "Langue",
    salon: "Langue du salon",
  },
  auth: {
    signUpLead:
      "Un seul compte pour réserver dans vos salons, et pour votre travail si vous faites partie de l'équipe d'un salon.",
    sessionEnded: "Vous avez été déconnecté. Veuillez vous reconnecter.",
    notConfigured: "Cette version de l'app n'est pas encore connectée à NORYX.",
    termsLabel: "J'accepte les conditions générales et la politique de confidentialité",
    readTerms: "Lire les conditions",
    readPrivacy: "Lire la politique de confidentialité",
  },
  side: {
    pickTitle: "Par où voulez-vous commencer ?",
    pickLead:
      "Vous travaillez dans un salon et vous êtes aussi client. Vous pouvez changer à tout moment dans votre profil.",
    salon: "Mon travail au salon",
    client: "Mes rendez-vous en tant que client",
    switchToSalon: "Passer à mon travail au salon",
    switchToClient: "Passer à mon espace client",
  },
  clientSoon: {
    title: "La réservation dans l'app arrive bientôt",
    text: "Bientôt, vous lierez ici vos salons avec leur code et réserverez en quelques gestes. D'ici là, réservez via la page de réservation de votre salon.",
    runSalon: "Vous avez un salon ? Configurez-le sur noryx",
  },
  profile: {
    title: "Profil",
    open: "Ouvrir votre profil",
    deviceLanguage: "Langue du téléphone",
    business: "Établissement",
    deleted: "Votre compte a été supprimé.",
  },
  more: {
    lead: "Ces parties de votre espace s'ouvrent sur le site NORYX, déjà connecté.",
    failed:
      "Nous n'avons pas pu ouvrir cette page en étant connecté. Vérifiez votre connexion et réessayez.",
  },
  client: {
    onboarding: {
      welcomeTitle: "Bienvenue sur NORYX",
      welcomeText: "Liez les salons où vous allez et réservez en quelques gestes.",
      start: "Commencer",
      servicesTitle: "Quels services utilisez-vous ?",
      servicesText: "Choisissez-en un ou plusieurs. Vous pourrez modifier cela plus tard.",
      next: "Suivant",
      codesTitle: "Saisissez les codes de vos salons",
      codesText:
        "Demandez son code NORYX à chaque salon. Un salon propose plusieurs services ? Utilisez le même code.",
      codeLabel: (category: string) => `Code pour ${category}`,
      link: "Lier les salons",
      linked: (name: string) => `Lié : ${name}`,
      resend: "Renvoyer l'e-mail de confirmation",
      resent: "Nous avons renvoyé l'e-mail de confirmation. Ouvrez-le, puis liez vos salons ici.",
      resendFailed: "Nous n'avons pas pu envoyer l'e-mail. Réessayez dans une minute.",
      done: "Commencer à réserver",
    },
    linkErrors: {
      too_many_attempts: "Trop de codes essayés. Attendez 15 minutes et réessayez.",
      connection_code_invalid:
        "Nous ne reconnaissons pas ce code. Vérifiez-le auprès de votre salon.",
      categories_required: "Choisissez au moins un service pour ce salon.",
      customer_already_linked:
        "Votre fiche client dans ce salon est déjà liée à un autre compte. Contactez le salon.",
      client_link_required: "Liez à nouveau ce salon avec son code avant de réserver.",
    },
  },
};
