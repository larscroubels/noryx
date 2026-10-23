"use client";

import { Cookie } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useT } from "@/i18n/client";
import {
  COOKIE_CONSENT_COOKIE,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_SETTINGS_EVENT,
  type CookieConsent,
} from "@/lib/legal";

/**
 * Cookie banner: Accept and Refuse weigh the same, and the choice is stored for six
 * months. Today every cookie NORYX sets is strictly necessary or remembers a setting,
 * so both choices keep the site working the same way; optional cookies added later
 * must check the stored choice (parseCookieConsent) before they load.
 */
export function CookieNotice({ initiallyOpen }: { initiallyOpen: boolean }) {
  const c = useT().site.cookieNotice;
  const [open, setOpen] = useState(initiallyOpen);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(COOKIE_SETTINGS_EVENT, show);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, show);
  }, []);

  if (!open) return null;

  function choose(choice: CookieConsent) {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${COOKIE_CONSENT_COOKIE}=${choice}; path=/; max-age=${COOKIE_CONSENT_MAX_AGE}; samesite=lax${secure}`;
    setOpen(false);
  }

  return (
    <section
      aria-label={c.label}
      className="fixed inset-x-3 bottom-20 z-50 rounded-xl bg-surface p-4 shadow-xl ring-1 ring-border motion-safe:animate-pop-in print:hidden sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-md"
    >
      <div className="flex gap-3">
        <Cookie className="mt-0.5 size-5 shrink-0 text-rosegold-700" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold">{c.title}</h2>
          <p className="mt-1 text-sm text-fg-muted">
            {c.text}{" "}
            <Link href="/cookies" className="font-semibold text-pink-700 underline underline-offset-2">
              {c.more}
            </Link>
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button variant="secondary" size="sm" onClick={() => choose("necessary")}>
          {c.refuse}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => choose("all")}>
          {c.accept}
        </Button>
      </div>
    </section>
  );
}

/** Reopens the banner so a visitor can change their choice at any time. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT))}
      className="hover:text-fg"
    >
      {label}
    </button>
  );
}
