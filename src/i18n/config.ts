/** Interface languages. Dutch is the default for NORYX's Belgian launch market. */
export const LOCALES = ["nl", "fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "nl";
export const LOCALE_COOKIE = "noryx_locale";

/** Intl locale used to format dates and numbers for each interface language. */
export const INTL_LOCALE: Record<Locale, string> = { nl: "nl-BE", fr: "fr-BE", en: "en-GB" };

export const LOCALE_LABELS: Record<Locale, { short: string; name: string }> = {
  nl: { short: "NL", name: "Nederlands" },
  fr: { short: "FR", name: "Français" },
  en: { short: "EN", name: "English" },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/** Interface language of a business locale such as "fr-BE", or null when unsupported. */
export function localeFromIntl(intl: string | null | undefined): Locale | null {
  const language = intl?.slice(0, 2).toLowerCase();
  return isLocale(language) ? language : null;
}

/** Request header the proxy sets so the root layout knows which route it renders. */
export const PATHNAME_HEADER = "x-noryx-pathname";

/** Picks a supported language from an Accept-Language header (first match wins). */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  for (const part of header.split(",")) {
    const language = part.split(";")[0]?.trim().slice(0, 2).toLowerCase();
    if (isLocale(language)) return language;
  }
  return DEFAULT_LOCALE;
}
