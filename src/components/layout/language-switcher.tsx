"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocale } from "@/i18n/actions";
import { useLocale, useT } from "@/i18n/client";
import { LOCALE_LABELS, LOCALES } from "@/i18n/config";
import { cn } from "@/lib/cn";

/** NL | EN toggle. Stores the choice in a cookie and re-renders the page. */
export function LanguageSwitcher({ className }: { className?: string }) {
  const current = useLocale();
  const t = useT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div
      role="group"
      aria-label={t.common.language}
      className={cn("inline-flex shrink-0 rounded-full border border-border-strong bg-surface p-0.5", pending && "opacity-70", className)}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          lang={locale}
          aria-pressed={locale === current}
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await setLocale(locale);
              router.refresh();
            })
          }
          className={cn(
            "rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
            locale === current ? "bg-pink-700 text-white" : "text-fg-muted hover:text-fg",
          )}
        >
          {LOCALE_LABELS[locale].short}
          {/* The accessible name keeps the visible code and adds the full language name. */}
          <span className="sr-only"> ({LOCALE_LABELS[locale].name})</span>
        </button>
      ))}
    </div>
  );
}
