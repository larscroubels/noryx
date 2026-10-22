"use client";

import { useActionState, useState } from "react";

import { fieldError, FormAlert, SubmitButton } from "@/components/forms/form-controls";
import { WeeklyHoursEditor } from "@/components/forms/weekly-hours-editor";
import { Button } from "@/components/ui/button";
import { ChoiceRow, Switch } from "@/components/ui/choice";
import { Field } from "@/components/ui/field";
import { Input, Select, Textarea } from "@/components/ui/input";
import { useT } from "@/i18n/client";
import { LOCALE_LABELS, localeFromIntl } from "@/i18n/config";
import { IDLE } from "@/lib/actions";
import { BUSINESS_LOCALES, BUSINESS_TYPES } from "@/lib/validation/business";
import type { HoursRange } from "@/lib/validation/hours";
import type { Tables } from "@/types/database";

import {
  saveBookingPolicy,
  saveBusinessProfile,
  saveLocation,
  saveOpeningHours,
  saveShopSettings,
  uploadBrandImage,
} from "./actions";

type Business = Tables<"businesses">;

const TIME_ZONES = [
  "Europe/Brussels",
  "Europe/Amsterdam",
  "Europe/Paris",
  "Europe/Luxembourg",
  "Europe/Berlin",
  "Europe/London",
  "Europe/Madrid",
  "Europe/Rome",
  "Europe/Lisbon",
  "Europe/Dublin",
];

export function BusinessProfileForm({
  business,
  branding,
}: {
  business: Business;
  /** Accent colour is part of Pro; without it the current value is kept as is. */
  branding: boolean;
}) {
  const [state, action] = useActionState(saveBusinessProfile, IDLE);
  const t = useT();
  const st = t.settings;
  const [color, setColor] = useState(business.brand_color ?? "#B83D5D");
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormAlert state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.onboarding.business.name} error={fieldError(state, "name")} required>
          <Input name="name" defaultValue={business.name} />
        </Field>
        <Field
          label={t.onboarding.business.type}
          error={fieldError(state, "businessType")}
          required
        >
          <Select name="businessType" defaultValue={business.business_type}>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.common.businessTypes[type]}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field
        label={st.profile.about}
        hint={st.profile.aboutHint}
        error={fieldError(state, "description")}
        optional
      >
        <Textarea name="description" defaultValue={business.description ?? ""} rows={3} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={st.profile.publicEmail} error={fieldError(state, "email")} optional>
          <Input name="email" type="email" defaultValue={business.email ?? ""} />
        </Field>
        <Field label={st.profile.publicPhone} error={fieldError(state, "phone")} optional>
          <Input name="phone" type="tel" defaultValue={business.phone ?? ""} />
        </Field>
        <Field label={st.profile.website} error={fieldError(state, "websiteUrl")} optional>
          <Input
            name="websiteUrl"
            type="url"
            defaultValue={business.website_url ?? ""}
            placeholder="https://"
          />
        </Field>
        <Field label={st.profile.instagram} error={fieldError(state, "instagramHandle")} optional>
          <Input
            name="instagramHandle"
            defaultValue={business.instagram_handle ?? ""}
            leading={<span className="text-sm">@</span>}
          />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={st.profile.accent}
          hint={st.profile.accentHint}
          error={fieldError(state, "brandColor")}
          optional
        >
          <div className="flex items-center gap-3">
            {!branding && (
              <input type="hidden" name="brandColor" value={business.brand_color ?? ""} />
            )}
            <input
              type="color"
              aria-label={st.profile.pickAccent}
              value={color}
              disabled={!branding}
              onChange={(event) => setColor(event.target.value.toUpperCase())}
              className="size-10 shrink-0 cursor-pointer rounded-md border border-border-control bg-surface p-1 disabled:cursor-not-allowed disabled:opacity-50"
            />
            <Input
              name={branding ? "brandColor" : undefined}
              value={color}
              disabled={!branding}
              onChange={(event) => setColor(event.target.value)}
            />
          </div>
        </Field>
        <Field label={st.profile.timeZone} error={fieldError(state, "timezone")} required>
          <Select name="timezone" defaultValue={business.timezone}>
            {(TIME_ZONES.includes(business.timezone)
              ? TIME_ZONES
              : [business.timezone, ...TIME_ZONES]
            ).map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace("_", " ")}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={st.profile.language}
          hint={st.profile.languageHint}
          error={fieldError(state, "locale")}
          required
        >
          <Select name="locale" defaultValue={business.locale}>
            {BUSINESS_LOCALES.map((value) => (
              <option key={value} value={value} lang={value.slice(0, 2)}>
                {LOCALE_LABELS[localeFromIntl(value)!].name}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton>{st.profile.submit}</SubmitButton>
      </div>
    </form>
  );
}

type Location = Pick<
  Tables<"locations">,
  "id" | "name" | "address_line1" | "postal_code" | "city" | "phone"
>;

export function LocationForm({ location }: { location: Location }) {
  const [state, action] = useActionState(saveLocation, IDLE);
  const t = useT();
  const st = t.settings;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="locationId" value={location.id} />
      <FormAlert state={state} />
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label={t.onboarding.location.name} error={fieldError(state, "name")} required>
          <Input name="name" defaultValue={location.name} />
        </Field>
        <Field label={t.common.fields.phone} error={fieldError(state, "phone")} optional>
          <Input name="phone" type="tel" defaultValue={location.phone ?? ""} />
        </Field>
      </div>
      <Field label={t.common.fields.street} error={fieldError(state, "addressLine1")} optional>
        <Input
          name="addressLine1"
          defaultValue={location.address_line1 ?? ""}
          autoComplete="address-line1"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-[10rem_1fr]">
        <Field label={t.common.fields.postalCode} error={fieldError(state, "postalCode")} optional>
          <Input name="postalCode" defaultValue={location.postal_code ?? ""} />
        </Field>
        <Field label={t.common.fields.city} error={fieldError(state, "city")} optional>
          <Input name="city" defaultValue={location.city ?? ""} />
        </Field>
      </div>
      <div className="flex justify-end">
        <SubmitButton>{st.location.submit}</SubmitButton>
      </div>
    </form>
  );
}

