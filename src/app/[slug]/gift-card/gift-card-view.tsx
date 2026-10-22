"use client";

import { Gift, Search } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Field, FieldError } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useIntlLocale, useT } from "@/i18n/client";
import type { GiftCardOffer } from "@/lib/booking/public";
import { cn } from "@/lib/cn";
import { formatDate, formatLocalDate, formatMoney, parseMoneyToCents } from "@/lib/format";
import { GIFT_CARD_TONE } from "@/lib/gift-cards";

import {
  checkGiftCard,
  submitGiftCardOrder,
  type GiftCardOrderResult,
  type GiftCardView,
} from "./actions";

export function GiftCardOrderForm({
  slug,
  offer,
  emailConfigured,
}: {
  slug: string;
  offer: GiftCardOffer;
  emailConfigured: boolean;
}) {
  const t = useT();
  const g = t.giftCards.public;
  const money = (cents: number) => formatMoney(cents, offer.currency, offer.locale);
  const [amount, setAmount] = useState<number | "custom">(offer.amounts[0] ?? "custom");
  const [custom, setCustom] = useState("");
  const [forSomeone, setForSomeone] = useState(true);
  const [result, setResult] = useState<GiftCardOrderResult | null>(null);
  const [pending, startTransition] = useTransition();
  const amountCents = amount === "custom" ? parseMoneyToCents(custom) : amount;
  const errors = result && !result.ok ? result.fieldErrors : undefined;

  if (result?.ok) {
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-100">
          <Gift className="size-6" aria-hidden="true" />
        </div>
        <h2 className="mt-5 font-display text-display-sm font-semibold">
          {g.receivedTitle(result.number)}
        </h2>
        <p className="mt-2 text-fg-muted">
          {g.receivedText(offer.name, money(result.amountCents), result.number)}
        </p>
        {!emailConfigured && (
          <Alert tone="info" className="mt-5">
            {g.noEmail}
          </Alert>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setResult(null)}>
            {g.another}
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/${slug}`}>{t.booking.flow.backTo(offer.name)}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-5 sm:p-6">
      <form
        className="grid gap-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const form = new FormData(event.currentTarget);
          startTransition(async () => {
            setResult(
              await submitGiftCardOrder({
                slug,
                amountCents: amountCents ?? 0,
                buyerName: String(form.get("buyerName") ?? ""),
                buyerEmail: String(form.get("buyerEmail") ?? ""),
                buyerPhone: String(form.get("buyerPhone") ?? ""),
                forSomeone,
                recipientName: forSomeone ? String(form.get("recipientName") ?? "") : "",
                message: String(form.get("message") ?? ""),
                acceptTerms: form.get("acceptTerms") === "on",
              }),
            );
          });
        }}
      >
        {result && !result.ok && <Alert tone="danger">{result.message}</Alert>}

        <fieldset className="grid gap-3">
          <legend className="mb-2 font-semibold">{g.amount}</legend>
          <div className="flex flex-wrap gap-2">
            {offer.amounts.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={amount === value}
                onClick={() => setAmount(value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold tabular-nums transition-colors",
                  amount === value
                    ? "border-pink-700 bg-pink-700 text-white"
                    : "border-border-strong bg-surface hover:border-pink-700",
                )}
              >
                {money(value)}
              </button>
            ))}
            {offer.allow_custom && (
              <button
                type="button"
                aria-pressed={amount === "custom"}
                onClick={() => setAmount("custom")}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  amount === "custom"
                    ? "border-pink-700 bg-pink-700 text-white"
                    : "border-border-strong bg-surface hover:border-pink-700",
                )}
              >
                {g.custom}
              </button>
            )}
          </div>
          {amount === "custom" && (
            <Field
              label={g.custom}
              hint={g.customHint(money(offer.min_cents), money(offer.max_cents))}
              error={errors?.amountCents?.[0]}
              required
            >
              <Input
                value={custom}
                onChange={(event) => setCustom(event.target.value)}
                leading={<span className="text-sm">€</span>}
                inputMode="decimal"
              />
            </Field>
          )}
          {amount !== "custom" && errors?.amountCents?.[0] && (
            <FieldError>{errors.amountCents[0]}</FieldError>
          )}
        </fieldset>

        <fieldset className="grid gap-3">
          <legend className="mb-2 font-semibold">{g.forWhom}</legend>
          <div className="flex flex-wrap gap-2" role="group">
            {[true, false].map((value) => (
              <button
                key={String(value)}
                type="button"
                aria-pressed={forSomeone === value}
                onClick={() => setForSomeone(value)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                  forSomeone === value
                    ? "border-pink-700 bg-pink-700 text-white"
                    : "border-border-strong bg-surface hover:border-pink-700",
                )}
              >
                {value ? g.forSomeone : g.forMe}
              </button>
            ))}
          </div>
          {forSomeone && (
            <Field
              label={t.giftCards.form.recipientName}
              optional
              error={errors?.recipientName?.[0]}
            >
              <Input name="recipientName" autoComplete="off" />
            </Field>
          )}
          <Field
            label={t.giftCards.form.message}
            optional
            hint={t.giftCards.form.messageHint}
            error={errors?.message?.[0]}
          >
            <Textarea name="message" rows={3} maxLength={300} />
          </Field>
        </fieldset>

        <fieldset className="grid gap-4">
          <legend className="mb-2 font-semibold">{g.yourDetails}</legend>
          <Field label={t.common.fields.name} error={errors?.buyerName?.[0]} required>
            <Input name="buyerName" autoComplete="name" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.common.fields.email} error={errors?.buyerEmail?.[0]} required>
              <Input name="buyerEmail" type="email" autoComplete="email" />
            </Field>
            <Field label={t.common.fields.phone} optional error={errors?.buyerPhone?.[0]}>
              <Input name="buyerPhone" type="tel" autoComplete="tel" />
            </Field>
          </div>
        </fieldset>

        <section
          aria-labelledby="gift-conditions"
          className="rounded-lg bg-surface-warm p-4 text-sm"
        >
          <h2 id="gift-conditions" className="font-semibold">
            {g.conditions}
          </h2>
          <ul className="mt-2 grid list-disc gap-1 pl-5 text-fg-muted">
            <li>
              <strong className="text-fg">{g.payAtSalon}.</strong> {g.payAtSalonText}
            </li>
            <li>{offer.validity_months ? g.validFor(offer.validity_months) : g.noExpiry}</li>
            <li>{g.partial}</li>
          </ul>
          {offer.terms && <p className="mt-3 whitespace-pre-line text-fg-muted">{offer.terms}</p>}
        </section>

        <ChoiceRow
          htmlFor="acceptTerms"
          control={<Checkbox id="acceptTerms" name="acceptTerms" value="on" />}
          label={g.accept}
        />
        {errors?.acceptTerms?.[0] && <FieldError>{errors.acceptTerms[0]}</FieldError>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
          <p className="text-sm font-semibold">
            {amountCents ? g.summary(money(amountCents)) : g.amount}
          </p>
          <Button type="submit" loading={pending} disabled={!amountCents}>
            {g.submit}
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function GiftCardBalanceCheck({ slug }: { slug: string }) {
  const t = useT();
  const intl = useIntlLocale();
  const g = t.giftCards;
  const [code, setCode] = useState("");
  const [state, setState] = useState<Awaited<ReturnType<typeof checkGiftCard>> | null>(null);
  const [pending, startTransition] = useTransition();
  const card: GiftCardView | null = state?.ok ? state.card : null;
  const money = (cents: number) =>
    card ? formatMoney(cents, card.currency, card.locale) : String(cents);

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="font-semibold">{g.public.checkTitle}</h2>
      <p className="mt-1 text-sm text-fg-muted">{g.public.checkText}</p>
      <form
        className="mt-4 flex flex-wrap gap-2"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => setState(await checkGiftCard(slug, code)));
        }}
      >
        <label htmlFor="gift-code" className="sr-only">
          {g.redeem.code}
        </label>
        <Input
          id="gift-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          placeholder={g.redeem.codePlaceholder}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 font-mono uppercase"
        />
        <Button type="submit" variant="secondary" loading={pending}>
          <Search aria-hidden="true" /> {g.public.checkSubmit}
        </Button>
      </form>
      <div aria-live="polite">
        {state && !state.ok && (
          <Alert tone="danger" className="mt-4">
            {state.message}
          </Alert>
        )}
        {card && (
          <div className="mt-5 grid gap-4 rounded-xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-fg-muted">
                  {g.number(card.number)} · {g.codeEnding(card.last4)}
                </p>
                <p className="font-display text-display-sm font-semibold tabular-nums">
                  {money(card.balance_cents)}
                </p>
                <p className="text-sm text-fg-muted">{g.public.of(money(card.initial_cents))}</p>
              </div>
              <Badge tone={GIFT_CARD_TONE[card.status]}>{g.status[card.status]}</Badge>
            </div>
            {card.expires_at && (
              <p className="text-sm">
                {g.public.validUntil(formatDate(card.expires_at, undefined, {}, intl))}
              </p>
            )}
            {card.recipient_name && <p className="text-sm font-semibold">{card.recipient_name}</p>}
            {card.message && (
              <p className="rounded-lg bg-surface-warm p-3 text-sm whitespace-pre-line">
                {card.message}
              </p>
            )}
            {card.status === "active" && <p className="text-sm text-fg-muted">{g.public.usable}</p>}
            <div>
              <p className="text-sm font-semibold">{g.public.history}</p>
              <ul className="mt-2 divide-y divide-border text-sm">
                {card.history.map((row, index) => (
                  <li key={index} className="flex justify-between gap-3 py-2">
                    <span>
                      {g.detail.kinds[row.kind]}{" "}
                      <span className="text-fg-muted">
                        · {formatLocalDate(row.created_at.slice(0, 10), undefined, intl)}
                      </span>
                    </span>
                    <span className="font-semibold tabular-nums">
                      {row.amount_cents > 0 ? "+" : "−"}
                      {money(Math.abs(row.amount_cents))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
