import { formatTime } from "@/lib/format";
import { dayBoundsUtc } from "@/lib/time";

import { computeAvailability } from "./availability";
import { eligibleStaff, toWeekly, type PublicBusiness } from "./public-shape";

export type BusyPeriod = { staff_id: string; starts_at: string; ends_at: string };
export type DaySlot = { startsAt: string; label: string; staffIds: string[] };

/** The UTC range whose busy periods `slotsForDay` needs (one salon-local day). */
export function busyRange(date: string, timeZone: string) {
  const { start, end } = dayBoundsUtc(date, timeZone);
  return { from: start.toISOString(), to: end.toISOString() };
}

/**
 * Bookable start times on one salon-local day, for one professional or "any" — the
 * website's booking page and the NORYX app both use this. Null for an unknown service.
 */
export function slotsForDay(input: {
  business: PublicBusiness;
  serviceId: string;
  staffId: string;
  date: string;
  busy: BusyPeriod[];
  now: Date;
  locale: string;
}): DaySlot[] | null {
  const { business, serviceId, staffId, date } = input;
  const service = business.services.find((s) => s.id === serviceId);
  if (!service) return null;
  let staff = eligibleStaff(business, serviceId);
  if (staffId !== "any") staff = staff.filter((s) => s.id === staffId);
  if (staff.length === 0) return [];

  const location = business.locations[0];
  const slots = computeAvailability({
    date,
    timeZone: business.timezone,
    now: input.now,
    policy: {
      minNoticeMinutes: business.policy.min_notice_minutes,
      horizonDays: business.policy.horizon_days,
      slotIntervalMinutes: business.policy.slot_interval_minutes,
      bufferMinutes: business.policy.buffer_minutes,
    },
    serviceBufferMinutes: service.buffer_after_minutes,
    locationHours: location ? toWeekly(location.hours) : [],
    staff: staff.map((member) => ({
      staffId: member.id,
      durationMinutes: member.durationMinutes,
      workingHours: toWeekly(member.hours),
      busy: input.busy
        .filter((period) => period.staff_id === member.id)
        .map((period) => ({
          startsAt: new Date(period.starts_at),
          endsAt: new Date(period.ends_at),
        })),
    })),
  });
  return slots.map((slot) => ({
    startsAt: slot.startsAt.toISOString(),
    label: formatTime(slot.startsAt, business.timezone, input.locale),
    staffIds: slot.staffIds,
  }));
}
