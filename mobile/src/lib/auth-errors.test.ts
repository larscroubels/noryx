import { dictionaries } from "@/i18n/dictionaries";

import { authErrorMessage, resetRequestResult } from "./auth-errors";

const t = dictionaries.en;
const m = t.auth.messages;

it("maps sign-in errors like the website", () => {
  expect(authErrorMessage("signIn", { code: "email_not_confirmed" }, t)).toBe(m.confirmFirst);
  expect(authErrorMessage("signIn", { code: "invalid_credentials" }, t)).toBe(m.wrongCredentials);
  expect(authErrorMessage("signIn", { code: "over_request_rate_limit" }, t)).toBe(
    t.errors.tooManyAttempts,
  );
  expect(authErrorMessage("signIn", { code: "something_new" }, t)).toBe(m.wrongCredentials);
});

it("maps sign-up errors like the website", () => {
  expect(authErrorMessage("signUp", { code: "weak_password" }, t)).toBe(m.weakPassword);
  expect(authErrorMessage("signUp", { code: "over_email_send_rate_limit" }, t)).toBe(
    m.emailRateLimit,
  );
  expect(authErrorMessage("signUp", { code: "email_address_not_authorized" }, t)).toBe(
    m.emailNotAllowed,
  );
  expect(authErrorMessage("signUp", { code: "over_request_rate_limit" }, t)).toBe(
    t.errors.tooManyAttempts,
  );
  expect(authErrorMessage("signUp", {}, t)).toBe(m.signupFailed);
});

it("never claims a reset email was sent when the request didn't reach NORYX", () => {
  expect(resetRequestResult(null, t)).toEqual({ tone: "success", message: m.resetSent });
  // Unknown accounts get the same answer as known ones (no account probing).
  expect(resetRequestResult({ code: "user_not_found", status: 400 }, t)).toEqual({
    tone: "success",
    message: m.resetSent,
  });
  expect(resetRequestResult({ name: "AuthRetryableFetchError", status: 0 }, t)).toEqual({
    tone: "danger",
    message: t.errors.generic,
  });
  expect(resetRequestResult({ code: "over_email_send_rate_limit", status: 429 }, t)).toEqual({
    tone: "danger",
    message: m.emailRateLimit,
  });
});
