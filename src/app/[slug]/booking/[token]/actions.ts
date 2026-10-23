"use server";

import { headers } from "next/headers";

import { getT } from "@/i18n/server";
import { failure, success, type ActionState } from "@/lib/actions";
import { logger } from "@/lib/logger";
import { processNotificationsForDeletedBooking } from "@/lib/notifications";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";

/** The client cancels through their private link: the booking is deleted everywhere. */
export async function deleteOwnBooking(
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
  if (!/^[a-f0-9]{48}$/.test(token)) return failure(MESSAGES.booking_not_found!);
  const supabase = await createClient();
  const { data: deletedId, error } = await supabase.rpc("delete_booking_by_token", { p_token: token });
  if (error || !deletedId) return failure((error && MESSAGES[error.message]) ?? m.failed);
  // The booking is gone; a notification hiccup must not turn that into an error for the client.
  await processNotificationsForDeletedBooking(deletedId).catch((cause) =>
    logger.error("booking.delete_notice_failed", { cause }),
  );
  // No revalidation: the page keeps showing the confirmation until the client leaves it.
  return success(m.deleted);
}
