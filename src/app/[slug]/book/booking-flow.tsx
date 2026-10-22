"use client";

import {
  ArrowLeft,
  CalendarCheck2,
  CalendarPlus,
  Check,
  Clock,
  Clock3,
  Sparkles,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Field, FieldError } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/feedback";
import { useIntlLocale, useT } from "@/i18n/client";
import { cn } from "@/lib/cn";
import { formatDuration, formatLocalDate, formatMoney, formatTime } from "@/lib/format";
import { addDays, isoWeekday, todayInZone } from "@/lib/time";

import type { PublicBusiness } from "@/lib/booking/public";

import { getAvailability, submitBooking, type BookingResult, type PublicSlot } from "./actions";

type Step = "service" | "staff" | "time" | "details" | "done";

function eligible(business: PublicBusiness, serviceId: string) {
  const service = business.services.find((s) => s.id === serviceId);
  if (!service) return [];
  return business.staff.flatMap((member) => {
    const link = member.services.find((s) => s.service_id === serviceId);
    return link
      ? [
          {
            ...member,
            durationMinutes: link.duration_minutes ?? service.duration_minutes,
            priceCents: link.price_cents ?? service.promo_price_cents ?? service.price_cents,
          },
        ]
      : [];
  });
}

function downloadIcs(title: string, startsAt: string, endsAt: string, location: string) {
  const stamp = (iso: string) => iso.replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const escape = (text: string) => text.replace(/[\\,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n");
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NORYX//Booking//EN",
    "BEGIN:VEVENT",
    `UID:${crypto.randomUUID()}@noryx`,
    `DTSTAMP:${stamp(new Date().toISOString())}`,
    `DTSTART:${stamp(startsAt)}`,
    `DTEND:${stamp(endsAt)}`,
    `SUMMARY:${escape(title)}`,
    `LOCATION:${escape(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "appointment.ics";
  link.click();
  URL.revokeObjectURL(url);
}

export function BookingFlow({
  business,
  initialServiceId,
  emailConfigured,
}: {
  business: PublicBusiness;
  initialServiceId?: string;
  emailConfigured: boolean;
}) {
  const t = useT();
  const f = t.booking.flow;
  const intl = useIntlLocale();
  const day = (value: string, options?: Intl.DateTimeFormatOptions) =>
    formatLocalDate(value, options, intl);
  const tz = business.timezone;
  const money = (cents: number) => formatMoney(cents, business.currency, business.locale);
  const location = business.locations[0];
  const address = location
    ? [location.address_line1, [location.postal_code, location.city].filter(Boolean).join(" ")]
        .filter(Boolean)
        .join(", ")
    : business.name;

  const startService =
    initialServiceId && business.services.some((s) => s.id === initialServiceId)
      ? initialServiceId
      : "";
  const [serviceId, setServiceId] = useState(startService);
  const [staffId, setStaffId] = useState<string>("any");
  const [step, setStep] = useState<Step>(
    startService ? (business.policy.allow_staff_choice ? "staff" : "time") : "service",
  );
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState<PublicSlot[] | null>(null);
  const [slot, setSlot] = useState<PublicSlot | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [result, setResult] = useState<BookingResult | null>(null);
  const [loadingSlots, startLoadingSlots] = useTransition();
  const [submitting, startSubmitting] = useTransition();
  const headingRef = useRef<HTMLHeadingElement>(null);

  const service = business.services.find((s) => s.id === serviceId);
  const staffOptions = useMemo(
    () => (serviceId ? eligible(business, serviceId) : []),
    [business, serviceId],
  );
  const chosenStaff = staffOptions.find((s) => s.id === staffId);

  // Days within the booking horizon where at least one eligible professional works.
  const days = useMemo(() => {
    const today = todayInZone(tz);
    const count = Math.min(business.policy.horizon_days + 1, 42);
    const people = staffId === "any" ? staffOptions : staffOptions.filter((s) => s.id === staffId);
    const locationDays = new Set(location?.hours.map((h) => h.weekday));
    return Array.from({ length: count }, (_, i) => {
      const day = addDays(today, i);
      const weekday = isoWeekday(day);
      const open =
        people.some((p) => p.hours.some((h) => h.weekday === weekday)) &&
        (locationDays.size === 0 || locationDays.has(weekday));
      return { day, open };
    });
  }, [business.policy.horizon_days, location, staffId, staffOptions, tz]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  const loadSlots = (day: string) => {
    setDate(day);
    setSlot(null);
    setSlotError(null);
    startLoadingSlots(async () => {
      const response = await getAvailability({
        slug: business.slug,
        serviceId,
        staffId,
        date: day,
      });
      if (response.ok) setSlots(response.slots);
      else {
        setSlots([]);
        setSlotError(response.message);
      }
    });
  };

  // Opens the time step on the first day that actually has free times (looks up to two weeks ahead).
  const goToTime = () => {
    setStep("time");
    if (date) {
      loadSlots(date);
      return;
    }
    const candidates = days.filter((d) => d.open).slice(0, 14);
    if (candidates.length === 0) return;
    setSlot(null);
    setSlotError(null);
    startLoadingSlots(async () => {
      for (const candidate of candidates) {
        const response = await getAvailability({
          slug: business.slug,
          serviceId,
          staffId,
          date: candidate.day,
        });
        if (!response.ok) {
          setDate(candidate.day);
          setSlots([]);
          setSlotError(response.message);
          return;
        }
        if (response.slots.length > 0 || candidate === candidates[candidates.length - 1]) {
          setDate(candidate.day);
          setSlots(response.slots);
          return;
        }
      }
    });
  };

  const steps: { key: Step; label: string }[] = [
    { key: "service", label: f.steps.service },
    ...(business.policy.allow_staff_choice ? [{ key: "staff" as Step, label: f.steps.staff }] : []),
    { key: "time", label: f.steps.time },
    { key: "details", label: f.steps.details },
  ];
  const currentIndex = steps.findIndex((s) => s.key === step);
  const displayPrice =
    chosenStaff?.priceCents ?? (service ? (service.promo_price_cents ?? service.price_cents) : 0);
  const displayDuration = chosenStaff?.durationMinutes ?? service?.duration_minutes ?? 0;

  const onSubmit = (formData: FormData) => {
    if (!slot || !service) return;
    startSubmitting(async () => {
      const response = await submitBooking({
        slug: business.slug,
        serviceId: service.id,
        staffId,
        date,
        startsAt: slot.startsAt,
        firstName: String(formData.get("firstName") ?? ""),
        lastName: String(formData.get("lastName") ?? ""),
        email: String(formData.get("email") ?? ""),
        phone: String(formData.get("phone") ?? ""),
        note: String(formData.get("note") ?? ""),
        marketingOptIn: formData.get("marketingOptIn") === "on",
        acceptPolicy: formData.get("acceptPolicy") === "on",
      });
      setResult(response);
      if (response.ok) setStep("done");
      else if (response.slotTaken) {
        setStep("time");
        loadSlots(date);
        setSlotError(response.message);
      }
    });
  };

  if (step === "done" && result?.ok) {
    const pending = result.status === "pending";
    return (
      <Card className="p-6 sm:p-8">
        <div className="flex size-12 items-center justify-center rounded-full bg-success-50 text-success-600 ring-1 ring-success-100">
          {pending ? (
            <Clock3 className="size-6" aria-hidden="true" />
          ) : (
            <CalendarCheck2 className="size-6" aria-hidden="true" />
          )}
        </div>
        <h2
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-display-sm font-semibold outline-none"
        >
          {pending ? f.requestReceived : f.booked}
        </h2>
        <p className="mt-2 text-fg-muted">
          {pending ? f.pendingText(business.name) : f.confirmedText(business.name)}
        </p>
        <dl className="mt-6 grid gap-3 rounded-lg bg-surface-subtle p-5 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-fg-muted">{t.common.fields.service}</dt>
            <dd className="font-semibold">{service?.name}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">{f.with}</dt>
            <dd className="font-semibold">{result.staffName}</dd>
          </div>
          <div>
            <dt className="text-fg-muted">{f.when}</dt>
            <dd className="font-semibold">
              {day(date)}, {formatTime(result.startsAt, tz, intl)}–
              {formatTime(result.endsAt, tz, intl)}
            </dd>
          </div>
          <div>
            <dt className="text-fg-muted">{t.common.fields.price}</dt>
            <dd className="font-semibold">
              {money(result.priceCents)} · {f.payAtSalon}
            </dd>
          </div>
        </dl>
        {!emailConfigured && (
          <Alert tone="info" className="mt-5">
            {f.noEmail}
          </Alert>
        )}
        {result.manageUrl && (
          <div className="mt-5 rounded-lg border border-champagne-200 bg-surface-warm p-4 text-sm">
            <p className="font-semibold">{f.needCancel}</p>
            <p className="mt-1 text-fg-muted">{f.keepLink}</p>
            <a
              href={result.manageUrl}
              className="mt-2 block font-semibold break-all text-pink-700 hover:underline"
            >
              {f.manage}
            </a>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={() =>
              downloadIcs(
                `${service?.name} · ${business.name}`,
                result.startsAt,
                result.endsAt,
                address,
              )
            }
          >
            <CalendarPlus aria-hidden="true" /> {f.addToCalendar}
          </Button>
          <Button asChild variant="ghost">
            <Link href={`/${business.slug}`}>{f.backTo(business.name)}</Link>
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      <ol
        className="flex items-center gap-2 text-xs font-semibold sm:text-sm"
        aria-label={f.stepsLabel}
      >
        {steps.map((s, index) => (
          <li key={s.key} className="flex items-center gap-2">
            <span
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-xs",
                index < currentIndex
                  ? "bg-pink-700 text-white"
                  : index === currentIndex
                    ? "bg-pink-50 text-pink-700 ring-1 ring-pink-200"
                    : "bg-neutral-100 text-fg-muted",
              )}
              aria-hidden="true"
            >
              {index < currentIndex ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(index === currentIndex ? "text-fg" : "hidden text-fg-muted sm:inline")}
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {s.label}
            </span>
            {index < steps.length - 1 && (
              <span aria-hidden="true" className="h-px w-4 bg-border sm:w-8" />
            )}
          </li>
        ))}
      </ol>

      {service && step !== "service" && (
        <Card className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
          <span className="font-semibold">{service.name}</span>
          <span className="flex items-center gap-1.5 text-fg-muted">
            <Clock className="size-3.5" aria-hidden="true" />{" "}
            {formatDuration(displayDuration, intl)}
          </span>
          <span className="font-semibold tabular-nums">{money(displayPrice)}</span>
          {step !== "staff" && business.policy.allow_staff_choice && (
            <span className="flex items-center gap-1.5 text-fg-muted">
              <UserRound className="size-3.5" aria-hidden="true" />{" "}
              {chosenStaff?.display_name ?? f.anyProfessional}
            </span>
          )}
          {slot && step === "details" && (
            <span className="font-semibold">
              {day(date, { weekday: "short", day: "numeric", month: "short" })} · {slot.label}
            </span>
          )}
        </Card>
      )}

      {step === "service" && (
        <section aria-labelledby="step-heading" className="grid gap-4">
          <h2
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-display-sm font-semibold outline-none"
          >
            {f.chooseService}
          </h2>
          {business.services.length === 0 ? (
            <p className="text-fg-muted">{f.noServices}</p>
          ) : (
            <div className="grid gap-3">
              {business.services.map((s) => {
                const bookable = eligible(business, s.id).length > 0;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={!bookable}
                    onClick={() => {
                      setServiceId(s.id);
                      setStaffId("any");
                      setDate("");
                      setSlots(null);
                      setSlot(null);
                      if (business.policy.allow_staff_choice) setStep("staff");
                      else {
                        setStep("time");
                      }
                    }}
                    className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4 text-left shadow-xs transition hover:border-rosegold-300 hover:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 sm:p-5"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{s.name}</span>
                      {s.description && (
                        <span className="mt-0.5 line-clamp-2 block text-sm text-fg-muted">
                          {s.description}
                        </span>
                      )}
                      <span className="mt-1 block text-sm text-fg-muted">
                        {formatDuration(s.duration_minutes, intl)}
                        {!bookable && f.notBookable}
                      </span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">
                      {money(s.promo_price_cents ?? s.price_cents)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {step === "staff" && (
        <section aria-labelledby="step-heading" className="grid gap-4">
          <h2
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-display-sm font-semibold outline-none"
          >
            {f.whoTitle}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                id: "any",
                display_name: f.anyAvailable,
                job_title: f.mostTimes,
                priceCents: null as number | null,
              },
              ...staffOptions,
            ].map((member) => (
              <button
                key={member.id}
                type="button"
                aria-pressed={staffId === member.id}
                onClick={() => {
                  setStaffId(member.id);
                  setDate("");
                  setSlots(null);
                  setSlot(null);
                }}
                className={cn(
                  "flex items-center gap-4 rounded-xl border bg-surface p-4 text-left shadow-xs transition",
                  staffId === member.id
                    ? "border-pink-700 ring-1 ring-pink-700"
                    : "border-border hover:border-rosegold-300",
                )}
              >
                {member.id === "any" ? (
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-champagne-100 text-rosegold-800 ring-1 ring-champagne-200"
                  >
                    <Sparkles className="size-4" />
                  </span>
                ) : (
                  <Avatar name={member.display_name} />
                )}
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{member.display_name}</span>
                  {member.job_title && (
                    <span className="block text-sm text-fg-muted">{member.job_title}</span>
                  )}
                </span>
                {member.priceCents != null && (
                  <span className="text-sm font-semibold tabular-nums">
                    {money(member.priceCents)}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-between gap-3">
            <Button variant="ghost" onClick={() => setStep("service")}>
              <ArrowLeft aria-hidden="true" /> {t.common.back}
            </Button>
            <Button onClick={goToTime}>{t.common.continue}</Button>
          </div>
        </section>
      )}

      {step === "time" && (
        <section aria-labelledby="step-heading" className="grid gap-5">
          <h2
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-display-sm font-semibold outline-none"
          >
            {f.pickTime}
          </h2>
          {!date && !loadingSlots && slots === null && (
            <Button className="w-fit" onClick={goToTime}>
              {f.showTimes}
            </Button>
          )}
          <div className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            <ul className="flex gap-2" aria-label={f.dates}>
              {days.map(({ day: value, open }) => (
                <li key={value}>
                  <button
                    type="button"
                    disabled={!open}
                    aria-pressed={date === value}
                    aria-label={`${day(value)}${open ? "" : f.closed}`}
                    onClick={() => loadSlots(value)}
                    className={cn(
                      "flex w-16 flex-col items-center rounded-lg border py-2.5 text-center transition disabled:cursor-not-allowed disabled:border-transparent disabled:bg-surface-subtle disabled:text-fg-disabled",
                      date === value
                        ? "border-pink-700 bg-pink-700 text-white"
                        : "border-border bg-surface hover:border-rosegold-300",
                    )}
                  >
                    <span className="text-xs font-semibold uppercase">
                      {day(value, { weekday: "short" })}
                    </span>
                    <span className="text-lg font-semibold tabular-nums">
                      {Number(value.slice(8))}
                    </span>
                    <span className="text-xs">{day(value, { month: "short" })}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div aria-live="polite" aria-busy={loadingSlots}>
            {slotError && (
              <Alert tone="warning" className="mb-4">
                {slotError}
              </Alert>
            )}
            {loadingSlots ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {Array.from({ length: 10 }, (_, i) => (
                  <Skeleton key={i} className="h-11" />
                ))}
                <span className="sr-only">{f.loadingTimes}</span>
              </div>
            ) : slots && date ? (
              slots.length === 0 ? (
                <p className="rounded-lg bg-surface-subtle p-5 text-sm text-fg-muted">
                  {f.noTimes(day(date))}
                </p>
              ) : (
                <div className="grid gap-5">
                  <p className="text-sm font-semibold">{f.timesOn(day(date))}</p>
                  {[
                    [f.morning, (m: number) => m < 12],
                    [f.afternoon, (m: number) => m >= 12 && m < 17],
                    [f.evening, (m: number) => m >= 17],
                  ].map(([label, test]) => {
                    const group = slots.filter((s) =>
                      (test as (h: number) => boolean)(Number(s.label.slice(0, 2))),
                    );
                    if (group.length === 0) return null;
                    return (
                      <div key={label as string}>
                        <h3 className="mb-2 text-sm font-semibold text-fg-muted">
                          {label as string}
                        </h3>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                          {group.map((s) => (
                            <button
                              key={s.startsAt}
                              type="button"
                              aria-pressed={slot?.startsAt === s.startsAt}
                              onClick={() => {
                                setSlot(s);
                                setSlotError(null);
                                setStep("details");
                              }}
                              className={cn(
                                "h-11 rounded-lg border text-sm font-semibold tabular-nums transition",
                                slot?.startsAt === s.startsAt
                                  ? "border-pink-700 bg-pink-700 text-white"
                                  : "border-border bg-surface hover:border-pink-700",
                              )}
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : null}
          </div>
          <div>
            <Button
              variant="ghost"
              onClick={() => setStep(business.policy.allow_staff_choice ? "staff" : "service")}
            >
              <ArrowLeft aria-hidden="true" /> {t.common.back}
            </Button>
          </div>
        </section>
      )}

      {step === "details" && slot && (
        <section aria-labelledby="step-heading" className="grid gap-5">
          <h2
            id="step-heading"
            ref={headingRef}
            tabIndex={-1}
            className="font-display text-display-sm font-semibold outline-none"
          >
            {f.yourDetails}
          </h2>
          <form action={onSubmit} className="grid gap-5" noValidate>
            {result && !result.ok && !result.slotTaken && (
              <Alert tone="danger">{result.message}</Alert>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label={t.common.fields.firstName}
                error={!result?.ok ? result?.fieldErrors?.firstName?.[0] : undefined}
                required
              >
                <Input name="firstName" autoComplete="given-name" />
              </Field>
              <Field
                label={t.common.fields.lastName}
                error={!result?.ok ? result?.fieldErrors?.lastName?.[0] : undefined}
                required
              >
                <Input name="lastName" autoComplete="family-name" />
              </Field>
              <Field
                label={t.common.fields.email}
                error={!result?.ok ? result?.fieldErrors?.email?.[0] : undefined}
                required
              >
                <Input name="email" type="email" autoComplete="email" inputMode="email" />
              </Field>
              <Field
                label={t.common.fields.phone}
                error={!result?.ok ? result?.fieldErrors?.phone?.[0] : undefined}
                required
              >
                <Input name="phone" type="tel" autoComplete="tel" inputMode="tel" />
              </Field>
            </div>
            <Field label={f.notePrompt} optional>
              <Textarea name="note" rows={2} placeholder={f.notePlaceholder} />
            </Field>
            <div className="grid gap-3">
              <ChoiceRow
                htmlFor="acceptPolicy"
                control={<Checkbox id="acceptPolicy" name="acceptPolicy" value="on" />}
                label={f.agree}
                description={
                  business.policy.cancellation_notice_hours > 0
                    ? f.termsWithNotice(business.policy.cancellation_notice_hours, business.name)
                    : f.terms(business.name)
                }
              />
              {!result?.ok && result?.fieldErrors?.acceptPolicy?.[0] && (
                <FieldError>{result.fieldErrors.acceptPolicy[0]}</FieldError>
              )}
              <ChoiceRow
                htmlFor="marketingOptIn"
                control={<Checkbox id="marketingOptIn" name="marketingOptIn" value="on" />}
                label={f.marketing(business.name)}
                description={f.marketingHint}
              />
            </div>
            <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row">
              <Button type="button" variant="ghost" onClick={() => setStep("time")}>
                <ArrowLeft aria-hidden="true" /> {t.common.back}
              </Button>
              <Button type="submit" size="lg" loading={submitting}>
                {business.policy.requires_approval ? f.request : f.confirm}
              </Button>
            </div>
            <p className="text-sm text-fg-muted">{f.noPayment}</p>
          </form>
        </section>
      )}
    </div>
  );
}
