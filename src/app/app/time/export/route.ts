import { NextResponse, type NextRequest } from "next/server";

import { authorize } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { toCsv } from "@/lib/csv";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayBoundsUtc, minutesToTime, requestTime, startOfWeek, utcToZoned } from "@/lib/time";
import { entryMinutes } from "@/lib/time-clock";

/** CSV timesheet of one week for staff managers. */
export async function GET(request: NextRequest) {
  const workspace = await authorize("staff.manage");
  if (!workspace || !hasFeature(await getEntitlements(workspace.business.id), "time_clock")) {
    return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  }
  const week = request.nextUrl.searchParams.get("week") ?? "";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(week)) {
    return NextResponse.json({ error: "Invalid export request" }, { status: 400 });
  }
  const { business } = workspace;
  const tz = business.timezone;
  const weekStart = startOfWeek(week);
  const supabase = await createClient();
  const { data } = await supabase
    .from("time_entries")
    .select("clock_in, clock_out, note, edited_at, staff:staff_members(display_name)")
    .eq("business_id", business.id)
    .gte("clock_in", dayBoundsUtc(weekStart, tz).start.toISOString())
    .lt("clock_in", dayBoundsUtc(addDays(weekStart, 6), tz).end.toISOString())
    .order("clock_in")
    .range(0, 9999);
  const now = requestTime();
  const local = (iso: string) => {
    const zoned = utcToZoned(new Date(iso), tz);
    return { date: zoned.date, time: minutesToTime(zoned.minuteOfDay) };
  };
  const csv = toCsv(
    ["professional", "date", "clock_in", "clock_out", "minutes", "note", "corrected"],
    (data ?? []).map((entry) => [
      entry.staff?.display_name,
      local(entry.clock_in).date,
      local(entry.clock_in).time,
      entry.clock_out ? local(entry.clock_out).time : "",
      entryMinutes(entry, now),
      entry.note,
      entry.edited_at ? "yes" : "no",
    ]),
  );
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="timesheet-${weekStart}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
