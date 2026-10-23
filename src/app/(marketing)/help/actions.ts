"use server";

import { headers } from "next/headers";

import { getI18n } from "@/i18n/server";
import {
  databaseErrorMessage,
  failure,
  formToObject,
  success,
  validationFailure,
  type ActionState,
} from "@/lib/actions";
import { rateLimit } from "@/lib/rate-limit";
import { createClient } from "@/lib/supabase/server";
import { supportRequestSchema } from "@/lib/validation/support";

/** Stores a question for the NORYX team (read in /admin). Nothing is emailed. */
export async function submitSupportRequest(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { t, locale } = await getI18n();
  const c = t.site.support.contact;
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  if (!rateLimit(`support:${ip}`, { limit: 5, windowMs: 15 * 60_000 }).allowed) return failure(c.rateLimited);

  const parsed = supportRequestSchema(t).safeParse(formToObject(formData));
  if (!parsed.success) {
    // A filled-in honeypot means a bot: don't tell it which field gave it away.
    if (parsed.error.issues.some((issue) => issue.path[0] === "company")) return failure(t.errors.generic);
    return validationFailure(parsed.error, t);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_support_request", {
    p_name: parsed.data.name,
    p_email: parsed.data.email,
    p_topic: parsed.data.topic,
    p_message: parsed.data.message,
    p_locale: locale,
  });
  if (error) {
    if (error.message === "support_rate_limited") return failure(c.rateLimited);
    return failure(databaseErrorMessage(error, t));
  }
  return success(c.sent(parsed.data.email));
}
