import type { Locale } from "@/i18n/config";

import { en } from "./en";
import { nl } from "./nl";
import type { HelpContent, HelpCourse } from "./types";

export type { HelpContent, HelpCourse, HelpStep, HelpFaq, HelpImage } from "./types";

export const helpContent: Record<Locale, HelpContent> = { nl, en };

export function getCourse(locale: Locale, slug: string): HelpCourse | undefined {
  return helpContent[locale].courses.find((course) => course.slug === slug);
}

/** Public path of a course screenshot in the visitor's language. */
export function helpImageSrc(locale: Locale, name: string) {
  return `/help/${locale}/${name}.webp`;
}
