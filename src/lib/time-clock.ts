import { addDays, daysBetween, utcToZoned } from "@/lib/time";

export type TimeEntryRow = {
  id: string;
  staff_id: string;
  clock_in: string;
  clock_out: string | null;
};

/** Minutes worked in an entry; an open entry counts up to `now`. */
export function entryMinutes(entry: Pick<TimeEntryRow, "clock_in" | "clock_out">, now: number) {
  const end = entry.clock_out ? new Date(entry.clock_out).getTime() : now;
  return Math.max(0, Math.round((end - new Date(entry.clock_in).getTime()) / 60_000));
}

/** Local date ("YYYY-MM-DD") on which an entry started, in the business time zone. */
export function entryDate(entry: Pick<TimeEntryRow, "clock_in">, timeZone: string) {
  return utcToZoned(new Date(entry.clock_in), timeZone).date;
}

/**
 * Minutes per professional for each day of the week starting on `weekStart`
 * (Monday). Entries count on the day they started.
 */
export function weeklyTotals(
  entries: TimeEntryRow[],
  weekStart: string,
  timeZone: string,
  now: number,
): Map<string, { days: number[]; total: number }> {
  const totals = new Map<string, { days: number[]; total: number }>();
  for (const entry of entries) {
    const day = daysBetween(weekStart, entryDate(entry, timeZone));
    if (day < 0 || day > 6) continue;
    const row = totals.get(entry.staff_id) ?? { days: [0, 0, 0, 0, 0, 0, 0], total: 0 };
    const minutes = entryMinutes(entry, now);
    row.days[day]! += minutes;
    row.total += minutes;
    totals.set(entry.staff_id, row);
  }
  return totals;
}

/** The seven local dates of the week starting on `weekStart`. */
export function weekDates(weekStart: string) {
  return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
}

/** 450 → "7:30" (hours and minutes, for compact timesheet cells). */
export function hoursAndMinutes(minutes: number) {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** Open entries older than this deserve a check (forgotten clock-outs). */
export const LONG_OPEN_ENTRY_MINUTES = 12 * 60;
