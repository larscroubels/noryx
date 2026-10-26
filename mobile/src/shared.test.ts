import { dictionaries } from "@/i18n/dictionaries";
import { NEXT_STATUSES } from "@/lib/appointments/status";
import { zonedTimeToUtc } from "@/lib/time";

it("imports shared web code", () => {
  expect(zonedTimeToUtc("2026-10-25", 600, "Europe/Brussels").toISOString()).toBe(
    "2026-10-25T09:00:00.000Z",
  );
  expect(NEXT_STATUSES.pending).toEqual(["confirmed", "cancelled"]);
  expect(dictionaries.fr.common).toBeDefined();
});
