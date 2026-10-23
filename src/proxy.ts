import { NextResponse, type NextRequest } from "next/server";

import { PATHNAME_HEADER } from "@/i18n/config";
import { customDomainPath, isPlatformHost, slugForHost } from "@/lib/custom-domains";
import { updateSession } from "@/lib/supabase/proxy";

/** Routes that need a signed-in user. Real authorisation happens again on the server and in RLS. */
const PROTECTED_PREFIXES = ["/app", "/onboarding", "/admin"];
/** Auth pages that signed-in users should skip. */
const GUEST_ONLY = ["/login", "/signup", "/forgot-password"];

export async function proxy(request: NextRequest) {
  // Always overwritten, so a visitor can't pick another route's language by sending it.
  request.headers.set(PATHNAME_HEADER, request.nextUrl.pathname);

  // The own-domain extra (Pro): a business's own domain shows its public page.
  const host = request.headers.get("host") ?? "";
  if (host && !isPlatformHost(host)) {
    const slug = await slugForHost(host);
    const target = slug ? customDomainPath(slug, request.nextUrl.pathname) : null;
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      request.headers.set(PATHNAME_HEADER, target);
      return NextResponse.rewrite(url, { request: { headers: request.headers } });
    }
  }

  const { pathname, search, searchParams } = request.nextUrl;
  // When a redirect URL isn't on Supabase's allow list, email links land on the Site URL
  // itself (/?code=… or /?token_hash=…). Finish the verification instead of ignoring it.
  if (pathname === "/" && (searchParams.has("code") || searchParams.has("token_hash"))) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/confirm";
    return NextResponse.redirect(url);
  }

  const { response, userId } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (isProtected && !userId) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }

  if (userId && GUEST_ONLY.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Skip static files, images and metadata assets.
    "/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|opengraph-image.png|manifest.webmanifest|brand/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
