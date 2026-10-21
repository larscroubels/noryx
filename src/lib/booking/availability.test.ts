import { describe, expect, it } from "vitest";

import { computeAvailability, type AvailabilityInput } from "./availability";

const TZ = "Europe/Brussels";
// Wednesday 21 October 2026, Brussels is UTC+2 (CEST).
const DATE = "2026-10-21";
const at = (iso: string) => new Date(iso);

function input(overrides: Partial<AvailabilityInput> = {}): AvailabilityInput {
  return {
    date: DATE,
    timeZone: TZ,
    now: at("2026-10-20T08:00:00Z"),
    policy: { minNoticeMinutes: 0, horizonDays: 60, slotIntervalMinutes: 30, bufferMinutes: 0 },
    serviceBufferMinutes: 0,
    locationHours: [],
    staff: [
      {
        staffId: "anna",
        durationMinutes: 60,
        workingHours: [{ weekday: 3, startMinute: 9 * 60, endMinute: 12 * 60 }],
        busy: [],
      },
    ],
    ...overrides,
  };
}

const times = (slots: ReturnType<typeof computeAvailability>) =>
  slots.map((slot) => slot.startsAt.toISOString());

describe("computeAvailability", () => {
  it("offers aligned slots that fit entirely inside working hours, in UTC", () => {
    expect(times(computeAvailability(input()))).toEqual([
      "2026-10-21T07:00:00.000Z",
      "2026-10-21T07:30:00.000Z",
      "2026-10-21T08:00:00.000Z",
      "2026-10-21T08:30:00.000Z",
      "2026-10-21T09:00:00.000Z",
    ]);
  });

  it("returns nothing on days the professional does not work", () => {
    expect(computeAvailability(input({ date: "2026-10-22" }))).toEqual([]);
  });

  it("treats gaps between working ranges as breaks", () => {
    const slots = computeAvailability(
      input({
        staff: [
          {
            staffId: "anna",
            durationMinutes: 60,
            workingHours: [
              { weekday: 3, startMinute: 9 * 60, endMinute: 10 * 60 + 30 },
              { weekday: 3, startMinute: 13 * 60, endMinute: 14 * 60 },
            ],
            busy: [],
          },
        ],
      }),
    );
    // 09:00, 09:30 (ends 10:30) and 13:00 local.
    expect(times(slots)).toEqual([
      "2026-10-21T07:00:00.000Z",
      "2026-10-21T07:30:00.000Z",
      "2026-10-21T11:00:00.000Z",
    ]);
  });

  it("restricts to location opening hours when configured", () => {
    const slots = computeAvailability(
      input({ locationHours: [{ weekday: 3, startMinute: 10 * 60, endMinute: 12 * 60 }] }),
    );
    expect(times(slots)).toEqual([
      "2026-10-21T08:00:00.000Z",
      "2026-10-21T08:30:00.000Z",
      "2026-10-21T09:00:00.000Z",
    ]);
  });

  it("excludes slots overlapping existing appointments, including the new appointment's buffer", () => {
    const busy = [{ startsAt: at("2026-10-21T09:00:00Z"), endsAt: at("2026-10-21T09:30:00Z") }]; // 11:00–11:30 local
    const slots = computeAvailability({
      ...input(),
      serviceBufferMinutes: 15,
      staff: [{ ...input().staff[0]!, busy }],
    });
    // 09:00 ends 10:15 incl. buffer; 09:30 ends 10:45; 10:00 would end 11:15 → overlaps 11:00.
    expect(times(slots)).toEqual(["2026-10-21T07:00:00.000Z", "2026-10-21T07:30:00.000Z"]);
  });

  it("uses the larger of the business and service buffer", () => {
    const busy = [{ startsAt: at("2026-10-21T08:00:00Z"), endsAt: at("2026-10-21T08:30:00Z") }]; // 10:00 local
    const base = input();
    const slots = computeAvailability({
      ...base,
      policy: { ...base.policy, bufferMinutes: 30 },
      serviceBufferMinutes: 10,
      staff: [{ ...base.staff[0]!, busy }],
    });
    // 09:00 + 60 + 30 buffer = 10:30 → overlaps the 10:00 appointment, so nothing before it fits.
    expect(times(slots)).toEqual(["2026-10-21T08:30:00.000Z", "2026-10-21T09:00:00.000Z"]);
  });

  it("enforces minimum notice and the booking horizon", () => {
    const base = input();
    const notice = computeAvailability({
      ...base,
      now: at("2026-10-21T06:30:00Z"),
      policy: { ...base.policy, minNoticeMinutes: 90 },
    });
    expect(times(notice)[0]).toBe("2026-10-21T08:00:00.000Z");

    const horizon = computeAvailability({
      ...base,
      now: at("2026-08-01T08:00:00Z"),
      policy: { ...base.policy, horizonDays: 30 },
    });
    expect(horizon).toEqual([]);
  });

  it("merges staff into shared slots for 'first available professional'", () => {
    const slots = computeAvailability(
      input({
        staff: [
          {
            staffId: "anna",
            durationMinutes: 60,
            workingHours: [{ weekday: 3, startMinute: 540, endMinute: 600 }],
            busy: [],
          },
          {
            staffId: "ben",
            durationMinutes: 30,
            workingHours: [{ weekday: 3, startMinute: 540, endMinute: 600 }],
            busy: [],
          },
        ],
      }),
    );
    expect(slots.map((slot) => [slot.startsAt.toISOString(), slot.staffIds])).toEqual([
      ["2026-10-21T07:00:00.000Z", ["anna", "ben"]],
      ["2026-10-21T07:30:00.000Z", ["ben"]],
    ]);
  });

  it("handles the autumn daylight-saving change (25-hour day)", () => {
    // Sunday 25 October 2026: clocks go back from 03:00 CEST to 02:00 CET.
    const slots = computeAvailability(
      input({
        date: "2026-10-25",
        staff: [
          {
            staffId: "anna",
            durationMinutes: 60,
            workingHours: [{ weekday: 7, startMinute: 600, endMinute: 660 }],
            busy: [],
          },
        ],
      }),
    );
    expect(times(slots)).toEqual(["2026-10-25T09:00:00.000Z"]); // 10:00 CET = 09:00 UTC
  });

  it("handles the spring daylight-saving change", () => {
    // Sunday 29 March 2026 at 10:00 CEST = 08:00 UTC.
    const slots = computeAvailability(
      input({
        date: "2026-03-29",
        now: at("2026-03-01T00:00:00Z"),
        staff: [
          {
            staffId: "anna",
            durationMinutes: 60,
            workingHours: [{ weekday: 7, startMinute: 600, endMinute: 660 }],
            busy: [],
          },
        ],
      }),
    );
    expect(times(slots)).toEqual(["2026-03-29T08:00:00.000Z"]);
  });
});
