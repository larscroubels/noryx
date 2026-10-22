import { ArrowLeft, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
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
import { can, requireWorkspace } from "@/lib/auth/session";
import { methodLabel } from "@/lib/finance/summary";
import { formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { displayStatus, GIFT_CARD_TONE } from "@/lib/gift-cards";
import { createClient } from "@/lib/supabase/server";

import {
  adjustGiftCard,
  cancelGiftCard,
  reverseGiftCardRedemption,
  setGiftCardBlocked,
} from "../actions";
import { ActivateGiftCardForm, GiftCardActionDialog } from "../forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).giftCards.detail.metaTitle };
}

export default async function GiftCardPage({ params }: PageProps<"/app/gift-cards/[id]">) {
  const { id } = await params;
  const workspace = await requireWorkspace();
  const canManage = can(workspace, "gift_cards.manage");
  if (!canManage && !can(workspace, "finance.view")) notFound();
  const { business } = workspace;
  const { t, intl } = await getI18n();
  const g = t.giftCards;
  const d = g.detail;
  const supabase = await createClient();
  const [{ data: card }, { data: ledger }] = await Promise.all([
    supabase
      .from("gift_cards")
      .select(
        "id, number, status, source, initial_cents, balance_cents, currency, code_last4, buyer_name, buyer_email, buyer_phone, recipient_name, message, sale_method, paid_at, expires_at, status_reason, created_at",
      )
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle(),
    supabase
      .from("gift_card_transactions")
      .select(
        "id, kind, amount_cents, balance_after_cents, appointment_id, order_id, reverses_id, reason, created_at, order:orders(order_number)",
      )
      .eq("gift_card_id", id)
      .eq("business_id", business.id)
      .order("id"),
  ]);
  if (!card) notFound();
  const money = (cents: number) => formatMoney(cents, card.currency, business.locale);
  const status = displayStatus(card);
  const reversed = new Set((ledger ?? []).map((row) => row.reverses_id).filter(Boolean));
  const usable = card.status === "active" || card.status === "blocked";

  return (
    <div className="grid max-w-5xl gap-6">
      <Link
        href="/app/gift-cards"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-semibold text-fg-muted hover:text-fg"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> {d.back}
      </Link>
      <PageHeader
        eyebrow={`${d.source[card.source]} · ${formatDateTime(card.created_at, business.timezone, intl)}`}
        title={g.number(card.number)}
        actions={
          canManage ? (
            <>
              {card.status === "active" && (
                <GiftCardActionDialog
                  trigger={d.block}
                  title={d.blockTitle}
                  description={d.blockText}
                  confirmLabel={d.block}
                  action={setGiftCardBlocked}
                  hiddenFields={{ giftCardId: card.id, blocked: "true" }}
                />
              )}
              {card.status === "blocked" && (
                <GiftCardActionDialog
                  trigger={d.unblock}
                  title={d.unblockTitle}
                  description={d.unblockText}
                  confirmLabel={d.unblock}
                  action={setGiftCardBlocked}
                  hiddenFields={{ giftCardId: card.id, blocked: "false" }}
                  tone="primary"
                />
              )}
              {usable && (
                <GiftCardActionDialog
                  trigger={d.adjust}
                  title={d.adjustTitle}
                  description={d.adjustText}
                  confirmLabel={d.adjust}
                  action={adjustGiftCard}
                  hiddenFields={{ giftCardId: card.id }}
                  withAmount
                  tone="primary"
                />
              )}
              {card.status !== "cancelled" && (
                <GiftCardActionDialog
                  trigger={d.cancel}
                  title={d.cancelTitle}
                  description={d.cancelText}
                  confirmLabel={d.cancel}
                  action={cancelGiftCard}
                  hiddenFields={{ giftCardId: card.id }}
                />
              )}
            </>
          ) : undefined
        }
      />
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={GIFT_CARD_TONE[status]}>{g.status[status]}</Badge>
        {card.code_last4 && <Badge tone="outline">{g.codeEnding(card.code_last4)}</Badge>}
      </div>
      {card.status_reason && (card.status === "blocked" || card.status === "cancelled") && (
        <Alert tone="neutral">{d.statusReason(card.status_reason)}</Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-6">
          {canManage && (
            <ActivateGiftCardForm giftCardId={card.id} pending={card.status === "pending"} />
          )}
          <Card>
            <CardContent className="grid gap-4 pt-6 text-sm sm:grid-cols-3">
              <div>
                <p className="text-fg-muted">{g.balance}</p>
                <p className="font-display text-display-sm font-semibold tabular-nums">
                  {money(card.balance_cents)}
                </p>
              </div>
              <div>
                <p className="text-fg-muted">{d.initial}</p>
                <p className="font-semibold tabular-nums">{money(card.initial_cents)}</p>
              </div>
              <div>
                <p className="text-fg-muted">{d.expires}</p>
                <p className="font-semibold">
                  {card.expires_at
                    ? formatDate(card.expires_at, business.timezone, {}, intl)
                    : d.noExpiry}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle>{d.history}</CardTitle>
            </CardHeader>
            {ledger && ledger.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{t.common.fields.date}</TableHead>
                    <TableHead className="text-right">{t.common.fields.amount}</TableHead>
                    <TableHead className="text-right">{g.balance}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <span className="font-semibold">{d.kinds[row.kind]}</span>
                        <span className="block text-xs text-fg-muted">
                          {formatDateTime(row.created_at, business.timezone, intl)}
                          {row.appointment_id && (
                            <>
                              {" · "}
                              <Link
                                href={`/app/appointments/${row.appointment_id}`}
                                className="hover:text-fg hover:underline"
                              >
                                {d.appointment}
                              </Link>
                            </>
                          )}
                          {row.order_id && row.order && (
                            <>
                              {" · "}
                              <Link
                                href={`/app/orders/${row.order_id}`}
                                className="hover:text-fg hover:underline"
                              >
                                {d.order(row.order.order_number)}
                              </Link>
                            </>
                          )}
                          {row.reason && ` · ${d.statusReason(row.reason)}`}
                        </span>
                        {canManage &&
                          row.kind === "redeem" &&
                          !reversed.has(row.id) &&
                          card.status !== "cancelled" && (
                            <div className="mt-2">
                              <GiftCardActionDialog
                                trigger={d.reverse}
                                title={d.reverseTitle}
                                description={d.reverseText}
                                confirmLabel={d.reverse}
                                action={reverseGiftCardRedemption}
                                hiddenFields={{
                                  giftCardId: card.id,
                                  transactionId: String(row.id),
                                }}
                                triggerVariant="link"
                                triggerSize="sm"
                              />
                            </div>
                          )}
                      </TableCell>
                      <TableCell
                        className={`text-right font-semibold tabular-nums ${row.amount_cents < 0 ? "text-fg-muted" : ""}`}
                      >
                        {row.amount_cents > 0 ? "+" : "−"}
                        {money(Math.abs(row.amount_cents))}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {money(row.balance_after_cents)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <CardContent className="text-sm text-fg-muted">{t.common.none}</CardContent>
            )}
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>{g.buyer}</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm">
            <p className="font-semibold">{card.buyer_name}</p>
            {card.buyer_email && (
              <a
                href={`mailto:${card.buyer_email}`}
                className="flex items-center gap-2 break-all text-fg-muted hover:text-fg"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" /> {card.buyer_email}
              </a>
            )}
            {card.buyer_phone && <p className="text-fg-muted">{card.buyer_phone}</p>}
            {card.sale_method && card.paid_at && (
              <p className="text-fg-muted">
                {d.paidWith(methodLabel(t, card.sale_method))} ·{" "}
                {formatDateTime(card.paid_at, business.timezone, intl)}
              </p>
            )}
            {card.recipient_name && (
              <div>
                <p className="text-fg-muted">{d.recipient}</p>
                <p className="font-semibold">{card.recipient_name}</p>
              </div>
            )}
            {card.message && (
              <div>
                <p className="text-fg-muted">{d.message}</p>
                <p className="whitespace-pre-line">{card.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
