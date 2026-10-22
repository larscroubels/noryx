import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import {
  INTL_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** The visitor's interface language: their choice (cookie), else their browser language. */
export const getLocale = cache(async (): Promise<Locale> => {
  const chosen = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
});

export async function getT(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

/** Dictionary plus the Intl locale for date/number formatting. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale], intl: INTL_LOCALE[locale] };
}
