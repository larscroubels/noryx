import type { services as en } from "../en/services";

export const services: typeof en = {
  title: "Prestations",
  description:
    "Vos soins, leurs durées et leurs prix. Les modifications apparaissent immédiatement sur votre page de réservation.",
  new: "Nouvelle prestation",
  other: "Autres prestations",
  all: "Toutes les prestations",
  saved: (name) => `« ${name} » a été enregistrée.`,
  deleted: "La prestation a été supprimée. Les rendez-vous passés conservent leurs détails.",
  empty: "Aucune prestation pour l'instant",
  emptyText:
    "Ajoutez les soins que vous proposez pour que vos clients puissent les réserver et votre équipe les planifier.",
  addFirst: "Ajouter votre première prestation",
  notOnline: "Pas en ligne",
  noStaff: "Aucun collaborateur attribué",
  professionals: (count) => `${count} ${count === 1 ? "collaborateur" : "collaborateurs"}`,
  editTitle: "Modifier la prestation",
  editDescription: "Modifiez les détails, le prix et les personnes qui réalisent cette prestation.",
  deleteTitle: (name) => `Supprimer « ${name} » ?`,
  deleteText:
    "Elle disparaît de votre page de réservation. Les rendez-vous passés et à venir conservent les détails de la prestation. Pour la masquer temporairement, rendez-la plutôt inactive.",
  deleteConfirm: "Supprimer la prestation",
  newDescription: "Ajoutez un soin que vos clients peuvent réserver.",
  form: {
    details: "Détails de la prestation",
    detailsText:
      "Lors de la réservation, les clients voient le nom, la description, la durée et le prix.",
    namePlaceholder: "p. ex. Balayage",
    noCategory: "Sans catégorie",
    newCategory: "Nouvelle catégorie",
    newCategoryHint: "p. ex. Coloration, Coupes, Ongles",
    createCategory: "Créer une nouvelle catégorie",
    chooseCategory: "Choisir une catégorie existante",
    descriptionHint: "Facultatif. Expliquez ce qui est inclus.",
    promo: "Prix promotionnel",
    buffer: "Temps tampon après",
    bufferHint: "Temps de nettoyage ou de préparation.",
    activeHint:
      "Les prestations inactives ne peuvent pas être réservées mais restent dans votre historique.",
    online: "Réservable en ligne",
    onlineHint: "Afficher cette prestation sur votre page de réservation publique.",
    who: "Qui réalise cette prestation ?",
    whoText:
      "Seuls ces collaborateurs peuvent être réservés pour cette prestation. Définissez des prix individuels sur chaque profil de collaborateur.",
    noStaffYet: "Vous n'avez encore ajouté aucun collaborateur.",
    addStaff: "Ajoutez un collaborateur",
    toMakeBookable: "pour rendre cette prestation réservable.",
    create: "Créer la prestation",
  },
  errors: {
    manage: "Vous n'avez pas l'autorisation de gérer les prestations.",
    gone: "Cette prestation n'existe plus.",
    staffSync:
      "La prestation a été enregistrée, mais l'attribution des collaborateurs n'a pas pu être mise à jour.",
  },
};
