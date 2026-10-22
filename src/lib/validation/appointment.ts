import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { rules } from "./common";

const startTime = (t: Dictionary) =>
  z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t.validation.chooseStartTime);

export function newAppointmentSchema(t: Dictionary) {
  const r = rules(t);
  return z
    .object({
      customerMode: z.enum(["existing", "new"]),
      customerId: z.string().optional(),
      firstName: z.string().trim().max(80).optional(),
      lastName: r.optionalText(80),
      email: r.optionalEmail.optional(),
      phone: r.optionalPhone.optional(),
      serviceId: r.uuid,
      staffId: r.uuid,
      date: r.date,
      time: startTime(t),
      internalNote: r.optionalText(2000),
    })
    .superRefine((data, ctx) => {
      if (data.customerMode === "existing" && !z.uuid().safeParse(data.customerId).success) {
        ctx.addIssue({
          code: "custom",
          path: ["customerId"],
          message: t.validation.chooseCustomer,
        });
      }
      if (data.customerMode === "new" && !data.firstName) {
        ctx.addIssue({
          code: "custom",
          path: ["firstName"],
          message: t.validation.customerFirstName,
        });
      }
    });
}

export function rescheduleSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    appointmentId: r.uuid,
    staffId: r.uuid,
    date: r.date,
    time: startTime(t),
  });
}

export function cancelSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    appointmentId: r.uuid,
    reason: r.optionalText(500),
  });
}
