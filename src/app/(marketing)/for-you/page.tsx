import {
  ArrowRight,
  Brush,
  Crown,
  Eye,
  Hand,
  HeartHandshake,
  Scissors,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.audience.metaTitle, description: t.audience.metaDescription };
}

const SEGMENT_ICONS = [
  <Scissors key="hair" />,
  <Brush key="barber" />,
  <Sparkles key="beauty" />,
  <Hand key="nails" />,
  <Eye key="lashes" />,
  <HeartHandshake key="skin" />,
  <UserRound key="solo" />,
  <UsersRound key="team" />,
];
const ROLE_ICONS = [<Crown key="owner" />, <UsersRound key="team" />, <UserRound key="client" />];

export default async function ForYouPage() {
  const t = await getT();
  const a = t.audience;
  return (
    <>
      <section className="bg-surface-subtle">
        <div className="container-page py-14 sm:py-20">
          <div className="max-w-3xl">
            <p className="eyebrow">{a.eyebrow}</p>
            <h1 className="mt-3 font-display text-display-md font-semibold sm:text-display-lg">{a.title}</h1>
            <p className="mt-4 text-fg-muted sm:text-lg">{a.lead}</p>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        {/* Each card spans three shared rows, so titles and texts line up across a row. */}
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {a.segments.map((segment, index) => (
            <li
              key={segment.title}
              className="row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl border border-neutral-200/70 bg-surface p-6 shadow-sm motion-safe:animate-card-in"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-lg bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200 [&_svg]:size-5"
              >
                {SEGMENT_ICONS[index]}
              </span>
              <h2 className="mt-5 text-lg font-semibold">{segment.title}</h2>
              <p className="mt-2 text-fg-muted">{segment.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-border bg-surface-subtle py-16 sm:py-20">
        <div className="container-page">
          <h2 className="max-w-2xl font-display text-display-md font-semibold">{a.rolesTitle}</h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {a.roles.map((role, index) => (
              <li
                key={role.title}
                className="row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl bg-surface p-6 shadow-sm ring-1 ring-neutral-200/70"
              >
                <span aria-hidden="true" className="text-rosegold-700 [&_svg]:size-5">
                  {ROLE_ICONS[index]}
                </span>
                <h3 className="mt-4 font-semibold">{role.title}</h3>
                <p className="mt-2 text-fg-muted">{role.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="container-page">
          <div className="rounded-2xl bg-surface-warm px-6 py-14 text-center ring-1 ring-champagne-200 sm:px-12">
            <Logo variant="symbol" height={48} alt="" className="mx-auto" />
            <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-md font-semibold">{a.ctaTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-fg-muted sm:text-lg">{a.ctaText}</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild size="lg">
                <Link href="/signup">
                  {a.cta} <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/pricing">{a.pricingLink}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
