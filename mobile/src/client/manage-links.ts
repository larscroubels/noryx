import { linkSalon, normaliseCode, unlinkSalon, type ClientCategory, type ClientLink } from "./api";
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
    let result: LinkOutcome;
    try {
      result = await linkSalon(code, categories);
    } catch {
      // Offline or a server error: this code failed, earlier ones still count.
      outcomes.set(code, { ok: false, error: "failed" });
      continue;
    }
    if (result.ok) {
      const earlier = existing.find(
        (link) => link.business_id === (result as { businessId: string }).businessId,
      );
      const merged = mergeCategories(
        earlier?.unlinked_at === null ? earlier.categories : [],
        categories,
      );
      // Databases from before 20261103091000 replace the list; send the union again.
      if (merged.length !== categories.length) {
        result = await linkSalon(code, merged).catch(() => result);
      }
    }
    outcomes.set(code, result);
  }
  return outcomes;
}

/**
 * Replaces a salon: the new one takes over every service of the old one. It is linked
 * first, and only then is the old one unlinked, so a wrong code never leaves the client
 * without their salon. Unlinking keeps the old salon's history and upcoming visits.
 */
export async function replaceSalon(
  old: ClientLink,
  code: string,
  existing: ClientLink[],
): Promise<LinkOutcome> {
  const outcome = (
    await linkCodes(
      old.categories.map((category) => ({ category, code })),
      existing,
    )
  ).get(normaliseCode(code)) ?? { ok: false, error: "failed" };
  if (!outcome.ok || outcome.businessId === old.business_id) return outcome;
  try {
    await unlinkSalon(old.business_id);
  } catch {
    // Both salons are linked now; say so instead of claiming the swap worked.
    return { ok: false, error: "unlink_failed" };
  }
  return outcome;
}
