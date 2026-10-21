import { CalendarOff, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n } from "@/i18n/server";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { todayInZone } from "@/lib/time";
import { TIME_OFF_KINDS } from "@/lib/validation/staff";

import { deleteTimeOff } from "./actions";
import { StaffHoursForm, TimeOffForm } from "./forms";

/** Working hours + time off cards, shared by the staff detail page and "My schedule". */
export async function SchedulePanels({ staffId, timeZone }: { staffId: string; timeZone: string }) {
  const supabase = await createClient();
  const [{ t, intl }, { data: hours }, { data: timeOff }] = await Promise.all([
    getI18n(),
    supabase
      .from("staff_working_hours")
      .select("weekday, start_minute, end_minute")
      .eq("staff_id", staffId),
    supabase
      .from("staff_time_off")
      .select("id, starts_at, ends_at, kind, note")
      .eq("staff_id", staffId)
      .gte("ends_at", new Date().toISOString())
      .order("starts_at"),
  ]);
  const kinds = t.staff.timeOff.kinds;
  const kindLabel = (kind: string) =>
    (TIME_OFF_KINDS as readonly string[]).includes(kind) ? kinds[kind as keyof typeof kinds] : kind;

  return (
    <>
      <Card id="hours">
        <CardHeader>
          <div>
            <CardTitle>{t.staff.hours.title}</CardTitle>
<CardDescription>{t.staff.hours.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <StaffHoursForm staffId={staffId} hours={hours ?? []} />
        </CardContent>
      </Card>

      <Card id="time-off">
        <CardHeader>
          <div>
            <CardTitle>{t.staff.timeOff.title}</CardTitle>
<CardDescription>{t.staff.timeOff.description}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6">
          {timeOff && timeOff.length > 0 ? (
            <ul className="divide-y divide-border rounded-lg border border-border">
              {timeOff.map((entry) => (
                <li key={entry.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <CalendarOff className="size-4 text-fg-subtle" aria-hidden="true" />
                  <span className="min-w-0 flex-1 text-sm">
                    <span className="font-semibold">
                      {formatDateTime(entry.starts_at, timeZone, intl)} –{" "}
                      {formatDateTime(entry.ends_at, timeZone, intl)}
                    </span>
                    {entry.note && <span className="block text-fg-muted">{entry.note}</span>}
                  </span>
                  <Badge tone="gold">{kindLabel(entry.kind)}</Badge>
                  <form action={deleteTimeOff}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="staffId" value={staffId} />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-sm"
                      aria-label={t.staff.timeOff.remove}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">{t.staff.timeOff.none}</p>
          )}
          <TimeOffForm staffId={staffId} today={todayInZone(timeZone)} />
        </CardContent>
      </Card>
    </>
  );
}
