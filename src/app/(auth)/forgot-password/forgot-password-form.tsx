"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { requestPasswordReset } from "../actions";

export function ForgotPasswordForm() {
  const [state, action] = useActionState(requestPasswordReset, IDLE);
  const t = useT();
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <FormAlert state={state} successTitle={t.auth.forgot.checkInbox} />
      <Field label={t.auth.fields.email} error={fieldError(state, "email")} required>
        <Input name="email" type="email" autoComplete="email" inputMode="email" autoFocus />
      </Field>
      <SubmitButton size="lg">{t.auth.forgot.submit}</SubmitButton>
    </form>
  );
}
