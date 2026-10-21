import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Logo } from "@/components/brand/logo";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { Badge } from "@/components/ui/badge";
import { getT } from "@/i18n/server";
import { isPlatformAdmin, requireUser } from "@/lib/auth/session";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT()).admin.metaTitle, robots: { index: false } };
}

export default async function AdminLayout({ children }: LayoutProps<"/admin">) {
  await requireUser("/admin");
  // Not a hidden URL: every request is checked server-side, and every admin RPC checks again in the database.
  if (!(await isPlatformAdmin())) notFound();
  const t = await getT();
  return (
    <div className="min-h-dvh bg-surface-subtle">
      <header className="border-b border-border bg-surface">
        <div className="container-page flex h-16 items-center gap-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo variant="wordmark" height={18} />
          </Link>
          <Badge tone="brand">{t.admin.badge}</Badge>
          <div className="ml-auto flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/app" className="text-sm font-semibold text-fg-muted hover:text-fg">
              {t.admin.back}
            </Link>
          </div>
        </div>
      </header>
      <main className="container-page py-8">{children}</main>
    </div>
  );
}
