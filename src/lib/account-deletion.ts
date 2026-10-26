import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

export type AccountDeletionResult =
  { ok: true } | { ok: false; error: "account_owns_business" | "failed" };

/**
 * Deletes the signed-in user's account. `client` must act as that user: the database
 * refuses while they are a salon's only owner and detaches their client records first,
 * so salons keep their customers and history.
 */
export async function deleteAccount(
  client: SupabaseClient<Database>,
  userId: string,
): Promise<AccountDeletionResult> {
  const { error } = await client.rpc("prepare_account_deletion");
  if (error) {
    if (error.message.includes("account_owns_business"))
      return { ok: false, error: "account_owns_business" };
    logger.error("account_deletion.prepare_failed", { code: error.code });
    return { ok: false, error: "failed" };
  }
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: "failed" };
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    logger.error("account_deletion.delete_failed", { status: deleteError.status });
    return { ok: false, error: "failed" };
  }
  return { ok: true };
}
