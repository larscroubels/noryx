import { z } from "zod";

/**
 * Public configuration (safe for the browser). NEXT_PUBLIC_* values are inlined at
 * build time, so each one must be referenced literally — never via process.env[key].
 */
const publicSchema = z.object({
  siteUrl: z.url().default("http://localhost:3000"),
  supabaseUrl: z.url().optional(),
  supabasePublishableKey: z.string().min(20).optional(),
});

const parsed = publicSchema.safeParse({
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || undefined,
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
  supabasePublishableKey:
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    undefined,
});

if (!parsed.success) {
  throw new Error(`Invalid public environment configuration: ${z.prettifyError(parsed.error)}`);
}

export const publicEnv = parsed.data;

export type SupabaseConfig = { url: string; publishableKey: string };

/** Returns the Supabase connection settings, or null when the project is not configured yet. */
export function getSupabaseConfig(): SupabaseConfig | null {
  const { supabaseUrl, supabasePublishableKey } = publicEnv;
  return supabaseUrl && supabasePublishableKey
    ? { url: supabaseUrl, publishableKey: supabasePublishableKey }
    : null;
}

export function isSupabaseConfigured() {
  return getSupabaseConfig() !== null;
}
