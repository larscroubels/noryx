import type { Dictionary } from "@/i18n/dictionaries";
import { databaseErrorMessage } from "@/lib/actions";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { giftCardErrorMessage, normaliseGiftCardCode } from "@/lib/gift-card-codes";

import { supabase } from "~/lib/supabase";

/**
 * Appointment actions as the website performs them, with the user's own session.
 * RLS, the status trigger and the overlap constraint decide; these only translate
 * the database's answer into the website's messages.
 */
export type ActionResult = { ok: true; message?: string } | { ok: false; message: string };

type DbError = { code?: string; message?: string; details?: string } | null;

function fail(error: DbError, t: Dictionary): ActionResult {
  if (error?.code === "23P01") return { ok: false, message: t.appointments.errors.overlap };
  return { ok: false, message: databaseErrorMessage(error as never, t) };
}

/** An update RLS hides changes 0 rows without an error. */
function outcome(result: { error: DbError; count?: number | null }, t: Dictionary): ActionResult {
  if (result.error) return fail(result.error, t);
  if (result.count === 0) return { ok: false, message: t.appointments.errors.gone };
  return { ok: true };
}

export async function changeStatus(
  id: string,
  status: AppointmentStatus,
  t: Dictionary,
): Promise<ActionResult> {
  return outcome(
    await supabase.from("appointments").update({ status }, { count: "exact" }).eq("id", id),
    t,
  );
}

export async function cancelByBusiness(
  id: string,
  reason: string,
  t: Dictionary,
): Promise<ActionResult> {
  return outcome(
    await supabase
      .from("appointments")
      .update(
        {
          status: "cancelled",
          cancelled_by: "business",
          cancellation_reason: reason.trim().slice(0, 500) || null,
        },
        { count: "exact" },
      )
      .eq("id", id),
    t,
  );
}

export async function reschedule(
  input: { appointmentId: string; staffId: string; startsAt: string },
  t: Dictionary,
): Promise<ActionResult> {
  const { error } = await supabase.rpc("reschedule_appointment", {
    p_appointment_id: input.appointmentId,
    p_staff_id: input.staffId,
    p_starts_at: input.startsAt,
  });
  if (error?.message === "appointment_not_found")
    return { ok: false, message: t.appointments.errors.reschedule };
  return error ? fail(error, t) : { ok: true, message: t.appointments.moved };
}

/** Same insert as the website's recordPayment: recorded in NORYX, nothing is charged. */
export async function recordPayment(
  input: {
    businessId: string;
    appointmentId: string;
    customerId: string;
    currency: string;
    amountCents: number;
    method: string;
    note: string;
    userId: string;
  },
  t: Dictionary,
): Promise<ActionResult> {
  const { error } = await supabase.from("payments").insert({
    business_id: input.businessId,
    appointment_id: input.appointmentId,
    customer_id: input.customerId,
    amount_cents: input.amountCents,
    currency: input.currency,
    method: input.method as never,
    note: input.note.trim().slice(0, 300) || null,
    recorded_by: input.userId,
  });
  return error ? fail(error, t) : { ok: true, message: t.finance.paymentRecorded };
}

export async function redeemGiftCard(
  input: {
    businessId: string;
    appointmentId: string;
    code: string;
    amountCents: number;
    idempotencyKey: string;
  },
  t: Dictionary,
  money: (cents: number) => string,
): Promise<ActionResult> {
  const { data, error } = await supabase.rpc("redeem_gift_card", {
    p_business_id: input.businessId,
    p_code: normaliseGiftCardCode(input.code),
    p_amount_cents: input.amountCents,
    p_appointment_id: input.appointmentId,
    p_idempotency_key: input.idempotencyKey,
  });
  if (error || !data) return { ok: false, message: giftCardErrorMessage(error, t, money) };
  const balance = (data as { balance_cents: number }).balance_cents;
  return { ok: true, message: t.giftCards.redeem.done(money(input.amountCents), money(balance)) };
}

export async function saveInternalNote(
  id: string,
  note: string,
  t: Dictionary,
): Promise<ActionResult> {
  const value = note.trim().slice(0, 2000) || null;
  return outcome(
    await supabase
      .from("appointments")
      .update({ internal_note: value }, { count: "exact" })
      .eq("id", id),
    t,
  );
}
