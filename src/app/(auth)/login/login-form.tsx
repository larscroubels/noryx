"use client";

import Link from "next/link";
import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { signIn } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, IDLE);
  const t = useT();
  return (
    <form action={action} className="mt-8 grid gap-5" noValidate>
      <input type="hidden" name="next" value={next} />
      <FormAlert state={state} />
      <Field label={t.auth.fields.email} error={fieldError(state, "email")} required>
        <Input name="email" type="email" autoComplete="email" inputMode="email" autoFocus />
      </Field>
      <Field label={t.auth.fields.password} error={fieldError(state, "password")} required>
        <Input name="password" type="password" autoComplete="current-password" />
      </Field>
      <div className="-mt-2 text-right">
        <Link href="/forgot-password" className="text-sm font-semibold text-pink-700 hover:underline">
          {t.auth.login.forgot}
        </Link>
      </div>
      <SubmitButton size="lg">{t.auth.login.submit}</SubmitButton>
    </form>
  );
}
