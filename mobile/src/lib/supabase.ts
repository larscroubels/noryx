import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import type { Database } from "@/types/database";

import { secureStorage } from "./secure-storage";

/** Same project and publishable key as the website; never a service-role key. */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");
const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const isConfigured = Boolean(SUPABASE_URL && PUBLISHABLE_KEY && SITE_URL);

export const supabase = createClient<Database>(
  SUPABASE_URL || "https://not-configured.invalid",
  PUBLISHABLE_KEY || "not-configured",
  {
    auth: {
      storage: secureStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
);

// Refresh tokens only while the app is in the foreground.
AppState.addEventListener("change", (state) => {
  if (state === "active") void supabase.auth.startAutoRefresh();
  else void supabase.auth.stopAutoRefresh();
});
