import type { Dictionary } from "@/i18n/dictionaries";
import { cn } from "@/lib/cn";

/**
 * Static illustrations of NORYX for the website. They are decorative (aria-hidden):
 * the texts next to them describe the same features in words.
 */

export function BookingPreview({ labels }: { labels: Dictionary["marketing"]["booking"]["preview"] }) {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-sm">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-rosegold-100/70 via-transparent to-champagne-100/80 blur-2xl" />
      <div className="relative rounded-[2rem] bg-surface p-5 shadow-xl ring-1 ring-neutral-200/80">
        <div className="h-1 rounded-full bg-rosegold-400" />
        <p className="mt-5 font-display text-2xl font-semibold">{labels.title}</p>
        <div className="mt-4 flex gap-2">
          {labels.days.map(([day, num], i) => (
            <div
              key={day}
              className={cn(
                "flex w-14 flex-col items-center rounded-lg border py-2",
                i === 1 ? "border-pink-700 bg-pink-700 text-white" : "border-border",
              )}
            >
              <span className="text-[0.65rem] font-semibold uppercase">{day}</span>
              <span className="text-base font-semibold">{num}</span>
            </div>
          ))}
        </div>
        <p className="mt-5 text-xs font-semibold text-fg-muted">{labels.morning}</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {["09:00", "09:30", "10:15", "10:45", "11:00", "11:30"].map((time, i) => (
            <span
              key={time}
              className={cn(
                "flex h-10 items-center justify-center rounded-lg border text-sm font-semibold",
                i === 2 ? "border-pink-700 bg-pink-700 text-white" : "border-border",
              )}
            >
              {time}
            </span>
          ))}
        </div>
        <div className="mt-5 flex h-11 items-center justify-center rounded-md bg-pink-700 text-sm font-semibold text-white">
          {labels.confirm}
        </div>
      </div>
    </div>
  );
}

/** A calm snapshot of the workspace's day overview, built from the hero demo's labels. */
export function WorkspacePreview({ labels }: { labels: Dictionary["marketing"]["demo"] }) {
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-champagne-100/80 via-transparent to-rosegold-100/70 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl bg-surface shadow-xl ring-1 ring-neutral-200/80">
        <div className="flex items-center gap-1.5 border-b border-border bg-surface-subtle px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="ml-3 rounded-full bg-surface px-3 py-0.5 text-[0.65rem] text-fg-muted ring-1 ring-border">
            {labels.url}
          </span>
        </div>
        <div className="p-5">
          <p className="text-[0.65rem] font-semibold tracking-wider text-rosegold-700">{labels.weekday}</p>
          <p className="mt-1 font-display text-xl font-semibold">{labels.greeting}</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {labels.stats.map((stat, i) => (
              <div key={stat} className="rounded-lg p-2.5 ring-1 ring-border">
                <p className="text-[0.65rem] text-fg-muted">{stat}</p>
                <p className="text-lg font-semibold">{[4, 21, 3][i]}</p>
              </div>
            ))}
          </div>
          <ul className="mt-4 grid gap-2">
            {labels.rows.map((row) => (
              <li
                key={row.time}
                className="flex items-center gap-3 rounded-lg border-l-4 border-pink-700 bg-pink-50/60 px-3 py-2 text-xs"
              >
                <span className="font-semibold tabular-nums">{row.time}</span>
                <span className="font-semibold">{row.name}</span>
                <span className="ml-auto text-fg-muted">{row.service}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
