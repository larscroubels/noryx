"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { INTL_LOCALE } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { getLocale, getT } from "@/i18n/server";
import { ACTIVE_BUSINESS_COOKIE, getMemberships, requireUser } from "@/lib/auth/session";
import { logger } from "@/lib/logger";
import { createClient } from "@/lib/supabase/server";
import { createBusinessSchema, locationSchema } from "@/lib/validation/business";
import { rules } from "@/lib/validation/common";
import { parseWeeklyHours } from "@/lib/validation/hours";

/** Confirms the signed-in user owns the business being onboarded. */
async function ownedBusinessId(formData: FormData) {
  await requireUser("/onboarding");
  const parsed = rules(await getT()).uuid.safeParse(formData.get("businessId"));
  if (!parsed.success) return null;
  const memberships = await getMemberships();
  return memberships.some((m) => m.business.id === parsed.data && m.role === "owner")
    ? parsed.data
    : null;
}

export async function createBusinessAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser("/onboarding");
  const t = await getT();
  const parsed = createBusinessSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_business", {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_business_type: parsed.data.businessType,
    p_timezone: parsed.data.timezone,
    // The salon starts in the language its owner set it up in; Settings can change it.
    p_locale: INTL_LOCALE[await getLocale()],
  });
  if (error || !data) {
    if (error?.code === "23505")
      return failure(t.onboarding.business.chooseAnother, {
        slug: [t.onboarding.business.slugTaken],
      });
    if (error?.code === "54000") return failure(t.onboarding.business.maxBusinesses);
    logger.error("onboarding.create_business_failed", { code: error?.code });
    return failure(databaseErrorMessage(error, t));
  }

  (await cookies()).set(ACTIVE_BUSINESS_COOKIE, data, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  });
  redirect("/onboarding?step=2");
}

const contactSchema = (t: Dictionary) =>
  locationSchema(t).extend({ email: rules(t).optionalEmail, phone: rules(t).optionalPhone });

export async function saveLocationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await ownedBusinessId(formData);
  const t = await getT();
  if (!businessId) return failure(t.errors.noAccessBusiness);
  const parsed = contactSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  const supabase = await createClient();
  const locationId = String(formData.get("locationId") ?? "");
  const [location, business] = await Promise.all([
    supabase
      .from("locations")
      .update({
        name: parsed.data.name,
        address_line1: parsed.data.addressLine1,
        postal_code: parsed.data.postalCode,
        city: parsed.data.city,
        phone: parsed.data.phone,
      })
      .eq("id", locationId)
      .eq("business_id", businessId),
    supabase
      .from("businesses")
      .update({ email: parsed.data.email, phone: parsed.data.phone })
      .eq("id", businessId),
  ]);
  if (location.error || business.error)
    return failure(databaseErrorMessage(location.error ?? business.error, t));
  redirect("/onboarding?step=3");
}

export async function saveHoursAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await ownedBusinessId(formData);
  const t = await getT();
  if (!businessId) return failure(t.errors.noAccessBusiness);
  const parsed = parseWeeklyHours(formData, { allowBreaks: false, t });
  if (!parsed.ok) return failure(t.onboarding.hours.check, parsed.fieldErrors);

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_location_hours", {
    p_location_id: String(formData.get("locationId") ?? ""),
    p_hours: parsed.hours,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  redirect("/onboarding?step=4");
}

const serviceRowSchema = (t: Dictionary) => {
  const r = rules(t);
  return z.object({
    name: r.requiredText(t.onboarding.services.name, 120),
    duration: r.int(t.common.fields.duration, 5, 720),
    price: r.money(t.common.fields.price),
  });
};

