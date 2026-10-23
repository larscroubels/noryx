import { getSupabaseConfig, publicEnv } from "@/lib/env";

/**
 * Ultra businesses can use their own domain (hairsalonsylvie.be) for their public
 * page. The proxy rewrites requests on such a domain to /<slug>/…; which domain
 * belongs to which business is decided by public.resolve_custom_domain().
 */

/** Hosts that serve the NORYX platform itself (never looked up as custom domains). */
export function isPlatformHost(host: string, siteUrl = publicEnv.siteUrl) {
  const name = host.split(":")[0]!.toLowerCase();
  const platform = new URL(siteUrl).hostname.toLowerCase();
  return (
    name === platform ||
    name === `www.${platform}` ||
    name === "localhost" ||
    name === "127.0.0.1" ||
    name.endsWith(".vercel.app")
  );
}

/** Public routes of a business page that may be served on its own domain. */
const PUBLIC_SUBPATHS = ["/book", "/shop", "/gift-card", "/booking/"];

/**
 * The internal path for a request on a custom domain, or null to leave it alone
 * (framework assets, API routes and links that already include the slug).
 */
export function customDomainPath(slug: string, pathname: string) {
  if (pathname === "/" || pathname === "") return `/${slug}`;
  if (pathname === `/${slug}` || pathname.startsWith(`/${slug}/`)) return null;
  if (PUBLIC_SUBPATHS.some((path) => pathname === path || pathname.startsWith(path.endsWith("/") ? path : `${path}/`)))
    return `/${slug}${pathname}`;
  return null;
}

const cache = new Map<string, { slug: string | null; expires: number }>();
const TTL_MS = 60_000;

/** Looks up the business slug for a custom domain (cached for a minute per server instance). */
export async function slugForHost(host: string): Promise<string | null> {
  const key = host.split(":")[0]!.toLowerCase();
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.slug;
  const config = getSupabaseConfig();
  if (!config) return null;
  let slug: string | null = null;
  try {
    const response = await fetch(`${config.url}/rest/v1/rpc/resolve_custom_domain`, {
      method: "POST",
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ p_host: key }),
      cache: "no-store",
    });
    if (response.ok) slug = ((await response.json()) as string | null) ?? null;
  } catch {
    slug = null;
  }
  cache.set(key, { slug, expires: Date.now() + TTL_MS });
  if (cache.size > 1000) cache.delete(cache.keys().next().value!);
  return slug;
}
