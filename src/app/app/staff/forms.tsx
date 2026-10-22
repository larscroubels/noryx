"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { WeeklyHoursEditor } from "@/components/forms/weekly-hours-editor";
import { Button } from "@/components/ui/button";
import { Checkbox, ChoiceRow, Switch } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useIntlLocale, useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { centsToInput, formatDuration, formatMoney } from "@/lib/format";
import type { HoursRange } from "@/lib/validation/hours";
import { TIME_OFF_KINDS } from "@/lib/validation/staff";

import { addTimeOff, saveStaffHours, saveStaffProfile, saveStaffServices } from "./actions";

type StaffValues = {
  id: string;
  display_name: string;
  job_title: string | null;
  bio: string | null;
  email: string | null;
  phone: string | null;
  location_id: string | null;
  is_bookable: boolean;
  is_active: boolean;
};

export function StaffProfileForm({
  staff,
  locations,
}: {
  staff?: StaffValues;
  locations: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(saveStaffProfile, IDLE);
  const t = useT();
  const s = t.staff;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {staff && <input type="hidden" name="id" value={staff.id} />}
      <FormAlert state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={s.form.displayName} error={fieldError(state, "displayName")} required>
          <Input name="displayName" defaultValue={staff?.display_name} autoFocus={!staff} />
        </Field>
        <Field label={t.common.fields.jobTitle} error={fieldError(state, "jobTitle")} optional>
          <Input
            name="jobTitle"
            defaultValue={staff?.job_title ?? ""}
            placeholder={s.form.jobTitlePlaceholder}
          />
        </Field>
      </div>
      <Field label={s.form.bio} hint={s.form.bioHint} error={fieldError(state, "bio")} optional>
        <Textarea name="bio" defaultValue={staff?.bio ?? ""} rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={t.common.fields.email}
          hint={s.form.privateHint}
          error={fieldError(state, "email")}
          optional
        >
          <Input name="email" type="email" defaultValue={staff?.email ?? ""} />
        </Field>
        <Field
          label={t.common.fields.phone}
          hint={s.form.privateHint}
          error={fieldError(state, "phone")}
          optional
        >
          <Input name="phone" type="tel" defaultValue={staff?.phone ?? ""} />
        </Field>
      </div>
      <Field label={t.common.fields.location} error={fieldError(state, "locationId")}>
        <Select name="locationId" defaultValue={staff?.location_id ?? locations[0]?.id ?? ""}>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </Select>
      </Field>
      <div className="grid gap-4 rounded-lg bg-surface-subtle p-4">
        <ChoiceRow
          htmlFor="isBookable"
          control={
            <Switch
              id="isBookable"
              name="isBookable"
              value="on"
              defaultChecked={staff?.is_bookable ?? true}
            />
          }
          label={s.form.bookable}
          description={s.form.bookableHint}
        />
        <ChoiceRow
          htmlFor="isActive"
          control={
            <Switch
              id="isActive"
              name="isActive"
              value="on"
              defaultChecked={staff?.is_active ?? true}
            />
          }
          label={t.common.active}
          description={s.form.activeHint}
        />
      </div>
      <div className="flex justify-end gap-3">
        {!staff && (
          <Button asChild variant="ghost">
            <Link href="/app/staff">{t.common.cancel}</Link>
          </Button>
        )}
        <SubmitButton>{staff ? s.form.saveProfile : s.add}</SubmitButton>
      </div>
    </form>
  );
}

export function StaffHoursForm({ staffId, hours }: { staffId: string; hours: HoursRange[] }) {
  const [state, action] = useActionState(saveStaffHours, IDLE);
  const t = useT();
  const s = t.staff;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="staffId" value={staffId} />
      <FormAlert state={state} />
      <WeeklyHoursEditor
        initial={hours}
        allowBreaks
        errors={state.status === "error" ? state.fieldErrors : undefined}
      />
      <div className="flex justify-end">
        <SubmitButton>{s.hours.submit}</SubmitButton>
      </div>
    </form>
  );
}

type ServiceOption = { id: string; name: string; duration_minutes: number; price_cents: number };
type Assignment = {
  service_id: string;
  price_cents: number | null;
  duration_minutes: number | null;
};

