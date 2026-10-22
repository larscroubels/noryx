import type { HelpContent } from "./types";

export const fr: HelpContent = {
  courses: [
    {
      slug: "aan-de-slag",
      icon: "rocket",
      audience: "owner",
      minutes: 6,
      title: "Bien démarrer avec NORYX",
      summary:
        "Créez votre compte, configurez votre établissement et publiez votre page de réservation — en une dizaine de minutes.",
      steps: [
        {
          title: "Créez votre compte",
          body: [
            "Rendez-vous sur la page d'accueil et choisissez **Commencer**. Saisissez votre nom, votre adresse e-mail et un mot de passe (au moins 10 caractères, dont une lettre et un chiffre), puis acceptez les conditions.",
            "Vous recevez un e-mail pour confirmer votre adresse. Cliquez sur le bouton de cet e-mail et vous arrivez directement dans la configuration.",
          ],
          image: { name: "signup", alt: "Le formulaire d'inscription NORYX" },
          tip: "Utilisez **NL | FR | EN** en haut de chaque page pour choisir la langue dans laquelle vous utilisez NORYX. Votre choix est mémorisé.",
        },
        {
          title: "Parlez-nous de votre établissement",
          body: [
            "Saisissez le nom et le type de votre établissement. NORYX propose immédiatement une adresse pour votre page de réservation, par exemple **noryx.app/atelier-noor**. Vous pouvez la modifier tant qu'elle est encore libre.",
            "Cliquez sur **Créer mon établissement**. Tout ce que vous saisissez pendant la configuration peut être modifié plus tard dans **Paramètres**.",
          ],
          image: {
            name: "onboarding-business",
            alt: "Étape 1 de la configuration : données de l'établissement",
          },
        },
        {
          title: "Ajoutez votre adresse et vos heures d'ouverture",
          body: [
            "Aux étapes suivantes, vous ajoutez votre adresse et vos coordonnées, puis vous définissez vos heures d'ouverture par jour. Cochez un jour pour l'ouvrir et choisissez l'heure de début et de fin.",
            "Les clients ne peuvent réserver que pendant vos heures d'ouverture, et seulement si le collaborateur choisi travaille aussi.",
          ],
          image: {
            name: "onboarding-hours",
            alt: "Définir les heures d'ouverture pendant la configuration",
          },
        },
        {
          title: "Ajoutez vos prestations et vous-même",
          body: [
            "Ajoutez vos premières prestations avec leur durée et leur prix. Vous pourrez toujours en ajouter d'autres plus tard sous **Prestations**.",
            "Vous prenez vous-même des rendez-vous ? Choisissez **Oui, les clients peuvent prendre rendez-vous avec moi** et NORYX crée votre profil de collaborateur avec vos heures d'ouverture et toutes vos prestations.",
          ],
        },
        {
          title: "Publiez votre page de réservation",
          body: [
            "À la dernière étape, vous choisissez si votre page de réservation est mise en ligne tout de suite. Cliquez sur **Aller à mon tableau de bord** pour terminer.",
            "L'**Aperçu** affiche ensuite les rendez-vous du jour, vos chiffres clés et une courte liste de ce qu'il reste à configurer.",
          ],
          image: {
            name: "overview",
            alt: "L'aperçu de l'espace de travail avec les chiffres clés et le programme du jour",
          },
          tip: "Partagez le lien de votre page de réservation sur Instagram, Google ou votre site web. Vous le retrouvez toujours via **Voir la page de réservation** en haut à droite.",
        },
      ],
      faq: [
        {
          q: "Je n'ai pas reçu d'e-mail de confirmation. Que faire ?",
          a: "Vérifiez vos courriers indésirables. S'il n'y est pas, inscrivez-vous à nouveau avec la même adresse ou utilisez **Mot de passe oublié ?** sur la page de connexion.",
        },
        {
          q: "Puis-je gérer plusieurs établissements ?",
          a: "Oui. Ouvrez le menu avec votre nom en bas à gauche et choisissez **Ajouter un autre établissement**. Utilisez **Changer d'établissement** pour passer de l'un à l'autre.",
        },
        {
          q: "Puis-je encore modifier l'adresse de ma page de réservation ?",
          a: "Vous choisissez l'adresse lors de la création de votre établissement. Pour la modifier plus tard, contactez NORYX afin que les liens existants ne cessent pas de fonctionner sans prévenir.",
        },
      ],
    },
    {
      slug: "agenda-en-afspraken",
      icon: "calendar",
      audience: "everyone",
      minutes: 7,
      title: "Agenda et rendez-vous",
      summary:
        "Travaillez avec les vues jour, semaine et mois, réservez des rendez-vous, déplacez-les et tenez leur statut à jour.",
      steps: [
        {
          title: "Choisissez votre vue",
          body: [
            "Ouvrez **Agenda** dans le menu. Dans la vue **Jour**, chaque collaborateur a sa propre colonne. **Semaine** et **Mois** vous donnent un aperçu sur une période plus longue.",
            "Utilisez les flèches et **Aujourd'hui** pour naviguer dans le temps, et **Tous les collaborateurs** pour afficher l'agenda d'une seule personne.",
          ],
          image: {
            name: "calendar-week",
            alt: "La vue semaine de l'agenda avec les rendez-vous par jour",
          },
          tip: "Un bloc hachuré indique une absence, comme un congé ou une maladie. Personne ne peut réserver en ligne pendant cette période.",
        },
        {
          title: "Réservez un rendez-vous",
          body: [
            "Cliquez sur **Nouveau rendez-vous**. Choisissez un **Client existant** ou créez un **Nouveau client** sur-le-champ, puis sélectionnez la prestation, le collaborateur, la date et l'heure de début.",
            "La durée et le prix proviennent de la prestation (ou du prix propre au collaborateur). Si le rendez-vous en chevauche un autre, un message s'affiche et il n'est pas enregistré.",
          ],
          image: {
            name: "new-appointment",
            alt: "Le formulaire de réservation d'un nouveau rendez-vous",
          },
        },
        {
          title: "Mettez à jour le statut",
          body: [
            "Cliquez sur un rendez-vous pour ouvrir ses détails. En haut, vous trouvez les actions disponibles à ce moment-là : **Confirmer**, **Marquer comme terminé**, **Marquer comme absent** ou **Annuler**.",
            "Chaque modification est ajoutée à l'**Historique** du rendez-vous, avec la date et l'heure.",
          ],
          image: {
            name: "appointment-detail",
            alt: "La page de détail d'un rendez-vous avec le statut, le déplacement et le paiement",
          },
        },
        {
          title: "Déplacez ou annulez",
          body: [
            "Sous **Déplacer**, choisissez une nouvelle date, une nouvelle heure de début ou un autre collaborateur, puis cliquez sur **Déplacer le rendez-vous**.",
            "Lorsque vous cliquez sur **Annuler**, vous pouvez ajouter un motif. Le créneau redevient immédiatement disponible pour la réservation en ligne.",
          ],
        },
        {
          title: "Validez les demandes en ligne",
          body: [
            "Si vous avez activé **Valider manuellement les réservations en ligne** dans **Paramètres**, les nouvelles réservations arrivent en attente. Le créneau reste bloqué pour le client en attendant.",
            "L'**Aperçu** affiche alors un avis. Cliquez sur **Examiner les demandes** et confirmez ou annulez chaque demande.",
          ],
          image: {
            name: "requests",
            alt: "La liste des demandes de réservation en attente de confirmation",
          },
        },
      ],
      faq: [
        {
          q: "Un collaborateur peut-il être réservé deux fois en même temps ?",
          a: "Non. NORYX le vérifie dans la base de données elle-même : un collaborateur ne peut jamais avoir deux rendez-vous qui se chevauchent, même si deux personnes réservent exactement au même moment.",
        },
        {
          q: "Que voit un collaborateur dans l'agenda ?",
          a: "Avec le rôle par défaut **Collaborateur**, vous ne voyez que vos propres rendez-vous et les clients qui ont réservé chez vous. Le propriétaire peut modifier cela par personne sous **Équipe**.",
        },
        {
          q: "J'ai cliqué sur « terminé » par erreur.",
          a: "Rouvrez le rendez-vous et cliquez sur **Confirmer**. Un rendez-vous terminé ou marqué absent est ainsi rétabli.",
        },
      ],
    },
    {
      slug: "online-boeken",
      icon: "globe",
      audience: "owner",
      minutes: 6,
      title: "La réservation en ligne pour vos clients",
      summary:
        "Comment fonctionne votre page de réservation, quelles règles vous définissez et comment vos clients peuvent annuler eux-mêmes.",
      steps: [
        {
          title: "Votre page publique",
          body: [
            "Votre page de réservation affiche vos prestations avec leur prix et leur durée, votre équipe, vos heures d'ouverture et vos coordonnées. Les clients n'ont pas besoin de compte.",
            "Définissez votre logo, votre photo de couverture et votre description sous **Paramètres** › **Profil de l'établissement** et **Identité visuelle**.",
          ],
          image: {
            name: "public-page",
            alt: "La page de réservation publique du salon de démonstration",
          },
        },
        {
          title: "Comment un client réserve",
          body: [
            "Le client choisit une prestation, éventuellement un collaborateur, puis un jour et un créneau libre. NORYX n'affiche que les créneaux réellement possibles : pendant vos heures d'ouverture et le planning du collaborateur, sans chevauchement et avec les temps tampons que vous avez définis.",
            "Enfin, le client saisit son nom, son e-mail et son numéro de téléphone, et accepte les conditions de réservation.",
          ],
          image: {
            name: "booking-time",
            alt: "Un client qui choisit un créneau sur son téléphone",
            mobile: true,
          },
        },
        {
          title: "Définissez vos règles de réservation",
          body: [
            "Allez dans **Paramètres** › **Réservation en ligne**. Choisissez le **Délai minimum** (combien de temps à l'avance il faut réserver), l'**Horizon de réservation**, la fréquence des heures de début proposées et le temps tampon entre les rendez-vous.",
            "Vous choisissez aussi si les clients peuvent choisir leur collaborateur et si vous souhaitez valider d'abord les réservations en ligne.",
          ],
          image: { name: "settings-booking", alt: "Les paramètres de réservation en ligne" },
        },
        {
          title: "Annulation par le client",
          body: [
            "Après sa réservation, le client reçoit un lien privé pour consulter ou annuler sa réservation. Cela fonctionne jusqu'au nombre d'heures que vous avez défini sous **Annulation gratuite jusqu'à**. Ensuite, la page renvoie vers votre numéro de téléphone.",
            "Tant qu'aucun service d'e-mail n'est connecté, NORYX n'envoie pas d'e-mails de confirmation. Le client voit alors le lien sur l'écran de confirmation et peut ajouter le rendez-vous à son propre agenda.",
          ],
        },
      ],
      faq: [
        {
          q: "Puis-je désactiver temporairement la réservation en ligne ?",
          a: "Oui. Sous **Paramètres** › **Réservation en ligne**, désactivez **La page de réservation en ligne est active**. Votre page est alors masquée et personne ne peut réserver en ligne.",
        },
        {
          q: "Les clients paient-ils en ligne ?",
          a: "Pas encore. Les paiements en ligne et les acomptes nécessitent un prestataire de paiement connecté. En attendant, les clients paient au salon et vous enregistrez le paiement sur le rendez-vous.",
        },
        {
          q: "Pourquoi un client ne voit-il aucun créneau un jour donné ?",
          a: "L'établissement ou le collaborateur est fermé ce jour-là, tout est réservé, le jour dépasse l'horizon de réservation, ou c'est trop tôt selon votre délai minimum.",
        },
      ],
    },
    {
      slug: "klanten",
      icon: "users",
      audience: "everyone",
      minutes: 5,
      title: "Clients et confidentialité",
      summary:
        "Retrouvez vos clients, consultez leur historique, prenez des notes et traitez les demandes liées à la vie privée.",
      steps: [
        {
          title: "Votre liste de clients",
          body: [
            "Ouvrez **Clients**. Les clients qui réservent en ligne sont ajoutés automatiquement. Utilisez **Ajouter un client** pour créer vous-même une fiche.",
            "Recherchez par nom, e-mail ou numéro de téléphone et triez par **Les plus récents** ou **Nom A–Z**.",
          ],
          image: { name: "customers", alt: "La liste des clients avec la recherche" },
        },
        {
          title: "La fiche client",
          body: [
            "Cliquez sur un client pour voir ses rendez-vous à venir, son historique, ses visites terminées et leur valeur. Utilisez **Prendre rendez-vous** pour en planifier un nouveau tout de suite.",
            "Sous **Notes privées**, vous pouvez par exemple noter une formule de coloration ou des préférences. Les notes ne sont visibles que par les membres de l'équipe ayant accès aux notes clients.",
          ],
          image: {
            name: "customer-detail",
            alt: "Une fiche client avec ses rendez-vous et ses notes",
          },
          tip: "N'enregistrez pas de données de santé sauf accord explicite du client.",
        },
        {
          title: "Consentement marketing",
          body: [
            "Ne cochez **A accepté de recevoir des messages marketing** que si le client l'a vraiment demandé. Lors d'une réservation en ligne, les clients font ce choix eux-mêmes.",
          ],
        },
        {
          title: "Demandes d'accès et d'effacement (RGPD)",
          body: [
            "Un client vous demande quelles données vous conservez ? Cliquez sur **Exporter les données personnelles** pour obtenir un fichier avec toutes les données de ce client.",
            "Si un client souhaite être effacé, choisissez **Effacer les données personnelles**. Le nom, l'e-mail, le téléphone et les notes sont définitivement supprimés. Les rendez-vous restent, anonymisés, pour votre comptabilité.",
          ],
        },
      ],
      faq: [
        {
          q: "Puis-je exporter tous mes clients ?",
          a: "Oui, avec **Exporter en CSV** en haut de la liste des clients. Vous avez besoin du droit « Créer, modifier, exporter et supprimer des fiches clients ».",
        },
        {
          q: "Un client a réservé en ligne avec une autre adresse e-mail. Est-ce un nouveau client ?",
          a: "Oui, NORYX reconnaît les clients à leur adresse e-mail. Mettez à jour l'adresse sur la fiche s'il s'agit de la même personne.",
        },
        {
          q: "Combien de clients puis-je enregistrer ?",
          a: "Jusqu'à 250 avec Basic, un nombre illimité avec Pro. L'**Aperçu** affiche un avis lorsque vous approchez de la limite de Basic.",
        },
      ],
    },
    {
      slug: "behandelingen-en-team",
      icon: "scissors",
      audience: "owner",
      minutes: 8,
      title: "Prestations, collaborateurs et équipe",
      summary:
        "Gérez vos prestations et vos prix, les plannings et les absences, et qui peut voir quoi dans votre espace.",
      steps: [
        {
          title: "Prestations et prix",
          body: [
            "Ouvrez **Prestations** et cliquez sur **Nouvelle prestation**. Saisissez un nom, une catégorie, une durée et un prix. Un **Prix promotionnel** doit être inférieur au prix normal ; les clients voient alors les deux.",
            "Le **Temps tampon après** réserve du temps pour ranger. Désactivez **Réservable en ligne** si une prestation ne peut être réservée qu'auprès du salon.",
          ],
          image: { name: "services", alt: "La liste des prestations par catégorie" },
        },
        {
          title: "Qui réalise quoi ?",
          body: [
            "En bas du formulaire, cochez les collaborateurs qui réalisent la prestation. Seuls eux peuvent être réservés pour celle-ci.",
            "Quelqu'un a son propre prix ou sa propre durée ? Définissez-les sur le profil du collaborateur, sous **Prestations**.",
          ],
          image: {
            name: "service-form",
            alt: "La modification d'une prestation avec ses collaborateurs attribués",
          },
        },
        {
          title: "Heures de travail et absences",
          body: [
            "Ouvrez **Collaborateurs** et choisissez une personne. Sous **Heures de travail**, vous définissez les horaires par jour ; ajoutez une pause pour scinder une journée en deux.",
            "Sous **Absences**, vous planifiez un congé, une maladie ou une formation. Personne ne peut réserver cette personne en ligne pendant cette période.",
          ],
          image: {
            name: "staff-detail",
            alt: "Le profil d'un collaborateur avec ses heures de travail",
          },
        },
        {
          title: "Invitez des membres de l'équipe",
          body: [
            "Ouvrez **Équipe** et saisissez l'adresse e-mail et le rôle sous **Inviter quelqu'un**. Liez l'invitation à un profil de collaborateur pour que cette personne voie son propre agenda.",
            "NORYX crée un lien d'invitation valable 7 jours. Tant que l'e-mail n'est pas configuré, vous partagez ce lien vous-même, par exemple via WhatsApp.",
          ],
          image: { name: "team", alt: "La page Équipe avec les membres et les invitations" },
        },
        {
          title: "Rôles et droits",
          body: [
            "Il existe trois rôles : **Propriétaire** (tout), **Gérant** (gestion quotidienne, sans chiffre d'affaires, paramètres ni équipe) et **Collaborateur** (son propre agenda et ses clients).",
            "Utilisez **Accès** pour accorder ou retirer des droits individuels par personne. Le chiffre d'affaires et les paramètres restent privés, sauf si vous les partagez explicitement.",
          ],
        },
      ],
      faq: [
        {
          q: "Que se passe-t-il lorsque je supprime une prestation ?",
          a: "Elle disparaît de votre page de réservation. Les rendez-vous passés et à venir conservent leurs détails. Pour la masquer temporairement, rendez-la plutôt inactive.",
        },
        {
          q: "Quelqu'un est parti. Dois-je supprimer son profil ?",
          a: "Non, rendez le profil inactif. Son historique de rendez-vous est conservé. Sous **Équipe**, utilisez l'icône de suppression pour retirer son accès à l'espace.",
        },
        {
          q: "Combien de collaborateurs puis-je ajouter ?",
          a: "Autant que vous le souhaitez : Basic et Pro n'ont pas de limite de collaborateurs ni d'accès d'équipe. Les droits personnalisés par membre de l'équipe font partie de Pro.",
        },
      ],
    },
    {
      slug: "webshop-en-voorraad",
      icon: "shopping",
      audience: "owner",
      plan: "pro",
      minutes: 6,
      title: "Boutique en ligne et stock",
      summary:
        "Gérez vos produits et votre stock, activez le click & collect et traitez les commandes jusqu'à leur retrait.",
      steps: [
        {
          title: "Produits et stock",
          body: [
            "Ouvrez **Produits** et cliquez sur **Nouveau produit**. Saisissez le prix de vente, le prix d'achat (pour votre marge) et le niveau à partir duquel vous souhaitez une alerte de stock faible.",
            "Les produits presque épuisés reçoivent une étiquette et apparaissent dans l'**Aperçu**.",
          ],
          image: {
            name: "products",
            alt: "La liste des produits avec les niveaux de stock et les étiquettes de stock faible",
          },
        },
        {
          title: "Mettez à jour le stock",
          body: [
            "Ouvrez un produit et choisissez un motif sous **Mettre à jour le stock** : une livraison, un retour, une vente au salon, un article endommagé ou une correction d'inventaire.",
            "Chaque modification est inscrite dans l'**Historique du stock**, pour que vous sachiez toujours d'où vient une différence.",
          ],
          image: { name: "product-detail", alt: "Un produit avec son historique de stock" },
        },
        {
          title: "Activez votre boutique en ligne",
          body: [
            "Cochez **Vendre dans la boutique en ligne** sur un produit. Activez ensuite **La boutique en ligne est active** sous **Paramètres** › **Boutique en ligne**.",
            "Les clients réservent en ligne et paient au moment du retrait au salon. Le paiement en ligne n'est pas encore disponible.",
          ],
        },
        {
          title: "Traitez les commandes",
          body: [
            "Les nouvelles commandes apparaissent sous **Commandes**. Leurs produits sont déjà réservés dans votre stock à ce moment-là.",
            "Ouvrez une commande et traitez-la étape par étape : **Accepter la commande**, **Marquer comme prête à retirer** et **Marquer comme retirée**. Enregistrez le paiement avec **Marquer comme payée**. Si vous annulez une commande, ses produits retournent en stock.",
          ],
          image: { name: "order-detail", alt: "Une commande en ligne avec son étape suivante" },
        },
      ],
      faq: [
        {
          q: "Que se passe-t-il si un produit est épuisé ?",
          a: "Les clients ne peuvent pas commander plus que ce que vous avez en stock. Dans la boutique en ligne, le produit apparaît comme **En rupture de stock**.",
        },
        {
          q: "Le client reçoit-il une confirmation ?",
          a: "Le client voit le numéro de commande à l'écran. Les e-mails de confirmation ne sont envoyés qu'une fois un service d'e-mail connecté.",
        },
      ],
    },
    {
      slug: "financien",
      icon: "wallet",
      audience: "owner",
      plan: "pro",
      minutes: 5,
      title: "Paiements et finances",
      summary:
        "Enregistrez paiements et dépenses, suivez votre chiffre d'affaires et exportez tout pour votre comptable.",
      steps: [
        {
          title: "Enregistrez un paiement",
          body: [
            "Ouvrez un rendez-vous et saisissez le montant et le mode sous **Paiement**, par exemple Bancontact, carte ou espèces. Cliquez sur **Enregistrer le paiement**.",
            "NORYX ne traite pas lui-même les paiements : vous enregistrez ce que le client a payé au salon. Une fois tout payé, la mention **Entièrement payé** s'affiche.",
          ],
          image: {
            name: "appointment-payment",
            alt: "L'enregistrement d'un paiement sur un rendez-vous",
          },
        },
        {
          title: "Votre aperçu financier",
          body: [
            "Ouvrez **Finances** et choisissez une période. Vous voyez votre **Chiffre d'affaires enregistré**, vos **Dépenses** et le **Résultat**, ainsi que le chiffre d'affaires par prestation, par collaborateur et par mode de paiement.",
            "La **Valeur réservée** est une estimation basée sur les rendez-vous réservés et s'affiche séparément, pour ne jamais la confondre avec de vrais paiements.",
          ],
          image: { name: "finance", alt: "L'aperçu financier avec les totaux et les répartitions" },
        },
        {
          title: "Dépenses et remboursements",
          body: [
            "Ajoutez des dépenses avec une description, un montant, une date, une catégorie et, si vous le souhaitez, un fournisseur et un numéro de facture.",
            "Vous avez rendu de l'argent à un client ? Marquez le paiement comme remboursé. Il reste visible mais ne compte plus dans le chiffre d'affaires.",
          ],
        },
        {
          title: "Exportez pour votre comptable",
          body: [
            "Utilisez **Paiements CSV** et **Dépenses CSV** pour télécharger toutes les données de la période choisie. Ouvrez les fichiers dans Excel ou transmettez-les à votre comptable.",
          ],
          tip: "NORYX n'est pas un logiciel de comptabilité. Utilisez les outils de votre comptable pour la comptabilité et les déclarations TVA.",
        },
      ],
      faq: [
        {
          q: "Qui peut voir le chiffre d'affaires ?",
          a: "Uniquement le propriétaire et les membres de l'équipe à qui vous accordez le droit « Voir le chiffre d'affaires, les dépenses et les synthèses financières ». Les gérants et les collaborateurs ne voient pas le chiffre d'affaires par défaut.",
        },
        {
          q: "Les montants incluent-ils la TVA ?",
          a: "Les montants sont ceux que vous saisissez. Enregistrez-les tels que le client les a payés, c'est-à-dire en général TVA comprise.",
        },
      ],
    },
    {
      slug: "instellingen",
      icon: "settings",
      audience: "owner",
      minutes: 4,
      title: "Paramètres et compte",
      summary:
        "Ajustez votre profil, votre identité visuelle, vos heures d'ouverture et votre abonnement, et gérez votre compte personnel.",
      steps: [
        {
          title: "Profil et identité visuelle",
          body: [
            "Sous **Paramètres** › **Profil de l'établissement**, vous ajoutez votre description, vos coordonnées publiques, votre site web, votre Instagram et une couleur d'accent pour votre page de réservation.",
            "Sous **Identité visuelle**, vous importez votre logo et une photo de couverture : PNG, JPG ou WebP, 2 Mo maximum. Votre propre logo, photo de couverture et couleur d'accent font partie de Pro.",
          ],
          image: { name: "settings", alt: "Les paramètres affichant le profil de l'établissement" },
        },
        {
          title: "Heures d'ouverture et lieu",
          body: [
            "Sous **Heures d'ouverture**, vous pouvez ajouter une pause par jour. Les modifications mettent immédiatement à jour vos disponibilités en ligne.",
            "**Lieu** contient votre adresse et votre numéro de téléphone tels que les clients les voient.",
          ],
        },
        {
          title: "Votre abonnement",
          body: [
            "Sous **Abonnement**, vous voyez si vous utilisez Basic ou Pro, quelles fonctionnalités sont incluses et combien de jours il reste à votre essai gratuit de Pro.",
            "Après l'essai, vous choisissez Basic ou Pro. Si vous ne choisissez pas, votre établissement continue avec Basic. Tant qu'il n'est pas possible de payer via NORYX, rien n'est facturé.",
          ],
        },
        {
          title: "Votre compte personnel",
          body: [
            "Cliquez sur votre nom en bas à gauche et choisissez **Paramètres du compte** pour modifier votre nom, votre adresse e-mail ou votre mot de passe. Ces données sont distinctes de votre établissement.",
          ],
          image: {
            name: "account",
            alt: "Les paramètres du compte avec le nom, l'e-mail et le mot de passe",
          },
        },
      ],
      faq: [
        {
          q: "Pourquoi ne puis-je pas ouvrir les paramètres ?",
          a: "Seuls le propriétaire et les membres de l'équipe autorisés à gérer les paramètres voient ce menu. Demandez au propriétaire d'ajuster votre accès sous **Équipe**.",
        },
        {
          q: "Comment changer de langue ?",
          a: "Cliquez sur **NL**, **FR** ou **EN** en haut de la page. Votre choix est mémorisé pendant un an sur cet appareil.",
        },
      ],
    },
  ],
  faq: [
    {
      q: "Mes données et celles de mes clients sont-elles en sécurité ?",
      a: "Chaque établissement est strictement séparé : la base de données vérifie à chaque requête si vous y avez accès, même si quelqu'un modifie un lien ou un identifiant. Votre équipe ne voit que ce que vous autorisez.",
    },
    {
      q: "NORYX envoie-t-il des e-mails à mes clients ?",
      a: "Uniquement une fois qu'un service d'e-mail est connecté. D'ici là, NORYX n'envoie rien et l'indique honnêtement à l'écran, pour que personne n'attende un e-mail qui n'arrivera pas.",
    },
    {
      q: "NORYX peut-il traiter des paiements ?",
      a: "Pas encore. Vous enregistrez les paiements effectués au salon. Le paiement en ligne arrivera une fois un prestataire de paiement connecté.",
    },
    {
      q: "NORYX fonctionne-t-il sur mon téléphone ?",
      a: "Oui. L'espace de travail et la page de réservation sont conçus pour le téléphone comme pour l'ordinateur. Il n'y a rien à installer.",
    },
  ],
};
