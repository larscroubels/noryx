"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { useT } from "@/i18n/client";

/** Compact menu for the public website below the large breakpoint. */
export function SiteMenu({
  items,
  account,
}: {
  items: { href: string; label: string }[];
  /** Sign-in / get-started links, which don't fit next to the logo on small screens. */
  account: { href: string; label: string; primary?: boolean }[];
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
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
    <div ref={panel} className="relative lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="site-menu"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-10 items-center justify-center rounded-md text-fg hover:bg-surface-muted"
      >
        {open ? (
          <X className="size-5" aria-hidden="true" />
        ) : (
          <Menu className="size-5" aria-hidden="true" />
        )}
        <span className="sr-only">{open ? t.common.closeNavigation : t.common.openNavigation}</span>
      </button>
      {open && (
        <nav
          id="site-menu"
          aria-label={t.common.mainNavigation}
          className="absolute top-12 right-0 z-50 w-60 rounded-xl border border-border bg-surface p-2 shadow-lg motion-safe:animate-pop-in"
        >
          <ul className="grid">
            {items.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-3 py-2.5 text-sm font-semibold text-fg hover:bg-surface-subtle"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-2 grid gap-2 border-t border-border p-2 pt-3 sm:hidden">
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
        </nav>
      )}
    </div>
  );
}
