"use client";

import { useT } from "@/i18n/client";
import { Menu, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { useState, type ReactNode } from "react";

import { SidebarNav, type NavItem } from "./sidebar-nav";

/** Slide-in navigation drawer for small screens (accessible modal dialog). */
export function MobileNav({
  items,
  brand,
  footer,
}: {
  items: NavItem[];
  brand: ReactNode;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger className="inline-flex size-10 items-center justify-center rounded-md text-fg hover:bg-surface-muted lg:hidden">
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">{t.common.openNavigation}</span>
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-neutral-950/30 data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in lg:hidden" />
        <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-surface-subtle p-4 shadow-xl data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left lg:hidden">
          <DialogPrimitive.Title className="sr-only">{t.common.navigation}</DialogPrimitive.Title>
          <div className="mb-6 flex items-center justify-between">
            {brand}
            <DialogPrimitive.Close className="inline-flex size-10 items-center justify-center rounded-md hover:bg-surface-muted">
              <X className="size-5" aria-hidden="true" />
              <span className="sr-only">{t.common.closeNavigation}</span>
            </DialogPrimitive.Close>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SidebarNav items={items} onNavigate={() => setOpen(false)} />
          </div>
          {footer && <div className="mt-4 border-t border-border pt-4">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
