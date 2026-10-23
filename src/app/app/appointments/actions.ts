"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { getT } from "@/i18n/server";
import { NEXT_STATUSES, type AppointmentStatus } from "@/lib/appointments/status";
import { authorize, can, type Workspace } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { timeToMinutes, zonedTimeToUtc } from "@/lib/time";
import { cancelSchema, newAppointmentSchema, rescheduleSchema } from "@/lib/validation/appointment";

function canManageFor(workspace: Workspace, staffId: string) {
  return (
    can(workspace, "appointments.manage_all") ||
    (can(workspace, "appointments.manage_own") && workspace.staffId === staffId)
  );
}

function refresh(id?: string) {
  revalidatePath("/app");
  revalidatePath("/app/calendar");
  if (id) revalidatePath(`/app/appointments/${id}`);
}

/** Effective duration, price and buffer for a staff member performing a service. */
async function serviceTerms(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspace: Workspace,
  serviceId: string,
  staffId: string,
) {
  const [{ data: service }, { data: override }] = await Promise.all([
    supabase
      .from("services")
      .select("id, name, duration_minutes, price_cents, promo_price_cents, buffer_after_minutes")
      .eq("id", serviceId)
      .eq("business_id", workspace.business.id)
      .maybeSingle(),
    supabase
      .from("staff_services")
      .select("price_cents, duration_minutes")
      .eq("service_id", serviceId)
      .eq("staff_id", staffId)
      .maybeSingle(),
  ]);
  if (!service) return null;
  const duration = override?.duration_minutes ?? service.duration_minutes;
  return {
    service,
    duration,
    price: override?.price_cents ?? service.promo_price_cents ?? service.price_cents,
    buffer: Math.max(service.buffer_after_minutes, workspace.business.booking_buffer_minutes),
  };
}

export async function createAppointment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([
    authorize(["appointments.manage_all", "appointments.manage_own"]),
    getT(),
  ]);
  const e = t.appointments.errors;
  if (!workspace) return failure(e.create);
  const parsed = newAppointmentSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const data = parsed.data;
  if (!canManageFor(workspace, data.staffId)) return failure(e.ownCalendar);

  const supabase = await createClient();
  const businessId = workspace.business.id;
  const terms = await serviceTerms(supabase, workspace, data.serviceId, data.staffId);
  if (!terms) return failure(e.chooseService, { serviceId: [e.serviceGone] });

  let customerId = data.customerId ?? "";
  if (data.customerMode === "new") {
    if (data.email) {
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("business_id", businessId)
        .ilike("email", data.email)
        .maybeSingle();
      if (existing) customerId = existing.id;
    }
    if (!customerId) {
      const { data: created, error } = await supabase
        .from("customers")
        .insert({
          business_id: businessId,
          first_name: data.firstName!,
          last_name: data.lastName,
          email: data.email ?? null,
          phone: data.phone ?? null,
        })
        .select("id")
        .single();
      if (error || !created) return failure(databaseErrorMessage(error, t));
      customerId = created.id;
    }
  }

  const { data: location } = await supabase
    .from("staff_members")
    .select("location_id")
    .eq("id", data.staffId)
    .eq("business_id", businessId)
    .maybeSingle();
  let locationId = location?.location_id ?? null;
  if (!locationId) {
    const { data: first } = await supabase
      .from("locations")
      .select("id")
      .eq("business_id", businessId)
      .order("sort_order")
      .limit(1)
      .single();
    locationId = first?.id ?? null;
  }
  if (!locationId) return failure(e.noLocation);

  const startsAt = zonedTimeToUtc(data.date, timeToMinutes(data.time), workspace.business.timezone);
  const endsAt = new Date(startsAt.getTime() + terms.duration * 60_000);
  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      business_id: businessId,
      location_id: locationId,
      staff_id: data.staffId,
      customer_id: customerId,
      service_id: terms.service.id,
      service_name: terms.service.name,
      duration_minutes: terms.duration,
      price_cents: terms.price,
      currency: workspace.business.currency,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      blocked_until: new Date(endsAt.getTime() + terms.buffer * 60_000).toISOString(),
      status: "confirmed",
      source: "staff",
      internal_note: data.internalNote,
      created_by: workspace.user.id,
    })
    .select("id")
    .single();
  if (error || !appointment)
    return failure(error?.code === "23P01" ? e.overlap : databaseErrorMessage(error, t));

  refresh();
  redirect(`/app/appointments/${appointment.id}?created=1`);
}

