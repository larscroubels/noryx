import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { parseMoneyToCents } from "@/lib/format";
import { PAYMENT_METHODS } from "@/lib/finance/summary";
import { GIFT_CARD_CODE_PATTERN } from "@/lib/gift-card-codes";

import { checkbox, rules } from "./common";

/** A gift card is never paid with another gift card. */
export const GIFT_CARD_SALE_METHODS = [
  "cash",
  "card",
  "bancontact",
  "bank_transfer",
  "other",
] as const satisfies readonly (typeof PAYMENT_METHODS)[number][];

const reason = (t: Dictionary) =>
  z
    .string()
    .trim()
    .min(3, t.giftCards.errors.gift_card_reason_required)
    .max(300, t.validation.maxLength(300));

export function giftCardCodeField(t: Dictionary) {
  return z.string().trim().regex(GIFT_CARD_CODE_PATTERN, t.giftCards.errors.gift_card_invalid);
}

/** Online order from the public page. Amount rules are checked again by the database. */
export function giftCardOrderSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    slug: z.string().min(3).max(48),
    amountCents: z.number().int().min(500).max(100000),
    buyerName: r.requiredText(t.common.fields.name, 160),
    buyerEmail: r.email,
    buyerPhone: r.optionalPhone,
    forSomeone: z.boolean(),
    recipientName: r.optionalText(160),
    message: r.optionalText(300),
    acceptTerms: z.boolean().refine((value) => value, t.giftCards.public.acceptRequired),
  });
}

export function giftCardDeskSaleSchema(t: Dictionary) {
  const r = rules(t);
  const g = t.giftCards.form;
  return z.object({
    amount: r
      .money(g.amount)
      .pipe(
        z
          .number()
          .min(100, t.validation.min(g.amount, 1))
          .max(1000000, t.validation.max(g.amount, 10000)),
      ),
    method: z.enum(GIFT_CARD_SALE_METHODS, { error: g.chooseMethod }),
    buyerName: r.requiredText(g.buyerName, 160),
    buyerEmail: r.optionalEmail,
    recipientName: r.optionalText(160),
    message: r.optionalText(300),
    idempotencyKey: z.uuid().optional(),
  });
}

export function giftCardRedeemSchema(t: Dictionary) {
  const r = rules(t);
  return z
    .object({
      code: giftCardCodeField(t),
      amount: r.money(t.giftCards.redeem.amount).pipe(z.number().min(1, t.validation.money)),
      appointmentId: r.uuid.optional(),
      orderId: r.uuid.optional(),
      idempotencyKey: z.uuid().optional(),
    })
    .refine((value) => Boolean(value.appointmentId) !== Boolean(value.orderId), {
      message: t.giftCards.errors.gift_card_purchase_required,
      path: ["form"],
    });
}

export function giftCardActivateSchema(t: Dictionary) {
  return z.object({
    giftCardId: rules(t).uuid,
    method: z.enum(GIFT_CARD_SALE_METHODS, { error: t.giftCards.form.chooseMethod }),
  });
}

export function giftCardReasonSchema(t: Dictionary) {
  return z.object({ giftCardId: rules(t).uuid, reason: reason(t) });
}

export function giftCardReverseSchema(t: Dictionary) {
  return z.object({
    giftCardId: rules(t).uuid,
    transactionId: z.coerce.number().int().positive(),
    reason: reason(t),
  });
}

export function giftCardAdjustSchema(t: Dictionary) {
  return z.object({
    giftCardId: rules(t).uuid,
    amount: z
      .string()
      .trim()
      .transform((value, ctx) => {
        const negative = value.startsWith("-");
        const cents = parseMoneyToCents(value.replace(/^[-+]/, ""));
        if (cents === null || cents === 0) {
          ctx.addIssue({ code: "custom", message: t.validation.money });
          return z.NEVER;
        }
        return negative ? -cents : cents;
      }),
    reason: reason(t),
    idempotencyKey: z.uuid().optional(),
  });
}

/** "25, 50, 100" → [2500, 5000, 10000]; null when any entry is invalid. */
export function parseAmountList(input: string): number[] | null {
  // Amounts are separated by ", ", ";" or spaces, so "12,50" stays one amount.
  const parts = input
    .split(/;|,\s+|\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const cents = parts.map((part) => parseMoneyToCents(part));
  if (cents.some((value) => value === null)) return null;
  return [...new Set(cents as number[])].sort((a, b) => a - b);
}

export function giftCardSettingsSchema(t: Dictionary) {
  const r = rules(t);
  const s = t.giftCards.settings;
  return z
    .object({
      enabled: checkbox,
      amounts: z.string().transform((value, ctx) => {
        const list = parseAmountList(value);
        if (
          !list ||
          list.length === 0 ||
          list.length > 8 ||
          list.some((c) => c < 500 || c > 100000)
        ) {
          ctx.addIssue({ code: "custom", message: s.amountsInvalid });
          return z.NEVER;
        }
        return list;
      }),
      allowCustom: checkbox,
      min: r.money(s.min).pipe(z.number().min(500, s.amountsInvalid).max(100000, s.amountsInvalid)),
      max: r.money(s.max).pipe(z.number().min(500, s.amountsInvalid).max(100000, s.amountsInvalid)),
      validityMonths: z
        .string()
        .trim()
        .transform((value, ctx) => {
          if (!value) return null;
          const months = Number(value);
          if (!Number.isInteger(months) || months < 1 || months > 120) {
            ctx.addIssue({ code: "custom", message: t.validation.max(s.validity, 120) });
            return z.NEVER;
          }
          return months;
        }),
      terms: r.optionalText(1000),
    })
    .refine((value) => value.min <= value.max, { message: s.rangeInvalid, path: ["max"] });
}
