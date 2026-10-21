"use client";

import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

import { useFieldControl } from "./field";

/** Shared look for text-like controls; the border meets the 3:1 non-text contrast requirement. */
export const controlClasses =
  "w-full rounded-md border border-border-control bg-surface text-fg shadow-xs transition-[border-color,box-shadow] duration-150 placeholder:text-fg-subtle hover:border-neutral-500 focus-visible:border-rosegold-600 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring/35 disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted aria-invalid:border-danger-600 aria-invalid:focus-visible:outline-danger-600/30";

type InputProps = ComponentProps<"input"> & {
  /** Icon or text rendered inside the start of the control (decorative). */
  leading?: ReactNode;
  /** Icon or text rendered inside the end of the control (e.g. a unit such as "min"). */
  trailing?: ReactNode;
};

export function Input({ className, leading, trailing, ...props }: InputProps) {
  const fieldProps = useFieldControl(props);
  const input = (
    <input
      {...props}
      {...fieldProps}
      className={cn(
        controlClasses,
        "h-10 px-3 text-sm file:mr-3 file:border-0 file:bg-transparent file:text-sm file:font-semibold",
        leading && "pl-9",
        trailing && "pr-12",
        className,
      )}
    />
  );

  if (!leading && !trailing) return input;

  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-fg-subtle [&_svg]:size-4">
          {leading}
        </span>
      )}
      {input}
      {trailing && (
        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-fg-muted">
          {trailing}
        </span>
      )}
    </div>
  );
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  const fieldProps = useFieldControl(props);
  return (
    <textarea
      {...props}
      {...fieldProps}
      className={cn(controlClasses, "min-h-24 px-3 py-2.5 text-sm leading-6", className)}
    />
  );
}

/** Native select: best keyboard, screen reader and mobile picker support. */
export function Select({ className, children, ...props }: ComponentProps<"select">) {
  const fieldProps = useFieldControl(props);
  return (
    <div className="relative">
      <select
        {...props}
        {...fieldProps}
        className={cn(controlClasses, "h-10 appearance-none pr-10 pl-3 text-sm", className)}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-fg-muted"
        aria-hidden="true"
      />
    </div>
  );
}
