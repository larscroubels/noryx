import { DEFAULT_LOCALE, LOCALES, type Locale } from "@/i18n/config";

export type AppLocale = Locale;

/** "fr-BE" → "fr"; anything NORYX doesn't speak falls back to Dutch, as on the website. */
export function resolveLocale(tag: string | null | undefined): AppLocale {
  const language = tag?.slice(0, 2).toLowerCase();
  return (LOCALES as readonly string[]).includes(language ?? "")
    ? (language as AppLocale)
    : DEFAULT_LOCALE;
}
