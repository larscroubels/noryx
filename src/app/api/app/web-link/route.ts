import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { workspacePath } from "@/lib/app-web-link";
import { getSupabaseConfig, publicEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/types/database";

/**
 * One-time sign-in link for the NORYX app's "More" section: opens a workspace page
 * in the in-app browser already signed in. Bearer token only (no cookies, so another
 * site can't request one); the link only leads into /app and is sent to nobody —
 * generateLink returns it without emailing.
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
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as { next?: unknown } | null;
  const next = workspacePath(body?.next);
  if (!next) return NextResponse.json({ ok: false, error: "invalid_path" }, { status: 400 });

  if (!rateLimit(`app-web-link:${user.id}`, { limit: 10, windowMs: 60_000 }).allowed) {
    return NextResponse.json({ ok: false, error: "too_many_requests" }, { status: 429 });
  }

  const admin = createAdminClient();
  const { data, error } = admin
    ? await admin.auth.admin.generateLink({ type: "magiclink", email: user.email })
    : { data: null, error: new Error("admin client unavailable") };
  const hashed = data?.properties?.hashed_token;
  if (error || !hashed) {
    logger.error("app.web_link_failed", { message: error?.message });
    return NextResponse.json({ ok: false, error: "failed" }, { status: 500 });
  }

  const url = new URL("/auth/confirm", publicEnv.siteUrl ?? request.nextUrl.origin);
  url.searchParams.set("token_hash", hashed);
  url.searchParams.set("type", "magiclink");
  url.searchParams.set("next", next);
  return NextResponse.json({ ok: true, url: url.toString() });
}
