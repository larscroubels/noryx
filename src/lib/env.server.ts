import "server-only";

/** Server-only secrets. Importing this module from client code fails the build. */
export function getSupabaseSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}
