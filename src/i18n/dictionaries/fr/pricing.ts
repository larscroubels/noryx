import type { pricing as en } from "../en/pricing";

export const pricing: typeof en = {
  metaTitle: "Tarifs",
  metaDescription:
    "NORYX Basic et Pro. Essayez Pro gratuitement pendant 14 jours — aucune donnée de paiement requise.",
  eyebrow: "Tarifs",
  title: "Deux abonnements. Commencez par 14 jours de Pro, gratuitement.",
  lead: "Essayez toutes les fonctionnalités Pro pendant deux semaines. Aucune donnée de paiement requise — ensuite, vous choisissez l'abonnement qui convient à votre salon.",
  priceSoon: "Prix bientôt disponible",
  priceNote: "Les prix seront annoncés avant le lancement.",
  trialBadge: "14 jours gratuits",
  cta: "Démarrer votre essai gratuit",
  plans: {
    basic: {
      name: "Basic",
      tagline: "Le système de réservation de votre salon.",
      features: [
        "Page de réservation en ligne, ouverte 24 h/24 et 7 j/7",
        "Agenda en vue jour, semaine et mois",
        "Prestations, prix et plannings de l'équipe",
        "Fiches clients pour jusqu'à 250 clients",
        "Accès d'équipe avec rôles",
      ],
    },
    pro: {
      name: "Pro",
      tagline: "Tout pour gérer et développer votre salon.",
      everything: "Tout Basic, plus :",
      features: [
        "Clients illimités",
        "Paiements & finances : enregistrement des paiements et dépenses, aperçu du chiffre d'affaires, exports CSV",
        "Produits & stock avec alertes de stock faible",
        "Boutique en ligne avec click & collect",
        "Votre propre logo, photo de couverture et couleur sur votre page de réservation",
        "Droits personnalisés par membre de l'équipe",
      ],
      soon: "Paiements en ligne et acomptes",
    },
  },
  soonBadge: "En développement",
  compare: {
    title: "Comparer Basic et Pro",
    feature: "Fonctionnalité",
    included: "Inclus",
    notIncluded: "Non inclus",
    rows: [
      { label: "Page de réservation en ligne", basic: true, pro: true },
      { label: "Agenda, prestations et plannings de l'équipe", basic: true, pro: true },
      { label: "Accès d'équipe avec rôles", basic: true, pro: true },
      { label: "Clients", basic: "Jusqu'à 250", pro: "Illimités" },
      { label: "Paiements & finances", basic: false, pro: true },
      { label: "Produits & stock", basic: false, pro: true },
      { label: "Boutique en ligne (click & collect)", basic: false, pro: true },
      { label: "Votre identité visuelle sur la page de réservation", basic: false, pro: true },
      { label: "Droits personnalisés par membre de l'équipe", basic: false, pro: true },
    ],
  },
  trial: {
    title: "Comment fonctionne l'essai gratuit",
    steps: [
      {
        title: "Créez votre compte",
        text: "Inscrivez-vous en quelques minutes. Aucune donnée de paiement requise.",
      },
      {
        title: "Utilisez Pro pendant 14 jours",
        text: "Toutes les fonctionnalités Pro sont débloquées pendant votre essai.",
      },
      {
        title: "Choisissez votre abonnement",
        text: "Optez pour Basic ou Pro. Si vous ne choisissez pas, votre établissement continue avec Basic.",
      },
    ],
  },
  billingNote:
    "Il n'est pas encore possible de payer via NORYX, personne n'est donc facturé. Les prix seront annoncés avant tout changement.",
  questions: "D'autres questions ?",
  faqLink: "Lire les questions fréquentes",
};
