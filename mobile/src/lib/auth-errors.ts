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

type ResetError = { code?: string; name?: string; status?: number } | null | undefined;

/**
 * What to tell the user after requesting a reset email. As on the website, unknown and
 * known accounts get the same answer — but a request that never reached NORYX (offline,
 * server error) or was rate limited must not claim an email is on its way.
 */
export function resetRequestResult(
  error: ResetError,
  t: Dictionary,
): { tone: "success" | "danger"; message: string } {
  if (!error) return { tone: "success", message: t.auth.messages.resetSent };
  if (error.code === "over_request_rate_limit")
    return { tone: "danger", message: t.errors.tooManyAttempts };
  if (error.code === "over_email_send_rate_limit")
    return { tone: "danger", message: t.auth.messages.emailRateLimit };
  if (error.name === "AuthRetryableFetchError" || !error.status || error.status >= 500)
    return { tone: "danger", message: t.errors.generic };
  return { tone: "success", message: t.auth.messages.resetSent };
}
