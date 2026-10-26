import type { Dictionary } from "@/i18n/dictionaries";

type AuthError = { code?: string } | null | undefined;

/** The website's messages for Supabase auth errors (src/app/(auth)/actions.ts). */
export function authErrorMessage(flow: "signIn" | "signUp", error: AuthError, t: Dictionary) {
  const m = t.auth.messages;
  const code = error?.code;
  if (code === "over_request_rate_limit") return t.errors.tooManyAttempts;
  if (flow === "signIn")
    return code === "email_not_confirmed" ? m.confirmFirst : m.wrongCredentials;
  if (code === "weak_password") return m.weakPassword;
  if (code === "over_email_send_rate_limit") return m.emailRateLimit;
  if (code === "email_address_not_authorized") return m.emailNotAllowed;
  return m.signupFailed;
}
