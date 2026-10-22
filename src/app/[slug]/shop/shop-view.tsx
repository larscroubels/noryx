"use client";

import { Minus, PackageCheck, Plus, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Field, FieldError } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import type { PublicProduct } from "@/lib/booking/public";
import { useT } from "@/i18n/client";
import { formatMoney } from "@/lib/format";

import { submitOrder, type OrderResult } from "./actions";

export function ShopView({
  slug,
  businessName,
  currency,
  locale,
  products,
  emailConfigured,
}: {
  slug: string;
  businessName: string;
  currency: string;
  locale: string;
  products: PublicProduct[];
  emailConfigured: boolean;
}) {
  const t = useT();
  const s = t.booking.shop;
  const money = (cents: number) => formatMoney(cents, currency, locale);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [result, setResult] = useState<OrderResult | null>(null);
  const [pending, startTransition] = useTransition();

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, quantity]) => ({ product: products.find((p) => p.id === id)!, quantity }))
        .filter((line) => line.product && line.quantity > 0),
    [cart, products],
  );
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
  // Display estimate only; the server recalculates the real total from current prices.
  const subtotal = lines.reduce((sum, line) => sum + line.product.price_cents * line.quantity, 0);

  const setQuantity = (product: PublicProduct, quantity: number) =>
    setCart((current) => ({
      ...current,
      [product.id]: Math.max(0, Math.min(quantity, product.max_quantity)),
    }));

  if (result?.ok) {
    return (
      <Card className="mx-auto max-w-xl p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-100">
          <PackageCheck className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-display text-display-sm font-semibold">
          {s.received(result.orderNumber)}
        </h2>
        <p className="mt-2 text-fg-muted">
          {s.receivedText(businessName, money(result.totalCents))}
        </p>
        {!emailConfigured && (
          <Alert tone="info" className="mt-5">
            {s.noEmail}
          </Alert>
        )}
        <Button asChild variant="secondary" className="mt-6">
          <Link href={`/${slug}`}>{t.booking.flow.backTo(businessName)}</Link>
        </Button>
      </Card>
    );
  }

  if (products.length === 0) {
    return <p className="rounded-xl bg-surface p-8 text-center text-fg-muted">{s.none}</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <ul className="grid content-start gap-4 sm:grid-cols-2">
        {products.map((product) => {
          const quantity = cart[product.id] ?? 0;
          return (
            <li key={product.id}>
              <Card className="flex h-full flex-col p-5">
                {product.category && <p className="eyebrow">{product.category}</p>}
                <h2 className="mt-1 font-semibold">{product.name}</h2>
                {product.description && (
                  <p className="mt-1 line-clamp-3 text-sm text-fg-muted">{product.description}</p>
                )}
                <div className="mt-auto flex items-center justify-between gap-3 pt-5">
                  <span className="font-semibold tabular-nums">{money(product.price_cents)}</span>
                  {!product.in_stock ? (
                    <Badge>{s.outOfStock}</Badge>
                  ) : quantity === 0 ? (
                    <Button size="sm" variant="secondary" onClick={() => setQuantity(product, 1)}>
                      <Plus aria-hidden="true" /> {t.common.add}
                    </Button>
                  ) : (
                    <div
                      className="flex items-center gap-1"
                      role="group"
                      aria-label={s.quantityOf(product.name)}
                    >
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={s.removeOne}
                        onClick={() => setQuantity(product, quantity - 1)}
                      >
                        <Minus aria-hidden="true" />
                      </Button>
                      <span
                        className="w-8 text-center font-semibold tabular-nums"
                        aria-live="polite"
                      >
                        {quantity}
                      </span>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        aria-label={s.addOne}
                        disabled={quantity >= product.max_quantity}
                        onClick={() => setQuantity(product, quantity + 1)}
                      >
                        <Plus aria-hidden="true" />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <aside className="lg:sticky lg:top-6 lg:self-start">
        <Card className="p-5">
          <h2 className="flex items-center gap-2 font-semibold">
            <ShoppingBag className="size-4 text-fg-muted" aria-hidden="true" /> {s.yourOrder}
          </h2>
          {lines.length === 0 ? (
            <p className="mt-3 text-sm text-fg-muted">{s.emptyCart}</p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-border text-sm">
                {lines.map((line) => (
                  <li key={line.product.id} className="flex justify-between gap-3 py-2">
                    <span>
                      {line.quantity} × {line.product.name}
                    </span>
                    <span className="font-semibold tabular-nums">
                      {money(line.product.price_cents * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 flex justify-between border-t border-border pt-3 font-semibold">
                <span>{t.common.fields.total}</span>
                <span className="tabular-nums">{money(subtotal)}</span>
              </p>
              <p className="mt-1 text-xs text-fg-muted">{s.pickupNote}</p>
              {!checkout && (
                <Button className="mt-4 w-full" onClick={() => setCheckout(true)}>
                  {s.continue(itemCount)}
                </Button>
              )}
            </>
          )}

          {checkout && lines.length > 0 && (
            <form
              className="mt-5 grid gap-4 border-t border-border pt-5"
              noValidate
              action={(formData) =>
                startTransition(async () => {
                  setResult(
                    await submitOrder({
                      slug,
                      items: lines.map((line) => ({
                        productId: line.product.id,
                        quantity: line.quantity,
                      })),
                      firstName: String(formData.get("firstName") ?? ""),
                      lastName: String(formData.get("lastName") ?? ""),
                      email: String(formData.get("email") ?? ""),
                      phone: String(formData.get("phone") ?? ""),
                      note: String(formData.get("note") ?? ""),
                      acceptTerms: formData.get("acceptTerms") === "on",
                    }),
                  );
                })
              }
            >
              {result && !result.ok && <Alert tone="danger">{result.message}</Alert>}
              <Field
                label={t.common.fields.firstName}
                error={!result?.ok ? result?.fieldErrors?.firstName?.[0] : undefined}
                required
              >
                <Input name="firstName" autoComplete="given-name" />
              </Field>
              <Field
                label={t.common.fields.lastName}
                error={!result?.ok ? result?.fieldErrors?.lastName?.[0] : undefined}
                required
              >
                <Input name="lastName" autoComplete="family-name" />
              </Field>
              <Field
                label={t.common.fields.email}
                error={!result?.ok ? result?.fieldErrors?.email?.[0] : undefined}
                required
              >
                <Input name="email" type="email" autoComplete="email" />
              </Field>
              <Field
                label={t.common.fields.phone}
                error={!result?.ok ? result?.fieldErrors?.phone?.[0] : undefined}
                required
              >
                <Input name="phone" type="tel" autoComplete="tel" />
              </Field>
              <Field label={t.staff.timeOff.note} optional>
                <Textarea name="note" rows={2} />
              </Field>
              <ChoiceRow
                htmlFor="acceptTerms"
                control={<Checkbox id="acceptTerms" name="acceptTerms" value="on" />}
                label={s.accept}
                description={s.acceptHint(businessName)}
              />
              {!result?.ok && result?.fieldErrors?.acceptTerms?.[0] && (
                <FieldError>{result.fieldErrors.acceptTerms[0]}</FieldError>
              )}
              <Button type="submit" loading={pending}>
                {s.submit}
              </Button>
            </form>
          )}
        </Card>
      </aside>
    </div>
  );
}
