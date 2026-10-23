import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";
import { requestTime } from "@/lib/time";

/**
 * Single place where plan features and limits are read. Pages, navigation and
 * actions ask this module; the database enforces the same limits independently
 * (business_has_feature, business_plan_limit and the plan triggers).
 *
 * Plans: Basic (booking system, up to 250 customers) and Pro (everything). New
 * businesses get a 14-day Pro trial; an expired trial continues on Basic.
 */
export const FEATURES = [
  "online_booking",
  "finance",
  "inventory",
  "shop",
  "branding",
  "team_permissions",
  "time_clock",
  "custom_domain",
] as const;

export type Feature = (typeof FEATURES)[number];

export const PLAN_IDS = ["basic", "pro", "ultra"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export type SubscriptionStatus = "trialing" | "active" | "past_due" | "cancelled";

export type Entitlements = {
  /** The plan that applies right now (Basic after an expired trial, "none" when cancelled). */
  planId: string;
  /** The plan on the subscription itself (Pro during a trial). */
  subscribedPlanId: string;
  status: SubscriptionStatus;
  trialEndsAt: string | null;
  /** Whole days left in a running trial; null when not trialing or already ended. */
  trialDaysLeft: number | null;
  trialEnded: boolean;
  features: ReadonlySet<Feature>;
  maxStaff: number | null;
  maxMembers: number | null;
  maxCustomers: number | null;
  billingConnected: boolean;
};

export const getEntitlements = cache(async (businessId: string): Promise<Entitlements> => {
  const supabase = await createClient();
  const [{ data: subscription }, { data: effective }, { data: plans }] = await Promise.all([
    supabase
      .from("business_subscriptions")
      .select("plan_id, status, trial_ends_at, billing_provider")
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase.rpc("current_plan", { p_business_id: businessId }),
    supabase.from("plans").select("id, features, max_staff, max_members, max_customers"),
  ]);
  const plan = plans?.find((p) => p.id === effective);
  const status = subscription?.status ?? "cancelled";
  const trialEndsAt = status === "trialing" ? (subscription?.trial_ends_at ?? null) : null;
  const msLeft = trialEndsAt ? new Date(trialEndsAt).getTime() - requestTime() : null;
  const trialEnded = msLeft !== null && msLeft <= 0;
  return {
    planId: effective ?? "none",
    subscribedPlanId: subscription?.plan_id ?? "none",
    status,
    trialEndsAt,
    trialDaysLeft: msLeft !== null && msLeft > 0 ? Math.ceil(msLeft / 86_400_000) : null,
    trialEnded,
    features: new Set((plan?.features ?? []) as Feature[]),
    maxStaff: plan?.max_staff ?? null,
    maxMembers: plan?.max_members ?? null,
    maxCustomers: plan?.max_customers ?? null,
    billingConnected: Boolean(subscription?.billing_provider),
  };
});

export function hasFeature(entitlements: Pick<Entitlements, "features">, feature: Feature) {
  return entitlements.features.has(feature);
}