export function StaffServicesForm({
  staffId,
  services,
  assignments,
  currency,
  locale,
}: {
  staffId: string;
  services: ServiceOption[];
  assignments: Assignment[];
  currency: string;
  locale: string;
}) {
  const [state, action] = useActionState(saveStaffServices, IDLE);
  const t = useT();
  const intl = useIntlLocale();
  const s = t.staff;
  const byService = new Map(assignments.map((a) => [a.service_id, a]));
  const [checked, setChecked] = useState(() => new Set(assignments.map((a) => a.service_id)));

  if (services.length === 0) {
    return (
      <p className="text-sm text-fg-muted">
        {s.servicesForm.none}{" "}
        <Link href="/app/services/new" className="font-semibold text-pink-700 hover:underline">
          {s.servicesForm.create}
        </Link>{" "}
        {s.servicesForm.first}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="staffId" value={staffId} />
      <FormAlert state={state} />
      <p className="text-sm text-fg-muted">{s.servicesForm.defaultsHint}</p>
      <ul className="divide-y divide-border rounded-lg border border-border">
        {services.map((service) => {
          const assignment = byService.get(service.id);
          const isChecked = checked.has(service.id);
          return (
            <li
              key={service.id}
              className="grid gap-3 p-4 sm:grid-cols-[1fr_9rem_8rem] sm:items-end"
            >
              <ChoiceRow
                htmlFor={`service-${service.id}`}
                control={
                  <Checkbox
                    id={`service-${service.id}`}
                    name="serviceIds"
                    value={service.id}
                    checked={isChecked}
                    onCheckedChange={(value) =>
                      setChecked((current) => {
                        const next = new Set(current);
                        if (value === true) next.add(service.id);
                        else next.delete(service.id);
                        return next;
                      })
                    }
                  />
                }
                label={service.name}
                description={`${formatDuration(service.duration_minutes, intl)} · ${formatMoney(service.price_cents, currency, locale)}`}
              />
              <Field
                label={s.servicesForm.ownPrice}
                error={fieldError(state, `price-${service.id}`)}
              >
                <Input
                  name={`price-${service.id}`}
                  defaultValue={
                    assignment?.price_cents != null ? centsToInput(assignment.price_cents) : ""
                  }
                  leading={<span className="text-sm">€</span>}
                  inputMode="decimal"
                  disabled={!isChecked}
                />
              </Field>
              <Field
                label={s.servicesForm.ownDuration}
                error={fieldError(state, `duration-${service.id}`)}
              >
                <Input
                  name={`duration-${service.id}`}
                  type="number"
                  min={5}
                  step={5}
                  defaultValue={assignment?.duration_minutes ?? ""}
                  trailing={t.common.min}
                  inputMode="numeric"
                  disabled={!isChecked}
                />
              </Field>
            </li>
          );
        })}
      </ul>
      <div className="flex justify-end">
        <SubmitButton>{s.servicesForm.submit}</SubmitButton>
      </div>
    </form>
  );
}

export function TimeOffForm({ staffId, today }: { staffId: string; today: string }) {
  const [state, action] = useActionState(addTimeOff, IDLE);
  const t = useT();
  const s = t.staff;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="staffId" value={staffId} />
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field label={s.timeOff.from} error={fieldError(state, "startDate")} required>
            <Input name="startDate" type="date" defaultValue={today} min={today} />
          </Field>
          <Field label={s.timeOff.startTime} hideLabel error={fieldError(state, "startTime")}>
            <Input
              name="startTime"
              type="time"
              defaultValue="00:00"
              aria-label={s.timeOff.startTime}
              className="mt-6.5"
            />
          </Field>
        </div>
        <div className="grid grid-cols-[1fr_7rem] gap-3">
          <Field label={s.timeOff.until} error={fieldError(state, "endDate")} required>
            <Input name="endDate" type="date" defaultValue={today} min={today} />
          </Field>
          <Field label={s.timeOff.endTime} hideLabel error={fieldError(state, "endTime")}>
            <Input
              name="endTime"
              type="time"
              defaultValue="23:59"
              aria-label={s.timeOff.endTime}
              className="mt-6.5"
            />
          </Field>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
        <Field label={s.timeOff.type}>
          <Select name="kind" defaultValue="holiday">
            {TIME_OFF_KINDS.map((kind) => (
              <option key={kind} value={kind}>
                {s.timeOff.kinds[kind]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={s.timeOff.note} optional error={fieldError(state, "note")}>
          <Input name="note" placeholder={s.timeOff.notePlaceholder} />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{s.timeOff.submit}</SubmitButton>
      </div>
    </form>
  );
}
