import type { MemberRole } from "@/lib/auth/permissions";

import { supabase } from "./supabase";

export type Membership = {
  role: MemberRole;
  business: { id: string; slug: string; name: string; status: string; locale: string };
};

export type ClientLink = {
  business_id: string;
  slug: string;
  name: string;
  logo_path: string | null;
  categories: string[];
  linked_at: string;
  unlinked_at: string | null;
};

export type Account = { memberships: Membership[]; links: ClientLink[] };

/** Active memberships (as the website's getMemberships) and the client's live salon links. */
export async function loadAccount(userId: string): Promise<Account> {
  const [members, links] = await Promise.all([
    supabase
      .from("business_members")
      .select("role, business:businesses(id, slug, name, status, locale)")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at"),
    supabase.rpc("my_client_links"),
  ]);
  if (members.error) throw members.error;
  if (links.error) throw links.error;
  return {
    memberships: (members.data ?? []).flatMap((row) =>
      row.business ? [{ role: row.role, business: row.business }] : [],
    ),
    links: ((links.data ?? []) as unknown as ClientLink[]).filter((l) => l.unlinked_at === null),
  };
}
