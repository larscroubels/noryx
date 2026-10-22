import { ArrowLeft, Mail, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmAction } from "@/components/forms/confirm-action";
import { SubmitButton } from "@/components/forms/form-controls";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
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
import { requirePermission } from "@/lib/auth/session";
import { formatDateTime, formatMoney } from "@/lib/format";
import { NEXT_ORDER_STATUS, ORDER_STATUS_TONE, PAYMENT_STATUS_TONE } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

import { RedeemGiftCardForm } from "../../gift-cards/forms";
import { advanceOrder, cancelOrder, setOrderPayment } from "../actions";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).retail.orders.detail.metaTitle };
}

export default async function OrderPage({ params }: PageProps<"/app/orders/[id]">) {
  const { id } = await params;
  const { business } = await requirePermission("orders.manage");
  const { t, intl } = await getI18n();
  const o = t.retail.orders;
  const d = o.detail;
  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select(
      "id, order_number, customer_id, customer_name, customer_email, customer_phone, status, payment_status, total_cents, currency, note, created_at, cancelled_at, order_items(id, product_name, unit_price_cents, quantity, line_total_cents)",
    )
    .eq("id", id)
    .eq("business_id", business.id)
    .maybeSingle();
  if (!order) notFound();
  const money = (cents: number) => formatMoney(cents, order.currency, business.locale);
  const { data: giftCardUse } = await supabase
    .from("gift_card_transactions")
    .select("id, kind, amount_cents, gift_card_id, gift_card:gift_cards(number)")
    .eq("order_id", order.id)
    .in("kind", ["redeem", "reversal"])
    .order("id");
  const { data: dueCents } = await supabase.rpc("gift_card_purchase_due", {
    p_business_id: business.id,
    p_order_id: order.id,
  });
  const due = dueCents ?? order.total_cents;
  const next = NEXT_ORDER_STATUS[order.status];
  const open = order.status !== "cancelled" && order.status !== "completed";

  return (
    <div className="grid max-w-4xl gap-6">
      <Link
        href="/app/orders"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {d.all}
      </Link>
      <PageHeader
        eyebrow={formatDateTime(order.created_at, business.timezone, intl)}
        title={d.title(order.order_number)}
        actions={
          open ? (
            <>
              {next && (
                <form action={advanceOrder}>
                  <input type="hidden" name="orderId" value={order.id} />
                  <input type="hidden" name="status" value={next} />
                  <SubmitButton>{o.next[order.status]}</SubmitButton>
                </form>
              )}
              <ConfirmAction
                trigger={d.cancel}
                title={d.cancelTitle}
                description={d.cancelText}
                confirmLabel={d.cancel}
                action={cancelOrder}
                hiddenFields={{ orderId: order.id }}
              />
            </>
          ) : undefined
        }
      />
      <div className="flex flex-wrap gap-2">
        <Badge tone={ORDER_STATUS_TONE[order.status]}>{o.status[order.status]}</Badge>
        <Badge tone={PAYMENT_STATUS_TONE[order.payment_status]}>
          {o.paymentStatus[order.payment_status]}
        </Badge>
        <Badge tone="outline">{d.pickup}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <Card className="overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle>{d.items}</CardTitle>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{t.retail.products.product}</TableHead>
                <TableHead className="text-right">{d.qty}</TableHead>
                <TableHead className="text-right">{t.common.fields.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.order_items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <span className="font-semibold">{item.product_name}</span>
                    <span className="block text-xs text-fg-muted">
                      {d.each(money(item.unit_price_cents))}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {money(item.line_total_cents)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={2} className="text-right font-semibold">
                  {t.common.fields.total}
                </TableCell>
                <TableCell className="text-right text-base font-semibold tabular-nums">
                  {money(order.total_cents)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          {order.note && (
            <p className="border-t border-border px-5 py-4 text-sm text-fg-muted sm:px-6">
              {d.note(order.note)}
            </p>
          )}
        </Card>

        <div className="grid content-start gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{d.client}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm">
              <p className="font-semibold">{order.customer_name}</p>
              {order.customer_email && (
                <a
                  href={`mailto:${order.customer_email}`}
                  className="flex items-center gap-2 break-all text-fg-muted hover:text-fg"
                >
                  <Mail className="size-4 shrink-0" aria-hidden="true" /> {order.customer_email}
                </a>
              )}
              {order.customer_phone && (
                <a
                  href={`tel:${order.customer_phone}`}
                  className="flex items-center gap-2 text-fg-muted hover:text-fg"
                >
                  <Phone className="size-4" aria-hidden="true" /> {order.customer_phone}
                </a>
              )}
              {order.customer_id && (
                <Link
                  href={`/app/customers/${order.customer_id}`}
                  className="mt-1 font-semibold text-pink-700 hover:underline"
                >
                  {d.viewClient}
                </Link>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{o.payment}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <p className="text-fg-muted">{d.paymentText}</p>
              <form action={setOrderPayment} className="flex flex-wrap gap-2">
                <input type="hidden" name="orderId" value={order.id} />
                {order.payment_status !== "paid" && (
                  <SubmitButton name="paymentStatus" value="paid" size="sm">
                    {d.markPaid}
                  </SubmitButton>
                )}
                {order.payment_status === "paid" && (
                  <>
                    <SubmitButton name="paymentStatus" value="unpaid" size="sm" variant="secondary">
                      {d.markUnpaid}
                    </SubmitButton>
                    <SubmitButton
                      name="paymentStatus"
                      value="refunded"
                      size="sm"
                      variant="secondary"
                    >
                      {d.markRefunded}
                    </SubmitButton>
                  </>
                )}
              </form>
            </CardContent>
          </Card>
          {order.status !== "cancelled" && order.payment_status === "unpaid" && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{t.giftCards.redeem.title}</CardTitle>
                  <p className="mt-1 text-sm text-fg-muted">{t.giftCards.redeem.text}</p>
                </div>
              </CardHeader>
              <CardContent className="grid gap-4">
                {giftCardUse && giftCardUse.length > 0 && (
                  <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                    {giftCardUse.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between gap-2 px-3 py-2"
                      >
                        <Link
                          href={`/app/gift-cards/${row.gift_card_id}`}
                          className="hover:text-pink-700"
                        >
                          {t.giftCards.number(row.gift_card?.number ?? 0)} ·{" "}
                          {t.giftCards.detail.kinds[row.kind]}
                        </Link>
                        <span className="font-semibold tabular-nums">
                          {money(Math.abs(row.amount_cents))}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-sm font-semibold">{t.giftCards.redeem.remaining(money(due))}</p>
                <RedeemGiftCardForm orderId={order.id} defaultCents={due} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
