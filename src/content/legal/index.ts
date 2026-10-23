import type { Locale } from "@/i18n/config";
import { companyText } from "@/lib/legal";

import { en } from "./en";
import { fr } from "./fr";
import { nl } from "./nl";
import type { LegalContent } from "./types";

export type { LegalContent, LegalDocument, LegalSection } from "./types";

export type LegalKind = "privacy" | "cookies" | "terms" | "notice";

/** Shown where a company detail hasn't been filled in yet (src/lib/legal.ts). */
const PLACEHOLDER: Record<Locale, string> = {
  nl: "[nog in te vullen]",
  fr: "[à compléter]",
  en: "[to be completed]",
};

const BUILDERS = { nl, fr, en };

export function legalContent(locale: Locale): LegalContent {
  return BUILDERS[locale](companyText(PLACEHOLDER[locale]));
}
