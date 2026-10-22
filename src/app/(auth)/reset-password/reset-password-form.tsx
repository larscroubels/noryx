"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { updatePassword } from "../actions";

export function ResetPasswordForm() {
  const [state, action] = useActionState(updatePassword, IDLE);
  const t = useT();
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <FormAlert state={state} />
      <Field
        label={t.auth.fields.newPassword}
        hint={t.auth.passwordHint}
        error={fieldError(state, "password")}
        required
      >
        <Input name="password" type="password" autoComplete="new-password" autoFocus />
      </Field>
      <Field
        label={t.auth.fields.confirmPassword}
        error={fieldError(state, "confirmPassword")}
        required
      >
        <Input name="confirmPassword" type="password" autoComplete="new-password" />
      </Field>
      <SubmitButton size="lg">{t.auth.reset.submit}</SubmitButton>
    </form>
  );
}
