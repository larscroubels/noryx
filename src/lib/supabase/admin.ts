import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getSupabaseConfig } from "@/lib/env";
import { getSupabaseSecretKey } from "@/lib/env.server";
import type { Database } from "@/types/database";

/**
 * Privileged client that BYPASSES row-level security. Only use it for narrowly
 * scoped server tasks that have already been authorised (e.g. creating an online
 * booking after validation). Never pass its results to the client unfiltered.
 */
export function createAdminClient() {
  const config = getSupabaseConfig();
  const secretKey = getSupabaseSecretKey();
  if (!config || !secretKey) return null;
  return createClient<Database>(config.url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
