import { ArrowRight, Check, Clock3, Minus, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
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
  const t = await getT();
  const p = t.pricing;
  const plans = [
    { key: "basic" as const, plan: p.plans.basic, highlight: false },
    { key: "pro" as const, plan: p.plans.pro, highlight: true },
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

      <section className="container-page -mt-6 grid gap-6 md:grid-cols-2 lg:mx-auto lg:max-w-5xl">
        {plans.map(({ key, plan, highlight }, index) => (
          <article
            key={key}
            aria-labelledby={`plan-${key}`}
            className={cn(
              "relative flex flex-col rounded-2xl bg-surface p-7 shadow-sm motion-safe:animate-card-in sm:p-8",
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
            <p className="mt-6 text-2xl font-semibold">{p.priceSoon}</p>
            <p className="text-sm text-fg-muted">{p.priceNote}</p>
            <ul className="mt-7 grid flex-1 content-start gap-3 text-sm">
              {"everything" in plan && <li className="font-semibold">{plan.everything}</li>}
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-2.5">
                  <Check className="mt-0.5 size-4 shrink-0 text-success-600" aria-hidden="true" />
                  {feature}
                </li>
              ))}
              {"soon" in plan && (
                <li className="flex flex-wrap items-center gap-2.5 text-fg-muted">
                  <Clock3 className="size-4 shrink-0" aria-hidden="true" />
                  {plan.soon}
                  <Badge tone="neutral">{p.soonBadge}</Badge>
                </li>
              )}
            </ul>
            <Button
              asChild
              size="lg"
              variant={highlight ? "primary" : "secondary"}
              className="mt-8"
            >
              <Link href="/signup">
                {p.cta} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </article>
        ))}
      </section>

      <section
        aria-labelledby="trial-title"
        className="container-page mt-20 lg:mx-auto lg:max-w-5xl"
      >
        <h2 id="trial-title" className="font-display text-display-sm font-semibold">
          {p.trial.title}
        </h2>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {p.trial.steps.map((step, index) => (
            <li
              key={step.title}
              className="rounded-xl bg-surface-warm p-5 ring-1 ring-champagne-200"
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

      <section
        aria-labelledby="compare-title"
        className="container-page mt-20 lg:mx-auto lg:max-w-5xl"
      >
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
                <th scope="col" className="w-20 px-3 py-3 text-center font-semibold sm:w-28 sm:px-5">
                  {p.plans.basic.name}
                </th>
                <th scope="col" className="w-20 px-3 py-3 text-center font-semibold sm:w-28 sm:px-5">
                  {p.plans.pro.name}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {p.compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row" className="px-4 py-3 font-normal sm:px-5">
                    {row.label}
                  </th>
                  <td className="px-3 py-3 text-center sm:px-5">
                    <Cell value={row.basic} yes={p.compare.included} no={p.compare.notIncluded} />
                  </td>
                  <td className="px-3 py-3 text-center sm:px-5">
                    <Cell value={row.pro} yes={p.compare.included} no={p.compare.notIncluded} />
                  </td>
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
