import { ShoppingBag } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
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
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney } from "@/lib/format";
import { ORDER_STATUS_TONE, PAYMENT_STATUS_TONE, type OrderStatus } from "@/lib/orders";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).retail.orders.title };
}

const FILTERS: { key: "open" | "completed" | "cancelled" | "all"; statuses?: OrderStatus[] }[] = [
  { key: "open", statuses: ["pending", "confirmed", "ready"] },
  { key: "completed", statuses: ["completed"] },
  { key: "cancelled", statuses: ["cancelled"] },
  { key: "all" },
];

export default async function OrdersPage({ searchParams }: PageProps<"/app/orders">) {
  const params = await searchParams;
  const { business } = await requirePermission("orders.manage");
  const { t, intl } = await getI18n();
  const o = t.retail.orders;
  const filter = FILTERS.find((f) => f.key === params.filter) ?? FILTERS[0]!;
  const supabase = await createClient();
  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, status, payment_status, total_cents, currency, created_at, order_items(quantity)",
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .order("order_number", { ascending: false })
    .limit(200);
  if (filter.statuses) query = query.in("status", filter.statuses);
  const { data: orders } = await query;

  return (
    <div className="grid gap-6">
      <PageHeader
        title={o.title}
        description={o.description}
      />
      {!business.shop_enabled && (
        <Alert tone="info" title={o.shopOff}>
          {o.shopOffBefore} <Link href="/app/settings#shop">{t.app.nav.settings}</Link>{" "}
          {o.shopOffAfter}
        </Alert>
      )}
      <nav aria-label={o.filtersLabel} className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/app/orders?filter=${f.key}`}
            aria-current={f.key === filter.key ? "page" : undefined}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
              f.key === filter.key
                ? "border-pink-700 bg-pink-700 text-white"
                : "border-border bg-surface text-fg-muted hover:text-fg",
            )}
          >
            {o.filters[f.key]}
          </Link>
        ))}
      </nav>
      <Card className="overflow-hidden">
        {!orders || orders.length === 0 ? (
          <EmptyState
            icon={<ShoppingBag />}
            title={o.empty}
            description={o.emptyText}
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{o.order}</TableHead>
                <TableHead>{t.common.fields.status}</TableHead>
                <TableHead className="hidden sm:table-cell">{o.payment}</TableHead>
                <TableHead className="text-right">{t.common.fields.total}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <Link
                      href={`/app/orders/${order.id}`}
                      className="font-semibold hover:text-pink-700"
                    >
                      #{order.order_number} · {order.customer_name}
                    </Link>
                    <span className="block text-xs text-fg-muted">
                      {formatDateTime(order.created_at, business.timezone, intl)} ·{" "}
                      {o.items(order.order_items.reduce((sum, i) => sum + i.quantity, 0))}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>{o.status[order.status]}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge tone={PAYMENT_STATUS_TONE[order.payment_status]}>
                      {o.paymentStatus[order.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {formatMoney(order.total_cents, order.currency, business.locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <p className="text-sm text-fg-muted">
        <Button asChild variant="link">
          <Link href="/app/products">{o.manageProducts}</Link>
        </Button>
      </p>
    </div>
  );
}
