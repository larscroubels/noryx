import type { Dictionary } from "@/i18n/dictionaries";

import type { AppStrings } from "~/i18n";

/** Message for a link_business_by_code error code (plan A). */
export function linkErrorMessage(error: string, t: Dictionary, app: AppStrings): string {
  if (error === "email_not_confirmed") return t.auth.messages.confirmFirst;
  if (error === "plan_limit_customers") return t.booking.errors.rpc.plan_limit_customers!;
  const own = app.client.linkErrors as Record<string, string>;
  return own[error] ?? t.errors.generic;
}

/** Message for a booking or cancellation error, using the website's booking texts. */
export function bookingErrorMessage(
  error: { code?: string; message?: string } | null,
  t: Dictionary,
  app: AppStrings,
): string {
  const e = t.booking.errors;
  const code = error?.message ?? "";
  if (error?.code === "23P01") return e.justBooked;
  if (code === "too_many_bookings") return e.tooManyBookings;
  if (code === "client_link_required") return app.client.linkErrors.client_link_required;
  return e.rpc[code] ?? t.booking.manage.rpc[code] ?? e.failed;
}
