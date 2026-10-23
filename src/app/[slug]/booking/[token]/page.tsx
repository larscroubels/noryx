import type { Metadata } from "next";
import Link from "next/link";

import { AppointmentStatusBadge } from "@/components/appointments/appointment-status-badge";
import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { AppointmentStatus } from "@/lib/appointments/status";
import { formatDateTime, formatMoney, formatTime } from "@/lib/format";
import { getI18n, getT } from "@/i18n/server";
import { createClient } from "@/lib/supabase/server";

import { CancelForm } from "./cancel-form";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).booking.manage.title, robots: { index: false, follow: false } };
}

type Booking = {
  business_name: string;
  business_slug: string;
  business_phone: string | null;
  timezone: string;
  currency: string;
  locale: string;
  service_name: string;
  staff_name: string;
  starts_at: string;
  ends_at: string;
  price_cents: number;
  status: AppointmentStatus;
  cancellation_notice_hours: number;
  can_cancel: boolean;
};

export default async function ManageBookingPage({ params }: PageProps<"/[slug]/booking/[token]">) {
  const { slug, token } = await params;
  const [supabase, { t, intl }] = await Promise.all([createClient(), getI18n()]);
  const m = t.booking.manage;
  const { data } = /^[a-f0-9]{48}$/.test(token)
    ? await supabase.rpc("get_booking_by_token", { p_token: token })
    : { data: null };
  const booking = data as Booking | null;

  return (
    <main className="flex min-h-dvh flex-col items-center bg-surface-subtle px-4 py-12">
      <div className="mb-6 flex w-full max-w-lg justify-end">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-lg p-6 sm:p-8">
        {!booking || booking.business_slug !== slug ? (
          <Alert tone="warning" title={m.notFound}>
            {m.notFoundText}
          </Alert>
        ) : (
          <div className="grid gap-6">
            <div>
              <p className="eyebrow">{booking.business_name}</p>
              <h1 className="mt-2 font-display text-display-sm font-semibold">{m.title}</h1>
            </div>
            <dl className="grid gap-3 rounded-lg bg-surface-subtle p-5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">{t.common.fields.service}</dt>
                <dd className="text-right font-semibold">{booking.service_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">{t.booking.flow.with}</dt>
                <dd className="text-right font-semibold">{booking.staff_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">{t.booking.flow.when}</dt>
                <dd className="text-right font-semibold">
                  {formatDateTime(booking.starts_at, booking.timezone, intl)}–
                  {formatTime(booking.ends_at, booking.timezone, intl)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-fg-muted">{t.common.fields.price}</dt>
                <dd className="text-right font-semibold">
                  {formatMoney(booking.price_cents, booking.currency, booking.locale)} ·{" "}
                  {t.booking.flow.payAtSalon}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-fg-muted">{t.common.fields.status}</dt>
                <dd>
                  <AppointmentStatusBadge status={booking.status} />
                </dd>
              </div>
            </dl>
            {booking.can_cancel ? (
              <div className="grid gap-3">
                <p className="text-sm text-fg-muted">
                  {m.deleteInfo(booking.cancellation_notice_hours)}
                </p>
                <CancelForm token={token} />
              </div>
            ) : booking.status === "cancelled" ? (
              <Alert tone="neutral">{m.cancelled}</Alert>
            ) : (
              booking.status !== "completed" &&
              booking.status !== "no_show" && (
                <Alert tone="info">
                  {m.closed}{" "}
                  {booking.business_phone ? m.callPhone(booking.business_phone) : m.contactSalon}
                </Alert>
              )
            )}
            <Button asChild variant="secondary">
              <Link href={`/${booking.business_slug}/book`}>{m.bookAnother}</Link>
            </Button>
          </div>
        )}
      </Card>
      <Link href="/" className="mt-8 flex items-center gap-2 text-sm text-fg-muted hover:text-fg">
        {t.common.bookingBy} <Logo variant="wordmark" height={12} />
      </Link>
    </main>
  );
}
