import type { PublicBusiness } from "@/lib/booking/public-shape";
import type { BusyPeriod } from "@/lib/booking/slots";
import type { AppointmentStatus } from "@/lib/appointments/status";
import type { Database } from "@/types/database";

import { isAuthError, reportAuthFailure } from "~/lib/auth-failure";
import { supabase } from "~/lib/supabase";

/** The plan A client functions, called with the user's own session. */
export type ClientCategory = Database["public"]["Enums"]["client_category"];

export type ClientLink = {
  business_id: string;
  slug: string;
  name: string;
  logo_path: string | null;
  categories: ClientCategory[];
  linked_at: string;
  unlinked_at: string | null;
};

export type ClientAppointment = {
  appointment_id: string;
  business_id: string;
  business_name: string;
  business_slug: string;
  linked: boolean;
  service_name: string;
  staff_name: string | null;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  currency: string;
  locale: string;
  /** The salon's time zone; dates and times are shown in it. */
  timezone: string;
  cancellation_notice_hours: number;
  status: AppointmentStatus;
  can_cancel: boolean;
};

type DbError = { code?: string; message?: string } | null;

function check<T>(result: { data: T; error: DbError }): T {
  if (result.error) {
    if (isAuthError(result.error)) reportAuthFailure();
    throw result.error;
  }
  return result.data;
}

/** Codes are shown as "ATEL-7KQ2MX"; people type them in any case and with spaces. */
export function normaliseCode(code: string) {
  return code.toUpperCase().replace(/\s+/g, "");
}

export async function linkSalon(
  code: string,
  categories: ClientCategory[],
): Promise<
  { ok: true; businessId: string; name: string; slug: string } | { ok: false; error: string }
> {
  const data = check(
    await supabase.rpc("link_business_by_code", {
      p_code: normaliseCode(code),
      p_categories: categories,
    }),
  ) as { error?: string; business_id?: string; name?: string; slug?: string };
  if (data.error || !data.business_id) return { ok: false, error: data.error ?? "failed" };
  return { ok: true, businessId: data.business_id, name: data.name ?? "", slug: data.slug ?? "" };
}

export async function unlinkSalon(businessId: string) {
  check(await supabase.rpc("unlink_business", { p_business_id: businessId }));
}

/** Every link, including unlinked ones (their history stays visible). */
export async function listLinks(): Promise<ClientLink[]> {
  return (check(await supabase.rpc("my_client_links")) ?? []) as unknown as ClientLink[];
}

export async function myAppointments(): Promise<ClientAppointment[]> {
  const rows = (check(await supabase.rpc("my_appointments")) ??
    []) as unknown as ClientAppointment[];
  // Older databases don't return the zone yet; NORYX salons default to Brussels.
  return rows.map((row) => ({ ...row, timezone: row.timezone ?? "Europe/Brussels" }));
}

export async function publicBusiness(slug: string): Promise<PublicBusiness | null> {
  return (check(await supabase.rpc("get_public_business", { p_slug: slug })) ??
    null) as unknown as PublicBusiness | null;
}

export async function busyPeriods(businessId: string, from: string, to: string) {
  return (check(
    await supabase.rpc("get_public_busy_periods", {
      p_business_id: businessId,
      p_from: from,
      p_to: to,
    }),
  ) ?? []) as BusyPeriod[];
}

/** Books with the salon's own rules; errors are returned, not thrown. */
export async function bookAppointment(input: {
  businessId: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  note: string;
}): Promise<{ ok: true; status: AppointmentStatus } | { ok: false; error: DbError }> {
  const { data, error } = await supabase.rpc("client_book_appointment", {
    p_business_id: input.businessId,
    p_service_id: input.serviceId,
    p_staff_id: input.staffId,
    p_starts_at: input.startsAt,
    p_note: input.note.trim() || undefined,
  });
  if (error) {
    if (isAuthError(error)) reportAuthFailure();
    return { ok: false, error };
  }
  return { ok: true, status: (data as { status: AppointmentStatus }).status };
}

export async function cancelAppointment(
  appointmentId: string,
): Promise<{ ok: true } | { ok: false; error: DbError }> {
  const { error } = await supabase.rpc("client_cancel_appointment", {
    p_appointment_id: appointmentId,
  });
  if (error) {
    if (isAuthError(error)) reportAuthFailure();
    return { ok: false, error };
  }
  return { ok: true };
}
