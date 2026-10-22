"use server";

import { revalidatePath } from "next/cache";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { getT } from "@/i18n/server";
import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { BUSINESS_ASSETS_BUCKET, detectImageType, MAX_IMAGE_BYTES } from "@/lib/uploads";
import {
  bookingPolicySchema,
  businessProfileSchema,
  locationSchema,
} from "@/lib/validation/business";
import { giftCardSettingsSchema } from "@/lib/validation/gift-card";
import { parseWeeklyHours } from "@/lib/validation/hours";

function revalidateBusiness(slug: string) {
  revalidatePath("/app", "layout");
  revalidatePath(`/${slug}`);
}

export async function saveBusinessProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const parsed = businessProfileSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      name: d.name,
      business_type: d.businessType,
      description: d.description,
      email: d.email,
      phone: d.phone,
      website_url: d.websiteUrl,
      instagram_handle: d.instagramHandle,
      brand_color: d.brandColor,
      timezone: d.timezone,
      locale: d.locale,
    })
    .eq("id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  return success(t.settings.profile.saved);
}

export async function saveLocation(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const parsed = locationSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({
      name: parsed.data.name,
      address_line1: parsed.data.addressLine1,
      postal_code: parsed.data.postalCode,
      city: parsed.data.city,
      phone: parsed.data.phone,
    })
    .eq("id", String(formData.get("locationId") ?? ""))
    .eq("business_id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  return success(t.settings.location.saved);
}

export async function saveOpeningHours(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const parsed = parseWeeklyHours(formData, { allowBreaks: true, t });
  if (!parsed.ok) return failure(t.onboarding.hours.check, parsed.fieldErrors);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_location_hours", {
    p_location_id: String(formData.get("locationId") ?? ""),
    p_hours: parsed.hours,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  return success(t.settings.hours.saved);
}

export async function saveBookingPolicy(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const parsed = bookingPolicySchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      booking_enabled: formData.get("bookingEnabled") === "on",
      booking_allow_staff_choice: formData.get("bookingAllowStaffChoice") === "on",
      booking_requires_approval: formData.get("bookingRequiresApproval") === "on",
      booking_min_notice_minutes: parsed.data.bookingMinNoticeMinutes,
      booking_horizon_days: parsed.data.bookingHorizonDays,
      booking_slot_interval_minutes: parsed.data.bookingSlotIntervalMinutes,
      booking_buffer_minutes: parsed.data.bookingBufferMinutes,
      booking_cancellation_notice_hours: parsed.data.bookingCancellationNoticeHours,
    })
    .eq("id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  return success(t.settings.policy.saved);
}

export async function saveShopSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ shop_enabled: formData.get("shopEnabled") === "on" })
    .eq("id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  return success(t.settings.shop.saved);
}

export async function saveGiftCardSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const parsed = giftCardSettingsSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      gift_cards_enabled: d.enabled,
      gift_card_amounts: d.amounts,
      gift_card_allow_custom: d.allowCustom,
      gift_card_min_cents: d.min,
      gift_card_max_cents: d.max,
      gift_card_validity_months: d.validityMonths,
      gift_card_terms: d.terms,
    })
    .eq("id", workspace.business.id);
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateBusiness(workspace.business.slug);
  revalidatePath(`/${workspace.business.slug}/gift-card`);
  return success(t.giftCards.settings.saved);
}

const BRAND_IMAGE_COLUMNS = { logo: "logo_path", cover: "cover_path" } as const;

export async function uploadBrandImage(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("settings.manage"), getT()]);
  if (!workspace) return failure(t.settings.noPermission);
  const kind = formData.get("kind") === "cover" ? "cover" : "logo";
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return failure(t.settings.branding.chooseImage, {
      file: [t.settings.branding.chooseImageField],
    });
  if (file.size > MAX_IMAGE_BYTES)
    return failure(t.settings.branding.tooLarge, { file: [t.settings.branding.tooLargeField] });

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = detectImageType(bytes);
  if (!type)
    return failure(t.settings.branding.wrongType, {
      file: [t.settings.branding.wrongTypeField],
    });

  const supabase = await createClient();
  const path = `${workspace.business.id}/${kind}-${crypto.randomUUID()}.${type.extension}`;
  const { error: uploadError } = await supabase.storage
    .from(BUSINESS_ASSETS_BUCKET)
    .upload(path, bytes, { contentType: type.mime, cacheControl: "31536000", upsert: false });
  if (uploadError) return failure(t.settings.branding.uploadFailed);

  const column = BRAND_IMAGE_COLUMNS[kind];
  const previous = workspace.business[column];
  const update = kind === "logo" ? { logo_path: path } : { cover_path: path };
  const { error } = await supabase
    .from("businesses")
    .update(update)
    .eq("id", workspace.business.id);
  if (error) {
    await supabase.storage.from(BUSINESS_ASSETS_BUCKET).remove([path]);
    return failure(databaseErrorMessage(error, t));
  }
  if (previous) await supabase.storage.from(BUSINESS_ASSETS_BUCKET).remove([previous]);
  revalidateBusiness(workspace.business.slug);
  return success(
    kind === "logo" ? t.settings.branding.logoUpdated : t.settings.branding.coverUpdated,
  );
}

export async function removeBrandImage(formData: FormData) {
  const workspace = await authorize("settings.manage");
  if (!workspace) return;
  const kind = formData.get("kind") === "cover" ? "cover" : "logo";
  const column = BRAND_IMAGE_COLUMNS[kind];
  const previous = workspace.business[column];
  const supabase = await createClient();
  await supabase
    .from("businesses")
    .update(kind === "logo" ? { logo_path: null } : { cover_path: null })
    .eq("id", workspace.business.id);
  if (previous) await supabase.storage.from(BUSINESS_ASSETS_BUCKET).remove([previous]);
  revalidateBusiness(workspace.business.slug);
}
