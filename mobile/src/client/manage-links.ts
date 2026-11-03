import { linkSalon, normaliseCode, type ClientCategory, type ClientLink } from "./api";
import { mergeCategories } from "./links";

export type LinkOutcome =
  { ok: true; businessId: string; name: string; slug: string } | { ok: false; error: string };

/**
 * Links the salons behind the entered codes: one call per distinct code with every
 * category entered for it. When the salon was already linked for other categories,
 * it is linked again with all of them (link_business_by_code replaces the list).
 */
export async function linkCodes(
  entries: { category: ClientCategory; code: string }[],
  existing: ClientLink[],
): Promise<Map<string, LinkOutcome>> {
  const byCode = new Map<string, ClientCategory[]>();
  for (const { category, code } of entries) {
    const key = normaliseCode(code);
    if (key) byCode.set(key, mergeCategories(byCode.get(key) ?? [], [category]));
  }
  const outcomes = new Map<string, LinkOutcome>();
  for (const [code, categories] of byCode) {
    let result = await linkSalon(code, categories);
    if (result.ok) {
      const earlier = existing.find(
        (link) => link.business_id === (result as { businessId: string }).businessId,
      );
      const merged = mergeCategories(
        earlier?.unlinked_at === null ? earlier.categories : [],
        categories,
      );
      if (merged.length !== categories.length) result = await linkSalon(code, merged);
    }
    outcomes.set(code, result);
  }
  return outcomes;
}
