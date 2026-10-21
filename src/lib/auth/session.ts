import "server-only";

import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";

import { isSupabaseConfigured } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types/database";

import { hasPermission, type MemberRole, type Permission } from "./permissions";

/**
 * Data access layer for identity and tenancy. Every protected page and server
 * action resolves the user and workspace through these functions; the database
 * enforces the same rules again through row-level security.
 */

export const ACTIVE_BUSINESS_COOKIE = "noryx_business";

export type SessionUser = { id: string; email: string | null; fullName: string | null };

/** The verified signed-in user, or null. Cached for the duration of one request. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims?.sub) return null;
  const claims = data.claims as {
    sub: string;
    email?: string;
    user_metadata?: { full_name?: string };
  };
  return {
    id: claims.sub,
    email: claims.email ?? null,
    fullName: claims.user_metadata?.full_name ?? null,
  };
});

export async function requireUser(nextPath = "/app"): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return user;
}

export type Business = Tables<"businesses">;

export type Membership = {
  role: MemberRole;
  business: Pick<Business, "id" | "slug" | "name" | "status" | "onboarding_completed_at">;
};

/** Active memberships of the signed-in user. */
export const getMemberships = cache(async (): Promise<Membership[]> => {
  const user = await getSessionUser();
  if (!user) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_members")
    .select("role, business:businesses(id, slug, name, status, onboarding_completed_at)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at");
  if (error) throw new Error("Could not load your workspaces.");
  return (data ?? []).flatMap((row) =>
    row.business ? [{ role: row.role, business: row.business }] : [],
  );
});

export const isPlatformAdmin = cache(async () => {
  const user = await getSessionUser();
  if (!user) return false;
  const supabase = await createClient();
  const { data } = await supabase.rpc("is_platform_admin");
  return data === true;
});

export type Workspace = {
  user: SessionUser;
  business: Business;
  role: MemberRole;
  permissions: ReadonlySet<Permission>;
  /** The signed-in user's own bookable staff profile in this business, if any. */
  staffId: string | null;
  memberships: Membership[];
};

/**
 * Resolves the business workspace for the current request. Users without a
 * business are sent to onboarding; the chosen business is remembered in a cookie
 * but always re-validated against the user's memberships.
 */
export const requireWorkspace = cache(async (): Promise<Workspace> => {
  const user = await requireUser();
  const memberships = await getMemberships();
  if (memberships.length === 0) redirect("/onboarding");

  const preferred = (await cookies()).get(ACTIVE_BUSINESS_COOKIE)?.value;
  const membership = memberships.find((m) => m.business.id === preferred) ?? memberships[0]!;

  const supabase = await createClient();
  const [{ data: business }, { data: permissionKeys }, { data: staff }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", membership.business.id).single(),
    supabase.rpc("my_business_permissions", { p_business_id: membership.business.id }),
    supabase
      .from("staff_members")
      .select("id")
      .eq("business_id", membership.business.id)
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);
  if (!business) redirect("/onboarding");

  return {
    user,
    business,
    role: membership.role,
    permissions: new Set((permissionKeys ?? []) as Permission[]),
    staffId: staff?.id ?? null,
    memberships,
  };
});

export function can(workspace: Pick<Workspace, "permissions">, permission: Permission) {
  return hasPermission(workspace.permissions, permission);
}

/** Use at the top of a page: renders a 404 for users without the permission. */
export async function requirePermission(permission: Permission) {
  const workspace = await requireWorkspace();
  if (!can(workspace, permission)) notFound();
  return workspace;
}

/** Use inside server actions: returns the workspace or null when not permitted. */
export async function authorize(permission?: Permission | Permission[]) {
  const user = await getSessionUser();
  if (!user) return null;
  const workspace = await requireWorkspace();
  const needed =
    permission === undefined ? [] : Array.isArray(permission) ? permission : [permission];
  if (needed.length > 0 && !needed.some((key) => can(workspace, key))) return null;
  if (workspace.business.status !== "active" && needed.length > 0) return null;
  return workspace;
}
