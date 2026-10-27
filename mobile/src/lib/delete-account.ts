import { reportAuthFailure } from "./auth-failure";
import { SITE_URL } from "./env";

export type DeletionOutcome = "deleted" | "owns_business" | "failed";

/** Calls the website's POST /api/account/delete with the user's access token. */
export async function requestAccountDeletion(
  accessToken: string,
  fetchImpl: typeof fetch = fetch,
): Promise<DeletionOutcome> {
  try {
    const response = await fetchImpl(`${SITE_URL}/api/account/delete`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const body = (await response.json().catch(() => null)) as { error?: string } | null;
    if (response.ok) return "deleted";
    if (response.status === 401) reportAuthFailure();
    return body?.error === "account_owns_business" ? "owns_business" : "failed";
  } catch {
    return "failed";
  }
}
