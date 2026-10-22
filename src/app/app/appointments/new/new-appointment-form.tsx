"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIntlLocale, useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { formatDuration, formatMoney } from "@/lib/format";

import { createAppointment } from "../actions";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number;
  staff_ids: string[];
};

export function NewAppointmentForm({
  customers,
  services,
  staff,
  defaults,
  currency,
  locale,
}: {
  customers: { id: string; label: string }[];
  services: Service[];
  staff: { id: string; display_name: string }[];
  defaults: { date: string; time: string; staffId: string; customerId: string };
  currency: string;
  locale: string;
}) {
  const [state, action] = useActionState(createAppointment, IDLE);
  const t = useT();
  const n = t.appointments.new;
  const intl = useIntlLocale();
  const [mode, setMode] = useState<"existing" | "new">(customers.length > 0 ? "existing" : "new");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const service = services.find((s) => s.id === serviceId);
  const eligibleStaff = useMemo(
    () =>
      service && service.staff_ids.length > 0
        ? staff.filter((s) => service.staff_ids.includes(s.id))
        : staff,
    [service, staff],
  );

  return (
    <form action={action} noValidate>
      <input type="hidden" name="customerMode" value={mode} />
      <Card>
        <CardContent className="grid gap-6">
          <FormAlert state={state} />
          <fieldset className="grid gap-3">
            <legend className="mb-2 text-sm font-semibold">{n.client}</legend>
            <Tabs value={mode} onValueChange={(value) => setMode(value as "existing" | "new")}>
              <TabsList>
                <TabsTrigger value="existing" disabled={customers.length === 0}>
                  {n.existing}
                </TabsTrigger>
                <TabsTrigger value="new">{n.newClient}</TabsTrigger>
              </TabsList>
              <TabsContent value="existing" className="pt-4">
                <Field label={n.client} error={fieldError(state, "customerId")} required>
                  <Select name="customerId" defaultValue={defaults.customerId}>
                    <option value="">{n.chooseClient}</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </TabsContent>
              <TabsContent value="new" className="grid gap-4 pt-4 sm:grid-cols-2">
                <Field
                  label={t.common.fields.firstName}
                  error={fieldError(state, "firstName")}
                  required
                >
                  <Input name="firstName" autoComplete="off" />
                </Field>
                <Field
                  label={t.common.fields.lastName}
                  error={fieldError(state, "lastName")}
                  optional
                >
                  <Input name="lastName" autoComplete="off" />
                </Field>
                <Field label={t.common.fields.email} error={fieldError(state, "email")} optional>
                  <Input name="email" type="email" autoComplete="off" />
                </Field>
                <Field label={t.common.fields.phone} error={fieldError(state, "phone")} optional>
                  <Input name="phone" type="tel" autoComplete="off" />
                </Field>
              </TabsContent>
            </Tabs>
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.common.fields.service} error={fieldError(state, "serviceId")} required>
              <Select
                name="serviceId"
                value={serviceId}
                onChange={(event) => setServiceId(event.target.value)}
              >
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} · {formatDuration(s.duration_minutes, intl)} ·{" "}
                    {formatMoney(s.price_cents, currency, locale)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label={t.common.fields.professional}
              error={fieldError(state, "staffId")}
              required
            >
              <Select
                name="staffId"
                defaultValue={
                  eligibleStaff.some((s) => s.id === defaults.staffId)
                    ? defaults.staffId
                    : eligibleStaff[0]?.id
                }
                key={serviceId}
              >
                {eligibleStaff.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.display_name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.common.fields.date} error={fieldError(state, "date")} required>
              <Input name="date" type="date" defaultValue={defaults.date} />
            </Field>
            <Field label={n.startTime} error={fieldError(state, "time")} required>
              <Input name="time" type="time" step={300} defaultValue={defaults.time} />
            </Field>
          </div>
          <Field
            label={n.internalNote}
            hint={n.internalHint}
            error={fieldError(state, "internalNote")}
            optional
          >
            <Textarea name="internalNote" rows={2} />
          </Field>
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost">
            <Link href="/app/calendar">{t.common.cancel}</Link>
          </Button>
          <SubmitButton>{n.submit}</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
