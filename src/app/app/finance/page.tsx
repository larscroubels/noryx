import { Download, Trash2, Undo2 } from "lucide-react";
import type { Metadata } from "next";

import { ConfirmAction } from "@/components/forms/confirm-action";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getI18n, getT } from "@/i18n/server";
import { PlanLocked } from "@/components/billing/plan-locked";
import { can, requirePermission } from "@/lib/auth/session";
import { formatDate, formatDateTime, formatLocalDate, formatMoney } from "@/lib/format";
import {
  categoryLabel,
  methodLabel,
  summarizeFinance,
  type Breakdown,
} from "@/lib/finance/summary";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { createClient } from "@/lib/supabase/server";
import { addDays, dayBoundsUtc, todayInZone } from "@/lib/time";

import { deleteExpense, refundPayment } from "./actions";
import { ExpenseForm } from "./finance-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).finance.title };
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export default async function FinancePage({ searchParams }: PageProps<"/app/finance">) {
  const params = await searchParams;
  const workspace = await requirePermission("finance.view");
  const { t, intl } = await getI18n();
  const f = t.finance;
  const { business } = workspace;
  const tz = business.timezone;
  const today = todayInZone(tz);
  const from =
    typeof params.from === "string" && DATE.test(params.from)
      ? params.from
      : `${today.slice(0, 7)}-01`;
  const to =
    typeof params.to === "string" && DATE.test(params.to) && params.to >= from ? params.to : today;
  const start = dayBoundsUtc(from, tz).start.toISOString();
  const end = dayBoundsUtc(to, tz).end.toISOString();
  if (!hasFeature(await getEntitlements(business.id), "finance"))
    return <PlanLocked title={f.title} heading={f.notIncluded} text={f.notIncludedText} />;
  const canManage = can(workspace, "finance.manage");
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);

  const supabase = await createClient();
  const [{ data: payments }, { data: expenses }, { data: booked }] = await Promise.all([
    supabase
      .from("payments")
      .select(
        "id, amount_cents, status, method, paid_at, note, appointment_id, appointment:appointments(service_name, staff:staff_members(display_name))",
      )
      .eq("business_id", business.id)
      .gte("paid_at", start)
      .lt("paid_at", end)
      .order("paid_at", { ascending: false })
      .limit(5000),
    supabase
      .from("expenses")
      .select("id, description, category, amount_cents, spent_on, supplier, reference")
      .eq("business_id", business.id)
      .gte("spent_on", from)
      .lte("spent_on", to)
      .order("spent_on", { ascending: false })
      .limit(5000),
    supabase
      .from("appointments")
      .select("price_cents, status")
      .eq("business_id", business.id)
      .gte("starts_at", start)
      .lt("starts_at", end)
      .limit(10000),
  ]);
  // Payments recorded by a gift card redemption are refunded by reversing it on the card.
  const voucherIds = (payments ?? []).filter((p) => p.method === "voucher").map((p) => p.id);
  const { data: cardLinked } = voucherIds.length
    ? await supabase
        .from("gift_card_transactions")
        .select("payment_id")
        .in("payment_id", voucherIds)
    : { data: [] };
  const linkedToCard = new Set((cardLinked ?? []).map((row) => row.payment_id));

  const summary = summarizeFinance(
    (payments ?? []).map((p) => ({
      amount_cents: p.amount_cents,
      status: p.status,
      method: methodLabel(t, p.method),
      service_name: p.appointment?.service_name ?? f.unlinkedService,
      staff_name: p.appointment?.staff?.display_name ?? f.unlinkedStaff,
    })),
    (expenses ?? []).map((e) => ({
      amount_cents: e.amount_cents,
      category: categoryLabel(t, e.category),
    })),
    booked ?? [],
  );
  const exportQuery = `from=${from}&to=${to}`;

  const presets = [
    { label: f.presets.month, from: `${today.slice(0, 7)}-01`, to: today },
    { label: f.presets.last30, from: addDays(today, -29), to: today },
    { label: f.presets.year, from: `${today.slice(0, 4)}-01-01`, to: today },
  ];

  return (
    <div className="grid gap-8">
      <PageHeader
        title={f.title}
        description={`${formatLocalDate(from, { day: "numeric", month: "long", year: "numeric" }, intl)} – ${formatLocalDate(to, { day: "numeric", month: "long", year: "numeric" }, intl)}`}
        actions={
          <>
            <Button asChild variant="secondary">
              <a href={`/app/finance/export?type=payments&${exportQuery}`} download>
                <Download aria-hidden="true" /> {f.paymentsCsv}
              </a>
            </Button>
            <Button asChild variant="secondary">
              <a href={`/app/finance/export?type=expenses&${exportQuery}`} download>
                <Download aria-hidden="true" /> {f.expensesCsv}
              </a>
            </Button>
          </>
        }
      />

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div className="grid gap-1.5">
          <label htmlFor="from" className="text-sm font-semibold">
            {f.from}
          </label>
          <Input id="from" name="from" type="date" defaultValue={from} className="w-44" />
        </div>
        <div className="grid gap-1.5">
          <label htmlFor="to" className="text-sm font-semibold">
            {f.to}
          </label>
          <Input id="to" name="to" type="date" defaultValue={to} className="w-44" />
        </div>
        <Button type="submit" variant="secondary">
          {t.common.apply}
        </Button>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset) => (
            <Button key={preset.label} asChild variant="ghost" size="sm">
              <a href={`/app/finance?from=${preset.from}&to=${preset.to}`}>{preset.label}</a>
            </Button>
          ))}
        </div>
      </form>

      <section aria-label={f.totals} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Total
          label={f.revenue}
          value={money(summary.revenueCents)}
          hint={f.revenueHint(
            summary.paymentCount,
            summary.refundedCents ? money(summary.refundedCents) : null,
          )}
        />
        <Total
          label={f.expenses}
          value={money(summary.expensesCents)}
          hint={f.entries((expenses ?? []).length)}
        />
        <Total label={f.result} value={money(summary.resultCents)} hint={f.resultHint} />
        <Total
          label={f.booked}
          value={money(summary.bookedValueCents)}
          hint={f.bookedHint(summary.cancelledCount, summary.noShowCount)}
          muted
        />
      </section>

      <Alert tone="neutral">{f.disclaimer}</Alert>

      <div className="grid gap-6 lg:grid-cols-3">
        <BreakdownCard
          title={f.byService}
          rows={summary.byService}
          money={money}
          empty={f.noRevenue}
        />
        <BreakdownCard title={f.byStaff} rows={summary.byStaff} money={money} empty={f.noRevenue} />
        <BreakdownCard
          title={f.byMethod}
          rows={summary.byMethod}
          money={money}
          empty={f.noRevenue}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>{f.payments}</CardTitle>
              <CardDescription>{f.paymentsText}</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {(payments ?? []).length === 0 ? (
              <p className="text-sm text-fg-muted">{f.noPayments}</p>
            ) : (
              <ul className="divide-y divide-border">
                {(payments ?? []).slice(0, 50).map((payment) => (
                  <li key={payment.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">
                        {payment.appointment?.service_name ?? f.payment}
                      </span>
                      <span className="block text-fg-muted">
                        {formatDateTime(payment.paid_at, tz, intl)} ·{" "}
                        {methodLabel(t, payment.method)}
                        {payment.appointment?.staff?.display_name
                          ? ` · ${payment.appointment.staff.display_name}`
                          : ""}
                      </span>
                    </span>
                    {payment.status === "refunded" && <Badge tone="warning">{f.refunded}</Badge>}
                    <span
                      className={`font-semibold tabular-nums ${payment.status === "refunded" ? "text-fg-muted line-through" : ""}`}
                    >
                      {money(payment.amount_cents)}
                    </span>
                    {canManage &&
                      payment.status === "recorded" &&
                      !linkedToCard.has(payment.id) && (
                        <ConfirmAction
                          trigger={<Undo2 aria-label={f.refund} />}
                          triggerVariant="ghost"
                          title={f.refundTitle}
                          description={f.refundText}
                          confirmLabel={f.refundConfirm}
                          action={refundPayment}
                          hiddenFields={{
                            id: payment.id,
                            appointmentId: payment.appointment_id ?? "",
                          }}
                        />
                      )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>{f.expenses}</CardTitle>
              <CardDescription>{f.expensesText}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6">
            {canManage && <ExpenseForm today={today} />}
            {(expenses ?? []).length === 0 ? (
              <p className="text-sm text-fg-muted">{f.noExpenses}</p>
            ) : (
              <ul className="divide-y divide-border border-t border-border">
                {(expenses ?? []).map((expense) => (
                  <li key={expense.id} className="flex flex-wrap items-center gap-3 py-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{expense.description}</span>
                      <span className="block text-fg-muted">
                        {formatDate(expense.spent_on + "T12:00:00Z", "UTC", {}, intl)} ·{" "}
                        {categoryLabel(t, expense.category)}
                        {expense.supplier ? ` · ${expense.supplier}` : ""}
                        {expense.reference ? ` · #${expense.reference}` : ""}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {money(expense.amount_cents)}
                    </span>
                    {canManage && (
                      <form action={deleteExpense}>
                        <input type="hidden" name="id" value={expense.id} />
                        <Button
                          type="submit"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={f.deleteExpense(expense.description)}
                        >
                          <Trash2 aria-hidden="true" />
                        </Button>
                      </form>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Total({
  label,
  value,
  hint,
  muted = false,
}: {
  label: string;
  value: string;
  hint?: string;
  muted?: boolean;
}) {
  return (
    <Card className={muted ? "bg-surface-subtle" : undefined}>
      <CardContent className="p-5">
        <p className="text-sm font-semibold text-fg-muted">{label}</p>
        <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hint && <p className="mt-1 text-xs text-fg-muted">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  title,
  rows,
  money,
  empty,
}: {
  title: string;
  rows: Breakdown;
  money: (cents: number) => string;
  empty: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.amountCents, 0);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <p className="text-sm text-fg-muted">{empty}</p>
        ) : (
          <ul className="grid gap-3">
            {rows.map((row) => (
              <li key={row.label} className="grid gap-1.5 text-sm">
                <span className="flex justify-between gap-3">
                  <span className="truncate">{row.label}</span>
                  <span className="font-semibold tabular-nums">{money(row.amountCents)}</span>
                </span>
                <span
                  className="h-1.5 overflow-hidden rounded-full bg-champagne-100"
                  aria-hidden="true"
                >
                  <span
                    className="block h-full rounded-full bg-rosegold-400"
                    style={{ width: `${total ? (row.amountCents / total) * 100 : 0}%` }}
                  />
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
