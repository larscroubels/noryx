import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig, publicEnv } from "@/lib/env";
import { getAnthropicApiKey, getSupabaseSecretKey } from "@/lib/env.server";
import { isLocalUrl } from "@/lib/site-url";
import { isSchemaError, logDatabaseError } from "@/lib/supabase/errors";
import type { Database } from "@/types/database";

/**
 * Deployment check: is the database reachable and does it have every migration
 * this build expects? Open /api/health after each deploy. Reports only whether
 * settings are present, never their values.
 */
export async function GET() {
  const expected = process.env.NORYX_SCHEMA_VERSION || null;
  const config = getSupabaseConfig();
  const settings = {
    siteUrl: publicEnv.siteUrl,
    siteUrlIsLocal: isLocalUrl(publicEnv.siteUrl),
    supabase: Boolean(config),
    supabaseSecretKey: Boolean(getSupabaseSecretKey()),
    assistant: Boolean(getAnthropicApiKey()),
  };

  let database: "ok" | "schema_outdated" | "unreachable" | "not_configured" = "not_configured";
  let applied: string | null = null;
  if (config) {
    const supabase = createClient<Database>(config.url, config.publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data, error } = await supabase.rpc("schema_version");
    if (error) {
      logDatabaseError("health.schema_version_failed", error);
      // A missing function means at least the migration that adds it hasn't been applied.
      database = isSchemaError(error) ? "schema_outdated" : "unreachable";
    } else {
      applied = data;
      database = expected && applied && applied < expected ? "schema_outdated" : "ok";
    }
  }

  // Locally a localhost site URL is right; on a deployment it breaks every email link.
  const healthy = database === "ok" && !(process.env.VERCEL && settings.siteUrlIsLocal);
  return Response.json(
    { status: healthy ? "ok" : "attention", database, schema: { expected, applied }, settings },
    { status: healthy ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}
