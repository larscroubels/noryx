"use client";

import { useT } from "@/i18n/client";
import { Label as LabelPrimitive } from "radix-ui";
import { CircleAlert } from "lucide-react";
import { createContext, useContext, useId, type ComponentProps, type ReactNode } from "react";

import { cn } from "@/lib/cn";

type FieldContextValue = {
  id: string;
  describedBy: string | undefined;
  invalid: boolean;
  required: boolean;
};

const FieldContext = createContext<FieldContextValue | null>(null);

/** Lets form controls pick up their id, description and validation state from the surrounding <Field>. */
export function useFieldControl(props: {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: ComponentProps<"input">["aria-invalid"];
  required?: boolean;
}) {
  const field = useContext(FieldContext);
  const invalid = props["aria-invalid"] ?? (field?.invalid || undefined);
  return {
    id: props.id ?? field?.id,
    "aria-describedby":
      [field?.describedBy, props["aria-describedby"]].filter(Boolean).join(" ") || undefined,
    "aria-invalid": invalid,
    required: props.required ?? (field?.required || undefined),
  };
}

export function Label({ className, ...props }: ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn("text-sm leading-5 font-semibold text-fg select-none", className)}
      {...props}
    />
  );
}

type FieldProps = {
  label: ReactNode;
  children: ReactNode;
  /** Helper text shown below the control. */
  hint?: ReactNode;
  /** Validation message; marks the control invalid when present. */
  error?: string | string[] | null;
  required?: boolean;
  /** Shows "Optional" next to the label — preferred over asterisks for optional fields. */
  optional?: boolean;
  id?: string;
  className?: string;
  /** Visually hide the label while keeping it available to screen readers. */
  hideLabel?: boolean;
};

export function Field({
  label,
  children,
  hint,
  error,
  required = false,
  optional = false,
  id,
  className,
  hideLabel = false,
}: FieldProps) {
  const generatedId = useId();
  const t = useT();
  const controlId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${controlId}-hint` : undefined;
  const errorMessage = Array.isArray(error) ? error[0] : error;
  const errorId = errorMessage ? `${controlId}-error` : undefined;

  return (
    <FieldContext.Provider
      value={{
        id: controlId,
        describedBy: [errorId, hintId].filter(Boolean).join(" ") || undefined,
        invalid: Boolean(errorMessage),
        required,
      }}
    >
      <div className={cn("flex flex-col gap-1.5", className)}>
        <div className={cn("flex items-baseline justify-between gap-3", hideLabel && "sr-only")}>
          <Label htmlFor={controlId}>
            {label}
            {required && (
              <span className="ml-0.5 text-pink-700" aria-hidden="true">
                *
              </span>
            )}
          </Label>
          {optional && <span className="text-xs text-fg-muted">{t.common.optional}</span>}
        </div>
        {children}
        {hint && !errorMessage && (
          <p id={hintId} className="text-sm text-fg-muted">
            {hint}
          </p>
        )}
        {errorMessage && <FieldError id={errorId}>{errorMessage}</FieldError>}
      </div>
    </FieldContext.Provider>
  );
}

export function FieldError({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-medium text-danger-700">
      <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </p>
  );
}
