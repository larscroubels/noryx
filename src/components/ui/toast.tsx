"use client";

import { useT } from "@/i18n/client";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/cn";

type ToastTone = "success" | "error" | "info";
type ToastItem = { id: number; title: string; description?: string; tone: ToastTone };

let toasts: ToastItem[] = [];
let nextId = 1;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((listener) => listener());

/** Shows a short-lived notification. Errors are announced assertively to screen readers. */
export function toast(title: string, options: { description?: string; tone?: ToastTone } = {}) {
  toasts = [
    ...toasts,
    { id: nextId++, title, description: options.description, tone: options.tone ?? "success" },
  ];
  emit();
}

function dismiss(id: number) {
  toasts = toasts.filter((item) => item.id !== id);
  emit();
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const getSnapshot = () => toasts;
const NO_TOASTS: ToastItem[] = [];
const getServerSnapshot = () => NO_TOASTS;

const icons = { success: CircleCheck, error: CircleAlert, info: Info } as const;
const iconColors = {
  success: "text-success-600",
  error: "text-danger-600",
  info: "text-info-600",
} as const;

export function Toaster() {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const t = useT();
  return (
    <ToastPrimitive.Provider swipeDirection="right" duration={5000}>
      {items.map((item) => {
        const Icon = icons[item.tone];
        return (
          <ToastPrimitive.Root
            key={item.id}
            type={item.tone === "error" ? "foreground" : "background"}
            onOpenChange={(open) => !open && dismiss(item.id)}
            className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-surface p-4 shadow-lg data-[state=closed]:animate-fade-out data-[state=open]:animate-pop-in data-[swipe=end]:animate-fade-out data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)"
          >
            <Icon
              className={cn("mt-0.5 size-5 shrink-0", iconColors[item.tone])}
              aria-hidden="true"
            />
            <div className="grid flex-1 gap-0.5">
              <ToastPrimitive.Title className="text-sm font-semibold text-fg">
                {item.title}
              </ToastPrimitive.Title>
              {item.description && (
                <ToastPrimitive.Description className="text-sm text-fg-muted">
                  {item.description}
                </ToastPrimitive.Description>
              )}
            </div>
            <ToastPrimitive.Close className="-mt-1 -mr-1 inline-flex size-8 items-center justify-center rounded-md text-fg-muted hover:bg-surface-muted hover:text-fg">
              <X className="size-4" aria-hidden="true" />
              <span className="sr-only">{t.common.dismiss}</span>
            </ToastPrimitive.Close>
          </ToastPrimitive.Root>
        );
      })}
      <ToastPrimitive.Viewport className="fixed right-0 bottom-0 z-[100] flex w-full max-w-sm flex-col gap-2 p-4 outline-none sm:right-4 sm:bottom-4 sm:p-0" />
    </ToastPrimitive.Provider>
  );
}
