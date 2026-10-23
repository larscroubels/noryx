import type { CompanyText } from "@/lib/legal";

import type { LegalContent } from "./types";

/** French translation of the Dutch legal texts. */
export function fr(c: CompanyText): LegalContent {
  const contact = c.email
    ? `[${c.email}](mailto:${c.email}) ou le [formulaire de contact](/help#contact)`
    : "le [formulaire de contact](/help#contact)";
  return {
    updated: (date) => `Dernière mise à jour le ${date}`,
    contents: "Sommaire",
    translationNote: "Ceci est une traduction. En cas de différence, la version néerlandaise fait foi.",
    privacy: {
      metaTitle: "Déclaration de confidentialité",
      title: "Déclaration de confidentialité",
      lead: "Comment NORYX traite les données personnelles : des visiteurs de ce site, des salons et de leur équipe, et des clients qui réservent dans un salon.",
      sections: [
        {
          id: "who",
          title: "Qui est responsable ?",
          paragraphs: [
            `NORYX est exploité par **${c.name}** (${c.legalForm}), ${c.address}, numéro d'entreprise ${c.enterpriseNumber}. Dans cette déclaration, nous l'appelons « NORYX » ou « nous ».`,
            `Posez vos questions sur la vie privée via ${contact}.`,
          ],
        },
        {
          id: "roles",
          title: "Deux rôles",
          paragraphs: [
            "Pour les données des visiteurs de ce site et des comptes des salons et de leurs membres d'équipe, nous sommes **responsable du traitement**.",
            "Pour les données des clients d'un salon (réservations, coordonnées, notes), c'est le **salon** qui est responsable du traitement. NORYX traite ces données uniquement pour le compte du salon, en tant que **sous-traitant**, selon l'accord de traitement repris dans nos [conditions générales](/terms#processing).",
          ],
        },
        {
          id: "data",
          title: "Quelles données, pourquoi et sur quelle base",
          paragraphs: [],
          list: [
            "**Votre compte** : nom, adresse e-mail et mot de passe (jamais conservé de manière lisible). Nécessaire pour vous donner accès à NORYX ; base : exécution du contrat.",
            "**Votre salon** : données de l'entreprise, adresse, horaires, prestations, prix, plannings, heures prestées et membres de l'équipe. Nécessaire pour fournir le service ; base : exécution du contrat.",
            "**Le formulaire de contact** : nom, adresse e-mail, sujet et message. Pour répondre à votre question ; base : notre intérêt légitime à traiter les questions, ou des mesures précontractuelles.",
            "**L'assistant IA du site** : les questions que vous tapez. Nous les envoyons à Anthropic pour produire une réponse ; nous ne conservons pas la conversation nous-mêmes. N'y partagez pas de données personnelles. Base : notre intérêt légitime à aider rapidement les visiteurs.",
            "**Données techniques**, comme votre adresse IP et l'heure d'une requête. Pour sécuriser le site et limiter les abus, par exemple en limitant les tentatives de connexion ; base : notre intérêt légitime.",
            "**Cookies** : uniquement ce qu'il faut pour vous connecter et retenir votre langue. Voir la [politique en matière de cookies](/cookies).",
          ],
        },
        {
          id: "salon-clients",
          title: "Quand vous réservez dans un salon",
          paragraphs: [
            "Quand vous réservez un rendez-vous, commandez dans la boutique en ligne ou achetez une carte cadeau auprès d'un salon qui utilise NORYX, votre nom, votre adresse e-mail, votre numéro de téléphone et les détails de votre rendez-vous ou commande sont transmis à **ce salon**. Le salon décide de leur utilisation et est votre premier interlocuteur.",
            "Grâce au lien privé de votre réservation, vous pouvez consulter votre rendez-vous et l'annuler dans le délai du salon. Pour consulter ou effacer vos données, adressez-vous au salon : il peut les exporter ou les supprimer dans NORYX. Si cela ne fonctionne pas, contactez-nous et nous aiderons le salon.",
            "Vous ne recevez des offres d'un salon que si vous cochez vous-même cette case lors de la réservation.",
          ],
        },
        {
          id: "processors",
          title: "Qui traite des données pour nous ?",
          paragraphs: [
            "Nous ne vendons pas de données personnelles et ne les utilisons pas pour la publicité. Ces prestataires traitent des données uniquement sur nos instructions :",
          ],
          list: [
            `**Supabase** : base de données, connexion et stockage de fichiers. Région des données : ${c.dataRegion}.`,
            "**Vercel** : hébergement du site.",
            "**Anthropic** : l'assistant IA du site, uniquement pour les questions que vous y tapez.",
          ],
        },
        {
          id: "transfers",
          title: "Données hors d'Europe",
          paragraphs: [
            "Supabase, Vercel et Anthropic sont des entreprises établies aux États-Unis. Lorsque des données sont traitées en dehors de l'Espace économique européen, cela se fait uniquement avec les garanties exigées par le RGPD, comme le cadre de protection des données UE-États-Unis ou les clauses contractuelles types de la Commission européenne.",
          ],
        },
        {
          id: "retention",
          title: "Combien de temps conservons-nous les données ?",
          paragraphs: [],
          list: [
            "**Données du compte** : tant que votre compte existe. Si vous demandez leur suppression, nous les effaçons, sauf ce que la loi nous oblige à conserver.",
            "**Données d'un salon et de ses clients** : tant que le salon utilise NORYX. Le salon peut exporter ou effacer lui-même les données des clients ; les enregistrements financiers restent alors conservés de manière anonymisée pour la comptabilité du salon.",
            "**Messages via le formulaire de contact** : le temps nécessaire pour traiter votre question. Vous pouvez toujours demander la suppression de votre message.",
            "**Questions à l'assistant IA** : nous ne les conservons pas. Anthropic les traite pour produire la réponse.",
            "**Journaux techniques** : brièvement, selon les délais de conservation de nos hébergeurs.",
          ],
        },
        {
          id: "security",
          title: "Sécurité",
          paragraphs: [
            "Les connexions sont chiffrées (HTTPS). Les mots de passe ne sont jamais conservés de manière lisible. Les données de chaque salon sont strictement séparées de celles des autres salons dans la base de données, et les membres de l'équipe ne voient que ce que leur rôle permet. Les modifications importantes sont enregistrées dans un journal d'audit.",
          ],
        },
        {
          id: "rights",
          title: "Vos droits",
          paragraphs: [
            `Vous avez le droit d'accéder à vos données, de les faire rectifier ou effacer, d'en limiter le traitement, de vous y opposer et de les emporter. Envoyez votre demande via ${contact}. Nous répondons dans un délai d'un mois et pouvons vous demander de confirmer votre identité.`,
            "S'agit-il de vos données en tant que client d'un salon ? Adressez d'abord votre demande à ce salon (voir [Quand vous réservez dans un salon](#salon-clients)).",
          ],
        },
        {
          id: "complaint",
          title: "Introduire une plainte",
          paragraphs: [
            "Si vous n'êtes pas d'accord avec la façon dont nous traitons vos données, dites-le-nous d'abord. Vous pouvez aussi introduire une plainte auprès de l'Autorité de protection des données, rue de la Presse 35, 1000 Bruxelles, [contact@apd-gba.be](mailto:contact@apd-gba.be), [www.autoriteprotectiondonnees.be](https://www.autoriteprotectiondonnees.be).",
          ],
        },
        {
          id: "changes",
          title: "Modifications",
          paragraphs: [
            "Les comptes NORYX sont destinés aux entrepreneurs et à leurs collaborateurs, pas aux enfants. Lorsque nous modifions cette déclaration, la date en haut change ; nous annonçons les changements importants dans NORYX.",
          ],
        },
      ],
    },
    cookies: {
      metaTitle: "Politique en matière de cookies",
      title: "Politique en matière de cookies",
      lead: "NORYX utilise uniquement les cookies nécessaires au fonctionnement du site et de votre espace. Aucun cookie de statistiques, de publicité ou de réseaux sociaux.",
      sections: [
        {
          id: "what",
          title: "Que sont les cookies ?",
          paragraphs: [
            "Les cookies sont de petits fichiers texte qu'un site conserve dans votre navigateur, par exemple pour se souvenir que vous êtes connecté.",
          ],
        },
        {
          id: "list",
          title: "Quels cookies utilisons-nous ?",
          paragraphs: [],
          table: {
            headers: ["Cookie", "Finalité", "Durée", "Type"],
            rows: [
              [
                "sb-…-auth-token",
                "Vous garde connecté (Supabase). Peut être conservé en plusieurs parties (.0, .1).",
                "Jusqu'à la déconnexion, au maximum 400 jours",
                "Strictement nécessaire",
              ],
              [
                "sb-…-auth-token-code-verifier",
                "Sécurise la confirmation de votre adresse e-mail et la réinitialisation de votre mot de passe.",
                "Jusqu'à la fin de cette étape",
                "Strictement nécessaire",
              ],
              [
                "noryx_business",
                "Retient le salon dans lequel vous travaillez si vous avez accès à plusieurs salons.",
                "Jusqu'à la fermeture du navigateur",
                "Strictement nécessaire",
              ],
              ["noryx_locale", "Retient la langue choisie (NL, FR ou EN).", "1 an", "Fonctionnel, à votre demande"],
              ["noryx_cookie_consent", "Retient votre choix dans la bannière cookies (refuser ou accepter).", "6 mois", "Strictement nécessaire"],
            ],
          },
        },
        {
          id: "consent",
          title: "Consentement",
          paragraphs: [
            "Les cookies ci-dessus ne nécessitent pas de consentement : ils sont nécessaires ou retiennent un choix que vous avez fait. Dans la bannière cookies, vous choisissez si nous pouvons aussi utiliser à l'avenir d'autres cookies, par exemple pour des statistiques. Nous n'en utilisons aucun pour le moment : refuser ou accepter ne change donc rien au fonctionnement de NORYX. Vous pouvez modifier votre choix à tout moment via « Paramètres des cookies » en bas de page. Si nous utilisons un jour de tels cookies, ils ne se chargeront qu'après votre consentement et nous adapterons cette politique.",
          ],
        },
        {
          id: "third-parties",
          title: "Pas de cookies de tiers",
          paragraphs: [
            "Nous ne chargeons pas de scripts ou de contenus de tiers qui placent des cookies : pas de régies publicitaires, pas de boutons de réseaux sociaux et pas de services d'analyse. Les polices viennent elles aussi de notre propre serveur.",
          ],
        },
        {
          id: "manage",
          title: "Supprimer les cookies",
          paragraphs: [
            "Vous pouvez toujours supprimer ou bloquer les cookies dans les réglages de votre navigateur. Si vous bloquez les cookies ci-dessus, vous ne pourrez pas vous connecter à NORYX.",
            `Des questions ? Utilisez ${contact}. Pour en savoir plus sur les données personnelles, lisez la [déclaration de confidentialité](/privacy).`,
          ],
        },
      ],
    },
    terms: {
      metaTitle: "Conditions générales",
      title: "Conditions générales",
      lead: "L'accord entre NORYX et les salons, barbiers et indépendants qui utilisent NORYX.",
      sections: [
        {
          id: "scope",
          title: "Champ d'application",
          paragraphs: [
            "Ces conditions s'appliquent à toute utilisation de NORYX par une entreprise ou un indépendant (« le client »). En créant un compte, vous les acceptez, également au nom de l'entreprise que vous représentez. NORYX est destiné à un usage professionnel.",
            "Celui qui réserve ou commande dans un salon conclut cet accord avec le salon, et non avec NORYX.",
          ],
        },
        {
          id: "service",
          title: "Le service",
          paragraphs: [
            "NORYX est un logiciel dans le navigateur pour gérer rendez-vous, clients, équipe et activité, avec une page de réservation publique. Le contenu du service est décrit sur le site et sur la [page des tarifs](/pricing). Les fonctions indiquées « En développement » n'en font pas encore partie.",
            "NORYX ne traite pas lui-même de paiements et n'envoie pas encore d'e-mails ou de SMS au nom du salon. Ce qui est enregistré dans NORYX, comme les paiements reçus au salon, est un enregistrement, pas une comptabilité ni une déclaration TVA.",
          ],
        },
        {
          id: "account",
          title: "Compte et accès",
          paragraphs: [],
          list: [
            "Vous fournissez des données exactes et les tenez à jour.",
            "Vous gardez vos identifiants secrets. Chaque membre de l'équipe utilise son propre compte.",
            "Vous êtes responsable des membres d'équipe que vous invitez et des droits que vous leur donnez.",
            "Si vous soupçonnez un abus de votre compte, prévenez-nous immédiatement.",
          ],
        },
        {
          id: "plans",
          title: "Essai, abonnements et prix",
          paragraphs: [
            "Une nouvelle entreprise reçoit 14 jours d'accès gratuit à Pro, sans données de paiement. Ensuite, elle continue avec Basic, sauf si elle choisit un autre abonnement.",
            "Les prix mensuels ne sont pas encore fixés. Tant que le paiement via NORYX n'est pas possible, rien n'est facturé. Nous annoncerons les prix et vous demanderons votre accord avant tout paiement.",
            "Les options, comme un domaine propre avec une page web sur mesure (paiement unique, uniquement avec Pro) ou une newsletter (par mois), sont convenues séparément et livrées uniquement après votre accord.",
          ],
        },
        {
          id: "use",
          title: "Utilisation de NORYX",
          paragraphs: ["Vous utilisez NORYX conformément à la loi et à ces conditions. En particulier, vous ne devez pas :"],
          list: [
            "conserver ou diffuser des contenus ou données illicites ;",
            "envoyer des offres à des clients sans leur consentement ;",
            "tenter d'accéder aux données d'autrui ou de perturber le service ;",
            "copier, revendre ou imiter le logiciel.",
          ],
        },
        {
          id: "own-content",
          title: "Votre responsabilité en tant que salon",
          paragraphs: [
            "Vous fixez vous-même vos prix, vos conditions d'annulation et de cartes cadeaux et votre communication avec vos clients, et veillez à ce qu'ils respectent la loi. Vous êtes responsable du traitement des données de vos clients (voir ci-dessous).",
          ],
        },
        {
          id: "processing",
          title: "Accord de traitement des données",
          paragraphs: [
            "Pour les données personnelles de vos clients et membres d'équipe que vous conservez dans NORYX, vous êtes responsable du traitement et NORYX est sous-traitant au sens de l'article 28 du Règlement général sur la protection des données (RGPD). Cet article tient lieu d'accord de traitement.",
          ],
          list: [
            "**Objet et durée** : la fourniture de NORYX, tant que votre compte existe.",
            "**Données et personnes concernées** : coordonnées, rendez-vous, commandes, cartes cadeaux, notes et enregistrements de paiement de vos clients, et données de vos membres d'équipe comme le nom, l'adresse e-mail, les plannings et les heures prestées.",
            "**Instructions** : NORYX traite les données uniquement pour fournir le service et selon vos instructions, telles que vous les donnez via NORYX.",
            "**Confidentialité** : toute personne chez NORYX ayant accès aux données est tenue au secret.",
            "**Sécurité** : des mesures techniques et organisationnelles appropriées, dont des connexions chiffrées, une séparation stricte entre salons dans la base de données, des rôles et droits, et un journal d'audit.",
            "**Sous-traitants ultérieurs** : Supabase (base de données, connexion, stockage) et Vercel (hébergement). Nous annonçons à l'avance tout nouveau sous-traitant ; vous pouvez vous y opposer.",
            "**Droits des personnes concernées** : NORYX offre des outils pour exporter ou effacer les données d'un client, et vous aide pour les demandes que vous recevez.",
            "**Violations de données** : nous signalons une violation de données personnelles dans les meilleurs délais, avec les informations nécessaires à vos propres notifications.",
            "**Fin** : à la fin de l'accord, vous pouvez exporter vos données ; ensuite, nous les supprimons, sauf ce que la loi nous oblige à conserver.",
            "**Contrôle** : nous vous fournissons les informations nécessaires pour vérifier que nous respectons ces engagements.",
          ],
        },
        {
          id: "availability",
          title: "Disponibilité et assistance",
          paragraphs: [
            "Nous faisons de notre mieux pour que NORYX soit toujours disponible, sans garantir un fonctionnement ininterrompu. Le service peut être brièvement indisponible pour maintenance. L'assistance est disponible via la [page Aide](/help).",
          ],
        },
        {
          id: "liability",
          title: "Responsabilité",
          paragraphs: [
            "NORYX est responsable des dommages qui sont la conséquence directe d'une faute de NORYX. Nous ne sommes pas responsables des dommages indirects, comme un manque à gagner ou une perte de clients, ni des dommages dus à une mauvaise utilisation, aux données que vous saisissez vous-même ou à des pannes chez des tiers.",
            "Notre responsabilité est limitée aux montants que vous avez payés à NORYX au cours des douze mois précédant le dommage. Ces limitations ne s'appliquent pas en cas de dol ou de fraude.",
          ],
        },
        {
          id: "ip",
          title: "Propriété intellectuelle",
          paragraphs: [
            "Le logiciel, le design et le nom NORYX restent la propriété de NORYX. Vous recevez un droit non transférable d'utiliser NORYX tant que votre compte existe. Vos données et contenus restent les vôtres.",
          ],
        },
        {
          id: "termination",
          title: "Durée et résiliation",
          paragraphs: [
            "Vous pouvez faire clôturer votre compte à tout moment via le [formulaire de contact](/help#contact). Vous pouvez d'abord exporter vos données.",
            "En cas de violation grave ou répétée de ces conditions ou d'abus, nous pouvons suspendre ou clôturer un compte. Sauf urgence, nous vous prévenons d'abord.",
          ],
        },
        {
          id: "changes",
          title: "Modifications",
          paragraphs: [
            "Nous pouvons modifier ces conditions. Nous annonçons les changements importants au moins 30 jours à l'avance. Si vous continuez à utiliser NORYX ensuite, les nouvelles conditions s'appliquent.",
          ],
        },
        {
          id: "law",
          title: "Droit applicable",
          paragraphs: [
            "Ces conditions sont régies par le droit belge. En cas de litige, nous cherchons d'abord une solution ensemble ; à défaut, les tribunaux de l'arrondissement judiciaire du siège de NORYX sont compétents.",
          ],
        },
      ],
    },
    notice: {
      metaTitle: "Informations légales",
      title: "Informations légales",
      lead: "Qui exploite NORYX et comment nous joindre.",
      sections: [
        {
          id: "operator",
          title: "Exploitant",
          paragraphs: [],
          list: [
            `Nom : ${c.name}`,
            `Forme juridique : ${c.legalForm}`,
            `Siège : ${c.address}`,
            `Numéro d'entreprise (BCE) : ${c.enterpriseNumber}`,
            ...(c.vatNumber ? [`Numéro de TVA : ${c.vatNumber}`] : []),
          ],
        },
        { id: "contact", title: "Contact", paragraphs: [`Vous pouvez nous joindre via ${contact}.`] },
        {
          id: "hosting",
          title: "Hébergement",
          paragraphs: [
            `Le site est hébergé par Vercel Inc. Les données sont conservées chez Supabase Inc., région ${c.dataRegion}.`,
          ],
        },
        {
          id: "documents",
          title: "Documents",
          paragraphs: [
            "Voir aussi la [déclaration de confidentialité](/privacy), la [politique en matière de cookies](/cookies) et les [conditions générales](/terms).",
          ],
        },
      ],
    },
  };
}
