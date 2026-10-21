"use client";

import { useT } from "@/i18n/client";
import { useState, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SubmitButton } from "./form-controls";

/** Confirmation dialog for destructive or irreversible actions, submitting a server action form. */
export function ConfirmAction({
  trigger,
  title,
  description,
  confirmLabel,
  action,
  hiddenFields,
  tone = "danger",
  triggerVariant = "secondary",
  children,
}: {
  trigger: ReactNode;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  action: (formData: FormData) => void | Promise<void>;
  hiddenFields: Record<string, string>;
  tone?: "danger" | "primary";
  triggerVariant?: ButtonProps["variant"];
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const t = useT();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant}>{trigger}</Button>
      </DialogTrigger>
      <DialogContent title={title} description={description} size="sm">
        <form action={action}>
          {Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          {children}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">{t.common.keepIt}</Button>
            </DialogClose>
            <SubmitButton variant={tone === "danger" ? "danger" : "primary"}>
              {confirmLabel}
            </SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
