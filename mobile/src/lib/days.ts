import { addDays, startOfWeek, utcToZoned } from "@/lib/time";

/** The seven local dates (Monday → Sunday) of the week containing `date`. */
export function weekDays(date: string): string[] {
  const monday = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/** The salon-local date of an instant. */
export function localDate(instant: string, timeZone: string): string {
  return utcToZoned(new Date(instant), timeZone).date;
}

/** Rows grouped by the salon's local day (not the phone's), keeping their order. */
export function groupByLocalDay<T extends { starts_at: string }>(
  rows: T[],
  timeZone: string,
): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const row of rows) {
    const day = localDate(row.starts_at, timeZone);
    groups.set(day, [...(groups.get(day) ?? []), row]);
  }
  return groups;
}
