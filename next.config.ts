import { readdirSync } from "node:fs";
import path from "node:path";

import type { NextConfig } from "next";

import { isLocalUrl, resolveSiteUrl } from "./src/lib/site-url";

const siteUrl = resolveSiteUrl(process.env);
if (process.env.VERCEL && process.env.NEXT_PUBLIC_SITE_URL && isLocalUrl(process.env.NEXT_PUBLIC_SITE_URL)) {
  console.warn(
    `NEXT_PUBLIC_SITE_URL is set to ${process.env.NEXT_PUBLIC_SITE_URL} on Vercel; using ${siteUrl} instead. Set it to your public domain in Vercel › Settings › Environment Variables.`,
  );
}

/** The newest migration in this repository: the database schema this build expects (see /api/health). */
function latestMigration() {
  try {
    const files = readdirSync(path.join(process.cwd(), "supabase", "migrations"));
    return files.filter((file) => /^\d{14}_.+\.sql$/.test(file)).sort().at(-1)?.slice(0, 14) ?? "";
  } catch {
    return "";
  }
}

/**
 * Baseline security headers for every response. A nonce-based Content-Security-Policy
 * is planned for launch hardening (see docs/ROADMAP.md, phase 8).
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  env: {
    NEXT_PUBLIC_SITE_URL: siteUrl ?? "",
    NORYX_SCHEMA_VERSION: latestMigration(),
  },
  experimental: {
    // Brand images are limited to 2 MB; leave room for multipart overhead.
    serverActions: { bodySizeLimit: "3mb" },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
