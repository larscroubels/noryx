"use server";

import { headers } from "next/headers";
import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";
import { getT } from "@/i18n/server";
import { computeAvailability } from "@/lib/booking/availability";
import {
  eligibleStaff,
  getPublicBusiness,
  toWeekly,
  type PublicBusiness,
} from "@/lib/booking/public";
import { publicEnv } from "@/lib/env";
import { formatTime } from "@/lib/format";
import { logger } from "@/lib/logger";
import { processNotificationsForAppointment } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { dayBoundsUtc } from "@/lib/time";
import { rules } from "@/lib/validation/common";

async function ipKey(scope: string) {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  return `${scope}:${ip}`;
}

const availabilityInput = z.object({
  slug: z.string().min(3).max(48),
  serviceId: z.uuid(),
  staffId: z.union([z.uuid(), z.literal("any")]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type PublicSlot = { startsAt: string; label: string; staffIds: string[] };

async function slotsFor(
  business: PublicBusiness,
  serviceId: string,
  staffId: string,
  date: string,
) {
  const service = business.services.find((s) => s.id === serviceId);
  if (!service) return null;
  let staff = eligibleStaff(business, serviceId);
  if (staffId !== "any") staff = staff.filter((s) => s.id === staffId);
  if (staff.length === 0) return [];

  const { start, end } = dayBoundsUtc(date, business.timezone);
  const supabase = await createClient();
  const { data: busy, error } = await supabase.rpc("get_public_busy_periods", {
    p_business_id: business.id,
    p_from: start.toISOString(),
    p_to: end.toISOString(),
  });
  if (error) throw new Error("Availability could not be loaded.");

  const location = business.locations[0];
  const slots = computeAvailability({
    date,
    timeZone: business.timezone,
    now: new Date(),
    policy: {
      minNoticeMinutes: business.policy.min_notice_minutes,
      horizonDays: business.policy.horizon_days,
      slotIntervalMinutes: business.policy.slot_interval_minutes,
      bufferMinutes: business.policy.buffer_minutes,
    },
    serviceBufferMinutes: service.buffer_after_minutes,
    locationHours: location ? toWeekly(location.hours) : [],
    staff: staff.map((member) => ({
      staffId: member.id,
      durationMinutes: member.durationMinutes,
      workingHours: toWeekly(member.hours),
      busy: (busy ?? [])
        .filter((period) => period.staff_id === member.id)
        .map((period) => ({
          startsAt: new Date(period.starts_at),
          endsAt: new Date(period.ends_at),
        })),
    })),
  });
  return slots.map((slot) => ({
    startsAt: slot.startsAt.toISOString(),
    label: formatTime(slot.startsAt, business.timezone, "en-GB"),
    staffIds: slot.staffIds,
  }));
}

export async function getAvailability(
  input: z.input<typeof availabilityInput>,
): Promise<{ ok: true; slots: PublicSlot[] } | { ok: false; message: string }> {
  const e = (await getT()).booking.errors;
  if (!rateLimit(await ipKey("availability"), { limit: 120, windowMs: 60_000 }).allowed) {
    return { ok: false, message: e.tooFast };
  }
  const parsed = availabilityInput.safeParse(input);
  if (!parsed.success) return { ok: false, message: e.chooseAll };
  const business = await getPublicBusiness(parsed.data.slug);
  if (!business) return { ok: false, message: e.notAvailable };
  try {
    const slots = await slotsFor(
      business,
      parsed.data.serviceId,
      parsed.data.staffId,
      parsed.data.date,
    );
    if (slots === null) return { ok: false, message: e.serviceGone };
    return { ok: true, slots };
  } catch {
    return { ok: false, message: e.loadTimes };
  }
}

const bookingInput = (t: Dictionary) => {
  const r = rules(t);
  return z.object({
    slug: z.string().min(3).max(48),
    serviceId: z.uuid(),
    staffId: z.union([z.uuid(), z.literal("any")]),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startsAt: z.iso.datetime(),
    firstName: r.requiredText(t.common.fields.firstName, 80),
    lastName: r.requiredText(t.common.fields.lastName, 80),
    email: r.email,
    phone: r.optionalPhone.refine((value) => value !== null, t.validation.phoneRequired),
    note: r.optionalText(1000),
    marketingOptIn: z.boolean(),
    acceptPolicy: z.boolean().refine((value) => value, t.validation.acceptBooking),
  });
};

export type BookingResult =
  | {
      ok: true;
      appointmentId: string;
      status: "pending" | "confirmed";
      startsAt: string;
      endsAt: string;
      staffName: string;
      priceCents: number;
      manageUrl: string | null;
    }
  | { ok: false; message: string; fieldErrors?: Record<string, string[]>; slotTaken?: boolean };

export async function submitBooking(
  input: z.input<ReturnType<typeof bookingInput>>,
): Promise<BookingResult> {
  const t = await getT();
  const e = t.booking.errors;
  const RPC_MESSAGES = e.rpc;
  if (!rateLimit(await ipKey("booking"), { limit: 8, windowMs: 10 * 60_000 }).allowed) {
    return { ok: false, message: e.tooManyBookings };
  }
  const parsed = bookingInput(t).safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues)
      (fieldErrors[String(issue.path[0])] ??= []).push(issue.message);
    return { ok: false, message: e.checkDetails, fieldErrors };
  }
  const data = parsed.data;
  const business = await getPublicBusiness(data.slug);
  if (!business) return { ok: false, message: RPC_MESSAGES.booking_unavailable! };

  // Re-check the requested time against live availability on the server.
  const slots = await slotsFor(business, data.serviceId, data.staffId, data.date).catch(() => null);
  const slot = slots?.find((s) => s.startsAt === new Date(data.startsAt).toISOString());
  if (!slot) return { ok: false, message: RPC_MESSAGES.slot_unavailable!, slotTaken: true };
  const staffId = data.staffId === "any" ? slot.staffIds[0]! : data.staffId;

  const admin = createAdminClient();
  if (!admin) {
    logger.error("booking.service_role_missing");
    return { ok: false, message: e.tempUnavailable };
  }
  const { data: result, error } = await admin.rpc("create_online_booking", {
    p_business_id: business.id,
    p_location_id: business.locations[0]!.id,
    p_service_id: data.serviceId,
    p_staff_id: staffId,
    p_starts_at: slot.startsAt,
    p_first_name: data.firstName,
    p_last_name: data.lastName,
    p_email: data.email,
    p_phone: data.phone ?? "",
    p_customer_note: data.note ?? undefined,
    p_marketing_opt_in: data.marketingOptIn,
  });

  if (error || !result) {
    if (error?.code === "23P01") return { ok: false, message: e.justBooked, slotTaken: true };
    const known = error?.message && RPC_MESSAGES[error.message];
    if (!known) logger.error("booking.create_failed", { code: error?.code });
    return {
      ok: false,
      message: known || e.failed,
      slotTaken: error?.message === "slot_unavailable",
    };
  }

  const booking = result as {
    appointment_id: string;
    status: "pending" | "confirmed";
    starts_at: string;
    ends_at: string;
    price_cents: number;
  };
  // The booking is committed; a notification hiccup must not turn it into an error for the client.
  await processNotificationsForAppointment(booking.appointment_id).catch((cause) =>
    logger.error("booking.notifications_failed", { cause }),
  );
  // Private self-service link (only the hash is stored).
  const { data: token } = await admin.rpc("issue_booking_token", {
    p_appointment_id: booking.appointment_id,
  });
  return {
    ok: true,
    manageUrl: token ? `${publicEnv.siteUrl}/${business.slug}/booking/${token}` : null,
    appointmentId: booking.appointment_id,
    status: booking.status,
    startsAt: booking.starts_at,
    endsAt: booking.ends_at,
    staffName: business.staff.find((s) => s.id === staffId)?.display_name ?? "",
    priceCents: booking.price_cents,
  };
}
