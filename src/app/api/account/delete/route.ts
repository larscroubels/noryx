import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { deleteAccount } from "@/lib/account-deletion";
import { getSupabaseConfig } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

/** Signed-in client: a bearer access token (the NORYX app) or the session cookie (website). */
async function userClient(token: string | undefined) {
  if (!token) return createClient();
  const config = getSupabaseConfig();
  if (!config) return null;
  return createSupabaseClient<Database>(config.url, config.publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}

export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const client = await userClient(token);
  const user = client ? (await client.auth.getUser(token)).data.user : null;
  if (!client || !user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await deleteAccount(client, user.id);
  if (result.ok) return NextResponse.json(result);
  return NextResponse.json(result, {
    status: result.error === "account_owns_business" ? 400 : 500,
  });
}
