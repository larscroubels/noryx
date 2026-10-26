/** Same project and publishable key as the website; never a service-role key. */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";
export const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

export const isConfigured = Boolean(SUPABASE_URL && PUBLISHABLE_KEY && SITE_URL);
