"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { customerSchema, noteSchema } from "@/lib/validation/customer";

export async function saveCustomer(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("customers.manage"), getT()]);
  if (!workspace) return failure(t.customers.errors.edit);
  const parsed = customerSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const values = {
    business_id: workspace.business.id,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    marketing_opt_in: parsed.data.marketingOptIn,
  };
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const duplicate = t.customers.errors.duplicate;

  if (id) {
    const { error } = await supabase
      .from("customers")
      .update(values)
      .eq("id", id)
      .eq("business_id", workspace.business.id);
    if (error)
      return error.code === "23505"
        ? failure(duplicate, { email: [duplicate] })
        : failure(databaseErrorMessage(error, t));
    revalidatePath(`/app/customers/${id}`);
    return success(t.customers.saved);
  }
  const { data, error } = await supabase.from("customers").insert(values).select("id").single();
  if (error || !data)
    return error?.code === "23505"
      ? failure(duplicate, { email: [duplicate] })
      : failure(databaseErrorMessage(error, t));
  revalidatePath("/app/customers");
  redirect(`/app/customers/${data.id}`);
}

export async function addCustomerNote(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("customers.notes"), getT()]);
  if (!workspace) return failure(t.customers.errors.notes);
  const parsed = noteSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.from("customer_notes").insert({
    business_id: workspace.business.id,
    customer_id: parsed.data.customerId,
    body: parsed.data.body,
    created_by: workspace.user.id,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidatePath(`/app/customers/${parsed.data.customerId}`);
  return success(t.customers.noteAdded);
}

export async function deleteCustomerNote(formData: FormData) {
  const workspace = await authorize("customers.notes");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase
    .from("customer_notes")
    .delete()
    .eq("id", String(formData.get("id") ?? ""))
    .eq("business_id", workspace.business.id);
  revalidatePath(`/app/customers/${String(formData.get("customerId") ?? "")}`);
}

/**
 * GDPR erasure: removes personal data but keeps anonymised appointment records,
 * which the business may need for its own bookkeeping.
 */
export async function eraseCustomer(formData: FormData) {
  const workspace = await authorize("customers.manage");
  if (!workspace) return;
  const id = String(formData.get("id") ?? "");
  const supabase = await createClient();
  const { error } = await supabase
    .from("customers")
    .update({
      first_name: (await getT()).customers.erasedName,
      last_name: null,
      email: null,
      phone: null,
      marketing_opt_in: false,
    })
    .eq("id", id)
    .eq("business_id", workspace.business.id);
  if (error) {
    logger.error("customers.erase_failed", { code: error.code });
    redirect(`/app/customers/${id}?erase=failed`);
  }
  await supabase
    .from("customer_notes")
    .delete()
    .eq("customer_id", id)
    .eq("business_id", workspace.business.id);
  await supabase
    .from("appointments")
    .update({ internal_note: null })
    .eq("customer_id", id)
    .eq("business_id", workspace.business.id);

  const admin = createAdminClient();
  await admin?.from("audit_events").insert({
    business_id: workspace.business.id,
    actor_user_id: workspace.user.id,
    action: "customer.erased",
    entity_type: "customer",
    entity_id: id,
  });
  revalidatePath("/app/customers");
  redirect(`/app/customers/${id}?erased=1`);
}
