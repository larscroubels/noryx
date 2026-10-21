"use client";

import { useActionState } from "react";

import { FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { acceptInvitation } from "./actions";

export function AcceptForm({ token }: { token: string }) {
  const [state, action] = useActionState(acceptInvitation, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4">
      <input type="hidden" name="token" value={token} />
      <FormAlert state={state} />
      <SubmitButton size="lg">{t.team.invitePage.accept}</SubmitButton>
    </form>
  );
}
