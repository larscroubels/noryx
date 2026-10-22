"use server";

import { revalidatePath } from "next/cache";

import { getT } from "@/i18n/server";
import { failure, formToObject, success, validationFailure, type ActionState } from "@/lib/actions";
import { authorize } from "@/lib/auth/session";
import { formatMoney } from "@/lib/format";
import { giftCardErrorMessage, normaliseGiftCardCode } from "@/lib/gift-cards";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  giftCardActivateSchema,
  giftCardAdjustSchema,
  giftCardDeskSaleSchema,
  giftCardReasonSchema,
  giftCardRedeemSchema,
  giftCardReverseSchema,
} from "@/lib/validation/gift-card";

/** A freshly activated card: the only moment its full code is shown. */
export type GiftCardCodeState =
  | ActionState
  | { status: "success"; message?: string; code: string; number: number; giftCardId: string };

function refresh(giftCardId?: string) {
  revalidatePath("/app/gift-cards");
  if (giftCardId) revalidatePath(`/app/gift-cards/${giftCardId}`);
}

export async function sellGiftCard(
  _prev: GiftCardCodeState,
  formData: FormData,
): Promise<GiftCardCodeState> {
  const [workspace, t] = await Promise.all([authorize("gift_cards.manage"), getT()]);
  if (!workspace) return failure(t.giftCards.noPermission);
  const parsed = giftCardDeskSaleSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_desk_gift_card", {
    p_business_id: workspace.business.id,
    p_amount_cents: d.amount,
    p_method: d.method,
    p_buyer_name: d.buyerName,
    p_buyer_email: d.buyerEmail ?? undefined,
    p_recipient_name: d.recipientName ?? undefined,
    p_message: d.message ?? undefined,
    p_idempotency_key: d.idempotencyKey,
  });
  if (error || !data) {
    logger.error("gift_cards.sell_failed", { code: error?.code });
    return failure(giftCardErrorMessage(error, t, (c) => formatMoney(c)));
  }
  const card = data as { gift_card_id: string; number: number; code: string | null };
  refresh(card.gift_card_id);
  // A retried submission: the card exists, but its code was only shown the first time.
  if (!card.code) return failure(t.giftCards.alreadySold);
  return {
    status: "success",
    code: card.code,
    number: card.number,
    giftCardId: card.gift_card_id,
  };
}

export async function activateGiftCard(
  _prev: GiftCardCodeState,
  formData: FormData,
): Promise<GiftCardCodeState> {
  const [workspace, t] = await Promise.all([authorize("gift_cards.manage"), getT()]);
  if (!workspace) return failure(t.giftCards.noPermission);
  const parsed = giftCardActivateSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("activate_gift_card", {
    p_gift_card_id: parsed.data.giftCardId,
    p_method: parsed.data.method,
  });
  if (error || !data) {
    if (!error?.message?.startsWith("gift_card_"))
      logger.error("gift_cards.activate_failed", { code: error?.code });
    return failure(giftCardErrorMessage(error, t, (c) => formatMoney(c)));
  }
  const card = data as { gift_card_id: string; number: number; code: string };
  refresh(card.gift_card_id);
  return {
    status: "success",
    code: card.code,
    number: card.number,
    giftCardId: card.gift_card_id,
  };
}

