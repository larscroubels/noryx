import { describe, expect, it } from "vitest";

import { dictionaries } from ".";

type Node = unknown;

/** Flattens a dictionary into "path → kind" so both languages can be compared structurally. */
function shape(node: Node, path = "", out = new Map<string, string>()) {
  if (Array.isArray(node)) {
    out.set(path, `array:${node.length}`);
    node.forEach((item, index) => shape(item, `${path}[${index}]`, out));
  } else if (typeof node === "function") {
    out.set(path, `function:${node.length}`);
  } else if (node && typeof node === "object") {
    for (const [key, value] of Object.entries(node))
      shape(value, path ? `${path}.${key}` : key, out);
  } else {
    out.set(path, typeof node);
  }
  return out;
}

describe("dictionaries", () => {
  const en = shape(dictionaries.en);
  const nl = shape(dictionaries.nl);
  const fr = shape(dictionaries.fr);

  it("have exactly the same keys, list lengths and function arities in every language", () => {
    expect([...nl.entries()].sort()).toEqual([...en.entries()].sort());
    expect([...fr.entries()].sort()).toEqual([...en.entries()].sort());
  });

  it("contain no empty strings except deliberate ones", () => {
    const allowedEmpty = new Set(["staff.servicesForm.first"]);
    for (const [locale, dictionary] of Object.entries(dictionaries)) {
      const empty = [...shape(dictionary).keys()].filter((path) => {
        const value = path
          .split(/\.|\[(\d+)\]/)
          .filter(Boolean)
          .reduce<Node>((node, key) => (node as Record<string, Node>)?.[key], dictionary);
        return value === "" && !allowedEmpty.has(path);
      });
      expect(empty, locale).toEqual([]);
    }
  });
});
