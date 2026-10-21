import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { checkbox, rules } from "./common";

export function customerSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    firstName: r.requiredText(t.common.fields.firstName, 80),
    lastName: r.optionalText(80),
    email: r.optionalEmail,
    phone: r.optionalPhone,
    marketingOptIn: checkbox,
  });
}

export function noteSchema(t: Dictionary) {
  return z.object({
    customerId: z.uuid(),
    body: rules(t).requiredText(t.customers.form.note, 4000),
  });
}
