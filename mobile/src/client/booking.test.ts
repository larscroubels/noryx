import { bookingReducer, initialBooking, type BookingState } from "./booking";

const slot = { startsAt: "2026-11-04T09:00:00.000Z", label: "10:00", staffIds: ["anna", "ben"] };

function walk(): BookingState {
  let s = initialBooking("2026-11-04");
  s = bookingReducer(s, { type: "service", serviceId: "cut" });
  s = bookingReducer(s, { type: "staff", staffId: "any" });
  s = bookingReducer(s, { type: "slot", slot });
  return s;
}

it("walks service → staff → time → confirm", () => {
  const s0 = initialBooking("2026-11-04");
  expect(s0.step).toBe("service");
  const s = walk();
  expect(s).toMatchObject({ step: "confirm", serviceId: "cut", staffId: "any", slot });
  // "Any professional" books the first one free at that time.
  expect(bookingReducer(s, { type: "back" }).step).toBe("time");
});

it("returns to times when the slot was taken", () => {
  const s = bookingReducer(walk(), { type: "failed", error: "slot_unavailable", message: "Taken" });
  expect(s).toMatchObject({ step: "time", slot: null, message: "Taken", reloadTimes: 1 });
});

it("stays on confirm for other errors", () => {
  const s = bookingReducer(walk(), {
    type: "failed",
    error: "client_link_required",
    message: "Link",
  });
  expect(s).toMatchObject({ step: "confirm", message: "Link", reloadTimes: 0 });
});

it("pending bookings say the salon will confirm", () => {
  const s = bookingReducer(walk(), { type: "booked", status: "pending" });
  expect(s).toMatchObject({ step: "done", result: "pending" });
  expect(bookingReducer(walk(), { type: "booked", status: "confirmed" }).result).toBe("confirmed");
});

it("changing the date clears the chosen time", () => {
  const s = bookingReducer({ ...walk(), step: "time" }, { type: "date", date: "2026-11-05" });
  expect(s).toMatchObject({ date: "2026-11-05", slot: null });
});
