import "server-only";

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Delivers queued notifications. No email/SMS provider is integrated yet, so
 * queued messages are marked "skipped" with the reason instead of pretending
 * they were sent. Plug a provider in here (e.g. Resend, Postmark) to deliver them.
 */
export function isEmailDeliveryConfigured() {
  return Boolean(process.env.EMAIL_PROVIDER_API_KEY);
}

export async function processNotificationsForAppointment(appointmentId: string) {
  const admin = createAdminClient();
  if (!admin) return;
  if (!isEmailDeliveryConfigured()) {
    const { error } = await admin
      .from("notifications")
      .update({
        status: "skipped",
        last_error: "No email provider configured",
        processed_at: new Date().toISOString(),
      })
      .eq("appointment_id", appointmentId)
      .eq("status", "pending");
    if (error) logger.error("notifications.mark_skipped_failed", { code: error.code });
    return;
  }
  // Provider integration intentionally not implemented yet; leave rows pending for a worker.
  logger.warn("notifications.provider_not_implemented", { appointmentId });
}

/** Same honesty rule for order notifications (they reference the order in their payload). */
export async function processNotificationsForOrder(orderId: string) {
  await markSkipped("order_id", orderId);
}

/** Same rule for gift card orders (payload.gift_card_id). */
export async function processNotificationsForGiftCard(giftCardId: string) {
  await markSkipped("gift_card_id", giftCardId);
}

/** Same rule for the salon's notice that a client deleted a booking. */
export async function processNotificationsForDeletedBooking(appointmentId: string) {
  await markSkipped("deleted_appointment_id", appointmentId);
}

async function markSkipped(
  payloadKey: "order_id" | "gift_card_id" | "deleted_appointment_id",
  id: string,
) {
  const admin = createAdminClient();
  if (!admin || isEmailDeliveryConfigured()) return;
  const { error } = await admin
    .from("notifications")
    .update({
      status: "skipped",
      last_error: "No email provider configured",
      processed_at: new Date().toISOString(),
    })
    .eq(`payload->>${payloadKey}`, id)
    .eq("status", "pending");
  if (error) logger.error("notifications.mark_skipped_failed", { code: error.code });
}
