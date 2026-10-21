import {
  CalendarDays,
  Clock4,
  ExternalLink,
  LayoutDashboard,
  LifeBuoy,
  Package,
  Scissors,
  Settings,
  ShoppingBag,
  UserCog,
  UserRound,
  UsersRound,
  Wallet,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";
import { BusinessSwitcher } from "@/components/layout/business-switcher";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { MobileNav } from "@/components/layout/mobile-nav";
import { SidebarNav, type NavItem } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { getT } from "@/i18n/server";
import { requireWorkspace } from "@/lib/auth/session";
import { getEntitlements } from "@/lib/billing/entitlements";
import { visibleNav, type WorkspaceNavKey } from "@/lib/navigation";

import { signOut } from "../(auth)/actions";
import { switchBusiness } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: { default: (await getT()).app.metaTitle, template: "%s · NORYX" },
    robots: { index: false },
  };
}

const ICONS: Record<WorkspaceNavKey, React.ReactNode> = {
  overview: <LayoutDashboard />,
  calendar: <CalendarDays />,
  customers: <UsersRound />,
  services: <Scissors />,
  staff: <UserRound />,
  schedule: <Clock4 />,
  team: <UserCog />,
  products: <Package />,
  orders: <ShoppingBag />,
  finance: <Wallet />,
  settings: <Settings />,
  help: <LifeBuoy />,
};

export default async function WorkspaceLayout({ children }: LayoutProps<"/app">) {
  const workspace = await requireWorkspace();
  const { business, user } = workspace;
  const [entitlements, t] = await Promise.all([getEntitlements(business.id), getT()]);
  const items: NavItem[] = visibleNav(workspace.permissions, entitlements.features).map((item) => ({
    href: item.href,
    label: t.app.nav[item.key],
    icon: ICONS[item.key],
    exact: item.exact,
  }));
  const displayName = user.fullName || user.email || t.app.account;
  const switcher = (
    <BusinessSwitcher
      current={{ id: business.id, name: business.name }}
      options={workspace.memberships.map((m) => ({ id: m.business.id, name: m.business.name }))}
      switchAction={switchBusiness}
    />
  );
  const userMenu = (
    <UserMenu
      name={displayName}
      email={user.email}
      roleLabel={t.common.roles[workspace.role]}
      signOutAction={signOut}
    />
  );

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16.5rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh flex-col border-r border-border bg-surface-subtle px-4 py-5 lg:flex">
        <Link href="/app" className="mb-6 flex items-center gap-2.5 px-2">
          <Logo variant="symbol" height={28} alt="" />
          <Logo variant="wordmark" height={16} />
        </Link>
        <div className="mb-4">{switcher}</div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav items={items} />
        </div>
        <div className="border-t border-border pt-3">{userMenu}</div>
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-surface/90 px-4 backdrop-blur-sm sm:px-6 lg:h-16 lg:px-8">
          <MobileNav
            items={items}
            brand={<Logo variant="wordmark" height={18} />}
            footer={
              <div className="grid gap-3">
                {switcher}
                {userMenu}
              </div>
            }
          />
          <Link href="/app" className="lg:hidden">
            <Logo variant="symbol" height={26} />
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <LanguageSwitcher />
            {business.booking_enabled && (
              <Button asChild variant="secondary" size="sm">
                <a href={`/${business.slug}`} target="_blank" rel="noreferrer">
                  <ExternalLink aria-hidden="true" />
                  <span className="hidden sm:inline">{t.app.viewBookingPage}</span>
                  <span className="sr-only sm:hidden">{t.app.bookingPage}</span>
                </a>
              </Button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {business.status !== "active" && (
            <Alert tone="warning" title={t.app.readOnlyTitle} className="mb-6">
              {t.app.readOnlyText(business.status === "suspended")}
            </Alert>
          )}
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
