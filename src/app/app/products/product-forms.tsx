"use client";

import Link from "next/link";
import { useActionState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Switch } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { IDLE } from "@/lib/actions";
import { centsToInput } from "@/lib/format";
import { STOCK_REASONS } from "@/lib/validation/product";

import { adjustStock, saveProduct } from "./actions";

type ProductValues = {
  id: string;
  name: string;
  description: string | null;
  sku: string | null;
  category: string | null;
  price_cents: number;
  cost_cents: number | null;
  low_stock_threshold: number;
  is_active: boolean;
  is_online: boolean;
};

export function ProductForm({
  product,
  canSetStock,
}: {
  product?: ProductValues;
  canSetStock: boolean;
}) {
  const [state, action] = useActionState(saveProduct, IDLE);
  const t = useT();
  const f = t.retail.products.form;
  return (
    <form action={action} className="grid gap-5" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}
      <FormAlert state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={f.name} error={fieldError(state, "name")} required>
          <Input name="name" defaultValue={product?.name} autoFocus={!product} />
        </Field>
        <Field
          label={t.common.fields.category}
          hint={f.categoryHint}
          error={fieldError(state, "category")}
          optional
        >
          <Input name="category" defaultValue={product?.category ?? ""} />
        </Field>
      </div>
      <Field label={t.common.fields.description} error={fieldError(state, "description")} optional>
        <Textarea name="description" defaultValue={product?.description ?? ""} rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={f.sellingPrice} error={fieldError(state, "price")} required>
          <Input
            name="price"
            defaultValue={product ? centsToInput(product.price_cents) : ""}
            leading={<span className="text-sm">€</span>}
            inputMode="decimal"
          />
        </Field>
        <Field
          label={f.cost}
          hint={f.costHint}
          error={fieldError(state, "cost")}
          optional
        >
          <Input
            name="cost"
            defaultValue={product?.cost_cents != null ? centsToInput(product.cost_cents) : ""}
            leading={<span className="text-sm">€</span>}
            inputMode="decimal"
          />
        </Field>
        <Field label={f.sku} error={fieldError(state, "sku")} optional>
          <Input name="sku" defaultValue={product?.sku ?? ""} />
        </Field>
        <Field label={f.lowStockAt} error={fieldError(state, "lowStockThreshold")}>
          <Input
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={product?.low_stock_threshold ?? 3}
            inputMode="numeric"
          />
        </Field>
      </div>
      {!product && canSetStock && (
        <Field
          label={f.currentStock}
          hint={f.currentStockHint}
          error={fieldError(state, "initialStock")}
        >
          <Input
            name="initialStock"
            type="number"
            min={0}
            defaultValue={0}
            className="sm:w-40"
            inputMode="numeric"
          />
        </Field>
      )}
      <div className="grid gap-4 rounded-lg bg-surface-subtle p-4">
        <ChoiceRow
          htmlFor="isActive"
          control={
            <Switch
              id="isActive"
              name="isActive"
              value="on"
              defaultChecked={product?.is_active ?? true}
            />
          }
          label={t.common.active}
          description={f.activeHint}
        />
        <ChoiceRow
          htmlFor="isOnline"
          control={
            <Switch
              id="isOnline"
              name="isOnline"
              value="on"
              defaultChecked={product?.is_online ?? false}
            />
          }
          label={f.online}
          description={f.onlineHint}
        />
      </div>
      <div className="flex justify-end gap-3">
        {!product && (
          <Button asChild variant="ghost">
            <Link href="/app/products">{t.common.cancel}</Link>
          </Button>
        )}
        <SubmitButton>{product ? f.save : f.create}</SubmitButton>
      </div>
    </form>
  );
}

export function StockForm({ productId }: { productId: string }) {
  const [state, action] = useActionState(adjustStock, IDLE);
  const t = useT();
  const f = t.retail.products.form;
  return (
    <form action={action} className="grid gap-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <FormAlert state={state} />
      <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
        <Field label={t.common.fields.reason} error={fieldError(state, "reason")}>
          <Select name="reason" defaultValue="restock">
            {STOCK_REASONS.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {t.retail.products.reasons[reason.value]}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={t.common.fields.quantity}
          hint={f.quantityHint}
          error={fieldError(state, "quantity")}
        >
          <Input name="quantity" type="number" defaultValue={1} inputMode="numeric" />
        </Field>
      </div>
      <Field label={t.staff.timeOff.note} optional error={fieldError(state, "note")}>
        <Input name="note" placeholder={f.notePlaceholder} />
      </Field>
      <div className="flex justify-end">
        <SubmitButton variant="secondary">{t.retail.products.updateStock}</SubmitButton>
      </div>
    </form>
  );
}
