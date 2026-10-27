import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { I18nProvider } from "~/i18n";
import type { AppointmentDetail } from "~/lib/appointments";

import { GiftCardSheet, RescheduleSheet } from "./sheets";

const mockRedeem = jest.fn();
jest.mock("./actions", () => ({
  redeemGiftCard: (...args: unknown[]) => mockRedeem(...args),
}));
let mockUuid = 0;
jest.mock("expo-crypto", () => ({
  randomUUID: () => `00000000-0000-4000-8000-${String(++mockUuid).padStart(12, "0")}`,
}));
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock("expo-localization", () => ({ getLocales: () => [{ languageTag: "en-GB" }] }));

const appointment: AppointmentDetail = {
  id: "11111111-1111-4111-8111-111111111111",
  business_id: "b1",
  starts_at: "2026-11-04T09:00:00Z",
  ends_at: "2026-11-04T10:00:00Z",
  status: "confirmed",
  service_name: "Haircut",
  staff_id: "staff-b",
  price_cents: 4500,
  currency: "EUR",
  source: "staff",
  customer_note: null,
  internal_note: null,
  cancelled_by: null,
  cancellation_reason: null,
  customer: null,
  staff: null,
};

beforeEach(() => mockRedeem.mockReset());

it("uses a fresh idempotency key for every redemption", async () => {
  mockRedeem.mockResolvedValue({ ok: true, message: "done" });
  const onDone = jest.fn();
  await render(
    <I18nProvider>
      <GiftCardSheet
        appointment={appointment}
        locale="en-GB"
        visible
        onClose={jest.fn()}
        onDone={onDone}
      />
    </I18nProvider>,
  );
  const redeem = async (code: string, amount: string) => {
    await fireEvent.changeText(screen.getByLabelText("Gift card code"), code);
    await fireEvent.changeText(screen.getByLabelText("Amount to deduct"), amount);
    await act(async () => {
      await fireEvent.press(screen.getByText("Redeem"));
    });
  };
  await redeem("ABCD-EFGH-JKMN-PQRS", "20");
  await redeem("WXYZ-EFGH-JKMN-PQRS", "10");
  expect(mockRedeem).toHaveBeenCalledTimes(2);
  const keys = mockRedeem.mock.calls.map((call) => call[0].idempotencyKey);
  expect(keys[0]).not.toBe(keys[1]);
  expect(onDone).toHaveBeenCalledTimes(2);
});

it("offers only their own profile to staff who can't move others' appointments", async () => {
  await render(
    <I18nProvider>
      <RescheduleSheet
        appointment={appointment}
        timeZone="Europe/Brussels"
        staff={[
          { id: "staff-a", display_name: "Anna" },
          { id: "staff-b", display_name: "Ben" },
        ]}
        canChooseStaff={false}
        visible
        onClose={jest.fn()}
        onDone={jest.fn()}
      />
    </I18nProvider>,
  );
  expect(screen.getByText("Ben")).toBeTruthy();
  expect(screen.queryByText("Anna")).toBeNull();
});
