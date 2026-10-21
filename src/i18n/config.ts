/** Interface languages. Dutch is the default for NORYX's Belgian launch market. */
export const LOCALES = ["nl", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_COOKIE = "noryx_locale";

/** Intl locale used to format dates and numbers for each interface language. */
export const INTL_LOCALE: Record<Locale, string> = { nl: "nl-BE", en: "en-GB" };

export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  nl: { short: "NL", name: "Nederlands" },
  en: { short: "EN", name: "English" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Picks a supported language from an Accept-Language header (first match wins). */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(",")) {
    const language = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}
