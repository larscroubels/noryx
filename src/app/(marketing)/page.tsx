import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Globe,
  LifeBuoy,
  MessageCircleQuestion,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tag,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { HeroDemo } from "@/components/marketing/hero-demo";
import { CtaPanel, FeatureCard, SectionHeading } from "@/components/marketing/page-sections";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { SITE_NAV } from "@/lib/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: { absolute: t.marketing.meta.title }, description: t.marketing.meta.description };
}

const BENEFIT_ICONS = [<Globe key="globe" />, <CalendarDays key="calendar" />, <ShieldCheck key="shield" />, <Sparkles key="sparkles" />];
const PAGE_ICONS = {
  forYou: <UsersRound />,
  platform: <CalendarDays />,
  apps: <Smartphone />,
  pricing: <Tag />,
  faq: <MessageCircleQuestion />,
  help: <LifeBuoy />,
};

/** A short introduction; every topic has its own page, linked from here and from the menu. */
export default async function LandingPage() {
  const t = await getT();
  const m = t.marketing;
  const home = t.site.home;
  return (
    <>
      <section className="relative overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60rem_30rem_at_80%_-10%,var(--color-champagne-100),transparent_70%),radial-gradient(40rem_24rem_at_0%_10%,var(--color-rosegold-50),transparent_70%)]"
        />
        <div className="relative container-page grid items-center gap-14 pt-14 pb-20 sm:pt-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:pt-24 lg:pb-28">
          <div>
            <Badge tone="gold" icon={<Clock3 />}>
              {m.hero.badge}
            </Badge>
            <h1 className="mt-6 font-display text-display-lg font-semibold text-fg sm:text-display-xl">
              {m.hero.titleStart} <em className="text-pink-700">{m.hero.titleEmphasis}</em>{" "}
              {m.hero.titleEnd}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-fg-muted">{m.hero.lead}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  {m.hero.primary} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/booking-platform">{m.hero.secondary}</Link>
              </Button>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
              {m.hero.bullets.map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <Check className="size-4 text-success-600" aria-hidden="true" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <HeroDemo labels={m.demo} />
        </div>
      </section>

      <section aria-labelledby="benefits-title" className="border-t border-border bg-surface-subtle py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading id="benefits-title" title={home.benefitsTitle} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {home.benefits.map((benefit, index) => (
              <FeatureCard key={benefit.title} icon={BENEFIT_ICONS[index]} title={benefit.title} text={benefit.text} />
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="explore-title" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading id="explore-title" eyebrow={home.exploreEyebrow} title={home.exploreTitle} />
          {/* Whole cards are links; four shared rows keep icons, titles, texts and links aligned. */}
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SITE_NAV.map((item) => (
              <li key={item.href} className="row-span-4 grid grid-rows-subgrid">
                <Link
                  href={item.href}
                  className="group row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl border border-neutral-200/70 bg-surface p-6 shadow-sm transition-[box-shadow,border-color] hover:border-rosegold-300 hover:shadow-md"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-11 items-center justify-center rounded-lg bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200 [&_svg]:size-5"
                  >
                    {PAGE_ICONS[item.key]}
                  </span>
                  <h3 className="mt-5 text-lg font-semibold">{m.nav[item.key]}</h3>
                  <p className="mt-2 text-fg-muted">{home.explore[item.key]}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-pink-700">
                    {home.readMore}
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaPanel
        title={m.finalCta.title}
        text={m.finalCta.lead}
        primary={{ href: "/signup", label: m.finalCta.primary }}
        secondary={{ href: "/login", label: m.finalCta.secondary }}
      />
    </>
  );
}
