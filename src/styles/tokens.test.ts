import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/** Reads the hex colour tokens straight from tokens.css so the test follows the real design system. */
const css = readFileSync(path.join(import.meta.dirname, "tokens.css"), "utf8");
const tokens = Object.fromEntries(
  [...css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(([, name, hex]) => [
    name!,
    hex!,
  ]),
);

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(tokens[a]!), luminance(tokens[b]!)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

/** [foreground, background, minimum ratio] — text needs 4.5:1, UI boundaries and focus rings 3:1. */
const REQUIRED: [string, string, number][] = [
  ["neutral-900", "white", 4.5],
  ["neutral-900", "champagne-200", 4.5],
  ["neutral-600", "white", 4.5],
  ["neutral-600", "ivory", 4.5],
  ["neutral-600", "champagne-100", 4.5],
  ["neutral-600", "neutral-100", 4.5],
  ["neutral-500", "white", 4.5],
  ["white", "pink-700", 4.5],
  ["white", "pink-800", 4.5],
  ["pink-700", "white", 4.5],
  ["pink-700", "pink-50", 4.5],
  ["pink-700", "ivory", 4.5],
  ["rosegold-600", "white", 4.5],
  ["rosegold-700", "champagne-50", 4.5],
  ["rosegold-700", "champagne-100", 4.5],
  ["rosegold-800", "champagne-50", 4.5],
  ["success-700", "success-50", 4.5],
  ["warning-700", "warning-50", 4.5],
  ["danger-700", "danger-50", 4.5],
  ["white", "danger-600", 4.5],
  ["info-700", "info-50", 4.5],
  ["neutral-700", "neutral-100", 4.5],
  ["neutral-450", "white", 3],
  ["neutral-450", "ivory", 3],
  ["rosegold-600", "ivory", 3],
];

describe("design token contrast (WCAG 2.2 AA)", () => {
  it.each(REQUIRED)("%s on %s meets %s:1", (fg, bg, minimum) => {
    expect(tokens[fg], `missing token ${fg}`).toBeDefined();
    expect(tokens[bg], `missing token ${bg}`).toBeDefined();
    expect(contrast(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });

  it("keeps the decorative rose gold out of the text-safe list", () => {
    expect(contrast("rosegold-400", "white")).toBeLessThan(3);
  });
});
