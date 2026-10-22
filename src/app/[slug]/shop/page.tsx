import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { getT } from "@/i18n/server";
import { getPublicBusiness, getPublicProducts } from "@/lib/booking/public";
import { isEmailDeliveryConfigured } from "@/lib/notifications";

import { ShopView } from "./shop-view";

export async function generateMetadata({ params }: PageProps<"/[slug]/shop">): Promise<Metadata> {
  const { slug } = await params;
  const [business, t] = await Promise.all([getPublicBusiness(slug), getT()]);
  return { title: business ? t.booking.shop.metaTitle(business.name) : t.booking.notFound };
}

export default async function ShopPage({ params }: PageProps<"/[slug]/shop">) {
  const { slug } = await params;
  const [business, products, t] = await Promise.all([
    getPublicBusiness(slug),
    getPublicProducts(slug),
    getT(),
  ]);
  if (!business || products.length === 0) notFound();

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
              {t.booking.shop.clickCollect}
            </span>
            <LanguageSwitcher />
          </div>
        </div>
      </header>
      <main className="container-page py-8 sm:py-12">
        <h1 className="font-display text-display-sm font-semibold sm:text-display-md">
          {t.booking.shop.title}
        </h1>
        <p className="mt-2 mb-8 text-fg-muted">{t.booking.shop.lead(business.name)}</p>
        <ShopView
          slug={business.slug}
          businessName={business.name}
          currency={business.currency}
          locale={business.locale}
          products={products}
          emailConfigured={isEmailDeliveryConfigured()}
        />
      </main>
      <footer className="container-page flex justify-center py-8 text-sm text-fg-muted">
        <Link href="/" className="flex items-center gap-2 hover:text-fg">
          {t.common.poweredBy} <Logo variant="wordmark" height={12} />
        </Link>
      </footer>
    </div>
  );
}
