import {
  ArrowLeft,
  CalendarClock,
  CircleCheckBig,
  CircleSlash,
  Gift,
  Mail,
  Phone,
  UserX,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { ConfirmAction } from "@/components/forms/confirm-action";
import { SubmitButton } from "@/components/forms/form-controls";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { getI18n, getT } from "@/i18n/server";
import { NEXT_STATUSES } from "@/lib/appointments/status";
import { can, requireWorkspace } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import {
  formatDateTime,
  formatDuration,
  formatLocalDate,
  formatMoney,
  formatTime,
} from "@/lib/format";
import { methodLabel } from "@/lib/finance/summary";
import { createClient } from "@/lib/supabase/server";
import { minutesToTime, utcToZoned } from "@/lib/time";

import { PaymentForm } from "../../finance/finance-forms";
import { RedeemGiftCardForm } from "../../gift-cards/forms";
import { cancelAppointment, changeStatus } from "../actions";
import { InternalNoteForm, RescheduleForm } from "./forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).appointments.detail.metaTitle };
}

const STATUS_ACTIONS = {
  confirmed: {
    icon: <CircleCheckBig aria-hidden="true" />,
    variant: "primary" as const,
  },
  completed: {
    icon: <CircleCheckBig aria-hidden="true" />,
    variant: "primary" as const,
  },
  no_show: {
    icon: <UserX aria-hidden="true" />,
    variant: "secondary" as const,
  },
  pending: null,
  cancelled: null,
};

