"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";

export type NavItem = { href: string; label: string; icon: ReactNode; exact?: boolean };

export function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  const t = useT();
  return (
    <nav aria-label={t.common.mainNavigation}>
      <ul className="grid gap-0.5">
        {items.map((item) => {
          const current = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition-colors [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
                  current
                    ? "bg-surface text-fg shadow-xs"
                    : "text-fg-muted hover:bg-surface/70 hover:text-fg",
                )}
              >
                {current && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-rosegold-400"
                  />
                )}
                <span
                  className={cn(
                    current ? "text-pink-700" : "text-fg-subtle group-hover:text-fg-muted",
                  )}
                >
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
