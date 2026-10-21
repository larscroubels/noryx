import type { Dictionary } from "@/i18n/dictionaries";
import { timeToMinutes } from "@/lib/time";

export type HoursRange = { weekday: number; start_minute: number; end_minute: number };

type ParseResult =
  { ok: true; hours: HoursRange[] } | { ok: false; fieldErrors: Record<string, string[]> };

const TIME = /^([01]\d|2[0-4]):[0-5]\d$/;

/**
 * Reads the WeeklyHoursEditor fields (day-{1..7}-open/start/end[/break-start/break-end])
 * into validated ranges. A break splits the day into two ranges.
 */
export function parseWeeklyHours(
  formData: FormData,
  { allowBreaks, t }: { allowBreaks: boolean; t: Dictionary },
): ParseResult {
  const hours: HoursRange[] = [];
  const fieldErrors: Record<string, string[]> = {};

  for (let weekday = 1; weekday <= 7; weekday += 1) {
    if (formData.get(`day-${weekday}-open`) !== "on") continue;
    const start = String(formData.get(`day-${weekday}-start`) ?? "");
    const end = String(formData.get(`day-${weekday}-end`) ?? "");
    if (!TIME.test(start) || !TIME.test(end) || timeToMinutes(end) <= timeToMinutes(start)) {
      fieldErrors[`day-${weekday}`] = [t.validation.closeAfterOpen];
      continue;
    }
    const startMinute = timeToMinutes(start);
    const endMinute = timeToMinutes(end);

    const breakStart = allowBreaks ? String(formData.get(`day-${weekday}-break-start`) ?? "") : "";
    const breakEnd = allowBreaks ? String(formData.get(`day-${weekday}-break-end`) ?? "") : "";
    if (breakStart || breakEnd) {
      if (!TIME.test(breakStart) || !TIME.test(breakEnd)) {
        fieldErrors[`day-${weekday}`] = [t.validation.breakBoth];
        continue;
      }
      const bStart = timeToMinutes(breakStart);
      const bEnd = timeToMinutes(breakEnd);
      if (!(startMinute < bStart && bStart < bEnd && bEnd < endMinute)) {
        fieldErrors[`day-${weekday}`] = [t.validation.breakWithin];
        continue;
      }
      hours.push(
        { weekday, start_minute: startMinute, end_minute: bStart },
        { weekday, start_minute: bEnd, end_minute: endMinute },
      );
    } else {
      hours.push({ weekday, start_minute: startMinute, end_minute: endMinute });
    }
  }

  return Object.keys(fieldErrors).length > 0 ? { ok: false, fieldErrors } : { ok: true, hours };
}

/** Typical salon week used to prefill new schedules: Tuesday–Saturday, 09:00–18:00. */
export const DEFAULT_WEEK: HoursRange[] = [2, 3, 4, 5, 6].map((weekday) => ({
  weekday,
  start_minute: 9 * 60,
  end_minute: weekday === 6 ? 17 * 60 : 18 * 60,
}));
