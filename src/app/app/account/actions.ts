"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { failure, formToObject, success, validationFailure, type ActionState } from "@/lib/actions";
import { requireUser } from "@/lib/auth/session";
import { publicEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";
import { passwordField } from "@/lib/validation/auth";
import { rules } from "@/lib/validation/common";

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser("/app/account");
  const t = await getT();
  const parsed = z
    .object({ fullName: rules(t).requiredText(t.account.yourName, 120, 2) })
    .safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const [{ error: profileError }, { error: authError }] = await Promise.all([
    supabase.from("profiles").update({ full_name: parsed.data.fullName }).eq("id", user.id),
    supabase.auth.updateUser({ data: { full_name: parsed.data.fullName } }),
  ]);
  if (profileError || authError) return failure(t.account.nameFailed);
  revalidatePath("/app", "layout");
  return success(t.account.nameUpdated);
}

export async function changeEmail(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("/app/account");
  const t = await getT();
  const parsed = z.object({ email: rules(t).email }).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser(
    { email: parsed.data.email },
    { emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/app/account` },
  );
  if (error)
    return failure(error.code === "email_exists" ? t.account.emailInUse : t.account.emailFailed);
  return success(t.account.emailSent);
}

export async function changePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireUser("/app/account");
  const t = await getT();
  const parsed = z
    .object({ password: passwordField(t), confirmPassword: z.string() })
    .refine((d) => d.password === d.confirmPassword, {
      message: t.validation.passwordMismatch,
      path: ["confirmPassword"],
    })
    .safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "reauthentication_needed") return failure(t.account.reauth);
    if (error.code === "same_password") return failure(t.account.samePassword);
    return failure(t.account.passwordFailed);
  }
  return success(t.account.passwordChanged);
}
