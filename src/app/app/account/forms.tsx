"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { changeEmail, changePassword, deleteAccountAction, updateProfile } from "./actions";

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccountAction, IDLE);
  const t = useT();
  const d = t.account.delete;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormAlert state={state} />
      <Field label={d.confirm(d.confirmWord)} error={fieldError(state, "confirm")} required>
        <Input name="confirm" autoComplete="off" autoCapitalize="characters" spellCheck={false} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="danger">{d.button}</SubmitButton>
      </div>
    </form>
  );
}

export function ProfileForm({ fullName }: { fullName: string }) {
  const [state, action] = useActionState(updateProfile, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormAlert state={state} />
      <Field label={t.account.yourName} error={fieldError(state, "fullName")} required>
        <Input name="fullName" defaultValue={fullName} autoComplete="name" />
      </Field>
      <div className="flex justify-end">
        <SubmitButton>{t.common.save}</SubmitButton>
      </div>
    </form>
  );
}

export function EmailForm({ email }: { email: string }) {
  const [state, action] = useActionState(changeEmail, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormAlert state={state} />
      <Field
        label={t.team.form.email}
        hint={t.account.emailHint}
        error={fieldError(state, "email")}
        required
      >
        <Input name="email" type="email" defaultValue={email} autoComplete="email" />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.account.changeEmail}</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label={t.auth.fields.newPassword}
          hint={t.auth.passwordHint}
          error={fieldError(state, "password")}
          required
        >
          <Input name="password" type="password" autoComplete="new-password" />
        </Field>
        <Field
          label={t.auth.fields.confirmPassword}
          error={fieldError(state, "confirmPassword")}
          required
        >
          <Input name="confirmPassword" type="password" autoComplete="new-password" />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.account.changePassword}</SubmitButton>
      </div>
    </form>
  );
}
