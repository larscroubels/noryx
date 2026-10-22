"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { getT } from "@/i18n/server";
import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { serviceSchema } from "@/lib/validation/service";

export async function saveService(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("services.manage"), getT()]);
  if (!workspace) return failure(t.services.errors.manage);
  const parsed = serviceSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const data = parsed.data;
  const businessId = workspace.business.id;
  const supabase = await createClient();

  let categoryId = data.categoryId;
  if (data.newCategory) {
    const { data: existing } = await supabase
      .from("service_categories")
      .select("id, name")
      .eq("business_id", businessId);
    const match = existing?.find(
      (category) => category.name.toLowerCase() === data.newCategory!.toLowerCase(),
    );
    if (match) {
      categoryId = match.id;
    } else {
      const { data: category, error } = await supabase
        .from("service_categories")
        .insert({
          business_id: businessId,
          name: data.newCategory,
          sort_order: existing?.length ?? 0,
        })
        .select("id")
        .single();
      if (error || !category) return failure(databaseErrorMessage(error, t));
      categoryId = category.id;
    }
  }

  const values = {
    business_id: businessId,
    name: data.name,
    category_id: categoryId,
    description: data.description,
    duration_minutes: data.durationMinutes,
    price_cents: data.price,
    promo_price_cents: data.promoPrice,
    buffer_after_minutes: data.bufferAfterMinutes,
    is_active: data.isActive,
    is_online_bookable: data.isOnlineBookable,
  };

  const serviceId = String(formData.get("id") ?? "");
  let savedId = serviceId;
  if (serviceId) {
    const { error, count } = await supabase
      .from("services")
      .update(values, { count: "exact" })
      .eq("id", serviceId)
      .eq("business_id", businessId);
    if (error) return failure(databaseErrorMessage(error, t));
    if (count === 0) return failure(t.services.errors.gone);
  } else {
    const { data: created, error } = await supabase
      .from("services")
      .insert(values)
      .select("id")
      .single();
    if (error || !created) return failure(databaseErrorMessage(error, t));
    savedId = created.id;
  }

  // Sync which professionals perform this service, keeping per-staff overrides for those who stay.
  const { data: current } = await supabase
    .from("staff_services")
    .select("staff_id")
    .eq("service_id", savedId);
  const currentIds = new Set((current ?? []).map((row) => row.staff_id));
  const wanted = new Set(data.staffIds);
  const toRemove = [...currentIds].filter((id) => !wanted.has(id));
  const toAdd = [...wanted].filter((id) => !currentIds.has(id));
  if (toRemove.length > 0)
    await supabase
      .from("staff_services")
      .delete()
      .eq("service_id", savedId)
      .in("staff_id", toRemove);
  if (toAdd.length > 0) {
    const { error } = await supabase.from("staff_services").insert(
      toAdd.map((staffId) => ({
        business_id: businessId,
        staff_id: staffId,
        service_id: savedId,
      })),
    );
    if (error) return failure(databaseErrorMessage(error, t, t.services.errors.staffSync));
  }

  revalidatePath("/app/services");
  redirect(`/app/services?saved=${encodeURIComponent(data.name)}`);
}

export async function deleteService(formData: FormData) {
  const workspace = await authorize("services.manage");
  if (!workspace) return;
  const supabase = await createClient();
  // Past appointments keep their own snapshot of the service, so history is preserved.
  await supabase
    .from("services")
    .delete()
    .eq("id", String(formData.get("id") ?? ""))
    .eq("business_id", workspace.business.id);
  revalidatePath("/app/services");
  redirect("/app/services?deleted=1");
}
