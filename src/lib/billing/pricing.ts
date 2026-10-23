/**
 * Fixed amounts shown on the pricing page. Monthly plan prices are not set yet;
 * these one-off and add-on amounts were decided by the product owner.
 * Integer cents, like all money in NORYX.
 */
export const ULTRA_SETUP_FEE_CENTS = 15_000;
export const NEWSLETTER_MONTHLY_CENTS = 500;

/** Whole euros read better on a pricing page ("€150" rather than "€150.00"). */
export function formatWholeEuros(cents: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
