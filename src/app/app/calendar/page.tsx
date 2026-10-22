import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Clock3,
  UserX,
  CircleCheckBig,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Select } from "@/components/ui/input";
import { assignLanes } from "@/lib/appointments/lanes";
import type { Dictionary } from "@/i18n/dictionaries";
import { getI18n, getT } from "@/i18n/server";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { can, requireWorkspace } from "@/lib/auth/session";
import { cn } from "@/lib/cn";
import { formatLocalDate, formatTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import {
  addDays,
  dayBoundsUtc,
  isoWeekday,
  parseDate,
  startOfWeek,
  todayInZone,
  utcToZoned,
} from "@/lib/time";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).appointments.calendar.title };
}

type View = "day" | "week" | "month";
const HOUR_PX = 64;

type CalendarAppointment = {
  id: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatus;
  service_name: string;
  staff_id: string;
  customer: { first_name: string; last_name: string | null } | null;
};

const blockStyles: Record<AppointmentStatus, string> = {
  confirmed: "border-pink-700 bg-pink-50 hover:bg-pink-100",
  pending: "border-warning-500 border-dashed bg-warning-50 hover:bg-warning-100",
  completed: "border-success-600 bg-success-50 hover:bg-success-100",
  no_show: "border-danger-600 bg-danger-50 hover:bg-danger-100",
  cancelled: "border-neutral-400 bg-neutral-100",
};

const statusIcons: Partial<Record<AppointmentStatus, React.ReactNode>> = {
  pending: <Clock3 className="size-3 shrink-0" aria-hidden="true" />,
  completed: <CircleCheckBig className="size-3 shrink-0" aria-hidden="true" />,
  no_show: <UserX className="size-3 shrink-0" aria-hidden="true" />,
};

