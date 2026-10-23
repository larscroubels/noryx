import { ChevronLeft, ChevronRight, Download, Trash2, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PlanLocked } from "@/components/billing/plan-locked";
import { ConfirmAction } from "@/components/forms/confirm-action";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getI18n, getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { formatDuration, formatLocalDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayBoundsUtc, minutesToTime, requestTime, startOfWeek, todayInZone, utcToZoned } from "@/lib/time";
import {
  entryDate,
  entryMinutes,
  hoursAndMinutes,
  LONG_OPEN_ENTRY_MINUTES,
  weekDates,
  weeklyTotals,
} from "@/lib/time-clock";

import { deleteTimeEntry } from "./actions";
import { ClockCard } from "./clock-card";
import { EntryDialog } from "./entry-dialog";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).timeClock.title };
}

export default async function TimeClockPage({ searchParams }: PageProps<"/app/time">) {
  const params = await searchParams;
  const workspace = await requireWorkspace();
  const { t, intl } = await getI18n();
  const c = t.timeClock;
  const { business } = workspace;
  const tz = business.timezone;
  const ownStaff = can(workspace, "schedule.manage_own") ? workspace.staffId : null;
  const isManager = can(workspace, "staff.manage");
  if (!ownStaff && !isManager) notFound();
  if (!hasFeature(await getEntitlements(business.id), "time_clock"))
    return <PlanLocked title={c.title} heading={t.errors.planFeatureTimeClock} text={c.descriptionManager} />;

  const today = todayInZone(tz);
  const requested = typeof params.week === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.week) ? params.week : today;
  const weekStart = startOfWeek(requested);
  const days = weekDates(weekStart);
  const from = dayBoundsUtc(weekStart, tz).start.toISOString();
  const to = dayBoundsUtc(addDays(weekStart, 6), tz).end.toISOString();
  const now = requestTime();

  const supabase = await createClient();
  const [{ data: entryRows }, { data: openRows }, { data: staffRows }] = await Promise.all([
    supabase
      .from("time_entries")
      .select("id, staff_id, clock_in, clock_out, note, edited_at")
      .eq("business_id", business.id)
      .gte("clock_in", from)
      .lt("clock_in", to)
      .order("clock_in"),
    supabase
      .from("time_entries")
      .select("id, staff_id, clock_in, clock_out")
      .eq("business_id", business.id)
      .is("clock_out", null),
    isManager
      ? supabase
          .from("staff_members")
          .select("id, display_name")
          .eq("business_id", business.id)
          .eq("is_active", true)
          .order("sort_order")
          .order("display_name")
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
  ]);
  const entries = entryRows ?? [];
  const open = openRows ?? [];
  const staff = staffRows ?? [];
  const names = new Map(staff.map((member) => [member.id, member.display_name]));
  const ownOpen = open.find((entry) => entry.staff_id === ownStaff) ?? null;
  const totals = weeklyTotals(entries, weekStart, tz, now);
  const longOpen = isManager
    ? open.filter((entry) => entryMinutes(entry, now) >= LONG_OPEN_ENTRY_MINUTES)
    : [];
  const weekLabel = `${formatLocalDate(weekStart, { day: "numeric", month: "short" }, intl)} – ${formatLocalDate(days[6]!, { day: "numeric", month: "short", year: "numeric" }, intl)}`;
  const weekLink = (date: string) => `/app/time?week=${date}`;
  const dayLabel = (date: string) => formatLocalDate(date, { weekday: "short", day: "numeric" }, intl);
  const localTime = (iso: string) => minutesToTime(utcToZoned(new Date(iso), tz).minuteOfDay);

  return (
    <div className="grid gap-8">
      <PageHeader
        title={c.title}
        description={isManager ? c.descriptionManager : c.description}
        actions={
          isManager ? (
            <Button asChild variant="secondary">
              <a href={`/app/time/export?week=${weekStart}`} download>
                <Download aria-hidden="true" /> {c.exportCsv}
              </a>
            </Button>
          ) : undefined
        }
      />

      {ownStaff ? (
        <ClockCard openSince={ownOpen?.clock_in ?? null} serverNow={now} timeZone={tz} />
      ) : (
        !isManager && <Alert tone="info">{c.noProfile}</Alert>
      )}

      {longOpen.map((entry) => (
        <Alert key={entry.id} tone="warning">
          <span className="inline-flex items-center gap-2">
            <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
            {c.openWarning(
              names.get(entry.staff_id) ?? t.common.fields.professional,
              `${dayLabel(entryDate(entry, tz))} ${formatTime(entry.clock_in, tz, intl)}`,
            )}
          </span>
        </Alert>
      ))}

      <nav aria-label={c.thisWeek} className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="icon-sm">
          <Link href={weekLink(addDays(weekStart, -7))} aria-label={c.previousWeek}>
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <Button asChild variant="secondary" size="sm">
          <Link href="/app/time">{c.thisWeek}</Link>
        </Button>
        <Button asChild variant="secondary" size="icon-sm">
          <Link href={weekLink(addDays(weekStart, 7))} aria-label={c.nextWeek}>
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
        <h2 className="ml-1 text-base font-semibold sm:text-lg">{weekLabel}</h2>
      </nav>

      {ownStaff && (
        <Card>
          <CardHeader>
            <CardTitle>{c.myHours}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[10rem_minmax(0,1fr)_5rem]">
              {days.map((date, index) => {
                const own = entries.filter((entry) => entry.staff_id === ownStaff && entryDate(entry, tz) === date);
                const minutes = totals.get(ownStaff)?.days[index] ?? 0;
                return (
                  <li
                    key={date}
                    className="grid grid-cols-subgrid border-b border-border py-2 last:border-0 sm:col-span-3"
                  >
                    <span className={date === today ? "font-semibold text-pink-700" : "font-semibold"}>
                      {dayLabel(date)}
                    </span>
                    <span className="text-fg-muted">
                      {own.length === 0
                        ? "—"
                        : own
                            .map((entry) => `${localTime(entry.clock_in)}–${entry.clock_out ? localTime(entry.clock_out) : "…"}`)
                            .join(", ")}
                    </span>
                    <span className="font-semibold tabular-nums sm:text-right">
                      {minutes > 0 ? hoursAndMinutes(minutes) : ""}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="mt-4 flex justify-between border-t border-border pt-3 font-semibold">
              <span>{c.total}</span>
              <span className="tabular-nums">{formatDuration(totals.get(ownStaff)?.total ?? 0, intl)}</span>
            </p>
          </CardContent>
        </Card>
      )}

      {isManager && (
        <>
          <Card className="overflow-hidden">
            <CardHeader className="pb-5">
              <CardTitle>{c.team}</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={c.team}>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t.common.fields.professional}</TableHead>
                    {days.map((date) => (
                      <TableHead key={date} className="text-right whitespace-nowrap">
                        {dayLabel(date)}
                      </TableHead>
                    ))}
                    <TableHead className="text-right">{c.total}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staff.map((member) => {
                    const row = totals.get(member.id);
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-semibold whitespace-nowrap">
                          {member.display_name}
                          {open.some((entry) => entry.staff_id === member.id) && (
                            <Badge tone="success" className="ml-2">
                              {c.stillIn}
                            </Badge>
                          )}
                        </TableCell>
                        {days.map((date, index) => (
                          <TableCell key={date} className="text-right text-fg-muted tabular-nums">
                            {row && row.days[index]! > 0 ? hoursAndMinutes(row.days[index]!) : "—"}
                          </TableCell>
                        ))}
                        <TableCell className="text-right font-semibold tabular-nums">
                          {hoursAndMinutes(row?.total ?? 0)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{c.entries}</CardTitle>
              <EntryDialog
                staff={staff.map((member) => ({ id: member.id, name: member.display_name }))}
                defaultDate={days.includes(today) ? today : weekStart}
              />
            </CardHeader>
            <CardContent>
              {entries.length === 0 ? (
                <p className="text-sm text-fg-muted">{c.noEntries}</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {entries.map((entry) => (
                    <li key={entry.id} className="flex flex-wrap items-center gap-3 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold">
                          {names.get(entry.staff_id) ?? t.common.fields.professional}
                          {entry.edited_at && (
                            <Badge tone="neutral" className="ml-2">
                              {c.corrected}
                            </Badge>
                          )}
                        </span>
                        <span className="block text-fg-muted">
                          {dayLabel(entryDate(entry, tz))} · {localTime(entry.clock_in)}–
                          {entry.clock_out ? localTime(entry.clock_out) : c.stillIn}
                          {entry.note ? ` · ${entry.note}` : ""}
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums">
                        {formatDuration(entryMinutes(entry, now), intl)}
                      </span>
                      <EntryDialog
                        staff={staff.map((member) => ({ id: member.id, name: member.display_name }))}
                        defaultDate={weekStart}
                        entry={{
                          id: entry.id,
                          staffId: entry.staff_id,
                          date: entryDate(entry, tz),
                          start: localTime(entry.clock_in),
                          end: entry.clock_out ? localTime(entry.clock_out) : "",
                          note: entry.note ?? "",
                        }}
                      />
                      <ConfirmAction
                        trigger={<Trash2 aria-label={c.delete} />}
                        triggerVariant="ghost"
                        title={c.deleteTitle}
                        description={c.deleteText}
                        confirmLabel={c.delete}
                        action={deleteTimeEntry}
                        hiddenFields={{ id: entry.id }}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
