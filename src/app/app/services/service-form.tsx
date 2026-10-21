"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox, ChoiceRow, Switch } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { centsToInput } from "@/lib/format";

import { saveService } from "./actions";

type ServiceValues = {
  id: string;
  name: string;
  category_id: string | null;
  description: string | null;
  duration_minutes: number;
  price_cents: number;
  promo_price_cents: number | null;
  buffer_after_minutes: number;
  is_active: boolean;
  is_online_bookable: boolean;
};

export function ServiceForm({
  service,
  categories,
  staff,
  assignedStaffIds,
}: {
  service?: ServiceValues;
  categories: { id: string; name: string }[];
  staff: { id: string; display_name: string; is_active: boolean }[];
  assignedStaffIds: string[];
}) {
  const [state, action] = useActionState(saveService, IDLE);
  const t = useT();
  const f = t.services.form;
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">(
    categories.length === 0 ? "new" : "existing",
  );
  const assigned = new Set(
    service
      ? assignedStaffIds
      : staff.filter((member) => member.is_active).map((member) => member.id),
  );

  return (
    <form action={action} noValidate>
      {service && <input type="hidden" name="id" value={service.id} />}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{f.details}</CardTitle>
<CardDescription>{f.detailsText}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5">
          <FormAlert state={state} />
          <Field label={t.common.fields.name} error={fieldError(state, "name")} required>
            <Input
              name="name"
              defaultValue={service?.name}
              placeholder={f.namePlaceholder}
              autoFocus={!service}
            />
          </Field>

          <div className="grid gap-2">
            {categoryMode === "existing" ? (
              <Field label={t.common.fields.category} error={fieldError(state, "categoryId")} optional>
                <Select name="categoryId" defaultValue={service?.category_id ?? ""}>
                  <option value="">{f.noCategory}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field
                label={f.newCategory}
                hint={f.newCategoryHint}
                error={fieldError(state, "newCategory")}
                optional
              >
                <Input name="newCategory" />
              </Field>
            )}
            {categories.length > 0 && (
              <button
                type="button"
                className="w-fit text-sm font-semibold text-pink-700 hover:underline"
                onClick={() => setCategoryMode(categoryMode === "existing" ? "new" : "existing")}
              >
                {categoryMode === "existing" ? f.createCategory : f.chooseCategory}
              </button>
            )}
          </div>

          <Field
            label={t.common.fields.description}
            hint={f.descriptionHint}
            error={fieldError(state, "description")}
            optional
          >
            <Textarea name="description" defaultValue={service?.description ?? ""} rows={3} />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Field label={t.common.fields.duration} error={fieldError(state, "durationMinutes")} required>
              <Input
                name="durationMinutes"
                type="number"
                min={5}
                max={720}
                step={5}
                defaultValue={service?.duration_minutes ?? 45}
                trailing={t.common.min}
                inputMode="numeric"
              />
            </Field>
            <Field label={t.common.fields.price} error={fieldError(state, "price")} required>
              <Input
                name="price"
                defaultValue={service ? centsToInput(service.price_cents) : ""}
                leading={<span className="text-sm">€</span>}
                inputMode="decimal"
              />
            </Field>
            <Field label={f.promo} error={fieldError(state, "promoPrice")} optional>
              <Input
                name="promoPrice"
                defaultValue={
                  service?.promo_price_cents != null ? centsToInput(service.promo_price_cents) : ""
                }
                leading={<span className="text-sm">€</span>}
                inputMode="decimal"
              />
            </Field>
            <Field
              label={f.buffer}
              hint={f.bufferHint}
              error={fieldError(state, "bufferAfterMinutes")}
            >
              <Input
                name="bufferAfterMinutes"
                type="number"
                min={0}
                max={240}
                step={5}
                defaultValue={service?.buffer_after_minutes ?? 0}
                trailing={t.common.min}
                inputMode="numeric"
              />
            </Field>
          </div>

          <div className="grid gap-4 rounded-lg bg-surface-subtle p-4">
            <ChoiceRow
              htmlFor="isActive"
              control={
                <Switch
                  id="isActive"
                  name="isActive"
                  value="on"
                  defaultChecked={service?.is_active ?? true}
                />
              }
              label={t.common.active}
              description={f.activeHint}
            />
            <ChoiceRow
              htmlFor="isOnlineBookable"
              control={
                <Switch
                  id="isOnlineBookable"
                  name="isOnlineBookable"
                  value="on"
                  defaultChecked={service?.is_online_bookable ?? true}
                />
              }
              label={f.online}
              description={f.onlineHint}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <div>
            <CardTitle>{f.who}</CardTitle>
<CardDescription>{f.whoText}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {staff.length === 0 ? (
            <p className="text-sm text-fg-muted">
              {f.noStaffYet}{" "}
              <Link
                href="/app/staff/new"
                className="font-semibold text-pink-700 hover:underline"
              >
                {f.addStaff}
              </Link>{" "}
              {f.toMakeBookable}
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {staff.map((member) => (
                <ChoiceRow
                  key={member.id}
                  htmlFor={`staff-${member.id}`}
                  control={
                    <Checkbox
                      id={`staff-${member.id}`}
                      name="staffIds"
                      value={member.id}
                      defaultChecked={assigned.has(member.id)}
                    />
                  }
                  label={member.display_name}
                  description={member.is_active ? undefined : t.common.inactive}
                />
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button asChild variant="ghost">
            <Link href="/app/services">{t.common.cancel}</Link>
          </Button>
          <SubmitButton>{service ? t.common.saveChanges : f.create}</SubmitButton>
        </CardFooter>
      </Card>
    </form>
  );
}
