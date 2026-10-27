/**
 * A request rejected because the session is no longer valid (revoked, password changed,
 * account deleted). Reported from data loads and website calls; the session provider
 * then checks with Supabase and signs out locally if the session is really gone.
 */
export function isAuthError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; code?: string };
  return e.status === 401 || e.code === "PGRST301" || e.code === "PGRST303";
}

let handler: (() => void) | null = null;

export function onAuthFailure(next: (() => void) | null) {
  handler = next;
}

export function reportAuthFailure() {
  handler?.();
}
