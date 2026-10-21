"use client";

import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { WeeklyHoursEditor } from "@/components/forms/weekly-hours-editor";
import { Button } from "@/components/ui/button";
import { ChoiceRow, RadioGroup, RadioGroupItem, Switch } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { slugify } from "@/lib/slug";
import { BUSINESS_TYPES } from "@/lib/validation/business";
import type { HoursRange } from "@/lib/validation/hours";

import {
  createBusinessAction,
  finishOnboardingAction,
  saveHoursAction,
  saveLocationAction,
  saveServicesAction,
  saveTeamAction,
} from "./actions";

function StepActions({ skipHref, submitLabel }: { skipHref?: string; submitLabel?: string }) {
  const t = useT();
  return (
    <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      {skipHref && (
        <Button asChild variant="ghost">
          <a href={skipHref}>{t.onboarding.skip}</a>
        </Button>
      )}
      <SubmitButton size="lg">{submitLabel ?? t.onboarding.saveContinue}</SubmitButton>
    </div>
  );
}

export function BusinessStep({ siteHost }: { siteHost: string }) {
  const [state, action] = useActionState(createBusinessAction, IDLE);
  const t = useT();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const shownSlug = slugEdited ? slug : slugify(name);

  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormAlert state={state} />
      <Field label={t.onboarding.business.name} error={fieldError(state, "name")} required>
        <Input
          name="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="organization"
          autoFocus
        />
      </Field>
      <Field label={t.onboarding.business.type} error={fieldError(state, "businessType")} required>
        <Select name="businessType" defaultValue="">
          <option value="" disabled>
            {t.onboarding.business.chooseOne}
          </option>
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type}>
              {t.common.businessTypes[type]}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label={t.onboarding.business.address}
        hint={t.onboarding.business.addressHint}
        error={fieldError(state, "slug")}
        required
      >
        <div className="flex">
          <span className="inline-flex shrink-0 items-center rounded-l-md border border-r-0 border-border-control bg-surface-subtle px-3 text-sm text-fg-muted">
            {siteHost}/
          </span>
          <Input
            name="slug"
            value={shownSlug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value.toLowerCase());
            }}
            className="min-w-0 flex-1 rounded-l-none"
            autoCapitalize="none"
            spellCheck={false}
          />
        </div>
      </Field>
      <input type="hidden" name="timezone" value="Europe/Brussels" />
      <StepActions submitLabel={t.onboarding.business.submit} />
    </form>
  );
}

type LocationValues = {
  id: string;
  name: string;
  address_line1: string | null;
  postal_code: string | null;
  city: string | null;
  phone: string | null;
};

export function LocationStep({
  businessId,
  location,
  email,
}: {
  businessId: string;
  location: LocationValues;
  email: string | null;
}) {
  const [state, action] = useActionState(saveLocationAction, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="locationId" value={location.id} />
      <FormAlert state={state} />
      <Field
        label={t.onboarding.location.name}
        hint={t.onboarding.location.nameHint}
        error={fieldError(state, "name")}
        required
      >
        <Input name="name" defaultValue={location.name} />
      </Field>
      <Field label={t.common.fields.street} error={fieldError(state, "addressLine1")} optional>
        <Input
          name="addressLine1"
          defaultValue={location.address_line1 ?? ""}
          autoComplete="address-line1"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <Field label={t.common.fields.postalCode} error={fieldError(state, "postalCode")} optional>
          <Input
            name="postalCode"
            defaultValue={location.postal_code ?? ""}
            autoComplete="postal-code"
          />
        </Field>
        <Field label={t.common.fields.city} error={fieldError(state, "city")} optional>
          <Input name="city" defaultValue={location.city ?? ""} autoComplete="address-level2" />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.common.fields.phone} error={fieldError(state, "phone")} optional>
          <Input name="phone" type="tel" defaultValue={location.phone ?? ""} autoComplete="tel" />
        </Field>
        <Field
          label={t.onboarding.location.email}
          hint={t.onboarding.location.emailHint}
          error={fieldError(state, "email")}
          optional
        >
          <Input name="email" type="email" defaultValue={email ?? ""} autoComplete="email" />
        </Field>
      </div>
      <StepActions skipHref="/onboarding?step=3" />
    </form>
  );
}

