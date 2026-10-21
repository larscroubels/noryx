"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { centsToInput } from "@/lib/format";
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from "@/lib/finance/summary";

import { addExpense, recordPayment } from "./actions";

export function PaymentForm({
  appointmentId,
  defaultCents,
}: {
  appointmentId: string;
  defaultCents: number;
}) {
  const [state, action] = useActionState(recordPayment, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.common.fields.amount} error={fieldError(state, "amount")} required>
          <Input
            name="amount"
            defaultValue={centsToInput(defaultCents)}
            leading={<span className="text-sm">€</span>}
            inputMode="decimal"
          />
        </Field>
        <Field label={t.common.fields.method} error={fieldError(state, "method")} required>
          <Select name="method" defaultValue="card">
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {t.finance.methods[method]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label={t.staff.timeOff.note} optional error={fieldError(state, "note")}>
        <Input name="note" placeholder={t.finance.form.notePlaceholder} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.finance.form.recordPayment}</SubmitButton>
      </div>
    </form>
  );
}

export function ExpenseForm({ today }: { today: string }) {
  const [state, action] = useActionState(addExpense, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <FormAlert state={state} />
      <Field label={t.common.fields.description} error={fieldError(state, "description")} required>
        <Input name="description" placeholder={t.finance.form.descriptionPlaceholder} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t.common.fields.amount} error={fieldError(state, "amount")} required>
          <Input name="amount" leading={<span className="text-sm">€</span>} inputMode="decimal" />
        </Field>
        <Field label={t.common.fields.date} error={fieldError(state, "spentOn")} required>
          <Input name="spentOn" type="date" defaultValue={today} />
        </Field>
        <Field label={t.common.fields.category} error={fieldError(state, "category")}>
          <Select name="category" defaultValue="products">
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {t.finance.categories[category]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t.finance.form.supplier} optional error={fieldError(state, "supplier")}>
          <Input name="supplier" />
        </Field>
        <Field
          label={t.common.fields.reference}
          optional
          hint={t.finance.form.referenceHint}
          error={fieldError(state, "reference")}
        >
          <Input name="reference" />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.finance.form.addExpense}</SubmitButton>
      </div>
    </form>
  );
}
