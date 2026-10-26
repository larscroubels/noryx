import {
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Circle,
  Clock3,
  ShoppingBag,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { getI18n, getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { formatLocalDate, formatMoney, formatTime } from "@/lib/format";
import { buildSetupChecklist } from "@/lib/setup-checklist";
import { createClient } from "@/lib/supabase/server";

import { ClockCard } from "./time/clock-card";
import {
  addDays,
  dayBoundsUtc,
  requestTime,
  startOfWeek,
  todayInZone,
  utcToZoned,
} from "@/lib/time";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).app.nav.overview };
}

function greeting(minuteOfDay: number) {
  if (minuteOfDay < 12 * 60) return "morning";
  if (minuteOfDay < 18 * 60) return "afternoon";
  return "evening";
}

export default async function OverviewPage({ searchParams }: PageProps<"/app">) {
  const params = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const o = t.app.overview;
  const { business } = workspace;
  const tz = business.timezone;
  const supabase = await createClient();

  const today = todayInZone(tz);
  const { start: dayStart, end: dayEnd } = dayBoundsUtc(today, tz);
  const weekStart = dayBoundsUtc(startOfWeek(today), tz).start;
  const weekEnd = dayBoundsUtc(addDays(startOfWeek(today), 6), tz).end;
  const thirtyDaysAgo = new Date(requestTime() - 30 * 86_400_000).toISOString();
  const showRevenue = can(workspace, "reports.view");
  const showCustomers = can(workspace, "customers.view");
  const canManageAppointments = can(workspace, "appointments.manage_all");

  const [todayResult, weekResult, pendingResult, customersResult, setup] = await Promise.all([
    supabase
      .from("appointments")
      .select(
        "id, starts_at, ends_at, status, service_name, customer:customers(first_name, last_name), staff:staff_members(display_name)",
      )
      .eq("business_id", business.id)
      .gte("starts_at", dayStart.toISOString())
      .lt("starts_at", dayEnd.toISOString())
      .neq("status", "cancelled")
      .order("starts_at"),
    supabase
      .from("appointments")
      .select("status, price_cents")
      .eq("business_id", business.id)
      .gte("starts_at", weekStart.toISOString())
      .lt("starts_at", weekEnd.toISOString()),
    supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "pending"),
    showCustomers
      ? supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
          .gte("created_at", thirtyDaysAgo)
      : Promise.resolve({ count: null }),
    Promise.all([
      supabase
        .from("location_hours")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id),
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id)
        .eq("is_active", true),
      supabase
        .from("staff_working_hours")
        .select("id", { count: "exact", head: true })
        .eq("business_id", business.id),
    ]),
  ]);

  const todays = todayResult.data ?? [];
  const week = weekResult.data ?? [];
  const weekBooked = week.filter((a) => a.status !== "cancelled");
  const bookedValue = weekBooked
    .filter((a) => a.status !== "no_show")
    .reduce((sum, a) => sum + a.price_cents, 0);
  const cancellations = week.filter(
    (a) => a.status === "cancelled" || a.status === "no_show",
  ).length;
  const pendingCount = pendingResult.count ?? 0;

  const checklist = buildSetupChecklist({
    hours: setup[0].count ?? 0,
    services: setup[1].count ?? 0,
    workingHours: setup[2].count ?? 0,
    bookingEnabled: business.booking_enabled,
  }).map((item) => ({ ...item, label: o.checklist[item.key] }));
  const showChecklist = can(workspace, "settings.manage") && checklist.some((item) => !item.done);
  const entitlements = await getEntitlements(business.id);
  // Professionals with a linked profile clock in and out right from the dashboard.
  const clockStaff =
    hasFeature(entitlements, "time_clock") && can(workspace, "schedule.manage_own")
      ? workspace.staffId
      : null;
  const { data: openEntry } = clockStaff
    ? await supabase
        .from("time_entries")
        .select("clock_in")
        .eq("staff_id", clockStaff)
        .is("clock_out", null)
        .maybeSingle()
    : { data: null };
  const showStock =
    hasFeature(entitlements, "inventory") &&
    (can(workspace, "products.manage") || can(workspace, "inventory.manage"));
  const showOrders = hasFeature(entitlements, "shop") && can(workspace, "orders.manage");
  const isManager = can(workspace, "settings.manage");
  const customerLimit = isManager ? entitlements.maxCustomers : null;
  const [{ data: stockRows }, { count: openOrders }, { count: customerTotal }] = await Promise.all([
    showStock
      ? supabase
          .from("products")
          .select("id, name, stock_quantity, low_stock_threshold")
          .eq("business_id", business.id)
          .eq("is_active", true)
          .limit(500)
      : Promise.resolve({ data: null }),
    showOrders
      ? supabase
          .from("orders")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
          .in("status", ["pending", "confirmed", "ready"])
      : Promise.resolve({ count: null }),
    customerLimit
      ? supabase
          .from("customers")
          .select("id", { count: "exact", head: true })
          .eq("business_id", business.id)
      : Promise.resolve({ count: null }),
  ]);
  // Basic includes a fixed number of customers; warn owners from 80% onwards.
  const nearCustomerLimit =
    customerLimit !== null && (customerTotal ?? 0) >= Math.floor(customerLimit * 0.8);
  const lowStock = (stockRows ?? []).filter((p) => p.stock_quantity <= p.low_stock_threshold);
  const now = utcToZoned(new Date(), tz);
  const firstName = (workspace.user.fullName ?? "").split(" ")[0];

  return (
    <div className="grid gap-8">
      <PageHeader
        eyebrow={formatLocalDate(today, undefined, intl)}
        title={`${o.greeting[greeting(now.minuteOfDay)]}${firstName ? `, ${firstName}` : ""}`}
        description={o.lead(business.name)}
        actions={
          canManageAppointments ? (
            <Button asChild>
              <Link href="/app/appointments/new">
                <CalendarPlus aria-hidden="true" /> {o.newAppointment}
              </Link>
            </Button>
          ) : undefined
        }
      />

      {params.welcome === "1" && (
        <Alert tone="success" title={o.welcomeTitle}>
          {o.welcomeText}
        </Alert>
      )}
      {params.password === "updated" && <Alert tone="success">{o.passwordUpdated}</Alert>}
      {isManager && entitlements.trialEnded && (
        <Alert tone="info">
          {t.app.trial.ended}{" "}
          <Link href="/pricing" className="font-semibold">
            {t.app.trial.plans}
          </Link>
        </Alert>
      )}
      {nearCustomerLimit && customerLimit !== null && (
        <Alert tone="warning">
          {o.customerLimit(customerTotal ?? 0, customerLimit)} {o.customerLimitText}{" "}
          <Link href="/pricing" className="font-semibold">
            {t.app.trial.plans}
          </Link>
        </Alert>
      )}

      <section aria-label={o.keyFigures} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label={o.today} value={String(todays.length)} />
        <Stat
          label={o.week}
          value={String(weekBooked.length)}
          hint={cancellations > 0 ? o.cancelledHint(cancellations) : undefined}
        />
        {showRevenue ? (
          <Stat
            label={o.value}
            value={formatMoney(bookedValue, business.currency, business.locale)}
            hint={o.valueHint}
          />
        ) : (
          <Stat label={o.awaiting} value={String(pendingCount)} />
        )}
        {showCustomers ? (
          <Stat label={o.newCustomers} value={String(customersResult.count ?? 0)} />
        ) : (
          <Stat label={o.awaiting} value={String(pendingCount)} />
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{o.schedule}</CardTitle>
              <CardDescription>{o.appointments(todays.length)}</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/app/calendar?date=${today}`}>
                {o.openCalendar} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {todays.length === 0 ? (
              <EmptyState
                icon={<Sparkles />}
                title={o.emptyTitle}
                description={business.booking_enabled ? o.emptyOnline : o.emptyOffline}
                action={
                  canManageAppointments ? (
                    <Button asChild variant="secondary">
                      <Link href="/app/appointments/new">{o.addAppointment}</Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <ul className="divide-y divide-border">
                {todays.map((appointment) => (
                  <li key={appointment.id}>
                    <Link
                      href={`/app/appointments/${appointment.id}`}
                      className="-mx-2 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-md px-2 py-3 hover:bg-surface-subtle"
                    >
                      <span className="w-24 shrink-0 text-sm font-semibold tabular-nums">
                        {formatTime(appointment.starts_at, tz, intl)}–
                        {formatTime(appointment.ends_at, tz, intl)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">
                          {appointment.customer
                            ? `${appointment.customer.first_name} ${appointment.customer.last_name ?? ""}`
                            : o.customer}
                        </span>
                        <span className="block truncate text-sm text-fg-muted">
                          {appointment.service_name}
                          {appointment.staff ? ` · ${appointment.staff.display_name}` : ""}
                        </span>
                      </span>
                      <AppointmentStatusBadge status={appointment.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <div className="grid content-start gap-6">
          {clockStaff && (
            <ClockCard
              compact
              openSince={openEntry?.clock_in ?? null}
              serverNow={requestTime()}
              timeZone={tz}
            />
          )}
          {pendingCount > 0 && (
            <Card className="border-warning-100 bg-warning-50/50">
              <CardContent className="flex items-start gap-3">
                <Clock3 className="mt-0.5 size-5 text-warning-600" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{o.pending(pendingCount)}</p>
                  <Link
                    href="/app/calendar?status=pending"
                    className="mt-1 inline-block text-sm font-semibold text-pink-700 hover:underline"
                  >
                    {o.review}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {showOrders && (openOrders ?? 0) > 0 && (
            <Card>
              <CardContent className="flex items-start gap-3">
                <ShoppingBag className="mt-0.5 size-5 text-pink-700" aria-hidden="true" />
                <div>
                  <p className="font-semibold">{o.orders(openOrders ?? 0)}</p>
                  <Link
                    href="/app/orders"
                    className="mt-1 inline-block text-sm font-semibold text-pink-700 hover:underline"
                  >
                    {o.viewOrders}
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}

          {showStock && lowStock.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TriangleAlert className="size-4 text-warning-600" aria-hidden="true" />{" "}
                    {o.lowStock}
                  </CardTitle>
                  <CardDescription>{o.lowStockText(lowStock.length)}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-2 text-sm">
                  {lowStock.slice(0, 5).map((product) => (
                    <li key={product.id} className="flex justify-between gap-3">
                      <Link
                        href={`/app/products/${product.id}`}
                        className="truncate hover:text-pink-700"
                      >
                        {product.name}
                      </Link>
                      <span className="font-semibold tabular-nums">
                        {o.left(product.stock_quantity)}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {showChecklist && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{o.finish}</CardTitle>
                  <CardDescription>
                    {o.finishProgress(
                      checklist.filter((item) => item.done).length,
                      checklist.length,
                    )}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="grid gap-1">
                  {checklist.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 text-sm hover:bg-surface-subtle"
                      >
                        {item.done ? (
                          <CheckCircle2 className="size-5 text-success-600" aria-hidden="true" />
                        ) : (
                          <Circle className="size-5 text-neutral-400" aria-hidden="true" />
                        )}
                        <span
                          className={item.done ? "text-fg-muted line-through" : "font-semibold"}
                        >
                          {item.label}
                        </span>
                        <span className="sr-only">{item.done ? o.done : o.todo}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {business.booking_enabled && (
            <Card className="bg-surface-warm">
              <CardContent>
                <p className="eyebrow">{o.yourPage}</p>
                <p className="mt-2 text-sm text-fg-muted">{o.shareText}</p>
                <a
                  href={`/${business.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 block font-semibold break-all text-pink-700 hover:underline"
                >
                  /{business.slug}
                </a>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-fg-muted">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
      </CardContent>
    </Card>
  );
}
