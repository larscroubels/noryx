import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getT } from "@/i18n/server";
import { getGiftCardOffer, getPublicBusiness } from "@/lib/booking/public";
import { isEmailDeliveryConfigured } from "@/lib/notifications";

import { GiftCardBalanceCheck, GiftCardOrderForm } from "./gift-card-view";

export async function generateMetadata({
  params,
}: PageProps<"/[slug]/gift-card">): Promise<Metadata> {
  const { slug } = await params;
  const [offer, business, t] = await Promise.all([
    getGiftCardOffer(slug),
    getPublicBusiness(slug),
    getT(),
  ]);
  const name = offer?.name ?? business?.name;
  return { title: name ? t.giftCards.public.metaTitle(name) : t.booking.notFound };
}

/** Order a gift card (when the salon sells them online) and check a card's balance. */
export default async function GiftCardPage({ params }: PageProps<"/[slug]/gift-card">) {
  const { slug } = await params;
  const [offer, business, t] = await Promise.all([
    getGiftCardOffer(slug),
    getPublicBusiness(slug),
    getT(),
  ]);
  if (!offer && !business) notFound();
  const name = offer?.name ?? business!.name;
  const g = t.giftCards.public;

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <div
        aria-hidden="true"
        className="h-1"
        style={{ background: business?.brand_color ?? "var(--color-rosegold-400)" }}
      />
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <Link
            href={`/${slug}`}
            className="truncate font-display text-xl font-semibold hover:text-pink-700"
          >
            {name}
          </Link>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="container-page grid max-w-5xl gap-8 py-8 sm:py-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div>
          <p className="eyebrow">{g.link}</p>
          <h1 className="mt-2 font-display text-display-sm font-semibold sm:text-display-md">
            {g.title}
          </h1>
          {offer ? (
            <>
              <p className="mt-2 mb-8 text-fg-muted">{g.lead(name)}</p>
              <GiftCardOrderForm
                slug={slug}
                offer={offer}
                emailConfigured={isEmailDeliveryConfigured()}
              />
            </>
          ) : (
            <p className="mt-2 text-fg-muted">{t.giftCards.errors.gift_cards_unavailable}</p>
          )}
        </div>
        <aside className="lg:pt-24">
          <GiftCardBalanceCheck slug={slug} />
        </aside>
      </main>
      <footer className="container-page flex justify-center py-8 text-sm text-fg-muted">
        <Link href="/" className="flex items-center gap-2 hover:text-fg">
          {t.common.poweredBy} <Logo variant="wordmark" height={12} />
        </Link>
      </footer>
    </div>
  );
}
