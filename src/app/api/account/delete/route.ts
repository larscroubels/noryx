import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { deleteAccount } from "@/lib/account-deletion";
import { getSupabaseConfig } from "@/lib/env";
import type { Database } from "@/types/database";

/**
 * Account deletion for the NORYX app, authenticated with a bearer access token only.
 * Session cookies are not accepted, so another site can't trigger it; the website
 * uses the confirmed server action under Account instead.
 */
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.match(/^Bearer (.+)$/i)?.[1];
  const config = getSupabaseConfig();
  const client =
    token && config
      ? createClient<Database>(config.url, config.publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        })
      : null;
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
