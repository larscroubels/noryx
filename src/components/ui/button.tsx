import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import type { ComponentProps } from "react";

import { cn } from "@/lib/cn";

import { Spinner } from "./spinner";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow] duration-150 select-none disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-fg shadow-xs shadow-pink-900/20 hover:bg-primary-hover active:bg-primary-active",
        secondary:
          "border border-border-strong bg-surface text-fg shadow-xs hover:border-neutral-400 hover:bg-surface-subtle active:bg-surface-muted",
        soft: "bg-primary-soft text-pink-700 hover:bg-pink-100 active:bg-pink-200",
        ghost: "text-fg hover:bg-surface-muted active:bg-neutral-200",
        link: "h-auto px-0 text-pink-700 underline-offset-4 hover:underline",
        danger: "bg-danger-600 text-white shadow-xs hover:bg-danger-700 active:bg-danger-700",
      },
      size: {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "size-10",
        "icon-sm": "size-8",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0" }],
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element (e.g. a Link) with button styling instead of a <button>. */
    asChild?: boolean;
    /** Shows a spinner, disables the button and marks it busy for assistive technology. */
    loading?: boolean;
  };

export function Button({
  className,
  variant,
  size,
  asChild = false,
  loading = false,
  disabled,
  children,
  type,
  ...props
}: ButtonProps) {
  const classes = cn(buttonVariants({ variant, size }), className);

  if (asChild) {
    return (
      <Slot.Root className={classes} {...props}>
        {children}
      </Slot.Root>
    );
  }

  return (
    <button
      type={type ?? "button"}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner className="absolute" />}
      <span className={cn("inline-flex items-center gap-2", loading && "opacity-0")}>
        {children}
      </span>
    </button>
  );
}
