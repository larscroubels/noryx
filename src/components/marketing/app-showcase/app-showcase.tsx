import {
  ArrowLeftRight,
  ArrowRight,
  CalendarCheck2,
  History,
  Settings2,
  Smartphone,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Reveal } from "@/components/help/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Dictionary } from "@/i18n/dictionaries";

import { AppWalkthrough } from "./app-walkthrough";
import { CategoryIcon, type AppCategory } from "./category-icons";
import styles from "./app-showcase.module.css";

export type AppShowcaseLabels = Dictionary["appShowcase"];

const BUSINESS_ICONS: AppCategory[] = ["hair", "nails", "beauty"];
const BENEFIT_ICONS = [
  <UserRound key="account" />,
  <CalendarCheck2 key="calendar" />,
  <ArrowLeftRight key="switch" />,
  <Settings2 key="settings" />,
  <History key="history" />,
  <Smartphone key="phone" />,
];

/**
 * "The NORYX App": a presentation of the planned client app. Nothing here is a working
 * feature; the only action is a real link for salons to create their account.
 */
export function AppShowcase({ labels }: { labels: AppShowcaseLabels }) {
  return (
    <section
      id="app"
      aria-labelledby="app-heading"
      className="scroll-mt-20 overflow-hidden border-t border-border py-20 sm:py-24"
    >
      <div className="container-page">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <p className="eyebrow">{labels.eyebrow}</p>
            <h2
              id="app-heading"
              className="mt-3 font-display text-display-md font-semibold sm:text-display-lg"
            >
              {labels.title}
            </h2>
            <p className="mt-5 max-w-xl text-lg text-fg-muted">{labels.lead}</p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge tone="gold" icon={<Smartphone />}>
                {labels.platforms}
              </Badge>
              <span className="text-sm text-fg-muted">{labels.status}</span>
            </div>
          </Reveal>
          <Reveal>
            <ConnectionDiagram labels={labels} />
          </Reveal>
        </div>

        <div className="mt-20 rounded-[2rem] bg-surface-subtle px-5 py-12 ring-1 ring-border sm:px-10 lg:px-14 lg:py-16">
          <Reveal className="max-w-2xl">
            <p className="eyebrow">{labels.storyEyebrow}</p>
            <h3 className="mt-3 font-display text-display-sm font-semibold sm:text-display-md">
              {labels.storyTitle}
            </h3>
          </Reveal>
          <div className="mt-10">
            <AppWalkthrough labels={labels} />
          </div>
        </div>

        <Reveal className="mt-20">
          <h3 className="font-display text-display-sm font-semibold">{labels.benefitsTitle}</h3>
          <ul className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {labels.benefits.map((benefit, index) => (
              <li
                key={benefit.title}
                className="row-span-2 grid grid-cols-[auto_minmax(0,1fr)] grid-rows-subgrid gap-x-4 gap-y-0"
              >
                <span
                  aria-hidden="true"
                  className="row-span-2 flex size-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-700 ring-1 ring-pink-100 [&_svg]:size-5"
                >
                  {BENEFIT_ICONS[index]}
                </span>
                <span className="font-semibold">{benefit.title}</span>
                <span className="mt-1 text-fg-muted">{benefit.text}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="mt-16">
          <div className="flex flex-col gap-6 rounded-2xl bg-surface-warm p-8 ring-1 ring-champagne-200 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-xl">
              <p className="font-display text-display-sm font-semibold">{labels.ctaTitle}</p>
              <p className="mt-2 text-fg-muted">{labels.ctaText}</p>
            </div>
            <Button asChild size="lg" className="shrink-0">
              <Link href="/signup">
                {labels.ctaPrimary} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/** Three businesses, three different codes, one account. The lines draw in on scroll. */
function ConnectionDiagram({ labels }: { labels: AppShowcaseLabels }) {
  return (
    <figure className="relative mx-auto w-full max-w-lg">
      <div
        aria-hidden="true"
        className="absolute -inset-6 rounded-[3rem] bg-gradient-to-br from-pink-50 via-transparent to-champagne-100/80 blur-2xl"
      />
      <ul className="relative grid grid-cols-3 gap-2.5 sm:gap-4">
        {labels.businesses.map((business, index) => (
          <li
            key={business.code}
            className="flex flex-col items-center rounded-2xl bg-surface px-2 py-4 text-center shadow-md ring-1 ring-neutral-200/70 sm:px-3"
          >
            <span
              aria-hidden="true"
              className="flex size-11 items-center justify-center rounded-full bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200"
            >
              <CategoryIcon category={BUSINESS_ICONS[index]!} className="size-6" />
            </span>
            <span className="mt-3 text-xs text-fg-muted">{business.category}</span>
            <span className="text-sm leading-tight font-semibold">{business.name}</span>
            <span className="mt-3 rounded-md bg-surface-subtle px-2 py-1 font-mono text-[11px] font-semibold tracking-wide ring-1 ring-border sm:text-xs">
              <span className="sr-only">{labels.codeLabel}: </span>
              {business.code}
            </span>
          </li>
        ))}
      </ul>
      <svg
        aria-hidden="true"
        viewBox="0 0 300 70"
        preserveAspectRatio="none"
        className="relative block h-16 w-full sm:h-20"
      >
        {[50, 150, 250].map((x) => (
          <path
            key={x}
            d={`M${x} 0 C ${x} 40, 150 30, 150 70`}
            pathLength={100}
            fill="none"
            stroke="var(--color-pink-400)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className={styles.line}
          />
        ))}
      </svg>
      <div className="relative mx-auto flex max-w-xs items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 shadow-lg ring-1 ring-pink-100">
        <Logo variant="symbol" height={40} alt="" />
        <span>
          <span className="block font-semibold">{labels.account.title}</span>
          <span className="text-sm text-fg-muted">{labels.account.text}</span>
        </span>
      </div>
      <figcaption className="relative mt-6 text-center text-sm text-fg-muted">
        {labels.diagramCaption}
      </figcaption>
    </figure>
  );
}
