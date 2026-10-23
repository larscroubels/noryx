import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { nextFromRedirect, safeNextPath } from "@/lib/validation/auth";

const OTP_TYPES: EmailOtpType[] = [
  "email",
  "signup",
  "recovery",
  "email_change",
  "invite",
  "magiclink",
];

/**
 * Verifies email links (sign-up confirmation, password recovery, email change).
 * Accepts both link styles: NORYX's templates (token_hash + type) and Supabase's
 * default templates, which verify first and then send a one-time `code`.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const code = searchParams.get("code");
  const next = safeNextPath(
    searchParams.get("next") ?? nextFromRedirect(searchParams.get("redirect_to")),
    "/app",
  );

  const supabase = await createClient();
  let error: string | null = "link_expired";
  if (tokenHash && type && OTP_TYPES.includes(type)) {
    const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (result.error) logger.warn("auth.verify_link_failed", { type, code: result.error.code });
    else error = null;
  } else if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    if (result.error) {
      logger.warn("auth.code_exchange_failed", { code: result.error.code });
      // Supabase only hands out a code after verifying the email address. The exchange
      // fails when the link is opened in another browser than the one used to sign up:
      // the address is confirmed, the visitor just has to sign in.
      if (next !== "/reset-password") error = "confirmed_sign_in";
    } else {
      error = null;
    }
  }

  if (!error) return NextResponse.redirect(new URL(next, request.nextUrl.origin));
  const target = new URL("/login", request.nextUrl.origin);
  target.searchParams.set("error", error);
  if (error === "confirmed_sign_in" && next !== "/app") target.searchParams.set("next", next);
  return NextResponse.redirect(target);
}
