import type { Dictionary } from "@/i18n/dictionaries";

import type { ClientCategory, ClientLink } from "./api";

/** Tabs and pickers always show categories in this order. */
export const CATEGORY_ORDER: ClientCategory[] = [
  "hair",
  "nails",
  "beauty",
  "brows",
  "lashes",
  "other",
];

/**
 * link_business_by_code replaces a link's categories, so linking a salon again for
 * another service must send the earlier ones too.
 */
export function mergeCategories(
  existing: ClientCategory[],
  added: ClientCategory[],
): ClientCategory[] {
  const all = new Set([...existing, ...added]);
  return CATEGORY_ORDER.filter((category) => all.has(category));
}

export type SalonTab = {
  category: ClientCategory;
  salons: { businessId: string; name: string; slug: string }[];
};

/** One tab per category the client uses, with the linked salons for it. */
export function tabsFromLinks(links: ClientLink[]): SalonTab[] {
  const active = links.filter((link) => link.unlinked_at === null);
  return CATEGORY_ORDER.flatMap((category) => {
    const salons = active
      .filter((link) => link.categories.includes(category))
      .map((link) => ({ businessId: link.business_id, name: link.name, slug: link.slug }));
    return salons.length ? [{ category, salons }] : [];
  });
}

export function categoryLabel(category: ClientCategory, t: Dictionary) {
  return t.appShowcase.phone.categories[category];
}