/** Redeems against an appointment or a shop order. Rate-limited per user against code guessing. */
export async function redeemGiftCard(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([
    authorize(["gift_cards.manage", "appointments.manage_all", "finance.manage", "orders.manage"]),
    getT(),
  ]);
  if (!workspace) return failure(t.giftCards.noPermission);
  if (!rateLimit(`gift-redeem:${workspace.user.id}`, { limit: 20, windowMs: 10 * 60_000 }).allowed)
    return failure(t.giftCards.tooMany);
  const parsed = giftCardRedeemSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const money = (cents: number) =>
    formatMoney(cents, workspace.business.currency, workspace.business.locale);

  // The database refuses more than is still due on the purchase, under a lock.
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("redeem_gift_card", {
    p_business_id: workspace.business.id,
    p_code: normaliseGiftCardCode(d.code),
    p_amount_cents: d.amount,
    p_appointment_id: d.appointmentId,
    p_order_id: d.orderId,
    p_idempotency_key: d.idempotencyKey,
  });
  if (error || !data) {
    if (!error?.message?.startsWith("gift_card_"))
      logger.error("gift_cards.redeem_failed", { code: error?.code });
    return failure(giftCardErrorMessage(error, t, money));
  }
  const result = data as { balance_cents: number };
  if (d.appointmentId) revalidatePath(`/app/appointments/${d.appointmentId}`);
  if (d.orderId) revalidatePath(`/app/orders/${d.orderId}`);
  refresh();
  return success(t.giftCards.redeem.done(money(d.amount), money(result.balance_cents)));
}

async function manage(
  formData: FormData,
  run: (
    supabase: Awaited<ReturnType<typeof createClient>>,
    t: Awaited<ReturnType<typeof getT>>,
  ) => Promise<
    { giftCardId: string; error: { message?: string; code?: string } | null } | ActionState
  >,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("gift_cards.manage"), getT()]);
  if (!workspace) return failure(t.giftCards.noPermission);
  const outcome = await run(await createClient(), t);
  if ("status" in outcome) return outcome;
  if (outcome.error) {
    if (!outcome.error.message?.startsWith("gift_card_"))
      logger.error("gift_cards.manage_failed", { code: outcome.error.code });
    return failure(giftCardErrorMessage(outcome.error, t, (c) => formatMoney(c)));
  }
  refresh(outcome.giftCardId);
  return success(t.giftCards.detail.done);
}

export async function setGiftCardBlocked(_prev: ActionState, formData: FormData) {
  return manage(formData, async (supabase, t) => {
    const parsed = giftCardReasonSchema(t).safeParse(formToObject(formData));
    if (!parsed.success) return validationFailure(parsed.error, t);
    const { error } = await supabase.rpc("set_gift_card_blocked", {
      p_gift_card_id: parsed.data.giftCardId,
      p_blocked: formData.get("blocked") === "true",
      p_reason: parsed.data.reason,
    });
    return { giftCardId: parsed.data.giftCardId, error };
  });
}

export async function cancelGiftCard(_prev: ActionState, formData: FormData) {
  return manage(formData, async (supabase, t) => {
    const parsed = giftCardReasonSchema(t).safeParse(formToObject(formData));
    if (!parsed.success) return validationFailure(parsed.error, t);
    const { error } = await supabase.rpc("cancel_gift_card", {
      p_gift_card_id: parsed.data.giftCardId,
      p_reason: parsed.data.reason,
    });
    return { giftCardId: parsed.data.giftCardId, error };
  });
}

export async function adjustGiftCard(_prev: ActionState, formData: FormData) {
  return manage(formData, async (supabase, t) => {
    const parsed = giftCardAdjustSchema(t).safeParse(formToObject(formData));
    if (!parsed.success) return validationFailure(parsed.error, t);
    const { error } = await supabase.rpc("adjust_gift_card", {
      p_gift_card_id: parsed.data.giftCardId,
      p_amount_cents: parsed.data.amount,
      p_reason: parsed.data.reason,
      p_idempotency_key: parsed.data.idempotencyKey,
    });
    return { giftCardId: parsed.data.giftCardId, error };
  });
}

export async function reverseGiftCardRedemption(_prev: ActionState, formData: FormData) {
  return manage(formData, async (supabase, t) => {
    const parsed = giftCardReverseSchema(t).safeParse(formToObject(formData));
    if (!parsed.success) return validationFailure(parsed.error, t);
    const { error } = await supabase.rpc("reverse_gift_card_redemption", {
      p_transaction_id: parsed.data.transactionId,
      p_reason: parsed.data.reason,
    });
    return { giftCardId: parsed.data.giftCardId, error };
  });
}
