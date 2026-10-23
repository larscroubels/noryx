import type { errors as en } from "../en/errors";

export const errors: typeof en = {
  planFeatureTimeClock: "La pointeuse fait partie de Pro.",
  generic: "Une erreur s'est produite. Veuillez réessayer.",
  noPermission: "Vous n'avez pas l'autorisation d'effectuer cette action.",
  alreadyExists: "Cet élément existe déjà. Choisissez une autre valeur.",
  overlap: "Ce créneau chevauche un autre rendez-vous ou une autre plage horaire d'ouverture.",
  inUse: "Cet élément est encore utilisé et ne peut pas être modifié de cette façon.",
  notAllowedValues: "Certaines valeurs ne sont pas autorisées.",
  tooManyAttempts: "Trop de tentatives. Patientez quelques minutes avant de réessayer.",
  noAccessBusiness: "Vous n'avez pas accès à cet établissement.",
  planLimitStaff:
    "La limite de collaborateurs de votre abonnement est atteinte. Désactivez quelqu'un ou contactez NORYX pour changer d'abonnement.",
  planLimitMembers:
    "La limite d'accès d'équipe de votre abonnement est atteinte. Retirez un membre ou contactez NORYX pour changer d'abonnement.",
  planFeatureShop: "La boutique en ligne n'est pas incluse dans votre abonnement actuel.",
  planLimitCustomers: "Basic comprend jusqu'à 250 clients. Passez à Pro pour en ajouter davantage.",
  planFeatureFinance: "Les paiements et les finances font partie de Pro.",
  planFeatureInventory: "Les produits et le stock font partie de Pro.",
  planFeatureBranding: "Votre propre logo, photo de couverture et couleur font partie de Pro.",
  planFeatureTeamPermissions: "Les droits personnalisés par membre de l'équipe font partie de Pro.",
};
