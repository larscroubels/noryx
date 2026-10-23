import type { auth as en } from "../en/auth";

export const auth: typeof en = {
  panelTitleStart: "Votre salon,",
  panelTitleEmphasis: "joliment organisé",
  panelText:
    "Rendez-vous, collaborateurs, clients et réservation en ligne — réunis dans un espace de travail serein et élégant.",
  notConfiguredTitle: "L'authentification n'est pas configurée",
  notConfiguredText:
    "Ajoutez les variables Supabase de .env.example dans .env.local pour activer la connexion.",
  fields: {
    email: "E-mail",
    workEmail: "E-mail professionnel",
    password: "Mot de passe",
    yourName: "Votre nom",
    newPassword: "Nouveau mot de passe",
    confirmPassword: "Confirmez le nouveau mot de passe",
  },
  passwordHint: "Au moins 10 caractères, dont une lettre et un chiffre.",
  login: {
    metaTitle: "Se connecter",
    title: "Bon retour parmi nous",
    lead: "Connectez-vous à votre espace NORYX.",
    confirmedSignIn: "Votre adresse e-mail est confirmée. Connectez-vous pour continuer.",
    linkExpired:
      "Ce lien a expiré ou a déjà été utilisé. Connectez-vous ou demandez un nouveau lien.",
    forgot: "Mot de passe oublié ?",
    submit: "Se connecter",
    newHere: "Nouveau sur NORYX ?",
    createAccount: "Créer un compte",
  },
  signup: {
    metaTitle: "Créer votre compte",
    title: "Créez votre compte NORYX",
    lead: "Essayez NORYX Pro gratuitement pendant 14 jours. Aucune donnée de paiement requise.",
    terms: "J'accepte les conditions d'utilisation et la politique de confidentialité",
    termsHint: "Nous utilisons vos données uniquement pour gérer votre compte NORYX.",
    submit: "Créer le compte",
    haveAccount: "Vous avez déjà un compte ?",
    signIn: "Se connecter",
    checkInbox: "Consultez votre boîte de réception",
    noEmail: "Rien reçu ? Vérifiez vos courriers indésirables, ou",
    tryAgain: "réessayez",
  },
  forgot: {
    metaTitle: "Réinitialiser votre mot de passe",
    title: "Réinitialisez votre mot de passe",
    lead: "Saisissez votre e-mail et nous vous enverrons un lien pour choisir un nouveau mot de passe.",
    submit: "Envoyer le lien",
    remembered: "Vous vous en souvenez ?",
    backToSignIn: "Retour à la connexion",
    checkInbox: "Consultez votre boîte de réception",
  },
  reset: {
    metaTitle: "Choisir un nouveau mot de passe",
    title: "Choisissez un nouveau mot de passe",
    signedInAs: (email) =>
      `Connecté en tant que ${email}. Choisissez un mot de passe que vous n'utilisez nulle part ailleurs.`,
    invalidTitle: "Ce lien de réinitialisation n'est plus valide",
    invalidText:
      "Les liens de réinitialisation expirent après une heure et ne peuvent être utilisés qu'une seule fois.",
    requestNew: "Demander un nouveau lien",
    submit: "Mettre à jour le mot de passe",
  },
  messages: {
    confirmFirst:
      "Confirmez d'abord votre adresse e-mail — consultez votre boîte de réception pour trouver le lien envoyé.",
    wrongCredentials: "Cette combinaison d'e-mail et de mot de passe est incorrecte.",
    weakPassword: "Choisissez un mot de passe plus robuste.",
    emailNotAllowed: "Nous ne pouvons pas envoyer d'e-mail de confirmation à cette adresse pour le moment. Réessayez plus tard ou contactez l'équipe NORYX.",
    emailRateLimit:
      "Nous venons de vous envoyer un e-mail. Patientez une minute avant de réessayer.",
    signupFailed: "Nous n'avons pas pu créer votre compte. Veuillez réessayer.",
    confirmationSent: (email) =>
      `Nous avons envoyé un lien de confirmation à ${email}. Ouvrez-le pour activer votre compte.`,
    resetSent:
      "Si un compte existe pour cet e-mail, nous avons envoyé un lien pour réinitialiser le mot de passe.",
    resetExpired: "Votre lien de réinitialisation a expiré. Veuillez en demander un nouveau.",
    samePassword: "Choisissez un mot de passe différent de votre mot de passe actuel.",
    updateFailed:
      "Nous n'avons pas pu mettre à jour votre mot de passe. Veuillez demander un nouveau lien de réinitialisation.",
  },
};
