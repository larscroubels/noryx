"use server";

import { headers } from "next/headers";
import type { z } from "zod";

import { getT } from "@/i18n/server";
import { getGiftCardOffer } from "@/lib/booking/public";
import { normaliseGiftCardCode } from "@/lib/gift-cards";
import { logger } from "@/lib/logger";
import { processNotificationsForGiftCard } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { giftCardCodeField, giftCardOrderSchema } from "@/lib/validation/gift-card";

async function ipKey(scope: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}

export type GiftCardOrderResult =
  | { ok: true; number: number; amountCents: number; currency: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function submitGiftCardOrder(
  input: z.input<ReturnType<typeof giftCardOrderSchema>>,
): Promise<GiftCardOrderResult> {
  const t = await getT();
  const g = t.giftCards;
  if (!rateLimit(await ipKey("gift-order"), { limit: 5, windowMs: 10 * 60_000 }).allowed)
    return { ok: false, message: g.tooMany };
  const parsed = giftCardOrderSchema(t).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues)
      (fieldErrors[String(issue.path[0])] ??= []).push(issue.message);
    return { ok: false, message: t.booking.errors.checkDetails, fieldErrors };
  }
  const d = parsed.data;
  const offer = await getGiftCardOffer(d.slug);
  const admin = createAdminClient();
  if (!offer || !admin) return { ok: false, message: g.errors.gift_cards_unavailable! };

  // The amount is checked against the salon's own settings in the database.
  const { data, error } = await admin.rpc("create_online_gift_card", {
    p_business_id: offer.business_id,
    p_amount_cents: d.amountCents,
    p_buyer_name: d.buyerName,
    p_buyer_email: d.buyerEmail,
    p_buyer_phone: d.buyerPhone ?? undefined,
    p_recipient_name: d.forSomeone ? (d.recipientName ?? undefined) : undefined,
    p_message: d.message ?? undefined,
  });
  if (error || !data) {
    const known = error?.message ? g.errors[error.message] : undefined;
    if (!known) logger.error("gift_cards.order_failed", { code: error?.code });
    return { ok: false, message: known ?? g.failed };
  }
  const card = data as {
    gift_card_id: string;
    number: number;
    amount_cents: number;
    currency: string;
  };
  // The order is committed; a notification hiccup must never turn it into an error for the client.
  try {
    await processNotificationsForGiftCard(card.gift_card_id);
  } catch (cause) {
    logger.error("gift_cards.notifications_failed", { cause });
  }
  return { ok: true, number: card.number, amountCents: card.amount_cents, currency: card.currency };
}

export type GiftCardView = {
  business_name: string;
  currency: string;
  locale: string;
  number: number;
  last4: string;
  status: "active" | "used" | "expired" | "blocked" | "cancelled";
  initial_cents: number;
  balance_cents: number;
  expires_at: string | null;
  recipient_name: string | null;
  message: string | null;
  history: { kind: string; amount_cents: number; created_at: string }[];
};

/**
 * Balance check by code. Strictly rate-limited, and an unknown code, a malformed
 * code and another salon's code all get the same answer.
 */
export async function checkGiftCard(
  slug: string,
  code: string,
): Promise<{ ok: true; card: GiftCardView } | { ok: false; message: string }> {
  const t = await getT();
  const g = t.giftCards;
  if (!rateLimit(await ipKey("gift-check"), { limit: 10, windowMs: 10 * 60_000 }).allowed)
    return { ok: false, message: g.tooMany };
  const valid = giftCardCodeField(t).safeParse(code);
  const admin = createAdminClient();
  if (!valid.success || !admin || !/^[a-z0-9-]{3,48}$/.test(slug))
    return { ok: false, message: g.public.checkInvalid };
  const { data, error } = await admin.rpc("get_gift_card_by_code", {
    p_slug: slug,
    p_code: normaliseGiftCardCode(valid.data),
  });
  if (error) logger.error("gift_cards.check_failed", { code: error.code });
  if (error || !data) return { ok: false, message: g.public.checkInvalid };
  return { ok: true, card: data as unknown as GiftCardView };
}
