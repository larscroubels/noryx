"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { SUPPORT_TOPICS } from "@/lib/validation/support";

import { submitSupportRequest } from "./actions";

export function ContactForm({ defaultName, defaultEmail }: { defaultName?: string; defaultEmail?: string }) {
  const [state, action] = useActionState(submitSupportRequest, IDLE);
  const c = useT().site.support.contact;
  if (state.status === "success") return <FormAlert state={state} />;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormAlert state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={c.name} error={fieldError(state, "name")} required>
          <Input name="name" autoComplete="name" defaultValue={defaultName} maxLength={120} />
        </Field>
        <Field label={c.email} error={fieldError(state, "email")} required>
          <Input name="email" type="email" autoComplete="email" inputMode="email" defaultValue={defaultEmail} />
        </Field>
      </div>
      <Field label={c.topic} error={fieldError(state, "topic")} required>
        <Select name="topic" defaultValue="question">
          {SUPPORT_TOPICS.map((topic) => (
            <option key={topic} value={topic}>
              {c.topics[topic]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={c.message} hint={c.messageHint} error={fieldError(state, "message")} required>
        <Textarea name="message" rows={6} maxLength={4000} />
      </Field>
      {/* Honeypot for bots; hidden from people and assistive technology. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input name="company" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <p className="text-sm text-fg-muted">{c.privacy}</p>
      <SubmitButton size="lg" className="justify-self-start">
        {c.submit}
      </SubmitButton>
    </form>
  );
}
