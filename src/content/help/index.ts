import type { Locale } from "@/i18n/config";

import { en } from "./en";
import { fr } from "./fr";
import hotspotData from "./hotspots.json";
import { nl } from "./nl";
import type { HelpContent, HelpCourse } from "./types";

export type { HelpContent, HelpCourse, HelpStep, HelpFaq, HelpImage } from "./types";

export const helpContent: Record<Locale, HelpContent> = { nl, fr, en };

export function getCourse(locale: Locale, slug: string): HelpCourse | undefined {
  return helpContent[locale].courses.find((course) => course.slug === slug);
}

/**
 * Which language's screenshots each interface language shows. French reuses the English
 * captures until `scripts/capture-help-screenshots.mjs` has produced public/help/fr/.
 */
export const SCREENSHOT_LOCALE: Record<Locale, Locale> = { nl: "nl", fr: "en", en: "en" };

/** A clickable area on a screenshot, in percent of its width and height. */
export type HelpHotspot = { x: number; y: number; w: number; h: number };

const hotspots = hotspotData as Partial<Record<Locale, Record<string, HelpHotspot[]>>>;

/** Where the animated cursor clicks on a screenshot (measured when the screenshots are captured). */
export function helpHotspots(locale: Locale, name: string): HelpHotspot[] {
  return hotspots[SCREENSHOT_LOCALE[locale]]?.[name] ?? [];
}

/** Public path of a course screenshot in the visitor's language. */
export function helpImageSrc(locale: Locale, name: string) {
  return `/help/${SCREENSHOT_LOCALE[locale]}/${name}.webp`;
}
