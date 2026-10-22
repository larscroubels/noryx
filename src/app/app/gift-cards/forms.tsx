"use client";

import { Check, Copy, Gift } from "lucide-react";
import Link from "next/link";
import { useActionState, useState, type ReactNode } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Alert } from "@/components/ui/alert";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE, type ActionState } from "@/lib/actions";
import { centsToInput } from "@/lib/format";
import { GIFT_CARD_SALE_METHODS } from "@/lib/validation/gift-card";

import { activateGiftCard, redeemGiftCard, sellGiftCard, type GiftCardCodeState } from "./actions";

const euro = <span className="text-sm">€</span>;

/**
 * One key per form instance: a retried submit (double click, network retry) reuses it,
 * so the database acts once. The form remounts after success and gets a fresh key.
 */
function IdempotencyKey() {
  const [key] = useState(() => crypto.randomUUID());
  return <input type="hidden" name="idempotencyKey" value={key} />;
}

function MethodSelect({ state }: { state: ActionState }) {
  const t = useT();
  return (
    <Field label={t.giftCards.form.paidWith} error={fieldError(state, "method")} required>
      <Select name="method" defaultValue="card">
        {GIFT_CARD_SALE_METHODS.map((method) => (
          <option key={method} value={method}>
            {t.finance.methods[method]}
          </option>
        ))}
      </Select>
    </Field>
  );
}

