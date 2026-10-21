import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getT } from "@/i18n/server";
import { getPublicBusiness } from "@/lib/booking/public";
import { isEmailDeliveryConfigured } from "@/lib/notifications";

import { BookingFlow } from "./booking-flow";

export async function generateMetadata({ params }: PageProps<"/[slug]/book">): Promise<Metadata> {
  const { slug } = await params;
  const [business, t] = await Promise.all([getPublicBusiness(slug), getT()]);
  return {
    title: business ? t.booking.flow.metaTitle(business.name) : t.booking.notFound,
    robots: { index: false },
  };
}

export default async function BookPage({ params, searchParams }: PageProps<"/[slug]/book">) {
  const { slug } = await params;
  const query = await searchParams;
  const [business, t] = await Promise.all([getPublicBusiness(slug), getT()]);
  if (!business) notFound();

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <div
        aria-hidden="true"
        className="h-1"
        style={{ background: business.brand_color ?? "var(--color-rosegold-400)" }}
      />
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            href={`/${business.slug}`}
            className="truncate font-display text-xl font-semibold hover:text-pink-700"
          >
            {business.name}
          </Link>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-sm text-fg-muted sm:block">
              {t.booking.flow.onlineBooking}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="container-page py-8 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <BookingFlow
            business={business}
            initialServiceId={typeof query.service === "string" ? query.service : undefined}
            emailConfigured={isEmailDeliveryConfigured()}
          />
        </div>
      </main>
      <footer className="container-page flex justify-center py-8 text-sm text-fg-muted">
        <Link href="/" className="flex items-center gap-2 hover:text-fg">
          {t.common.bookingBy} <Logo variant="wordmark" height={12} />
        </Link>
      </footer>
    </div>
  );
}