export async function saveServicesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await ownedBusinessId(formData);
  const t = await getT();
  if (!businessId) return failure(t.errors.noAccessBusiness);

  const rows: {
    name: string;
    duration_minutes: number;
    price_cents: number;
    business_id: string;
    sort_order: number;
  }[] = [];
  const fieldErrors: Record<string, string[]> = {};
  const schema = serviceRowSchema(t);
  for (let index = 0; index < 3; index += 1) {
    const raw = {
      name: String(formData.get(`service-${index}-name`) ?? ""),
      duration: String(formData.get(`service-${index}-duration`) ?? ""),
      price: String(formData.get(`service-${index}-price`) ?? ""),
    };
    if (!raw.name.trim() && !raw.price.trim()) continue;
    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues)
        (fieldErrors[`service-${index}-${String(issue.path[0])}`] ??= []).push(issue.message);
      continue;
    }
    rows.push({
      business_id: businessId,
      name: parsed.data.name,
      duration_minutes: parsed.data.duration,
      price_cents: parsed.data.price,
      sort_order: index,
    });
  }
  if (Object.keys(fieldErrors).length > 0) return failure(t.onboarding.services.check, fieldErrors);

  if (rows.length > 0) {
    const supabase = await createClient();
    const { error } = await supabase.from("services").insert(rows);
    if (error) return failure(databaseErrorMessage(error, t));
  }
  redirect("/onboarding?step=5");
}

const teamSchema = z.object({
  takesAppointments: z.enum(["yes", "no"]),
  displayName: z.string().trim().max(80).optional(),
  jobTitle: z.string().trim().max(80).optional(),
});

export async function saveTeamAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const businessId = await ownedBusinessId(formData);
  const t = await getT();
  if (!businessId) return failure(t.errors.noAccessBusiness);
  const parsed = teamSchema.safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);

  if (parsed.data.takesAppointments === "yes") {
    if (!parsed.data.displayName)
      return failure(t.onboarding.team.checkDetails, {
        displayName: [t.validation.displayName],
      });
    const user = await requireUser("/onboarding");
    const supabase = await createClient();
    const { data: location } = await supabase
      .from("locations")
      .select("id")
      .eq("business_id", businessId)
      .order("sort_order")
      .limit(1)
      .single();

    const { data: existing } = await supabase
      .from("staff_members")
      .select("id")
      .eq("business_id", businessId)
      .eq("user_id", user.id)
      .maybeSingle();
    let staffId = existing?.id;
    if (!staffId) {
      const { data: staff, error } = await supabase
        .from("staff_members")
        .insert({
          business_id: businessId,
          user_id: user.id,
          location_id: location?.id ?? null,
          display_name: parsed.data.displayName,
          job_title: parsed.data.jobTitle || null,
        })
        .select("id")
        .single();
      if (error || !staff) return failure(databaseErrorMessage(error, t));
      staffId = staff.id;
    }

    // Start with the salon's opening hours and every service; both can be refined later.
    const [{ data: hours }, { data: services }] = await Promise.all([
      supabase
        .from("location_hours")
        .select("weekday, start_minute, end_minute")
        .eq("location_id", location?.id ?? ""),
      supabase.from("services").select("id").eq("business_id", businessId),
    ]);
    if (hours && hours.length > 0)
      await supabase.rpc("set_staff_working_hours", { p_staff_id: staffId, p_hours: hours });
    if (services && services.length > 0) {
      await supabase.from("staff_services").upsert(
        services.map((service) => ({
          business_id: businessId,
          staff_id: staffId!,
          service_id: service.id,
        })),
        { ignoreDuplicates: true },
      );
    }
  }
  redirect("/onboarding?step=6");
}

export async function finishOnboardingAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const businessId = await ownedBusinessId(formData);
  const t = await getT();
  if (!businessId) return failure(t.errors.noAccessBusiness);
  const supabase = await createClient();
  const { error } = await supabase
    .from("businesses")
    .update({
      booking_enabled: formData.get("bookingEnabled") === "on",
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", businessId);
  if (error) return failure(databaseErrorMessage(error, t));
  redirect("/app?welcome=1");
}
