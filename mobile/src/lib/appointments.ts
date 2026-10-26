import type { AppointmentStatus } from "@/lib/appointments/status";

import { supabase } from "./supabase";

export type AppointmentListItem = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  service_name: string;
  staff_id: string;
  price_cents: number;
  currency: string;
  customer: { id: string; first_name: string; last_name: string | null } | null;
  staff: { display_name: string } | null;
};

const LIST_COLUMNS =
  "id, starts_at, ends_at, status, service_name, staff_id, price_cents, currency, customer:customers(id, first_name, last_name), staff:staff_members(display_name)";

/** Appointments starting in [from, to); RLS limits staff to their own. */
export async function listAppointments(input: {
  businessId: string;
  from: string;
  to: string;
  staffId?: string | null;
  status?: AppointmentStatus;
  includeCancelled?: boolean;
}): Promise<AppointmentListItem[]> {
  let query = supabase
    .from("appointments")
    .select(LIST_COLUMNS)
    .eq("business_id", input.businessId)
    .gte("starts_at", input.from)
    .lt("starts_at", input.to)
    .order("starts_at");
  if (input.staffId) query = query.eq("staff_id", input.staffId);
  if (input.status) query = query.eq("status", input.status);
  else if (!input.includeCancelled) query = query.neq("status", "cancelled");
  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as AppointmentListItem[];
}

/** Bookable professionals, for the calendar filter. */
export async function listStaff(businessId: string) {
  const { data, error } = await supabase
    .from("staff_members")
    .select("id, display_name")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("display_name");
  if (error) throw error;
  return data ?? [];
}

/** Setup counts for the checklist (same queries as the web dashboard). */
export async function setupCounts(businessId: string) {
  const [hours, services, workingHours] = await Promise.all([
    supabase
      .from("location_hours")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId),
    supabase
      .from("services")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("is_active", true),
    supabase
      .from("staff_working_hours")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId),
  ]);
  const failed = hours.error ?? services.error ?? workingHours.error;
  if (failed) throw failed;
  return {
    hours: hours.count ?? 0,
    services: services.count ?? 0,
    workingHours: workingHours.count ?? 0,
  };
}

export function customerName(customer: AppointmentListItem["customer"], fallback: string) {
  return customer ? [customer.first_name, customer.last_name].filter(Boolean).join(" ") : fallback;
}

export type AppointmentDetail = {
  id: string;
  business_id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  service_name: string;
  staff_id: string;
  price_cents: number;
  currency: string;
  source: "online" | "staff";
  customer_note: string | null;
  internal_note: string | null;
  cancelled_by: string | null;
  cancellation_reason: string | null;
  customer: {
    id: string;
    first_name: string;
    last_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  staff: { display_name: string } | null;
};

export async function getAppointment(id: string): Promise<AppointmentDetail | null> {
  const { data, error } = await supabase
    .from("appointments")
    .select(
      "id, business_id, starts_at, ends_at, status, service_name, staff_id, price_cents, currency, source, customer_note, internal_note, cancelled_by, cancellation_reason, customer:customers(id, first_name, last_name, email, phone), staff:staff_members(display_name)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as AppointmentDetail | null;
}

/** Recorded (not refunded) payments for an appointment; RLS hides them without finance access. */
export async function recordedPayments(appointmentId: string) {
  const { data, error } = await supabase
    .from("payments")
    .select("amount_cents, refunded_at")
    .eq("appointment_id", appointmentId);
  if (error) return null;
  return (data ?? [])
    .filter((p) => p.refunded_at === null)
    .reduce((sum, p) => sum + p.amount_cents, 0);
}
