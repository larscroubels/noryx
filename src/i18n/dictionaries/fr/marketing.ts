import type { marketing as en } from "../en/marketing";

export const marketing: typeof en = {
  meta: {
    title: "NORYX — La plateforme de gestion des professionnels de la beauté",
    description:
      "NORYX réunit rendez-vous, collaborateurs, clients et réservation en ligne sur une seule plateforme élégante pour les salons, barbiers et instituts de beauté.",
  },
  nav: {
    features: "Fonctionnalités",
    booking: "Réservation en ligne",
    forYou: "Pour qui",
    pricing: "Tarifs",
    faq: "FAQ",
    help: "Aide",
  },
  footer: {
    tagline:
      "La plateforme de gestion des salons, barbiers et professionnels de la beauté. Conçue en Belgique pour les entreprises européennes.",
    product: "Produit",
    account: "Compte",
    createAccount: "Créer un compte",
  },
  hero: {
    badge: "Essayez Pro gratuitement pendant 14 jours",
    titleStart: "Votre salon,",
    titleEmphasis: "joliment",
    titleEnd: "organisé.",
    lead: "NORYX réunit la réservation en ligne, votre agenda, votre équipe et vos clients dans un espace de travail serein et élégant — conçu pour les coiffeurs, barbiers et professionnels de la beauté.",
    primary: "Créer votre compte",
    secondary: "Découvrir la plateforme",
    bullets: [
      "Prêt en quelques minutes",
      "Aucune donnée de paiement requise",
      "Conçu pour les salons européens",
    ],
  },
  demo: {
    caption:
      "Exemple animé : le salon marque un rendez-vous comme terminé pendant qu'un client en réserve un nouveau sur son téléphone, qui apparaît ensuite dans le programme.",
    url: "noryx.app/app",
    nav: ["Aperçu", "Agenda", "Clients", "Prestations", "Collaborateurs"],
    weekday: "JEUDI",
    greeting: "Bonjour, Lena",
    stats: ["Aujourd'hui", "Cette semaine", "Nouveaux clients"],
    rows: [
      { time: "09:30", name: "Sofie J.", service: "Balayage" },
      { time: "11:00", name: "Lucas D.", service: "Coupe homme" },
      { time: "13:30", name: "Emma V.", service: "Coupe & brushing" },
      { time: "15:00", name: "Nora P.", service: "Manucure gel" },
    ],
    newRow: {
      time: "15:45",
      name: "Mila D.",
      service: "Manucure gel",
      badge: "Nouveau · en ligne",
    },
    popover: {
      service: "Balayage",
      detail: "Sofie Janssens · 09:30–12:00",
      confirmed: "Confirmé",
      completed: "Terminé",
      action: "Marquer comme terminé",
    },
    phone: {
      salon: "Atelier Noor",
      chooseService: "CHOISISSEZ UNE PRESTATION",
      services: [
        { name: "Coupe & brushing", meta: "1 h", price: "58 €" },
        { name: "Balayage", meta: "2 h 30 min", price: "165 €" },
        { name: "Manucure gel", meta: "45 min", price: "42 €" },
      ],
      pickTime: "CHOISISSEZ UNE HEURE",
      days: [
        { weekday: "MAR", day: "21" },
        { weekday: "MER", day: "22" },
        { weekday: "JEU", day: "23" },
        { weekday: "VEN", day: "24" },
        { weekday: "SAM", day: "25" },
      ],
      slots: ["09:30", "11:00", "14:15", "15:45", "16:30", "17:00"],
      confirm: "Confirmer la réservation",
      successTitle: "Votre réservation est confirmée",
      successWhen: "mer. 22 oct. · 15:45",
      successDetail: "Manucure gel · Amir",
      addToCalendar: "Ajouter à l'agenda",
    },
  },
  features: {
    eyebrow: "Tout au même endroit",
    title: "Moins d'administratif. Plus de temps pour vos clients.",
    lead: "Remplacez l'agenda papier, les tableurs et les messages tardifs par une seule plateforme que toute votre équipe aime utiliser.",
    items: [
      {
        title: "Votre propre page de réservation",
        text: "Une belle page avec vos prestations, vos prix, votre équipe et vos heures d'ouverture, où vos clients réservent 24 h/24 depuis leur téléphone.",
      },
      {
        title: "Un agenda qui anticipe",
        text: "Vues jour, semaine et mois par collaborateur. Heures de travail, pauses, temps tampons et absences sont respectés automatiquement.",
      },
      {
        title: "Des fiches clients utiles",
        text: "Historique des visites, notes privées et coordonnées au même endroit, avec recherche, export et outils de confidentialité intégrés.",
      },
      {
        title: "Prestations et prix",
        text: "Classez vos soins par catégorie, définissez des prix promotionnels et attribuez à chaque collaborateur son propre prix ou sa propre durée.",
      },
      {
        title: "Plannings de l'équipe",
        text: "Temps partiels, journées coupées, congés et jours de maladie — chaque modification met instantanément à jour vos disponibilités en ligne.",
      },
      {
        title: "Le bon accès pour chacun",
        text: "Propriétaires, gérants et collaborateurs voient chacun ce dont ils ont besoin. Votre chiffre d'affaires reste privé, sauf si vous en décidez autrement.",
      },
      {
        title: "Revente & click & collect",
        text: "Suivez votre stock avec un historique complet des mouvements et laissez vos clients réserver des produits en ligne, à retirer et payer au salon.",
      },
      {
        title: "Paiements & dépenses en un coup d'œil",
        text: "Enregistrez comment vos clients ont payé, notez vos frais et consultez le chiffre d'affaires par prestation, collaborateur et mode de paiement — avec exports CSV.",
      },
    ],
  },
  booking: {
    eyebrow: "Réservation en ligne",
    title: "Un agenda complet, sans décrocher le téléphone.",
    lead: "Vos clients ne voient que les créneaux réellement disponibles — calculés à partir de vos heures d'ouverture, du planning de chaque collaborateur, des rendez-vous existants et des temps tampons nécessaires entre eux.",
    points: [
      {
        title: "Aucune double réservation",
        text: "Chaque réservation est revérifiée sur le serveur, et les rendez-vous qui se chevauchent sont impossibles au niveau de la base de données.",
      },
      {
        title: "Vos règles",
        text: "Délai minimum, horizon de réservation, délai d'annulation, choix du collaborateur et validation manuelle facultative.",
      },
      {
        title: "Pensé pour le mobile",
        text: "Un parcours de réservation conçu pour le téléphone de votre client, avec un bouton « Ajouter à l'agenda » à la fin.",
      },
    ],
    preview: {
      title: "Choisissez une date et une heure",
      days: [
        ["mar", "14"],
        ["mer", "15"],
        ["jeu", "16"],
        ["ven", "17"],
      ],
      morning: "Matin",
      confirm: "Confirmer la réservation",
    },
  },
  team: {
    eyebrow: "Équipe & clients",
    title: "Conçu pour la façon dont les salons travaillent ensemble.",
    items: [
      {
        title: "Chaque collaborateur, son propre planning",
        text: "Journées coupées, semaines à temps partiel, congés et pauses ponctuelles — avec des prix et des durées personnalisés si nécessaire.",
      },
      {
        title: "La confidentialité dès la conception",
        text: "Les données de chaque salon sont isolées de celles de tous les autres salons. Les notes clients privées nécessitent un droit spécifique.",
      },
      {
        title: "Un statut clair pour chaque visite",
        text: "En attente, confirmé, terminé, annulé ou absent — avec l'historique complet de chaque modification.",
      },
      {
        title: "Les demandes de données en un clic",
        text: "Exportez les données d'un client ou effacez-les sur demande, tout en conservant des enregistrements anonymisés pour votre comptabilité.",
      },
    ],
  },
  forYou: {
    eyebrow: "Pour qui",
    title: "Du fauteuil unique à l'équipe de salon bien occupée.",
    types: [
      "Salons de coiffure",
      "Barbiers",
      "Instituts de beauté",
      "Ongleries",
      "Studios cils & sourcils",
      "Soins de la peau & esthétique",
      "Professionnels indépendants",
    ],
  },
  roadmap: {
    eyebrow: "La suite",
    title: "Vers une plateforme de gestion complète.",
    lead: "Ces modules sont en développement et pas encore disponibles. Les salons qui utilisent NORYX aujourd'hui nous aident à les façonner.",
    badge: "En développement",
    items: [
      {
        title: "Paiements en ligne & acomptes",
        text: "Paiements et acomptes sécurisés via un prestataire de paiement de confiance.",
      },
      {
        title: "Rappels par e-mail & SMS",
        text: "Confirmations et rappels automatiques pour réduire les absences.",
      },
      {
        title: "Comptes clients",
        text: "Vos clients consultent leur historique et déplacent ou annulent en ligne.",
      },
      {
        title: "Plusieurs sites",
        text: "Plannings, stock et rapports distincts par site.",
      },
      {
        title: "Applications iOS & Android",
        text: "Votre salon dans votre poche, pour vous et votre équipe.",
      },
    ],
  },
  faq: {
    eyebrow: "FAQ",
    title: "Vos questions, nos réponses.",
    metaTitle: "Questions fréquentes",
    lead: "Des réponses courtes sur NORYX, nos abonnements et le fonctionnement des réservations. Les guides pas à pas se trouvent dans le centre d'aide.",
    helpTitle: "Vous cherchez un guide pas à pas ?",
    helpText:
      "Le centre d'aide propose de courts cours avec captures d'écran pour chaque partie de NORYX.",
    helpLink: "Ouvrir le centre d'aide",
    items: [
      {
        q: "Combien coûte NORYX ?",
        a: "NORYX propose deux abonnements : Basic et Pro. Les prix seront annoncés avant le lancement. Vous pouvez essayer Pro gratuitement pendant 14 jours, sans données de paiement.",
      },
      {
        q: "Quelle est la différence entre Basic et Pro ?",
        a: "Basic est le système de réservation — réservation en ligne, agenda, prestations et plannings de l'équipe — pour jusqu'à 250 clients. Pro ajoute les clients illimités, les paiements et finances, le stock, une boutique en ligne et votre propre identité visuelle sur votre page de réservation.",
      },
      {
        q: "Que se passe-t-il après l'essai de 14 jours ?",
        a: "Vous choisissez Basic ou Pro. Si vous ne choisissez pas, votre établissement continue avec Basic. Rien n'est facturé automatiquement : il n'est pas encore possible de payer via NORYX.",
      },
      {
        q: "Les clients peuvent-ils réserver sans créer de compte ?",
        a: "Oui. Les clients choisissent une prestation, un collaborateur et une heure, puis laissent leur nom, leur e-mail et leur numéro de téléphone. Aucun mot de passe n'est nécessaire.",
      },
      {
        q: "Deux clients peuvent-ils réserver le même créneau ?",
        a: "Non. La disponibilité est revérifiée sur le serveur au moment de la réservation, et la base de données elle-même refuse les rendez-vous qui se chevauchent pour un même collaborateur.",
      },
      {
        q: "Mes employés voient-ils mon chiffre d'affaires ?",
        a: "Pas par défaut. Les collaborateurs voient leurs propres rendez-vous et clients. C'est vous qui décidez qui peut voir les chiffres de l'établissement ou gérer les paramètres.",
      },
      {
        q: "Où mes données sont-elles stockées ?",
        a: "NORYX est conçu pour les entreprises européennes. Les données de chaque salon sont strictement séparées de celles des autres salons, et vous pouvez exporter ou effacer les données personnelles d'un client sur demande.",
      },
      {
        q: "NORYX envoie-t-il des e-mails de confirmation ?",
        a: "Pas encore. Les réservations et les commandes sont confirmées à l'écran et les clients peuvent ajouter leurs rendez-vous à leur agenda. Les notifications par e-mail et SMS sont en développement.",
      },
      {
        q: "Les clients peuvent-ils payer en ligne ?",
        a: "Pas encore. Vous enregistrez les paiements reçus au salon, et les commandes en ligne sont payées au retrait. Les paiements en ligne passeront par un prestataire de paiement de confiance dès qu'ils seront disponibles.",
      },
      {
        q: "NORYX est-il disponible en néerlandais et en français ?",
        a: "Oui. NORYX est disponible en français, en néerlandais et en anglais — changez de langue en haut de chaque page.",
      },
    ],
  },
  finalCta: {
    title: "Prêt quand vos clients le sont.",
    lead: "Créez votre compte, ajoutez vos prestations et partagez votre page de réservation dès aujourd'hui.",
    primary: "Commencer",
    secondary: "Se connecter",
  },
};
