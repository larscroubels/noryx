/**
 * The public base URL of this deployment, decided at build time (next.config.ts).
 *
 * NEXT_PUBLIC_SITE_URL wins when it is set to a real address. On Vercel a missing
 * value, or one left at localhost (copied from .env.local), falls back to the
 * deployment's own URL, so email links and absolute URLs never point at localhost:
 * production builds use the project's production domain, previews their branch URL.
 */
export function resolveSiteUrl(env: Record<string, string | undefined>): string | undefined {
  const configured = env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") || undefined;
  if (!env.VERCEL) return configured;
  if (configured && !isLocalUrl(configured)) return configured;
  const host =
    env.VERCEL_ENV === "production"
      ? env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL
      : env.VERCEL_BRANCH_URL || env.VERCEL_URL;
  return host ? `https://${host}` : configured;
}

export function isLocalUrl(url: string) {
  try {
    const { hostname } = new URL(url);
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "0.0.0.0";
  } catch {
    return false;
  }
}
