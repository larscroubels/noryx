"use client";

import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";

import { rescheduleAppointment, saveInternalNote } from "../actions";

export function RescheduleForm({
  appointmentId,
  staff,
  defaults,
}: {
  appointmentId: string;
  staff: { id: string; display_name: string }[];
  defaults: { staffId: string; date: string; time: string };
}) {
  const [state, action] = useActionState(rescheduleAppointment, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t.common.fields.date} error={fieldError(state, "date")}>
          <Input name="date" type="date" defaultValue={defaults.date} />
        </Field>
        <Field label={t.appointments.new.startTime} error={fieldError(state, "time")}>
          <Input name="time" type="time" step={300} defaultValue={defaults.time} />
        </Field>
        <Field label={t.common.fields.professional} error={fieldError(state, "staffId")}>
          <Select name="staffId" defaultValue={defaults.staffId}>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {member.display_name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.appointments.detail.moveSubmit}</SubmitButton>
      </div>
    </form>
  );
}

export function InternalNoteForm({
  appointmentId,
  note,
}: {
  appointmentId: string;
  note: string | null;
}) {
  const [state, action] = useActionState(saveInternalNote, IDLE);
  const t = useT();
  return (
    <form action={action} className="grid gap-3" noValidate>
      <input type="hidden" name="appointmentId" value={appointmentId} />
      <FormAlert state={state} />
      <Field
        label={t.appointments.detail.internalNote}
        hint={t.appointments.new.internalHint}
        hideLabel
      >
        <Textarea
          name="internalNote"
          defaultValue={note ?? ""}
          rows={3}
          placeholder={t.appointments.detail.notePlaceholder}
        />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="secondary" size="sm">
          {t.appointments.detail.saveNote}
        </SubmitButton>
      </div>
    </form>
  );
}
