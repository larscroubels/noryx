"use client";

import { useT } from "@/i18n/client";
import { useState } from "react";

import { Switch } from "@/components/ui/choice";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import { ISO_WEEKDAYS } from "@/lib/format";
import { minutesToTime } from "@/lib/time";

type Range = { weekday: number; start_minute: number; end_minute: number };

type DayState = { open: boolean; start: string; end: string; breakStart: string; breakEnd: string };

function initialDays(ranges: Range[]): Record<number, DayState> {
  const days: Record<number, DayState> = {};
  for (const value of ISO_WEEKDAYS) {
    const forDay = ranges
      .filter((range) => range.weekday === value)
      .sort((a, b) => a.start_minute - b.start_minute);
    const first = forDay[0];
    const last = forDay[forDay.length - 1];
    days[value] = {
      open: forDay.length > 0,
      start: first ? minutesToTime(first.start_minute) : "09:00",
      end: last ? minutesToTime(last.end_minute) : "18:00",
      breakStart: forDay.length > 1 ? minutesToTime(forDay[0]!.end_minute) : "",
      breakEnd: forDay.length > 1 ? minutesToTime(forDay[1]!.start_minute) : "",
    };
  }
  return days;
}

/** Weekly schedule inputs; field names are read by parseWeeklyHours on the server. */
export function WeeklyHoursEditor({
  initial,
  allowBreaks = false,
  errors = {},
}: {
  initial: Range[];
  allowBreaks?: boolean;
  errors?: Record<string, string[] | undefined>;
}) {
  const [days, setDays] = useState(() => initialDays(initial));
  const t = useT();
  const update = (weekday: number, patch: Partial<DayState>) =>
    setDays((current) => ({ ...current, [weekday]: { ...current[weekday]!, ...patch } }));

  return (
    <fieldset className="grid gap-2">
      <legend className="sr-only">{t.common.hours.weeklyHours}</legend>
      {ISO_WEEKDAYS.map((value) => {
        const label = t.common.weekdays[value - 1]!;
        const day = days[value]!;
        const error = errors[`day-${value}`]?.[0];
        const id = `day-${value}`;
        return (
          <div
            key={value}
            className={cn(
              "grid gap-3 rounded-lg border px-4 py-3 sm:grid-cols-[9rem_1fr] sm:items-center",
              day.open ? "border-border bg-surface" : "border-transparent bg-surface-subtle",
              error && "border-danger-600",
            )}
          >
            <div className="flex items-center gap-3">
              <Switch
                id={`${id}-open`}
                name={`${id}-open`}
                value="on"
                checked={day.open}
                onCheckedChange={(open) => update(value, { open })}
                aria-label={t.common.hours.openOn(label)}
              />
              <label htmlFor={`${id}-open`} className="text-sm font-semibold">
                {label}
              </label>
            </div>
            {day.open ? (
              <div className="grid gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Input
                    type="time"
                    name={`${id}-start`}
                    value={day.start}
                    onChange={(event) => update(value, { start: event.target.value })}
                    aria-label={t.common.hours.start(label)}
                    className="w-32"
                    step={300}
                  />
                  <span className="text-sm text-fg-muted">{t.common.hours.to}</span>
                  <Input
                    type="time"
                    name={`${id}-end`}
                    value={day.end}
                    onChange={(event) => update(value, { end: event.target.value })}
                    aria-label={t.common.hours.end(label)}
                    className="w-32"
                    step={300}
                  />
                  {allowBreaks && (
                    <div className="flex flex-wrap items-center gap-2 sm:ml-3">
                      <span className="text-sm text-fg-muted">{t.common.hours.break}</span>
                      <Input
                        type="time"
                        name={`${id}-break-start`}
                        value={day.breakStart}
                        onChange={(event) => update(value, { breakStart: event.target.value })}
                        aria-label={t.common.hours.breakStart(label)}
                        className="w-32"
                        step={300}
                      />
                      <span className="text-sm text-fg-muted">–</span>
                      <Input
                        type="time"
                        name={`${id}-break-end`}
                        value={day.breakEnd}
                        onChange={(event) => update(value, { breakEnd: event.target.value })}
                        aria-label={t.common.hours.breakEnd(label)}
                        className="w-32"
                        step={300}
                      />
                    </div>
                  )}
                </div>
                {error && <FieldError>{error}</FieldError>}
              </div>
            ) : (
              <p className="text-sm text-fg-muted">{t.common.hours.closed}</p>
            )}
          </div>
        );
      })}
    </fieldset>
  );
}
