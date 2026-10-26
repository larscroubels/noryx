import { getLocales } from "expo-localization";
import * as SecureStore from "expo-secure-store";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { INTL_LOCALE } from "@/i18n/config";
import { dictionaries, type Dictionary } from "@/i18n/dictionaries";

import { en } from "./en";
import { fr } from "./fr";
import { resolveLocale, type AppLocale } from "./locale";
import { nl } from "./nl";

export type AppStrings = typeof en;
const APP_STRINGS: Record<AppLocale, AppStrings> = { en, nl, fr };
const OVERRIDE_KEY = "noryx.locale";

type I18n = {
  /** The website's dictionary for this language. */
  t: Dictionary;
  /** App-only strings. */
  app: AppStrings;
  locale: AppLocale;
  /** Intl locale for formatting, e.g. "nl-BE". */
  intl: string;
  override: AppLocale | null;
  setOverride: (locale: AppLocale | null) => void;
  /** The salon's language on the salon side (null on the client side). */
  setSalonLocale: (locale: string | null) => void;
};

const I18nContext = createContext<I18n | null>(null);

/** Language = the user's choice ?? the salon's language ?? the phone's language. */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [override, setOverrideState] = useState<AppLocale | null>(null);
  const [salonLocale, setSalonLocaleState] = useState<AppLocale | null>(null);

  useEffect(() => {
    void SecureStore.getItemAsync(OVERRIDE_KEY).then((stored) => {
      if (stored) setOverrideState(resolveLocale(stored));
    });
  }, []);

  const setOverride = useCallback((locale: AppLocale | null) => {
    setOverrideState(locale);
    void (locale
      ? SecureStore.setItemAsync(OVERRIDE_KEY, locale)
      : SecureStore.deleteItemAsync(OVERRIDE_KEY));
  }, []);

  const setSalonLocale = useCallback((locale: string | null) => {
    setSalonLocaleState(locale ? resolveLocale(locale) : null);
  }, []);

  const value = useMemo<I18n>(() => {
    const locale = override ?? salonLocale ?? resolveLocale(getLocales()[0]?.languageTag);
    return {
      t: dictionaries[locale],
      app: APP_STRINGS[locale],
      locale,
      intl: INTL_LOCALE[locale],
      override,
      setOverride,
      setSalonLocale,
    };
  }, [override, salonLocale, setOverride, setSalonLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): I18n {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useT() must be used inside <I18nProvider>.");
  return value;
}
