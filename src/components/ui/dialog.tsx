"use client";

import { useT } from "@/i18n/client";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/cn";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

type DialogContentProps = ComponentProps<typeof DialogPrimitive.Content> & {
  title: ReactNode;
  description?: ReactNode;
  /** Hide the visual close button (Escape and the overlay still close the dialog). */
  hideClose?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" } as const;

/** Modal dialog with focus trapping, Escape-to-close and labelled title/description. */
export function DialogContent({
  className,
  children,
  title,
  description,
  hideClose = false,
  size = "md",
  ...props
}: DialogContentProps) {
  const t = useT();
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-950/30 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-surface shadow-xl focus:outline-none data-[state=closed]:animate-scale-out data-[state=open]:animate-scale-in",
          sizes[size],
          className,
        )}
        {...(description ? {} : { "aria-describedby": undefined })}
        {...props}
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="grid gap-1.5">
            <DialogPrimitive.Title className="text-lg leading-7 font-semibold text-fg">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-sm text-fg-muted">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
          {!hideClose && (
            <DialogPrimitive.Close className="-mt-1 -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-md text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{t.common.close}</span>
            </DialogPrimitive.Close>
          )}
        </div>
        <div className="overflow-y-auto px-6 pt-4 pb-6">{children}</div>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}
