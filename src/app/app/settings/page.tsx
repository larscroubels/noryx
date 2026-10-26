import { Check, Minus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { getI18n, getT } from "@/i18n/server";
import { requirePermission } from "@/lib/auth/session";
import { FEATURES, getEntitlements } from "@/lib/billing/entitlements";
import { removeBrandImage } from "./actions";
import { publicEnv } from "@/lib/env";
import { formatLocalDate } from "@/lib/format";
import { publicAssetUrl } from "@/lib/uploads";
import { createClient } from "@/lib/supabase/server";

import {
  BookingPolicyForm,
  BrandImageForm,
  BusinessProfileForm,
  LocationForm,
  OpeningHoursForm,
  GiftCardSettingsForm,
  ShopSettingsForm,
  ConnectionCodeCard,
} from "./forms";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).settings.metaTitle };
}

const SECTIONS = [
  "profile",
  "branding",
  "location",
  "hours",
  "booking",
  "shop",
  "giftCards",
  "appCode",
  "plan",
] as const;

export default async function SettingsPage() {
  const { business } = await requirePermission("settings.manage");
  const { t, intl } = await getI18n();
  const st = t.settings;
  const supabase = await createClient();
  // Created on first view; clients enter it in the NORYX app.
  const { data: connectionCode } = await supabase.rpc("ensure_connection_code", {
    p_business_id: business.id,
  });
  const { data: location } = await supabase
    .from("locations")
    .select("id, name, address_line1, postal_code, city, phone")
    .eq("business_id", business.id)
    .order("sort_order")
    .limit(1)
    .single();
  const { data: hours } = location
    ? await supabase
        .from("location_hours")
        .select("weekday, start_minute, end_minute")
        .eq("location_id", location.id)
    : { data: [] };
  const { count: onlineProducts } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("business_id", business.id)
    .eq("is_online", true)
    .eq("is_active", true);
  const entitlements = await getEntitlements(business.id);
  const branding = entitlements.features.has("branding");
  const host = new URL(publicEnv.siteUrl).host;

  return (
    <div className="grid gap-8">
      <PageHeader title={st.metaTitle} description={st.bookingPage(`${host}/${business.slug}`)} />
      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label={st.sectionsLabel} className="hidden lg:block">
          <ul className="sticky top-24 grid gap-1 text-sm">
            {SECTIONS.map((section) => (
              <li key={section}>
                <a
                  href={`#${section}`}
                  className="block rounded-md px-3 py-2 font-semibold text-fg-muted hover:bg-surface-subtle hover:text-fg"
                >
                  {st.sections[section]}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="grid max-w-3xl gap-8">
          <Card id="profile" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle>{st.sections.profile}</CardTitle>
                <CardDescription>{st.profile.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BusinessProfileForm business={business} branding={branding} />
            </CardContent>
          </Card>
          <Card id="branding" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle>{st.sections.branding}</CardTitle>
                <CardDescription>{st.branding.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-[12rem_minmax(0,1fr)]">
              {!branding && (
                <Alert tone="info" className="md:col-span-2">
                  {st.branding.proOnly}{" "}
                  <Link href="/pricing" className="font-semibold">
                    {st.plan.comparePlans}
                  </Link>
                </Alert>
              )}
              <BrandImageForm
                disabled={!branding}
                kind="logo"
                currentUrl={publicAssetUrl(publicEnv.supabaseUrl ?? "", business.logo_path)}
                removeAction={removeBrandImage}
              />
              <BrandImageForm
                disabled={!branding}
                kind="cover"
                currentUrl={publicAssetUrl(publicEnv.supabaseUrl ?? "", business.cover_path)}
                removeAction={removeBrandImage}
              />
            </CardContent>
          </Card>
          {location && (
            <>
              <Card id="location" className="scroll-mt-24">
                <CardHeader>
                  <div>
                    <CardTitle>{st.sections.location}</CardTitle>
                    <CardDescription>{st.location.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <LocationForm location={location} />
                </CardContent>
              </Card>
              <Card id="hours" className="scroll-mt-24">
                <CardHeader>
                  <div>
                    <CardTitle>{st.sections.hours}</CardTitle>
                    <CardDescription>{st.hours.description}</CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <OpeningHoursForm locationId={location.id} hours={hours ?? []} />
                </CardContent>
              </Card>
            </>
          )}
          <Card id="booking" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle>{st.sections.booking}</CardTitle>
                <CardDescription>{st.policy.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <BookingPolicyForm business={business} />
            </CardContent>
          </Card>
          <Card id="shop" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle>{st.sections.shop}</CardTitle>
                <CardDescription>{st.shop.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <ShopSettingsForm
                enabled={business.shop_enabled}
                productCount={onlineProducts ?? 0}
                entitled={entitlements.features.has("shop")}
              />
            </CardContent>
          </Card>
          <Card id="giftCards" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle>{st.sections.giftCards}</CardTitle>
                <CardDescription>{t.giftCards.settings.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <GiftCardSettingsForm business={business} />
            </CardContent>
          </Card>
          <Card id="appCode" className="scroll-mt-24">
            <CardHeader>
              <CardTitle>{st.sections.appCode}</CardTitle>
            </CardHeader>
            <CardContent>
              <ConnectionCodeCard code={connectionCode ?? ""} />
            </CardContent>
          </Card>
          <Card id="plan" className="scroll-mt-24">
            <CardHeader>
              <div>
                <CardTitle className="flex flex-wrap items-center gap-2">
                  {t.common.plans[entitlements.planId]?.name ?? t.common.noPlan}
                  <Badge
                    tone={
                      entitlements.status === "past_due"
                        ? "warning"
                        : entitlements.status === "cancelled"
                          ? "neutral"
                          : "gold"
                    }
                  >
                    {st.plan.status[entitlements.status]}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {t.common.plans[entitlements.planId]?.description}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="grid gap-5 text-sm">
              {(entitlements.trialDaysLeft !== null || entitlements.trialEnded) && (
                <Alert tone={entitlements.trialEnded ? "warning" : "info"}>
                  {entitlements.trialDaysLeft !== null && entitlements.trialEndsAt
                    ? st.plan.trialRunning(
                        entitlements.trialDaysLeft,
                        formatLocalDate(
                          entitlements.trialEndsAt.slice(0, 10),
                          { day: "numeric", month: "long" },
                          intl,
                        ),
                      )
                    : st.plan.trialEnded}{" "}
                  {st.plan.afterTrial}
                </Alert>
              )}
              <ul className="grid gap-2 sm:grid-cols-2">
                {FEATURES.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        entitlements.features.has(feature) ? "text-success-600" : "text-fg-disabled"
                      }
                    >
                      {entitlements.features.has(feature) ? (
                        <Check className="size-4" />
                      ) : (
                        <Minus className="size-4" />
                      )}
                    </span>
                    <span className={entitlements.features.has(feature) ? "" : "text-fg-muted"}>
                      {t.common.features[feature]}
                      <span className="sr-only">
                        {entitlements.features.has(feature)
                          ? st.plan.included
                          : st.plan.notIncluded}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
              <p className="text-fg-muted">
                {business.custom_domain && (
                  <>
                    {st.plan.customDomain(business.custom_domain)}
                    <br />
                  </>
                )}
                {st.plan.customers(String(entitlements.maxCustomers ?? st.plan.unlimited))} ·{" "}
                <Link href="/pricing" className="font-semibold text-pink-700 hover:underline">
                  {st.plan.comparePlans}
                </Link>
              </p>
              <p className="rounded-lg bg-surface-subtle p-4 text-fg-muted">
                {entitlements.billingConnected
                  ? st.plan.billingConnected
                  : st.plan.billingNotConnected}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
