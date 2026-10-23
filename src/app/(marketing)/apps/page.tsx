import { Check, MonitorSmartphone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AppShowcase } from "@/components/marketing/app-showcase/app-showcase";
import { CtaPanel, PageIntro } from "@/components/marketing/page-sections";
import { BookingPreview, WorkspacePreview } from "@/components/marketing/previews";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return { title: t.site.apps.metaTitle, description: t.site.apps.metaDescription };
}

export default async function AppsPage() {
  const t = await getT();
  const m = t.marketing;
  const a = t.site.apps;
  const sides = [
    { key: "clients", copy: a.clients, preview: <BookingPreview labels={m.booking.preview} /> },
    { key: "business", copy: a.business, preview: <WorkspacePreview labels={m.demo} /> },
  ] as const;
  return (
    <>
      <PageIntro eyebrow={a.eyebrow} title={a.title} lead={a.lead}>
        <Button asChild size="lg">
          <Link href="/signup">{t.site.cta.start}</Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/booking-platform">{m.nav.platform}</Link>
        </Button>
      </PageIntro>

      {/* The two sides share their rows (subgrid), so headings and lists start at the same height. */}
      <section className="py-16 sm:py-20">
        <div className="container-page grid gap-6 lg:grid-cols-2">
          {sides.map(({ key, copy, preview }) => (
            <article
              key={key}
              aria-labelledby={`side-${key}`}
              className="row-span-5 grid grid-rows-subgrid gap-y-0 rounded-2xl bg-surface p-6 shadow-sm ring-1 ring-border sm:p-8"
            >
              <div className="flex items-center justify-center rounded-xl bg-surface-subtle px-4 py-10 ring-1 ring-border">
                {preview}
              </div>
              <p className="mt-8 eyebrow">{copy.eyebrow}</p>
              <h2 id={`side-${key}`} className="mt-2 font-display text-display-sm font-semibold">
                {copy.title}
              </h2>
              <p className="mt-3 text-fg-muted">{copy.lead}</p>
              <ul className="mt-6 grid content-start gap-3">
                {copy.points.map((point) => (
                  <li key={point} className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-pink-50 text-pink-700"
                    >
                      <Check className="size-3" />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="container-page mt-6">
          <p className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-warm px-5 py-4 text-sm ring-1 ring-champagne-200">
            <MonitorSmartphone className="size-5 shrink-0 text-rosegold-700" aria-hidden="true" />
            <span className="min-w-0 flex-1">{a.webNote}</span>
            <Badge tone="outline">{m.roadmap.badge}</Badge>
          </p>
        </div>
      </section>

      <AppShowcase labels={t.appShowcase} />

      <CtaPanel
        title={a.ctaTitle}
        text={a.ctaText}
        primary={{ href: "/signup", label: t.site.cta.start }}
        secondary={{ href: "/pricing", label: t.site.cta.pricing }}
      />
    </>
  );
}
