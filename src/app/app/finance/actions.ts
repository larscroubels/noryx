"use server";

import { revalidatePath } from "next/cache";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { getT } from "@/i18n/server";
import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema, paymentSchema } from "@/lib/validation/finance";

export async function recordPayment(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([
    authorize(["finance.manage", "appointments.manage_all"]),
    getT(),
  ]);
  if (!workspace) return failure(t.finance.errors.payments);
  const parsed = paymentSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { data: appointment } = await supabase
    .from("appointments")
    .select("id, customer_id, currency")
    .eq("id", parsed.data.appointmentId)
    .eq("business_id", workspace.business.id)
    .maybeSingle();
  if (!appointment) return failure(t.finance.errors.appointmentGone);
  const { error } = await supabase.from("payments").insert({
    business_id: workspace.business.id,
    appointment_id: appointment.id,
    customer_id: appointment.customer_id,
    amount_cents: parsed.data.amount,
    currency: appointment.currency,
    method: parsed.data.method,
    note: parsed.data.note,
    recorded_by: workspace.user.id,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidatePath(`/app/appointments/${appointment.id}`);
  revalidatePath("/app/finance");
  return success(t.finance.paymentRecorded);
}

export async function refundPayment(formData: FormData) {
  const workspace = await authorize("finance.manage");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase
    .from("payments")
    .update({
      status: "refunded",
      refunded_at: new Date().toISOString(),
      refunded_by: workspace.user.id,
    })
    .eq("id", String(formData.get("id") ?? ""))
    .eq("business_id", workspace.business.id)
    .eq("status", "recorded");
  revalidatePath("/app/finance");
  const appointmentId = String(formData.get("appointmentId") ?? "");
  if (appointmentId) revalidatePath(`/app/appointments/${appointmentId}`);
}

export async function addExpense(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("finance.manage"), getT()]);
  if (!workspace) return failure(t.finance.errors.expenses);
  const parsed = expenseSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.from("expenses").insert({
    business_id: workspace.business.id,
    description: parsed.data.description,
    category: parsed.data.category,
    amount_cents: parsed.data.amount,
    currency: workspace.business.currency,
    spent_on: parsed.data.spentOn,
    supplier: parsed.data.supplier,
    reference: parsed.data.reference,
    created_by: workspace.user.id,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidatePath("/app/finance");
  return success(t.finance.expenseAdded);
}

export async function deleteExpense(formData: FormData) {
  const workspace = await authorize("finance.manage");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase
    .from("expenses")
    .delete()
    .eq("id", String(formData.get("id") ?? ""))
    .eq("business_id", workspace.business.id);
  revalidatePath("/app/finance");
}
