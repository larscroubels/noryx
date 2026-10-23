import {
  CalendarCheck2,
  CalendarDays,
  ChartNoAxesColumn,
  Check,
  Clock3,
  CreditCard,
  Globe,
  LockKeyhole,
  MessageSquareText,
  Scissors,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { CtaPanel, FeatureCard, PageIntro, SectionHeading } from "@/components/marketing/page-sections";
import { BookingPreview } from "@/components/marketing/previews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.site.platform.metaTitle, description: t.site.platform.metaDescription };
}

const FEATURE_ICONS = [
  <Globe key="globe" />,
  <CalendarDays key="calendar" />,
  <UsersRound key="users" />,
  <Scissors key="scissors" />,
  <UserRound key="user" />,
  <LockKeyhole key="lock" />,
  <ShoppingBag key="bag" />,
  <ChartNoAxesColumn key="chart" />,
  <Clock3 key="clock" />,
];
const TEAM_ICONS = [<UserRound key="user" />, <ShieldCheck key="shield" />, <CalendarCheck2 key="calendar" />, <UsersRound key="users" />];
const ROADMAP_ICONS = [
  <CreditCard key="card" />,
  <MessageSquareText key="message" />,
  <UsersRound key="users" />,
  <Globe key="globe" />,
  <Smartphone key="phone" />,
];

export default async function BookingPlatformPage() {
  const t = await getT();
  const m = t.marketing;
  const p = t.site.platform;
  return (
    <>
      <PageIntro eyebrow={p.eyebrow} title={p.title} lead={p.lead}>
        <Button asChild size="lg">
          <Link href="/signup">{t.site.cta.start}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/pricing">{t.site.cta.pricing}</Link>
        </Button>
      </PageIntro>

      <section aria-labelledby="how-title" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading id="how-title" title={p.howTitle} />
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {p.steps.map((step, index) => (
              <li
                key={step.title}
                className="row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl bg-surface-warm p-6 ring-1 ring-champagne-200"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-full bg-pink-700 text-sm font-semibold text-white"
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-fg-muted">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="booking-title" className="overflow-hidden border-t border-border bg-surface-subtle py-16 sm:py-20">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <BookingPreview labels={m.booking.preview} />
          <div>
            <p className="eyebrow">{m.booking.eyebrow}</p>
            <h2 id="booking-title" className="mt-3 font-display text-display-md font-semibold text-balance">
              {m.booking.title}
            </h2>
            <p className="mt-4 text-lg text-fg-muted">{m.booking.lead}</p>
            <ul className="mt-8 grid gap-4">
              {m.booking.points.map((point) => (
                <li key={point.title} className="flex gap-4">
                  <span
                    aria-hidden="true"
                    className="mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-700"
                  >
                    <Check className="size-3.5" />
                  </span>
                  <span>
                    <span className="block font-semibold">{point.title}</span>
                    <span className="text-fg-muted">{point.text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section aria-labelledby="features-title" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading id="features-title" title={p.featuresTitle} lead={m.features.lead} />
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {m.features.items.map((feature, index) => (
              <FeatureCard key={feature.title} icon={FEATURE_ICONS[index]} title={feature.title} text={feature.text} />
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="manage-title" className="border-t border-border bg-surface-subtle py-16 sm:py-20">
        <div className="container-page grid gap-12 lg:grid-cols-3">
          <SectionHeading id="manage-title" title={p.manageTitle} lead={p.manageLead} />
          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            {m.team.items.map((item, index) => (
              <FeatureCard key={item.title} icon={TEAM_ICONS[index]} title={item.title} text={item.text} />
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="soon-title" className="py-16 sm:py-20">
        <div className="container-page">
          <SectionHeading id="soon-title" eyebrow={p.soonTitle} title={m.roadmap.title} lead={m.roadmap.lead} />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {m.roadmap.items.map((item, index) => (
              <li
                key={item.title}
                className="row-span-4 grid grid-rows-subgrid gap-y-0 rounded-xl border border-dashed border-border-strong bg-surface/70 p-5"
              >
                <span aria-hidden="true" className="text-fg-subtle [&_svg]:size-5">
                  {ROADMAP_ICONS[index]}
                </span>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{item.text}</p>
                <Badge tone="outline" className="mt-4 self-end justify-self-start">
                  {m.roadmap.badge}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaPanel
        title={p.ctaTitle}
        text={p.ctaText}
        primary={{ href: "/signup", label: t.site.cta.start }}
        secondary={{ href: "/apps", label: m.nav.apps }}
      />
    </>
  );
}
