import { describe, expect, it } from "vitest";

import { helpContent } from "@/content/help";
import { LOCALES } from "@/i18n/config";

import { createEventParser, encodeEvent } from "./events";
import { buildKnowledge, searchKnowledge } from "./knowledge";

describe("assistant knowledge", () => {
  it.each(LOCALES)("covers the website content in %s", (locale) => {
    const text = buildKnowledge(locale);
    expect(text).toContain("150");
    expect(text).toContain("(/pricing)");
    expect(text).toContain("(/for-you)");
    for (const course of helpContent[locale].courses) expect(text).toContain(`(/help/${course.slug})`);
    expect(text).not.toMatch(/undefined|\[object |=>/);
  });

  it("is the same on every call, so the prompt cache holds", () => {
    expect(buildKnowledge("nl")).toBe(buildKnowledge("nl"));
  });

  it("finds FAQ and help answers by keyword", () => {
    const [first] = searchKnowledge("en", "How does the free trial work?");
    expect(first?.title).toMatch(/trial/i);
    expect(searchKnowledge("nl", "proefperiode").length).toBeGreaterThan(0);
    expect(searchKnowledge("fr", "essai gratuit").length).toBeGreaterThan(0);
  });

  it("matches short terms as whole words only", () => {
    const titles = searchKnowledge("nl", "Wat is het verschil tussen Basic, Pro en Ultra?").map((r) => r.title);
    expect(titles[0]).toMatch(/Basic, Pro en Ultra/);
    expect(titles.join(" ")).not.toMatch(/profiel/i);
  });

  it("returns nothing for questions without content words", () => {
    expect(searchKnowledge("en", "what is the")).toEqual([]);
    expect(searchKnowledge("en", "zzqx")).toEqual([]);
  });
});

describe("assistant events", () => {
  it("parses events split across chunks", () => {
    const parse = createEventParser();
    const wire = encodeEvent({ type: "text", text: "Hallo" }) + encodeEvent({ type: "reset" });
    expect(parse(wire.slice(0, 10))).toEqual([]);
    expect(parse(wire.slice(10))).toEqual([{ type: "text", text: "Hallo" }, { type: "reset" }]);
  });
});
