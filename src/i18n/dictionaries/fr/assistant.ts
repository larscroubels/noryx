import type { assistant as en } from "../en/assistant";

export const assistant: typeof en = {
  open: "Poser une question",
  title: "Assistant NORYX",
  subtitle: "Des réponses basées sur les informations de ce site.",
  close: "Fermer l'assistant",
  inputLabel: "Votre question",
  placeholder: "Posez une question sur NORYX…",
  send: "Envoyer",
  greeting:
    "Bonjour ! Je réponds à vos questions sur NORYX : fonctionnalités, abonnements, réservation et fonctionnement. Que souhaitez-vous savoir ?",
  suggestions: [
    "Quelle est la différence entre Basic et Pro ?",
    "Comment fonctionne l'essai gratuit ?",
    "Les clients peuvent-ils réserver sans compte ?",
  ],
  thinking: "Je réfléchis…",
  error: "Une erreur s'est produite. Veuillez réessayer.",
  rateLimited: "Vous posez beaucoup de questions à la fois. Patientez un instant.",
  notConfigured:
    "L'assistant IA n'est pas encore activé. Ces réponses de notre FAQ et du centre d'aide peuvent vous aider :",
  noMatch: "Je n'ai pas trouvé de réponse. Consultez la FAQ ou le centre d'aide.",
  readMore: "En savoir plus",
  disclaimer:
    "Les réponses de l'IA peuvent contenir des erreurs. Vérifiez les détails importants dans le centre d'aide.",
  you: "Vous",
  bot: "Assistant",
};
