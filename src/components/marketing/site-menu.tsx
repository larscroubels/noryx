"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { isSiteNavActive } from "@/lib/navigation";

import type { SiteNavItem } from "./site-nav";

/** Fold-out menu for the public website below the xl breakpoint. */
export function SiteMenu({
  items,
  account,
}: {
  items: SiteNavItem[];
  /** Sign-in / get-started links, which don't fit next to the logo on small screens. */
  account: { href: string; label: string; primary?: boolean }[];
}) {
  const t = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    const outside = (event: MouseEvent) =>
      panel.current && !panel.current.contains(event.target as Node) && setOpen(false);
    document.addEventListener("keydown", close);
    document.addEventListener("mousedown", outside);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("mousedown", outside);
    };
  }, [open]);

  return (
    <div ref={panel} className="xl:hidden">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-md text-fg hover:bg-surface-muted"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        <span className="sr-only">{open ? t.common.closeNavigation : t.common.openNavigation}</span>
      </button>
      {open && (
        <nav
          id="site-menu"
          aria-label={t.common.mainNavigation}
          className="absolute inset-x-0 top-full border-b border-border bg-surface shadow-lg motion-safe:animate-pop-in"
        >
          <div className="container-page grid gap-4 py-4 sm:py-6">
            <ul className="grid gap-1 sm:grid-cols-2">
              {items.map((item) => {
                const active = isSiteNavActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg px-3 py-3 font-semibold hover:bg-surface-subtle",
                        active ? "bg-surface-subtle text-pink-700" : "text-fg",
                      )}
                    >
                      {item.label}
                      <ArrowRight
                        className={cn("size-4 shrink-0", active ? "opacity-100" : "opacity-0")}
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
            {/* From sm the header itself shows these buttons. */}
            <div className="grid gap-2 border-t border-border pt-4 sm:hidden">
              {account.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={
                    link.primary
                      ? "rounded-md bg-pink-700 px-3 py-2.5 text-center text-sm font-semibold text-white hover:bg-pink-800"
                      : "rounded-md px-3 py-2.5 text-center text-sm font-semibold text-fg ring-1 ring-border hover:bg-surface-subtle"
                  }
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </div>
  );
}
