import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

/**
 * Single place where plan features and limits are read. Pages, navigation and
 * actions ask this module; the database enforces the same limits independently
 * (business_has_feature, business_plan_limit and the plan-limit triggers).
 */
export const FEATURES = ["online_booking", "shop", "finance", "team_permissions"] as const;

export type Feature = (typeof FEATURES)[number];

export type Entitlements = {
  planId: string;
  /** Names and descriptions shown in the UI come from `common.plans[planId]`; these are fallbacks. */
  planName: string;
  planDescription: string;
  status: "trialing" | "active" | "past_due" | "cancelled";
  features: ReadonlySet<Feature>;
  maxStaff: number | null;
  maxMembers: number | null;
  billingConnected: boolean;
};

export const getEntitlements = cache(async (businessId: string): Promise<Entitlements> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("business_subscriptions")
    .select(
      "status, billing_provider, plan:plans(id, name, description, features, max_staff, max_members)",
    )
    .eq("business_id", businessId)
    .maybeSingle();
  const active = data && data.status !== "cancelled";
  return {
    planId: data?.plan?.id ?? "none",
    planName: data?.plan?.name ?? "No plan",
    planDescription: data?.plan?.description ?? "",
    status: data?.status ?? "cancelled",
    features: new Set(active ? ((data?.plan?.features ?? []) as Feature[]) : []),
    maxStaff: data?.plan?.max_staff ?? null,
    maxMembers: data?.plan?.max_members ?? null,
    billingConnected: Boolean(data?.billing_provider),
  };
});

export function hasFeature(entitlements: Pick<Entitlements, "features">, feature: Feature) {
  return entitlements.features.has(feature);
}