function customerName(a: CalendarAppointment, t: Dictionary) {
  return a.customer
    ? `${a.customer.first_name} ${a.customer.last_name ?? ""}`.trim()
    : t.common.fields.customer;
}

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`;
}

export default async function CalendarPage({ searchParams }: PageProps<"/app/calendar">) {
  const params = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const c = t.appointments.calendar;
  const day = (value: string, options?: Intl.DateTimeFormatOptions) =>
    formatLocalDate(value, options, intl);
  const time = (value: string) => formatTime(value, tz, intl);
  const { business } = workspace;
  const tz = business.timezone;
  const today = todayInZone(tz);
  const date =
    typeof params.date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : today;
  const view: View = params.view === "week" || params.view === "month" ? params.view : "day";
  const pendingOnly = params.status === "pending";
  const seesAll = can(workspace, "appointments.view_all");
  const canCreate =
    can(workspace, "appointments.manage_all") ||
    (can(workspace, "appointments.manage_own") && workspace.staffId);

  const supabase = await createClient();
  const { data: allStaff } = await supabase
    .from("staff_members")
    .select("id, display_name")
    .eq("business_id", business.id)
    .eq("is_active", true)
    .order("sort_order")
    .order("display_name");
  const visibleStaff = seesAll
    ? (allStaff ?? [])
    : (allStaff ?? []).filter((s) => s.id === workspace.staffId);
  const staffFilter =
    typeof params.staff === "string" && visibleStaff.some((s) => s.id === params.staff)
      ? params.staff
      : null;
  const columnsStaff = staffFilter
    ? visibleStaff.filter((s) => s.id === staffFilter)
    : visibleStaff;

  const rangeStart =
    view === "day" ? date : view === "week" ? startOfWeek(date) : startOfWeek(monthStart(date));
  const rangeDays = view === "day" ? 1 : view === "week" ? 7 : 42;
  const from = dayBoundsUtc(rangeStart, tz).start;
  const to = dayBoundsUtc(addDays(rangeStart, rangeDays - 1), tz).end;

  let query = supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, service_name, staff_id, customer:customers(first_name, last_name)",
    )
    .eq("business_id", business.id)
    .order("starts_at");
  if (pendingOnly) query = query.eq("status", "pending").gte("starts_at", new Date().toISOString());
  else
    query = query
      .gte("starts_at", from.toISOString())
      .lt("starts_at", to.toISOString())
      .neq("status", "cancelled");
  if (staffFilter) query = query.eq("staff_id", staffFilter);

  const [{ data: appointmentRows }, { data: timeOff }, { data: hours }] = await Promise.all([
    query,
    supabase
      .from("staff_time_off")
      .select("staff_id, starts_at, ends_at, kind")
      .eq("business_id", business.id)
      .lt("starts_at", to.toISOString())
      .gt("ends_at", from.toISOString()),
    supabase
      .from("location_hours")
      .select("start_minute, end_minute")
      .eq("business_id", business.id),
  ]);
  const appointments = (appointmentRows ?? []) as CalendarAppointment[];

  const openMinute = Math.min(...(hours ?? []).map((h) => h.start_minute), 9 * 60);
  const closeMinute = Math.max(...(hours ?? []).map((h) => h.end_minute), 18 * 60);
  const gridStart = Math.max(0, Math.floor(openMinute / 60) * 60 - 60);
  const gridEnd = Math.min(1440, Math.ceil(closeMinute / 60) * 60 + 60);
  const hourMarks = Array.from(
    { length: (gridEnd - gridStart) / 60 },
    (_, i) => gridStart + i * 60,
  );

  const step = view === "day" ? 1 : view === "week" ? 7 : 0;
  const prevDate = step ? addDays(date, -step) : addDays(monthStart(date), -1).slice(0, 8) + "01";
  const nextDate = step ? addDays(date, step) : addDays(monthStart(date), 32).slice(0, 8) + "01";
  const href = (overrides: Record<string, string | null>) => {
    const search = new URLSearchParams();
    const merged = { date, view, staff: staffFilter, ...overrides };
    for (const [key, value] of Object.entries(merged))
      if (value && !(key === "view" && value === "day")) search.set(key, value);
    return `/app/calendar?${search.toString()}`;
  };

  const title =
    view === "day"
      ? day(date)
      : view === "week"
        ? `${day(startOfWeek(date), { day: "numeric", month: "short" })} – ${day(addDays(startOfWeek(date), 6), { day: "numeric", month: "short", year: "numeric" })}`
        : day(monthStart(date), { month: "long", year: "numeric" });

  const position = (startIso: string, endIso: string) => {
    const start = utcToZoned(new Date(startIso), tz).minuteOfDay;
    const endZoned = utcToZoned(new Date(endIso), tz);
    const end = endZoned.minuteOfDay === 0 ? 1440 : endZoned.minuteOfDay;
    const top = ((Math.max(start, gridStart) - gridStart) / 60) * HOUR_PX;
    const height = Math.max(
      ((Math.min(end, gridEnd) - Math.max(start, gridStart)) / 60) * HOUR_PX,
      22,
    );
    return { top, height };
  };

  const lanesFor = (items: CalendarAppointment[]) =>
    assignLanes(
      items.map((a) => ({
        id: a.id,
        start: new Date(a.starts_at).getTime(),
        end: new Date(a.ends_at).getTime(),
      })),
    );

  const block = (
    a: CalendarAppointment,
    showStaff = false,
    lanes?: Map<string, { lane: number; lanes: number }>,
  ) => {
    const { top, height } = position(a.starts_at, a.ends_at);
    const lane = lanes?.get(a.id) ?? { lane: 0, lanes: 1 };
    const horizontal = {
      left: `calc(${(lane.lane / lane.lanes) * 100}% + 4px)`,
      width: `calc(${100 / lane.lanes}% - 8px)`,
    };
    const staffName = showStaff ? allStaff?.find((s) => s.id === a.staff_id)?.display_name : null;
    return (
      <Link
        key={a.id}
        href={`/app/appointments/${a.id}`}
        style={{ top, height, ...horizontal }}
        className={cn(
          "absolute overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-xs leading-4 shadow-xs transition-colors",
          blockStyles[a.status],
        )}
      >
        <span className="flex items-center gap-1 font-semibold text-fg tabular-nums">
          {statusIcons[a.status]}
          {time(a.starts_at)}
          <span className="sr-only">, {t.common.appointmentStatus[a.status]}</span>
        </span>
        <span className="block truncate font-semibold text-fg">{customerName(a, t)}</span>
        {height > 44 && <span className="block truncate text-fg-muted">{a.service_name}</span>}
        {staffName && height > 60 && (
          <span className="block truncate text-fg-muted">{staffName}</span>
        )}
      </Link>
    );
  };

  const timeOffBlocks = (staffId: string | null, day: string) =>
    (timeOff ?? [])
      .filter((entry) => (staffId ? entry.staff_id === staffId : true))
      .map((entry, index) => {
        const bounds = dayBoundsUtc(day, tz);
        const start = new Date(
          Math.max(new Date(entry.starts_at).getTime(), bounds.start.getTime()),
        ).toISOString();
        const end = new Date(
          Math.min(new Date(entry.ends_at).getTime(), bounds.end.getTime()),
        ).toISOString();
        if (start >= end) return null;
        const { top, height } = position(start, end);
        return (
          <div
            key={`off-${staffId}-${day}-${index}`}
            style={{ top, height }}
            className="absolute inset-x-1 rounded-md bg-[repeating-linear-gradient(135deg,var(--color-neutral-100)_0_6px,var(--color-surface)_6px_12px)] px-2 py-1 text-xs font-semibold text-fg-muted ring-1 ring-border"
          >
            {c.timeOff}
          </div>
        );
      });

  const grid = (columns: { key: string; label: React.ReactNode; items: React.ReactNode[] }[]) => (
    <div className="hidden overflow-x-auto sm:block">
      <div
        className="grid min-w-[40rem]"
        style={{ gridTemplateColumns: `4rem repeat(${columns.length}, minmax(9rem, 1fr))` }}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-surface" />
        {columns.map((column) => (
          <div
            key={column.key}
            className="sticky top-0 z-10 border-b border-l border-border bg-surface px-3 py-3 text-sm font-semibold"
          >
            {column.label}
          </div>
        ))}
        <div className="relative" style={{ height: hourMarks.length * HOUR_PX }}>
          {hourMarks.map((minute, i) => (
            <span
              key={minute}
              className="absolute right-2 -translate-y-2 text-xs text-fg-subtle tabular-nums"
              style={{ top: i * HOUR_PX }}
            >
              {i === 0 ? "" : `${String(minute / 60).padStart(2, "0")}:00`}
            </span>
          ))}
        </div>
        {columns.map((column) => (
          <div
            key={column.key}
            className="relative border-l border-border bg-[linear-gradient(to_bottom,var(--color-neutral-200)_1px,transparent_1px)]"
            style={{ height: hourMarks.length * HOUR_PX, backgroundSize: `100% ${HOUR_PX}px` }}
          >
            {column.items}
          </div>
        ))}
      </div>
    </div>
  );

  const agenda = (items: CalendarAppointment[], groupByDay: boolean) => {
    if (items.length === 0) {
      return (
        <EmptyState
          icon={<CalendarPlus />}
          title={pendingOnly ? c.noRequests : c.nothing}
          description={pendingOnly ? c.noRequestsText : c.nothingText}
        />
      );
    }
    const days = [...new Set(items.map((a) => utcToZoned(new Date(a.starts_at), tz).date))];
    return (
      <div className="divide-y divide-border">
        {days.map((value) => (
          <section key={value} aria-label={day(value)}>
            {groupByDay && (
              <h3 className="bg-surface-subtle px-4 py-2 text-xs font-semibold tracking-wide text-fg-muted uppercase">
                {day(value)}
              </h3>
            )}
            <ul className="divide-y divide-border">
              {items
                .filter((a) => utcToZoned(new Date(a.starts_at), tz).date === value)
                .map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/app/appointments/${a.id}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 hover:bg-surface-subtle"
                    >
                      <span className="w-24 text-sm font-semibold tabular-nums">
                        {time(a.starts_at)}–{time(a.ends_at)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {customerName(a, t)}
                        </span>
                        <span className="block truncate text-sm text-fg-muted">
                          {a.service_name} ·{" "}
                          {allStaff?.find((s) => s.id === a.staff_id)?.display_name}
                        </span>
                      </span>
                      <AppointmentStatusBadge status={a.status} />
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    );
  };

  let body: React.ReactNode;
  if (pendingOnly) {
    body = agenda(appointments, true);
  } else if (columnsStaff.length === 0) {
    body = (
      <EmptyState
        icon={<CalendarPlus />}
        title={seesAll ? c.addStaffTitle : c.notLinkedTitle}
        description={seesAll ? c.addStaffText : c.notLinkedText}
        action={
          seesAll && can(workspace, "staff.manage") ? (
            <Button asChild>
              <Link href="/app/staff/new">{c.addStaff}</Link>
            </Button>
          ) : undefined
        }
      />
    );
  } else if (view === "day") {
    body = (
      <>
        {grid(
          columnsStaff.map((staff) => ({
            key: staff.id,
            label: staff.display_name,
            items: (() => {
              const own = appointments.filter((a) => a.staff_id === staff.id);
              const lanes = lanesFor(own);
              return [...timeOffBlocks(staff.id, date), ...own.map((a) => block(a, false, lanes))];
            })(),
          })),
        )}
        <div className="sm:hidden">{agenda(appointments, false)}</div>
      </>
    );
  } else if (view === "week") {
    const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date), i));
    body = (
      <>
        {grid(
          days.map((value) => ({
            key: value,
            label: (
              <Link
                href={href({ date: value, view: "day" })}
                className={cn("hover:underline", value === today && "text-pink-700")}
              >
                {t.common.weekdaysShort[isoWeekday(value) - 1]} {parseDate(value).day}
              </Link>
            ),
            items: [
              ...(staffFilter ? timeOffBlocks(staffFilter, value) : []),
              ...(() => {
                const onDay = appointments.filter(
                  (a) => utcToZoned(new Date(a.starts_at), tz).date === value,
                );
                const lanes = lanesFor(onDay);
                return onDay.map((a) => block(a, !staffFilter, lanes));
              })(),
            ],
          })),
        )}
        <div className="sm:hidden">{agenda(appointments, true)}</div>
      </>
    );
  } else {
    const days = Array.from({ length: 42 }, (_, i) => addDays(rangeStart, i));
    const month = date.slice(0, 7);
    body = (
      <div className="grid grid-cols-7 text-sm">
        {t.common.weekdaysShort.map((short) => (
          <div
            key={short}
            className="border-b border-border px-2 py-2 text-center text-xs font-semibold text-fg-muted uppercase"
          >
            <span className="sm:hidden">{short.slice(0, 1)}</span>
            <span className="hidden sm:inline">{short}</span>
          </div>
        ))}
        {days.map((value) => {
          const count = appointments.filter(
            (a) => utcToZoned(new Date(a.starts_at), tz).date === value,
          ).length;
          return (
            <Link
              key={value}
              href={href({ date: value, view: "day" })}
              className={cn(
                "min-h-16 border-b border-l border-border p-1.5 hover:bg-surface-subtle sm:min-h-24 sm:p-2",
                value.slice(0, 7) !== month && "bg-surface-subtle/60 text-fg-subtle",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-7 items-center justify-center rounded-full text-sm font-semibold",
                  value === today && "bg-pink-700 text-white",
                )}
              >
                {parseDate(value).day}
              </span>
              {count > 0 && (
                <span className="mt-1 block truncate rounded bg-pink-50 px-1.5 py-0.5 text-xs font-semibold text-pink-700">
                  {count}
                  <span className="hidden sm:inline"> {c.bookings(count)}</span>
                </span>
              )}
            </Link>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <PageHeader
        title={pendingOnly ? c.requests : c.title}
        description={pendingOnly ? c.requestsText : undefined}
        actions={
          canCreate ? (
            <Button asChild>
              <Link
                href={`/app/appointments/new?date=${date}${staffFilter ? `&staff=${staffFilter}` : ""}`}
              >
                <CalendarPlus aria-hidden="true" /> {t.appointments.new.title}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {!pendingOnly && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1">
            <Button asChild variant="secondary" size="icon-sm">
              <Link href={href({ date: prevDate })} aria-label={t.common.previous}>
                <ChevronLeft aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild variant="secondary" size="sm">
              <Link href={href({ date: today })}>{t.common.today}</Link>
            </Button>
            <Button asChild variant="secondary" size="icon-sm">
              <Link href={href({ date: nextDate })} aria-label={t.common.next}>
                <ChevronRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <h2 className="text-base font-semibold sm:text-lg">{title}</h2>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            {seesAll && visibleStaff.length > 1 && (
              <form method="get" action="/app/calendar" className="flex items-center gap-2">
                <input type="hidden" name="date" value={date} />
                {view !== "day" && <input type="hidden" name="view" value={view} />}
                <label htmlFor="staff-filter" className="sr-only">
                  {t.common.fields.professional}
                </label>
                <Select
                  id="staff-filter"
                  name="staff"
                  defaultValue={staffFilter ?? ""}
                  className="h-8 w-44 text-sm"
                >
                  <option value="">{c.allStaff}</option>
                  {visibleStaff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.display_name}
                    </option>
                  ))}
                </Select>
                <Button type="submit" variant="secondary" size="sm">
                  {t.common.apply}
                </Button>
              </form>
            )}
            <nav
              aria-label={c.viewLabel}
              className="inline-flex rounded-md border border-border-strong p-0.5"
            >
              {(["day", "week", "month"] as const).map((v) => (
                <Link
                  key={v}
                  href={href({ view: v })}
                  aria-current={v === view ? "page" : undefined}
                  className={cn(
                    "rounded px-3 py-1 text-sm font-semibold",
                    v === view ? "bg-pink-700 text-white" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {c.views[v]}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      <Card className="overflow-hidden">{body}</Card>
    </div>
  );
}
