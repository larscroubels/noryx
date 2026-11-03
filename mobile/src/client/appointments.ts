import type { ClientAppointment } from "./api";

const time = (a: ClientAppointment) => new Date(a.starts_at).getTime();

/**
 * The Afspraken screen: upcoming visits (soonest first) and history (newest first) at
 * linked salons, and everything at salons the client unlinked — their upcoming visits
 * first, still cancellable within the salon's deadline (unlinking cancels nothing).
 */
export function splitAppointments(rows: ClientAppointment[], now: Date) {
  const at = now.getTime();
  const linked = rows.filter((a) => a.linked);
  const previous = rows.filter((a) => !a.linked);
  return {
    upcoming: linked.filter((a) => time(a) >= at).sort((x, y) => time(x) - time(y)),
    history: linked.filter((a) => time(a) < at).sort((x, y) => time(y) - time(x)),
    previousSalons: [
      ...previous.filter((a) => time(a) >= at).sort((x, y) => time(x) - time(y)),
      ...previous.filter((a) => time(a) < at).sort((x, y) => time(y) - time(x)),
    ],
  };
}
