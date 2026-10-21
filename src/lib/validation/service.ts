import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { checkbox, rules } from "./common";

export function serviceSchema(t: Dictionary) {
  const r = rules(t);
  return z
    .object({
      name: r.requiredText(t.onboarding.services.name, 120),
      categoryId: z
        .string()
        .trim()
        .optional()
        .transform((value) => value || null),
      newCategory: r.optionalText(80),
      description: r.optionalText(1000),
      durationMinutes: r.int(t.common.fields.duration, 5, 720),
      price: r.money(t.common.fields.price),
      promoPrice: r.optionalMoney,
      bufferAfterMinutes: r.int(t.services.form.buffer, 0, 240),
      isActive: checkbox,
      isOnlineBookable: checkbox,
      staffIds: z
        .union([z.string(), z.array(z.string())])
        .optional()
        .transform((value) => (value === undefined ? [] : Array.isArray(value) ? value : [value])),
    })
    .refine((data) => data.promoPrice === null || data.promoPrice < data.price, {
      message: t.validation.promoLower,
      path: ["promoPrice"],
    });
}
