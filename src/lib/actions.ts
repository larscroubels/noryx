import type { PostgrestError } from "@supabase/supabase-js";
import type { z } from "zod";

import { dictionaries, type Dictionary } from "@/i18n/dictionaries";

/** Result shape returned by every server action and consumed by useActionState. */
export type ActionState =
  | { status: "idle" }
  | { status: "success"; message?: string }
  | { status: "error"; message: string; fieldErrors?: Record<string, string[] | undefined> };

export const IDLE: ActionState = { status: "idle" };

export function success(message?: string): ActionState {
  return { status: "success", message };
}

export function failure(
  message: string,
  fieldErrors?: Record<string, string[] | undefined>,
): ActionState {
  return { status: "error", message, fieldErrors };
}

export function validationFailure(error: z.ZodError, t: Dictionary = dictionaries.en): ActionState {
  const fieldErrors: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    (fieldErrors[key] ??= []).push(issue.message);
  }
  return failure(t.validation.checkFields, fieldErrors);
}

/** Translates database errors into safe, human messages (never leaks SQL details). */
export function databaseErrorMessage(
  error: Pick<PostgrestError, "code" | "message"> | null | undefined,
  t: Dictionary = dictionaries.en,
  fallback: string = t.errors.generic,
) {
  if (!error) return fallback;
  const plan: Record<string, string> = {
    plan_limit_staff: t.errors.planLimitStaff,
    plan_limit_members: t.errors.planLimitMembers,
    plan_feature_shop: t.errors.planFeatureShop,
  };
  if (plan[error.message]) return plan[error.message]!;
  switch (error.code) {
    case "23505":
      return t.errors.alreadyExists;
    case "23P01":
      return t.errors.overlap;
    case "23503":
      return t.errors.inUse;
    case "42501":
      return t.errors.noPermission;
    case "23514":
    case "22023":
      return t.errors.notAllowedValues;
    default:
      return fallback;
  }
}

/** Reads a FormData object into a plain record (repeated keys become arrays). */
export function formToObject(formData: FormData) {
  const result: Record<string, string | string[]> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || key.startsWith("$ACTION")) continue;
    const existing = result[key];
    if (existing === undefined) result[key] = value;
    else result[key] = Array.isArray(existing) ? [...existing, value] : [existing, value];
  }
  return result;
}
