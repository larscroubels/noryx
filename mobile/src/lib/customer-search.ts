const COLUMNS = ["first_name", "last_name", "email", "phone"] as const;

/**
 * PostgREST `or()` filter matching the term literally in a client's name, email or
 * phone (the website's search columns). The value is double-quoted so commas and
 * brackets can't split the filter; LIKE wildcards (% and _) are escaped, and `*`
 * — PostgREST's wildcard — is only added around the term.
 */
export function customerSearchFilter(term: string): string | null {
  const q = term.trim().slice(0, 100).replace(/\*/g, " ").trim();
  if (!q) return null;
  const like = q.replace(/[\\%_]/g, (c) => `\\${c}`);
  const quoted = `"*${like.replace(/[\\"]/g, (c) => `\\${c}`)}*"`;
  return COLUMNS.map((column) => `${column}.ilike.${quoted}`).join(",");
}
