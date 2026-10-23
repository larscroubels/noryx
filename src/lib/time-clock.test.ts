import { describe, expect, it } from "vitest";

import { entryMinutes, hoursAndMinutes, weekDates, weeklyTotals } from "./time-clock";

const tz = "Europe/Brussels";
const now = Date.parse("2026-10-23T15:00:00Z");

describe("time clock maths", () => {
  it("counts closed entries and open entries up to now", () => {
    expect(entryMinutes({ clock_in: "2026-10-23T07:00:00Z", clock_out: "2026-10-23T11:30:00Z" }, now)).toBe(270);
    expect(entryMinutes({ clock_in: "2026-10-23T13:15:00Z", clock_out: null }, now)).toBe(105);
  });

  it("adds minutes per professional per local day of the week", () => {
    const totals = weeklyTotals(
      [
        { id: "1", staff_id: "anna", clock_in: "2026-10-19T07:00:00Z", clock_out: "2026-10-19T11:00:00Z" },
        { id: "2", staff_id: "anna", clock_in: "2026-10-19T12:00:00Z", clock_out: "2026-10-19T16:30:00Z" },
        // 23:30 on Sunday 25 October in Brussels is still that Sunday.
        { id: "3", staff_id: "ben", clock_in: "2026-10-25T22:30:00Z", clock_out: "2026-10-25T23:00:00Z" },
        // The following Monday is outside the week.
        { id: "4", staff_id: "ben", clock_in: "2026-10-26T08:00:00Z", clock_out: "2026-10-26T09:00:00Z" },
      ],
      "2026-10-19",
      tz,
      now,
    );
    expect(totals.get("anna")).toEqual({ days: [510, 0, 0, 0, 0, 0, 0], total: 510 });
    expect(totals.get("ben")).toEqual({ days: [0, 0, 0, 0, 0, 0, 30], total: 30 });
  });

  it("formats compact hours and lists the days of a week", () => {
    expect(hoursAndMinutes(450)).toBe("7:30");
    expect(hoursAndMinutes(5)).toBe("0:05");
    expect(weekDates("2026-10-19")).toEqual([
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
    ]);
  });
});
