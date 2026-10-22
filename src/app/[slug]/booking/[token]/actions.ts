"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

import { getT } from "@/i18n/server";
import { failure, success, type ActionState } from "@/lib/actions";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

export async function cancelOwnBooking(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const m = (await getT()).booking.manage;
  const MESSAGES = m.rpc;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`self-cancel:${ip}`, { limit: 10, windowMs: 10 * 60_000 }).allowed) {
    return failure(m.tooMany);
  }
  const token = String(formData.get("token") ?? "");
  const slug = String(formData.get("slug") ?? "");
  if (!/^[a-f0-9]{48}$/.test(token)) return failure(MESSAGES.booking_not_found!);
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_booking_by_token", {
    p_token: token,
    p_reason: String(formData.get("reason") ?? "").slice(0, 500) || undefined,
  });
  if (error) return failure(MESSAGES[error.message] ?? m.failed);
  revalidatePath(`/${slug}/booking/${token}`);
  return success(m.done);
}
