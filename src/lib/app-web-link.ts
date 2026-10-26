/**
 * Paths the NORYX app may open signed in on the website: the workspace (`/app`,
 * `/app/…`, optionally with a query or #section) and nothing else, so a one-time
 * sign-in link can never point outside it.
 */
export function workspacePath(next: unknown): string | null {
  if (typeof next !== "string" || next.length > 300) return null;
  if (!/^\/app(?:[/?#]|$)/.test(next)) return null;
  if (next.includes("//") || next.includes("\\")) return null;
  const path = next.split(/[?#]/)[0]!;
  if (path.split("/").some((segment) => segment === ".." || segment === ".")) return null;
  return next;
}
