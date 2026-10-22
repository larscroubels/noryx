import type { BadgeTone } from "@/components/ui/badge";
import type { Dictionary } from "@/i18n/dictionaries";

/**
 * Gift card helpers shared by the workspace and the public pages. The database
 * (supabase/migrations/20261023090000_gift_cards.sql) owns every rule about value
 * and status; this module only presents them.
 */

export type GiftCardStatus = "pending" | "active" | "blocked" | "cancelled";
export type GiftCardDisplayStatus = GiftCardStatus | "used" | "expired";

/** What a card means to people: an active card can also be used up or expired. */
export function displayStatus(card: {
  status: GiftCardStatus;
  balance_cents: number;
  expires_at: string | null;
}): GiftCardDisplayStatus {
  if (card.status !== "active") return card.status;
  if (card.expires_at && new Date(card.expires_at).getTime() <= Date.now()) return "expired";
  if (card.balance_cents === 0) return "used";
  return "active";
}

export const GIFT_CARD_TONE: Record<GiftCardDisplayStatus, BadgeTone> = {
  pending: "warning",
  active: "success",
  used: "neutral",
  expired: "neutral",
  blocked: "danger",
  cancelled: "neutral",
};

/** Codes look like ABCD-EFGH-JKMN-PQRS; anything else can't be valid. */
export const GIFT_CARD_CODE_PATTERN =
  /^[0-9A-Za-z]{4}-?[0-9A-Za-z]{4}-?[0-9A-Za-z]{4}-?[0-9A-Za-z]{4}$/;

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
  if (error.message === "gift_card_insufficient" && error.details && /^\d+$/.test(error.details))
    return g.insufficient(money(Number(error.details)));
  if (error.message && g.errors[error.message]) return g.errors[error.message]!;
  if (error.code === "42501") return g.noPermission;
  return g.failed;
}