/** The one moment the full code is visible. It lives only in this component's state. */
export function CodeReveal({
  code,
  number,
  giftCardId,
}: {
  code: string;
  number: number;
  giftCardId: string;
}) {
  const t = useT();
  const g = t.giftCards;
  const [copied, setCopied] = useState(false);
  return (
    <Alert
      tone="success"
      title={
        <span className="flex items-center gap-2">
          <Gift className="size-4" aria-hidden="true" /> {g.codeTitle}
        </span>
      }
    >
      <p>{g.codeText}</p>
      <p
        className="mt-3 rounded-lg border border-success-100 bg-surface px-4 py-3 text-center font-mono text-xl font-semibold tracking-widest select-all"
        aria-label={g.number(number)}
      >
        {code}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={async () => {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          }}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? t.common.copied : g.copyCode}
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/app/gift-cards/${giftCardId}`}>{g.number(number)}</Link>
        </Button>
      </div>
      <p className="mt-3 text-xs">{g.holderLink}</p>
    </Alert>
  );
}

export function SellGiftCardForm() {
  const [state, action] = useActionState<GiftCardCodeState, FormData>(sellGiftCard, IDLE);
  const t = useT();
  const g = t.giftCards.form;
  const sold = state.status === "success" && "code" in state ? state : null;

  return (
    <div className="grid gap-5">
      {sold && <CodeReveal code={sold.code} number={sold.number} giftCardId={sold.giftCardId} />}
      {/* A new sale starts from an empty form; the code stays visible until the next one. */}
      <form key={sold?.giftCardId ?? "new"} action={action} className="grid gap-4" noValidate>
        <IdempotencyKey />
        {state.status === "error" && <FormAlert state={state} />}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={g.amount} error={fieldError(state, "amount")} required>
            <Input name="amount" leading={euro} inputMode="decimal" placeholder="50" />
          </Field>
          <MethodSelect state={state} />
          <Field label={g.buyerName} error={fieldError(state, "buyerName")} required>
            <Input name="buyerName" autoComplete="off" />
          </Field>
          <Field label={g.buyerEmail} optional error={fieldError(state, "buyerEmail")}>
            <Input name="buyerEmail" type="email" autoComplete="off" />
          </Field>
          <Field label={g.recipientName} optional error={fieldError(state, "recipientName")}>
            <Input name="recipientName" autoComplete="off" />
          </Field>
        </div>
        <Field label={g.message} optional hint={g.messageHint} error={fieldError(state, "message")}>
          <Textarea name="message" rows={2} maxLength={300} />
        </Field>
        <div className="flex justify-end">
          <SubmitButton>{g.submit}</SubmitButton>
        </div>
      </form>
    </div>
  );
}

/**
 * Stays mounted after activation: the page re-renders with the card's new status,
 * while the code lives on in this component's state until the user leaves.
 */
export function ActivateGiftCardForm({
  giftCardId,
  pending,
}: {
  giftCardId: string;
  pending: boolean;
}) {
  const [state, action] = useActionState<GiftCardCodeState, FormData>(activateGiftCard, IDLE);
  const g = useT().giftCards;
  if (state.status === "success" && "code" in state)
    return <CodeReveal code={state.code} number={state.number} giftCardId={state.giftCardId} />;
  if (!pending) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{g.detail.activateTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={action} className="grid gap-4" noValidate>
          <input type="hidden" name="giftCardId" value={giftCardId} />
          <Alert tone="warning">{g.detail.activateText}</Alert>
          <FormAlert state={state} />
          <MethodSelect state={state} />
          <div className="flex justify-end">
            <SubmitButton>{g.detail.activate}</SubmitButton>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

/** Pays (part of) an appointment or order with a gift card. */
export function RedeemGiftCardForm({
  appointmentId,
  orderId,
  defaultCents,
}: {
  appointmentId?: string;
  orderId?: string;
  defaultCents: number;
}) {
  // Counts successful redemptions so the form empties after each one.
  const [state, action] = useActionState(
    async (
      previous: ActionState & { done?: number },
      formData: FormData,
    ): Promise<ActionState & { done?: number }> => {
      const result = await redeemGiftCard(previous, formData);
      return { ...result, done: (previous.done ?? 0) + (result.status === "success" ? 1 : 0) };
    },
    IDLE as ActionState & { done?: number },
  );
  const t = useT();
  const r = t.giftCards.redeem;
  return (
    <div className="grid gap-4">
      <FormAlert state={state} />
      <form key={state.done ?? 0} action={action} className="grid gap-4" noValidate>
        {appointmentId && <input type="hidden" name="appointmentId" value={appointmentId} />}
        {orderId && <input type="hidden" name="orderId" value={orderId} />}
        <IdempotencyKey />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label={r.code} error={fieldError(state, "code")} required>
            <Input
              name="code"
              placeholder={r.codePlaceholder}
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              className="font-mono uppercase"
            />
          </Field>
          <Field label={r.amount} error={fieldError(state, "amount")} required>
            <Input
              name="amount"
              defaultValue={defaultCents > 0 ? centsToInput(defaultCents) : ""}
              leading={euro}
              inputMode="decimal"
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <SubmitButton variant="secondary">{r.submit}</SubmitButton>
        </div>
      </form>
    </div>
  );
}

/** Confirmation dialog for an administrative change: reason required, errors shown inline. */
export function GiftCardActionDialog({
  trigger,
  title,
  description,
  confirmLabel,
  action,
  hiddenFields,
  withAmount = false,
  tone = "danger",
  triggerVariant = "secondary",
  triggerSize,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  hiddenFields: Record<string, string>;
  withAmount?: boolean;
  tone?: "danger" | "primary";
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await action(previous, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, IDLE);
  const t = useT();
  const d = t.giftCards.detail;
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} size={triggerSize}>
          {trigger}
        </Button>
      </DialogTrigger>
      <DialogContent title={title} description={description} size="sm">
        <form action={formAction} className="grid gap-4" noValidate>
          {Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          {withAmount && <IdempotencyKey />}
          {state.status === "error" && <FormAlert state={state} />}
          {withAmount && (
            <Field
              label={d.adjustAmount}
              hint={d.adjustAmountHint}
              error={fieldError(state, "amount")}
              required
            >
              <Input name="amount" leading={euro} inputMode="decimal" />
            </Field>
          )}
          <Field label={d.reason} hint={d.reasonHint} error={fieldError(state, "reason")} required>
            <Textarea name="reason" rows={2} maxLength={300} />
          </Field>
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
