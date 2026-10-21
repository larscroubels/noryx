"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

const statusSchema = z.object({
  orderId: z.uuid(),
  status: z.enum(["confirmed", "ready", "completed"]),
});
const paymentSchema = z.object({
  orderId: z.uuid(),
  paymentStatus: z.enum(["unpaid", "paid", "refunded"]),
});

function refresh(orderId: string) {
  revalidatePath("/app/orders");
  revalidatePath(`/app/orders/${orderId}`);
  revalidatePath("/app/products");
}

export async function advanceOrder(formData: FormData) {
  const workspace = await authorize("orders.manage");
  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!workspace || !parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.orderId)
    .eq("business_id", workspace.business.id);
  refresh(parsed.data.orderId);
}

export async function setOrderPayment(formData: FormData) {
  const workspace = await authorize("orders.manage");
  const parsed = paymentSchema.safeParse({
    orderId: formData.get("orderId"),
    paymentStatus: formData.get("paymentStatus"),
  });
  if (!workspace || !parsed.success) return;
  const supabase = await createClient();
  await supabase
    .from("orders")
    .update({ payment_status: parsed.data.paymentStatus })
    .eq("id", parsed.data.orderId)
    .eq("business_id", workspace.business.id);
  refresh(parsed.data.orderId);
}

export async function cancelOrder(formData: FormData) {
  const workspace = await authorize("orders.manage");
  const orderId = z.uuid().safeParse(formData.get("orderId"));
  if (!workspace || !orderId.success) return;
  const supabase = await createClient();
  // Cancels and returns the reserved stock in one database transaction.
  await supabase.rpc("cancel_order", { p_order_id: orderId.data });
  refresh(orderId.data);
}
