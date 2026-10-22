import { Gift } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { Input } from "@/components/ui/input";
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
import { cn } from "@/lib/cn";
import { formatDateTime, formatMoney } from "@/lib/format";
import { displayStatus, GIFT_CARD_TONE } from "@/lib/gift-cards";
import { createClient } from "@/lib/supabase/server";

import { SellGiftCardForm } from "./forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).giftCards.title };
}

const FILTERS = ["all", "pending", "active", "used", "expired", "blocked", "cancelled"] as const;
type Filter = (typeof FILTERS)[number];

export default async function GiftCardsPage({ searchParams }: PageProps<"/app/gift-cards">) {
  const params = await searchParams;
  const workspace = await requireWorkspace();
  const canManage = can(workspace, "gift_cards.manage");
  if (!canManage && !can(workspace, "finance.view")) notFound();
  const { business } = workspace;
  const { t, intl } = await getI18n();
  const g = t.giftCards;
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);
  const filter: Filter = FILTERS.includes(params.filter as Filter)
    ? (params.filter as Filter)
    : "all";
  // Only letters, digits and a few separators reach the query builder.
  const search =
    typeof params.q === "string"
      ? params.q
          .replace(/[^\p{L}\p{N} .'-]/gu, "")
          .trim()
          .slice(0, 60)
      : "";
  const now = new Date().toISOString();

  const supabase = await createClient();
  let query = supabase
    .from("gift_cards")
    .select(
      "id, number, status, source, initial_cents, balance_cents, currency, code_last4, buyer_name, recipient_name, expires_at, created_at",
    )
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(200);
  if (filter === "pending" || filter === "blocked" || filter === "cancelled")
    query = query.eq("status", filter);
  if (filter === "active")
    query = query
      .eq("status", "active")
      .gt("balance_cents", 0)
      .or(`expires_at.is.null,expires_at.gt.${now}`);
  if (filter === "used") query = query.eq("status", "active").eq("balance_cents", 0);
  if (filter === "expired") query = query.eq("status", "active").lte("expires_at", now);
  if (search) {
    const number = /^#?\d+$/.test(search) ? search.replace("#", "") : null;
    const last4 = /^[0-9A-Za-z]{4}$/.test(search) ? search.toUpperCase() : null;
    query = query.or(
      [
        `buyer_name.ilike.%${search}%`,
        `recipient_name.ilike.%${search}%`,
        number && `number.eq.${number}`,
        last4 && `code_last4.eq.${last4}`,
      ]
        .filter(Boolean)
        .join(","),
    );
  }

  const [{ data: cards }, { data: open }] = await Promise.all([
    query,
    supabase
      .from("gift_cards")
      .select("status, balance_cents, expires_at")
      .eq("business_id", business.id)
      .in("status", ["pending", "active"]),
  ]);
  const pending = (open ?? []).filter((c) => c.status === "pending").length;
  const outstanding = (open ?? [])
    .filter((c) => displayStatus(c) === "active")
    .reduce((sum, c) => sum + c.balance_cents, 0);
  const href = (next: Partial<{ filter: Filter; q: string }>) => {
    const query = new URLSearchParams();
    const merged = { filter, q: search, ...next };
    if (merged.filter !== "all") query.set("filter", merged.filter);
    if (merged.q) query.set("q", merged.q);
    return `/app/gift-cards${query.size ? `?${query}` : ""}`;
  };

  return (
    <div className="grid gap-6">
      <PageHeader title={g.title} description={g.description} />
      {pending > 0 && (
        <Alert
          tone="warning"
          action={
            <Button asChild size="sm" variant="secondary">
              <Link href={href({ filter: "pending" })}>{g.status.pending}</Link>
            </Button>
          }
        >
          {g.awaitingPayment(pending)}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid content-start gap-4">
          <form method="get" action="/app/gift-cards" className="flex gap-2" role="search">
            {filter !== "all" && <input type="hidden" name="filter" value={filter} />}
            <label htmlFor="gift-card-search" className="sr-only">
              {g.searchLabel}
            </label>
            <Input
              id="gift-card-search"
              name="q"
              type="search"
              defaultValue={search}
              placeholder={g.searchPlaceholder}
              className="flex-1"
            />
            <Button type="submit" variant="secondary">
              {t.common.search}
            </Button>
          </form>
          <nav aria-label={g.filtersLabel} className="flex flex-wrap gap-2">
            {FILTERS.map((key) => (
              <Link
                key={key}
                href={href({ filter: key })}
                aria-current={key === filter ? "page" : undefined}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-sm font-semibold",
                  key === filter
                    ? "border-pink-700 bg-pink-700 text-white"
                    : "border-border bg-surface text-fg-muted hover:text-fg",
                )}
              >
                {key === "all" ? g.all : g.status[key]}
              </Link>
            ))}
          </nav>
          <p className="text-sm text-fg-muted">{g.outstanding(money(outstanding))}</p>
          <Card className="overflow-hidden">
            {!cards || cards.length === 0 ? (
              <EmptyState icon={<Gift />} title={g.empty} description={g.emptyText} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>{g.card}</TableHead>
                    <TableHead>{t.common.fields.status}</TableHead>
                    <TableHead className="text-right">{g.balance}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cards.map((card) => {
                    const status = displayStatus(card);
                    return (
                      <TableRow key={card.id}>
                        <TableCell>
                          <Link
                            href={`/app/gift-cards/${card.id}`}
                            className="font-semibold hover:text-pink-700"
                          >
                            #{card.number} · {card.buyer_name}
                          </Link>
                          <span className="block text-xs text-fg-muted">
                            {formatDateTime(card.created_at, business.timezone, intl)}
                            {card.code_last4 && ` · ${g.codeEnding(card.code_last4)}`}
                            {card.recipient_name && ` · ${card.recipient_name}`}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge tone={GIFT_CARD_TONE[status]}>{g.status[status]}</Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          <span className="font-semibold">{money(card.balance_cents)}</span>
                          <span className="block text-xs text-fg-muted">
                            {t.giftCards.public.of(money(card.initial_cents))}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>

        {canManage && (
          <Card className="h-fit">
            <CardHeader>
              <div>
                <CardTitle>{g.sell}</CardTitle>
                <p className="mt-1 text-sm text-fg-muted">{g.sellText}</p>
              </div>
            </CardHeader>
            <CardContent>
              <SellGiftCardForm />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
