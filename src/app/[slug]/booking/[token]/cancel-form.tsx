"use client";

import { useActionState } from "react";

import { FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { deleteOwnBooking } from "./actions";

export function CancelForm({ token }: { token: string }) {
  const [state, action] = useActionState(deleteOwnBooking, IDLE);
  const t = useT();
  if (state.status === "success") return <FormAlert state={state} />;
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FormAlert state={state} />
      <SubmitButton variant="danger">{t.booking.manage.deleteSubmit}</SubmitButton>
    </form>
  );
}
