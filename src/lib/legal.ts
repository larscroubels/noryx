/**
 * The business that runs NORYX, as shown on the legal pages. Belgian law requires
 * the name, address, enterprise number (KBO) and a contact on the website
 * (Code of Economic Law, Book XII). Fill these in before launch; a missing value is
 * shown as "to be completed" rather than invented.
 */
export const COMPANY = {
  /** Official name of the person or company running NORYX, e.g. "NORYX BV". */
  name: null as string | null,
  /** Legal form, e.g. "besloten vennootschap (BV)" or "eenmanszaak". */
  legalForm: null as string | null,
  /** Registered office: street, number, postcode, municipality. */
  address: null as string | null,
  /** KBO enterprise number, e.g. "0123.456.789". */
  enterpriseNumber: null as string | null,
  /** VAT number, if the business is VAT-registered, e.g. "BE0123.456.789". */
  vatNumber: null as string | null,
  /** Public contact email. Without one, people use the contact form on /help. */
  email: null as string | null,
  /** Region of the Supabase project that stores the data, e.g. "Frankfurt (EU)". */
  dataRegion: null as string | null,
};

/** The visitor's choice in the cookie banner (listed in the cookie policy). */
export const COOKIE_CONSENT_COOKIE = "noryx_cookie_consent";
/** How long a choice is remembered before the banner asks again. */
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 182;
/** Sent when "Cookie settings" is clicked, so the banner opens again. */
export const COOKIE_SETTINGS_EVENT = "noryx:cookie-settings";

export type CookieConsent = "necessary" | "all";

/**
 * Reads the stored choice. NORYX sets no optional cookies today; anything optional
 * added later (statistics, marketing) may only load when this returns "all".
 */
export function parseCookieConsent(value: string | undefined): CookieConsent | null {
  return value === "all" || value === "necessary" ? value : null;
}

/** Date the legal texts were last changed (YYYY-MM-DD). */
export const LEGAL_UPDATED = "2026-10-24";

/** Company details as text, with a placeholder where a value is still missing. */
export function companyText(placeholder: string) {
  const value = (field: keyof typeof COMPANY) => COMPANY[field] ?? placeholder;
  return {
    name: value("name"),
    legalForm: value("legalForm"),
    address: value("address"),
    enterpriseNumber: value("enterpriseNumber"),
    vatNumber: COMPANY.vatNumber,
    email: COMPANY.email,
    dataRegion: value("dataRegion"),
  };
}

export type CompanyText = ReturnType<typeof companyText>;
