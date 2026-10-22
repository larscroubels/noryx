import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { ACTIVE_BUSINESS_COOKIE, getMemberships } from "@/lib/auth/session";
import { getPublicBusiness } from "@/lib/booking/public";
import { isReservedSlug } from "@/lib/slug";

import {
  INTL_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  localeFromIntl,
  PATHNAME_HEADER,
  type Locale,
} from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

/** Language the salon chose for its workspace (Settings › Business profile). */
async function workspaceLocale(): Promise<Locale | null> {
  const memberships = await getMemberships();
  if (memberships.length === 0) return null;
  const preferred = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value;
  const membership = memberships.find((m) => m.business.id === preferred) ?? memberships[0]!;
  return localeFromIntl(membership.business.locale);
}

/**
 * The interface language for this request:
 * - in the workspace (/app), always the salon's own language;
 * - on a salon's public pages, the visitor's choice (cookie), else the salon's language;
 * - everywhere else, the visitor's choice, else their browser language.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const store = await cookies();
  const requestHeaders = await headers();
  const segment = (requestHeaders.get(PATHNAME_HEADER) ?? "").split("/")[1] ?? "";

  if (segment === "app") {
    const salon = await workspaceLocale();
    if (salon) return salon;
  }
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  if (segment && !isReservedSlug(segment)) {
    const salon = localeFromIntl((await getPublicBusiness(segment))?.locale);
    if (salon) return salon;
  }
  return localeFromAcceptLanguage(requestHeaders.get("accept-language"));
});

export async function getT(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

/** Dictionary plus the Intl locale for date/number formatting. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale], intl: INTL_LOCALE[locale] };
}
