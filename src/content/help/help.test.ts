import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { helpContent, helpHotspots } from ".";

const outline = (locale: keyof typeof helpContent) =>
  helpContent[locale].courses.map((course) => ({
    slug: course.slug,
    icon: course.icon,
    audience: course.audience,
    steps: course.steps.map((step) => ({ image: step.image?.name, mobile: step.image?.mobile })),
    faq: course.faq.length,
  }));

describe("help centre content", () => {
  it("has the same courses, steps and screenshots in every language", () => {
    expect(outline("en")).toEqual(outline("nl"));
    expect(helpContent.en.faq.length).toBe(helpContent.nl.faq.length);
  });

  it("uses unique course slugs", () => {
    const slugs = helpContent.nl.courses.map((course) => course.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("has at least one animated click target for every screenshot", () => {
    const missing: string[] = [];
    for (const [locale, content] of Object.entries(helpContent)) {
      for (const step of content.courses.flatMap((course) => course.steps)) {
        if (step.image && helpHotspots(locale as "nl" | "en", step.image.name).length === 0)
          missing.push(`${locale}/${step.image.name}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it("ships every referenced screenshot for every language", () => {
    const missing: string[] = [];
    for (const [locale, content] of Object.entries(helpContent)) {
      for (const course of content.courses) {
        for (const step of course.steps) {
          if (!step.image) continue;
          const file = path.join(
            process.cwd(),
            "public",
            "help",
            locale,
            `${step.image.name}.webp`,
          );
          if (!existsSync(file)) missing.push(`${locale}/${step.image.name}`);
        }
      }
    }
    expect(missing).toEqual([]);
  });
});
