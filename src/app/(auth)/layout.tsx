import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Alert } from "@/components/ui/alert";
import { getT } from "@/i18n/server";
import { isSupabaseConfigured } from "@/lib/env";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-surface-subtle p-12 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 size-[32rem] rounded-full bg-champagne-100/70 blur-3xl" />
        <Link href="/" className="relative w-fit">
          <Logo variant="wordmark" height={24} priority />
        </Link>
        <div className="relative max-w-md">
          <Logo variant="symbol" height={88} alt="" className="mb-10" />
          <p className="font-display text-display-md font-semibold text-fg">
            {t.auth.panelTitleStart} <em className="text-pink-700">{t.auth.panelTitleEmphasis}</em>.
          </p>
          <p className="mt-4 text-base text-fg-muted">{t.auth.panelText}</p>
        </div>
        <p className="relative text-sm text-fg-muted">© {new Date().getFullYear()} NORYX</p>
      </aside>

      <main className="flex flex-col px-4 py-8 sm:px-8">
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link href="/" className="w-fit lg:invisible">
            <Logo variant="wordmark" height={20} priority />
          </Link>
          <LanguageSwitcher />
        </div>
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
          {!isSupabaseConfigured() && (
            <Alert tone="warning" title={t.auth.notConfiguredTitle} className="mb-6">
              {t.auth.notConfiguredText}
            </Alert>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
