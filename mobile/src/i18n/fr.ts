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
};
