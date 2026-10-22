"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { signUp } from "../actions";

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, IDLE);
  const t = useT();

  if (state.status === "success") {
    return (
      <div className="mt-8 rounded-xl border border-champagne-200 bg-surface-warm p-6">
        <MailCheck className="size-6 text-rosegold-700" aria-hidden="true" />
        <h2 className="mt-4 text-lg font-semibold">{t.auth.signup.checkInbox}</h2>
        <p className="mt-2 text-sm text-fg-muted">{state.message}</p>
        <p className="mt-4 text-sm text-fg-muted">
          {t.auth.signup.noEmail}{" "}
          <Link href="/signup" className="font-semibold text-pink-700 hover:underline">
            {t.auth.signup.tryAgain}
          </Link>
          .
        </p>
      </div>
    );
  }

  const termsError = fieldError(state, "terms");
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormAlert state={state} />
      <Field label={t.auth.fields.yourName} error={fieldError(state, "fullName")} required>
        <Input name="fullName" autoComplete="name" autoFocus />
      </Field>
      <Field label={t.auth.fields.workEmail} error={fieldError(state, "email")} required>
        <Input name="email" type="email" autoComplete="email" inputMode="email" />
      </Field>
      <Field
        label={t.auth.fields.password}
        hint={t.auth.passwordHint}
        error={fieldError(state, "password")}
        required
      >
        <Input name="password" type="password" autoComplete="new-password" />
      </Field>
      <div className="grid gap-1.5">
        <ChoiceRow
          htmlFor="terms"
          control={
            <Checkbox
              id="terms"
              name="terms"
              value="on"
              aria-invalid={termsError ? true : undefined}
            />
          }
          label={t.auth.signup.terms}
          description={t.auth.signup.termsHint}
        />
        {termsError && <FieldError>{termsError}</FieldError>}
      </div>
      <SubmitButton size="lg">{t.auth.signup.submit}</SubmitButton>
    </form>
  );
}
