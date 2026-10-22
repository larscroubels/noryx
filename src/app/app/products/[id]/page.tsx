import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getI18n, getT } from "@/i18n/server";
import { PlanLocked } from "@/components/billing/plan-locked";
import { can, requireWorkspace } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { formatDateTime, formatMoney } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";

import { ProductForm, StockForm } from "../product-forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).retail.products.product };
}

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/app/products/[id]">) {
  const { id } = await params;
  const query = await searchParams;
  const [workspace, { t, intl }] = await Promise.all([requireWorkspace(), getI18n()]);
  const p = t.retail.products;
  const canEdit = can(workspace, "products.manage");
  const canStock = can(workspace, "inventory.manage");
  if (!canEdit && !canStock) notFound();
  const { business } = workspace;
  if (!hasFeature(await getEntitlements(business.id), "inventory"))
    return <PlanLocked title={p.title} heading={p.notIncluded} text={p.notIncludedText} />;
  const supabase = await createClient();
  const [{ data: product }, { data: movements }] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, name, description, sku, category, price_cents, cost_cents, low_stock_threshold, is_active, is_online, stock_quantity",
      )
      .eq("id", id)
      .eq("business_id", business.id)
      .maybeSingle(),
    supabase
      .from("inventory_movements")
      .select("id, quantity_change, reason, note, created_at")
      .eq("product_id", id)
      .order("created_at", { ascending: false })
      .limit(50),
  ]);
  if (!product) notFound();
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);
  const low = product.stock_quantity <= product.low_stock_threshold;

  return (
    <div className="grid max-w-5xl gap-6">
      <PageHeader
        eyebrow={p.product}
        title={product.name}
        description={product.category ?? undefined}
      />
      {query.created === "1" && <Alert tone="success">{p.created}</Alert>}

      <section aria-label={p.stockSummary} className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm font-semibold text-fg-muted">{p.inStock}</p>
          <p
            className={`mt-1 text-3xl font-semibold tabular-nums ${low ? "text-warning-700" : ""}`}
          >
            {product.stock_quantity}
          </p>
          {low && (
            <p className="mt-1 text-xs text-warning-700">
              {p.atWarning(product.low_stock_threshold)}
            </p>
          )}
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-fg-muted">{p.sellingPrice}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">{money(product.price_cents)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-semibold text-fg-muted">{p.margin}</p>
          <p className="mt-1 text-3xl font-semibold tabular-nums">
            {product.cost_cents != null ? money(product.price_cents - product.cost_cents) : "—"}
          </p>
          {product.cost_cents == null && <p className="mt-1 text-xs text-fg-muted">{p.addCost}</p>}
        </Card>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {canEdit && (
          <Card>
            <CardHeader>
              <CardTitle>{t.common.details}</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductForm product={product} canSetStock={false} />
            </CardContent>
          </Card>
        )}
        <div className="grid content-start gap-6">
          {canStock && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>{p.updateStock}</CardTitle>
                  <CardDescription>{p.updateStockText}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <StockForm productId={product.id} />
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle>{p.history}</CardTitle>
            </CardHeader>
            <CardContent>
              {(movements ?? []).length === 0 ? (
                <p className="text-sm text-fg-muted">{p.noHistory}</p>
              ) : (
                <ul className="divide-y divide-border text-sm">
                  {(movements ?? []).map((m) => (
                    <li key={m.id} className="flex items-start justify-between gap-3 py-2.5">
                      <span>
                        <span className="block font-semibold">
                          {p.reasons[m.reason] ?? m.reason}
                        </span>
                        <span className="block text-fg-muted">
                          {formatDateTime(m.created_at, business.timezone, intl)}
                          {m.note ? ` · ${m.note}` : ""}
                        </span>
                      </span>
                      <span
                        className={`font-semibold tabular-nums ${m.quantity_change > 0 ? "text-success-700" : "text-fg"}`}
                      >
                        {m.quantity_change > 0 ? `+${m.quantity_change}` : m.quantity_change}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
