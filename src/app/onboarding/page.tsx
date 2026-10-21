import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Card, CardContent } from "@/components/ui/card";
import { getT } from "@/i18n/server";
import { getMemberships, requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_WEEK } from "@/lib/validation/hours";

import {
  BusinessStep,
  HoursStep,
  LocationStep,
  PublishStep,
  ServicesStep,
  TeamStep,
} from "./steps";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).onboarding.metaTitle };
}

export default async function OnboardingPage({ searchParams }: PageProps<"/onboarding">) {
  const user = await requireUser("/onboarding");
  const [params, memberships, t] = await Promise.all([searchParams, getMemberships(), getT()]);
  const STEPS = t.onboarding.steps;
  const pending = memberships.find(
    (m) => m.role === "owner" && !m.business.onboarding_completed_at,
  );
  const creatingAnother = params.new === "1";

  if (!pending && memberships.length > 0 && !creatingAnother) redirect("/app");

  const step = pending && !creatingAnother ? Math.min(Math.max(Number(params.step) || 2, 2), 6) : 1;
  const meta = STEPS[step - 1]!;
  const siteHost = new URL(publicEnv.siteUrl).host;

  let content: React.ReactNode = <BusinessStep siteHost={siteHost} />;
  if (pending && step > 1) {
    const supabase = await createClient();
    const businessId = pending.business.id;
    const [{ data: business }, { data: location }, { count: serviceCount }] = await Promise.all([
      supabase.from("businesses").select("email, slug").eq("id", businessId).single(),
      supabase
        .from("locations")
        .select("id, name, address_line1, postal_code, city, phone")
        .eq("business_id", businessId)
        .order("sort_order")
        .limit(1)
        .single(),
      supabase
        .from("services")
        .select("id", { count: "exact", head: true })
        .eq("business_id", businessId),
    ]);
    if (!location || !business) redirect("/app");

    if (step === 2)
      content = <LocationStep businessId={businessId} location={location} email={business.email} />;
    if (step === 3) {
      const { data: hours } = await supabase
        .from("location_hours")
        .select("weekday, start_minute, end_minute")
        .eq("location_id", location.id);
      content = (
        <HoursStep
          businessId={businessId}
          locationId={location.id}
          hours={hours && hours.length > 0 ? hours : DEFAULT_WEEK}
        />
      );
    }
    if (step === 4)
      content = <ServicesStep businessId={businessId} hasServices={(serviceCount ?? 0) > 0} />;
    if (step === 5)
      content = <TeamStep businessId={businessId} defaultName={user.fullName ?? ""} />;
    if (step === 6)
      content = <PublishStep businessId={businessId} bookingUrl={`${siteHost}/${business.slug}`} />;
  }

  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="container-page flex h-16 items-center justify-between">
        <Link href="/">
          <Logo variant="wordmark" height={22} priority />
        </Link>
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-fg-muted sm:block">
            {t.onboarding.stepOf(step, STEPS.length)}
          </p>
          <LanguageSwitcher />
        </div>
      </header>
      <div className="container-page pb-16">
        <div className="mx-auto max-w-2xl">
          <div
            className="mt-4 mb-8 h-1 overflow-hidden rounded-full bg-champagne-100"
            role="progressbar"
            aria-label={t.onboarding.progress}
            aria-valuetext={t.onboarding.stepOf(step, STEPS.length)}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            aria-valuenow={step}
          >
            <div
              className="h-full rounded-full bg-rosegold-400 transition-[width] duration-300"
              style={{ width: `${(step / STEPS.length) * 100}%` }}
            />
          </div>
          <p className="eyebrow">{pending?.business.name ?? t.onboarding.welcome}</p>
          <h1 className="mt-2 font-display text-display-sm font-semibold sm:text-display-md">
            {meta.title}
          </h1>
          <p className="mt-2 text-fg-muted">{meta.description}</p>
          <Card className="mt-8">
            <CardContent>{content}</CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
