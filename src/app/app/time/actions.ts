"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { getT } from "@/i18n/server";
import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { authorize } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { timeToMinutes, zonedTimeToUtc } from "@/lib/time";
import { rules } from "@/lib/validation/common";

function refresh() {
  revalidatePath("/app/time");
  revalidatePath("/app");
}

/** Clock in or out for the signed-in member's own staff profile. */
export async function toggleClock(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("schedule.manage_own"), getT()]);
  const c = t.timeClock;
  if (!workspace) return failure(c.errors.noProfile);
  const direction = formData.get("direction") === "out" ? "out" : "in";
  const supabase = await createClient();
  const { error } = await supabase.rpc(direction === "in" ? "clock_in" : "clock_out", {
    p_business_id: workspace.business.id,
  });
  if (error) {
    if (error.message === "already_clocked_in") return failure(c.errors.alreadyIn);
    if (error.message === "not_clocked_in") return failure(c.errors.notIn);
    if (error.code === "42501") return failure(c.errors.noProfile);
    return failure(databaseErrorMessage(error, t));
  }
  refresh();
  return success(direction === "in" ? c.clockedInDone : c.clockedOutDone);
}

const entrySchema = (t: Awaited<ReturnType<typeof getT>>) => {
  const r = rules(t);
  return z
    .object({
      id: z.string().trim().optional(),
      staffId: r.uuid,
      date: r.date,
      start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, t.validation.time),
      end: z
        .string()
        .trim()
        .transform((value) => value || null)
        .pipe(z.string().regex(/^([01]\d|2[0-4]):[0-5]\d$/, t.validation.time).nullable()),
      note: r.optionalText(300),
    })
    .refine((data) => data.end === null || timeToMinutes(data.end) > timeToMinutes(data.start), {
      message: t.validation.endAfterStart,
      path: ["end"],
    });
};

/** Managers add or correct a registration (times are local to the business). */
export async function saveTimeEntry(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const [workspace, t] = await Promise.all([authorize("staff.manage"), getT()]);
  const c = t.timeClock;
  if (!workspace) return failure(c.errors.noPermission);
  const parsed = entrySchema(t).safeParse(formToObject(formData));
  if (!parsed.success) return validationFailure(parsed.error, t);
  const d = parsed.data;
  const tz = workspace.business.timezone;
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_time_entry", {
    p_business_id: workspace.business.id,
    p_entry_id: d.id || undefined,
    p_staff_id: d.staffId,
    p_clock_in: zonedTimeToUtc(d.date, timeToMinutes(d.start), tz).toISOString(),
    p_clock_out: d.end ? zonedTimeToUtc(d.date, timeToMinutes(d.end), tz).toISOString() : undefined,
    p_note: d.note ?? undefined,
  });
  if (error) {
    if (error.code === "23P01") return failure(c.errors.overlap, { start: [c.errors.overlap] });
    if (error.code === "42501") return failure(c.errors.noPermission);
    return failure(databaseErrorMessage(error, t));
  }
  refresh();
  return success(c.saved);
}

export async function deleteTimeEntry(formData: FormData) {
  const workspace = await authorize("staff.manage");
  if (!workspace) return;
  const supabase = await createClient();
  await supabase.rpc("delete_time_entry", {
    p_business_id: workspace.business.id,
    p_entry_id: String(formData.get("id") ?? ""),
  });
  refresh();
}