export default async function AppointmentPage({
  params,
  searchParams,
}: PageProps<"/app/appointments/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const d = t.appointments.detail;
  const { business } = workspace;
  const tz = business.timezone;
  const supabase = await createClient();

  const { data: appointment } = await supabase
    .from("appointments")
    .select(
      "id, starts_at, ends_at, status, source, service_name, duration_minutes, price_cents, currency, staff_id, customer_id, customer_note, internal_note, cancellation_reason, cancelled_by, created_at, customer:customers(id, first_name, last_name, email, phone), staff:staff_members(display_name)",
    )
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!appointment) notFound();

  const canManage =
    can(workspace, "appointments.manage_all") ||
    (can(workspace, "appointments.manage_own") && workspace.staffId === appointment.staff_id);
  const [{ data: events }, { data: staff }] = await Promise.all([
    supabase
      .from("appointment_events")
      .select("id, event, from_status, to_status, previous_starts_at, new_starts_at, created_at")
      .eq("appointment_id", id)
      .order("id"),
    supabase
      .from("staff_members")
      .select("id, display_name")
      .eq("business_id", business.id)
      .eq("is_active", true)
      .order("display_name"),
  ]);
  // Payments are part of Pro (the database enforces this as well).
  const paymentsEnabled = hasFeature(await getEntitlements(business.id), "finance");
  const canSeeFinance = paymentsEnabled && can(workspace, "finance.view");
  const canRecordPayment =
    paymentsEnabled &&
    (can(workspace, "finance.manage") || can(workspace, "appointments.manage_all"));
  const canRedeemGiftCard =
    can(workspace, "gift_cards.manage") ||
    can(workspace, "appointments.manage_all") ||
    can(workspace, "finance.manage");
  const canSeeGiftCards = can(workspace, "gift_cards.manage") || can(workspace, "finance.view");
  const [{ data: paidCents }, { data: payments }, { data: giftCardUse }, { data: dueCents }] =
    await Promise.all([
      supabase.rpc("appointment_paid_cents", { p_appointment_id: id }),
      canSeeFinance
        ? supabase
            .from("payments")
            .select("id, amount_cents, method, status, paid_at")
            .eq("appointment_id", id)
            .order("paid_at")
        : Promise.resolve({ data: null }),
      canSeeGiftCards
        ? supabase
            .from("gift_card_transactions")
            .select(
              "id, kind, amount_cents, gift_card_id, created_at, gift_card:gift_cards(number)",
            )
            .eq("appointment_id", id)
            .in("kind", ["redeem", "reversal"])
            .order("id")
        : Promise.resolve({ data: null }),
      // Same figure the database uses to cap redemptions, whatever this user may read.
      canRedeemGiftCard
        ? supabase.rpc("gift_card_purchase_due", {
            p_business_id: business.id,
            p_appointment_id: id,
          })
        : Promise.resolve({ data: null }),
    ]);
  const paid = paidCents ?? 0;
  const due = dueCents ?? Math.max(appointment.price_cents - paid, 0);
  const local = utcToZoned(new Date(appointment.starts_at), tz);
  const customerName = appointment.customer
    ? `${appointment.customer.first_name} ${appointment.customer.last_name ?? ""}`.trim()
    : t.common.fields.customer;
  const nextStatuses = canManage ? NEXT_STATUSES[appointment.status] : [];
  const moveStaff = can(workspace, "appointments.manage_all")
    ? (staff ?? [])
    : (staff ?? []).filter((s) => s.id === workspace.staffId);

  return (
    <div className="grid max-w-5xl gap-6">
      <Link
        href={`/app/calendar?date=${local.date}`}
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {d.back}
      </Link>
      {query.created === "1" && <Alert tone="success">{d.created}</Alert>}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="eyebrow">{formatLocalDate(local.date, undefined, intl)}</p>
          <h1 className="mt-2 font-display text-display-sm font-semibold">
            {formatTime(appointment.starts_at, tz, intl)}–
            {formatTime(appointment.ends_at, tz, intl)} · {appointment.service_name}
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <AppointmentStatusBadge status={appointment.status} />
            <span className="text-sm text-fg-muted">
              {d.with(appointment.staff?.display_name ?? "")} ·{" "}
              {appointment.source === "online" ? d.online : d.byTeam}
            </span>
          </div>
        </div>
        {nextStatuses.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => {
              const config = STATUS_ACTIONS[status];
              if (!config) return null;
              return (
                <form key={status} action={changeStatus}>
                  <input type="hidden" name="appointmentId" value={appointment.id} />
                  <input type="hidden" name="status" value={status} />
                  <SubmitButton variant={config.variant} size="sm">
                    {config.icon} {d.actions[status as keyof typeof d.actions]}
                  </SubmitButton>
                </form>
              );
            })}
            {nextStatuses.includes("cancelled") && (
              <ConfirmAction
                trigger={
                  <>
                    <CircleSlash aria-hidden="true" /> {d.cancel}
                  </>
                }
                title={d.cancelTitle}
                description={d.cancelText}
                confirmLabel={d.cancelConfirm}
                action={cancelAppointment}
                hiddenFields={{ appointmentId: appointment.id }}
              >
                <Field label={t.common.fields.reason} optional hint={d.cancelReasonHint}>
                  <Textarea name="reason" rows={2} />
                </Field>
              </ConfirmAction>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{d.details}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-fg-muted">{t.common.fields.duration}</dt>
                  <dd className="font-semibold">
                    {formatDuration(appointment.duration_minutes, intl)}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">{d.priceAtBooking}</dt>
                  <dd className="font-semibold">
                    {formatMoney(appointment.price_cents, appointment.currency, business.locale)}
                  </dd>
                </div>
                <div>
                  <dt className="text-fg-muted">{d.payment}</dt>
                  <dd className="font-semibold">
                    {paid > 0
                      ? d.recorded(formatMoney(paid, appointment.currency, business.locale))
                      : d.notRecorded}
                  </dd>
                </div>
              </dl>
              {appointment.customer_note && (
                <div className="mt-5 rounded-lg bg-surface-warm p-4 text-sm">
                  <p className="font-semibold">{d.clientNote}</p>
                  <p className="mt-1 whitespace-pre-line text-fg-muted">
                    {appointment.customer_note}
                  </p>
                </div>
              )}
              {appointment.status === "cancelled" && (
                <Alert
                  tone="neutral"
                  className="mt-5"
                  title={d.cancelledBy(appointment.cancelled_by === "customer")}
                >
                  {appointment.cancellation_reason ?? d.noReason}
                </Alert>
              )}
            </CardContent>
          </Card>

          {canManage && appointment.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-fg-muted" aria-hidden="true" />{" "}
                  {d.reschedule}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RescheduleForm
                  appointmentId={appointment.id}
                  staff={moveStaff}
                  defaults={{
                    staffId: appointment.staff_id,
                    date: local.date,
                    time: minutesToTime(local.minuteOfDay),
                  }}
                />
              </CardContent>
            </Card>
          )}

          {(canRecordPayment || canSeeFinance) && appointment.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{d.payment}</CardTitle>
                  <p className="mt-1 text-sm text-fg-muted">{d.paymentText}</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-5">
                {payments && payments.length > 0 && (
                  <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                    {payments.map((payment) => (
                      <li
                        key={payment.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                      >
                        <span>
                          {methodLabel(t, payment.method)} ·{" "}
                          {formatDateTime(payment.paid_at, tz, intl)}
                          {payment.status === "refunded" && d.refunded}
                        </span>
                        <span
                          className={`font-semibold tabular-nums ${payment.status === "refunded" ? "text-fg-muted line-through" : ""}`}
                        >
                          {formatMoney(payment.amount_cents, appointment.currency, business.locale)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {canRecordPayment &&
                  (paid >= appointment.price_cents ? (
                    <p className="text-sm text-success-700">{d.paidInFull}</p>
                  ) : (
                    <PaymentForm
                      appointmentId={appointment.id}
                      defaultCents={
                        Math.max(appointment.price_cents - paid, 0) || appointment.price_cents
                      }
                    />
                  ))}
              </CardContent>
            </Card>
          )}

          {canRedeemGiftCard && appointment.status !== "cancelled" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="size-4 text-fg-muted" aria-hidden="true" />{" "}
                    {t.giftCards.redeem.title}
                  </CardTitle>
                  <p className="mt-1 text-sm text-fg-muted">{t.giftCards.redeem.text}</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {giftCardUse && giftCardUse.length > 0 && (
                  <div className="grid gap-2">
                    <p className="text-sm font-semibold">{t.giftCards.redeem.used}</p>
                    <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                      {giftCardUse.map((row) => (
                        <li
                          key={row.id}
                          className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"
                        >
                          <Link
                            href={`/app/gift-cards/${row.gift_card_id}`}
                            className="hover:text-pink-700"
                          >
                            {t.giftCards.number(row.gift_card?.number ?? 0)} ·{" "}
                            {t.giftCards.detail.kinds[row.kind]}
                          </Link>
                          <span className="font-semibold tabular-nums">
                            {formatMoney(
                              Math.abs(row.amount_cents),
                              appointment.currency,
                              business.locale,
                            )}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-sm font-semibold">
                  {t.giftCards.redeem.remaining(
                    formatMoney(due, appointment.currency, business.locale),
                  )}
                </p>
                <RedeemGiftCardForm appointmentId={appointment.id} defaultCents={due} />
                {!paymentsEnabled && (
                  <p className="text-xs text-fg-muted">{t.giftCards.redeem.basicNote}</p>
                )}
              </CardContent>
            </Card>
          )}

          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>{d.internalNote}</CardTitle>
              </CardHeader>
              <CardContent>
                <InternalNoteForm appointmentId={appointment.id} note={appointment.internal_note} />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{d.client}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p className="text-base font-semibold">{customerName}</p>
              {appointment.customer?.email && (
                <a
                  href={`mailto:${appointment.customer.email}`}
                  className="flex items-center gap-2 text-fg-muted hover:text-fg"
                >
                  <Mail className="size-4" aria-hidden="true" /> {appointment.customer.email}
                </a>
              )}
              {appointment.customer?.phone && (
                <a
                  href={`tel:${appointment.customer.phone}`}
                  className="flex items-center gap-2 text-fg-muted hover:text-fg"
                >
                  <Phone className="size-4" aria-hidden="true" /> {appointment.customer.phone}
                </a>
              )}
              <Button asChild variant="secondary" size="sm" className="mt-2 w-fit">
                <Link href={`/app/customers/${appointment.customer_id}`}>{d.viewClient}</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{d.history}</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-4 border-l border-border pl-4 text-sm">
                {(events ?? []).map((event) => (
                  <li key={event.id} className="relative">
                    <span
                      aria-hidden="true"
                      className="absolute top-1.5 -left-[1.3rem] size-2 rounded-full bg-rosegold-400"
                    />
                    <p className="font-semibold">
                      {event.event === "created" && d.eventCreated}
                      {event.event === "status_changed" &&
                        `${t.common.appointmentStatus[event.from_status!]} → ${t.common.appointmentStatus[event.to_status!]}`}
                      {event.event === "rescheduled" &&
                        d.movedFrom(formatDateTime(event.previous_starts_at!, tz, intl))}
                    </p>
                    <p className="text-fg-muted">{formatDateTime(event.created_at, tz, intl)}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
