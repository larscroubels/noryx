"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { getT } from "@/i18n/server";
import { authorize, type Workspace } from "@/lib/auth/session";
import { parseMoneyToCents } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { timeToMinutes, zonedTimeToUtc } from "@/lib/time";
import { parseWeeklyHours } from "@/lib/validation/hours";
import { staffProfileSchema, timeOffSchema } from "@/lib/validation/staff";

/** Staff managers may edit anyone; others only their own linked profile. */
async function authorizeSchedule(staffId: string): Promise<Workspace | null> {
  const workspace = await authorize(["staff.manage", "schedule.manage_own"]);
  if (!workspace) return null;
  if (workspace.permissions.has("staff.manage")) return workspace;
  return workspace.staffId === staffId ? workspace : null;
}

function revalidateStaff(staffId: string) {
  revalidatePath("/app/staff");
  revalidatePath(`/app/staff/${staffId}`);
  revalidatePath("/app/schedule");
}

export async function saveStaffProfile(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("staff.manage"), getT()]);
  if (!workspace) return failure(t.staff.errors.manage);
  const parsed = staffProfileSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const data = parsed.data;
  const supabase = await createClient();
  const values = {
    business_id: workspace.business.id,
    display_name: data.displayName,
    job_title: data.jobTitle,
    bio: data.bio,
    email: data.email,
    phone: data.phone,
    location_id: data.locationId,
    is_bookable: data.isBookable,
    is_active: data.isActive,
  };

  const staffId = String(formData.get("id") ?? "");
  if (staffId) {
    const { error } = await supabase
      .from("staff_members")
      .update(values)
      .eq("id", staffId)
      .eq("business_id", workspace.business.id);
    if (error) return failure(databaseErrorMessage(error, t));
    revalidateStaff(staffId);
    return success(t.staff.profileSaved);
  }

  const { data: created, error } = await supabase
    .from("staff_members")
    .insert(values)
    .select("id")
    .single();
  if (error || !created)
    return failure(databaseErrorMessage(error, t));

  // New professionals start with the location's opening hours; refine them on the next screen.
  if (data.locationId) {
    const { data: hours } = await supabase
      .from("location_hours")
      .select("weekday, start_minute, end_minute")
      .eq("location_id", data.locationId);
    if (hours && hours.length > 0)
      await supabase.rpc("set_staff_working_hours", { p_staff_id: created.id, p_hours: hours });
  }
  redirect(`/app/staff/${created.id}?created=1`);
}

export async function saveStaffHours(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staffId = String(formData.get("staffId") ?? "");
  const t = await getT();
  if (!(await authorizeSchedule(staffId))) return failure(t.staff.errors.schedule);
  const parsed = parseWeeklyHours(formData, { allowBreaks: true, t });
  if (!parsed.ok) return failure(t.staff.hours.check, parsed.fieldErrors);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_staff_working_hours", {
    p_staff_id: staffId,
    p_hours: parsed.hours,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateStaff(staffId);
  return success(t.staff.hours.saved);
}

const overrideSchema = z.object({ price: z.string(), duration: z.string() });

export async function saveStaffServices(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const [workspace, t] = await Promise.all([
    authorize(["staff.manage", "services.manage"]),
    getT(),
  ]);
  if (!workspace) return failure(t.staff.errors.services);
  const staffId = String(formData.get("staffId") ?? "");
  const selected = formData.getAll("serviceIds").map(String);
  const rows: {
    business_id: string;
    staff_id: string;
    service_id: string;
    price_cents: number | null;
    duration_minutes: number | null;
  }[] = [];
  const fieldErrors: Record<string, string[]> = {};

  for (const serviceId of selected) {
    const raw = overrideSchema.parse({
      price: String(formData.get(`price-${serviceId}`) ?? ""),
      duration: String(formData.get(`duration-${serviceId}`) ?? ""),
    });
    const price = raw.price.trim() ? parseMoneyToCents(raw.price) : null;
    const duration = raw.duration.trim() ? Number(raw.duration) : null;
    if (raw.price.trim() && price === null)
      fieldErrors[`price-${serviceId}`] = [t.validation.ownPrice];
    if (duration !== null && (!Number.isInteger(duration) || duration < 5 || duration > 720))
      fieldErrors[`duration-${serviceId}`] = [t.validation.ownDuration];
    rows.push({
      business_id: workspace.business.id,
      staff_id: staffId,
      service_id: serviceId,
      price_cents: price,
      duration_minutes: duration,
    });
  }
  if (Object.keys(fieldErrors).length > 0)
    return failure(t.staff.servicesForm.check, fieldErrors);

  const supabase = await createClient();
  const { error: deleteError } = await supabase
    .from("staff_services")
    .delete()
    .eq("staff_id", staffId)
    .eq("business_id", workspace.business.id);
  if (deleteError) return failure(databaseErrorMessage(deleteError, t));
  if (rows.length > 0) {
    const { error } = await supabase.from("staff_services").insert(rows);
    if (error) return failure(databaseErrorMessage(error, t));
  }
  revalidateStaff(staffId);
  return success(t.staff.servicesForm.saved);
}

export async function addTimeOff(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const staffId = String(formData.get("staffId") ?? "");
  const [workspace, t] = await Promise.all([authorizeSchedule(staffId), getT()]);
  if (!workspace) return failure(t.staff.errors.schedule);
  const parsed = timeOffSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const tz = workspace.business.timezone;
  const supabase = await createClient();
  const { error } = await supabase.from("staff_time_off").insert({
    business_id: workspace.business.id,
    staff_id: staffId,
    starts_at: zonedTimeToUtc(
      parsed.data.startDate,
      timeToMinutes(parsed.data.startTime),
      tz,
    ).toISOString(),
    ends_at: zonedTimeToUtc(
      parsed.data.endDate,
      timeToMinutes(parsed.data.endTime),
      tz,
    ).toISOString(),
    kind: parsed.data.kind,
    note: parsed.data.note,
    created_by: workspace.user.id,
  });
  if (error) return failure(databaseErrorMessage(error, t));
  revalidateStaff(staffId);
  return success(t.staff.timeOff.added);
}

export async function deleteTimeOff(formData: FormData) {
  const staffId = String(formData.get("staffId") ?? "");
  const workspace = await authorizeSchedule(staffId);
  if (!workspace) return;
  const supabase = await createClient();
  await supabase
    .from("staff_time_off")
    .delete()
    .eq("id", String(formData.get("id") ?? ""))
    .eq("staff_id", staffId);
  revalidateStaff(staffId);
}
