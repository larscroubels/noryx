import { useQuery } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";

import { hasPermission, type MemberRole, type Permission } from "@/lib/auth/permissions";
import type { Tables } from "@/types/database";

import { useT } from "~/i18n";
import { Skeleton } from "~/ui/Skeleton";
import { ErrorState } from "~/ui/ErrorState";
import { Screen } from "~/ui/Screen";

import type { Membership } from "./account";
import { useAccount } from "./account-context";
import { supabase } from "./supabase";

export type Workspace = {
  business: Tables<"businesses">;
  role: MemberRole;
  permissions: ReadonlySet<Permission>;
  /** The user's own staff profile in this business, if any. */
  staffId: string | null;
  memberships: Membership[];
  can: (permission: Permission | Permission[]) => boolean;
  switchBusiness: (businessId: string) => void;
};

const WorkspaceContext = createContext<Workspace | null>(null);

/** The website's requireWorkspace(): business row, own permissions and staff profile. */
async function loadWorkspace(businessId: string, userId: string) {
  const [business, permissions, staff] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", businessId).single(),
    supabase.rpc("my_business_permissions", { p_business_id: businessId }),
    supabase
      .from("staff_members")
      .select("id")
      .eq("business_id", businessId)
      .eq("user_id", userId)
      .maybeSingle(),
  ]);
  const failed = business.error ?? permissions.error ?? staff.error;
  if (failed) throw failed;
  if (!business.data) throw new Error("Business not found");
  return {
    business: business.data,
    permissions: new Set((permissions.data ?? []) as Permission[]),
    staffId: staff.data?.id ?? null,
  };
}

export function WorkspaceProvider({
  userId,
  memberships,
  children,
}: {
  userId: string;
  memberships: Membership[];
  children: ReactNode;
}) {
  const { app, setSalonLocale } = useT();
  const { businessId, setBusinessId } = useAccount();
  const membership = memberships.find((m) => m.business.id === businessId) ?? null;

  const query = useQuery({
    queryKey: ["workspace", businessId, userId],
    queryFn: () => loadWorkspace(businessId!, userId),
    enabled: Boolean(businessId),
  });

  useEffect(() => {
    setSalonLocale(query.data?.business.locale ?? null);
    return () => setSalonLocale(null);
  }, [query.data?.business.locale, setSalonLocale]);

  const value = useMemo<Workspace | null>(() => {
    if (!query.data || !membership) return null;
    const { permissions } = query.data;
    return {
      ...query.data,
      role: membership.role,
      memberships,
      can: (p) => (Array.isArray(p) ? p : [p]).some((key) => hasPermission(permissions, key)),
      switchBusiness: setBusinessId,
    };
  }, [query.data, membership, memberships, setBusinessId]);

  if (query.isError) {
    return (
      <Screen scroll={false}>
        <ErrorState
          message={app.common.loadFailed}
          retryLabel={app.common.retry}
          onRetry={() => void query.refetch()}
        />
      </Screen>
    );
  }
  if (!value) return <Skeleton label={app.common.loading} lines={5} />;
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): Workspace {
  const value = useContext(WorkspaceContext);
  if (!value) throw new Error("useWorkspace() must be used inside <WorkspaceProvider>.");
  return value;
}
