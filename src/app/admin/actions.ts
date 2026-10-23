"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { failure, formToObject, success, validationFailure, type ActionState } from "@/lib/actions";
import type { Dictionary } from "@/i18n/dictionaries";
import { getT } from "@/i18n/server";
import { isPlatformAdmin } from "@/lib/auth/session";
import { logDatabaseError } from "@/lib/supabase/errors";
import { createClient } from "@/lib/supabase/server";

const reason = (t: Dictionary) => z.string().trim().min(3, t.admin.form.reasonAudit).max(500);

const schema = (t: Dictionary) =>
  z.object({
    businessId: z.uuid(),
    status: z.enum(["active", "suspended", "closed"]),
    reason: reason(t),
  });

export async function setBusinessStatus(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  if (!(await isPlatformAdmin())) return failure(t.admin.errors.required);
  const parsed = schema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  // The database function re-checks platform-admin rights and writes the audit event.
  const { error } = await supabase.rpc("admin_set_business_status", {
    p_business_id: parsed.data.businessId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason,
  });
  if (error) return failure(t.admin.errors.status);
  revalidatePath("/admin");
  return success(t.admin.statusUpdated);
}

const subscriptionSchema = (t: Dictionary) =>
  z.object({
    businessId: z.uuid(),
    planId: z.string().regex(/^[a-z_]+$/),
    status: z.enum(["trialing", "active", "past_due", "cancelled"]),
    reason: reason(t),
  });

export async function setSubscription(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  if (!(await isPlatformAdmin())) return failure(t.admin.errors.required);
  const parsed = subscriptionSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_subscription", {
    p_business_id: parsed.data.businessId,
    p_plan_id: parsed.data.planId,
    p_status: parsed.data.status,
    p_reason: parsed.data.reason,
  });
  if (error) return failure(t.admin.errors.plan);
  revalidatePath("/admin");
  return success(t.admin.planUpdated);
}

const domainSchema = (t: Dictionary) =>
  z.object({
    businessId: z.uuid(),
    domain: z.string().trim().max(253),
    reason: reason(t),
  });

/** Assigns (or clears) a Pro business's own domain (the paid extra); DNS must point to NORYX. */
export async function setCustomDomain(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  if (!(await isPlatformAdmin())) return failure(t.admin.errors.required);
  const parsed = domainSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_custom_domain", {
    p_business_id: parsed.data.businessId,
    p_domain: parsed.data.domain,
    p_reason: parsed.data.reason,
  });
  if (error) {
    const message = error.message === "plan_feature_custom_domain" ? t.admin.domain.proOnly : t.admin.domain.failed;
    return failure(message, { domain: [message] });
  }
  revalidatePath("/admin");
  return success(t.admin.domain.saved);
}

const supportStatusSchema = z.object({ requestId: z.uuid(), status: z.enum(["open", "closed"]) });

/** Marks a support request handled (or reopens it). The database re-checks admin rights. */
export async function setSupportRequestStatus(formData: FormData) {
  if (!(await isPlatformAdmin())) return;
  const parsed = supportStatusSchema.safeParse(formToObject(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_set_support_request_status", {
    p_request_id: parsed.data.requestId,
    p_status: parsed.data.status,
  });
  if (error) logDatabaseError("admin.support_status_failed", error);
  revalidatePath("/admin");
}

export async function deleteSupportRequest(formData: FormData) {
  if (!(await isPlatformAdmin())) return;
  const parsed = z.object({ requestId: z.uuid() }).safeParse(formToObject(formData));
  if (!parsed.success) return;
  const supabase = await createClient();
  const { error } = await supabase.rpc("admin_delete_support_request", { p_request_id: parsed.data.requestId });
  if (error) logDatabaseError("admin.support_delete_failed", error);
  revalidatePath("/admin");
}
