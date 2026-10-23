import { logger } from "@/lib/logger";

type DatabaseError = { code?: string; message?: string; details?: string | null; hint?: string | null };

/**
 * Postgres / PostgREST codes meaning the database lacks a table, column, function
 * or relationship this version of the code uses: the migrations haven't been applied.
 */
const SCHEMA_CODES = new Set(["42P01", "42703", "42883", "PGRST200", "PGRST202", "PGRST204", "PGRST205"]);

export function isSchemaError(error: DatabaseError | null | undefined) {
  return Boolean(error?.code && SCHEMA_CODES.has(error.code));
}

/**
 * Logs a failed database call with enough detail to find the cause in the server
 * logs. Constraint details (class 23) can contain customer data, so they are left out.
 */
export function logDatabaseError(event: string, error: DatabaseError) {
  logger.error(event, {
    code: error.code,
    message: error.message,
    hint: error.hint ?? undefined,
    details: error.code?.startsWith("23") ? undefined : (error.details ?? undefined),
  });
  if (isSchemaError(error)) {
    logger.error("database.schema_outdated", {
      event,
      advice:
        "The database is missing tables, columns or functions this version of NORYX uses. Apply the migrations in supabase/migrations to this Supabase project (supabase db push) and check /api/health.",
    });
  }
}
