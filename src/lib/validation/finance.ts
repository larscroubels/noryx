import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/finance/summary";

import { rules } from "./common";

export function paymentSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    appointmentId: z.uuid(),
    amount: r.money(t.common.fields.amount),
    method: z.enum(PAYMENT_METHODS, { error: t.finance.form.chooseMethod }),
    note: r.optionalText(300),
  });
}

export function expenseSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    description: r.requiredText(t.common.fields.description, 200),
    category: z.enum(EXPENSE_CATEGORIES, { error: t.finance.form.chooseCategory }),
    amount: r.money(t.common.fields.amount),
    spentOn: r.date,
    supplier: r.optionalText(120),
    reference: r.optionalText(80),
  });
}
