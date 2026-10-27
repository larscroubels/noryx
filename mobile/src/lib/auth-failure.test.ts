import { isAuthError } from "./auth-failure";

it("recognises a rejected session", () => {
  expect(isAuthError({ status: 401 })).toBe(true);
  expect(isAuthError({ code: "PGRST301", message: "JWT expired" })).toBe(true);
  expect(isAuthError({ code: "PGRST303", message: "JWT expired" })).toBe(true);
  expect(isAuthError({ code: "42501", message: "permission denied" })).toBe(false);
  expect(isAuthError(new Error("Network request failed"))).toBe(false);
  expect(isAuthError(null)).toBe(false);
});
