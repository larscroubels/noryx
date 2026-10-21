/**
 * Time-zone arithmetic without external dependencies.
 *
 * Conventions used across NORYX:
 *   - Instants are stored as UTC (timestamptz) and handled as Date objects.
 *   - Calendar days are local "YYYY-MM-DD" strings in the business time zone.
 *   - Times of day are minutes after local midnight (0–1440), weekday 1 = Monday … 7 = Sunday.
 */

const partsFormatterCache = new Map<string, Intl.DateTimeFormat>();

function partsFormatter(timeZone: string) {
  let formatter = partsFormatterCache.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    partsFormatterCache.set(timeZone, formatter);
  }
  return formatter;
}

type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function zonedParts(instant: Date, timeZone: string): ZonedParts {
  const values: Record<string, number> = {};
  for (const part of partsFormatter(timeZone).formatToParts(instant)) {
    if (part.type !== "literal") values[part.type] = Number(part.value);
  }
  return {
    year: values.year!,
    month: values.month!,
    day: values.day!,
    hour: values.hour === 24 ? 0 : values.hour!,
    minute: values.minute!,
    second: values.second!,
  };
}

/** Offset of the time zone from UTC at the given instant, in milliseconds. */
function offsetAt(instant: number, timeZone: string) {
  const p = zonedParts(new Date(instant), timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return asUtc - Math.floor(instant / 1000) * 1000;
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function parseDate(date: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new Error(`Invalid date: ${date}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

/** Converts a local wall-clock time on a local date to the UTC instant. */
export function zonedTimeToUtc(date: string, minuteOfDay: number, timeZone: string): Date {
  const { year, month, day } = parseDate(date);
  const guess = Date.UTC(year, month - 1, day, 0, minuteOfDay);
  const firstOffset = offsetAt(guess, timeZone);
  let instant = guess - firstOffset;
  const secondOffset = offsetAt(instant, timeZone);
  if (secondOffset !== firstOffset) instant = guess - secondOffset;
  return new Date(instant);
}

/** Local calendar date, ISO weekday and minute of day for an instant. */
export function utcToZoned(instant: Date, timeZone: string) {
  const p = zonedParts(instant, timeZone);
  const date = `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return { date, weekday: isoWeekday(date), minuteOfDay: p.hour * 60 + p.minute };
}

/** ISO weekday (1 = Monday … 7 = Sunday) of a local date string. */
export function isoWeekday(date: string) {
  const { year, month, day } = parseDate(date);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 ? 7 : weekday;
}

export function addDays(date: string, days: number) {
  const { year, month, day } = parseDate(date);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** Today's local date in the time zone. */
export function todayInZone(timeZone: string, now = new Date()) {
  return utcToZoned(now, timeZone).date;
}

/** Monday of the week containing the date. */
export function startOfWeek(date: string) {
  return addDays(date, 1 - isoWeekday(date));
}

/** UTC instants bounding a local calendar day (handles 23/25-hour DST days). */
export function dayBoundsUtc(date: string, timeZone: string) {
  return {
    start: zonedTimeToUtc(date, 0, timeZone),
    end: zonedTimeToUtc(addDays(date, 1), 0, timeZone),
  };
}

/** "09:30" → 570. Accepts "24:00" as end of day. */
export function timeToMinutes(value: string) {
  const match = /^([01]\d|2[0-4]):([0-5]\d)$/.exec(value);
  if (!match) throw new Error(`Invalid time: ${value}`);
  const minutes = Number(match[1]) * 60 + Number(match[2]);
  if (minutes > 1440) throw new Error(`Invalid time: ${value}`);
  return minutes;
}

/** 570 → "09:30". */
export function minutesToTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Current time in ms. Server components render once per request, so reading the clock there is intentional. */
export function requestTime() {
  return Date.now();
}
