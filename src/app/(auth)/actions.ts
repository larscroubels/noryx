"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { getT } from "@/i18n/server";
import { failure, formToObject, success, validationFailure, type ActionState } from "@/lib/actions";
import { publicEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  safeNextPath,
  signInSchema,
  signUpSchema,
} from "@/lib/validation/auth";

async function clientKey(scope: string) {
  const forwarded = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  return `${scope}:${forwarded || "local"}`;
}

async function limited(scope: string, limit: number) {
  return !rateLimit(await clientKey(scope), { limit, windowMs: 15 * 60_000 }).allowed;
}

/** Supabase's built-in mailer only emails members of the project's team, at most a few an hour. */
function logMailerRefusal(event: string, code: string | undefined) {
  if (code !== "email_address_not_authorized") return false;
  logger.error(event, {
    code,
    advice:
      "Supabase is using its default email service, which only sends to members of the Supabase team. Configure custom SMTP in Supabase › Authentication › Emails › SMTP Settings.",
  });
  return true;
}

export async function signIn(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  if (await limited("sign-in", 10)) return failure(t.errors.tooManyAttempts);
  const parsed = signInSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.code === "email_not_confirmed") return failure(t.auth.messages.confirmFirst);
    return failure(t.auth.messages.wrongCredentials);
  }
  redirect(safeNextPath(formData.get("next")));
}

export async function signUp(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  if (await limited("sign-up", 5)) return failure(t.errors.tooManyAttempts);
  const parsed = signUpSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const next = safeNextPath(formData.get("next"), "/onboarding");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${publicEnv.siteUrl}/auth/confirm?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    if (error.code === "weak_password")
      return failure(t.auth.messages.weakPassword, { password: [t.auth.messages.weakPassword] });
    if (error.code === "over_email_send_rate_limit") return failure(t.auth.messages.emailRateLimit);
    if (logMailerRefusal("auth.sign_up_email_refused", error.code)) return failure(t.auth.messages.emailNotAllowed);
    logger.warn("auth.sign_up_failed", { code: error.code, status: error.status });
    return failure(t.auth.messages.signupFailed);
  }

  // With email confirmation disabled Supabase signs the user in immediately.
  if (data.session) redirect(next);
  return success(t.auth.messages.confirmationSent(parsed.data.email));
}

export async function requestPasswordReset(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const t = await getT();
  if (await limited("password-reset", 5)) return failure(t.errors.tooManyAttempts);
  const parsed = forgotPasswordSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${publicEnv.siteUrl}/auth/confirm?next=/reset-password`,
  });
  if (error && !logMailerRefusal("auth.password_reset_email_refused", error.code))
    logger.warn("auth.password_reset_failed", { code: error.code });
  // Same answer whether or not the account exists, to avoid revealing registered emails.
  return success(t.auth.messages.resetSent);
}

export async function updatePassword(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const t = await getT();
  const parsed = resetPasswordSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  if (!claims?.claims) return failure(t.auth.messages.resetExpired);

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    if (error.code === "same_password") return failure(t.auth.messages.samePassword);
    return failure(t.auth.messages.updateFailed);
  }
  redirect("/app?password=updated");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
