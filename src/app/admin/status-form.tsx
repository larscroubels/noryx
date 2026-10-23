"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { setBusinessStatus, setCustomDomain, setSubscription } from "./actions";

export function StatusForm({ businessId, status }: { businessId: string; status: string }) {
  const [state, action] = useActionState(setBusinessStatus, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-2" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      <div className="flex flex-wrap items-start gap-2">
        <Field label={t.common.fields.status} hideLabel>
          <Select name="status" defaultValue={status} className="h-8 w-32 text-sm">
            {(["active", "suspended", "closed"] as const).map((value) => (
              <option key={value} value={value}>
                {t.admin.statuses[value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.common.fields.reason} hideLabel error={fieldError(state, "reason")}>
          <Input name="reason" placeholder={t.common.fields.reason} className="h-8 w-44 text-sm" />
        </Field>
        <SubmitButton size="sm" variant="secondary">
          {t.common.apply}
        </SubmitButton>
      </div>
    </form>
  );
}

export function SubscriptionForm({
  businessId,
  planId,
  status,
  plans,
}: {
  businessId: string;
  planId: string;
  status: string;
  plans: { id: string; name: string }[];
}) {
  const [state, action] = useActionState(setSubscription, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-2" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      <div className="flex flex-wrap items-start gap-2">
        <Field label={t.admin.columns.plan} hideLabel>
          <Select name="planId" defaultValue={planId} className="h-8 w-36 text-sm">
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label={t.admin.form.subscriptionStatus} hideLabel>
          <Select name="status" defaultValue={status} className="h-8 w-32 text-sm">
            <option value="trialing">{t.admin.form.trialing}</option>
            <option value="active">{t.settings.plan.status.active}</option>
            <option value="past_due">{t.settings.plan.status.past_due}</option>
            <option value="cancelled">{t.settings.plan.status.cancelled}</option>
          </Select>
        </Field>
        <Field label={t.common.fields.reason} hideLabel error={fieldError(state, "reason")}>
          <Input name="reason" placeholder={t.common.fields.reason} className="h-8 w-36 text-sm" />
        </Field>
        <SubmitButton size="sm" variant="secondary">
          {t.common.save}
        </SubmitButton>
      </div>
    </form>
  );
}

export function DomainForm({ businessId, domain }: { businessId: string; domain: string | null }) {
  const [state, action] = useActionState(setCustomDomain, IDLE);
  const t = useT();
  const d = t.admin.domain;
  return (
    <form action={action} className="mt-3 grid gap-2" noValidate>
      <input type="hidden" name="businessId" value={businessId} />
      <FormAlert state={state} />
      <div className="flex flex-wrap items-start gap-2">
        <Field label={d.label} hideLabel hint={d.ultraOnly} error={fieldError(state, "domain")}>
          <Input
            name="domain"
            defaultValue={domain ?? ""}
            placeholder={d.placeholder}
            className="h-8 w-44 text-sm"
            autoCapitalize="none"
            spellCheck={false}
          />
        </Field>
        <Field label={t.common.fields.reason} hideLabel error={fieldError(state, "reason")}>
          <Input name="reason" placeholder={t.common.fields.reason} className="h-8 w-36 text-sm" />
        </Field>
        <SubmitButton size="sm" variant="secondary">
          {d.save}
        </SubmitButton>
      </div>
    </form>
  );
}