export function HoursStep({
  businessId,
  locationId,
  hours,
}: {
  businessId: string;
  locationId: string;
  hours: HoursRange[];
}) {
  const [state, action] = useActionState(saveHoursAction, IDLE);
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="locationId" value={locationId} />
      <FormAlert state={state} />
      <WeeklyHoursEditor
        initial={hours}
        errors={state.status === "error" ? state.fieldErrors : undefined}
      />
      <StepActions skipHref="/onboarding?step=4" />
    </form>
  );
}

export function ServicesStep({
  businessId,
  hasServices,
}: {
  businessId: string;
  hasServices: boolean;
}) {
  const [state, action] = useActionState(saveServicesAction, IDLE);
  const t = useT();
  const examples = [
    { name: t.onboarding.services.examples[0], duration: 60, price: "55" },
    { name: t.onboarding.services.examples[1], duration: 30, price: "32" },
    { name: "", duration: 45, price: "" },
  ];
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      {hasServices && (
        <p className="text-sm text-fg-muted">{t.onboarding.services.already}</p>
      )}
      {examples.map((example, index) => (
        <div
          key={index}
          className="grid gap-4 rounded-lg border border-border p-4 sm:grid-cols-[1fr_8rem_8rem]"
        >
          <Field label={t.common.fields.service} error={fieldError(state, `service-${index}-name`)}>
            <Input
              name={`service-${index}-name`}
              defaultValue={hasServices ? "" : example.name}
              placeholder={t.onboarding.services.placeholder}
            />
          </Field>
          <Field label={t.common.fields.duration} error={fieldError(state, `service-${index}-duration`)}>
            <Input
              name={`service-${index}-duration`}
              type="number"
              min={5}
              step={5}
              defaultValue={example.duration}
              trailing={t.common.min}
              inputMode="numeric"
            />
          </Field>
          <Field label={t.common.fields.price} error={fieldError(state, `service-${index}-price`)}>
            <Input
              name={`service-${index}-price`}
              defaultValue={hasServices ? "" : example.price}
              leading={<span className="text-sm">€</span>}
              inputMode="decimal"
            />
          </Field>
        </div>
      ))}
      <StepActions skipHref="/onboarding?step=5" />
    </form>
  );
}

export function TeamStep({ businessId, defaultName }: { businessId: string; defaultName: string }) {
  const [state, action] = useActionState(saveTeamAction, IDLE);
  const t = useT();
  const [choice, setChoice] = useState("yes");
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      <RadioGroup
        name="takesAppointments"
        value={choice}
        onValueChange={setChoice}
        aria-label={t.onboarding.team.question}
      >
        <ChoiceRow
          htmlFor="takes-yes"
          control={<RadioGroupItem id="takes-yes" value="yes" />}
          label={t.onboarding.team.yes}
          description={t.onboarding.team.yesHint}
        />
        <ChoiceRow
          htmlFor="takes-no"
          control={<RadioGroupItem id="takes-no" value="no" />}
          label={t.onboarding.team.no}
          description={t.onboarding.team.noHint}
        />
      </RadioGroup>
      {choice === "yes" && (
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label={t.onboarding.team.displayName} error={fieldError(state, "displayName")} required>
            <Input name="displayName" defaultValue={defaultName} />
          </Field>
          <Field label={t.common.fields.jobTitle} optional>
            <Input name="jobTitle" placeholder={t.onboarding.team.jobTitlePlaceholder} />
          </Field>
        </div>
      )}
      <StepActions skipHref="/onboarding?step=6" />
    </form>
  );
}

export function PublishStep({
  businessId,
  bookingUrl,
}: {
  businessId: string;
  bookingUrl: string;
}) {
  const [state, action] = useActionState(finishOnboardingAction, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-6" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      <div className="rounded-lg border border-champagne-200 bg-surface-warm p-5">
        <ChoiceRow
          htmlFor="bookingEnabled"
          control={<Switch id="bookingEnabled" name="bookingEnabled" value="on" defaultChecked />}
          label={t.onboarding.publish.label}
          description={
            <>
              {t.onboarding.publish.before}{" "}
              <span className="font-semibold break-all text-fg">{bookingUrl}</span>
              {t.onboarding.publish.after}
            </>
          }
        />
      </div>
      <StepActions submitLabel={t.onboarding.publish.submit} />
    </form>
  );
}
