import type { ClientLink } from "./api";
import { mergeCategories, tabsFromLinks } from "./links";

const link = (over: Partial<ClientLink>): ClientLink => ({
  business_id: "b",
  slug: "s",
  name: "Salon",
  logo_path: null,
  categories: ["hair"],
  linked_at: "2026-10-01T00:00:00Z",
  unlinked_at: null,
  ...over,
});

it("keeps earlier categories when a salon is linked again", () => {
  expect(mergeCategories(["nails"], ["hair", "nails"])).toEqual(["hair", "nails"]);
  expect(mergeCategories(["lashes", "hair"], [])).toEqual(["hair", "lashes"]);
});

it("one tab per category, salons grouped", () => {
  const tabs = tabsFromLinks([
    link({ business_id: "els", name: "Els", categories: ["hair", "nails"] }),
    link({ business_id: "kim", name: "Kim", categories: ["hair"] }),
    link({ business_id: "vera", name: "Vera", categories: ["other"] }),
  ]);
  expect(tabs.map((tab) => tab.category)).toEqual(["hair", "nails", "other"]);
  expect(tabs[0]!.salons.map((s) => s.name)).toEqual(["Els", "Kim"]);
});

it("unlinked salons get no tab", () => {
  const tabs = tabsFromLinks([link({ unlinked_at: "2026-10-20T00:00:00Z" })]);
  expect(tabs).toEqual([]);
});
