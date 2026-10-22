import type { settings as en } from "../en/settings";

export const settings: typeof en = {
  metaTitle: "Paramètres",
  bookingPage: (url) => `Page de réservation : ${url}`,
  sectionsLabel: "Sections des paramètres",
  noPermission: "Vous n'avez pas l'autorisation de modifier les paramètres de l'établissement.",
  sections: {
    profile: "Profil de l'établissement",
    branding: "Identité visuelle",
    location: "Lieu",
    hours: "Heures d'ouverture",
    booking: "Réservation en ligne",
    shop: "Boutique en ligne",
    plan: "Abonnement",
  },
  profile: {
    description: "Comment votre établissement apparaît à vos clients.",
    about: "À propos de votre établissement",
    aboutHint: "Une courte présentation affichée sur votre page de réservation.",
    publicEmail: "E-mail public",
    publicPhone: "Téléphone public",
    website: "Site web",
    instagram: "Instagram",
    accent: "Couleur d'accent de votre page de réservation",
    accentHint: "Utilisée pour de petits accents ; le texte reste toujours lisible.",
    pickAccent: "Choisir la couleur d'accent",
    timeZone: "Fuseau horaire",
    language: "Langue du salon",
    languageHint:
      "L'espace de travail de votre équipe utilise cette langue. Vos clients voient votre page de réservation dans cette langue par défaut et peuvent passer au néerlandais, au français ou à l'anglais.",
    submit: "Enregistrer le profil",
    saved: "Profil de l'établissement enregistré.",
  },
  branding: {
    description:
      "Votre logo et votre photo de couverture apparaissent sur votre page de réservation publique et votre boutique.",
    logo: "Logo",
    cover: "Image de couverture",
    logoPreview: "Aperçu du logo",
    coverPreview: "Aperçu de l'image de couverture",
    noLogo: "Aucun logo",
    noCover: "Aucune image de couverture",
    uploadLogo: "Importer le logo",
    uploadCover: "Importer l'image de couverture",
    hint: "PNG, JPG ou WebP, 2 Mo maximum.",
    upload: "Importer",
    chooseImage: "Choisissez une image à importer.",
    chooseImageField: "Choisissez une image.",
    tooLarge: "Les images ne peuvent pas dépasser 2 Mo.",
    tooLargeField: "Cette image dépasse 2 Mo.",
    wrongType: "Utilisez une image PNG, JPG ou WebP.",
    wrongTypeField: "Ce fichier n'est pas une image PNG, JPG ou WebP.",
    uploadFailed: "L'image n'a pas pu être importée. Veuillez réessayer.",
    logoUpdated: "Logo mis à jour.",
    coverUpdated: "Image de couverture mise à jour.",
    proOnly:
      "Votre propre logo, photo de couverture et couleur d'accent sur votre page de réservation font partie de Pro.",
  },
  location: {
    description: "L'endroit où vos clients viennent pour leur rendez-vous.",
    submit: "Enregistrer le lieu",
    saved: "Lieu enregistré.",
  },
  hours: {
    description:
      "Les réservations en ligne sont limitées à ces heures et au planning de chaque collaborateur.",
    submit: "Enregistrer les heures d'ouverture",
    saved: "Heures d'ouverture enregistrées.",
  },
  policy: {
    description: "Règles applicables à chaque réservation effectuée sur votre page publique.",
    live: "La page de réservation en ligne est active",
    liveHint:
      "Lorsqu'elle est désactivée, votre page publique est masquée et aucune nouvelle réservation en ligne n'est possible.",
    minNotice: "Délai minimum",
    minNoticeHint: "Combien de temps à l'avance les clients doivent réserver.",
    noticeOptions: [
      [0, "Aucun minimum"],
      [60, "1 heure"],
      [120, "2 heures"],
      [240, "4 heures"],
      [720, "12 heures"],
      [1440, "1 jour"],
      [2880, "2 jours"],
    ],
    horizon: "Horizon de réservation",
    horizonHint: "Jusqu'à quand dans le futur les clients peuvent réserver.",
    days: "jours",
    interval: "Heures de début toutes les",
    minutes: (count) => `${count} minutes`,
    buffer: "Temps tampon entre les rendez-vous",
    bufferHint:
      "S'applique à chaque réservation ; le temps tampon propre à une prestation prévaut s'il est plus long.",
    cancellationNotice: "Annulation gratuite jusqu'à",
    cancellationHint: "Affiché aux clients comme votre politique d'annulation.",
    hoursBefore: "heures avant",
    staffChoice: "Laisser les clients choisir leur collaborateur",
    staffChoiceHint:
      "Lorsque cette option est désactivée, NORYX attribue le premier collaborateur disponible.",
    approval: "Valider manuellement les réservations en ligne",
    approvalHint:
      "Les nouvelles réservations restent en attente jusqu'à votre confirmation. Le créneau est bloqué en attendant.",
    paymentsNote:
      "Les paiements en ligne et les acomptes ne sont pas encore disponibles — ils nécessiteront la connexion d'un prestataire de paiement.",
    submit: "Enregistrer les paramètres de réservation",
    saved: "Paramètres de réservation enregistrés.",
  },
  shop: {
    description: "Click & collect : réservez en ligne, payez et retirez au salon.",
    live: "La boutique en ligne est active",
    liveHint: (count) =>
      `Les clients peuvent réserver des produits à retirer et payer au salon. ${count} ${count === 1 ? "produit est proposé" : "produits sont proposés"} à la vente en ligne.`,
    submit: "Enregistrer les paramètres de la boutique",
    saved: "Paramètres de la boutique enregistrés.",
  },
  plan: {
    status: {
      trialing: "Essai",
      active: "Actif",
      past_due: "Paiement en retard",
      cancelled: "Résilié",
    },
    included: " (inclus)",
    notIncluded: " (non inclus)",
    customers: (limit) => `Clients : ${limit}`,
    unlimited: "illimité",
    trialRunning: (days, date) =>
      `Votre essai gratuit de Pro dure encore ${days} ${days === 1 ? "jour" : "jours"}, jusqu'au ${date}.`,
    trialEnded: "Votre essai Pro est terminé. Votre établissement continue désormais avec Basic.",
    afterTrial:
      "Après l'essai, vous choisissez Basic ou Pro. Si vous ne choisissez pas, votre établissement continue avec Basic.",
    comparePlans: "Comparer Basic et Pro",
    billingConnected: "La facturation est gérée par votre prestataire de paiement.",
    billingNotConnected:
      "La facturation n'est pas encore connectée : vous n'êtes donc pas facturé. Les prix seront annoncés au préalable ; d'ici là, l'équipe NORYX modifie les abonnements sur demande.",
  },
};
