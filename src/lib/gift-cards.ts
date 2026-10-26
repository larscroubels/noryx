import type { BadgeTone } from "@/components/ui/badge";

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

export {
  GIFT_CARD_CODE_PATTERN,
  giftCardErrorMessage,
  normaliseGiftCardCode,
} from "./gift-card-codes";
