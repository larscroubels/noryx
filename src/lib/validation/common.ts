import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { parseMoneyToCents } from "@/lib/format";
import { timeToMinutes } from "@/lib/time";

export const checkbox = z
  .union([z.literal("on"), z.literal("true"), z.literal("false"), z.literal("")])
  .optional()
  .transform((value) => value === "on" || value === "true");

/**
 * Localised validation rules. Schemas are built per request with the visitor's
 * dictionary so every message appears in their language.
 */
export function rules(t: Dictionary) {
  const v = t.validation;
  return {
    optionalText: (max: number) =>
      z
        .string()
        .trim()
        .max(max, v.maxLength(max))
        .transform((value) => value || null)
        .nullable()
        .optional()
        .transform((value) => value ?? null),
    requiredText: (label: string, max: number, min = 1) =>
      z
        .string({ error: v.required(label) })
        .trim()
        .min(min, min === 1 ? v.required(label) : v.minLength(label, min))
        .max(max, v.maxLength(max)),
    email: z.string().trim().toLowerCase().pipe(z.email(v.email)),
    optionalEmail: z
      .string()
      .trim()
      .toLowerCase()
      .transform((value) => value || null)
      .pipe(z.email(v.email).nullable()),
    optionalPhone: z
      .string()
      .trim()
      .max(32, v.maxLength(32))
      .regex(/^[+\d\s()./-]*$/, v.phoneChars)
      .transform((value) => value || null),
    money: (label: string) =>
      z
        .string()
        .trim()
        .min(1, v.required(label))
        .transform((value, ctx) => {
          const cents = parseMoneyToCents(value);
          if (cents === null) {
            ctx.addIssue({ code: "custom", message: v.money });
            return z.NEVER;
          }
          return cents;
        }),
    optionalMoney: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (!value) return null;
        const cents = parseMoneyToCents(value);
        if (cents === null) {
          ctx.addIssue({ code: "custom", message: v.money });
          return z.NEVER;
        }
        return cents;
      }),
    int: (label: string, min: number, max: number) =>
      z.coerce
        .number({ error: v.number(label) })
        .int(v.wholeNumber(label))
        .min(min, v.min(label, min))
        .max(max, v.max(label, max)),
    uuid: z.uuid(v.reference),
    time: z
      .string()
      .regex(/^([01]\d|2[0-4]):[0-5]\d$/, v.time)
      .transform((value) => timeToMinutes(value)),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, v.date),
  };
}
