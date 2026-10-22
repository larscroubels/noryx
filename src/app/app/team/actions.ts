"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { failure, formToObject, success, validationFailure, type ActionState } from "@/lib/actions";
import { ALL_PERMISSIONS, ROLE_PERMISSIONS, type Permission } from "@/lib/auth/permissions";
import type { Dictionary } from "@/i18n/dictionaries";
import { getT } from "@/i18n/server";
import { authorize } from "@/lib/auth/session";
import { getEntitlements, hasFeature } from "@/lib/billing/entitlements";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { rules } from "@/lib/validation/common";

export type InviteState = ActionState & { inviteUrl?: string };

const inviteSchema = (t: Dictionary) =>
  z.object({
    email: rules(t).email,
    role: z.enum(["owner", "manager", "staff"]),
    staffId: z
      .string()
      .trim()
      .transform((value) => value || null)
      .pipe(z.uuid().nullable()),
  });

export async function inviteMember(_prev: InviteState, formData: FormData): Promise<InviteState> {
  const [workspace, t] = await Promise.all([authorize("members.manage"), getT()]);
  if (!workspace) return failure(t.team.errors.invite);
  const parsed = inviteSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { data: token, error } = await supabase.rpc("create_invitation", {
    p_business_id: workspace.business.id,
    p_email: parsed.data.email,
    p_role: parsed.data.role,
    p_staff_id: parsed.data.staffId ?? undefined,
  });
  if (error || !token) {
    return failure(t.team.errors.rpc[error?.message ?? ""] ?? t.team.errors.inviteFailed);
  }
  revalidatePath("/app/team");
  return {
    status: "success",
    message: t.team.invited(parsed.data.email),
    inviteUrl: `${publicEnv.siteUrl}/invite/${token}`,
  };
}

export async function revokeInvitation(formData: FormData) {
  const workspace = await authorize("members.manage");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.rpc("revoke_invitation", { p_invitation_id: String(formData.get("id") ?? "") });
  revalidatePath("/app/team");
}

export async function saveMemberAccess(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("members.manage"), getT()]);
  if (!workspace) return failure(t.team.errors.change);
  const role = z.enum(["owner", "manager", "staff"]).safeParse(formData.get("role"));
  if (!role.success) return failure(t.team.errors.chooseRole);
  const chosen = new Set(formData.getAll("permissions").map(String));
  const defaults = role.data === "owner" ? ALL_PERMISSIONS : ROLE_PERMISSIONS[role.data];
  // Custom permissions per member are part of Pro; on Basic the role defaults apply.
  const custom =
    role.data !== "owner" &&
    hasFeature(await getEntitlements(workspace.business.id), "team_permissions");
  const granted = custom
    ? ALL_PERMISSIONS.filter((p) => chosen.has(p) && !defaults.includes(p))
    : [];
  const revoked = custom ? defaults.filter((p: Permission) => !chosen.has(p)) : [];

  const supabase = await createClient();
  const { error } = await supabase.rpc("update_member", {
    p_member_id: String(formData.get("memberId") ?? ""),
    p_role: role.data,
    p_granted: granted,
    p_revoked: revoked,
  });
  if (error) return failure(t.team.errors.rpc[error.message] ?? t.team.errors.saveFailed);
  revalidatePath("/app/team");
  return success(t.team.accessUpdated);
}

export async function removeMember(formData: FormData) {
  const workspace = await authorize("members.manage");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.rpc("remove_member", { p_member_id: String(formData.get("memberId") ?? "") });
  revalidatePath("/app/team");
}
