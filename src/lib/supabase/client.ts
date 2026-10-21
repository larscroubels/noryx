"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/** Browser Supabase client (user session from cookies). Prefer server actions for writes. */
export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  return createBrowserClient<Database>(config.url, config.publishableKey);
}
