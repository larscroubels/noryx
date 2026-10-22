import { describe, expect, it } from "vitest";

import {
  formatDuration,
  formatLocalDate,
  formatMoney,
  formatTime,
  parseMoneyToCents,
} from "./format";
import {
  addDays,
  dayBoundsUtc,
  isoWeekday,
  minutesToTime,
  timeToMinutes,
  utcToZoned,
  zonedTimeToUtc,
} from "./time";

const normalise = (value: string) => value.replace(/\s/g, " ");

describe("money", () => {
  it("formats cents as EUR with Belgian conventions", () => {
    expect(normalise(formatMoney(4550))).toBe("€ 45,50");
    expect(normalise(formatMoney(123456))).toBe("€ 1.234,56");
  });

  it("parses common European and international inputs", () => {
    expect(parseMoneyToCents("45")).toBe(4500);
    expect(parseMoneyToCents("45,5")).toBe(4550);
    expect(parseMoneyToCents("45.50")).toBe(4550);
    expect(parseMoneyToCents("€ 1.234,50")).toBe(123450);
    expect(parseMoneyToCents("1,234.50")).toBe(123450);
    expect(parseMoneyToCents("abc")).toBeNull();
    expect(parseMoneyToCents("")).toBeNull();
  });
});

describe("durations", () => {
  it("formats minutes compactly", () => {
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(60)).toBe("1 h");
    expect(formatDuration(90)).toBe("1 h 30 min");
  });
});

describe("time zones", () => {
  it("converts local Brussels times to UTC across DST", () => {
    expect(zonedTimeToUtc("2026-07-01", 9 * 60, "Europe/Brussels").toISOString()).toBe(
      "2026-07-01T07:00:00.000Z",
    );
    expect(zonedTimeToUtc("2026-12-01", 9 * 60, "Europe/Brussels").toISOString()).toBe(
      "2026-12-01T08:00:00.000Z",
    );
  });

  it("round-trips instants to local date, weekday and minute", () => {
    expect(utcToZoned(new Date("2026-10-21T07:30:00Z"), "Europe/Brussels")).toEqual({
      date: "2026-10-21",
      weekday: 3,
      minuteOfDay: 9 * 60 + 30,
    });
  });

  it("computes 23- and 25-hour days around DST changes", () => {
    const spring = dayBoundsUtc("2026-03-29", "Europe/Brussels");
    expect((spring.end.getTime() - spring.start.getTime()) / 3_600_000).toBe(23);
    const autumn = dayBoundsUtc("2026-10-25", "Europe/Brussels");
    expect((autumn.end.getTime() - autumn.start.getTime()) / 3_600_000).toBe(25);
  });

  it("formats times in the business time zone", () => {
    expect(formatTime("2026-10-21T07:30:00Z", "Europe/Brussels")).toBe("09:30");
  });

  it("handles calendar helpers", () => {
    expect(isoWeekday("2026-10-25")).toBe(7);
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(timeToMinutes("09:30")).toBe(570);
    expect(timeToMinutes("24:00")).toBe(1440);
    expect(minutesToTime(570)).toBe("09:30");
    expect(() => timeToMinutes("25:00")).toThrow();
  });
});

describe("localised formatting", () => {
  it("formats dates and durations in Dutch", () => {
    expect(formatLocalDate("2026-10-21", undefined, "nl-BE")).toBe("woensdag 21 oktober");
    expect(formatDuration(90, "nl-BE")).toBe("1 u 30 min");
    expect(formatDuration(90, "en-GB")).toBe("1 h 30 min");
  });
});
