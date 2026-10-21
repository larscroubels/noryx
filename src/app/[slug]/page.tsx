import { AtSign, Clock, Globe, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getI18n, getT } from "@/i18n/server";
import { getPublicBusiness, getPublicProducts } from "@/lib/booking/public";
import { publicEnv } from "@/lib/env";
import { publicAssetUrl } from "@/lib/uploads";
import { formatDuration, formatMoney } from "@/lib/format";
import { minutesToTime } from "@/lib/time";

export async function generateMetadata({ params }: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [business, t] = await Promise.all([getPublicBusiness(slug), getT()]);
  if (!business) return { title: t.booking.notFound };
  return {
    title: t.booking.page.metaTitle(business.name),
    description: business.description ?? t.booking.page.metaDescription(business.name),
  };
}

export default async function PublicBusinessPage({ params }: PageProps<"/[slug]">) {
  const { slug } = await params;
  const [business, products, { t, intl }] = await Promise.all([
    getPublicBusiness(slug),
    getPublicProducts(slug),
    getI18n(),
  ]);
  if (!business) notFound();
  const p = t.booking.page;

  const logoUrl = publicAssetUrl(publicEnv.supabaseUrl ?? "", business.logo_path);
  const coverUrl = publicAssetUrl(publicEnv.supabaseUrl ?? "", business.cover_path);
  const accent = business.brand_color ?? "var(--color-rosegold-400)";
  const location = business.locations[0];
  const typeLabel = (t.common.businessTypes as Record<string, string>)[business.business_type];
  const groups = [
    ...business.categories.map((c) => ({
      id: c.id,
      name: c.name,
      items: business.services.filter((s) => s.category_id === c.id),
    })),
    {
      id: "other",
      name: business.categories.length > 0 ? p.other : p.services,
      items: business.services.filter((s) => !s.category_id),
    },
  ].filter((g) => g.items.length > 0);
  const address = location
    ? [location.address_line1, [location.postal_code, location.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : "";
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);

  return (
    <div className="min-h-dvh bg-canvas">
      <div aria-hidden="true" className="h-1" style={{ background: accent }} />
      <header className="border-b border-border bg-surface/90 backdrop-blur-sm">
        <div className="container-page flex h-16 items-center justify-between gap-4">
          <p className="flex min-w-0 items-center gap-3">
            {logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- salon's own upload from Supabase Storage
              <img src={logoUrl} alt="" className="size-9 shrink-0 rounded-md object-contain" />
            )}
            <span className="truncate font-display text-xl font-semibold">{business.name}</span>
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <LanguageSwitcher />
            <Button asChild>
              <Link href={`/${business.slug}/book`}>{p.bookNow}</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="bg-surface-subtle">
        {coverUrl && (
          <div className="container-page pt-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- salon's own upload from Supabase Storage */}
            <img
              src={coverUrl}
              alt=""
              className="aspect-[3/1] w-full rounded-2xl object-cover shadow-sm sm:aspect-[4/1]"
            />
          </div>
        )}
        <div className="container-page grid gap-6 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-2xl">
            {typeLabel && <p className="eyebrow">{typeLabel}</p>}
            <h1 className="mt-3 font-display text-display-md font-semibold sm:text-display-lg">
              {business.name}
            </h1>
            {business.description && (
              <p className="mt-4 text-base text-fg-muted sm:text-lg">{business.description}</p>
            )}
            {address && (
              <p className="mt-5 flex items-start gap-2 text-sm text-fg-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {address}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`/${business.slug}/book`}>{p.bookAppointment}</Link>
            </Button>
            {business.phone && (
              <Button asChild size="lg" variant="secondary">
                <a href={`tel:${business.phone}`}>
                  <Phone aria-hidden="true" /> {p.call}
                </a>
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="container-page grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="grid content-start gap-12">
          <section aria-labelledby="services-heading">
            <h2 id="services-heading" className="font-display text-display-sm font-semibold">
              {p.services}
            </h2>
            {groups.length === 0 ? (
<p className="mt-4 text-fg-muted">{p.noServices}</p>
            ) : (
              <div className="mt-6 grid gap-8">
                {groups.map((group) => (
                  <div key={group.id}>
                    {business.categories.length > 0 && (
                      <h3 className="mb-3 eyebrow">{group.name}</h3>
                    )}
                    <Card>
                      <ul className="divide-y divide-border">
                        {group.items.map((service) => (
                          <li
                            key={service.id}
                            className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:gap-6"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">{service.name}</p>
                              {service.description && (
                                <p className="mt-1 line-clamp-2 text-sm text-fg-muted">
                                  {service.description}
                                </p>
                              )}
                              <p className="mt-1.5 flex items-center gap-1.5 text-sm text-fg-muted">
                                <Clock className="size-3.5" aria-hidden="true" />{" "}
                                {formatDuration(service.duration_minutes, intl)}
                              </p>
                            </div>
                            <div className="flex items-center justify-between gap-4 sm:justify-end">
                              <p className="text-sm font-semibold tabular-nums">
                                {service.promo_price_cents != null ? (
                                  <>
                                    <span className="text-pink-700">
                                      {money(service.promo_price_cents)}
                                    </span>{" "}
                                    <span className="font-normal text-fg-muted line-through">
                                      {money(service.price_cents)}
                                    </span>
                                  </>
                                ) : (
                                  (() => {
                                    const prices = [
                                      service.price_cents,
                                      ...business.staff.flatMap((m) =>
                                        m.services
                                          .filter(
                                            (l) =>
                                              l.service_id === service.id && l.price_cents != null,
                                          )
                                          .map((l) => l.price_cents!),
                                      ),
                                    ];
                                    const min = Math.min(...prices);
                                    return (
                                      <>
                                        {prices.some((p) => p !== min) && (
                                          <span className="font-normal text-fg-muted">{p.from}</span>
                                        )}
                                        {money(min)}
                                      </>
                                    );
                                  })()
                                )}
                              </p>
                              <Button asChild variant="secondary" size="sm">
                                <Link
                                  href={`/${business.slug}/book?service=${service.id}`}
                                  aria-label={p.bookService(service.name)}
                                >
                                  {p.book}
                                </Link>
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                ))}
              </div>
            )}
          </section>

          {products.length > 0 && (
            <section aria-labelledby="shop-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 id="shop-heading" className="font-display text-display-sm font-semibold">
                  {p.shop}
                </h2>
                <Button asChild variant="secondary">
                  <Link href={`/${business.slug}/shop`}>{p.viewProducts}</Link>
                </Button>
              </div>
              <p className="mt-2 text-fg-muted">{p.shopText}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-3">
                {products.slice(0, 3).map((product) => (
                  <li key={product.id}>
                    <Link href={`/${business.slug}/shop`} className="block h-full">
                      <Card className="h-full p-5 transition-shadow hover:shadow-md">
                        <p className="font-semibold">{product.name}</p>
                        <p className="mt-1 text-sm font-semibold text-fg-muted tabular-nums">
                          {money(product.price_cents)}
                        </p>
                      </Card>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {business.staff.length > 0 && (
            <section aria-labelledby="team-heading">
              <h2 id="team-heading" className="font-display text-display-sm font-semibold">
                {p.team}
              </h2>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {business.staff.map((member) => (
                  <li key={member.id}>
                    <Card className="flex h-full gap-4 p-5">
                      <Avatar name={member.display_name} size="lg" />
                      <div className="min-w-0">
                        <p className="font-semibold">{member.display_name}</p>
                        {member.job_title && (
                          <p className="text-sm text-fg-muted">{member.job_title}</p>
                        )}
                        {member.bio && <p className="mt-2 text-sm text-fg-muted">{member.bio}</p>}
                      </div>
                    </Card>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <aside className="grid content-start gap-6">
          {location && location.hours.length > 0 && (
            <Card className="p-5">
              <h2 className="font-semibold">{p.openingHours}</h2>
              <dl className="mt-4 grid gap-2 text-sm">
                {t.common.weekdays.map((label, index) => {
                  const ranges = location.hours.filter((h) => h.weekday === index + 1);
                  return (
                    <div key={label} className="flex justify-between gap-4">
                      <dt className="text-fg-muted first-letter:uppercase">{label}</dt>
                      <dd className="text-right font-semibold tabular-nums">
                        {ranges.length === 0 ? (
                          <span className="font-normal text-fg-muted">{t.common.hours.closed}</span>
                        ) : (
                          ranges
                            .map(
                              (r) =>
                                `${minutesToTime(r.start_minute)}–${minutesToTime(r.end_minute)}`,
                            )
                            .join(", ")
                        )}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </Card>
          )}
          <Card className="grid gap-3 p-5 text-sm">
            <h2 className="font-semibold">{p.contact}</h2>
            {address && (
              <p className="flex items-start gap-2 text-fg-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {address}
              </p>
            )}
            {business.phone && (
              <a
                href={`tel:${business.phone}`}
                className="flex items-center gap-2 text-fg-muted hover:text-fg"
              >
                <Phone className="size-4" aria-hidden="true" /> {business.phone}
              </a>
            )}
            {business.email && (
              <a
                href={`mailto:${business.email}`}
                className="flex items-center gap-2 break-all text-fg-muted hover:text-fg"
              >
                <Mail className="size-4 shrink-0" aria-hidden="true" /> {business.email}
              </a>
            )}
            {business.website_url && (
              <a
                href={business.website_url}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-2 break-all text-fg-muted hover:text-fg"
              >
                <Globe className="size-4 shrink-0" aria-hidden="true" />{" "}
                {business.website_url.replace(/^https?:\/\//, "")}
              </a>
            )}
            {business.instagram_handle && (
              <a
                href={`https://instagram.com/${business.instagram_handle}`}
                rel="noopener noreferrer"
                target="_blank"
                className="flex items-center gap-2 text-fg-muted hover:text-fg"
              >
                <AtSign className="size-4" aria-hidden="true" /> @{business.instagram_handle}
              </a>
            )}
          </Card>
          {business.policy.cancellation_notice_hours > 0 && (
            <p className="px-1 text-sm text-fg-muted">
              {p.cancellation(business.policy.cancellation_notice_hours)}
            </p>
          )}
        </aside>
      </div>

      <footer className="border-t border-border">
        <div className="container-page flex flex-wrap items-center justify-between gap-3 py-6 text-sm text-fg-muted">
          <p>
            © {new Date().getFullYear()} {business.name}
          </p>
          <Link href="/" className="flex items-center gap-2 hover:text-fg">
            {t.common.bookingBy} <Logo variant="wordmark" height={12} />
          </Link>
        </div>
      </footer>
    </div>
  );
}
