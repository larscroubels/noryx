import type { Dictionary } from "@/i18n/dictionaries";

/** Gift card code and error helpers without UI imports (also used by the NORYX app). */

/** Codes look like ABCD-EFGH-JKMN-PQRS; anything else can't be valid. */
export const GIFT_CARD_CODE_PATTERN =
  /^[0-9A-Za-z]{4}[\s-]?[0-9A-Za-z]{4}[\s-]?[0-9A-Za-z]{4}[\s-]?[0-9A-Za-z]{4}$/;

export function normaliseGiftCardCode(input: string) {
  return input.replace(/[\s-]/g, "").toUpperCase();
}

/** Safe message for a database error from one of the gift card functions. */
export function giftCardErrorMessage(
  error: { message?: string; code?: string; details?: string } | null,
  t: Dictionary,
  money: (cents: number) => string,
) {
  const g = t.giftCards;
  if (!error) return g.failed;
  const amount = error.details && /^\d+$/.test(error.details) ? Number(error.details) : null;
  if (error.message === "gift_card_insufficient" && amount !== null)
    return g.insufficient(money(amount));
  if (error.message === "gift_card_exceeds_due" && amount !== null)
    return g.redeem.tooMuch(money(amount));
  if (error.message && g.errors[error.message]) return g.errors[error.message]!;
  if (error.code === "42501") return g.noPermission;
  return g.failed;
}
