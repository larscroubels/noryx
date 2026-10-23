import { describe, expect, it } from "vitest";

import { isLocalUrl, resolveSiteUrl } from "./site-url";

describe("resolveSiteUrl", () => {
  it("uses NEXT_PUBLIC_SITE_URL locally, without a trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000/" })).toBe("http://localhost:3000");
    expect(resolveSiteUrl({})).toBeUndefined();
  });

  it("keeps a real configured domain on Vercel", () => {
    expect(
      resolveSiteUrl({
        VERCEL: "1",
        VERCEL_ENV: "production",
        VERCEL_PROJECT_PRODUCTION_URL: "noryx-ashen.vercel.app",
        NEXT_PUBLIC_SITE_URL: "https://noryx.be",
      }),
    ).toBe("https://noryx.be");
  });

  it("never uses localhost on Vercel", () => {
    const production = {
      VERCEL: "1",
      VERCEL_ENV: "production",
      VERCEL_PROJECT_PRODUCTION_URL: "noryx-ashen.vercel.app",
      VERCEL_URL: "noryx-abc123.vercel.app",
    };
    expect(resolveSiteUrl(production)).toBe("https://noryx-ashen.vercel.app");
    expect(resolveSiteUrl({ ...production, NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })).toBe(
      "https://noryx-ashen.vercel.app",
    );
  });

  it("uses the branch URL for preview deployments", () => {
    expect(
      resolveSiteUrl({
        VERCEL: "1",
        VERCEL_ENV: "preview",
        VERCEL_PROJECT_PRODUCTION_URL: "noryx-ashen.vercel.app",
        VERCEL_BRANCH_URL: "noryx-git-feature-lars.vercel.app",
      }),
    ).toBe("https://noryx-git-feature-lars.vercel.app");
  });
});

describe("isLocalUrl", () => {
  it("recognises local addresses only", () => {
    expect(isLocalUrl("http://127.0.0.1:3000")).toBe(true);
    expect(isLocalUrl("https://noryx-ashen.vercel.app")).toBe(false);
    expect(isLocalUrl("not a url")).toBe(false);
  });
});
