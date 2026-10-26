import { en } from "./en";
import { fr } from "./fr";
import { resolveLocale } from "./locale";
import { nl } from "./nl";

function keys(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) return [prefix];
  return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
}

it("same keys in every language", () => {
  expect(keys(nl).sort()).toEqual(keys(en).sort());
  expect(keys(fr).sort()).toEqual(keys(en).sort());
});

it("resolves locale tags", () => {
  expect(resolveLocale("fr-BE")).toBe("fr");
  expect(resolveLocale("en-US")).toBe("en");
  expect(resolveLocale("nl")).toBe("nl");
  expect(resolveLocale("de-DE")).toBe("nl");
  expect(resolveLocale(undefined)).toBe("nl");
});
