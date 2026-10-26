import type { Dictionary } from "@/i18n/dictionaries";
import { databaseErrorMessage } from "@/lib/actions";

/** The website's toggleClock messages (src/app/app/time/actions.ts). */
export function clockErrorMessage(error: { code?: string; message?: string }, t: Dictionary) {
  const c = t.timeClock;
  if (error.message === "already_clocked_in") return c.errors.alreadyIn;
  if (error.message === "not_clocked_in") return c.errors.notIn;
  if (error.code === "42501") return c.errors.noProfile;
  return databaseErrorMessage(error as never, t);
}
