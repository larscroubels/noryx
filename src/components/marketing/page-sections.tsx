import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

/** Building blocks shared by the website's pages, so every page has the same rhythm. */

export function PageIntro({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  /** Buttons under the lead. */
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface-subtle">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(48rem_22rem_at_90%_-20%,var(--color-champagne-100),transparent_70%)]"
      />
      <div className="relative container-page py-14 sm:py-20">
        <div className="max-w-3xl">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-3 font-display text-display-md font-semibold text-balance sm:text-display-lg">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-fg-muted sm:text-lg">{lead}</p>
          {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id} className={cn("font-display text-display-md font-semibold text-balance", eyebrow && "mt-3")}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg text-fg-muted">{lead}</p>}
    </div>
  );
}

/**
 * A card in a grid: icon, title and text. It spans three shared rows (subgrid), so
 * titles and texts line up across a row even when a title wraps.
 */
export function FeatureCard({
  icon,
  title,
  text,
  headingLevel = "h3",
  className,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}) {
  const Heading = headingLevel;
  return (
    <li
      className={cn(
        "row-span-3 grid grid-rows-subgrid gap-y-0 rounded-xl border border-neutral-200/70 bg-surface p-6 shadow-sm",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex size-11 items-center justify-center rounded-lg bg-champagne-50 text-rosegold-700 ring-1 ring-champagne-200 [&_svg]:size-5"
      >
        {icon}
      </span>
      <Heading className="mt-5 text-lg font-semibold">{title}</Heading>
      <p className="mt-2 text-fg-muted">{text}</p>
    </li>
  );
}

type CtaLink = { href: string; label: string };

export function CtaPanel({
  title,
  text,
  primary,
  secondary,
}: {
  title: string;
  text: string;
  primary: CtaLink;
  secondary?: CtaLink;
}) {
  return (
    <section className="py-16 sm:py-20">
      <div className="container-page">
        <div className="rounded-2xl bg-surface-warm px-6 py-14 text-center ring-1 ring-champagne-200 sm:px-12">
          <Logo variant="symbol" height={48} alt="" className="mx-auto" />
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-display-md font-semibold text-balance">
            {title}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted sm:text-lg">{text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href={primary.href}>
                {primary.label} <ArrowRight aria-hidden="true" />
              </Link>
            </Button>
            {secondary && (
              <Button asChild size="lg" variant="secondary">
                <Link href={secondary.href}>{secondary.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
