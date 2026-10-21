import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { checkbox, rules } from "./common";

export function productSchema(t: Dictionary) {
  const r = rules(t);
  const f = t.retail.products.form;
  return z.object({
    name: r.requiredText(f.name, 120),
    description: r.optionalText(1000),
    sku: r.optionalText(64),
    category: r.optionalText(80),
    price: r.money(t.common.fields.price),
    cost: r.optionalMoney,
    lowStockThreshold: r.int(f.lowStockLabel, 0, 100000),
    initialStock: z.coerce.number().int().min(0).max(100000).optional(),
    isActive: checkbox,
    isOnline: checkbox,
  });
}

/** Labels live in the dictionaries under `retail.products.reasons`. */
export const STOCK_REASONS = [
  { value: "restock", sign: 1 },
  { value: "return", sign: 1 },
  { value: "sale", sign: -1 },
  { value: "damage", sign: -1 },
  { value: "adjustment", sign: 0 },
] as const;

export function stockAdjustmentSchema(t: Dictionary) {
  const v = t.validation;
  return z.object({
    productId: z.uuid(),
    reason: z.enum(["restock", "return", "sale", "damage", "adjustment"]),
    quantity: z.coerce
      .number({ error: v.quantityRequired })
      .int(v.quantityWhole)
      .refine((value) => value !== 0, v.quantityNonZero)
      .refine((value) => Math.abs(value) <= 100000, v.quantityLarge),
    note: rules(t).optionalText(200),
  });
}
