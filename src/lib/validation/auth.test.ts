import { describe, expect, it } from "vitest";

import { nextFromRedirect, safeNextPath } from "./auth";

describe("email link destinations", () => {
  it("reads next from the redirect URL in the email link", () => {
    expect(nextFromRedirect("https://noryx-ashen.vercel.app/auth/confirm?next=%2Finvite%2Fabc")).toBe("/invite/abc");
    expect(nextFromRedirect("https://noryx-ashen.vercel.app")).toBeNull();
    expect(nextFromRedirect("not a url")).toBeNull();
    expect(nextFromRedirect(null)).toBeNull();
  });

  it("only allows paths on this site", () => {
    expect(safeNextPath("/onboarding")).toBe("/onboarding");
    expect(safeNextPath("https://evil.example")).toBe("/app");
    expect(safeNextPath("//evil.example")).toBe("/app");
    expect(safeNextPath(nextFromRedirect("https://site/auth/confirm?next=https://evil.example"))).toBe("/app");
  });
});
