import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { isReservedSlug, SLUG_PATTERN } from "@/lib/slug";
import { isValidTimeZone } from "@/lib/time";
import type { Database } from "@/types/database";

import { rules } from "./common";

export type BusinessType = Database["public"]["Enums"]["business_type"];

/** Labels live in the dictionaries under `common.businessTypes`. */
export const BUSINESS_TYPES = [
  "hair_salon",
  "barbershop",
  "beauty_salon",
  "nail_studio",
  "lash_brow_studio",
  "skincare_clinic",
  "independent_professional",
  "other",
] as const satisfies readonly BusinessType[];

const SLOT_INTERVALS = [5, 10, 15, 20, 30, 45, 60];

/** A salon's language: its workspace interface, the default on its public pages and money formatting. */
export const BUSINESS_LOCALES = ["nl-BE", "fr-BE", "en-GB"] as const;

export function businessFields(t: Dictionary) {
  const v = t.validation;
  return {
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .regex(SLUG_PATTERN, v.slug)
      .refine((slug) => !isReservedSlug(slug), v.slugReserved),
    businessType: z.enum(BUSINESS_TYPES, { error: v.businessType }),
    timezone: z.string().refine(isValidTimeZone, v.timeZone),
  };
}

export function createBusinessSchema(t: Dictionary) {
  const r = rules(t);
  const f = businessFields(t);
  return z.object({
    name: r.requiredText(t.onboarding.business.name, 120, 2),
    slug: f.slug,
    businessType: f.businessType,
    timezone: f.timezone.default("Europe/Brussels"),
  });
}

export function businessProfileSchema(t: Dictionary) {
  const r = rules(t);
  const f = businessFields(t);
  const v = t.validation;
  return z.object({
    name: r.requiredText(t.onboarding.business.name, 120, 2),
    businessType: f.businessType,
    description: r.optionalText(1000),
    email: r.optionalEmail,
    phone: r.optionalPhone,
    websiteUrl: z
      .string()
      .trim()
      .transform((value) => value || null)
      .pipe(z.url({ protocol: /^https?$/, error: v.url }).nullable()),
    instagramHandle: z
      .string()
      .trim()
      .transform((value) => value.replace(/^@/, "") || null)
      .pipe(
        z
          .string()
          .regex(/^[A-Za-z0-9._]{1,30}$/, v.instagram)
          .nullable(),
      ),
    brandColor: z
      .string()
      .trim()
      .transform((value) => value || null)
      .pipe(
        z
          .string()
          .regex(/^#[0-9A-Fa-f]{6}$/, v.hexColor)
          .nullable(),
      ),
    timezone: f.timezone,
    locale: z.enum(BUSINESS_LOCALES, { error: t.validation.chooseOption }),
  });
}

export function locationSchema(t: Dictionary) {
  const r = rules(t);
  return z.object({
    name: r.requiredText(t.onboarding.location.name, 120),
    addressLine1: r.optionalText(200),
    postalCode: r.optionalText(20),
    city: r.optionalText(120),
    phone: r.optionalPhone,
  });
}

export function bookingPolicySchema(t: Dictionary) {
  const r = rules(t);
  const l = t.settings.policy;
  return z.object({
    bookingMinNoticeMinutes: r.int(l.minNotice, 0, 10080),
    bookingHorizonDays: r.int(l.horizon, 1, 365),
    bookingSlotIntervalMinutes: z.coerce
      .number()
      .refine((value) => SLOT_INTERVALS.includes(value), t.validation.slotInterval),
    bookingBufferMinutes: r.int(l.buffer, 0, 120),
    bookingCancellationNoticeHours: r.int(l.cancellationNotice, 0, 336),
  });
}
