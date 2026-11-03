import type { ClientAppointment } from "./api";
import { splitAppointments } from "./appointments";

const now = new Date("2026-11-03T12:00:00Z");
const row = (
  id: string,
  startsAt: string,
  linked = true,
  canCancel = false,
): ClientAppointment => ({
  appointment_id: id,
  business_id: linked ? "a" : "b",
  business_name: linked ? "Atelier" : "Old salon",
  business_slug: "s",
  linked,
  service_name: "Cut",
  staff_name: null,
  starts_at: startsAt,
  ends_at: startsAt,
  price_cents: 4500,
  currency: "EUR",
  locale: "nl-BE",
  timezone: "Europe/Brussels",
  cancellation_notice_hours: 24,
  status: "confirmed",
  can_cancel: canCancel,
});

it("splits upcoming, history and previous salons", () => {
  const { upcoming, history, previousSalons } = splitAppointments(
    [
      row("later", "2026-11-20T09:00:00Z"),
      row("soon", "2026-11-05T09:00:00Z"),
      row("past", "2026-10-01T09:00:00Z"),
      row("older", "2026-09-01T09:00:00Z"),
      row("old-salon-past", "2026-08-01T09:00:00Z", false),
    ],
    now,
  );
  expect(upcoming.map((a) => a.appointment_id)).toEqual(["soon", "later"]);
  expect(history.map((a) => a.appointment_id)).toEqual(["past", "older"]);
  expect(previousSalons.map((a) => a.appointment_id)).toEqual(["old-salon-past"]);
});

it("keeps upcoming visits at previous salons cancellable", () => {
  const { previousSalons, upcoming } = splitAppointments(
    [
      row("old-past", "2026-10-01T09:00:00Z", false),
      row("old-upcoming", "2026-11-10T09:00:00Z", false, true),
    ],
    now,
  );
  expect(upcoming).toEqual([]);
  expect(previousSalons.map((a) => a.appointment_id)).toEqual(["old-upcoming", "old-past"]);
  expect(previousSalons[0]!.can_cancel).toBe(true);
});
