import { describe, expect, it } from "vitest";

import { localeFromAcceptLanguage, localeFromIntl } from "./config";

describe("localeFromIntl", () => {
  it("maps a salon's locale to an interface language", () => {
    expect(localeFromIntl("fr-BE")).toBe("fr");
    expect(localeFromIntl("nl-BE")).toBe("nl");
    expect(localeFromIntl("de-DE")).toBeNull();
    expect(localeFromIntl(null)).toBeNull();
  });
});

describe("localeFromAcceptLanguage", () => {
  it("uses the first supported browser language", () => {
    expect(localeFromAcceptLanguage("en-GB,en;q=0.9,nl;q=0.8")).toBe("en");
    expect(localeFromAcceptLanguage("nl-BE,nl;q=0.9")).toBe("nl");
    expect(localeFromAcceptLanguage("fr-BE,fr;q=0.9,en;q=0.5")).toBe("fr");
    expect(localeFromAcceptLanguage("de-DE,en;q=0.5")).toBe("en");
  });

  it("falls back to Dutch", () => {
    expect(localeFromAcceptLanguage("de-DE")).toBe("nl");
    expect(localeFromAcceptLanguage(null)).toBe("nl");
  });
});
