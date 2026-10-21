"use client";

import { createContext, useContext, type ReactNode } from "react";

import { INTL_LOCALE, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

const LocaleContext = createContext<Locale>("nl");

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  return useContext(LocaleContext);
}

export function useT(): Dictionary {
  return dictionaries[useContext(LocaleContext)];
}

export function useIntlLocale() {
  return INTL_LOCALE[useContext(LocaleContext)];
}
