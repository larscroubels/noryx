"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

import { Alert } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { ActionState } from "@/lib/actions";

/** Submit button that shows a loading state while its form's server action runs. */
export function SubmitButton({ children, ...props }: Omit<ButtonProps, "type" | "loading">) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending} {...props}>
      {children}
    </Button>
  );
}

/** Shows the form-level outcome of a server action. */
export function FormAlert({
  state,
  successTitle,
}: {
  state: ActionState;
  successTitle?: ReactNode;
}) {
  if (state.status === "error") {
    return <Alert tone="danger">{state.message}</Alert>;
  }
  if (state.status === "success" && (state.message || successTitle)) {
    return (
      <Alert tone="success" title={successTitle}>
        {state.message}
      </Alert>
    );
  }
  return null;
}

/** First validation message for a field, if any. */
export function fieldError(state: ActionState, name: string) {
  return state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;
}
