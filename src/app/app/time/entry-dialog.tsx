"use client";

import { Pencil, Plus } from "lucide-react";
import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Field } from "@/components/ui/field";
import { Input, Select } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE, type ActionState } from "@/lib/actions";

import { saveTimeEntry } from "./actions";

export type EntryValues = {
  id: string;
  staffId: string;
  date: string;
  start: string;
  end: string;
  note: string;
};

/** Add or correct a registration (managers). */
export function EntryDialog({
  staff,
  entry,
  defaultDate,
}: {
  staff: { id: string; name: string }[];
  entry?: EntryValues;
  defaultDate: string;
}) {
  const t = useT();
  const c = t.timeClock;
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(async (previous: ActionState, formData: FormData) => {
    const result = await saveTimeEntry(previous, formData);
    if (result.status === "success") setOpen(false);
    return result;
  }, IDLE);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {entry ? (
          <Button variant="ghost" size="icon-sm" aria-label={c.edit}>
            <Pencil aria-hidden="true" />
          </Button>
        ) : (
          <Button variant="secondary">
            <Plus aria-hidden="true" /> {c.add}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent title={entry ? c.edit : c.add}>
        <form action={action} className="grid gap-4" noValidate>
          {entry && <input type="hidden" name="id" value={entry.id} />}
          <FormAlert state={state} />
          <Field label={t.common.fields.professional} error={fieldError(state, "staffId")} required>
            <Select name="staffId" defaultValue={entry?.staffId ?? staff[0]?.id}>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={t.common.fields.date} error={fieldError(state, "date")} required>
            <Input name="date" type="date" defaultValue={entry?.date ?? defaultDate} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={c.start} error={fieldError(state, "start")} required>
              <Input name="start" type="time" defaultValue={entry?.start ?? "09:00"} />
            </Field>
            <Field label={c.end} hint={c.endHint} error={fieldError(state, "end")} optional>
              <Input name="end" type="time" defaultValue={entry?.end ?? ""} />
            </Field>
          </div>
          <Field label={t.staff.timeOff.note} error={fieldError(state, "note")} optional>
            <Input name="note" defaultValue={entry?.note ?? ""} />
          </Field>
          <DialogFooter>
            <SubmitButton>{c.save}</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
