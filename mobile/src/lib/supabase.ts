import { createClient } from "@supabase/supabase-js";
import { AppState } from "react-native";

import type { Database } from "@/types/database";

import { PUBLISHABLE_KEY, SUPABASE_URL } from "./env";
import { secureStorage } from "./secure-storage";

export { isConfigured, SITE_URL } from "./env";

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
