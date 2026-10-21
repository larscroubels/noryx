import { Globe, Package, Plus, TriangleAlert } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { getT } from "@/i18n/server";
import { can, requireWorkspace } from "@/lib/auth/session";
import { formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).retail.products.title };
}

export default async function ProductsPage({ searchParams }: PageProps<"/app/products">) {
  const params = await searchParams;
  const [workspace, t] = await Promise.all([requireWorkspace(), getT()]);
  const p = t.retail.products;
  if (!can(workspace, "products.manage") && !can(workspace, "inventory.manage")) notFound();
  const { business } = workspace;
  const q = typeof params.q === "string" ? params.q.trim().slice(0, 80) : "";
  const lowOnly = params.filter === "low";

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select(
      "id, name, sku, category, price_cents, stock_quantity, low_stock_threshold, is_active, is_online",
    )
    .eq("business_id", business.id)
    .order("is_active", { ascending: false })
    .order("name");
  if (q) {
    const term = q.replace(/[%_,()*\\]/g, " ").trim();
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,category.ilike.%${term}%`);
  }
  const { data } = await query.limit(500);
  const products = (data ?? []).filter(
    (p) => !lowOnly || p.stock_quantity <= p.low_stock_threshold,
  );
  const lowCount = (data ?? []).filter(
    (p) => p.is_active && p.stock_quantity <= p.low_stock_threshold,
  ).length;
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);

  return (
    <div className="grid gap-6">
      <PageHeader
        title={p.title}
        description={p.description}
        actions={
          can(workspace, "products.manage") ? (
            <Button asChild>
              <Link href="/app/products/new">
                <Plus aria-hidden="true" /> {p.new}
              </Link>
            </Button>
          ) : undefined
        }
      />

      <form method="get" className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <label htmlFor="product-search" className="sr-only">
          {p.searchLabel}
        </label>
        <Input
          id="product-search"
          name="q"
          type="search"
          defaultValue={q}
          placeholder={p.searchPlaceholder}
          className="sm:max-w-md"
        />
        <Button type="submit" variant="secondary">
          {t.common.search}
        </Button>
        <Button asChild variant={lowOnly ? "soft" : "ghost"}>
          <Link href={lowOnly ? "/app/products" : "/app/products?filter=low"}>
            <TriangleAlert aria-hidden="true" /> {p.lowStock(lowCount)}
          </Link>
        </Button>
      </form>

      <Card className="overflow-hidden">
        {products.length === 0 ? (
          <EmptyState
            icon={<Package />}
            title={q || lowOnly ? p.noMatch : p.empty}
            description={
              q || lowOnly ? p.noMatchText : p.emptyText
            }
            action={
              !q && !lowOnly && can(workspace, "products.manage") ? (
                <Button asChild>
                  <Link href="/app/products/new">{p.addFirst}</Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>{p.product}</TableHead>
                <TableHead className="hidden md:table-cell">{t.common.fields.category}</TableHead>
                <TableHead className="text-right">{t.common.fields.price}</TableHead>
                <TableHead className="text-right">{p.inStock}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const low = product.stock_quantity <= product.low_stock_threshold;
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link
                        href={`/app/products/${product.id}`}
                        className="font-semibold hover:text-pink-700"
                      >
                        {product.name}
                      </Link>
                      <span className="mt-1 flex flex-wrap gap-1.5">
                        {product.sku && (
                          <span className="text-xs text-fg-muted">{p.sku(product.sku)}</span>
                        )}
                        {!product.is_active && <Badge>{t.common.inactive}</Badge>}
                        {product.is_online && product.is_active && (
                          <Badge tone="gold" icon={<Globe />}>
                            {p.online}
                          </Badge>
                        )}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-fg-muted md:table-cell">
                      {product.category ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">
                      {money(product.price_cents)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="inline-flex items-center gap-2 font-semibold tabular-nums">
                        {low && product.is_active && (
                          <Badge
                            tone={product.stock_quantity === 0 ? "danger" : "warning"}
                            icon={<TriangleAlert />}
                          >
                            {product.stock_quantity === 0 ? p.outOfStock : p.low}
                          </Badge>
                        )}
                        {product.stock_quantity}
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
  );
}
