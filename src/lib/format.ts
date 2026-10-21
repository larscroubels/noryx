/**
 * Locale-aware display formatting. Money is always stored as integer minor units
 * (cents) to avoid floating-point rounding; EUR and Belgian conventions are defaults.
 */

export const DEFAULT_CURRENCY = "EUR";
export const DEFAULT_LOCALE = "nl-BE";
export const DEFAULT_TIME_ZONE = "Europe/Brussels";
/** Language of the NORYX interface itself (business data uses the business locale). */
export const UI_LOCALE = "en-GB";

export function formatMoney(
  amountCents: number,
  currency = DEFAULT_CURRENCY,
  locale = DEFAULT_LOCALE,
) {
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amountCents / 100);
}

/** Parses user input such as "45", "45,50" or "1.234,50" into cents. Returns null when invalid. */
export function parseMoneyToCents(input: string): number | null {
  const cleaned = input.trim().replace(/[€\s]/g, "");
  if (!cleaned) return null;
  // Treat the last separator as the decimal mark when followed by 1–2 digits.
  const match = /^(\d{1,3}(?:[.,\s]?\d{3})*|\d+)(?:[.,](\d{1,2}))?$/.exec(cleaned);
  if (!match) return null;
  const whole = Number(match[1]!.replace(/[.,\s]/g, ""));
  const fraction = match[2] ? Number(match[2].padEnd(2, "0")) : 0;
  const cents = whole * 100 + fraction;
  return Number.isSafeInteger(cents) ? cents : null;
}

/** Formats cents as an editable decimal string, e.g. 4550 → "45.50". */
export function centsToInput(amountCents: number) {
  return (amountCents / 100).toFixed(2);
}

export function formatDuration(totalMinutes: number, locale: string = UI_LOCALE) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const h = locale.startsWith("nl") ? "u" : "h";
  if (hours === 0) return `${minutes} min`;
  if (minutes === 0) return `${hours} ${h}`;
  return `${hours} ${h} ${minutes} min`;
}

type DateInput = Date | string;

const toDate = (value: DateInput) => (typeof value === "string" ? new Date(value) : value);

export function formatDate(
  value: DateInput,
  timeZone = DEFAULT_TIME_ZONE,
  options: Intl.DateTimeFormatOptions = {},
  locale: string = UI_LOCALE,
) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(toDate(value));
}

export function formatTime(value: DateInput, timeZone = DEFAULT_TIME_ZONE, locale: string = UI_LOCALE) {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(toDate(value));
}

export function formatDateTime(value: DateInput, timeZone = DEFAULT_TIME_ZONE, locale: string = UI_LOCALE) {
  return `${formatDate(value, timeZone, { weekday: "short" }, locale)} · ${formatTime(value, timeZone, locale)}`;
}

/** Formats a local "YYYY-MM-DD" date (no time-zone shift). */
export function formatLocalDate(
  date: string,
  options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" },
  locale: string = UI_LOCALE,
) {
  const [year, month, day] = date.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, { timeZone: "UTC", ...options }).format(
    new Date(Date.UTC(year!, month! - 1, day!)),
  );
}

export const ISO_WEEKDAYS = [1, 2, 3, 4, 5, 6, 7] as const;

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}
