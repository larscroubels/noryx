"use client";

import { Clock3, LogIn, LogOut } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { useIntlLocale, useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { cn } from "@/lib/cn";
import { formatDuration, formatTime } from "@/lib/format";

import { toggleClock } from "./actions";

/** Clock in / clock out with a running timer while clocked in. */
export function ClockCard({
  openSince,
  serverNow,
  timeZone,
  compact = false,
}: {
  /** ISO start of the open registration, or null when clocked out. */
  openSince: string | null;
  serverNow: number;
  timeZone: string;
  compact?: boolean;
}) {
  const t = useT();
  const c = t.timeClock;
  const intl = useIntlLocale();
  const [state, action] = useActionState(toggleClock, IDLE);
  const [now, setNow] = useState(serverNow);

  useEffect(() => {
    if (!openSince) return;
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, [openSince]);

  const minutes = openSince
    ? Math.max(0, Math.floor((now - new Date(openSince).getTime()) / 60_000))
    : 0;

  return (
    <form
      action={action}
      className={cn(
        "flex flex-wrap items-center gap-4 rounded-xl bg-surface ring-1 ring-neutral-200/70",
        compact ? "p-4" : "p-5 shadow-sm sm:p-6",
      )}
    >
      <input type="hidden" name="direction" value={openSince ? "out" : "in"} />
      <span
        aria-hidden="true"
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-full ring-1",
          openSince ? "bg-success-50 text-success-700 ring-success-100" : "bg-surface-subtle text-fg-muted ring-border",
        )}
      >
        <Clock3 className="size-5" />
      </span>
      <div className="min-w-0 flex-1" aria-live="polite">
        <p className="font-semibold">{openSince ? c.clockedIn : c.clockedOut}</p>
        {openSince && (
          <p className="text-sm text-fg-muted">
            {c.since(formatTime(openSince, timeZone, intl))} ·{" "}
            <span className="font-semibold text-fg tabular-nums">{formatDuration(minutes, intl)}</span>
          </p>
        )}
      </div>
      <SubmitButton variant={openSince ? "secondary" : "primary"}>
        {openSince ? <LogOut aria-hidden="true" /> : <LogIn aria-hidden="true" />}
        {openSince ? c.clockOut : c.clockIn}
      </SubmitButton>
      {state.status === "error" && (
        <div className="w-full">
          <FormAlert state={state} />
        </div>
      )}
    </form>
  );
}