export function OpeningHoursForm({
  locationId,
  hours,
}: {
  locationId: string;
  hours: HoursRange[];
}) {
  const [state, action] = useActionState(saveOpeningHours, IDLE);
  const t = useT();
  const st = t.settings;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <input type="hidden" name="locationId" value={locationId} />
      <FormAlert state={state} />
      <WeeklyHoursEditor
        initial={hours}
        allowBreaks
        errors={state.status === "error" ? state.fieldErrors : undefined}
      />
      <div className="flex justify-end">
        <SubmitButton>{st.hours.submit}</SubmitButton>
      </div>
    </form>
  );
}

export function BookingPolicyForm({ business }: { business: Business }) {
  const [state, action] = useActionState(saveBookingPolicy, IDLE);
  const t = useT();
  const st = t.settings;
  return (
    <form action={action} className="grid gap-6" noValidate>
      <FormAlert state={state} />
      <div className="grid gap-4 rounded-lg border border-champagne-200 bg-surface-warm p-4">
        <ChoiceRow
          htmlFor="bookingEnabled"
          control={
            <Switch
              id="bookingEnabled"
              name="bookingEnabled"
              value="on"
              defaultChecked={business.booking_enabled}
            />
          }
          label={st.policy.live}
          description={st.policy.liveHint}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label={st.policy.minNotice}
          hint={st.policy.minNoticeHint}
          error={fieldError(state, "bookingMinNoticeMinutes")}
        >
          <Select
            name="bookingMinNoticeMinutes"
            defaultValue={String(business.booking_min_notice_minutes)}
          >
            {st.policy.noticeOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={st.policy.horizon}
          hint={st.policy.horizonHint}
          error={fieldError(state, "bookingHorizonDays")}
        >
          <Input
            name="bookingHorizonDays"
            type="number"
            min={1}
            max={365}
            defaultValue={business.booking_horizon_days}
            trailing={st.policy.days}
          />
        </Field>
        <Field label={st.policy.interval} error={fieldError(state, "bookingSlotIntervalMinutes")}>
          <Select
            name="bookingSlotIntervalMinutes"
            defaultValue={String(business.booking_slot_interval_minutes)}
          >
            {[5, 10, 15, 20, 30, 45, 60].map((value) => (
              <option key={value} value={value}>
                {st.policy.minutes(value)}
              </option>
            ))}
          </Select>
        </Field>
        <Field
          label={st.policy.buffer}
          hint={st.policy.bufferHint}
          error={fieldError(state, "bookingBufferMinutes")}
        >
          <Input
            name="bookingBufferMinutes"
            type="number"
            min={0}
            max={120}
            step={5}
            defaultValue={business.booking_buffer_minutes}
            trailing={t.common.min}
          />
        </Field>
        <Field
          label={st.policy.cancellationNotice}
          hint={st.policy.cancellationHint}
          error={fieldError(state, "bookingCancellationNoticeHours")}
        >
          <Input
            name="bookingCancellationNoticeHours"
            type="number"
            min={0}
            max={336}
            defaultValue={business.booking_cancellation_notice_hours}
            trailing={st.policy.hoursBefore}
            className="pr-28"
          />
        </Field>
      </div>
      <div className="grid gap-4 rounded-lg bg-surface-subtle p-4">
        <ChoiceRow
          htmlFor="bookingAllowStaffChoice"
          control={
            <Switch
              id="bookingAllowStaffChoice"
              name="bookingAllowStaffChoice"
              value="on"
              defaultChecked={business.booking_allow_staff_choice}
            />
          }
          label={st.policy.staffChoice}
          description={st.policy.staffChoiceHint}
        />
        <ChoiceRow
          htmlFor="bookingRequiresApproval"
          control={
            <Switch
              id="bookingRequiresApproval"
              name="bookingRequiresApproval"
              value="on"
              defaultChecked={business.booking_requires_approval}
            />
          }
          label={st.policy.approval}
          description={st.policy.approvalHint}
        />
      </div>
      <p className="text-sm text-fg-muted">{st.policy.paymentsNote}</p>
      <div className="flex justify-end">
        <SubmitButton>{st.policy.submit}</SubmitButton>
      </div>
    </form>
  );
}

export function ShopSettingsForm({
  enabled,
  productCount,
  entitled,
}: {
  enabled: boolean;
  productCount: number;
  entitled: boolean;
}) {
  const [state, action] = useActionState(saveShopSettings, IDLE);
  const t = useT();
  const st = t.settings;
  return (
    <form action={action} className="grid gap-5" noValidate>
      <FormAlert state={state} />
      <ChoiceRow
        htmlFor="shopEnabled"
        control={
          <Switch
            id="shopEnabled"
            name="shopEnabled"
            value="on"
            defaultChecked={enabled}
            disabled={!entitled}
          />
        }
        label={st.shop.live}
        description={st.shop.liveHint(productCount)}
      />
      <div className="flex justify-end">
        <SubmitButton disabled={!entitled}>{st.shop.submit}</SubmitButton>
      </div>
    </form>
  );
}

export function BrandImageForm({
  kind,
  currentUrl,
  removeAction,
  disabled = false,
}: {
  kind: "logo" | "cover";
  currentUrl: string | null;
  removeAction: (formData: FormData) => Promise<void>;
  /** Uploading is part of Pro; removing an existing image stays possible. */
  disabled?: boolean;
}) {
  const [state, action] = useActionState(uploadBrandImage, IDLE);
  const t = useT();
  const st = t.settings;
  const [preview, setPreview] = useState<string | null>(null);
  const shown = preview ?? currentUrl;
  const b = st.branding;
  return (
    <div className="grid gap-4">
      <div
        className={
          kind === "logo"
            ? "flex size-24 items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-subtle"
            : "flex aspect-[3/1] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-surface-subtle"
        }
      >
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element -- user uploads from Supabase Storage (incl. local dev hosts)
          <img
            src={shown}
            alt={kind === "logo" ? b.logoPreview : b.coverPreview}
            className={kind === "logo" ? "size-full object-contain p-2" : "size-full object-cover"}
          />
        ) : (
          <span className="text-xs text-fg-muted">{kind === "logo" ? b.noLogo : b.noCover}</span>
        )}
      </div>
      <form action={action} className="grid gap-3" noValidate>
        <input type="hidden" name="kind" value={kind} />
        <FormAlert state={state} />
        <Field
          label={kind === "logo" ? b.uploadLogo : b.uploadCover}
          hint={b.hint}
          error={fieldError(state, "file")}
        >
          <Input
            type="file"
            name="file"
            accept="image/png,image/jpeg,image/webp"
            className="h-auto py-2"
            disabled={disabled}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreview(file ? URL.createObjectURL(file) : null);
            }}
          />
        </Field>
        <div className="flex flex-wrap justify-end gap-2">
          {currentUrl && (
            <Button type="submit" variant="ghost" formAction={removeAction} formNoValidate>
              {t.common.remove}
            </Button>
          )}
          <SubmitButton variant="secondary" disabled={disabled}>
            {b.upload}
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
