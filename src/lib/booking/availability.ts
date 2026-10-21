import { isoWeekday, zonedTimeToUtc } from "@/lib/time";

/**
 * Availability engine: computes bookable start times for one local day.
 *
 * It is a pure function so it can be tested exhaustively. The database repeats
 * the critical checks when a booking is created (create_online_booking) and an
 * exclusion constraint makes overlapping appointments impossible, so a stale or
 * manipulated result from this engine can never produce a double booking.
 */

export type WeeklyRange = { weekday: number; startMinute: number; endMinute: number };
export type BusyPeriod = { startsAt: Date; endsAt: Date };

export type BookingPolicy = {
  minNoticeMinutes: number;
  horizonDays: number;
  slotIntervalMinutes: number;
  /** Business-wide buffer after every appointment. */
  bufferMinutes: number;
};

export type StaffAvailabilityInput = {
  staffId: string;
  /** Effective duration for this professional (may differ per staff member). */
  durationMinutes: number;
  workingHours: WeeklyRange[];
  /** Existing appointments (including their buffers) and time off. */
  busy: BusyPeriod[];
};

export type AvailabilityInput = {
  date: string;
  timeZone: string;
  now: Date;
  policy: BookingPolicy;
  serviceBufferMinutes: number;
  /** Location opening hours. Empty means the location has no hours configured (no extra restriction). */
  locationHours: WeeklyRange[];
  staff: StaffAvailabilityInput[];
};

export type Slot = {
  startsAt: Date;
  /** Staff members free at this time, in the order they were supplied. */
  staffIds: string[];
};

function intersect(a: WeeklyRange[], b: WeeklyRange[]) {
  const result: { startMinute: number; endMinute: number }[] = [];
  for (const x of a) {
    for (const y of b) {
      const startMinute = Math.max(x.startMinute, y.startMinute);
      const endMinute = Math.min(x.endMinute, y.endMinute);
      if (endMinute > startMinute) result.push({ startMinute, endMinute });
    }
  }
  return result;
}

export function computeAvailability(input: AvailabilityInput): Slot[] {
  const { date, timeZone, now, policy } = input;
  const weekday = isoWeekday(date);
  const earliest = now.getTime() + policy.minNoticeMinutes * 60_000;
  const latest = now.getTime() + policy.horizonDays * 86_400_000;
  const buffer = Math.max(policy.bufferMinutes, input.serviceBufferMinutes);
  const interval = policy.slotIntervalMinutes;

  const locationRanges = input.locationHours.filter((range) => range.weekday === weekday);
  const slots = new Map<number, string[]>();

  for (const staff of input.staff) {
    const working = staff.workingHours.filter((range) => range.weekday === weekday);
    const ranges = input.locationHours.length > 0 ? intersect(working, locationRanges) : working;

    for (const range of ranges) {
      const firstStart = Math.ceil(range.startMinute / interval) * interval;
      for (
        let minute = firstStart;
        minute + staff.durationMinutes <= range.endMinute;
        minute += interval
      ) {
        const startsAt = zonedTimeToUtc(date, minute, timeZone).getTime();
        if (startsAt < earliest || startsAt > latest) continue;
        const blockedUntil = startsAt + (staff.durationMinutes + buffer) * 60_000;
        const overlaps = staff.busy.some(
          (period) =>
            period.startsAt.getTime() < blockedUntil && period.endsAt.getTime() > startsAt,
        );
        if (overlaps) continue;
        const free = slots.get(startsAt) ?? [];
        if (!free.includes(staff.staffId)) free.push(staff.staffId);
        slots.set(startsAt, free);
      }
    }
  }

  return [...slots.entries()]
    .sort(([a], [b]) => a - b)
    .map(([startsAt, staffIds]) => ({ startsAt: new Date(startsAt), staffIds }));
}

/** Whether a staff member works at all on the given weekday (used to grey out closed days). */
export function worksOnWeekday(hours: WeeklyRange[], weekday: number) {
  return hours.some((range) => range.weekday === weekday);
}
