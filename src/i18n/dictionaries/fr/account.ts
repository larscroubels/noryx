import type { account as en } from "../en/account";

export const account: typeof en = {
  metaTitle: "Compte",
  title: "Paramètres du compte",
  description:
    "Vos données de connexion personnelles. Elles sont distinctes des paramètres de votre établissement.",
  profile: "Profil",
  email: "E-mail",
  password: "Mot de passe",
  workspaces: "Vos espaces",
  workspacesText: "Les établissements auxquels vous avez accès.",
  yourName: "Votre nom",
  emailHint: "Nous vous demanderons de confirmer la nouvelle adresse.",
  changeEmail: "Modifier l'e-mail",
  changePassword: "Modifier le mot de passe",
  nameFailed: "Nous n'avons pas pu enregistrer votre nom. Veuillez réessayer.",
  nameUpdated: "Votre nom a été mis à jour.",
  emailInUse: "Cette adresse e-mail est déjà utilisée.",
  emailFailed: "Nous n'avons pas pu lancer la modification de l'e-mail.",
  emailSent:
    "Consultez votre ancienne et votre nouvelle boîte de réception pour confirmer la modification.",
  reauth:
    "Pour votre sécurité, déconnectez-vous puis reconnectez-vous avant de modifier votre mot de passe.",
  samePassword: "Choisissez un mot de passe différent de votre mot de passe actuel.",
  passwordFailed: "Nous n'avons pas pu modifier votre mot de passe. Veuillez réessayer.",
  passwordChanged: "Votre mot de passe a été modifié.",
};
