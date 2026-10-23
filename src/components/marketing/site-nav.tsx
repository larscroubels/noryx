"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { isSiteNavActive } from "@/lib/navigation";

export type SiteNavItem = { href: string; label: string };

/** Main website navigation from the xl breakpoint; the current page is underlined, not only coloured. */
export function SiteNav({ items, label }: { items: SiteNavItem[]; label: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label={label} className="hidden flex-1 justify-center xl:flex">
      <ul className="flex items-center gap-1">
        {items.map((item) => {
          const active = isSiteNavActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative block rounded-md px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors hover:bg-surface-subtle hover:text-fg",
                  "after:absolute after:inset-x-3 after:-bottom-px after:h-0.5 after:rounded-full after:transition-opacity",
                  active ? "text-fg after:bg-pink-700 after:opacity-100" : "text-fg-muted after:opacity-0",
                )}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