const statusSchema = z.object({
  appointmentId: z.uuid(),
  status: z.enum(["pending", "confirmed", "completed", "cancelled", "no_show"]),
});

export async function changeStatus(formData: FormData) {
  const parsed = statusSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  const workspace = await authorize(["appointments.manage_all", "appointments.manage_own"]);
  if (!workspace) return;
  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, staff_id")
    .eq("id", parsed.data.appointmentId)
    .eq("business_id", workspace.business.id)
    .maybeSingle();
  if (!appointment || !canManageFor(workspace, appointment.staff_id)) return;
  if (!NEXT_STATUSES[appointment.status as AppointmentStatus].includes(parsed.data.status)) return;
  await supabase
    .from("appointments")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.appointmentId);
  refresh(parsed.data.appointmentId);
}

/** Deletes an appointment everywhere (calendar, history, client link); payments stay, unlinked. */
export async function deleteAppointment(formData: FormData) {
  const id = String(formData.get("appointmentId") ?? "");
  const date = String(formData.get("date") ?? "");
  const workspace = await authorize(["appointments.manage_all", "appointments.manage_own"]);
  if (!workspace || !/^[0-9a-f-]{36}$/.test(id)) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_appointment", { p_appointment_id: id });
  if (error) return;
  refresh(id);
  redirect(`/app/calendar?deleted=1${/^\d{4}-\d{2}-\d{2}$/.test(date) ? `&date=${date}` : ""}`);
}

export async function cancelAppointment(formData: FormData) {
  const parsed = cancelSchema(await getT()).safeParse(formToObject(formData));
  if (!parsed.success) return;
  const workspace = await authorize(["appointments.manage_all", "appointments.manage_own"]);
  if (!workspace) return;
  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("status, staff_id")
    .eq("id", parsed.data.appointmentId)
    .eq("business_id", workspace.business.id)
    .maybeSingle();
  if (
    !appointment ||
    !canManageFor(workspace, appointment.staff_id) ||
    !NEXT_STATUSES[appointment.status].includes("cancelled")
  )
    return;
  await supabase
    .from("appointments")
    .update({
      status: "cancelled",
      cancelled_by: "business",
      cancellation_reason: parsed.data.reason,
    })
    .eq("id", parsed.data.appointmentId);
  refresh(parsed.data.appointmentId);
}

export async function rescheduleAppointment(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  const e = t.appointments.errors;
  const parsed = rescheduleSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const workspace = await authorize(["appointments.manage_all", "appointments.manage_own"]);
  if (!workspace) return failure(e.reschedule);
  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, status, staff_id, service_id, duration_minutes, ends_at, blocked_until")
    .eq("id", parsed.data.appointmentId)
    .eq("business_id", workspace.business.id)
    .maybeSingle();
  if (!appointment) return failure(e.gone);
  if (
    !canManageFor(workspace, appointment.staff_id) ||
    !canManageFor(workspace, parsed.data.staffId)
  ) {
    return failure(e.moveOwn);
  }
  if (appointment.status === "cancelled") return failure(e.cancelledMove);

  const bufferMs =
    new Date(appointment.blocked_until).getTime() - new Date(appointment.ends_at).getTime();
  const startsAt = zonedTimeToUtc(
    parsed.data.date,
    timeToMinutes(parsed.data.time),
    workspace.business.timezone,
  );
  const endsAt = new Date(startsAt.getTime() + appointment.duration_minutes * 60_000);
  const { error } = await supabase
    .from("appointments")
    .update({
      staff_id: parsed.data.staffId,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      blocked_until: new Date(endsAt.getTime() + bufferMs).toISOString(),
    })
    .eq("id", appointment.id);
  if (error) return failure(error.code === "23P01" ? e.overlap : databaseErrorMessage(error, t));
  refresh(appointment.id);
  return success(t.appointments.moved);
}

export async function saveInternalNote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([
    authorize(["appointments.manage_all", "appointments.manage_own"]),
    getT(),
  ]);
  if (!workspace) return failure(t.appointments.errors.edit);
  const id = String(formData.get("appointmentId") ?? "");
  const note =
    String(formData.get("internalNote") ?? "")
      .trim()
      .slice(0, 2000) || null;
  const supabase = await createClient();
  const { error, count } = await supabase
    .from("appointments")
    .update({ internal_note: note }, { count: "exact" })
    .eq("id", id)
    .eq("business_id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  if (count === 0) return failure(t.appointments.errors.cantEdit);
  refresh(id);
  return success(t.appointments.noteSaved);
}
