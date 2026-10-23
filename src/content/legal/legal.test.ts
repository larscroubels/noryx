import { describe, expect, it } from "vitest";

import { LOCALES } from "@/i18n/config";

import { legalContent } from ".";

const KINDS = ["privacy", "cookies", "terms", "notice"] as const;

describe("legal pages", () => {
  it("have the same sections in every language", () => {
    const ids = (locale: (typeof LOCALES)[number]) =>
      KINDS.map((kind) => legalContent(locale)[kind].sections.map((section) => section.id));
    for (const locale of LOCALES) expect(ids(locale)).toEqual(ids("nl"));
  });

  it("show missing company details as a placeholder instead of inventing them", () => {
    const text = JSON.stringify(legalContent("nl").notice);
    expect(text).toContain("[nog in te vullen]");
    expect(text).not.toMatch(/undefined|null/);
  });

  it("list every cookie the app sets", () => {
    for (const locale of LOCALES) {
      const table = legalContent(locale).cookies.sections.find((section) => section.table)!.table!;
      const names = table.rows.map((row) => row[0]);
      expect(names).toEqual(["sb-…-auth-token", "sb-…-auth-token-code-verifier", "noryx_business", "noryx_locale"]);
    }
  });

  it("only link to pages and anchors that exist", () => {
    const anchors = new Set(legalContent("nl").privacy.sections.map((section) => `#${section.id}`));
    for (const locale of LOCALES) {
      const text = JSON.stringify(legalContent(locale));
      for (const [, href] of text.matchAll(/\]\((\/[^)\s#]*|#[^)\s]+)/g)) {
        if (href!.startsWith("#")) expect(anchors).toContain(href);
        else expect(["/help", "/terms", "/privacy", "/cookies", "/pricing"]).toContain(href);
      }
    }
  });
});
