import type { assistant as en } from "../en/assistant";

export const assistant: typeof en = {
  open: "Stel een vraag",
  title: "NORYX-assistent",
  subtitle: "Antwoorden op basis van de informatie op deze website.",
  close: "De assistent sluiten",
  inputLabel: "Je vraag",
  placeholder: "Vraag alles over NORYX…",
  send: "Versturen",
  greeting:
    "Hallo! Ik beantwoord je vragen over NORYX: functies, abonnementen, online boeken en hoe alles werkt. Wat wil je weten?",
  suggestions: [
    "Wat is het verschil tussen Basic en Pro?",
    "Hoe werkt de gratis proefperiode?",
    "Kunnen klanten boeken zonder account?",
  ],
  thinking: "Even denken…",
  error: "Er ging iets mis. Probeer het opnieuw.",
  rateLimited: "Je stelt veel vragen tegelijk. Wacht even.",
  notConfigured:
    "De AI-assistent staat nog niet aan. Deze antwoorden uit onze veelgestelde vragen en het hulpcentrum kunnen helpen:",
  noMatch: "Daar vond ik geen antwoord op. Bekijk de veelgestelde vragen of het hulpcentrum.",
  readMore: "Lees meer",
  disclaimer: "AI-antwoorden kunnen fouten bevatten. Je vragen worden verwerkt door Anthropic, dus deel geen persoonsgegevens.",
  you: "Jij",
  bot: "Assistent",
};
