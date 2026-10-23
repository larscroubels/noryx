import "server-only";

/** Server-only secrets. Importing this module from client code fails the build. */
export function getSupabaseSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || null;
}

/** Anthropic API key for the website assistant. Without it the assistant falls back to searching the FAQ and help centre. */
export function getAnthropicApiKey(): string | null {
  return process.env.ANTHROPIC_API_KEY || null;
}
