import {
  ArrowRight,
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

import { Logo } from "@/components/brand/logo";
import { HeroDemo } from "@/components/marketing/hero-demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: { absolute: t.marketing.meta.title }, description: t.marketing.meta.description };
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
];
const TEAM_ICONS = [
  <UserRound key="user" />,
  <ShieldCheck key="shield" />,
  <CalendarCheck2 key="calendar" />,
  <UsersRound key="users" />,
];
const ROADMAP_ICONS = [
  <CreditCard key="card" />,
  <MessageSquareText key="message" />,
  <UsersRound key="users" />,
  <Globe key="globe" />,
  <Smartphone key="phone" />,
];

export default async function LandingPage() {
  const t = await getT();
  const m = t.marketing;
  return (
    <>
      {/* Hero */}
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
                <a href="#features">{m.hero.secondary}</a>
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

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-20 border-t border-border bg-surface-subtle py-20 sm:py-24"
      >
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{m.features.eyebrow}</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">{m.features.title}</h2>
            <p className="mt-4 text-lg text-fg-muted">{m.features.lead}</p>
          </div>
          <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {m.features.items.map((feature, index) => (
              <li
                key={feature.title}
                className="rounded-xl border border-neutral-200/70 bg-surface p-6 shadow-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex size-11 items-center justify-center rounded-lg bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200 [&_svg]:size-5"
                >
                  {FEATURE_ICONS[index]}
                </span>
                <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-fg-muted">{feature.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Booking spotlight */}
      <section id="booking" className="scroll-mt-20 overflow-hidden py-20 sm:py-24">
        <div className="container-page grid items-center gap-14 lg:grid-cols-2">
          <BookingPreview labels={m.booking.preview} />
          <div>
            <p className="eyebrow">{m.booking.eyebrow}</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">{m.booking.title}</h2>
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

      {/* Team & privacy */}
      <section className="border-t border-border bg-surface-subtle py-20 sm:py-24">
        <div className="container-page grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="eyebrow">{m.team.eyebrow}</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">{m.team.title}</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2">
            {m.team.items.map((item, index) => (
              <div
                key={item.title}
                className="rounded-xl bg-surface p-6 shadow-sm ring-1 ring-neutral-200/70"
              >
                <span aria-hidden="true" className="text-rosegold-700 [&_svg]:size-5">
                  {TEAM_ICONS[index]}
                </span>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-fg-muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section id="for-you" className="scroll-mt-20 py-20 sm:py-24">
        <div className="container-page text-center">
          <p className="eyebrow">{m.forYou.eyebrow}</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-display-md font-semibold">
            {m.forYou.title}
          </h2>
          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-3">
            {m.forYou.types.map((type) => (
              <li
                key={type}
                className="rounded-full border border-champagne-200 bg-surface-warm px-5 py-2.5 text-sm font-semibold text-fg"
              >
                {type}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-t border-border bg-surface-subtle py-20 sm:py-24">
        <div className="container-page">
          <div className="max-w-2xl">
            <p className="eyebrow">{m.roadmap.eyebrow}</p>
            <h2 className="mt-3 font-display text-display-md font-semibold">{m.roadmap.title}</h2>
            <p className="mt-4 text-lg text-fg-muted">{m.roadmap.lead}</p>
          </div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {m.roadmap.items.map((item, index) => (
              <li
                key={item.title}
                className="rounded-xl border border-dashed border-border-strong bg-surface/70 p-5"
              >
                <span aria-hidden="true" className="text-fg-subtle [&_svg]:size-5">
                  {ROADMAP_ICONS[index]}
                </span>
                <h3 className="mt-3 font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-fg-muted">{item.text}</p>
                <Badge tone="outline" className="mt-4">
                  {m.roadmap.badge}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-20 sm:pb-24">
        <div className="container-page">
          <div className="relative overflow-hidden rounded-2xl bg-surface-warm px-6 py-14 text-center ring-1 ring-champagne-200 sm:px-12 sm:py-16">
            <Logo variant="symbol" height={56} alt="" className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-md font-semibold">
              {m.finalCta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-fg-muted">{m.finalCta.lead}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">{m.finalCta.primary}</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/login">{m.finalCta.secondary}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function BookingPreview({
  labels,
}: {
  labels: { title: string; days: [string, string][]; morning: string; confirm: string };
}) {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-rosegold-100/70 via-transparent to-champagne-100/80 blur-2xl" />
      <div className="relative rounded-[2rem] bg-surface p-5 shadow-xl ring-1 ring-neutral-200/80">
        <div className="h-1 rounded-full bg-rosegold-400" />
        <p className="mt-5 font-display text-2xl font-semibold">{labels.title}</p>
        <div className="mt-4 flex gap-2">
          {labels.days.map(([day, num], i) => (
            <div
              key={day}
              className={`flex w-14 flex-col items-center rounded-lg border py-2 ${i === 1 ? "border-pink-700 bg-pink-700 text-white" : "border-border"}`}
            >
              <span className="text-[0.65rem] font-semibold uppercase">{day}</span>
              <span className="text-base font-semibold">{num}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold text-fg-muted">{labels.morning}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["09:00", "09:30", "10:15", "10:45", "11:00", "11:30"].map((time, i) => (
            <span
              key={time}
              className={`flex h-10 items-center justify-center rounded-lg border text-sm font-semibold ${i === 2 ? "border-pink-700 bg-pink-700 text-white" : "border-border"}`}
            >
              {time}
            </span>
          ))}
        </div>
        <div className="mt-5 flex h-11 items-center justify-center rounded-md bg-pink-700 text-sm font-semibold text-white">
          {labels.confirm}
        </div>
      </div>
    </div>
  );
}
