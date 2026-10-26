import { customerSearchFilter } from "./customer-search";

const all = (value: string) =>
  ["first_name", "last_name", "email", "phone"].map((c) => `${c}.ilike.${value}`).join(",");

it("escapes PostgREST filter characters", () => {
  // Commas and brackets stay inside one quoted value instead of splitting the filter.
  expect(customerSearchFilter("a,b (x)")).toBe(all('"*a,b (x)*"'));
  // LIKE wildcards match literally (\% then quoted → \\%); quotes are escaped.
  expect(customerSearchFilter("50%_")).toBe(all('"*50\\\\%\\\\_*"'));
  expect(customerSearchFilter('say "hi"')).toBe(all('"*say \\"hi\\"*"'));
});

it("empty term means no filter", () => {
  expect(customerSearchFilter("")).toBeNull();
  expect(customerSearchFilter("   ")).toBeNull();
});

it("trims and limits the term like the website", () => {
  expect(customerSearchFilter("  anna  ")).toBe(all('"*anna*"'));
  expect(customerSearchFilter("x".repeat(150))).toBe(all(`"*${"x".repeat(100)}*"`));
});
