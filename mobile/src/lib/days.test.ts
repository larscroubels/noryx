import { dayBoundsUtc } from "@/lib/time";

import { groupByLocalDay, weekDays } from "./days";

it("uses the salon's days across a DST change", () => {
  const { start, end } = dayBoundsUtc("2026-10-25", "Europe/Brussels");
  expect(start.toISOString()).toBe("2026-10-24T22:00:00.000Z");
  expect(end.toISOString()).toBe("2026-10-25T23:00:00.000Z");
});

it("week starts on Monday", () => {
  expect(weekDays("2026-10-29")).toEqual([
    "2026-10-26",
    "2026-10-27",
    "2026-10-28",
    "2026-10-29",
    "2026-10-30",
    "2026-10-31",
    "2026-11-01",
  ]);
});

it("groups by the salon's day, not the phone's", () => {
  const rows = [
    { id: "late", starts_at: "2026-10-27T23:30:00.000Z" },
    { id: "morning", starts_at: "2026-10-27T08:00:00.000Z" },
  ];
  const groups = groupByLocalDay(rows, "Europe/Brussels");
  expect(groups.get("2026-10-28")?.map((r) => r.id)).toEqual(["late"]);
  expect(groups.get("2026-10-27")?.map((r) => r.id)).toEqual(["morning"]);
});
