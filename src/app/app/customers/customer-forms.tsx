"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Checkbox, ChoiceRow } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { addCustomerNote, saveCustomer } from "./actions";

type CustomerValues = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  marketing_opt_in: boolean;
};

export function CustomerForm({
  customer,
  readOnly = false,
}: {
  customer?: CustomerValues;
  readOnly?: boolean;
}) {
  const [state, action] = useActionState(saveCustomer, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-5" noValidate>
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <FormAlert state={state} />
      <fieldset disabled={readOnly} className="grid gap-5 sm:grid-cols-2">
        <Field label={t.common.fields.firstName} error={fieldError(state, "firstName")} required>
          <Input name="firstName" defaultValue={customer?.first_name} autoFocus={!customer} />
        </Field>
        <Field label={t.common.fields.lastName} error={fieldError(state, "lastName")} optional>
          <Input name="lastName" defaultValue={customer?.last_name ?? ""} />
        </Field>
        <Field label={t.common.fields.email} error={fieldError(state, "email")} optional>
          <Input name="email" type="email" defaultValue={customer?.email ?? ""} />
        </Field>
        <Field label={t.common.fields.phone} error={fieldError(state, "phone")} optional>
          <Input name="phone" type="tel" defaultValue={customer?.phone ?? ""} />
        </Field>
        <ChoiceRow
          className="sm:col-span-2"
          htmlFor="marketingOptIn"
          control={
            <Checkbox
              id="marketingOptIn"
              name="marketingOptIn"
              value="on"
              defaultChecked={customer?.marketing_opt_in ?? false}
            />
          }
          label={t.customers.form.marketing}
          description={t.customers.form.marketingHint}
        />
      </fieldset>
      {!readOnly && (
        <div className="flex justify-end">
          <SubmitButton>{customer ? t.common.saveChanges : t.customers.add}</SubmitButton>
        </div>
      )}
    </form>
  );
}

export function NoteForm({ customerId }: { customerId: string }) {
  const [state, action] = useActionState(addCustomerNote, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="customerId" value={customerId} />
      <FormAlert state={state} />
      <Field label={t.customers.form.newNote} hideLabel error={fieldError(state, "body")}>
        <Textarea
          name="body"
          rows={3}
          placeholder={t.customers.form.notePlaceholder}
        />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="secondary" size="sm">
          {t.customers.form.addNote}
        </SubmitButton>
      </div>
    </form>
  );
}
