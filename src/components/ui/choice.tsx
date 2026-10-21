"use client";

import { Check, Minus } from "lucide-react";
import {
  Checkbox as CheckboxPrimitive,
  RadioGroup as RadioPrimitive,
  Switch as SwitchPrimitive,
} from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./field";

export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  const fieldProps = useFieldControl(props);
  return (
    <CheckboxPrimitive.Root
      {...props}
      {...fieldProps}
      className={cn(
        "peer flex size-5 shrink-0 items-center justify-center rounded-xs border border-border-control bg-surface shadow-xs transition-colors hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-danger-600 data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-fg data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-fg",
        className,
      )}
    >
      <CheckboxPrimitive.Indicator className="group">
        <Check
          className="size-3.5 group-data-[state=indeterminate]:hidden"
          strokeWidth={3}
          aria-hidden="true"
        />
        <Minus
          className="hidden size-3.5 group-data-[state=indeterminate]:block"
          strokeWidth={3}
          aria-hidden="true"
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export function Switch({ className, ...props }: ComponentProps<typeof SwitchPrimitive.Root>) {
  const fieldProps = useFieldControl(props);
  return (
    <SwitchPrimitive.Root
      {...props}
      {...fieldProps}
      className={cn(
        "inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent bg-neutral-450 p-0.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary",
        className,
      )}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-white shadow-sm transition-transform duration-150 data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}

export function RadioGroup({ className, ...props }: ComponentProps<typeof RadioPrimitive.Root>) {
  return <RadioPrimitive.Root className={cn("grid gap-3", className)} {...props} />;
}

export function RadioGroupItem({
  className,
  ...props
}: ComponentProps<typeof RadioPrimitive.Item>) {
  return (
    <RadioPrimitive.Item
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border border-border-control bg-surface shadow-xs transition-colors hover:border-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator className="size-2.5 rounded-full bg-primary" />
    </RadioPrimitive.Item>
  );
}

/** A label + description row for a checkbox, switch or radio. */
export function ChoiceRow({
  control,
  label,
  description,
  htmlFor,
  className,
}: {
  control: React.ReactNode;
  label: React.ReactNode;
  description?: React.ReactNode;
  htmlFor: string;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div className="flex h-6 items-center">{control}</div>
      <div className="grid gap-0.5">
        <label htmlFor={htmlFor} className="text-sm leading-6 font-semibold text-fg">
          {label}
        </label>
        {description && <p className="text-sm text-fg-muted">{description}</p>}
      </div>
    </div>
  );
}
