import type { team as en } from "../en/team";

export const team: typeof en = {
  title: "Équipe",
  description: "Qui peut se connecter à votre espace, et ce que chacun peut faire.",
  members: "Membres",
  membersText:
    "Le chiffre d'affaires et les paramètres restent privés, sauf si vous en donnez l'accès.",
  member: "Membre",
  role: "Rôle",
  staffProfile: "Profil de collaborateur",
  you: "(vous)",
  customAccess: "Accès personnalisé",
  linked: "Lié",
  remove: (name) => `Retirer ${name}`,
  removeTitle: (name) => `Retirer ${name} ?`,
  removeText:
    "Cette personne ne pourra plus se connecter à cet espace. Son profil de collaborateur et son historique de rendez-vous sont conservés.",
  removeConfirm: "Retirer l'accès",
  invite: "Inviter quelqu'un",
  inviteText:
    "La personne crée un identifiant (ou utilise celui qu'elle a déjà) et rejoint l'équipe avec le rôle que vous choisissez.",
  pending: "Invitations en attente",
  noPending: "Aucune invitation en cours.",
  staffProfileLower: "profil de collaborateur",
  expires: (date) => `expire le ${date}`,
  revoke: (email) => `Révoquer l'invitation de ${email}`,
  form: {
    ready: "Invitation prête",
    link: "Lien d'invitation",
    email: "Adresse e-mail",
    linkStaff: "Lier à un profil de collaborateur",
    linkStaffHint: "La personne verra l'agenda et les clients de ce collaborateur comme les siens.",
    noStaff: "Aucun profil de collaborateur",
    create: "Créer l'invitation",
    access: "Accès",
    accessFor: (name) => `Accès de ${name}`,
    accessText: "Choisissez un rôle, puis affinez les droits individuels.",
    ownersAll: "Les propriétaires disposent toujours de tous les droits.",
    permissions: "Droits",
    inRole: "Inclus dans ce rôle",
    permissionsPro:
      "Les droits personnalisés par membre de l'équipe font partie de Pro. Avec Basic, chacun reçoit les droits par défaut de son rôle.",
    save: "Enregistrer l'accès",
  },
  permissions: {
    "settings.manage":
      "Modifier le profil de l'établissement, l'identité visuelle, les lieux, les heures d'ouverture et les règles de réservation",
    "members.manage": "Inviter des membres de l'équipe et modifier leurs rôles et droits",
    "staff.manage": "Gérer tous les profils de collaborateurs, plannings et absences",
    "schedule.manage_own": "Gérer vos propres heures de travail et absences",
    "services.manage": "Créer et modifier les prestations, catégories et prix",
    "appointments.view_all": "Voir tous les rendez-vous de l'établissement",
    "appointments.view_own": "Voir les rendez-vous qui vous sont attribués",
    "appointments.manage_all": "Créer, déplacer et modifier n'importe quel rendez-vous",
    "appointments.manage_own": "Modifier les rendez-vous qui vous sont attribués",
    "customers.view": "Voir toutes les fiches clients",
    "customers.manage": "Créer, modifier, exporter et supprimer des fiches clients",
    "customers.notes": "Lire et rédiger des notes clients privées",
    "products.manage": "Gérer les produits de revente",
    "inventory.manage": "Ajuster les niveaux de stock",
    "orders.manage": "Voir et traiter les commandes de la boutique en ligne",
    "finance.view": "Voir le chiffre d'affaires, les dépenses et les synthèses financières",
    "finance.manage": "Enregistrer des dépenses et des transactions financières",
    "gift_cards.manage": "Vendre, activer, bloquer et corriger des chèques-cadeaux",
    "reports.view": "Voir les rapports de l'établissement",
    "billing.manage": "Gérer l'abonnement NORYX et les données de facturation",
    "audit.view": "Voir le journal d'audit de l'établissement",
  },
  invited: (email) =>
    `Invitation créée pour ${email}. L'envoi d'e-mails n'est pas encore configuré : partagez vous-même ce lien. Il expire dans 7 jours.`,
  accessUpdated: "Accès mis à jour.",
  errors: {
    invite: "Vous n'avez pas l'autorisation d'inviter des membres de l'équipe.",
    inviteFailed: "L'invitation n'a pas pu être créée.",
    change: "Vous n'avez pas l'autorisation de modifier des membres de l'équipe.",
    chooseRole: "Choisissez un rôle.",
    saveFailed: "Les modifications n'ont pas pu être enregistrées.",
    rpc: {
      already_member: "Cette personne fait déjà partie de votre équipe.",
      staff_already_linked: "Ce profil de collaborateur est déjà lié à un autre identifiant.",
      "You do not have permission to invite team members":
        "Vous n'avez pas l'autorisation d'inviter des membres de l'équipe.",
      "Only owners can invite another owner":
        "Seuls les propriétaires peuvent inviter un autre propriétaire.",
      "You do not have permission to change this member":
        "Vous n'avez pas l'autorisation de modifier ce membre.",
      "You cannot change your own role or permissions":
        "Vous ne pouvez pas modifier votre propre rôle ni vos propres droits.",
      "Only owners can change owners":
        "Seuls les propriétaires peuvent modifier des propriétaires.",
      "You can only grant permissions you have yourself":
        "Vous ne pouvez accorder que les droits dont vous disposez vous-même.",
    },
  },
  invitePage: {
    metaTitle: "Invitation d'équipe",
    notFound: "Invitation introuvable",
    notFoundText:
      "Vérifiez que vous avez copié le lien complet, ou demandez une nouvelle invitation.",
    used: "Invitation déjà utilisée",
    expired: "Invitation expirée",
    askNew: (business) =>
      `Demandez au propriétaire de ${business} de vous envoyer une nouvelle invitation.`,
    eyebrow: "Invitation d'équipe",
    join: (business) => `Rejoindre ${business}`,
    invitedAs: "Vous avez été invité en tant que",
    using: "avec",
    wrongUser: (current, invited) =>
      `Vous êtes connecté en tant que ${current}. Déconnectez-vous et connectez-vous avec ${invited} pour accepter.`,
    create: "Créer votre compte",
    haveAccount: "J'ai déjà un compte",
    accept: "Accepter l'invitation",
    failed: "Nous n'avons pas pu accepter cette invitation.",
    rpc: {
      invitation_invalid: "Cette invitation a déjà été utilisée ou a été retirée.",
      invitation_expired: "Cette invitation a expiré. Demandez-en une nouvelle.",
      plan_limit_members:
        "Cette équipe a atteint le nombre d'accès inclus dans son abonnement. Demandez au propriétaire de contacter NORYX.",
      invitation_email_mismatch:
        "Cette invitation a été envoyée à une autre adresse e-mail. Connectez-vous avec cette adresse pour l'accepter.",
    },
  },
};
