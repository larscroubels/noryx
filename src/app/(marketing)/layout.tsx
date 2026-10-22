import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { SiteMenu } from "@/components/marketing/site-menu";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { getSessionUser } from "@/lib/auth/session";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const [user, t] = await Promise.all([getSessionUser(), getT()]);
  const nav = [
    // Section links on the home page; shown in the header from the xl breakpoint.
    { href: "/#features", label: t.marketing.nav.features, wide: true },
    { href: "/#booking", label: t.marketing.nav.booking },
    { href: "/#for-you", label: t.marketing.nav.forYou, wide: true },
    { href: "/#app", label: t.appShowcase.nav, wide: true },
    { href: "/pricing", label: t.marketing.nav.pricing },
    { href: "/faq", label: t.marketing.nav.faq },
    { href: "/help", label: t.marketing.nav.help },
  ];
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-surface/85 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-18 lg:gap-6">
          <Link href="/" className="shrink-0" aria-label="NORYX">
            <Logo variant="wordmark" height={20} priority alt="NORYX" />
          </Link>
          <nav
            aria-label={t.common.mainNavigation}
            className="hidden flex-1 justify-center lg:flex"
          >
            <ul className="flex gap-1">
              {nav.map((item) => (
                <li key={item.href} className={item.wide ? "hidden xl:block" : undefined}>
                  <a
                    href={item.href}
                    className="rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap text-fg-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
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
            <SiteMenu
              items={nav.map(({ href, label }) => ({ href, label }))}
              account={
                user
                  ? [{ href: "/app", label: t.common.openWorkspace, primary: true }]
                  : [
                      { href: "/signup", label: t.common.getStarted, primary: true },
                      { href: "/login", label: t.common.signIn },
                    ]
              }
            />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-border bg-surface-subtle">
        <div className="container-page grid gap-10 py-12 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo variant="wordmark" height={18} />
            <p className="mt-4 max-w-sm text-sm text-fg-muted">{t.marketing.footer.tagline}</p>
          </div>
          <div>
            <p className="text-sm font-semibold">{t.marketing.footer.product}</p>
            <ul className="mt-3 grid gap-2 text-sm text-fg-muted">
              {nav.map((item) => (
                <li key={item.href}>
                  <a href={item.href} className="hover:text-fg">
                    {item.label}
                  </a>
                </li>
              ))}
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
        <div className="container-page border-t border-border py-6 text-sm text-fg-muted">
          © {new Date().getFullYear()} NORYX. {t.common.allRightsReserved}
        </div>
      </footer>
    </div>
  );
}
