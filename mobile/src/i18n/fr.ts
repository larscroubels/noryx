import type { en } from "./en";

export const fr: typeof en = {
  common: {
    retry: "Réessayer",
    close: "Fermer",
    loading: "Chargement…",
    loadFailed: "Nous n'avons pas pu charger ceci. Vérifiez votre connexion et réessayez.",
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
};
