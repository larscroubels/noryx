import { z } from "zod";

import type { Dictionary } from "@/i18n/dictionaries";

import { rules } from "./common";

export const passwordField = (t: Dictionary) =>
  z
    .string()
    .min(10, t.validation.passwordMin)
    .max(72, t.validation.passwordMax)
    .regex(/[A-Za-z]/, t.validation.passwordLetter)
    .regex(/\d/, t.validation.passwordNumber);

export const signUpSchema = (t: Dictionary) => {
  const r = rules(t);
  return z.object({
    fullName: r.requiredText(t.auth.fields.yourName, 120, 2),
    email: r.email,
    password: passwordField(t),
    terms: z.literal("on", { error: t.validation.terms }),
  });
};

export const signInSchema = (t: Dictionary) =>
  z.object({
    email: rules(t).email,
    password: z.string().min(1, t.validation.passwordEnter),
  });

export const forgotPasswordSchema = (t: Dictionary) => z.object({ email: rules(t).email });

export const resetPasswordSchema = (t: Dictionary) =>
  z
    .object({ password: passwordField(t), confirmPassword: z.string() })
    .refine((data) => data.password === data.confirmPassword, {
      message: t.validation.passwordMismatch,
      path: ["confirmPassword"],
    });

/** Only allow relative in-app redirect targets (prevents open redirects). */
/**
 * The `next` path inside a redirect URL, as the email templates pass Supabase's
 * {{ .RedirectTo }} (for example https://site/auth/confirm?next=/invite/abc).
 */
export function nextFromRedirect(redirectTo: string | null | undefined): string | null {
  if (!redirectTo) return null;
  try {
    return new URL(redirectTo).searchParams.get("next");
  } catch {
    return null;
  }
}

export function safeNextPath(next: unknown, fallback = "/app") {
  if (
    typeof next !== "string" ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.includes("\\")
  )
    return fallback;
  return next;
}
