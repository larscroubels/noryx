import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { checkbox, rules } from "./common";

export function staffProfileSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    displayName: r.requiredText(t.common.fields.name, 80),
    jobTitle: r.optionalText(80),
    bio: r.optionalText(500),
    email: r.optionalEmail,
    phone: r.optionalPhone,
    locationId: z
      .string()
      .trim()
      .transform((value) => value || null),
    isBookable: checkbox,
    isActive: checkbox,
  });
}

/** Labels live in the dictionaries under `staff.timeOff.kinds`. */
export const TIME_OFF_KINDS = ["holiday", "sick", "break", "training", "other"] as const;

export function timeOffSchema(t: Dictionary) {
  const r = rules(t);
  return z
    .object({
      startDate: r.date,
      startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t.validation.time),
      endDate: r.date,
      endTime: z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/, t.validation.time),
      kind: z.enum(TIME_OFF_KINDS),
      note: r.optionalText(200),
    })
    .refine((data) => `${data.endDate}T${data.endTime}` > `${data.startDate}T${data.startTime}`, {
      message: t.validation.endAfterStart,
      path: ["endDate"],
    });
}
