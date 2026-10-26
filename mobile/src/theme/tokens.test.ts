import { readFileSync } from "node:fs";
import { join } from "node:path";

import { colors } from "./tokens";

/** Resolves `--color-x: #hex` and `--color-y: var(--color-x)` from the website's tokens. */
function cssColors() {
  const css = readFileSync(join(__dirname, "../../../src/styles/tokens.css"), "utf8");
  const raw = new Map<string, string>();
  for (const [, name, value] of css.matchAll(/--color-([a-z0-9-]+):\s*([^;]+);/g)) {
    raw.set(name!, value!.trim());
  }
  const resolve = (value: string): string => {
    const ref = value.match(/^var\(--color-([a-z0-9-]+)\)$/);
    return ref ? resolve(raw.get(ref[1]!) ?? value) : value;
  };
  return new Map([...raw].map(([name, value]) => [name, resolve(value)]));
}

it("matches tokens.css", () => {
  const css = cssColors();
  const checked = Object.entries(colors).filter(([name]) => css.has(name));
  expect(checked.length).toBeGreaterThan(40);
  for (const [name, hex] of checked) expect([name, hex]).toEqual([name, css.get(name)]);
  expect(colors["pink-700"]).toBe("#b83d5d");
});
