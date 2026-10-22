/**
 * Public business pages live at noryx.app/<slug>. Slugs must never collide with
 * application routes, so every top-level route (present and planned) is reserved.
 */
export const RESERVED_SLUGS = new Set([
  "about",
  "account",
  "admin",
  "api",
  "app",
  "apps",
  "auth",
  "billing",
  "blog",
  "book",
  "booking",
  "brand",
  "careers",
  "contact",
  "cookies",
  "dashboard",
  "demo",
  "design-system",
  "docs",
  "download",
  "explore",
  "faq",
  "features",
  "forgot-password",
  "help",
  "home",
  "invite",
  "invites",
  "legal",
  "login",
  "logout",
  "manifest",
  "noryx",
  "onboarding",
  "partners",
  "press",
  "pricing",
  "privacy",
  "register",
  "reset-password",
  "salon",
  "salons",
  "security",
  "settings",
  "shop",
  "signin",
  "signout",
  "signup",
  "static",
  "status",
  "support",
  "terms",
  "www",
]);

export const SLUG_PATTERN = /^[a-z0-9][a-z0-9-]{1,46}[a-z0-9]$/;

/** "Studio Lumière & Co" → "studio-lumiere-co" */
export function slugify(input: string) {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

export function isReservedSlug(slug: string) {
  return RESERVED_SLUGS.has(slug);
}
