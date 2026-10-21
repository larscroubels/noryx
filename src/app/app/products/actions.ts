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
import { createClient } from "@/lib/supabase/server";
import { productSchema, STOCK_REASONS, stockAdjustmentSchema } from "@/lib/validation/product";

export async function saveProduct(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("products.manage"), getT()]);
  const p = t.retail.products;
  if (!workspace) return failure(p.errors.manage);
  const parsed = productSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const values = {
    business_id: workspace.business.id,
    name: d.name,
    description: d.description,
    sku: d.sku,
    category: d.category,
    price_cents: d.price,
    cost_cents: d.cost,
    low_stock_threshold: d.lowStockThreshold,
    is_active: d.isActive,
    is_online: d.isOnline,
  };
  const supabase = await createClient();
  const id = String(formData.get("id") ?? "");
  const duplicateSku = p.errors.duplicateSku;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(values)
      .eq("id", id)
      .eq("business_id", workspace.business.id);
    if (error)
      return error.code === "23505"
        ? failure(duplicateSku, { sku: [duplicateSku] })
        : failure(databaseErrorMessage(error, t));
    revalidatePath("/app/products");
    revalidatePath(`/app/products/${id}`);
    return success(p.saved);
  }

  const { data: created, error } = await supabase
    .from("products")
    .insert(values)
    .select("id")
    .single();
  if (error || !created)
    return error?.code === "23505"
      ? failure(duplicateSku, { sku: [duplicateSku] })
      : failure(databaseErrorMessage(error, t));
  if (d.initialStock && d.initialStock > 0 && workspace.permissions.has("inventory.manage")) {
    await supabase.from("inventory_movements").insert({
      business_id: workspace.business.id,
      product_id: created.id,
      quantity_change: d.initialStock,
      reason: "initial",
      created_by: workspace.user.id,
    });
  }
  revalidatePath("/app/products");
  redirect(`/app/products/${created.id}?created=1`);
}

export async function adjustStock(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("inventory.manage"), getT()]);
  const p = t.retail.products;
  if (!workspace) return failure(p.errors.stock);
  const parsed = stockAdjustmentSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const reason = STOCK_REASONS.find((r) => r.value === parsed.data.reason)!;
  // Deliveries and returns add stock, sales and damage remove it, corrections keep their sign.
  const change =
    reason.sign === 0 ? parsed.data.quantity : reason.sign * Math.abs(parsed.data.quantity);
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_movements").insert({
    business_id: workspace.business.id,
    product_id: parsed.data.productId,
    quantity_change: change,
    reason: parsed.data.reason,
    note: parsed.data.note,
    created_by: workspace.user.id,
  });
  if (error) {
    if (error.code === "23514")
      return failure(p.errors.notEnough, { quantity: [p.errors.belowZero] });
    return failure(databaseErrorMessage(error, t));
  }
  revalidatePath("/app/products");
  revalidatePath(`/app/products/${parsed.data.productId}`);
  return success(p.stockChanged(change > 0, Math.abs(change)));
}
