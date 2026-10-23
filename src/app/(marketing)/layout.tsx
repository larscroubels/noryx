import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { AssistantWidget } from "@/components/marketing/assistant/assistant-widget";
import { SiteMenu } from "@/components/marketing/site-menu";
import { SiteNav } from "@/components/marketing/site-nav";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { getSessionUser } from "@/lib/auth/session";
import { SITE_NAV } from "@/lib/navigation";

const LEGAL_LINKS = [
  ["/privacy", "privacy"],
  ["/cookies", "cookies"],
  ["/terms", "terms"],
  ["/legal", "notice"],
] as const;

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [user, t] = await Promise.all([getSessionUser(), getT()]);
  const nav = SITE_NAV.map((item) => ({ href: item.href, label: t.marketing.nav[item.key] }));
  const account = user
    ? [{ href: "/app", label: t.common.openWorkspace, primary: true }]
    : [
        { href: "/signup", label: t.common.getStarted, primary: true },
        { href: "/login", label: t.common.signIn },
      ];
  return (
    <div className="min-h-dvh bg-canvas">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:rounded-md focus:bg-surface focus:px-4 focus:py-2 focus:font-semibold focus:shadow-lg"
      >
        {t.common.skipToContent}
      </a>
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/90 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-18 xl:gap-6">
          <Link href="/" className="shrink-0" aria-label="NORYX">
            <Logo variant="wordmark" height={20} priority alt="NORYX" />
          </Link>
          <SiteNav items={nav} label={t.common.mainNavigation} />
          <div className="ml-auto flex items-center gap-2 xl:ml-0">
            <LanguageSwitcher />
            {user ? (
              <Button asChild size="sm" className="hidden sm:inline-flex sm:h-10 sm:px-4">
                <Link href="/app">{t.common.openWorkspace}</Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:inline-flex">
                  <Link href="/login">{t.common.signIn}</Link>
                </Button>
                <Button asChild size="sm" className="hidden sm:inline-flex sm:h-10 sm:px-4">
                  <Link href="/signup">{t.common.getStarted}</Link>
                </Button>
              </>
            )}
            <SiteMenu items={nav} account={account} />
          </div>
        </div>
      </header>
      <main id="main">{children}</main>
      <footer className="border-t border-border bg-surface-subtle">
        <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div>
            <Logo variant="wordmark" height={18} />
            <p className="mt-4 max-w-sm text-sm text-fg-muted">{t.marketing.footer.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.marketing.footer.product}</p>
            <ul className="mt-3 grid gap-2 text-sm text-fg-muted">
              {nav.slice(0, 4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.site.support.title}</p>
            <ul className="mt-3 grid gap-2 text-sm text-fg-muted">
              {nav.slice(4).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/help#contact" className="hover:text-fg">
                  {t.site.support.contact.title}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.marketing.footer.account}</p>
            <ul className="mt-3 grid gap-2 text-sm text-fg-muted">
              <li>
                <Link href="/signup" className="hover:text-fg">
                  {t.marketing.footer.createAccount}
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-fg">
                  {t.common.signIn}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="container-page flex flex-col gap-3 border-t border-border py-6 text-sm text-fg-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} NORYX. {t.common.allRightsReserved}
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_LINKS.map(([href, key]) => (
              <li key={href}>
                <Link href={href} className="hover:text-fg">
                  {t.site.legal[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </footer>
      <AssistantWidget />
    </div>
  );
}
