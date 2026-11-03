import { dictionaries } from "@/i18n/dictionaries";

import { en as app } from "~/i18n/en";

import { bookingErrorMessage, linkErrorMessage } from "./errors";

const t = dictionaries.en;

it("maps every link error", () => {
  const l = app.client.linkErrors;
  expect(linkErrorMessage("email_not_confirmed", t, app)).toBe(t.auth.messages.confirmFirst);
  expect(linkErrorMessage("too_many_attempts", t, app)).toBe(l.too_many_attempts);
  expect(linkErrorMessage("connection_code_invalid", t, app)).toBe(l.connection_code_invalid);
  expect(linkErrorMessage("plan_limit_customers", t, app)).toBe(
    t.booking.errors.rpc.plan_limit_customers,
  );
  expect(linkErrorMessage("categories_required", t, app)).toBe(l.categories_required);
  expect(linkErrorMessage("customer_already_linked", t, app)).toBe(l.customer_already_linked);
});

it("maps booking and cancel errors to the website's messages", () => {
  const e = t.booking.errors;
  expect(bookingErrorMessage({ message: "slot_unavailable" }, t, app)).toBe(e.rpc.slot_unavailable);
  expect(bookingErrorMessage({ code: "23P01", message: "conflicting key" }, t, app)).toBe(
    e.justBooked,
  );
  expect(bookingErrorMessage({ message: "cancellation_deadline_passed" }, t, app)).toBe(
    t.booking.manage.rpc.cancellation_deadline_passed,
  );
  expect(bookingErrorMessage({ message: "too_many_bookings" }, t, app)).toBe(e.tooManyBookings);
  expect(bookingErrorMessage({ message: "client_link_required" }, t, app)).toBe(
    app.client.linkErrors.client_link_required,
  );
});

it("uses the generic message for unknown errors", () => {
  expect(linkErrorMessage("something_else", t, app)).toBe(t.errors.generic);
  expect(bookingErrorMessage({ code: "XX000", message: "boom" }, t, app)).toBe(
    t.booking.errors.failed,
  );
});
