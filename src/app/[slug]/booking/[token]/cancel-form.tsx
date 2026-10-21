"use client";

import { useActionState } from "react";

import { FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { cancelOwnBooking } from "./actions";

export function CancelForm({ token, slug }: { token: string; slug: string }) {
  const [state, action] = useActionState(cancelOwnBooking, IDLE);
  const t = useT();
  if (state.status === "success") return <FormAlert state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="slug" value={slug} />
      <FormAlert state={state} />
      <Field label={t.common.fields.reason} optional hint={t.booking.manage.reasonHint}>
        <Textarea name="reason" rows={2} />
      </Field>
      <SubmitButton variant="danger">{t.booking.manage.submit}</SubmitButton>
    </form>
  );
}
