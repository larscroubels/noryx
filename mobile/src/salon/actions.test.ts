import { dictionaries } from "@/i18n/dictionaries";

import { changeStatus, reschedule, saveInternalNote } from "./actions";

const mockResult: { error: { code?: string; message?: string } | null; count?: number } = {
  error: null,
};
const mockUpdate = jest.fn();
const mockRpc = jest.fn();

jest.mock("~/lib/supabase", () => {
  const chain = {
    update: (...args: unknown[]) => {
      mockUpdate(...args);
      return chain;
    },
    eq: () => chain,
    then: (resolve: (value: unknown) => void) => resolve(mockResult),
  };
  return {
    supabase: {
      from: () => chain,
      rpc: (...args: unknown[]) => {
        mockRpc(...args);
        return Promise.resolve(mockResult);
      },
    },
  };
});

const t = dictionaries.en;

beforeEach(() => {
  mockResult.error = null;
  mockResult.count = 1;
  mockUpdate.mockClear();
  mockRpc.mockClear();
});

it("shows the database refusal", async () => {
  mockResult.error = { code: "42501", message: "new row violates row-level security policy" };
  const result = await changeStatus("a1", "completed", t);
  expect(result).toEqual({ ok: false, message: t.errors.noPermission });
});

it("maps overlap to the overlap message", async () => {
  mockResult.error = { code: "23P01", message: "conflicting key value" };
  const result = await reschedule(
    { appointmentId: "a1", staffId: "s1", startsAt: "2026-11-04T09:00:00Z" },
    t,
  );
  expect(result).toEqual({ ok: false, message: t.appointments.errors.overlap });
  expect(mockRpc).toHaveBeenCalledWith("reschedule_appointment", {
    p_appointment_id: "a1",
    p_staff_id: "s1",
    p_starts_at: "2026-11-04T09:00:00Z",
  });
});

it("empty note saves null", async () => {
  expect(await saveInternalNote("a1", "   ", t)).toEqual({ ok: true });
  expect(mockUpdate).toHaveBeenCalledWith({ internal_note: null }, { count: "exact" });
});
