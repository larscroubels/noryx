"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getT } from "@/i18n/server";
import { failure, type ActionState } from "@/lib/actions";
import { ACTIVE_BUSINESS_COOKIE, requireUser } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "");
  await requireUser(`/invite/${token}`);
  const supabase = await createClient();
  const { data: businessId, error } = await supabase.rpc("accept_invitation", { p_token: token });
  if (error || !businessId) {
    const p = (await getT()).team.invitePage;
    return failure(p.rpc[error?.message ?? ""] ?? p.failed);
  }
  (await cookies()).set(ACTIVE_BUSINESS_COOKIE, businessId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/app");
}
