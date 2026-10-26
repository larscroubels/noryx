import { dictionaries } from "@/i18n/dictionaries";

import { authErrorMessage } from "./auth-errors";

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
