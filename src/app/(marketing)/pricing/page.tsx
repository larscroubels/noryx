import { ArrowRight, Check, Clock3, Mail, Minus, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getI18n, getT } from "@/i18n/server";
import {
  formatWholeEuros,
  NEWSLETTER_MONTHLY_CENTS,
  ULTRA_SETUP_FEE_CENTS,
} from "@/lib/billing/pricing";
import { cn } from "@/lib/cn";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.pricing.metaTitle, description: t.pricing.metaDescription };
}

function Cell({ value, yes, no }: { value: boolean | string; yes: string; no: string }) {
  if (typeof value === "string") return <span className="font-semibold">{value}</span>;
  return value ? (
    <span className="inline-flex text-success-600">
      <Check className="size-5" aria-hidden="true" />
      <span className="sr-only">{yes}</span>
    </span>
  ) : (
    <span className="inline-flex text-fg-disabled">
      <Minus className="size-5" aria-hidden="true" />
      <span className="sr-only">{no}</span>
    </span>
  );
}

export default async function PricingPage() {
  const { t, intl } = await getI18n();
  const p = t.pricing;
  const euros = (cents: number) => formatWholeEuros(cents, intl);
  const plans = [
    { key: "basic" as const, highlight: false },
    { key: "pro" as const, highlight: true },
    { key: "ultra" as const, highlight: false },
  ];

  return (
    <div className="pb-20 sm:pb-24">
      <section className="bg-surface-subtle">
        <div className="container-page py-14 text-center sm:py-20">
          <p className="eyebrow">{p.eyebrow}</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-display text-display-md font-semibold sm:text-display-lg">
            {p.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-fg-muted sm:text-lg">{p.lead}</p>
        </div>
      </section>

      {/* Cards share their rows (subgrid), so names, prices, lists and buttons line up across plans. */}
      <section className="container-page -mt-6 grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-6xl lg:grid-cols-3">
        {plans.map(({ key, highlight }, index) => {
          const plan = p.plans[key];
          return (
            <article
              key={key}
              aria-labelledby={`plan-${key}`}
              className={cn(
                "relative row-span-7 grid grid-rows-subgrid gap-y-0 rounded-2xl bg-surface p-7 shadow-sm motion-safe:animate-card-in sm:p-8",
                highlight ? "ring-2 ring-pink-700" : "ring-1 ring-border",
              )}
              style={{ animationDelay: `${index * 90}ms` }}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id={`plan-${key}`} className="font-display text-display-sm font-semibold">
                  {plan.name}
                </h2>
                {highlight && (
                  <Badge tone="brand" icon={<Sparkles />}>
                    {p.trialBadge}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-fg-muted">{plan.tagline}</p>
              <div className="mt-6">
                <p className="text-2xl font-semibold">{p.priceSoon}</p>
                <p className="text-sm text-fg-muted">{p.priceNote}</p>
                {"setupFee" in plan && (
                  <p className="mt-2 text-sm font-semibold text-pink-700">
                    {plan.setupFee(euros(ULTRA_SETUP_FEE_CENTS))}
                  </p>
                )}
              </div>
              <p className="mt-7 text-sm font-semibold">{"everything" in plan ? plan.everything : ""}</p>
              <ul className="mt-3 grid content-start gap-3 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2.5">
                    <Check className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-5 text-sm text-fg-muted">
                {"soon" in plan && (
                  <p className="flex flex-wrap items-center gap-2.5">
                    <Clock3 className="size-4 shrink-0" aria-hidden="true" />
                    {plan.soon}
                    <Badge tone="neutral">{p.soonBadge}</Badge>
                  </p>
                )}
                {"setupNote" in plan && <p>{plan.setupNote}</p>}
              </div>
              <Button
                asChild
                size="lg"
                variant={highlight ? "primary" : "secondary"}
                className="mt-8 self-end"
              >
                <Link href="/signup">
                  {p.cta} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
            </article>
          );
        })}
      </section>

      <section aria-labelledby="extras-title" className="container-page mt-16 lg:mx-auto lg:max-w-6xl">
        <h2 id="extras-title" className="font-display text-display-sm font-semibold">
          {p.addOns.title}
        </h2>
        <p className="mt-1 text-fg-muted">{p.addOns.lead}</p>
        <div className="mt-6 flex flex-col gap-4 rounded-2xl bg-surface p-6 ring-1 ring-border sm:flex-row sm:items-center sm:p-7">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700 ring-1 ring-pink-100"
          >
            <Mail className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex flex-wrap items-center gap-2 font-semibold">
              {p.addOns.newsletter.name}
              <Badge tone="neutral">{p.soonBadge}</Badge>
            </p>
            <p className="mt-1 text-sm text-fg-muted">{p.addOns.newsletter.text}</p>
          </div>
          <p className="text-lg font-semibold whitespace-nowrap">
            {p.addOns.newsletter.price(euros(NEWSLETTER_MONTHLY_CENTS))}
          </p>
        </div>
      </section>

      <section aria-labelledby="trial-title" className="container-page mt-20 lg:mx-auto lg:max-w-6xl">
        <h2 id="trial-title" className="font-display text-display-sm font-semibold">
          {p.trial.title}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {p.trial.steps.map((step, index) => (
            <li
              key={step.title}
              className="row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl bg-surface-warm p-5 ring-1 ring-champagne-200"
            >
              <span
                aria-hidden="true"
                className="flex size-8 items-center justify-center rounded-full bg-pink-700 text-sm font-semibold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 font-semibold">{step.title}</h3>
              <p className="mt-1 text-sm text-fg-muted">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-fg-muted">{p.billingNote}</p>
      </section>

      <section aria-labelledby="compare-title" className="container-page mt-20 lg:mx-auto lg:max-w-6xl">
        <h2 id="compare-title" className="font-display text-display-sm font-semibold">
          {p.compare.title}
        </h2>
        <div className="mt-6 overflow-hidden rounded-xl ring-1 ring-border">
          <table className="w-full bg-surface text-left text-sm">
            <thead className="bg-surface-subtle">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold sm:px-5">
                  {p.compare.feature}
                </th>
                {plans.map(({ key }) => (
                  <th key={key} scope="col" className="w-[4.5rem] px-2 py-3 text-center font-semibold sm:w-28 sm:px-5">
                    {p.plans[key].name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {p.compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-4 py-3 font-normal sm:px-5">
                    {row.label}
                  </th>
                  {plans.map(({ key }) => (
                    <td key={key} className="px-2 py-3 text-center sm:px-5">
                      <Cell value={row[key]} yes={p.compare.included} no={p.compare.notIncluded} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-center text-fg-muted">
          {p.questions}{" "}
          <Link href="/faq" className="font-semibold text-pink-700 hover:underline">
            {p.faqLink}
          </Link>
        </p>
      </section>
    </div>
  );
}
