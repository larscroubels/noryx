"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { getT } from "@/i18n/server";
import { getPublicBusiness } from "@/lib/booking/public";
import { logger } from "@/lib/logger";
import { processNotificationsForOrder } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { rules } from "@/lib/validation/common";

const orderInput = (t: Dictionary) => {
  const r = rules(t);
  return z.object({
    slug: z.string().min(3).max(48),
    items: z
      .array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1).max(10) }))
      .min(1, t.validation.cartEmpty)
      .max(30),
    firstName: r.requiredText(t.common.fields.firstName, 80),
    lastName: r.requiredText(t.common.fields.lastName, 80),
    email: r.email,
    phone: r.optionalPhone.refine((value) => value !== null, t.validation.phoneRequired),
    note: r.optionalText(500),
    acceptTerms: z.boolean().refine((value) => value, t.validation.acceptOrder),
  });
};

export type OrderResult =
  | { ok: true; orderNumber: number; totalCents: number; currency: string }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]> };

export async function submitOrder(
  input: z.input<ReturnType<typeof orderInput>>,
): Promise<OrderResult> {
  const t = await getT();
  const MESSAGES = t.booking.shop.rpc;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`order:${ip}`, { limit: 6, windowMs: 10 * 60_000 }).allowed) {
    return { ok: false, message: t.booking.shop.tooMany };
  }
  const parsed = orderInput(t).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues)
      (fieldErrors[String(issue.path[0])] ??= []).push(issue.message);
    return { ok: false, message: t.booking.errors.checkDetails, fieldErrors };
  }
  const business = await getPublicBusiness(parsed.data.slug);
  const admin = createAdminClient();
  if (!business || !admin) return { ok: false, message: MESSAGES.shop_unavailable! };

  // Prices, stock and totals are taken from the database, never from the browser.
  const { data, error } = await admin.rpc("create_online_order", {
    p_business_id: business.id,
    p_items: parsed.data.items.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
    })),
    p_first_name: parsed.data.firstName,
    p_last_name: parsed.data.lastName,
    p_email: parsed.data.email,
    p_phone: parsed.data.phone ?? "",
    p_note: parsed.data.note ?? undefined,
  });
  if (error || !data) {
    const known = error?.message ? MESSAGES[error.message] : undefined;
    if (!known) logger.error("shop.order_failed", { code: error?.code });
    return { ok: false, message: known ?? t.booking.shop.failed };
  }
  const order = data as {
    order_id: string;
    order_number: number;
    total_cents: number;
    currency: string;
  };
  // The order is committed; a notification hiccup must not turn it into an error for the client.
  await processNotificationsForOrder(order.order_id).catch((cause) =>
    logger.error("shop.notifications_failed", { cause }),
  );
  return {
    ok: true,
    orderNumber: order.order_number,
    totalCents: order.total_cents,
    currency: order.currency,
  };
}
